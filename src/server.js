import app from './app.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Unhandled Promise Rejection');
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('Shutting down the server due to Uncaught Exception');
  server.close(() => {
    process.exit(1);
  });
});