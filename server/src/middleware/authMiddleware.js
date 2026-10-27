import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes by verifying JWT in Authorization Bearer header
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'staymate_ai_jwt_super_secret_key_development_only_change_in_production'
      );

      // Attach user to req object without password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User belonging to this token no longer exists',
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token verification failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No bearer token provided',
    });
  }
};

/**
 * Restrict route access to specific user roles
 * @param  {...string} roles - Allowed roles e.g. 'admin', 'student'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this route. Required: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

export default { protect, authorize };
