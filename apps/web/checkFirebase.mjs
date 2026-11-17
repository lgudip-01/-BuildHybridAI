// Isolated SDK mocks: no network, credentials, or live Firebase project required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

const source = stripTypeScriptTypes(readFileSync(new URL('./src/firebase.ts', import.meta.url), 'utf8'))
  .replaceAll('import.meta.env', '__env').replaceAll('import.meta.hot', '__hot');
const defaults = { DEV: true, VITE_FIREBASE_API_KEY: 'synthetic-key', VITE_FIREBASE_PROJECT_ID: 'test-project', VITE_FIREBASE_APP_ID: 'test-app' };
async function harness(env = {}, extra = {}) {
  const calls = [];
  const apps = [];
  const context = vm.createContext({ __env: { ...defaults, ...env }, __hot: { data: {} }, location: { hostname: 'localhost', protocol: 'http:' }, ...extra });
  let rejectToken = false;
  class CustomProvider { constructor(options) { this.options = options; } }
  class ReCaptchaEnterpriseProvider { constructor(siteKey) { this.siteKey = siteKey; } }
  const exports = {
    'firebase/app': { getApps: () => apps, initializeApp: options => { const app = { name: '[DEFAULT]', options }; apps.push(app); calls.push('app'); return app; } },
    'firebase/app-check': {
      CustomProvider, ReCaptchaEnterpriseProvider,
      initializeAppCheck: (app, options) => { calls.push('app-check'); if (options.provider instanceof CustomProvider) assert.equal(context.FIREBASE_APPCHECK_DEBUG_TOKEN, true); return { app, ...options }; },
      getToken: async () => { if (rejectToken) throw new Error('sensitive SDK detail'); return { token: 'synthetic-token' }; },
    },
    'firebase/ai': { GoogleAIBackend: class {}, getAI: app => { calls.push('ai'); return { app }; } },
  };
  async function load() {
    const module = new vm.SourceTextModule(source, { context });
    await module.link(specifier => {
      const values = exports[specifier];
      return new vm.SyntheticModule(Object.keys(values), function() { for (const [key, value] of Object.entries(values)) this.setExport(key, value); }, { context });
    });
    await module.evaluate();
    return module.namespace;
  }
  return { module: await load(), load, calls, context, apps, CustomProvider, ReCaptchaEnterpriseProvider, failToken: () => { rejectToken = true; } };
}

let h = await harness();
const first = h.module.initFirebase();
assert.deepEqual(h.calls, ['app', 'app-check', 'ai']);
assert.equal(first.appCheck.isTokenAutoRefreshEnabled, true);
assert.ok(first.appCheck.provider instanceof h.CustomProvider);
assert.equal(h.module.initAI(), first.ai);
assert.equal(h.module.initFirebase(), first);
assert.equal(h.apps.length, 1);
console.log('PASS: debug selection, initialization order, and repeated calls');

const reloaded = await h.load();
assert.equal(reloaded.initFirebase(), first);
assert.equal(h.calls.length, 3);
console.log('PASS: hot-reload singleton reuse');

h.context.__env.VITE_FIREBASE_PROJECT_ID = 'changed';
assert.throws(() => h.module.initFirebase(), /different configuration/);
console.log('PASS: changed configuration rejected');

h = await harness({ VITE_FIREBASE_API_KEY: ' ' });
assert.throws(() => h.module.initFirebase(), /Missing Firebase config: apiKey/);
assert.equal(h.calls.length, 0);
console.log('PASS: missing config rejected before initialization');

h = await harness({ DEV: false });
assert.throws(() => h.module.initFirebase(), /Missing VITE_RECAPTCHA/);
assert.equal(h.calls.length, 0);
console.log('PASS: production requires attestation configuration');

h = await harness({ DEV: false, VITE_RECAPTCHA_ENTERPRISE_SITE_KEY: 'test-site-key' });
assert.ok(h.module.initFirebase().appCheck.provider instanceof h.ReCaptchaEnterpriseProvider);
assert.equal(h.context.FIREBASE_APPCHECK_DEBUG_TOKEN, undefined);
console.log('PASS: production selects Enterprise provider without debug mode');

h = await harness({ DEV: false, VITE_RECAPTCHA_ENTERPRISE_SITE_KEY: 'test-site-key' }, { FIREBASE_APPCHECK_DEBUG_TOKEN: true });
assert.throws(() => h.module.initFirebase(), /debug mode is not allowed/);
console.log('PASS: production debug flag rejected');

h = await harness({}, { location: { hostname: 'public.example', protocol: 'https:' } });
assert.throws(() => h.module.initFirebase(), /Missing VITE_RECAPTCHA/);
console.log('PASS: public development origin cannot enable automatic debug mode');

h = await harness();
assert.equal(await h.module.verifyAppCheck(), undefined);
h.failToken();
await assert.rejects(h.module.verifyAppCheck(), error => error.message.startsWith('App Check verification failed.') && !error.message.includes('sensitive SDK detail'));
console.log('PASS: verification returns no token and sanitizes failures');
