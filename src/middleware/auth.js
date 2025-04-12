import admin from '../config/firebase.js';
import User from '../models/User.js';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * Middleware to verify Firebase ID token and sync user with MongoDB
 */
export async function verifyFirebaseToken(req, res, next) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: true, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach the decoded token to the request object
    req.user = decodedToken;
    
    // Find the user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    // If user doesn't exist in MongoDB, create a new user with default role
    if (!user) {
      const newUser = await User.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        role: 'secretary', // Default role
        fullName: decodedToken.name || 'New User',
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      // Log the new user creation
      await createAuditLog({
        action: 'USER_CREATED',
        performedBy: decodedToken.uid,
        details: { userId: newUser._id, email: newUser.email }
      });
      
      req.user.role = newUser.role;
      req.user.mongoId = newUser._id;
    } else {
      // Update last login time
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      
      // Attach user role and MongoDB ID to the request
      req.user.role = user.role;
      req.user.mongoId = user._id;
      
      // Log the user login
      await createAuditLog({
        action: 'USER_LOGIN',
        performedBy: user._id,
        details: { userId: user._id, email: user.email }
      });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }
}

/**
 * Middleware to check if user has required role
 * @param {string[]} roles - Array of allowed roles
 */
export function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
}