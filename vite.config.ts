import { defineConfig } from 'vitest/config'; //does not trigger the error for test not being declared
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    env: {
      VITE_NASA_API_KEY: 'test-api-key',
    },
  },
});
