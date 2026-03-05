import PDFDocument from 'pdfkit'

export interface AlertCaseForPdf {
    id: string
    title: string
    source: string
    severity: string
    status: string
    description: string
    evidence: Record<string, any>
    entity_name?: string
    entity_cnpj?: string
    entity_cpf?: string
    assigned_to_name?: string
    created_by_name?: string
    created_at: string
    updated_at: string
    resolved_at?: string
    resolution_note?: string
}

export interface ReportOptions {
    tenantName: string
    generatedByName: string
    filters?: {
        status?: string | string[]
        severity?: string | string[]
        source?: string
        from?: string
        to?: string
    }
}

const COLORS = {
    primary: '#1a2744',        // Azul escuro
    accent: '#2563eb',         // Azul institucional
    critical: '#dc2626',       // Vermelho CRITICAL
    high: '#ea580c',           // Laranja HIGH
    medium: '#ca8a04',         // Amarelo MEDIUM
    low: '#16a34a',            // Verde LOW
    border: '#e2e8f0',
    lightGray: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b',
}

function severityColor(severity: string): string {
    const map: Record<string, string> = {
        CRITICAL: COLORS.critical,
        HIGH: COLORS.high,
        MEDIUM: COLORS.medium,
        LOW: COLORS.low,
    }
    return map[severity] ?? COLORS.muted
}

function sourcePt(source: string): string {
    const map: Record<string, string> = {
        SANCTIONS_MATCH: 'Match em Lista de Sanções',
        PEP_MATCH: 'Pessoa Politicamente Exposta (PEP)',
        CHECKLIST_OVERDUE: 'Checklist Vencido',
        HIGH_RISK_ENTITY: 'Entidade de Alto Risco',
        MANUAL: 'Alerta Manual',
    }
    return map[source] ?? source
}

function statusPt(status: string): string {
    const map: Record<string, string> = {
        OPEN: 'Aberto',
        UNDER_REVIEW: 'Em Análise',
        ESCALATED: 'Escalado',
        CLOSED_FALSE_POSITIVE: 'Encerrado — Falso Positivo',
        CLOSED_CONFIRMED: 'Encerrado — Confirmado',
    }
    return map[status] ?? status
}

function formatDate(isoDate: string): string {
    if (!isoDate) return '—'
    return new Date(isoDate).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
    })
}

