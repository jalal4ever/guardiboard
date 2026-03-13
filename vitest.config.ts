import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '.next/', '**/*.test.ts'],
    },
  },
  resolve: {
    alias: {
      '@guardiboard/auth': resolve(__dirname, 'packages/auth/src'),
      '@guardiboard/types': resolve(__dirname, 'packages/types/src'),
      '@guardiboard/config': resolve(__dirname, 'packages/config/src'),
      '@guardiboard/validation': resolve(__dirname, 'packages/validation/src'),
    },
  },
});
