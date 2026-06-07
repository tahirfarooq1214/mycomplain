import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import brandRoutes from './routes/brands';
import categoryRoutes from './routes/categories';
import applianceRoutes from './routes/appliances';
import complaintRoutes from './routes/complaints';
import directoryRoutes from './routes/directory';
import adminRoutes from './routes/admin';
import providerRoutes from './routes/provider';
import uploadRoutes from './routes/upload';
import analyticsRoutes from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: { origin: '*' },
});

// Export for use in routes
export const prisma = new PrismaClient();
export { io };

// ── MIDDLEWARE ────────────────────────────────────────────────

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : '*';
app.use(cors({ origin: corsOrigins as any, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ── ROUTES ────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({ status: 'ok', app: 'MyComplain API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'MyComplain API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// ── ERROR HANDLER ─────────────────────────────────────────────

app.use(errorHandler);

// ── SOCKET.IO ─────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join user-specific room for real-time updates
  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  // Join ops dashboard room
  socket.on('join:ops', () => {
    socket.join('ops:dashboard');
  });

  // Join provider room
  socket.on('join:provider', (providerId: string) => {
    socket.join(`provider:${providerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ── START SERVER ──────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

console.log(`[startup] Attempting to listen on ${HOST}:${PORT}...`);
console.log(`[startup] NODE_ENV=${process.env.NODE_ENV}, DATABASE_URL=${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);

httpServer.listen(PORT, HOST, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     MyComplain API Server v1.0.0      ║
  ║     Running on ${HOST}:${PORT}            ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}       ║
  ╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Catch unhandled errors so Railway logs show the crash reason
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});
