import { Response, NextFunction } from 'express';
import { auth, firestore, isTestMode } from '../config/firebase';
import { AuthenticatedRequest, UserRole } from '../types';

// Verify Firebase token and extract user info
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

if (!token) {
  res.status(401).json({
    success: false,
    message: 'Access token is missing'
  });
  return;
}

// In development mode, allow bypass with a special test token ONLY
if (process.env.NODE_ENV === 'development' && token === 'test-token') {
  console.log('⚠️  Development mode: Using test token');
  
  req.user = {
    uid: 'test-user-id',
    email: 'test@example.com',
    role: UserRole.ADMIN
  };
  
  next();
  return;
}

// Verify the Firebase token for all other cases
const decodedToken = await auth.verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await firestore.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const userData = userDoc.data();
    
    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: userData?.role || UserRole.STUDENT
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Authorize specific roles
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = authorizeRoles(UserRole.ADMIN);

// Check if user is teacher or admin
export const requireTeacherOrAdmin = authorizeRoles(UserRole.TEACHER, UserRole.ADMIN);

// Check if user is student, teacher, or admin (authenticated users)
export const requireAuth = authorizeRoles(UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN);