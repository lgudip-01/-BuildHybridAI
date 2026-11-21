import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Keep an explicitly approved acceptance run intact across dev websocket loss.
  // Acceptance users must reload manually after every source/config change.
  ...(mode === 'acceptance' && { server: { host: '127.0.0.1', port: 5173, strictPort: true, hmr: false } }),
}));
