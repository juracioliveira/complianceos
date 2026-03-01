-- Migration: 0009_create_documents.sql

CREATE TABLE documents (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  entity_id       UUID        REFERENCES entities(id),  -- null = documento corporativo do tenant
  -- Identificação
  doc_type        VARCHAR(50)  NOT NULL CHECK (doc_type IN (
                    'POLITICA_PLD', 'POLITICA_PRIVACIDADE', 'RAT', 'DPIA',
                    'PROGRAMA_INTEGRIDADE', 'CODIGO_CONDUTA', 'RELATORIO_AUDITORIA',
                    'RELATORIO_RISCO', 'RELATORIO_RAS', 'TERMO_CONSENTIMENTO'
                  )),
  title           VARCHAR(300) NOT NULL,
  version         INTEGER      NOT NULL DEFAULT 1,
  -- Armazenamento S3 (SSE-KMS)
  s3_key          VARCHAR(500) NOT NULL,
  s3_bucket       VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER,
  -- Integridade — SHA-256 do conteúdo do PDF
  content_hash    CHAR(64)     NOT NULL,
  -- Status
  status          VARCHAR(20)  NOT NULL DEFAULT 'GENERATING' CHECK (status IN (
                    'GENERATING', 'READY', 'FAILED', 'ARCHIVED'
                  )),
  -- Validade regulatória
  valid_until     TIMESTAMPTZ,
  -- Metadados de geração
  generated_by    UUID         NOT NULL REFERENCES users(id),
  generation_params JSONB      NOT NULL DEFAULT '{}',
  error_message   TEXT,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE documents IS 'Documentos regulatórios gerados (PDFs). Armazenados no S3 com SSE-KMS.';
COMMENT ON COLUMN documents.content_hash IS 'SHA-256 do conteúdo do PDF para verificação de integridade.';
COMMENT ON COLUMN documents.s3_key IS 'Chave no S3 — nunca expor diretamente; usar presigned URLs.';

CREATE INDEX idx_documents_tenant ON documents(tenant_id, doc_type, created_at DESC);
CREATE INDEX idx_documents_entity ON documents(tenant_id, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_documents_status ON documents(status) WHERE status = 'GENERATING';
CREATE INDEX idx_documents_expiring ON documents(tenant_id, valid_until) WHERE valid_until IS NOT NULL;

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_tenant_isolation ON documents
  USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID);

-- Trigger: atualizar updated_at
CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN: DROP TABLE IF EXISTS documents;
