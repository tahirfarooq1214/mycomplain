import { prisma, io } from '../index';
import { sendComplaintEmail } from './emailBridge';
import { sendComplaintWhatsApp } from './whatsappBridge';

/**
 * COMPLAINT ROUTING ENGINE
 *
 * Routes complaints based on service type and brand integration tier:
 *
 * BRAND_WARRANTY complaints:
 *   - Brand has email → AUTO_EMAIL (send structured email to brand)
 *   - Brand has WhatsApp → AUTO_WHATSAPP (send via WA Business API)
 *   - Brand has neither → MANUAL_CALL (queue for ops team to call)
 *
 * THIRD_PARTY complaints:
 *   - Queued for ops team to assign to a service provider manually
 */
export async function routeComplaint(complaint: any): Promise<void> {
  try {
    if (complaint.serviceType === 'THIRD_PARTY') {
      // Third-party: queue for ops team to assign a provider
      await prisma.complaint.update({
        where: { id: complaint.id },
        data: {
          status: 'IN_QUEUE',
          routingMethod: 'THIRD_PARTY_PROVIDER',
        },
      });

      await prisma.complaintTimeline.create({
        data: {
          complaintId: complaint.id,
          status: 'IN_QUEUE',
          note: 'Queued for third-party service provider assignment',
          updatedBy: 'system',
        },
      });

      // Notify ops dashboard
      io.to('ops:dashboard').emit('complaint:queued', {
        complaintId: complaint.id,
        type: 'third_party',
        message: 'New third-party service request needs provider assignment',
      });

      return;
    }

    // BRAND_WARRANTY: determine routing method based on brand config
    if (!complaint.brandId) {
      // No brand selected — queue for manual handling
      await queueForManualCall(complaint);
      return;
    }

    const brand = await prisma.brand.findUnique({
      where: { id: complaint.brandId },
    });

    if (!brand) {
      await queueForManualCall(complaint);
      return;
    }

    switch (brand.integrationTier) {
      case 'EMAIL':
        if (brand.serviceEmail) {
          await routeViaEmail(complaint, brand);
        } else {
          await queueForManualCall(complaint);
        }
        break;

      case 'WHATSAPP':
        if (brand.whatsappNumber) {
          await routeViaWhatsApp(complaint, brand);
        } else {
          await queueForManualCall(complaint);
        }
        break;

      case 'API':
        // Future: direct API integration with brand
        await routeViaEmail(complaint, brand); // fallback to email for now
        break;

      case 'MANUAL':
      default:
        await queueForManualCall(complaint);
        break;
    }

    // Increment brand complaint counter
    await prisma.brand.update({
      where: { id: brand.id },
      data: { totalComplaints: { increment: 1 } },
    });
  } catch (error) {
    console.error('Complaint routing error:', error);
    // Fallback: queue for manual handling
    await queueForManualCall(complaint);
  }
}

async function routeViaEmail(complaint: any, brand: any): Promise<void> {
  try {
    await sendComplaintEmail(complaint, brand);

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: 'RECEIVED_BY_BRAND',
        routingMethod: 'AUTO_EMAIL',
      },
    });

    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: 'RECEIVED_BY_BRAND',
        note: `Complaint sent to ${brand.name} via email (${brand.serviceEmail})`,
        updatedBy: 'system',
      },
    });

    io.to(`user:${complaint.userId}`).emit('complaint:updated', {
      complaintId: complaint.id,
      status: 'RECEIVED_BY_BRAND',
      note: `Your complaint has been sent to ${brand.name}`,
    });

    console.log(`✅ Complaint ${complaint.complaintNumber} routed via email to ${brand.name}`);
  } catch (error) {
    console.error(`Email routing failed for ${complaint.complaintNumber}, falling back to manual`);
    await queueForManualCall(complaint);
  }
}

async function routeViaWhatsApp(complaint: any, brand: any): Promise<void> {
  try {
    await sendComplaintWhatsApp(complaint, brand);

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: 'RECEIVED_BY_BRAND',
        routingMethod: 'AUTO_WHATSAPP',
      },
    });

    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: 'RECEIVED_BY_BRAND',
        note: `Complaint sent to ${brand.name} via WhatsApp`,
        updatedBy: 'system',
      },
    });

    io.to(`user:${complaint.userId}`).emit('complaint:updated', {
      complaintId: complaint.id,
      status: 'RECEIVED_BY_BRAND',
    });

    console.log(`✅ Complaint ${complaint.complaintNumber} routed via WhatsApp to ${brand.name}`);
  } catch (error) {
    console.error(`WhatsApp routing failed for ${complaint.complaintNumber}, falling back to manual`);
    await queueForManualCall(complaint);
  }
}

async function queueForManualCall(complaint: any): Promise<void> {
  await prisma.complaint.update({
    where: { id: complaint.id },
    data: {
      status: 'IN_QUEUE',
      routingMethod: 'MANUAL_CALL',
    },
  });

  await prisma.complaintTimeline.create({
    data: {
      complaintId: complaint.id,
      status: 'IN_QUEUE',
      note: 'Queued for manual processing by our team',
      updatedBy: 'system',
    },
  });

  // Alert ops dashboard
  io.to('ops:dashboard').emit('complaint:queued', {
    complaintId: complaint.id,
    type: 'manual_call',
    message: 'New complaint needs manual call to brand service center',
  });

  console.log(`📞 Complaint ${complaint.complaintNumber} queued for manual call`);
}
