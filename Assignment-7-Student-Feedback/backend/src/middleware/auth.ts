import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'instructor' | 'student';
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      id: string;
      email: string;
      role: 'instructor' | 'student';
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const instructorOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'instructor') {
    return res.status(403).json({
      success: false,
      message: 'Only instructors can access this resource',
    });
  }
  next();
};

export const studentOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Only students can access this resource',
    });
  }
  next();
};
