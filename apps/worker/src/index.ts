import { getEnv, requireEnv } from '@guardiboard/config';

async function main() {
  const env = requireEnv('COLLECTION_INTERVAL_MS');
  const concurrency = requireEnv('QUEUE_CONCURRENCY');
  
  console.log(`🚀 Guardiboard Worker starting...`);
  console.log(`Collection interval: ${env}ms`);
  console.log(`Concurrency: ${concurrency}`);
  
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Processing collection jobs...`);
  }, env);
  
  console.log('✅ Worker is running');
}

main().catch(console.error);
