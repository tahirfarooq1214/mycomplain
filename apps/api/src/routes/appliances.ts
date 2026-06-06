import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appliances = await prisma.userAppliance.findMany({
      where: { userId: req.userId },
      include: { brand: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: appliances });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch appliances' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const appliance = await prisma.userAppliance.create({
      data: {
        userId: req.userId!,
        brandId: req.body.brandId,
        categoryId: req.body.categoryId,
        modelNumber: req.body.modelNumber,
        serialNumber: req.body.serialNumber,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : null,
        purchaseSource: req.body.purchaseSource,
        dealerName: req.body.dealerName,
        warrantyCardUrl: req.body.warrantyCardUrl,
        warrantyExpiryDate: req.body.warrantyExpiryDate ? new Date(req.body.warrantyExpiryDate) : null,
      },
      include: { brand: true, category: true },
    });
    res.status(201).json({ success: true, data: appliance });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add appliance' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.userAppliance.deleteMany({
      where: { id: req.params.id as string, userId: req.userId },
    });
    res.json({ success: true, message: 'Appliance removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove appliance' });
  }
});

export default router;
