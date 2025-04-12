import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import userRoutes from './routes/userRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

// Import Firebase configuration
import './config/firebase.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB with provided connection string
const MONGODB_URI = 'mongodb+srv://nomnk5138:nomnk5138@spineline.6ywg3.mongodb.net/?retryWrites=true&w=majority&appName=SpineLine';

// Try to connect to MongoDB but continue if it fails
try {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Continuing without MongoDB connection for development');
    });
} catch (error) {
  console.error('Error setting up MongoDB connection:', error);
  console.log('Continuing without MongoDB connection for development');
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/audit', auditRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
});

// Start server
const SERVER_PORT = 4501; // Explicitly set port to 4501
app.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});