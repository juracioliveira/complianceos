# ComplianceOS

ComplianceOS is a premium, enterprise-grade Compliance and Governance platform designed for high-stakes risk management, KYC/KYB automation, and regulatory monitoring.

## 🚀 Vision

A "Deep Tech" approach to compliance, combining a sleek, professional interface with robust data engineering to provide real-time status of entities, sanctions, and PEP (Politically Exposed Persons) relations.

## 🛠 Features

- **KYB/CNPJ Engine**: Deep integration with Receita Federal do Brasil (RFB) data, with internal synchronization and historical analysis.
- **Sanctions & PEP Screener**: Automated screening against international sanctions lists and Brazilian PEP records.
- **Checklist Engine**: Flexible Scoring & Checklist system to automate audit trails and regulatory reviews.
- **Premium Dashboard**: High-tech visualization of risk distribution and compliance KPIs.
- **Export System**: Generation of professional PDF/JSON reports for audit purposes.

## 🏗 Architecture

The platform follows a modern microservices architecture managed with **Turborepo**:

- **apps/web**: Next.js 14 frontend using Tailwind CSS and the "Deep Tech" design system.
- **apps/api**: Fastify-based backend overseeing core compliance logic.
- **apps/cnpj-service**: Dedicated service for RFB data ETL and storage.
- **apps/sanctions-service**: Microservice for real-time and scheduled sanctions screening.
- **packages/ui**: Shared React components.
- **packages/database**: Centralized Drizzle ORM schemas and migrations.

## 🎨 Design System

Aligned with a premium "Deep Tech" aesthetic:
- **Foundations**: DM Serif Display (Titles), IBM Plex Sans (UI), JetBrains Mono (Technical data).
- **Effects**: Glassmorphism, cyan radial glows, and high-contrast dark theme.

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for database and redis)

### Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Setup environment variables:
   Check `.env.example` in each app.

3. Run development mode:
   ```bash
   pnpm dev
   ```

## 🔒 Security & Compliance

ComplianceOS is built with security-first principles, incorporating:
- Multi-tenancy with strict RLS (Row Level Security).
- Robust JWT authentication.
- AES-256 encryption for sensitive metadata.

---

© 2026 Chuangxin Tecnologia. Proprietary and Confidential.
