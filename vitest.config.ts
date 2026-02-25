import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom', // since there are browser/ files
        setupFiles: ['./test-setup.ts'],
        include: ['src/**/*.test.ts'],
        globals: true,
    }
})
