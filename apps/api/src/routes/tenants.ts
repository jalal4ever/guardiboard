import { Router, Response } from 'express';
import { db, tenants, memberships } from '@guardiboard/db';
import { createTenantSchema } from '@guardiboard/validation';
import { authMiddleware, requireTenantAccess, type AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.sub;
    
    const userMemberships = await db
      .select({
        tenant: tenants,
        membership: memberships,
      })
      .from(memberships)
      .innerJoin(tenants, eq(tenants.id, memberships.tenantId))
      .where(eq(memberships.userId, userId));

    const result = userMemberships.map(({ tenant, membership }) => ({
      ...tenant,
      role: membership.role,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTenantSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ 
        error: 'Validation error', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const { name, slug, scope } = parsed.data;
    const userId = req.user!.sub;

    const [tenant] = await db
      .insert(tenants)
      .values({
        name,
        slug,
        scope,
        status: 'active',
      })
      .returning();

    await db.insert(memberships).values({
      tenantId: tenant.id,
      userId,
      role: 'tenant_admin',
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Conflict', message: 'Tenant slug already exists' });
      return;
    }
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tenantId', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
