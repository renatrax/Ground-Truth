import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  test: {
    include: ['tests/sim/**/*.test.ts', 'tests/engine/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
});
