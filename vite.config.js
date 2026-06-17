import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev: `vercel dev` serves both Vite and /api/* together on port 3000.
// No manual proxy needed. Just run: vercel dev
export default defineConfig({
  plugins: [react()],
});
