-- Migration: 0002_create_roles.sql
-- Roles do PostgreSQL para isolamento de privilégios

-- Role da aplicação — runtime, sem DDL, INSERT ONLY em audit_events
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'compliance_app') THEN
    CREATE ROLE compliance_app WITH LOGIN PASSWORD 'app_password_dev';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE "db-api-complianceos" TO compliance_app;
GRANT USAGE ON SCHEMA public TO compliance_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO compliance_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO compliance_app;

-- Role de migrations — CI/CD pipeline, acesso total DDL
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'compliance_migrator') THEN
    CREATE ROLE compliance_migrator WITH LOGIN PASSWORD 'migrator_password_dev' CREATEDB;
  END IF;
END
$$;

GRANT ALL PRIVILEGES ON SCHEMA public TO compliance_migrator;

-- Role de read-only — BI, dashboards internos, auditores externos
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'compliance_reader') THEN
    CREATE ROLE compliance_reader WITH LOGIN PASSWORD 'reader_password_dev';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE "db-api-complianceos" TO compliance_reader;
GRANT USAGE ON SCHEMA public TO compliance_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO compliance_reader;

-- DOWN:
-- DROP ROLE IF EXISTS compliance_reader;
-- DROP ROLE IF EXISTS compliance_migrator;
-- DROP ROLE IF EXISTS compliance_app;
