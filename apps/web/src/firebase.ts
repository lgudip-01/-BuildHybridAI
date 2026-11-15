import { getAI, GoogleAIBackend } from 'firebase/ai';
import { initializeApp } from 'firebase/app';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);
if (missing.length > 0) {
  throw new Error(`Missing Firebase config (${missing.join(', ')}). Copy apps/web/.env.example to .env.local and fill it in.`);
}

export const app = initializeApp(config);
export const ai = getAI(app, { backend: new GoogleAIBackend() });
