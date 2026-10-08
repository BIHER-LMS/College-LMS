import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import apiRoutes from './routes/index';
import { errorHandler } from './middleware/errorMiddleware';
import { NotFoundError } from './utils/errors';

export const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Root
app.use('/api', apiRoutes);

// 404 Handler
app.use((_req, _res, next) => {
  next(new NotFoundError('The requested endpoint was not found on this server.'));
});

// Centralized Error Handler
app.use(errorHandler);
