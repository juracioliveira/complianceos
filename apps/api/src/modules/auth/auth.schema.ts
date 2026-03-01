import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    mfaCode: z.string().length(6).optional(),
})

export const refreshSchema = z.object({
    refreshToken: z.string().min(1),
})

export const mfaSetupSchema = z.object({
    password: z.string().min(8),
})

export const mfaVerifySchema = z.object({
    code: z.string().length(6),
    secret: z.string(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
