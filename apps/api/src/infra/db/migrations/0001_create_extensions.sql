-- Migration: 0001_create_extensions.sql
-- Extensões PostgreSQL necessárias para ComplianceOS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- busca full-text por CNPJ, nome
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- índices GIN para JSONB

-- Comentários para auditoria
COMMENT ON EXTENSION pgcrypto IS 'Funções criptográficas: UUID, hash, crypt';
COMMENT ON EXTENSION pg_trgm IS 'Busca por similaridade de texto (nome de entidades)';
COMMENT ON EXTENSION btree_gin IS 'Índices GIN para colunas JSONB';

-- DOWN: DROP EXTENSION IF EXISTS btree_gin; DROP EXTENSION IF EXISTS pg_trgm; DROP EXTENSION IF EXISTS pgcrypto;
