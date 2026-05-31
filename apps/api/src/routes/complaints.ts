import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma, io } from '../index';
import { routeComplaint } from '../services/complaintRouter';

const router = Router();

// ── CREATE COMPLAINT ──────────────────────────────────────────

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const {
      serviceType,
      brandId,
      categoryId,
      modelNumber,
      serialNumber,
      issueType,
      description,
      preferredTime,
      preferredDate,
      warrantyCardUrl,
      purchaseDate,
      purchaseSource,
      dealerName,
      serviceAddress,
    } = req.body;

    // Generate complaint number
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.complaint.count({
      where: {
        createdAt: {
          gte: new Date(now.toISOString().slice(0, 10)),
        },
      },
    });
    const complaintNumber = `MC-${datePart}-${(count + 1).toString().padStart(4, '0')}`;

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        complaintNumber,
        userId,
        serviceType,
        brandId: brandId || null,
        categoryId,
        modelNumber,
        serialNumber,
        issueType,
        description,
        preferredTime,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        warrantyCardUrl,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        purchaseSource,
        dealerName,
        serviceAddress,
        status: 'SUBMITTED',
      },
      include: {
        brand: true,
        category: true,
      },
    });

    // Create initial timeline entry
    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: 'SUBMITTED',
        note: 'Complaint submitted successfully',
        updatedBy: 'system',
      },
    });

    // Route the complaint (async — don't block response)
    routeComplaint(complaint).catch(console.error);

    // Notify ops dashboard in real-time
    io.to('ops:dashboard').emit('complaint:new', complaint);

    res.status(201).json({
      success: true,
      data: complaint,
      message: `Complaint ${complaintNumber} registered successfully!`,
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ success: false, error: 'Failed to register complaint' });
  }
});

// ── GET USER'S COMPLAINTS ────────────────────────────────────

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { status, serviceType, page = '1', limit = '20' } = req.query;

    const where: any = { userId };
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;

    const pageNum = parseInt(page as string);
    const pageSize = parseInt(limit as string);

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          brand: true,
          category: true,
          timeline: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({
      success: true,
      data: complaints,
      total,
      page: pageNum,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
});

// ── GET SINGLE COMPLAINT ─────────────────────────────────────

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: {
        brand: true,
        category: true,
        appliance: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        media: true,
      },
    });

    if (!complaint) {
      res.status(404).json({ success: false, error: 'Complaint not found' });
      return;
    }

    // Ensure user can only see their own complaints (unless admin/ops)
    if (complaint.userId !== req.userId && !['ADMIN', 'OPS_AGENT', 'OPS_SUPERVISOR'].includes(req.userRole || '')) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch complaint' });
  }
});

// ── RATE COMPLAINT ───────────────────────────────────────────

router.post('/:id/rate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, review } = req.body;

    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });

    if (!complaint || complaint.userId !== req.userId) {
      res.status(404).json({ success: false, error: 'Complaint not found' });
      return;
    }

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { userRating: rating, userReview: review },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to rate complaint' });
  }
});

// ── ESCALATE COMPLAINT ───────────────────────────────────────

router.post('/:id/escalate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { status: 'ESCALATED' },
    });

    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: 'ESCALATED',
        note: 'Customer escalated the complaint',
        updatedBy: 'user',
      },
    });

    // Notify ops
    io.to('ops:dashboard').emit('complaint:escalated', complaint);

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to escalate' });
  }
});

// ── APPROVE QUOTE (for third-party service) ──────────────────

router.post('/:id/approve-quote', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { approved } = req.body;

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        customerApprovedQuote: approved,
        status: approved ? 'QUOTE_APPROVED' : 'CANCELLED',
      },
    });

    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: approved ? 'QUOTE_APPROVED' : 'CANCELLED',
        note: approved ? 'Customer approved the repair quote' : 'Customer declined the repair quote',
        updatedBy: 'user',
      },
    });

    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process quote response' });
  }
});

export default router;
