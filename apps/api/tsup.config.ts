import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/server.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    noExternal: [
        '@compliance-os/scoring-engine',
        '@compliance-os/checklist-engine'
    ]
})
