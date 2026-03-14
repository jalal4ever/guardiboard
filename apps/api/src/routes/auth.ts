import { Router, Response } from 'express';
import { db, tenants, memberships, users } from '@guardiboard/db';
import { authMiddleware, requireTenantAccess, type AuthRequest } from '../middleware/auth';
import { createToken } from '@guardiboard/auth';
import { requireEnv } from '@guardiboard/config';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const userMemberships = await db
      .select({
        tenant: tenants,
        membership: memberships,
      })
      .from(memberships)
      .innerJoin(tenants, eq(tenants.id, memberships.tenantId))
      .where(eq(memberships.userId, user.id));

    if (userMemberships.length === 0) {
      res.status(401).json({ error: 'User has no tenant access' });
      return;
    }

    const secret = requireEnv('SESSION_SECRET');
    const userOnlyToken = createToken(
      { sub: user.id, email: user.email, tenantId: '', role: 'viewer', scope: 'hybrid' },
      secret
    );

    const tenantList = userMemberships.map(({ tenant, membership }) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      scope: tenant.scope,
      isActive: tenant.isActive,
      role: membership.role,
    }));

    res.json({
      token: userOnlyToken,
      user: { id: user.id, email: user.email, name: user.name },
      tenants: tenantList,
      requiresTenantSelection: tenantList.length > 1,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/switch-tenant', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.body;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!tenantId) {
      res.status(400).json({ error: 'tenantId required' });
      return;
    }

    const membership = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.tenantId, tenantId),
          eq(memberships.userId, req.user.sub)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      res.status(403).json({ error: 'Forbidden', message: 'No access to this tenant' });
      return;
    }

    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const secret = requireEnv('SESSION_SECRET');
    const tenantToken = createToken(
      { 
        sub: req.user.sub, 
        email: req.user.email, 
        tenantId: tenant.id, 
        role: membership[0].role, 
        scope: tenant.scope 
      },
      secret
    );

    const allMemberships = await db
      .select({
        tenant: tenants,
        membership: memberships,
      })
      .from(memberships)
      .innerJoin(tenants, eq(tenants.id, memberships.tenantId))
      .where(eq(memberships.userId, req.user.sub));

    const tenantList = allMemberships.map(({ tenant, membership }) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      scope: tenant.scope,
      isActive: tenant.isActive,
      role: membership.role,
    }));

    res.json({
      token: tenantToken,
      user: { id: req.user.sub, email: req.user.email },
      tenants: tenantList,
      currentTenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description,
        scope: tenant.scope,
        isActive: tenant.isActive,
      },
      role: membership[0].role,
    });
  } catch (error) {
    console.error('Switch tenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.sub))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userMemberships = await db
      .select({
        tenant: tenants,
        membership: memberships,
      })
      .from(memberships)
      .innerJoin(tenants, eq(tenants.id, memberships.tenantId))
      .where(eq(memberships.userId, user.id));

    const tenantList = userMemberships.map(({ tenant, membership }) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      scope: tenant.scope,
      isActive: tenant.isActive,
      role: membership.role,
    }));

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      tenants: tenantList,
      currentTenant: req.tenantId ? {
        ...tenantList.find(t => t.id === req.tenantId),
      } : null,
      role: req.userRole,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, password, tenantName, tenantSlug, tenantScope } = req.body;

    if (!email || !name || !password || !tenantName || !tenantSlug) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const [user] = await db
      .insert(users)
      .values({ email, name })
      .returning();

    const [tenant] = await db
      .insert(tenants)
      .values({
        name: tenantName,
        slug: tenantSlug,
        scope: tenantScope || 'hybrid',
        status: 'active',
      })
      .returning();

    await db.insert(memberships).values({
      tenantId: tenant.id,
      userId: user.id,
      role: 'tenant_admin',
    });

    const secret = requireEnv('SESSION_SECRET');
    const userOnlyToken = createToken(
      { sub: user.id, email: user.email, tenantId: '', role: 'viewer', scope: tenantScope || 'hybrid' },
      secret
    );

    res.status(201).json({
      token: userOnlyToken,
      user: { id: user.id, email: user.email, name: user.name },
      tenants: [{
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description,
        scope: tenant.scope,
        isActive: tenant.isActive,
        role: 'tenant_admin',
      }],
      requiresTenantSelection: false,
    });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Conflict', message: 'Email or tenant slug already exists' });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
