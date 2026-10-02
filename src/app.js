// Express app setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const AppError = require('./utils/appError');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes will be imported here

// Handle unhandled routes
app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
});

// Global error handling middleware
app.use(errorHandler);

// Handle specific Mongoose errors
app.use(errorHandler.handleMongooseErrors);

module.exports = app;