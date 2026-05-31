import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        helplineNumber: true,
        serviceEmail: true,
        whatsappNumber: true,
        website: true,
        avgResponseHours: true,
        avgRating: true,
        totalComplaints: true,
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch directory' });
  }
});

export default router;
