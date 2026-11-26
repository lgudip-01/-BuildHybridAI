// Exercise the installed, unmodified native bridge with synthetic data only.
// This does not launch a WebView, SDK, model, app, or network request.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const mobile = new URL('./', import.meta.url);
const config = JSON.parse(await readFile(new URL('capacitor.config.json', mobile), 'utf8'));
assert.equal(config.loggingBehavior, 'none', 'Global bridge logging must be disabled');
for (const platform of ['android', 'ios']) {
  assert.equal(config[platform]?.loggingBehavior ?? config.loggingBehavior, 'none', `${platform} must not override logging`);
}
console.log('PASS: global and effective platform logging configuration is none');

for (const platform of ['android', 'ios']) {
  const asset = platform === 'android'
    ? 'node_modules/@capacitor/android/capacitor/src/main/assets/native-bridge.js'
    : 'node_modules/@capacitor/ios/Capacitor/Capacitor/assets/native-bridge.js';
  const source = await readFile(new URL(asset, mobile), 'utf8');
  for (const enabled of [true, false]) {
    const logs = [];
    const sent = [];
    const context = {
      Capacitor: { DEBUG: true, isLoggingEnabled: enabled, Plugins: {} },
      console: Object.fromEntries(['debug', 'error', 'info', 'log', 'trace', 'warn', 'groupCollapsed', 'groupEnd', 'dir']
        .map(method => [method, (...args) => logs.push(args)])),
      Document: class {}, HTMLDocument: class {}, XMLHttpRequest: class {},
    };
    context.window = context;
    if (platform === 'android') context.androidBridge = { postMessage: data => sent.push(JSON.parse(data)) };
    else context.webkit = { messageHandlers: { bridge: { postMessage: data => sent.push(data) } } };
    vm.runInNewContext(source, context, { filename: fileURLToPath(new URL(asset, mobile)), timeout: 2000 });
    const cap = context.Capacitor;
    assert.equal(cap.getPlatform(), platform);
    // A normal result and a rejected result must still arrive, without payload logging.
    for (const success of [true, false]) {
      const prompt = 'SYNTHETIC_RAW_REQUEST_SENTINEL';
      const reply = 'SYNTHETIC_REPLY_SENTINEL';
      let resolved;
      let rejected;
      const callbackId = cap.toNative('ClauseGuardAI', 'onDevice', { prompt }, {
        resolve: data => { resolved = data; }, reject: error => { rejected = error; },
      });
      assert.ok(sent.some(call => call.pluginId === 'ClauseGuardAI' && call.options.prompt === prompt), 'Request delivery must remain intact');
      cap.fromNative({ callbackId, pluginId: 'ClauseGuardAI', methodName: 'onDevice', success,
        ...(success ? { data: { text: reply } } : { error: { message: reply, code: 'synthetic' } }) });
      if (success) assert.equal(resolved.text, reply);
      else assert.equal(rejected.message, reply);
    }
    // A camera scan's result is raw contract text too (#62).
    {
      const scanned = 'SYNTHETIC_SCANNED_TEXT_SENTINEL';
      let resolved;
      const callbackId = cap.toNative('ClauseGuardAI', 'scanDocument', {}, { resolve: data => { resolved = data; }, reject: () => {} });
      cap.fromNative({ callbackId, pluginId: 'ClauseGuardAI', methodName: 'scanDocument', success: true,
        data: { pages: [{ lines: [{ text: scanned, x: 0.1, y: 0.1, w: 0.5, h: 0.02 }] }] } });
      assert.equal(resolved.pages[0].lines[0].text, scanned);
      if (enabled) assert.ok(JSON.stringify(logs).includes(scanned), 'Negative control must expose the scanned text');
    }
    const rendered = JSON.stringify(logs);
    if (enabled) {
      assert.ok(rendered.includes('SYNTHETIC_RAW_REQUEST_SENTINEL'), 'Negative control must expose the request');
      assert.ok(rendered.includes('SYNTHETIC_REPLY_SENTINEL'), 'Negative control must expose the reply');
    } else {
      assert.equal(logs.length, 0, 'No bridge request, result or error payload may reach console');
    }
    console.log(`PASS: ${platform} DEBUG bridge ${enabled ? 'enabled control reproduces payload logging' : 'disabled suppresses request/result/error logging and preserves delivery'}`);
  }
}

// Optional: inspect generated copies after `cap copy` in a clean local fixture.
for (const path of process.argv.slice(2)) {
  const generated = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(generated.appId, config.appId);
  assert.equal(generated.loggingBehavior, 'none');
  for (const platform of ['android', 'ios']) assert.equal(generated[platform]?.loggingBehavior ?? generated.loggingBehavior, 'none');
  console.log('PASS: generated native config retains logging disabled and app identity');
}
