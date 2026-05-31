import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// ── SEND OTP ──────────────────────────────────────────────────

router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      res.status(400).json({ success: false, error: 'Phone number is required' });
      return;
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(phone, { otp, expiresAt });

    // TODO: Send OTP via SMS gateway (Jazzy SMS, Twilio, etc.)
    // For development, log to console
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove in production — only for development
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// ── VERIFY OTP ────────────────────────────────────────────────

router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      res.status(400).json({ success: false, error: 'Phone and OTP are required' });
      return;
    }

    const stored = otpStore.get(phone);

    if (!stored) {
      res.status(400).json({ success: false, error: 'No OTP found. Please request a new one.' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(phone);
      res.status(400).json({ success: false, error: 'OTP expired. Please request a new one.' });
      return;
    }

    if (stored.otp !== otp) {
      res.status(400).json({ success: false, error: 'Invalid OTP' });
      return;
    }

    // OTP valid — clear it
    otpStore.delete(phone);

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: 'CONSUMER' },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          city: user.city,
          area: user.area,
          address: user.address,
          profilePhotoUrl: user.profilePhotoUrl,
          role: user.role,
        },
        isNewUser,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Verification failed' });
  }
});

// ── DIRECT PHONE LOGIN (no OTP — consumer enters phone, gets in) ──

router.post('/phone-login', async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      res.status(400).json({ success: false, error: 'Valid phone number is required' });
      return;
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    const isNewUser = !user;

    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: 'CONSUMER' },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
          city: user.city,
          area: user.area,
          address: user.address,
          profilePhotoUrl: user.profilePhotoUrl,
          role: user.role,
        },
        isNewUser,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// ── CMS LOGIN (for ops agents + service providers) ────────────

router.post('/cms-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password required' });
      return;
    }

    // Check if it's an ops agent / admin
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: { in: ['ADMIN', 'OPS_AGENT', 'OPS_SUPERVISOR'] },
      },
    });

    if (user) {
      // TODO: verify password hash in production
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '12h' }
      );

      res.json({
        success: true,
        data: { token, user, type: 'ops' },
      });
      return;
    }

    // Check if it's a service provider
    const provider = await prisma.serviceProvider.findFirst({
      where: { email },
    });

    if (provider) {
      // TODO: verify bcrypt password hash in production
      const token = jwt.sign(
        { userId: provider.id, role: 'SERVICE_PROVIDER', providerId: provider.id },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '12h' }
      );

      res.json({
        success: true,
        data: { token, provider, type: 'provider' },
      });
      return;
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

export default router;
