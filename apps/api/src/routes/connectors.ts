import { Router, Response } from 'express';
import { db, connectors, collectors, collectionJobs } from '@guardiboard/db';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

router.use(authMiddleware);

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
    
    const [connector] = await db
      .insert(connectors)
      .values({
        tenantId,
        type: 'microsoft_graph',
        status: 'pending',
      })
      .returning();

    const clientId = process.env.AZURE_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL}/api/connectors/microsoft-graph/callback`;
    const authority = `https://login.microsoftonline.com/common`;
    const consentUrl = `${authority}/adminconsent?client_id=${clientId}&redirect_uri=${redirectUri}&state=${connector.id}`;

    res.json({ 
      connectorId: connector.id,
      consentUrl 
    });
  } catch (error) {
    console.error('Error initiating Microsoft Graph authorization:', error);
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
