# CNPJ Service - ComplianceOS

Microserviço especializado na consulta massiva e sincronização de dados de CNPJs fornecidos pela Receita Federal, focado na eliminação do uso de APIs pagas como ReceitaWS para as rotinas de KYB no ComplianceOS.

## Stack
- Node.js 20 LTS + TypeScript
- Fastify
- Drizzle ORM + PG-Copy-Streams
- PostgreSQL 16 + Redis 7

## Endpoints

1. `GET /cnpj/:cnpj`
   Busca completa de dados da empresa e QSA (Quadro Societário).
   *Header Opcional:* `x-api-key: {seu_secret}`

2. `GET /search?q={NOME}`
   Busca Full-Text via Trigrams indexados no Postgres.

3. `GET /health` e `GET /health/sync`
   Métricas de banco e status do último CronJob mensal.

## Como Iniciar

1. `docker-compose up -d` (Sobe o Redis e PG)
2. `cp .env.example .env.local`
3. `pnpm install`
4. `pnpm db:migrate` (Aplica schema no schema "cnpj_rfb")
5. `pnpm sync:run` (Baixa e Extrai os 20GB de CSV em Streams -> Isso leva de 10 a 30 mins)
6. `pnpm dev` (Inicia a API na porta 4001)

## Sincronização e ETL (Pipeline Interno)

- O arquivo `rfbFolders.ts` descobre sozinho na internet a pasta mais recente da RFB (`2026-X/`).
- O `downloader.ts` usa o pacote `got` e suporta bytes Range Resume se a conexão cair no meio dos 3GB de um ZIP.
- O `loader.ts` repassa um Pipe binário transformado (`LATIN1 -> CLEAN CSV -> STDIN`). Nada é carregado todo na RAM.
