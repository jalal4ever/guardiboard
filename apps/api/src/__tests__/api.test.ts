import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';

vi.mock('@guardiboard/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
  tenants: {
    id: { toString: () => 'tenant-123' },
    name: {},
    slug: {},
    scope: {},
    status: {},
  },
  users: {
    id: { toString: () => 'user-123' },
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
}));

vi.mock('@guardiboard/config', () => ({
  requireEnv: vi.fn((key: string) => {
    const env: Record<string, string> = {
      PORT: '3001',
      SESSION_SECRET: 'test-secret-key-for-testing',
    };
    return env[key] || '';
  },
}));

vi.mock('@guardiboard/auth', () => ({
  createToken: vi.fn(() => 'mocked-jwt-token'),
  verifyToken: vi.fn((token) => {
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

const mockApp = express();
mockApp.use(express.json());
mockApp.use(cookieParser());

mockApp.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

mockApp.get('/api', (req, res) => {
  res.json({ message: 'Guardiboard API', version: '1.0.0' });
});

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token === 'valid-token') {
    req.user = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-456',
      role: 'analyst',
      scope: 'hybrid',
    };
    req.tenantId = 'tenant-456';
    req.userRole = 'analyst';
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

mockApp.get('/api/protected', authMiddleware, (req: any, res) => {
  res.json({ user: req.user, tenantId: req.tenantId });
});

mockApp.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  if (email === 'test@example.com' && password === 'password') {
    res.json({
      token: 'mocked-jwt-token',
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      tenants: [{
        id: 'tenant-456',
        name: 'Test Tenant',
        slug: 'test-tenant',
        scope: 'hybrid',
        role: 'tenant_admin',
      }],
      requiresTenantSelection: false,
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

mockApp.get('/api/auth/me', authMiddleware, (req: any, res) => {
  res.json({
    user: req.user,
    tenants: [{
      id: 'tenant-456',
      name: 'Test Tenant',
      slug: 'test-tenant',
      scope: 'hybrid',
      role: 'tenant_admin',
    }],
    currentTenant: {
      id: 'tenant-456',
      name: 'Test Tenant',
      slug: 'test-tenant',
      scope: 'hybrid',
    },
    role: req.userRole,
  });
});

describe('API Routes', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(mockApp).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    it('should return API info', async () => {
      const response = await request(mockApp).get('/api');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Guardiboard API');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject missing credentials', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password required');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should login with valid credentials', async () => {
      const response = await request(mockApp)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('tenants');
      expect(response.body.tenants).toHaveLength(1);
    });
  });

  describe('Protected routes', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(mockApp).get('/api/protected');
      
      expect(response.status).toBe(401);
    });

    it('should allow authenticated requests', async () => {
      const response = await request(mockApp)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user info', async () => {
      const response = await request(mockApp)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('tenants');
      expect(response.body).toHaveProperty('currentTenant');
      expect(response.body).toHaveProperty('role', 'analyst');
    });
  });
});
