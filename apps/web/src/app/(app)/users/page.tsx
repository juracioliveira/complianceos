'use client'

import { useState } from 'react'
import {
    UserPlus,
    Search,
    MoreVertical,
    ShieldCheck,
    Mail,
    Clock,
    UserX,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import InviteModal from './components/InviteModal'
import RoleBadge from './components/RoleBadge'

export default function UsersPage() {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const users = [
        {
            id: '1',
            name: 'Ruan Geovani',
            email: 'ruan@complianceos.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            lastLogin: '2h atrás',
            avatar: 'RG'
        },
        {
            id: '2',
            name: 'Maria Silva',
            email: 'maria.silva@grupoguinle.com.br',
            role: 'CCO',
            status: 'ACTIVE',
            lastLogin: 'Hoje, 10:45',
            avatar: 'MS'
        },
        {
            id: '3',
            name: 'João Costa',
            email: 'joao.analista@grupoguinle.com.br',
            role: 'ANALYST',
            status: 'PENDING',
            lastLogin: 'Convite enviado',
            avatar: 'JC'
        },
        {
            id: '4',
            name: 'Ana Pereira',
            email: 'ana.audit@consultoria.com.br',
            role: 'AUDITOR',
            status: 'ACTIVE',
            lastLogin: 'Ontem',
            avatar: 'AP'
        }
    ]

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        Gerencie acessos, roles e convites da sua organização.
                    </p>
                </div>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="btn btn-primary gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Convidar Usuário
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {/* Toolbar */}
                <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-xl">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            className="input-field pl-10 h-10 border-transparent bg-transparent focus:bg-muted/30"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="h-6 w-[1px] bg-border hidden md:block" />
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Total:</span>
                        <span className="text-xs font-bold text-foreground">{users.length}</span>
                    </div>
                </div>

                {/* Users Table */}
                <div className="card p-0 overflow-hidden border-border/50">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <th className="px-6 py-4">Usuário</th>
                                    <th className="px-6 py-4">Papel (Role)</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Último Acesso</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                                                    {user.avatar}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={user.role as any} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.status === 'ACTIVE' ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-orange-500 font-bold text-[10px] uppercase">
                                                    <Clock className="w-3.5 h-3.5" /> Pendente
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                                            {user.lastLogin}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors" title="Editar Permissões">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-muted-foreground hover:text-red-500 transition-colors" title="Desativar">
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <InviteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
        </div>
    )
}
