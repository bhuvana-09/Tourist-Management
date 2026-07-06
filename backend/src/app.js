/**
 * Sprint 1 Architectural Decisions:
 * 
 * 1. Folder Structure:
 *    We chose an MVC-inspired, feature-based sub-folder structure (`config/`, `models/`, `routes/`, 
 *    `controllers/`, `middlewares/`, `utils/`) under `src/` to separate concerns and ensure scalability 
 *    as more resources are migrated in later sprints.
 * 
 * 2. Centralized Error Handling:
 *    We implemented a standard `asyncHandler` wrapper around controller routes and a single global 
 *    `errorHandler` middleware. This removes repetitive try/catch blocks from our controllers, 
 *    improving code readability and maintaining a consistent error response shape: { success: false, message: ... }.
 * 
 * 3. DB to Frontend ID mapping:
 *    Mongoose virtuals and `toJSON` transform options are used in the Destination model to convert 
 *    `_id` into `id` (and remove `_id` and `__v`). This matches the shape of the existing JSON-Server 
 *    mock data and prevents major refactoring on the frontend components.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { CLIENT_URL } = require('./config/env');
const destinationRoutes = require('./routes/destination.routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// CORS middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API Routes
app.use('/api/destinations', destinationRoutes);

// 404 handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
