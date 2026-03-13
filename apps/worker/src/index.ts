import { requireEnv } from '@guardiboard/config';
import { db, collectionJobs, connectors, graphConnections } from '@guardiboard/db';
import { GraphCollector, collectAllResources } from './collectors/graph';
import { acquireTokenForTenant } from './auth/msal';
import { eq, and } from 'drizzle-orm';

interface JobContext {
  jobId: string;
  tenantId: string;
  connectorId: string;
  azureTenantId: string;
}

async function getPendingJobs(): Promise<JobContext[]> {
  const pendingJobs = await db
    .select()
    .from(collectionJobs)
    .where(eq(collectionJobs.status, 'pending'))
    .limit(10);

  const jobContexts: JobContext[] = [];

  for (const job of pendingJobs) {
    const [connector] = await db
      .select()
      .from(connectors)
      .where(eq(connectors.id, job.connectorId))
      .limit(1);

    if (!connector || connector.type !== 'microsoft_graph') {
      continue;
    }

    const [graphConn] = await db
      .select()
      .from(graphConnections)
      .where(eq(graphConnections.connectorId, connector.id))
      .limit(1);

    if (!graphConn?.azureTenantId) {
      console.warn(`Connector ${connector.id} has no azureTenantId configured`);
      continue;
    }

    jobContexts.push({
      jobId: job.id,
      tenantId: job.tenantId,
      connectorId: job.connectorId,
      azureTenantId: graphConn.azureTenantId,
    });
  }

  return jobContexts;
}

async function processCollectionJob(jobContext: JobContext) {
  const { jobId, tenantId, connectorId, azureTenantId } = jobContext;

  console.log(`[${new Date().toISOString()}] Processing job ${jobId} for tenant ${tenantId}`);

  await db
    .update(collectionJobs)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(collectionJobs.id, jobId));

  try {
    const tokenResult = await acquireTokenForTenant(azureTenantId);
    console.log(`[${new Date().toISOString()}] Acquired token for tenant ${azureTenantId}`);

    const collector = new GraphCollector({
      tenantId,
      connectorId,
      accessToken: tokenResult.accessToken,
    });

    const results = await collectAllResources(collector);

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    await db
      .update(collectionJobs)
      .set({ 
        status: successCount === totalCount ? 'completed' : 'completed',
        completedAt: new Date(),
        itemsCollected: true,
      })
      .where(eq(collectionJobs.id, jobId));

    await db
      .update(graphConnections)
      .set({
        lastSuccessfulRunAt: new Date(),
        lastErrorCode: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(graphConnections.connectorId, connectorId));

    console.log(`[${new Date().toISOString()}] Job ${jobId} completed: ${successCount}/${totalCount} resources collected`);

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Job ${jobId} failed:`, error.message);

    await db
      .update(collectionJobs)
      .set({ 
        status: 'failed',
        completedAt: new Date(),
        error: error.message,
      })
      .where(eq(collectionJobs.id, jobId));

    await db
      .update(graphConnections)
      .set({
        lastErrorCode: error.code || 'UNKNOWN',
        lastErrorMessage: error.message?.substring(0, 500),
        updatedAt: new Date(),
      })
      .where(eq(graphConnections.connectorId, connectorId));
  }
}

async function processScheduledCollections() {
  console.log(`[${new Date().toISOString()}] Checking for scheduled collections...`);
  
  try {
    const authorizedConnectors = await db
      .select()
      .from(connectors)
      .where(
        and(
          eq(connectors.type, 'microsoft_graph'),
          eq(connectors.status, 'authorized')
        )
      );

    console.log(`Found ${authorizedConnectors.length} authorized Microsoft Graph connectors`);

    for (const connector of authorizedConnectors) {
      const [graphConn] = await db
        .select()
        .from(graphConnections)
        .where(eq(graphConnections.connectorId, connector.id))
        .limit(1);

      if (!graphConn?.azureTenantId) {
        continue;
      }

      const lastRun = graphConn.lastSuccessfulRunAt;
      const interval = requireEnv('COLLECTION_INTERVAL_MS');
      const shouldRun = !lastRun || (Date.now() - lastRun.getTime()) > interval;

      if (!shouldRun) {
        continue;
      }

      const existingPendingJob = await db
        .select()
        .from(collectionJobs)
        .where(
          and(
            eq(collectionJobs.connectorId, connector.id),
            eq(collectionJobs.status, 'pending')
          )
        )
        .limit(1);

      if (existingPendingJob.length > 0) {
        console.log(`Skipping connector ${connector.id} - job already pending`);
        continue;
      }

      const [job] = await db
        .insert(collectionJobs)
        .values({
          tenantId: connector.tenantId,
          connectorId: connector.id,
          status: 'pending',
          resourceType: 'scheduled',
        })
        .returning();

      console.log(`Created scheduled job ${job.id} for connector ${connector.id}`);
    }

  } catch (error) {
    console.error('Error processing scheduled collections:', error);
  }
}

async function processJobQueue() {
  const concurrency = requireEnv('QUEUE_CONCURRENCY');
  const pendingJobs = await getPendingJobs();

  const jobsToProcess = pendingJobs.slice(0, concurrency);

  console.log(`[${new Date().toISOString()}] Processing ${jobsToProcess.length} jobs (concurrency: ${concurrency})`);

  await Promise.all(
    jobsToProcess.map(job => processCollectionJob(job))
  );
}

async function main() {
  const interval = requireEnv('COLLECTION_INTERVAL_MS');
  
  console.log(`🚀 Guardiboard Worker starting...`);
  console.log(`Collection interval: ${interval}ms`);

  await processScheduledCollections();
  await processJobQueue();

  setInterval(async () => {
    try {
      await processScheduledCollections();
      await processJobQueue();
    } catch (error) {
      console.error('Error in worker loop:', error);
    }
  }, Math.min(interval, 60000));
  
  console.log('✅ Worker is running');
}

main().catch(console.error);
