import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { swaggerUi, swaggerSpec } from './config/swagger.js';
import AppError from './utils/appError.js';
import errorHandler from './middlewares/errorHandler.js';
import authRouter from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', authRouter);

// Handle unhandled routes
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
});

// Global error handling middleware
app.use(errorHandler);

// Handle specific Mongoose errors
app.use(errorHandler.handleMongooseErrors);

export default app;