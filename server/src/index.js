import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import messRoutes from './routes/messRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import campusRoutes from './routes/campusRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

// Error Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables (support root and server working directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure allowed CORS origins
const clientUrlList = CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''));
const allowedOrigins = [
  ...clientUrlList,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      try {
        const cleanOrigin = origin.replace(/\/$/, '');
        const originHostname = new URL(cleanOrigin).hostname;

        if (
          CLIENT_URL === '*' ||
          allowedOrigins.includes(cleanOrigin) ||
          /^https?:\/\/localhost(:\d+)?$/.test(cleanOrigin) ||
          /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(cleanOrigin) ||
          originHostname.endsWith('.vercel.app') ||
          originHostname.endsWith('.onrender.com')
        ) {
          return callback(null, true);
        }
      } catch (e) {
        // Fallback for non-standard origin URLs
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger to track incoming paths on Render/host
app.use((req, res, next) => {
  console.log(`[Incoming HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Root, API Index, and Health Check Routes
app.get('/', (req, res) => res.json({ status: 'API is running' }));
app.get('/api', (req, res) => res.json({ status: 'API v1 root' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// Mount API Feature Routes (Primary /api prefix matching frontend expectations)
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/campuses', campusRoutes);

// Resilient fallback mounts without '/api' prefix to prevent 404 if client strips /api
app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);
app.use('/complaints', complaintRoutes);
app.use('/mess', messRoutes);
app.use('/notices', noticeRoutes);
app.use('/assistant', assistantRoutes);
app.use('/campuses', campusRoutes);

// 404 and Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server and connect to Database
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 StayMate AI Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Allowed Client: ${CLIENT_URL}`);
    console.log(`===============================================`);
  });
};

startServer();

export default app;
