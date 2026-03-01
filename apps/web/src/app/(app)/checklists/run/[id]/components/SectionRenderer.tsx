'use client'

interface SectionRendererProps {
    sectionId: string
    data: any
    onChange: (data: any) => void
}

export default function SectionRenderer({ sectionId, data, onChange }: SectionRendererProps) {
    // Renderização dinâmica condicional por seção

    if (sectionId === 'registration') {
        return (
            <div className="space-y-8 max-w-2xl">
                <QuestionItem
                    label="A entidade possui registro ativo no órgão regulador competente?"
                    description="Consulte o CNPJ/CPF na base da RFB e órgãos específicos (CVM, SUSEP, etc)."
                    value={data.registration.is_active}
                    onChange={(val) => onChange({ registration: { ...data.registration, is_active: val } })}
                />

                <QuestionItem
                    label="Existem sanções administrativas ou judiciais vigentes contra a entidade?"
                    description="Verificar CEIS, CNEP e listas de restrição internacionais."
                    value={data.registration.has_sanctions}
                    onChange={(val) => onChange({ registration: { ...data.registration, has_sanctions: val } })}
                />

                {data.registration.has_sanctions === 'yes' && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">
                            Justificativa Obrigatória
                        </label>
                        <textarea
                            className="input-field min-h-[120px] focus:ring-red-500 border-red-200"
                            placeholder="Detalhe a sanção encontrada e as medidas mitigatórias tomadas..."
                            value={data.registration.justification}
                            onChange={(e) => onChange({ registration: { ...data.registration, justification: e.target.value } })}
                        />
                    </div>
                )}
            </div>
        )
    }

    if (sectionId === 'pep') {
        return (
            <div className="space-y-8 max-w-2xl">
                <QuestionItem
                    label="O beneficiário final desta entidade é considerado Pessoa Exposta Politicamente?"
                    description="Conforme definição da circular COAF vigente."
                    value={data.pep.is_pep}
                    onChange={(val) => onChange({ pep: { ...data.pep, is_pep: val } })}
                />

                <QuestionItem
                    label="Existe algum sócio ou administrador que seja PEP?"
                    value={data.pep.beneficiary_pep}
                    onChange={(val) => onChange({ pep: { ...data.pep, beneficiary_pep: val } })}
                />
            </div>
        )
    }

    if (sectionId === 'funds') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Origem Declarada dos Recursos
                    </label>
                    <select
                        className="input-field"
                        value={data.funds.origin}
                        onChange={(e) => onChange({ funds: { ...data.funds, origin: e.target.value } })}
                    >
                        <option value="">Selecione...</option>
                        <option value="billing">Faturamento Operacional</option>
                        <option value="investment">Aportes / Investimentos</option>
                        <option value="loans">Empréstimos / Financiamentos</option>
                        <option value="assets">Venda de Ativos</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Receita Mensal Estimada
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                        <input
                            type="text"
                            className="input-field pl-10"
                            placeholder="0,00"
                            value={data.funds.monthly_revenue}
                            onChange={(e) => onChange({ funds: { ...data.funds, monthly_revenue: e.target.value } })}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
            Nenhum renderer disponível para esta seção.
        </div>
    )
}

function QuestionItem({ label, description, value, onChange }: {
    label: string,
    description?: string,
    value: string,
    onChange: (val: string) => void
}) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h4 className="font-bold text-foreground leading-snug">{label}</h4>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onChange('yes')}
                    className={`
            flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all
            ${value === 'yes'
                            ? 'bg-primary/5 border-primary text-primary shadow-sm'
                            : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60'}
          `}
                >
                    Sim
                </button>
                <button
                    onClick={() => onChange('no')}
                    className={`
            flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all
            ${value === 'no'
                            ? 'bg-primary/5 border-primary text-primary shadow-sm'
                            : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/60'}
          `}
                >
                    Não
                </button>
            </div>
        </div>
    )
}
