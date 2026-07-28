import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

/** Get or auto-generate a JWT secret for this process lifetime. */
function resolveSecret(): string {
  const env = process.env['JWT_SECRET'];
  if (env && env.trim().length >= 32) return env.trim();

  const generated = randomBytes(32).toString('hex');
  process.env['JWT_SECRET'] = generated;
  console.warn(
    '\n[JWT] WARNING: JWT_SECRET is not set (or too short) in environment variables.\n' +
    '[JWT] A temporary secret has been generated — all sessions reset on server restart.\n' +
    '[JWT] Add JWT_SECRET (min 32 chars) to your environment secrets to persist sessions.\n',
  );
  return generated;
}

const JWT_SECRET = resolveSecret();

export interface JwtPayload {
  uid: string;
  name: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && 'uid' in decoded) {
      return decoded as JwtPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// Augment Express Request so TypeScript knows about req.jwtUser
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      jwtUser?: JwtPayload;
    }
  }
}

/**
 * Middleware: verify Bearer JWT.
 * For user-scoped routes (those with :uid param), the token uid must match.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }
  const token = header.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
    return;
  }
  // For user-scoped routes, prevent one user accessing another user's data
  const pathUid = req.params['uid'];
  if (pathUid && payload.uid !== pathUid) {
    res.status(403).json({ message: 'Forbidden.' });
    return;
  }
  req.jwtUser = payload;
  next();
}
