import { z } from 'zod';

export { encrypt, decrypt, hashPassword, verifyPassword } from './encryption';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_URL: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string(),

  SESSION_SECRET: z.string().min(32),
  SESSION_MAX_AGE: z.coerce.number().default(86400000),

  OAUTH_ISSUER: z.string().optional(),
  OAUTH_CLIENT_ID: z.string().optional(),
  OAUTH_CLIENT_SECRET: z.string().optional(),
  OAUTH_REDIRECT_URI: z.string().optional(),

  AZURE_TENANT_ID: z.string().optional(),
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  AZURE_CLIENT_CERT_PATH: z.string().optional(),
  AZURE_CLIENT_CERT_PASSWORD: z.string().optional(),

  GRAPH_API_SCOPE: z.string().default('https://graph.microsoft.com/.default'),
  GRAPH_API_BASE_URL: z.string().default('https://graph.microsoft.com/v1.0'),

  AZURE_KEY_VAULT_URL: z.string().optional(),
  AZURE_KEY_VAULT_TENANT_ID: z.string().optional(),
  AZURE_KEY_VAULT_CLIENT_ID: z.string().optional(),
  AZURE_KEY_VAULT_CLIENT_SECRET: z.string().optional(),

  COLLECTOR_ENROLLMENT_TOKEN_SECRET: z.string().min(16),
  COLLECTOR_API_URL: z.string().optional(),

  QUEUE_CONCURRENCY: z.coerce.number().default(5),
  COLLECTION_INTERVAL_MS: z.coerce.number().default(3600000),
  GRACE_PERIOD_MS: z.coerce.number().default(300000),

  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  FEATURE_AD_COLLECTION_ENABLED: z.coerce.boolean().default(true),
  FEATURE_M365_COLLECTION_ENABLED: z.coerce.boolean().default(true),
  FEATURE_HYBRID_CORRELATION: z.coerce.boolean().default(false),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  
  cached = result.data;
  return cached;
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const env = getEnv();
  const value = env[key];
  
  if (value === undefined || value === null) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}
