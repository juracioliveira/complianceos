'use client'

import { useState } from 'react'
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Loader2,
    Info
} from 'lucide-react'
import { useChecklistAutoSave } from '@/lib/hooks/useChecklistAutoSave'
import SectionRenderer from './SectionRenderer'
import CompletionScreen from './CompletionScreen'

interface WizardShellProps {
    checklistId: string
    entityId: string | null
}

export default function WizardShell({ checklistId, entityId }: WizardShellProps) {
    const [currentSection, setCurrentSection] = useState(0)
    const [complete, setComplete] = useState(false)
    const [formData, setFormData] = useState<any>({
        registration: {
            is_active: 'yes',
            has_sanctions: 'no',
            justification: ''
        },
        pep: {
            is_pep: 'no',
            beneficiary_pep: 'no'
        },
        funds: {
            origin: '',
            monthly_revenue: ''
        }
    })

    // Hook de Auto-Save
    const { isSaving } = useChecklistAutoSave({
        checklistId,
        data: formData,
        onSave: async (id, data) => {
            // Simulação de PATCH /checklists/{id}/responses
            return new Promise((resolve) => setTimeout(resolve, 800))
        }
    })

    const sections = [
        { id: 'registration', title: 'Informações Cadastrais', icon: <span className="w-5 h-5">1</span> },
        { id: 'pep', title: 'Pessoas Expostas Politicamente', icon: <span className="w-5 h-5">2</span> },
        { id: 'funds', title: 'Origem de Recursos', icon: <span className="w-5 h-5">3</span> },
    ]

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(curr => curr + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            setComplete(true)
        }
    }

    const handleBack = () => {
        if (currentSection > 0) {
            setCurrentSection(curr => curr - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    if (complete) {
        return <CompletionScreen entityId={entityId} />
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2">
                {sections.map((section, idx) => (
                    <button
                        key={section.id}
                        onClick={() => setCurrentSection(idx)}
                        className={`
              flex items-center gap-3 p-4 rounded-xl transition-all text-left border
              ${currentSection === idx
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                                : idx < currentSection
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                                    : 'bg-card border-border text-muted-foreground hover:border-primary/50'}
            `}
                    >
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${currentSection === idx
                                ? 'bg-white/20'
                                : idx < currentSection ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50' : 'bg-muted'}
            `}>
                            {idx < currentSection ? <CheckCircle2 className="w-5 h-5" /> : section.icon}
                        </div>
                        <span className="font-semibold text-sm">{section.title}</span>
                    </button>
                ))}

                <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/30">
                    <div className="flex gap-2">
                        <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-orange-700 leading-relaxed">
                            Respostas negativas em "Pessoas Expostas Politicamente" exigem o upload de declaração assinada no passo final.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 w-full flex flex-col gap-6 h-full">
                <div className="card p-0 overflow-hidden min-h-[500px] flex flex-col">
                    {/* Section Header */}
                    <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                        <h2 className="text-xl font-bold">{sections[currentSection].title}</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {isSaving ? (
                                <span className="flex items-center gap-1.5 animate-pulse text-primary">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Salvando alterações...
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 opacity-60">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Progresso salvo
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="p-8 flex-1">
                        <SectionRenderer
                            sectionId={sections[currentSection].id}
                            data={formData}
                            onChange={(data) => setFormData((curr: any) => ({ ...curr, ...data }))}
                        />
                    </div>

                    {/* Navigation Controls */}
                    <div className="p-6 border-t border-border flex items-center justify-between bg-muted/10">
                        <button
                            onClick={handleBack}
                            disabled={currentSection === 0}
                            className="btn btn-secondary gap-2 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Anterior
                        </button>
                        <button
                            onClick={handleNext}
                            className="btn btn-primary gap-2 min-w-[140px]"
                        >
                            {currentSection === sections.length - 1 ? 'Finalizar' : 'Próximo'}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
