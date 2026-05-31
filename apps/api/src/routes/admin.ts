import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { prisma, io } from '../index';

const router = Router();

// All admin routes require OPS_AGENT, OPS_SUPERVISOR, or ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN', 'OPS_AGENT', 'OPS_SUPERVISOR'));

// ── DASHBOARD STATS ───────────────────────────────────────────

router.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  try {
    const [totalComplaints, pending, inQueue, resolved, todayCount] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'SUBMITTED' } }),
      prisma.complaint.count({ where: { status: 'IN_QUEUE' } }),
      prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'REPAIR_COMPLETE'] } } }),
      prisma.complaint.count({
        where: { createdAt: { gte: new Date(new Date().toISOString().slice(0, 10)) } },
      }),
    ]);

    res.json({
      success: true,
      data: { totalComplaints, pending, inQueue, resolved, todayCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard' });
  }
});

// ── GET ALL COMPLAINTS (with filters) ─────────────────────────

router.get('/complaints', async (req: AuthRequest, res: Response) => {
  try {
    const { status, serviceType, brandId, routingMethod, page = '1', limit = '20' } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (brandId) where.brandId = brandId;
    if (routingMethod) where.routingMethod = routingMethod;

    const pageNum = parseInt(page as string);
    const pageSize = parseInt(limit as string);

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, phone: true, city: true, address: true } },
          brand: true,
          category: true,
          timeline: { orderBy: { createdAt: 'desc' }, take: 1 },
          assignments: { include: { agent: true, provider: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({ success: true, data: complaints, total, page: pageNum, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
});

// ── GET SINGLE COMPLAINT ─────────────────────────────────────

router.get('/complaints/:id', async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, fullName: true, phone: true, email: true, city: true, area: true, address: true } },
        brand: true,
        category: true,
        appliance: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        media: true,
        assignments: { include: { agent: true, provider: true } },
      },
    });

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint not found' });
      return;
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaint' });
  }
});

// ── GET MANUAL QUEUE (complaints needing phone calls) ─────────

router.get('/queue', async (_req: AuthRequest, res: Response) => {
  try {
    const queue = await prisma.complaint.findMany({
      where: {
        serviceType: 'BRAND_WARRANTY',
        routingMethod: 'MANUAL_CALL',
        status: { in: ['SUBMITTED', 'IN_QUEUE'] },
      },
      include: {
        user: { select: { fullName: true, phone: true, city: true, address: true } },
        brand: true,
        category: true,
      },
      orderBy: { createdAt: 'asc' }, // FIFO — oldest first
    });

    res.json({ success: true, data: queue, total: queue.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch queue' });
  }
});

// ── UPDATE COMPLAINT STATUS (ops agent action) ────────────────

router.put('/complaints/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status, note, brandReferenceNumber, diagnosisNotes, quotedAmount, resolutionNotes } = req.body;
    const agentName = req.userId; // TODO: resolve to actual name

    const updateData: any = { status };
    if (brandReferenceNumber) updateData.brandReferenceNumber = brandReferenceNumber;
    if (diagnosisNotes) updateData.diagnosisNotes = diagnosisNotes;
    if (quotedAmount) updateData.quotedAmount = quotedAmount;
    if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
    if (['RESOLVED', 'REPAIR_COMPLETE'].includes(status)) updateData.resolvedAt = new Date();

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: updateData,
      include: { user: true, brand: true },
    });

    // Add timeline entry
    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status,
        note: note || `Status updated to ${status}`,
        updatedBy: `admin:${agentName}`,
      },
    });

    // Notify consumer in real-time
    io.to(`user:${complaint.userId}`).emit('complaint:updated', {
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      status,
      note,
    });

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// ── ASSIGN TO SERVICE PROVIDER (third-party) ──────────────────

router.post('/complaints/:id/assign-provider', async (req: AuthRequest, res: Response) => {
  try {
    const { providerId, notes } = req.body;

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        status: 'ASSIGNED_TO_PROVIDER',
        routingMethod: 'THIRD_PARTY_PROVIDER',
      },
    });

    // Create assignment record
    await prisma.complaintAssignment.create({
      data: {
        complaintId: complaint.id,
        providerId,
        notes,
      },
    });

    // Timeline entry
    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: 'ASSIGNED_TO_PROVIDER',
        note: 'Assigned to third-party service provider',
        updatedBy: `admin:${req.userId}`,
      },
    });

    // Notify provider via their CMS room
    io.to(`provider:${providerId}`).emit('complaint:assigned', complaint);
    // Notify consumer
    io.to(`user:${complaint.userId}`).emit('complaint:updated', {
      complaintId: complaint.id,
      status: 'ASSIGNED_TO_PROVIDER',
    });

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to assign provider' });
  }
});

// ── RECORD CALL OUTCOME (when ops agent calls brand) ──────────

router.post('/complaints/:id/call-outcome', async (req: AuthRequest, res: Response) => {
  try {
    const { outcome, brandReferenceNumber, callDurationSeconds, notes, scheduledDate, technicianInfo } = req.body;

    const updateData: any = {};

    if (outcome === 'registered') {
      updateData.status = 'REGISTERED_WITH_BRAND';
      updateData.brandReferenceNumber = brandReferenceNumber;
      updateData.routingMethod = 'MANUAL_CALL';
    } else if (outcome === 'declined') {
      // Brand declined — maybe out of warranty
      updateData.status = 'SUBMITTED'; // keep open for potential third-party
    }

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Record the assignment
    await prisma.complaintAssignment.create({
      data: {
        complaintId: complaint.id,
        agentId: req.userId, // TODO: link to OpsAgent
        outcome,
        brandReferenceNumber,
        callDurationSeconds,
        notes,
        completedAt: new Date(),
      },
    });

    // Timeline
    const timelineNote = outcome === 'registered'
      ? `Complaint registered with brand. Ref: ${brandReferenceNumber || 'N/A'}`
      : `Brand call outcome: ${outcome}. ${notes || ''}`;

    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: updateData.status || complaint.status,
        note: timelineNote,
        updatedBy: `admin:${req.userId}`,
      },
    });

    // Notify consumer
    io.to(`user:${complaint.userId}`).emit('complaint:updated', {
      complaintId: complaint.id,
      status: updateData.status,
      brandReferenceNumber,
    });

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to record call outcome' });
  }
});

// ── MANAGE SERVICE PROVIDERS ──────────────────────────────────

router.get('/providers', async (_req: AuthRequest, res: Response) => {
  try {
    const providers = await prisma.serviceProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch providers' });
  }
});

router.put('/providers/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;
    const provider = await prisma.serviceProvider.update({
      where: { id: req.params.id },
      data: { verificationStatus, verificationNotes },
    });
    res.json({ success: true, data: provider });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update provider' });
  }
});

// ── MANAGE BRANDS ─────────────────────────────────────────────

router.post('/brands', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const brand = await prisma.brand.create({ data: req.body });
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create brand' });
  }
});

router.put('/brands/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const brand = await prisma.brand.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update brand' });
  }
});

export default router;
