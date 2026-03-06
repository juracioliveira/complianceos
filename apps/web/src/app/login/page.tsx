'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, Eye, EyeOff, Loader2, Smartphone, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mfaCode, setMfaCode] = useState('')
    const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        startTransition(async () => {
            try {
                let apiUrl = process.env['NEXT_PUBLIC_API_URL']
                if (!apiUrl && typeof window !== 'undefined') {
                    if (window.location.hostname !== 'localhost') {
                        if (window.location.hostname.includes('easypanel.host')) {
                            apiUrl = `https://${window.location.hostname.replace('-web-', '-api-')}`
                        } else {
                            const baseDomain = window.location.hostname.split('.').slice(-3).join('.')
                            apiUrl = `https://api.${baseDomain}`
                        }
                    } else {
                        apiUrl = 'http://localhost:4000'
                    }
                }
                const res = await fetch(`${apiUrl}/v1/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email,
                        password,
                        ...(step === 'mfa' ? { mfaCode } : {}),
                    }),
                })

                const data = await res.json() as {
                    data?: { accessToken: string }
                    type?: string
                    detail?: string
                }

                if (!res.ok) {
                    if (data.type?.includes('MFA_REQUIRED')) {
                        setStep('mfa')
                        return
                    }
                    throw new Error(data.detail ?? 'Credenciais inválidas')
                }

                if (data.data?.accessToken) {
                    sessionStorage.setItem('access_token', data.data.accessToken)
                    document.cookie = `access_token=${data.data.accessToken}; path=/; max-age=86400; samesite=Lax`
                    window.location.href = '/dashboard'
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao fazer login')
            }
        })
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Painel esquerdo — branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-50 relative overflow-hidden border-right border-slate-200">
                {/* Padrão de fundo decorativo */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-3xl" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-100/50 rounded-full blur-3xl" />
                    {/* Grid sutil */}
                    <div
                        className="absolute inset-0 opacity-[0.05]"
                        style={{
                            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                            backgroundSize: '60px 60px',
                        }}
                    />
                </div>

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-lg leading-tight">Compliance<span className="text-brand-600">OS</span></p>
                        <p className="text-brand-600/70 text-[10px] font-mono tracking-widest uppercase mt-0.5">Governance Engine</p>
                    </div>
                </div>

                {/* Headline */}
                <div className="relative space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 leading-tight text-balance">
                            Compliance e Governança<br />
                            <span className="text-brand-600">numa plataforma única</span>
                        </h1>
                        <p className="mt-4 text-slate-600 text-base leading-relaxed max-w-md">
                            Gerencie PLD/FT, LGPD e Anticorrupção com rastreabilidade total,
                            auditoria imutável e relatórios regulatórios automáticos.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Checklists Regulatórios', desc: 'PLD/FT, LGPD, Lei 12.846' },
                            { label: 'Audit Trail Imutável', desc: 'Retenção de 5 anos' },
                            { label: 'KYC/KYB Automatizado', desc: 'Due diligence completa' },
                            { label: 'Documentos PDF', desc: 'RAT, DPIA, Relatórios' },
                        ].map((f) => (
                            <div key={f.label} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                                <p className="text-slate-900 text-xs font-semibold">{f.label}</p>
                                <p className="text-slate-500 text-[11px] mt-0.5">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rodapé */}
                <p className="relative text-slate-400 text-xs">
                    © 2026 Grupo Guinle · Chuangxin Tecnologia · Uso corporativo
                </p>
            </div>

            {/* Painel direito — formulário */}
            <div className="flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-sm animate-fade-in">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 justify-center mb-8 text-xl font-bold tracking-tight text-slate-900">
                        <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-brand-600" />
                        </div>
                        <span>Compliance<span className="text-brand-600">OS</span></span>
                    </div>

                    <div className="space-y-1 mb-8">
                        <h2 className="text-2xl font-bold text-foreground">
                            {step === 'credentials' ? 'Entrar na plataforma' : 'Autenticação MFA'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {step === 'credentials'
                                ? 'Use as credenciais fornecidas pelo administrador'
                                : 'Insira o código do seu aplicativo autenticador'}
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-critical mb-5 animate-fade-in">
                            <div className="w-4 h-4 shrink-0 mt-px">⚠</div>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {step === 'credentials' ? (
                            <>
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                                        Email corporativo
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="usuario@empresa.com.br"
                                        className="input-field"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                                            Senha
                                        </label>
                                        <button type="button" className="text-xs text-primary hover:underline">
                                            Esqueci a senha
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••••"
                                            className="input-field pr-11"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 mb-4 p-3.5 rounded-xl bg-brand-50 border border-brand-200">
                                    <Smartphone className="w-4 h-4 text-brand-600 shrink-0" />
                                    <p className="text-sm text-brand-800">
                                        Abra seu app autenticador (Google Authenticator, Authy) e insira o código de 6 dígitos.
                                    </p>
                                </div>
                                <label htmlFor="mfa" className="text-sm font-medium text-foreground">
                                    Código TOTP (6 dígitos)
                                </label>
                                <input
                                    id="mfa"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]{6}"
                                    maxLength={6}
                                    autoFocus
                                    required
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000 000"
                                    className={cn('input-field text-center text-2xl tracking-[0.5em] font-mono')}
                                />
                                <button
                                    type="button"
                                    onClick={() => { setStep('credentials'); setError(null) }}
                                    className="text-xs text-muted-foreground hover:text-foreground mt-1"
                                >
                                    ← Voltar ao login
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn-primary w-full py-2.5 mt-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Verificando...</span>
                                </>
                            ) : (
                                <>
                                    <span>{step === 'mfa' ? 'Verificar código' : 'Entrar'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-muted-foreground text-xs mt-8">
                        Problemas de acesso? Contate o administrador do sistema.
                    </p>
                </div>
            </div>
        </div>
    )
}
