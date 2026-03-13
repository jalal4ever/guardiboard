import { describe, it, expect, beforeEach } from 'vitest';
import {
  createToken,
  verifyToken,
  getTokenFromHeader,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../index';
import type { Role } from '@guardiboard/types';

describe('Auth Module', () => {
  const secret = 'test-secret-key-for-testing';

  describe('createToken & verifyToken', () => {
    it('should create a valid JWT token', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-456',
        role: 'analyst' as Role,
        scope: 'read' as const,
      };

      const token = createToken(payload, secret);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create token with custom expiration', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-456',
        role: 'viewer' as Role,
        scope: 'read' as const,
      };

      const token = createToken(payload, secret, '1h');

      expect(token).toBeDefined();
    });

    it('should verify a valid token', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-456',
        role: 'analyst' as Role,
        scope: 'read' as const,
      };

      const token = createToken(payload, secret);
      const decoded = verifyToken(token, secret);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe('user-123');
      expect(decoded?.email).toBe('test@example.com');
      expect(decoded?.tenantId).toBe('tenant-456');
      expect(decoded?.role).toBe('analyst');
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token', secret);
      expect(result).toBeNull();
    });

    it('should return null for token with wrong secret', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-456',
        role: 'analyst' as Role,
        scope: 'read' as const,
      };

      const token = createToken(payload, secret);
      const result = verifyToken(token, 'wrong-secret');

      expect(result).toBeNull();
    });
  });

  describe('getTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const header = 'Bearer abc123token';
      const token = getTokenFromHeader(header);

      expect(token).toBe('abc123token');
    });

    it('should return null for invalid header format', () => {
      expect(getTokenFromHeader('Basic abc123')).toBeNull();
      expect(getTokenFromHeader('Bearer')).toBeNull();
      expect(getTokenFromHeader('')).toBeNull();
    });

    it('should return null for undefined header', () => {
      expect(getTokenFromHeader(undefined)).toBeNull();
    });
  });

  describe('Permissions', () => {
    describe('hasPermission', () => {
      it('should return true for platform_admin with all permissions', () => {
        expect(hasPermission('platform_admin', 'tenant:read')).toBe(true);
        expect(hasPermission('platform_admin', 'tenant:write')).toBe(true);
        expect(hasPermission('platform_admin', 'tenant:admin')).toBe(true);
        expect(hasPermission('platform_admin', 'connector:manage')).toBe(true);
        expect(hasPermission('platform_admin', 'finding:delete')).toBe(true);
      });

      it('should return true for tenant_admin with correct permissions', () => {
        expect(hasPermission('tenant_admin', 'tenant:read')).toBe(true);
        expect(hasPermission('tenant_admin', 'connector:write')).toBe(true);
        expect(hasPermission('tenant_admin', 'finding:update')).toBe(true);
      });

      it('should return false for tenant_admin for admin-only permissions', () => {
        expect(hasPermission('tenant_admin', 'tenant:admin')).toBe(false);
        expect(hasPermission('tenant_admin', 'finding:delete')).toBe(false);
      });

      it('should return false for viewer for restricted permissions', () => {
        expect(hasPermission('viewer', 'tenant:write')).toBe(false);
        expect(hasPermission('viewer', 'finding:delete')).toBe(false);
        expect(hasPermission('viewer', 'user:admin')).toBe(false);
      });

      it('should return true for analyst with appropriate permissions', () => {
        expect(hasPermission('analyst', 'tenant:read')).toBe(true);
        expect(hasPermission('analyst', 'finding:write')).toBe(true);
        expect(hasPermission('analyst', 'collection:run')).toBe(true);
      });
    });

    describe('hasAnyPermission', () => {
      it('should return true if user has any of the permissions', () => {
        expect(hasAnyPermission('viewer', ['tenant:read', 'tenant:write'])).toBe(true);
        expect(hasAnyPermission('viewer', ['tenant:write', 'finding:delete'])).toBe(false);
      });

      it('should return false if user has none of the permissions', () => {
        expect(hasAnyPermission('viewer', ['tenant:admin', 'user:admin'])).toBe(false);
      });
    });

    describe('hasAllPermissions', () => {
      it('should return true if user has all permissions', () => {
        expect(hasAllPermissions('platform_admin', ['tenant:read', 'tenant:write'])).toBe(true);
      });

      it('should return false if user is missing any permission', () => {
        expect(hasAllPermissions('viewer', ['tenant:read', 'tenant:write'])).toBe(false);
      });
    });
  });
});
