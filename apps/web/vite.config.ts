import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Vite 8 keeps its WebSocket client with hmr:false. Disable that connection too
  // so its reconnect handler cannot reload an approved acceptance page.
  // Acceptance users must reload manually after every source/config change.
  ...(mode === 'acceptance' && { server: { host: '127.0.0.1', port: 5173, strictPort: true, hmr: false, ws: false } }),
}));
