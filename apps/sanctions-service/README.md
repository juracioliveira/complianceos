# Sanctions Screening API
Microserviço responsável por validar entidades (Pessoas e Empresas) contra fontes massivas e gratuitas de sanções internacionais.

## Tecnologias e Arquitetura

- **Node.js 20** + **Fastify** para altíssimo rendimento 
- **PostgreSQL com pg_trgm e unaccent** (Matching de similaridade Fuzzy/Trigram embutido nativamente no BD)
- **Redis & BullMQ** (Para orquestração diária dos dowloads pesados do OFAC, ONU, etc)
- **Drizzle ORM** (TypeScript type-safe schema)
- **Fast XML Parser** (Extração otimizada)

## Como Rodar Localmente

1. Configuração do ambiente e inicialização do banco:
```bash
cp .env.example .env
docker-compose up -d
```

2. Gere e aplique as Migrations:
```bash
pnpm install
pnpm db:migrate
```

3. Inicie a API e os Workers de background (na própria app pelo tsx ou transpilação):
```bash
pnpm dev
# O dev server conectará no scheduler e iniciará as triggers baseadas no Cron.
```

## Como popular os dados pela primeira vez manualmente?

Se não quiser esperar o CRON inicializar, basta forçar a Trigger (Como Administrador):
```bash
curl -X POST http://localhost:4002/sync/trigger \
  -H "x-admin-key: troque-em-producao" \
  -H "Content-Type: application/json" \
  -d '{"sources": ["OFAC_SDN", "UN_SC"]}'
```

## Endpoints Principais (Exemplos)

### 1. Screening (O motor primário)
```bash
curl -X POST http://localhost:4002/screen \
  -H "x-api-key: troque-em-producao" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vladimir Putin",
    "sources": ["OFAC_SDN", "UN_SC", "EU_FSF"],
    "min_score": 70,
    "tenant_id": "11111111-1111-1111-1111-111111111111",
    "user_id": "22222222-2222-2222-2222-222222222222"
  }'
```

### 2. Status Geral das Fontes
```bash
curl http://localhost:4002/health/sources -H "x-api-key: troque-em-producao"
```
