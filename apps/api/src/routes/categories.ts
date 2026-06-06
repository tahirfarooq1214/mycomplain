import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

router.get('/:id/brands', async (req: Request, res: Response) => {
  try {
    const brandCategories = await prisma.brandCategory.findMany({
      where: { categoryId: req.params.id as string },
      include: { brand: true },
    });
    const brands = brandCategories.map((bc: any) => bc.brand).filter((b: any) => b.isActive);
    res.json({ success: true, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch brands for category' });
  }
});

export default router;
