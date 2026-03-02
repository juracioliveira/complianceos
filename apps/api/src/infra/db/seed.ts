import pg from 'pg'
import { hash } from '@node-rs/argon2'

const DEV_DB_URL =
  process.env['DATABASE_MIGRATOR_URL'] ?? process.env['DATABASE_URL'] ?? ''

async function seed(): Promise<void> {
  const client = new pg.Client({ connectionString: DEV_DB_URL })
  await client.connect()
  console.log('🌱 Iniciando seed de dados de desenvolvimento...\n')

  try {
    await client.query('BEGIN')

    // ─── Tenants ───────────────────────────────────────────────────────────────
    const { rows: [tenantA] } = await client.query<{ id: string }>(`
      INSERT INTO tenants (name, cnpj, plan, status, billing_email, settings)
      VALUES (
        'Acme Fintech Ltda',
        '12345678000195',
        'PROFESSIONAL',
        'ACTIVE',
        'compliance@acme-fintech.dev',
        '{"modules":["PLD_FT","LGPD","ANTICORRUPCAO"],"maxUsers":20,"ssoEnabled":false,"notificationEmail":"compliance@acme-fintech.dev","riskThresholds":{"high":60,"critical":30}}'
      )
      ON CONFLICT (cnpj) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `)

    const { rows: [tenantB] } = await client.query<{ id: string }>(`
      INSERT INTO tenants (name, cnpj, plan, status, billing_email, settings)
      VALUES (
        'Beta Cooperativa de Crédito',
        '98765432000187',
        'STARTER',
        'ACTIVE',
        'ti@beta-coop.dev',
        '{"modules":["PLD_FT"],"maxUsers":5,"ssoEnabled":false,"notificationEmail":null,"riskThresholds":{"high":60,"critical":30}}'
      )
      ON CONFLICT (cnpj) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `)

    console.log(`  ✅ Tenants: ${tenantA!.id} (Acme), ${tenantB!.id} (Beta)`)

    // ─── Senhas hasheadas ──────────────────────────────────────────────────────
    const passwordHash = await hash('Senha@Compliance2026', {
      algorithm: 1, // Argon2id
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    })

    // ─── Usuários — Tenant A (Acme Fintech) ───────────────────────────────────
    const { rows: [adminA] } = await client.query<{ id: string }>(`
      INSERT INTO users (tenant_id, email, name, password_hash, role, status)
      VALUES ($1, 'admin@acme-fintech.dev', 'Admin Acme', $2, 'ADMIN', 'ACTIVE')
      ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [tenantA!.id, passwordHash])

    const { rows: [ccoA] } = await client.query<{ id: string }>(`
      INSERT INTO users (tenant_id, email, name, password_hash, role, status)
      VALUES ($1, 'cco@acme-fintech.dev', 'Maria Silva (CCO)', $2, 'COMPLIANCE_OFFICER', 'ACTIVE')
      ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [tenantA!.id, passwordHash])

    await client.query(`
      INSERT INTO users (tenant_id, email, name, password_hash, role, status)
      VALUES ($1, 'analista@acme-fintech.dev', 'João Costa (Analista)', $2, 'ANALYST', 'ACTIVE')
      ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name
    `, [tenantA!.id, passwordHash])

    await client.query(`
      INSERT INTO users (tenant_id, email, name, password_hash, role, status)
      VALUES ($1, 'auditor@acme-fintech.dev', 'Ana Auditora', $2, 'AUDITOR', 'ACTIVE')
      ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name
    `, [tenantA!.id, passwordHash])

    console.log('  ✅ Usuários Tenant A: admin, CCO, analista, auditor')

    // ─── Usuários — Tenant B (Beta Coop) ──────────────────────────────────────
    await client.query(`
      INSERT INTO users (tenant_id, email, name, password_hash, role, status)
      VALUES ($1, 'admin@beta-coop.dev', 'Admin Beta', $2, 'ADMIN', 'ACTIVE')
      ON CONFLICT (tenant_id, email) DO UPDATE SET name = EXCLUDED.name
    `, [tenantB!.id, passwordHash])

    console.log('  ✅ Usuários Tenant B: admin')

    // ─── Entidades — Tenant A ─────────────────────────────────────────────────
    const { rows: [entityAlpha] } = await client.query<{ id: string }>(`
      INSERT INTO entities (
        tenant_id, name, cnpj, entity_type, sector, risk_level,
        kyc_status, is_pep, created_by,
        corporate_data
      ) VALUES (
        $1, 'Alpha Pagamentos S.A.', '11111111000101', 'CLIENTE', 'Serviços Financeiros',
        'HIGH', 'APPROVED', FALSE, $2,
        '{"capitalSocial":5000000,"dataAbertura":"2018-01-15","socios":[{"nome":"Carlos Mendes","cpf":"11122233344","participacao":60},{"nome":"Lucia Ferreira","cpf":"55566677788","participacao":40}]}'
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [tenantA!.id, adminA!.id])

    const { rows: [entityBeta] } = await client.query<{ id: string }>(`
      INSERT INTO entities (
        tenant_id, name, cnpj, entity_type, sector, risk_level,
        kyc_status, is_pep, created_by,
        corporate_data
      ) VALUES (
        $1, 'Beta Distribuidora Ltda', '22222222000102', 'FORNECEDOR', 'Comércio',
        'LOW', 'APPROVED', FALSE, $2,
        '{"capitalSocial":500000,"dataAbertura":"2015-06-20"}'
      )
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [tenantA!.id, adminA!.id])

    await client.query(`
      INSERT INTO entities (
        tenant_id, name, cnpj, entity_type, sector, risk_level,
        kyc_status, is_pep, created_by,
        corporate_data
      ) VALUES (
        $1, 'Gama Construções Eireli', '33333333000103', 'PARCEIRO', 'Construção Civil',
        'MEDIUM', 'PENDING', FALSE, $2,
        '{"capitalSocial":1200000,"dataAbertura":"2020-03-10"}'
      )
      ON CONFLICT DO NOTHING
    `, [tenantA!.id, ccoA!.id])

    console.log('  ✅ Entidades Tenant A: Alpha (HIGH), Beta Distr. (LOW), Gama Constr. (MEDIUM)')

    // ─── Registrar notificações de exemplo ────────────────────────────────────
    if (entityAlpha) {
      await client.query(`
        INSERT INTO notifications (
          tenant_id, type, severity, title, body,
          related_entity_type, related_entity_id, action_url
        ) VALUES (
          $1, 'RISK_ESCALATED', 'CRITICAL',
          'Risco escalado: Alpha Pagamentos S.A.',
          'Entidade Alpha Pagamentos S.A. teve seu nível de risco alterado para HIGH após análise PLD/FT.',
          'entity', $2::uuid, '/entities/' || $2::text
        )
      `, [tenantA!.id, entityAlpha.id])

      await client.query(`
        INSERT INTO notifications (
          tenant_id, type, severity, title, body, action_url
        ) VALUES (
          $1, 'CHECKLIST_OVERDUE', 'WARNING',
          'Checklist PLD vencido: 3 entidades',
          'Existem 3 entidades com checklists PLD/FT vencidos que precisam de re-avaliação.',
          '/entities?filter[status]=ACTIVE'
        )
      `, [tenantA!.id])
    }

    console.log('  ✅ Notificações de exemplo inseridas')

    await client.query('COMMIT')
    console.log('\n🎉 Seed concluído com sucesso!')
    console.log('\n📋 Credenciais de acesso (dev apenas):')
    console.log('  Tenant A — Acme Fintech:')
    console.log('    Admin:    admin@acme-fintech.dev / Senha@Compliance2026')
    console.log('    CCO:      cco@acme-fintech.dev  / Senha@Compliance2026')
    console.log('    Analista: analista@acme-fintech.dev / Senha@Compliance2026')
    console.log('    Auditor:  auditor@acme-fintech.dev / Senha@Compliance2026')
    console.log('  Tenant B — Beta Coop:')
    console.log('    Admin:    admin@beta-coop.dev / Senha@Compliance2026')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Seed falhou:', error)
    throw error
  } finally {
    await client.end()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
