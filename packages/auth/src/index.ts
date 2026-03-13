import jwt from 'jsonwebtoken';
import type { Role, Scope } from '@guardiboard/types';

export interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: Role;
  scope: Scope;
}

export interface SessionData {
  userId: string;
  email: string;
  tenantId: string;
  role: Role;
  scope: Scope;
  iat: number;
  exp: number;
}

export function createToken(
  payload: Omit<TokenPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = '24h'
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') return null;
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

export type Permission =
  | 'tenant:read'
  | 'tenant:write'
  | 'tenant:admin'
  | 'connector:read'
  | 'connector:write'
  | 'connector:manage'
  | 'finding:read'
  | 'finding:write'
  | 'finding:update'
  | 'finding:delete'
  | 'dashboard:read'
  | 'dashboard:write'
  | 'dashboard:admin'
  | 'user:read'
  | 'user:write'
  | 'user:admin'
  | 'collection:run'
  | 'collection:cancel'
  | 'export:read'
  | 'export:write';

const rolePermissions: Record<Role, Permission[]> = {
  platform_admin: [
    'tenant:read', 'tenant:write', 'tenant:admin',
    'connector:read', 'connector:write', 'connector:manage',
    'finding:read', 'finding:write', 'finding:update', 'finding:delete',
    'dashboard:read', 'dashboard:write', 'dashboard:admin',
    'user:read', 'user:write', 'user:admin',
    'collection:run', 'collection:cancel',
    'export:read', 'export:write',
  ],
  tenant_admin: [
    'tenant:read',
    'connector:read', 'connector:write', 'connector:manage',
    'finding:read', 'finding:write', 'finding:update',
    'dashboard:read', 'dashboard:write', 'dashboard:admin',
    'user:read', 'user:write',
    'collection:run', 'collection:cancel',
    'export:read', 'export:write',
  ],
  analyst: [
    'tenant:read',
    'connector:read',
    'finding:read', 'finding:write', 'finding:update',
    'dashboard:read', 'dashboard:write',
    'collection:run',
    'export:read',
  ],
  viewer: [
    'tenant:read',
    'connector:read',
    'finding:read',
    'dashboard:read',
    'export:read',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}
