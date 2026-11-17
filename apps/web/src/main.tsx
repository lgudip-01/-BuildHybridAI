import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import './styles.css';
import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initAI } from './firebase';
import { Capacitor } from '@capacitor/core';
import { NativeBridge } from './nativeBridge';
import { WebBridge } from './webBridge';

function start(): ReactNode {
  try {
    // Phones reach Firebase through the native plugin, so the web SDK is only set up in browsers.
    const bridge = Capacitor.isNativePlatform() ? new NativeBridge() : new WebBridge(initAI());
    return <App bridge={bridge} />;
  } catch (error) {
    return (
      <main className="setup-error">
        <h1>Firebase isn't configured</h1>
        <p>{error instanceof Error ? error.message : String(error)}</p>
      </main>
    );
  }
}

createRoot(document.getElementById('root')!).render(<StrictMode>{start()}</StrictMode>);
