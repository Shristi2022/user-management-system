import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import { connectDB } from './config/db';
import userRouter from './routes/userRoutes';
import uploadRouter from './routes/uploadRoutes';

const app = express();

// Set up essential middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/users', userRouter);
app.use('/api/upload', uploadRouter);

// Basic API Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy and running',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`❌ Global Error: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';

  res.status(statusCode).json({
    status,
    message: env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal server error' : err.message,
  });
});

// Start DB connection and listen
const startServer = async () => {
  await connectDB();
  
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
