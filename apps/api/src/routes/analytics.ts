import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'OPS_AGENT', 'OPS_SUPERVISOR'));

// ── FULL ANALYTICS DATA ──────────────────────────────────────

router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // ── Complaints by status ──
    const statusCounts = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // ── Complaints by service type ──
    const serviceTypeCounts = await prisma.complaint.groupBy({
      by: ['serviceType'],
      _count: { id: true },
    });

    // ── Complaints by brand (top 10) ──
    const brandCounts = await prisma.complaint.groupBy({
      by: ['brandId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
      where: { brandId: { not: null } },
    });

    // Fetch brand names
    const brandIds = brandCounts.map((b) => b.brandId!).filter(Boolean);
    const brandsData = await prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true },
    });
    const brandMap = Object.fromEntries(brandsData.map((b) => [b.id, b.name]));

    const brandBreakdown = brandCounts.map((b) => ({
      brand: brandMap[b.brandId!] || 'Unknown',
      count: b._count.id,
    }));

    // ── Complaints per day (last 30 days) ──
    const dailyComplaints = await prisma.complaint.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const dailyMap: Record<string, number> = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const c of dailyComplaints) {
      const day = c.createdAt.toISOString().slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const dailyTrend = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    // ── Complaints per day (last 7 days) for weekly chart ──
    const weeklyTrend = dailyTrend.slice(-7);

    // ── Issue type distribution ──
    const issueTypeCounts = await prisma.complaint.groupBy({
      by: ['issueType'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // ── Resolution metrics ──
    const resolvedComplaints = await prisma.complaint.findMany({
      where: {
        resolvedAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, resolvedAt: true },
    });

    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((sum, c) => {
        return sum + (c.resolvedAt!.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    // ── Summary stats ──
    const [total, active, resolved, todayCount, pendingQueue] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({
        where: { status: { notIn: ['CLOSED', 'CANCELLED', 'RESOLVED', 'REPAIR_COMPLETE'] } },
      }),
      prisma.complaint.count({
        where: { status: { in: ['RESOLVED', 'REPAIR_COMPLETE'] } },
      }),
      prisma.complaint.count({
        where: { createdAt: { gte: new Date(now.toISOString().slice(0, 10)) } },
      }),
      prisma.complaint.count({
        where: { status: { in: ['SUBMITTED', 'IN_QUEUE'] }, routingMethod: 'MANUAL_CALL' },
      }),
    ]);

    // ── Ratings distribution ──
    const ratingCounts = await prisma.complaint.groupBy({
      by: ['userRating'],
      _count: { id: true },
      where: { userRating: { not: null } },
    });

    res.json({
      success: true,
      data: {
        summary: {
          total,
          active,
          resolved,
          todayCount,
          pendingQueue,
          avgResolutionHours,
        },
        statusDistribution: statusCounts.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        serviceTypeBreakdown: serviceTypeCounts.map((s) => ({
          type: s.serviceType,
          count: s._count.id,
        })),
        brandBreakdown,
        dailyTrend,
        weeklyTrend,
        issueTypes: issueTypeCounts.map((i) => ({
          type: i.issueType,
          count: i._count.id,
        })),
        ratings: ratingCounts.map((r) => ({
          rating: r.userRating,
          count: r._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
});

export default router;
