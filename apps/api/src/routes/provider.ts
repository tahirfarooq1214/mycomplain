import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma, io } from '../index';

const router = Router();

// All routes require SERVICE_PROVIDER role
router.use(authenticate);

// ── GET ASSIGNED COMPLAINTS (Provider CMS view) ───────────────

router.get('/complaints', async (req: AuthRequest, res: Response) => {
  try {
    // Provider sees only complaints assigned to them
    const assignments = await prisma.complaintAssignment.findMany({
      where: { providerId: req.userId },
      include: {
        complaint: {
          include: {
            user: { select: { fullName: true, phone: true, city: true, area: true, address: true } },
            category: true,
            brand: { select: { name: true } },
            timeline: { orderBy: { createdAt: 'desc' }, take: 3 },
            media: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const complaints = assignments.map((a) => ({
      ...a.complaint,
      assignmentId: a.id,
      assignedAt: a.assignedAt,
      assignmentNotes: a.notes,
    }));

    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
});

// ── UPDATE COMPLAINT STATUS (Provider action) ─────────────────

router.put('/complaints/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status, note, diagnosisNotes, quotedAmount, resolutionNotes } = req.body;

    // Verify this complaint is assigned to this provider
    const assignment = await prisma.complaintAssignment.findFirst({
      where: {
        complaintId: req.params.id,
        providerId: req.userId,
      },
    });

    if (!assignment) {
      res.status(403).json({ success: false, error: 'This complaint is not assigned to you' });
      return;
    }

    // Only allow certain status transitions for providers
    const allowedStatuses = [
      'PROVIDER_ACKNOWLEDGED',
      'DIAGNOSIS_COMPLETE',
      'QUOTE_SENT',
      'REPAIR_IN_PROGRESS',
      'REPAIR_COMPLETE',
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status transition for provider' });
      return;
    }

    const updateData: any = { status };
    if (diagnosisNotes) updateData.diagnosisNotes = diagnosisNotes;
    if (quotedAmount) updateData.quotedAmount = quotedAmount;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (status === 'REPAIR_COMPLETE') updateData.resolvedAt = new Date();

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Timeline entry
    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status,
        note: note || `Provider updated status to ${status}`,
        updatedBy: `provider:${req.userId}`,
      },
    });

    // Notify consumer
    io.to(`user:${complaint.userId}`).emit('complaint:updated', {
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      status,
      note,
      quotedAmount,
    });

    // Notify ops dashboard
    io.to('ops:dashboard').emit('complaint:updated', { complaintId: complaint.id, status });

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

export default router;
