import { pgTable, uuid, varchar, timestamp, text, boolean, jsonb, index, pgEnum } from 'drizzle-orm/pg-core';

export const scopeEnum = pgEnum('scope', ['hybrid', 'ad', 'm365']);
export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'suspended', 'pending']);
export const roleEnum = pgEnum('role', ['platform_admin', 'tenant_admin', 'analyst', 'viewer']);
export const connectorTypeEnum = pgEnum('connector_type', ['microsoft_graph', 'ad_collector']);
export const connectorStatusEnum = pgEnum('connector_status', ['pending', 'authorized', 'collecting', 'error', 'disabled']);
export const findingSeverityEnum = pgEnum('finding_severity', ['critical', 'high', 'medium', 'low', 'info']);
export const findingStatusEnum = pgEnum('finding_status', ['open', 'in_progress', 'resolved', 'accepted_risk']);
export const jobStatusEnum = pgEnum('job_status', ['pending', 'running', 'completed', 'failed']);

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 63 }).notNull().unique(),
  status: tenantStatusEnum('status').notNull().default('pending'),
  scope: scopeEnum('scope').notNull().default('hybrid'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('idx_tenants_slug').on(table.slug),
}));

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull().default('viewer'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantUserIdx: index('idx_memberships_tenant_user').on(table.tenantId, table.userId),
  uniqueTenantUser: { columns: [table.tenantId, table.userId], unique: true },
}));

export const connectors = pgTable('connectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  type: connectorTypeEnum('type').notNull(),
  status: connectorStatusEnum('status').notNull().default('pending'),
  config: jsonb('config').notNull().default({}),
  lastCollectedAt: timestamp('last_collected_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantTypeIdx: index('idx_connectors_tenant_type').on(table.tenantId, table.type),
}));

export const graphConnections = pgTable('graph_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id').notNull().references(() => connectors.id, { onDelete: 'cascade' }),
  tenantDomain: varchar('tenant_domain', { length: 255 }),
  accessTokenEncrypted: text('access_token_encrypted'),
  refreshTokenEncrypted: text('refresh_token_encrypted'),
  tokenExpiresAt: timestamp('token_expires_at'),
  scopes: text('scopes').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  connectorIdx: index('idx_graph_connections_connector').on(table.connectorId),
}));

export const collectors = pgTable('collectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id').notNull().references(() => connectors.id, { onDelete: 'cascade' }),
  collectorId: varchar('collector_id', { length: 100 }).notNull().unique(),
  forestId: varchar('forest_id', { length: 255 }),
  domainFqdn: varchar('domain_fqdn', { length: 255 }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at'),
  status: connectorStatusEnum('status').notNull().default('pending'),
  version: varchar('version', { length: 50 }),
}, (table) => ({
  tenantIdx: index('idx_collectors_tenant').on(table.tenantId),
  collectorIdIdx: index('idx_collectors_collector_id').on(table.collectorId),
}));

export const collectionJobs = pgTable('collection_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id').notNull().references(() => connectors.id, { onDelete: 'cascade' }),
  collectorId: uuid('collector_id').references(() => collectors.id, { onDelete: 'set null' }),
  status: jobStatusEnum('status').notNull().default('pending'),
  resourceType: varchar('resource_type', { length: 100 }),
  itemsCollected: boolean('items_collected').default(false),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  error: text('error'),
}, (table) => ({
  connectorIdx: index('idx_collection_jobs_connector').on(table.connectorId),
  statusIdx: index('idx_collection_jobs_status').on(table.status),
}));

export const collectionCheckpoints = pgTable('collection_checkpoints', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id').notNull().references(() => connectors.id, { onDelete: 'cascade' }),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  checkpoint: text('checkpoint'),
  lastCollectedAt: timestamp('last_collected_at').notNull().defaultNow(),
}, (table) => ({
  uniqueCheckpoint: { columns: [table.tenantId, table.connectorId, table.resourceType], unique: true },
}));

export const findings = pgTable('findings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  scope: scopeEnum('scope').notNull(),
  severity: findingSeverityEnum('severity').notNull(),
  status: findingStatusEnum('status').notNull().default('open'),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  source: connectorTypeEnum('source').notNull(),
  assetType: varchar('asset_type', { length: 100 }).notNull(),
  assetId: varchar('asset_id', { length: 500 }).notNull(),
  recommendation: text('recommendation'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantSeverityIdx: index('idx_findings_tenant_severity').on(table.tenantId, table.severity),
  statusIdx: index('idx_findings_status').on(table.status),
}));

export const rawDocuments = pgTable('raw_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  connectorId: uuid('connector_id').notNull().references(() => connectors.id, { onDelete: 'cascade' }),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  graphId: varchar('graph_id', { length: 500 }),
  etag: varchar('etag', { length: 100 }),
  payload: jsonb('payload').notNull(),
  collectedAt: timestamp('collected_at').notNull().defaultNow(),
}, (table) => ({
  tenantResourceIdx: index('idx_raw_documents_tenant_resource').on(table.tenantId, table.resourceType),
  graphIdIdx: index('idx_raw_documents_graph_id').on(table.graphId),
}));

export const identityUsers = pgTable('identity_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  source: connectorTypeEnum('source').notNull(),
  sourceId: varchar('source_id', { length: 500 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  userPrincipalName: varchar('user_principal_name', { length: 500 }),
  accountEnabled: boolean('account_enabled'),
  createdDateTime: timestamp('created_date_time'),
  userType: varchar('user_type', { length: 50 }),
  onPremisesSyncEnabled: boolean('on_premises_sync_enabled'),
  raw: jsonb('raw'),
  lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
}, (table) => ({
  tenantSourceIdx: index('idx_identity_users_tenant_source').on(table.tenantId, table.source),
  uniqueSource: { columns: [table.tenantId, table.source, table.sourceId], unique: true },
}));

export const identityGroups = pgTable('identity_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  source: connectorTypeEnum('source').notNull(),
  sourceId: varchar('source_id', { length: 500 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  groupTypes: text('group_types').array(),
  securityEnabled: boolean('security_enabled'),
  mailEnabled: boolean('mail_enabled'),
  raw: jsonb('raw'),
  lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
}, (table) => ({
  tenantSourceIdx: index('idx_identity_groups_tenant_source').on(table.tenantId, table.source),
  uniqueSource: { columns: [table.tenantId, table.source, table.sourceId], unique: true },
}));

export const secureScores = pgTable('secure_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  score: varchar('score', { length: 50 }),
  maxScore: varchar('max_score', { length: 50 }),
  vendorName: varchar('vendor_name', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index('idx_secure_scores_tenant').on(table.tenantId),
}));

export const dashboardLayouts = pgTable('dashboard_layouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  widgets: jsonb('widgets').notNull().default([]),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  tenantUserIdx: index('idx_dashboard_layouts_tenant_user').on(table.tenantId, table.userId),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }),
  resourceId: varchar('resource_id', { length: 500 }),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  tenantActionIdx: index('idx_audit_logs_tenant_action').on(table.tenantId, table.action),
  createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
}));

export { db, client } from './client';

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Membership = typeof memberships.$inferSelect;
export type Connector = typeof connectors.$inferSelect;
export type Finding = typeof findings.$inferSelect;
export type DashboardLayout = typeof dashboardLayouts.$inferSelect;
