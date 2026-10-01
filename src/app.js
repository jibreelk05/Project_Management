// Express app setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes will be imported here

module.exports = app;