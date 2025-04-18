import User from '../models/User.js';
import admin from '../config/firebase.js';
import { validationResult } from 'express-validator';
import { createAuditLog } from '../utils/auditLogger.js';

/**
 * Get all users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};
/**
 * Sign up a new user
 */












export const signupUser = async (req, res) => {
  try {
    const { email, password, role = 'user', name } = req.body;
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    const user = new User({
      email,
      name,
      firebaseUid: userRecord.uid,
      role,
    });
    await user.save();

    // Log the sign up
    await createAuditLog({
      action: 'USER_SIGNED_UP',
      performedBy: user._id, 
      resourceType: 'USER',
      resourceId: user._id,
    });

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: errors.array(),
      });
    }
    console.error('Error signing up user:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Sign in a user
 */
export const signinUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;
    const userRecord = await admin.auth().getUserByEmail(email);
    const user = await User.findOne({ firebaseUid: userRecord.uid });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error signing in user:', error);
    return res.status(500).json({
      error: true,



      message: 'Server error'
    });
  }

};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    };
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select('-__v');

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    };
    
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    // Only admins can update roles
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Only admins can update user roles'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });;
    }
    
    // Update user fields
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: errors.array(),
      });
    }
    // Log the update
    await createAuditLog({
      action: 'USER_UPDATED',
      performedBy: req.user.mongoId,
      resourceType: 'USER',
      resourceId: updatedUser._id,
      details: { updatedFields: Object.keys(req.body) }
    });

    return res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {

    console.error('Error updating user:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (req, res) => {
  try {
    // Only admins can deactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Only admins can deactivate users'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    // Deactivate user in MongoDB
    user.isActive = false;
    await user.save();

    // Disable user in Firebase
    await admin.auth().updateUser(user.firebaseUid, { disabled: true });

    // Log the deactivation
    await createAuditLog({
      action: 'USER_DEACTIVATED',
      performedBy: req.user.mongoId,
      resourceType: 'USER',
      resourceId: user._id,
      details: { firebaseUid: user.firebaseUid }
    });

    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};

/**
 * Reactivate user
 */
export const reactivateUser = async (req, res) => {
  try {
    // Only admins can reactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: true,
        message: 'Only admins can reactivate users'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    // Reactivate user in MongoDB
    user.isActive = true;
    await user.save();

    // Enable user in Firebase
    await admin.auth().updateUser(user.firebaseUid, { disabled: false });

    // Log the reactivation
    await createAuditLog({
      action: 'USER_REACTIVATED',
      performedBy: req.user.mongoId,
      resourceType: 'USER',
      resourceId: user._id,
      details: { firebaseUid: user.firebaseUid }
    });

    return res.status(200).json({
      success: true,
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    return res.status(500).json({
      error: true,
      message: 'Server error'
    });
  }
};