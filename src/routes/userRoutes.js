import express from 'express';
import {
  getAllUsers,
  getUserById,
  signUp,
  signIn,
  getCurrentUser,
  updateUser,
  deactivateUser,
  reactivateUser
} from '../controllers/userController.js';
import { verifyFirebaseToken, checkRole } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};



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

// User sign-up route
router.post('/signup', validate([
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').isIn(['admin', 'user']).withMessage('Invalid role')
]), signUp);

// User sign-in route
router.post('/signin', validate([
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
]), signIn);



export default router;