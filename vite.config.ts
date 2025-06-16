import { defineConfig } from 'vite'
import swc from 'unplugin-swc'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => ({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
    viteTsConfigPaths({
      root: './',
    }),
  ],
  test: {
    globals: true,
    watch: false,
    reporters: ['default'],
    testTimeout: 600000,
    hookTimeout: 600000,
    setupFiles: ['./src/tests/test-setup.ts'],
    include: ['./src/tests/**/*.spec.ts'],
    outputFile: {
      junit: './reports/junit-report.xml',
    },
    fileParallelism: false,
  },
}))
