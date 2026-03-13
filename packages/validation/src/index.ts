import { z } from 'zod';

export const scopeSchema = z.enum(['hybrid', 'ad', 'm365']);

export const tenantStatusSchema = z.enum(['active', 'suspended', 'pending']);

export const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/),
  scope: scopeSchema,
});

export const updateTenantSchema = createTenantSchema.partial();

export const roleSchema = z.enum(['platform_admin', 'tenant_admin', 'analyst', 'viewer']);

export const membershipSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  role: roleSchema,
  createdAt: z.date(),
});

export const connectorTypeSchema = z.enum(['microsoft_graph', 'ad_collector']);

export const connectorStatusSchema = z.enum(['pending', 'authorized', 'collecting', 'error', 'disabled']);

export const connectorSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  type: connectorTypeSchema,
  status: connectorStatusSchema,
  config: z.record(z.unknown()),
  lastCollectedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const findingSeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);

export const findingStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'accepted_risk']);

export const createFindingSchema = z.object({
  tenantId: z.string().uuid(),
  scope: scopeSchema,
  severity: findingSeveritySchema,
  status: findingStatusSchema.default('open'),
  title: z.string().min(1).max(500),
  description: z.string().max(5000),
  source: connectorTypeSchema,
  assetType: z.string().min(1).max(100),
  assetId: z.string().min(1).max(500),
  recommendation: z.string().max(2000),
});

export const updateFindingSchema = z.object({
  status: findingStatusSchema.optional(),
  severity: findingSeveritySchema.optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  recommendation: z.string().max(2000).optional(),
});

export const widgetTypeSchema = z.enum([
  'score_overview',
  'score_ad',
  'score_m365',
  'findings_list',
  'findings_by_severity',
  'assets_list',
  'connectors_status',
  'posture_timeline',
]);

export const widgetConfigSchema = z.object({
  id: z.string().uuid(),
  type: widgetTypeSchema,
  title: z.string().min(1).max(200),
  enabled: z.boolean(),
  config: z.record(z.unknown()),
});

export const dashboardLayoutSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  widgets: z.array(widgetConfigSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createDashboardSchema = z.object({
  name: z.string().min(1).max(200),
  widgets: z.array(widgetConfigSchema),
});

export const updateDashboardSchema = createDashboardSchema.partial();

export const enrollmentTokenSchema = z.object({
  token: z.string().min(16),
  tenantId: z.string().uuid(),
  collectorType: connectorTypeSchema,
  expiresAt: z.date(),
});
