import { requireEnv } from '@guardiboard/config';
import { db, collectionJobs } from '@guardiboard/db';
import { getActiveConnectors } from './collectors/graph';
import { eq } from 'drizzle-orm';

async function processCollectionJob(jobId: string) {
  const [job] = await db
    .select()
    .from(collectionJobs)
    .where(eq(collectionJobs.id, jobId))
    .limit(1);

  if (!job) {
    console.error(`Job ${jobId} not found`);
    return;
  }

  await db
    .update(collectionJobs)
    .set({ status: 'running', startedAt: new Date() })
    .where(eq(collectionJobs.id, jobId));

  console.log(`Processing job ${jobId} for connector ${job.connectorId}`);
}

async function processConnectorCollections() {
  console.log(`[${new Date().toISOString()}] Checking for active connectors...`);
  
  try {
    const activeConnectors = await getActiveConnectors();
    console.log(`Found ${activeConnectors.length} active connectors`);
  } catch (error) {
    console.error('Error fetching connectors:', error);
  }
}

async function main() {
  const interval = requireEnv('COLLECTION_INTERVAL_MS');
  const concurrency = requireEnv('QUEUE_CONCURRENCY');
  
  console.log(`🚀 Guardiboard Worker starting...`);
  console.log(`Collection interval: ${interval}ms`);
  console.log(`Concurrency: ${concurrency}`);

  processConnectorCollections();

  setInterval(() => {
    processConnectorCollections();
  }, interval);
  
  console.log('✅ Worker is running');
}

main().catch(console.error);
