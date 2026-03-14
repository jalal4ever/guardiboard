import { vi, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';

vi.mock('@guardiboard/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
        orderBy: vi.fn().mockResolvedValue([]),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    }),
  },
  tenants: {
    id: {},
    name: {},
    slug: {},
    scope: {},
    status: {},
  },
  users: {
    id: {},
    email: {},
    name: {},
  },
  memberships: {
    id: {},
    tenantId: {},
    userId: {},
    role: {},
    createdAt: {},
  },
  connectors: {
    id: {},
    tenantId: {},
    type: {},
    status: {},
  },
  findings: {
    id: {},
    tenantId: {},
    severity: {},
    status: {},
    source: {},
  },
  identityUsers: {
    id: {},
    tenantId: {},
    displayName: {},
    userPrincipalName: {},
  },
  identityGroups: {
    id: {},
    tenantId: {},
    displayName: {},
  },
  secureScores: {
    id: {},
    tenantId: {},
    score: {},
    maxScore: {},
    createdAt: {},
  },
}));

vi.mock('@guardiboard/config', () => ({
  requireEnv: vi.fn((key: string) => {
    const env: Record<string, string> = {
      PORT: '3001',
      SESSION_SECRET: 'test-secret-key-for-testing',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
      AZURE_TENANT_ID: 'test-tenant-id',
      AZURE_CLIENT_ID: 'test-client-id',
      AZURE_CLIENT_SECRET: 'test-client-secret',
    };
    return env[key] || '';
  },
}));

vi.mock('@guardiboard/auth', () => ({
  createToken: vi.fn((payload, secret) => 'mocked-token'),
  verifyToken: vi.fn((token, secret) => {
    if (token === 'valid-token') {
      return {
        sub: 'user-123',
        email: 'test@example.com',
        tenantId: 'tenant-456',
        role: 'analyst',
        scope: 'hybrid',
      };
    }
    return null;
  }),
  getTokenFromHeader: vi.fn((header) => {
    if (header?.startsWith('Bearer ')) {
      return header.replace('Bearer ', '');
    }
    return null;
  }),
  hasPermission: vi.fn(() => true),
}));

export { supertest };
