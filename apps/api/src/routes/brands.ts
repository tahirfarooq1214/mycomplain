import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// ── GET ALL BRANDS ────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: {
        categories: {
          include: { category: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch brands' });
  }
});

// ── GET BRAND BY ID ───────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: req.params.id as string },
      include: {
        categories: {
          include: { category: true },
        },
      },
    });

    if (!brand) {
      res.status(404).json({ success: false, error: 'Brand not found' });
      return;
    }

    res.json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch brand' });
  }
});

// ── SEARCH BRANDS ─────────────────────────────────────────────

router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        name: {
          contains: req.params.query as string,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

export default router;
