import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// ── GET PROFILE ───────────────────────────────────────────────

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        city: true,
        area: true,
        address: true,
        profilePhotoUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────

router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, city, area, address, profilePhotoUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        fullName,
        email,
        city,
        area,
        address,
        profilePhotoUrl,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// ── UPDATE FCM TOKEN ──────────────────────────────────────────

router.put('/fcm-token', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;

    await prisma.user.update({
      where: { id: req.userId },
      data: { fcmToken: token },
    });

    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update token' });
  }
});

export default router;
