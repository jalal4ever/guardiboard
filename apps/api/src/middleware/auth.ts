import { Request, Response, NextFunction } from 'express';
import { requireEnv } from '@guardiboard/config';
import { verifyToken, getTokenFromHeader, type TokenPayload } from '@guardiboard/auth';
import { db, memberships } from '@guardiboard/db';
import { eq, and } from 'drizzle-orm';
import type { Role } from '@guardiboard/types';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  tenantId?: string;
  userRole?: Role;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
      return;
    }

    const secret = requireEnv('SESSION_SECRET');
    const payload = verifyToken(token, secret);

    if (!payload) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
      return;
    }

    req.user = payload;
    req.tenantId = payload.tenantId;
    req.userRole = payload.role as Role;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function requireTenantAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.tenantId) {
      res.status(401).json({ error: 'Unauthorized', message: 'Tenant-scoped token required' });
      return;
    }

    const membership = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenantId, req.tenantId),
          eq(memberships.userId, req.user.sub)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      res.status(403).json({ error: 'Forbidden', message: 'No access to this tenant' });
      return;
    }

    req.userRole = membership[0].role;
    next();
  } catch (error) {
    console.error('Tenant access error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({ 
        error: 'Forbidden', 
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }

    next();
  };
}
