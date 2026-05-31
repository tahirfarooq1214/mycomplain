import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// ── MULTER CONFIG ────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const mime = file.mimetype.split('/')[1];
    if (allowed.test(ext) || allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
});

// ── UPLOAD MEDIA FOR A COMPLAINT ─────────────────────────────

router.post(
  '/complaint/:id/media',
  authenticate,
  upload.array('files', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const complaintId = req.params.id;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No files uploaded' });
        return;
      }

      // Verify complaint belongs to user
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId },
      });

      if (!complaint || complaint.userId !== req.userId) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      // Save media records
      const mediaRecords = await Promise.all(
        files.map((file) => {
          const isVideo = /mp4|mov/.test(file.mimetype);
          return prisma.complaintMedia.create({
            data: {
              complaintId,
              mediaType: isVideo ? 'video' : 'image',
              url: `/uploads/${file.filename}`,
            },
          });
        })
      );

      res.json({ success: true, data: mediaRecords });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload files' });
    }
  }
);

// ── GET MEDIA FOR A COMPLAINT ────────────────────────────────

router.get('/complaint/:id/media', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const media = await prisma.complaintMedia.findMany({
      where: { complaintId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
});

export default router;
