import express from 'express';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Routes will be implemented in the next phase
// Only admins should have access to audit logs

export default router;