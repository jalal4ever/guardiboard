import { Router, Response } from 'express';
import { db, tenants, memberships, azureCredentials, adCredentials, connectors, users } from '@guardiboard/db';
import { createTenantSchema } from '@guardiboard/validation';
import { authMiddleware, requireTenantAccess, type AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';
import { encrypt } from '@guardiboard/config';
import { createToken } from '@guardiboard/auth';
import { requireEnv } from '@guardiboard/config';

const router = Router();

router.post('/setup', async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, scope, description, email, userName } = req.body;

    if (!name || !slug || !email) {
      res.status(400).json({ error: 'Missing required fields: name, slug, email' });
      return;
    }

    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      res.status(403).json({ error: 'Setup already completed. Please login.' });
      return;
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        name: userName || email.split('@')[0],
      })
      .returning();

    const [tenant] = await db
      .insert(tenants)
      .values({
        name,
        slug,
        scope: scope || 'hybrid',
        description: description || null,
        status: 'active',
        isActive: true,
      })
      .returning();

    await db.insert(memberships).values({
      tenantId: tenant.id,
      userId: user.id,
      role: 'tenant_admin',
    });

    const secret = requireEnv('SESSION_SECRET');
    const token = createToken(
      { sub: user.id, email: user.email, tenantId: tenant.id, role: 'tenant_admin', scope: tenant.scope },
      secret
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        description: tenant.description,
        scope: tenant.scope,
        isActive: tenant.isActive,
      },
    });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Conflict', message: 'Email or tenant slug already exists' });
      return;
    }
    console.error('Error in setup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      scope: tenant.scope,
      status: tenant.status,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      role: membership.role,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTenantSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ 
        error: 'Validation error', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const { name, slug, scope, description } = parsed.data;
    const userId = req.user!.sub;

    const [tenant] = await db
      .insert(tenants)
      .values({
        name,
        slug,
        scope,
        description: description || null,
        status: 'active',
        isActive: true,
      })
      .returning();

    await db.insert(memberships).values({
      tenantId: tenant.id,
      userId,
      role: 'tenant_admin',
    });

    res.status(201).json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      scope: tenant.scope,
      status: tenant.status,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
      role: 'tenant_admin',
    });
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

router.patch('/:tenantId', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { name, description, scope, isActive } = req.body;
    
    const [tenant] = await db
      .update(tenants)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(scope && { scope }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!tenant) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(tenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:tenantId', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const [tenant] = await db
      .delete(tenants)
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!tenant) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tenantId/config/azure', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const [creds] = await db
      .select()
      .from(azureCredentials)
      .where(eq(azureCredentials.tenantId, tenantId))
      .limit(1);

    if (!creds) {
      res.json({ isConfigured: false });
      return;
    }

    res.json({
      isConfigured: creds.isConfigured,
      clientId: creds.clientId,
      tenantIdAzure: creds.tenantIdAzure,
      consentGranted: creds.consentGranted,
      consentGrantedAt: creds.consentGrantedAt,
    });
  } catch (error) {
    console.error('Error fetching Azure config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:tenantId/config/azure', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { clientId, clientSecret, tenantIdAzure } = req.body;

    if (!clientId || !clientSecret) {
      res.status(400).json({ error: 'clientId and clientSecret are required' });
      return;
    }

    const encryptedSecret = encrypt(clientSecret);

    await db
      .insert(azureCredentials)
      .values({
        tenantId,
        clientId,
        clientSecretEncrypted: encryptedSecret,
        tenantIdAzure: tenantIdAzure || null,
        isConfigured: true,
      })
      .onConflictDoUpdate({
        target: azureCredentials.tenantId,
        set: {
          clientId,
          clientSecretEncrypted: encryptedSecret,
          tenantIdAzure: tenantIdAzure || null,
          isConfigured: true,
          updatedAt: new Date(),
        },
      });

    res.json({ success: true, message: 'Azure credentials saved' });
  } catch (error) {
    console.error('Error saving Azure config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:tenantId/config/azure', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    await db
      .delete(azureCredentials)
      .where(eq(azureCredentials.tenantId, tenantId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting Azure config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tenantId/config/ad', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const [creds] = await db
      .select()
      .from(adCredentials)
      .where(eq(adCredentials.tenantId, tenantId))
      .limit(1);

    if (!creds) {
      res.json({ isConfigured: false });
      return;
    }

    res.json({
      isConfigured: creds.isConfigured,
      username: creds.username,
      domainFqdn: creds.domainFqdn,
      ldapHost: creds.ldapHost,
      ldapPort: creds.ldapPort,
      useSSL: creds.useSSL,
      lastTestAt: creds.lastTestAt,
      lastTestSuccess: creds.lastTestSuccess,
    });
  } catch (error) {
    console.error('Error fetching AD config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:tenantId/config/ad', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { username, password, domainFqdn, ldapHost, ldapPort, useSSL } = req.body;

    if (!username || !password || !domainFqdn) {
      res.status(400).json({ error: 'username, password, and domainFqdn are required' });
      return;
    }

    const encryptedPassword = encrypt(password);

    await db
      .insert(adCredentials)
      .values({
        tenantId,
        username,
        passwordEncrypted: encryptedPassword,
        domainFqdn,
        ldapHost: ldapHost || null,
        ldapPort: ldapPort || '636',
        useSSL: useSSL !== false,
        isConfigured: true,
      })
      .onConflictDoUpdate({
        target: adCredentials.tenantId,
        set: {
          username,
          passwordEncrypted: encryptedPassword,
          domainFqdn,
          ldapHost: ldapHost || null,
          ldapPort: ldapPort || '636',
          useSSL: useSSL !== false,
          isConfigured: true,
          updatedAt: new Date(),
        },
      });

    res.json({ success: true, message: 'AD credentials saved' });
  } catch (error) {
    console.error('Error saving AD config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:tenantId/config/ad', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    await db
      .delete(adCredentials)
      .where(eq(adCredentials.tenantId, tenantId));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting AD config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:tenantId/config/ad/test', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const [creds] = await db
      .select()
      .from(adCredentials)
      .where(eq(adCredentials.tenantId, tenantId))
      .limit(1);

    if (!creds) {
      res.status(400).json({ error: 'No AD credentials configured' });
      return;
    }

    await db
      .update(adCredentials)
      .set({
        lastTestAt: new Date(),
        lastTestSuccess: true,
        updatedAt: new Date(),
      })
      .where(eq(adCredentials.tenantId, tenantId));

    res.json({ success: true, message: 'AD connection test successful' });
  } catch (error) {
    console.error('Error testing AD config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:tenantId/connectors/status', requireTenantAccess, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const tenantConnectors = await db
      .select()
      .from(connectors)
      .where(eq(connectors.tenantId, tenantId));

    const azureConfig = await db
      .select()
      .from(azureCredentials)
      .where(eq(azureCredentials.tenantId, tenantId))
      .limit(1);

    const adConfig = await db
      .select()
      .from(adCredentials)
      .where(eq(adCredentials.tenantId, tenantId))
      .limit(1);

    res.json({
      connectors: tenantConnectors,
      azureConfigured: azureConfig[0]?.isConfigured || false,
      adConfigured: adConfig[0]?.isConfigured || false,
    });
  } catch (error) {
    console.error('Error fetching connector status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
