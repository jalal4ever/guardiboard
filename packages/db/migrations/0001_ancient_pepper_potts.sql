CREATE TABLE IF NOT EXISTS "ad_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_encrypted" text NOT NULL,
	"domain_fqdn" varchar(255) NOT NULL,
	"ldap_host" varchar(255),
	"ldap_port" varchar(10),
	"use_ssl" boolean DEFAULT true NOT NULL,
	"is_configured" boolean DEFAULT false NOT NULL,
	"last_test_at" timestamp,
	"last_test_success" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ad_credentials_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "azure_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"client_id" varchar(100) NOT NULL,
	"client_secret_encrypted" text NOT NULL,
	"tenant_id_azure" varchar(50),
	"certificate_path" varchar(500),
	"certificate_password_encrypted" text,
	"is_configured" boolean DEFAULT false NOT NULL,
	"consent_granted" boolean DEFAULT false NOT NULL,
	"consent_granted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "azure_credentials_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "description" varchar(500);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ad_credentials_tenant" ON "ad_credentials" ("tenant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_azure_credentials_tenant" ON "azure_credentials" ("tenant_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ad_credentials" ADD CONSTRAINT "ad_credentials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "azure_credentials" ADD CONSTRAINT "azure_credentials_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
