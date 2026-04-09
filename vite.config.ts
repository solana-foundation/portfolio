/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // TanStack Router must come before react() for code generation
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routeFileIgnorePattern: '\\.test\\.(ts|tsx)$',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: 'coverage',
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/routeTree.gen.ts',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
      ],
      // thresholds: {
      //   statements: 50,
      //   branches: 50,
      //   functions: 50,
      //   lines: 50,
      // },
    },
  },
})
