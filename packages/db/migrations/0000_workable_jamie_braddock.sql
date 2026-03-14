DO $$ BEGIN
 CREATE TYPE "connector_status" AS ENUM('pending', 'authorized', 'collecting', 'error', 'disabled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "connector_type" AS ENUM('microsoft_graph', 'ad_collector');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "finding_severity" AS ENUM('critical', 'high', 'medium', 'low', 'info');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "finding_status" AS ENUM('open', 'in_progress', 'resolved', 'accepted_risk');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "job_status" AS ENUM('pending', 'running', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('platform_admin', 'tenant_admin', 'analyst', 'viewer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "scope" AS ENUM('hybrid', 'ad', 'm365');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tenant_status" AS ENUM('active', 'suspended', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100),
	"resource_id" varchar(500),
	"metadata" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection_checkpoints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connector_id" uuid NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"checkpoint" text,
	"last_collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collection_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connector_id" uuid NOT NULL,
	"collector_id" uuid,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"resource_type" varchar(100),
	"items_collected" boolean DEFAULT false,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"error" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connector_id" uuid NOT NULL,
	"collector_id" varchar(100) NOT NULL,
	"forest_id" varchar(255),
	"domain_fqdn" varchar(255),
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp,
	"status" "connector_status" DEFAULT 'pending' NOT NULL,
	"version" varchar(50),
	CONSTRAINT "collectors_collector_id_unique" UNIQUE("collector_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "connectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"type" "connector_type" NOT NULL,
	"status" "connector_status" DEFAULT 'pending' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_collected_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_layouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(200) NOT NULL,
	"widgets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"scope" "scope" NOT NULL,
	"severity" "finding_severity" NOT NULL,
	"status" "finding_status" DEFAULT 'open' NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"source" "connector_type" NOT NULL,
	"asset_type" varchar(100) NOT NULL,
	"asset_id" varchar(500) NOT NULL,
	"recommendation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "graph_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connector_id" uuid NOT NULL,
	"azure_tenant_id" varchar(50),
	"tenant_domain" varchar(255),
	"consent_status" varchar(20) DEFAULT 'pending',
	"consent_granted_at" timestamp,
	"access_token_encrypted" text,
	"refresh_token_encrypted" text,
	"token_expires_at" timestamp,
	"scopes" text[],
	"last_successful_run_at" timestamp,
	"last_error_code" varchar(50),
	"last_error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "identity_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"source" "connector_type" NOT NULL,
	"source_id" varchar(500) NOT NULL,
	"display_name" varchar(255),
	"group_types" text[],
	"security_enabled" boolean,
	"mail_enabled" boolean,
	"raw" jsonb,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "identity_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"source" "connector_type" NOT NULL,
	"source_id" varchar(500) NOT NULL,
	"display_name" varchar(255),
	"user_principal_name" varchar(500),
	"account_enabled" boolean,
	"created_date_time" timestamp,
	"user_type" varchar(50),
	"on_premises_sync_enabled" boolean,
	"raw" jsonb,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "raw_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"connector_id" uuid NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"graph_id" varchar(500),
	"etag" varchar(100),
	"payload" jsonb NOT NULL,
	"collected_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "secure_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"score" varchar(50),
	"max_score" varchar(50),
	"vendor_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(63) NOT NULL,
	"status" "tenant_status" DEFAULT 'pending' NOT NULL,
	"scope" "scope" DEFAULT 'hybrid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_tenant_action" ON "audit_logs" ("tenant_id","action");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collection_jobs_connector" ON "collection_jobs" ("connector_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collection_jobs_status" ON "collection_jobs" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collectors_tenant" ON "collectors" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_collectors_collector_id" ON "collectors" ("collector_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_connectors_tenant_type" ON "connectors" ("tenant_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dashboard_layouts_tenant_user" ON "dashboard_layouts" ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_findings_tenant_severity" ON "findings" ("tenant_id","severity");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_findings_status" ON "findings" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_graph_connections_connector" ON "graph_connections" ("connector_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_graph_connections_azure_tenant" ON "graph_connections" ("azure_tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_identity_groups_tenant_source" ON "identity_groups" ("tenant_id","source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_identity_users_tenant_source" ON "identity_users" ("tenant_id","source");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_memberships_tenant_user" ON "memberships" ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_raw_documents_tenant_resource" ON "raw_documents" ("tenant_id","resource_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_raw_documents_graph_id" ON "raw_documents" ("graph_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_secure_scores_tenant" ON "secure_scores" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_tenants_slug" ON "tenants" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_checkpoints" ADD CONSTRAINT "collection_checkpoints_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_checkpoints" ADD CONSTRAINT "collection_checkpoints_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collection_jobs" ADD CONSTRAINT "collection_jobs_collector_id_collectors_id_fk" FOREIGN KEY ("collector_id") REFERENCES "collectors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectors" ADD CONSTRAINT "collectors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "collectors" ADD CONSTRAINT "collectors_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "connectors" ADD CONSTRAINT "connectors_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "findings" ADD CONSTRAINT "findings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_connections" ADD CONSTRAINT "graph_connections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "graph_connections" ADD CONSTRAINT "graph_connections_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "identity_groups" ADD CONSTRAINT "identity_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "identity_users" ADD CONSTRAINT "identity_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "raw_documents" ADD CONSTRAINT "raw_documents_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "raw_documents" ADD CONSTRAINT "raw_documents_connector_id_connectors_id_fk" FOREIGN KEY ("connector_id") REFERENCES "connectors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "secure_scores" ADD CONSTRAINT "secure_scores_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
