import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { startQueueWorker } from './Services/queueService.js';
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import analysisRoutes from './routes/analysis.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './Middlewares/error.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and utility middleware
app.use(cors());
app.use(express.json());

// Route wiring
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// Base route for connectivity check
app.get('/api', (req, res) => {
  res.json({ status: 'online', message: 'MERN Resume Analyzer API is active.' });
});

// Serve frontend static assets from dist folder
const frontendDistPath = path.join(__dirname, '../Frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback all other GET requests to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect Mongoose to MongoDB
  await connectDB();
  
  // Launch the asynchronous database queue processor
  startQueueWorker();

  app.listen(PORT, () => {
    console.log(`[Server] Listening on http://localhost:${PORT}`);
  });
};

startServer();
