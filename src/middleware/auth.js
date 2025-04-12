import { verifyToken } from '../controllers/userController.js';
import User from '../models/User.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * Middleware to verify Firebase ID token and sync user with MongoDB
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    await createAuditLog({
      action: 'USER_LOGIN',
      performedBy: user._id,
      details: { userId: user._id, email: user.email },
    });

    req.user = { ...decodedToken, role: user.role, mongoId: user._id };
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
}

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
export function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: 'Unauthorized: No user role found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}