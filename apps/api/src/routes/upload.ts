import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// ── CLOUDINARY CONFIG ────────────────────────────────────────

const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured for file uploads');
} else {
  console.log('📁 Using local disk storage for uploads (set CLOUDINARY_* env vars for cloud)');
}

// ── MULTER CONFIG (local fallback) ───────────────────────────

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

// For Cloudinary: store in memory buffer
const memoryStorage = multer.memoryStorage();

const upload = multer({
  storage: useCloudinary ? memoryStorage : storage,
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

// ── HELPER: Upload to Cloudinary ─────────────────────────────

function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'mycomplain/complaints',
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
}

// ── UPLOAD MEDIA FOR A COMPLAINT ─────────────────────────────

router.post(
  '/complaint/:id/media',
  authenticate,
  upload.array('files', 5),
  async (req: AuthRequest, res: Response) => {
    try {
      const complaintId = req.params.id as string;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No files uploaded' });
        return;
      }

      // Verify complaint belongs to user
      const complaint = await prisma.complaint.findUnique({
        where: { id: complaintId as string },
      });

      if (!complaint || complaint.userId !== req.userId) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      // Upload files and save media records
      const mediaRecords = await Promise.all(
        files.map(async (file) => {
          const isVideo = /mp4|mov/.test(file.mimetype);

          let url: string;
          if (useCloudinary) {
            url = await uploadToCloudinary(file);
          } else {
            url = `/uploads/${file.filename}`;
          }

          return prisma.complaintMedia.create({
            data: {
              complaintId,
              mediaType: isVideo ? 'video' : 'image',
              url,
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
      where: { complaintId: req.params.id as string },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch media' });
  }
});

export default router;
