import express from 'express';
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deactivateUser,
  reactivateUser
} from '../controllers/userController.js';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get current user
router.get('/me', verifyFirebaseToken, getCurrentUser);

// Get all users - admin only
router.get('/', verifyFirebaseToken, checkRole(['admin']), getAllUsers);

// Get user by ID - admin only
router.get('/:id', verifyFirebaseToken, checkRole(['admin']), getUserById);

// Update user - admin only for role changes
router.put('/:id', verifyFirebaseToken, updateUser);

// Deactivate user - admin only
router.put('/:id/deactivate', verifyFirebaseToken, checkRole(['admin']), deactivateUser);

// Reactivate user - admin only
router.put('/:id/reactivate', verifyFirebaseToken, checkRole(['admin']), reactivateUser);

export default router;