import { Router, Response } from 'express';
import { db, connectors, collectors, collectionJobs, graphConnections } from '@guardiboard/db';
import { authMiddleware, requireTenantAccess, type AuthRequest } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';
import { requireEnv } from '@guardiboard/config';
import crypto from 'crypto';

const router = Router();

router.use(authMiddleware);
router.use(requireTenantAccess);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    
    const result = await db
      .select()
      .from(connectors)
      .where(eq(connectors.tenantId, tenantId))
      .orderBy(desc(connectors.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching connectors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:connectorId', async (req: AuthRequest, res: Response) => {
  try {
    const { connectorId } = req.params;
    const tenantId = req.tenantId!;
    
    const [connector] = await db
      .select()
      .from(connectors)
      .where(
        and(
          eq(connectors.id, connectorId),
          eq(connectors.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!connector) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(connector);
  } catch (error) {
    console.error('Error fetching connector:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/microsoft-graph/authorize', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const clientId = requireEnv('AZURE_CLIENT_ID');
    const appUrl = requireEnv('APP_URL');
    const redirectUri = `${appUrl}/api/connectors/microsoft-graph/callback`;
    
    const state = crypto.randomBytes(16).toString('hex');
    
    const existingPending = await db
      .select()
      .from(connectors)
      .where(
        and(
          eq(connectors.tenantId, tenantId),
          eq(connectors.type, 'microsoft_graph'),
          eq(connectors.status, 'pending')
        )
      )
      .limit(1);

    let connector;
    if (existingPending.length > 0) {
      connector = existingPending[0];
    } else {
      [connector] = await db
        .insert(connectors)
        .values({
          tenantId,
          type: 'microsoft_graph',
          status: 'pending',
          config: { consentState: state },
        })
        .returning();
    }

    const consentUrl = `https://login.microsoftonline.com/common/adminconsent?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${connector.id}:${state}`;

    res.json({ 
      connectorId: connector.id,
      consentUrl,
      message: 'Open this URL in a browser where you are an Azure AD administrator'
    });
  } catch (error) {
    console.error('Error initiating Microsoft Graph authorization:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/microsoft-graph/callback', async (req: AuthRequest, res: Response) => {
  try {
    const { state, tenant: azureTenantId, admin_consent } = req.query;

    if (!state || typeof state !== 'string') {
      res.status(400).json({ error: 'Missing state parameter' });
      return;
    }

    const [connectorId, expectedState] = state.split(':');
    if (!connectorId) {
      res.status(400).json({ error: 'Invalid state format' });
      return;
    }

    const [connector] = await db
      .select()
      .from(connectors)
      .where(eq(connectors.id, connectorId))
      .limit(1);

    if (!connector) {
      res.status(404).json({ error: 'Connector not found' });
      return;
    }

    const config = (connector.config || {}) as Record<string, unknown>;
    if (config.consentState !== expectedState) {
      res.status(400).json({ error: 'Invalid state - possible CSRF attack' });
      return;
    }

    if (admin_consent !== 'True') {
      await db
        .update(connectors)
        .set({ status: 'error', config: { ...config, consentError: 'Admin consent denied' } })
        .where(eq(connectors.id, connectorId));
      
      res.redirect(`${requireEnv('APP_URL')}/connectors?error=consent_denied`);
      return;
    }

    if (!azureTenantId || typeof azureTenantId !== 'string') {
      res.status(400).json({ error: 'Missing tenant ID in response' });
      return;
    }

    await db
      .update(connectors)
      .set({ 
        status: 'authorized',
        config: { ...config, azureTenantId }
      })
      .where(eq(connectors.id, connectorId));

    await db
      .insert(graphConnections)
      .values({
        tenantId: connector.tenantId,
        connectorId: connector.id,
        tenantDomain: `${azureTenantId}.onmicrosoft.com`,
        scopes: [
          'Organization.Read.All',
          'User.Read.All',
          'Group.Read.All',
          'RoleManagement.Read.Directory',
          'Policy.Read.All',
          'Security.Read.All'
        ],
      })
      .onConflictDoNothing();

    res.redirect(`${requireEnv('APP_URL')}/connectors?success=m365_connected`);
  } catch (error) {
    console.error('Error handling Microsoft Graph callback:', error);
    res.redirect(`${requireEnv('APP_URL')}/connectors?error=callback_failed`);
  }
});

router.post('/microsoft-graph/connect', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { azureTenantId } = req.body;

    if (!azureTenantId) {
      res.status(400).json({ error: 'azureTenantId is required' });
      return;
    }

    const [connector] = await db
      .insert(connectors)
      .values({
        tenantId,
        type: 'microsoft_graph',
        status: 'authorized',
        config: { azureTenantId, connectedAt: new Date().toISOString() },
      })
      .returning();

    await db
      .insert(graphConnections)
      .values({
        tenantId,
        connectorId: connector.id,
        tenantDomain: `${azureTenantId}.onmicrosoft.com`,
        scopes: [
          'Organization.Read.All',
          'User.Read.All',
          'Group.Read.All',
          'RoleManagement.Read.Directory',
          'Policy.Read.All',
          'Security.Read.All'
        ],
      })
      .onConflictDoNothing();

    res.status(201).json({ 
      connectorId: connector.id,
      message: 'Connector configured successfully'
    });
  } catch (error) {
    console.error('Error connecting Microsoft Graph:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:connectorId', async (req: AuthRequest, res: Response) => {
  try {
    const { connectorId } = req.params;
    const tenantId = req.tenantId!;

    const [deleted] = await db
      .delete(connectors)
      .where(
        and(
          eq(connectors.id, connectorId),
          eq(connectors.tenantId, tenantId)
        )
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: 'Connector not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting connector:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/ad-collector/enroll', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { collectorId, domainFqdn, forestId } = req.body;

    const [connector] = await db
      .insert(connectors)
      .values({
        tenantId,
        type: 'ad_collector',
        status: 'authorized',
      })
      .returning();

    await db.insert(collectors).values({
      tenantId,
      connectorId: connector.id,
      collectorId,
      domainFqdn,
      forestId,
      status: 'collecting',
    });

    res.status(201).json({ 
      connectorId: connector.id,
      message: 'Collector enrolled successfully' 
    });
  } catch (error) {
    console.error('Error enrolling collector:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:connectorId/jobs', async (req: AuthRequest, res: Response) => {
  try {
    const { connectorId } = req.params;
    const tenantId = req.tenantId!;
    
    const jobs = await db
      .select()
      .from(collectionJobs)
      .where(
        and(
          eq(collectionJobs.connectorId, connectorId),
          eq(collectionJobs.tenantId, tenantId)
        )
      )
      .orderBy(desc(collectionJobs.startedAt))
      .limit(20);

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching connector jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:connectorId/collect', async (req: AuthRequest, res: Response) => {
  try {
    const { connectorId } = req.params;
    const tenantId = req.tenantId!;
    
    const [job] = await db
      .insert(collectionJobs)
      .values({
        tenantId,
        connectorId,
        status: 'pending',
        resourceType: 'manual',
      })
      .returning();

    res.status(202).json({ 
      jobId: job.id,
      message: 'Collection job queued' 
    });
  } catch (error) {
    console.error('Error queueing collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
