import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['src/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: [
                'src/modules/auth/auth.service.ts',
                'src/modules/entities/services/entities.service.ts'
            ],
            exclude: [
                'src/**/*.test.ts',
                'src/**/*.schema.ts',
                'src/modules/**/*.controller.ts',
                'src/modules/**/*.repository.ts'
            ],
            thresholds: {
                statements: 60,
                branches: 60,
                functions: 60,
                lines: 60,
            }
        }
    }
})
