import { getAI, GoogleAIBackend, type AI } from 'firebase/ai';
import { initializeApp } from 'firebase/app';

/** Firebase AI Logic for this app. Throws with the missing keys if .env.local isn't filled in. */
export function initAI(): AI {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(', ')}. Copy apps/web/.env.example to apps/web/.env.local, fill it in, and restart the dev server.`);
  }
  return getAI(initializeApp(config), { backend: new GoogleAIBackend() });
}