export function generateAlertCasesPdf(
    cases: AlertCaseForPdf[],
    options: ReportOptions
): Buffer {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
            Title: 'Relatório de Casos de Alerta — ComplianceOS',
            Author: options.generatedByName,
            Subject: 'Relatório Regulatório COAF/BACEN',
            Keywords: 'compliance, sanções, PEP, COAF, BACEN',
            CreationDate: new Date(),
        },
    })

    const pageWidth = doc.page.width - 100 // total width minus margins
    const buffers: Buffer[] = []
    doc.on('data', (chunk: Buffer) => buffers.push(chunk))

    // ── CAPA ─────────────────────────────────────────────────────────────────
    // Header bar
    doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primary)

    doc
        .fill('white')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text('ComplianceOS', 50, 22)

    doc
        .fontSize(10)
        .font('Helvetica')
        .text('Plataforma de Gestão de Compliance', 50, 48)

    // Título do relatório
    doc.fill(COLORS.text)
    doc.moveDown(3)
    doc.fontSize(18).font('Helvetica-Bold').text('Relatório de Casos de Alerta', { align: 'center' })
    doc.fontSize(11).font('Helvetica').fillColor(COLORS.muted).text('Para uso regulatório — COAF / BACEN / CVM', { align: 'center' })
    doc.moveDown(0.5)

    // Linha divisória
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(COLORS.border).stroke()
    doc.moveDown(1)

    // Metadados do relatório
    const metaY = doc.y
    doc.fillColor(COLORS.text).fontSize(10).font('Helvetica')

    const meta: [string, string][] = [
        ['Organização:', options.tenantName],
        ['Gerado por:', options.generatedByName],
        ['Data de geração:', formatDate(new Date().toISOString())],
        ['Total de casos:', String(cases.length)],
        ['Críticos:', String(cases.filter(c => c.severity === 'CRITICAL').length)],
        ['Alto risco:', String(cases.filter(c => c.severity === 'HIGH').length)],
    ]

    if (options.filters?.status) {
        const s = Array.isArray(options.filters.status)
            ? options.filters.status.join(', ')
            : options.filters.status
        meta.push(['Filtro de status:', s])
    }
    if (options.filters?.source) {
        meta.push(['Fonte:', sourcePt(options.filters.source)])
    }

    meta.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').text(label, 60, doc.y, { continued: true, width: 150 })
        doc.font('Helvetica').text(` ${value}`)
    })

    doc.moveDown(1.5)

    // Aviso legal
    doc
        .rect(50, doc.y, pageWidth, 40)
        .fill(COLORS.lightGray)

    doc
        .fillColor(COLORS.muted)
        .fontSize(8)
        .font('Helvetica')
        .text(
            'CONFIDENCIAL — Este documento contém informações regulatórias sensíveis. ' +
            'Distribua apenas para pessoas autorizadas. Retenha por no mínimo 5 anos conforme ' +
            'Resolução COAF nº 36/2021 e Art. 11 da Lei nº 9.613/1998.',
            58, doc.y + 6, { width: pageWidth - 16 }
        )

    doc.moveDown(2.5)

    // ── CASOS ─────────────────────────────────────────────────────────────────
    if (cases.length === 0) {
        doc.fontSize(12).fillColor(COLORS.muted).text('Nenhum caso encontrado com os filtros aplicados.', { align: 'center' })
    } else {
        cases.forEach((c, i) => {
            // Verificar se precisa de nova página
            if (doc.y > doc.page.height - 200) {
                doc.addPage()
            }

            const caseY = doc.y

            // Faixa de severidade lateral
            doc.rect(50, caseY, 4, 150).fill(severityColor(c.severity))

            // Número e título
            doc
                .fillColor(COLORS.text)
                .fontSize(12)
                .font('Helvetica-Bold')
                .text(`#${i + 1} — ${c.title}`, 62, caseY, { width: pageWidth - 12 })

            doc.moveDown(0.3)

            // Badges inline: severidade, status, fonte
            const badgeY = doc.y
            const badgeData = [
                { text: c.severity, color: severityColor(c.severity) },
                { text: statusPt(c.status), color: COLORS.accent },
                { text: sourcePt(c.source), color: COLORS.primary },
            ]

            let badgeX = 62
            badgeData.forEach(b => {
                const w = b.text.length * 6.5 + 14
                doc.rect(badgeX, badgeY, w, 16).fill(b.color)
                doc.fillColor('white').fontSize(7.5).font('Helvetica-Bold').text(b.text, badgeX + 7, badgeY + 4, { width: w - 14, lineBreak: false })
                badgeX += w + 6
            })

            doc.moveDown(1.5)

            // Dados da entidade (se tiver)
            if (c.entity_name) {
                doc.fontSize(9).fillColor(COLORS.muted).font('Helvetica')
                const entityLabel = c.entity_cnpj
                    ? `Entidade: ${c.entity_name} | CNPJ: ${c.entity_cnpj}`
                    : c.entity_cpf
                        ? `Entidade: ${c.entity_name} | CPF: ${c.entity_cpf}`
                        : `Entidade: ${c.entity_name}`
                doc.text(entityLabel, 62, doc.y)
                doc.moveDown(0.3)
            }

            // Descrição
            doc
                .fillColor(COLORS.text)
                .fontSize(9.5)
                .font('Helvetica')
                .text(c.description, 62, doc.y, { width: pageWidth - 12 })

            doc.moveDown(0.5)

            // Metadados do caso
            doc.fontSize(8).fillColor(COLORS.muted)
            doc.text(
                `Criado: ${formatDate(c.created_at)}` +
                (c.assigned_to_name ? `  |  Responsável: ${c.assigned_to_name}` : '') +
                (c.resolved_at ? `  |  Resolvido: ${formatDate(c.resolved_at)}` : ''),
                62, doc.y, { width: pageWidth - 12 }
            )

            // Nota de resolução (se houver)
            if (c.resolution_note) {
                doc.moveDown(0.3)
                doc
                    .fillColor(COLORS.muted)
                    .fontSize(8.5)
                    .font('Helvetica-Oblique')
                    .text(`Nota: ${c.resolution_note}`, 62, doc.y, { width: pageWidth - 12 })
            }

            // Evidências resumidas
            if (c.evidence && Object.keys(c.evidence).length > 0) {
                doc.moveDown(0.3)
                const evidenceStr = JSON.stringify(c.evidence, null, 0)
                    .replace(/[{}"]/g, '')
                    .replace(/,/g, ' | ')
                    .slice(0, 200)

                doc
                    .fillColor(COLORS.muted)
                    .fontSize(7.5)
                    .font('Helvetica')
                    .text(`Evidências: ${evidenceStr}`, 62, doc.y, { width: pageWidth - 12 })
            }

            doc.moveDown(1.2)
            // Linha divisória entre casos
            doc.moveTo(62, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(COLORS.border).lineWidth(0.5).stroke()
            doc.moveDown(0.8)
        })
    }

    // ── RODAPÉ ────────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 40
    doc
        .moveTo(50, footerY)
        .lineTo(doc.page.width - 50, footerY)
        .strokeColor(COLORS.border)
        .lineWidth(0.5)
        .stroke()

    doc
        .fillColor(COLORS.muted)
        .fontSize(7.5)
        .font('Helvetica')
        .text(
            `ComplianceOS — Relatório gerado em ${formatDate(new Date().toISOString())} | ` +
            `Conforme Lei 9.613/1998, COAF Res. 36/2021 e BACEN Circ. 3978/2020`,
            50, footerY + 6,
            { align: 'center', width: pageWidth }
        )

    doc.end()

    return Buffer.concat(buffers)
}
