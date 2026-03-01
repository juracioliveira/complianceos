CREATE TABLE IF NOT EXISTS "sanctions_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"source_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"name_primary" text NOT NULL,
	"names_aliases" text[] DEFAULT '{}',
	"name_normalized" text NOT NULL,
	"dob" date,
	"dob_raw" text,
	"nationalities" text[] DEFAULT '{}',
	"id_documents" jsonb DEFAULT '[]',
	"addresses" jsonb DEFAULT '[]',
	"programs" text[] DEFAULT '{}',
	"sanctions_type" text,
	"remarks" text,
	"listed_at" date,
	"delisted_at" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"raw_data" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sanctions_sync_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"status" text NOT NULL,
	"iniciado_em" timestamp with time zone DEFAULT now(),
	"concluido_em" timestamp with time zone,
	"entities_before" integer,
	"entities_after" integer,
	"entities_added" integer,
	"entities_removed" integer,
	"etag" text,
	"erro_msg" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "screening_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"queried_by" uuid NOT NULL,
	"query_name" text NOT NULL,
	"query_document" text,
	"query_type" text NOT NULL,
	"hits" jsonb DEFAULT '[]' NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"highest_score" integer DEFAULT 0 NOT NULL,
	"risk_level" text NOT NULL,
	"screened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sources_checked" text[] NOT NULL,
	"latency_ms" integer
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sanctions_unique_source_id" ON "sanctions_entities" ("source","source_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sanctions_name_fts" ON "sanctions_entities" ("name_primary");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sanctions_name_trgm" ON "sanctions_entities" ("name_normalized");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sanctions_source" ON "sanctions_entities" ("source","is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sanctions_active" ON "sanctions_entities" ("is_active","entity_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sanctions_synced" ON "sanctions_entities" ("last_synced_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_screening_tenant" ON "screening_results" ("tenant_id","screened_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_screening_risk" ON "screening_results" ("risk_level","screened_at");