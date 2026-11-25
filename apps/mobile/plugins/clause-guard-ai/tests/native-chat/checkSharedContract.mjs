import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const shared = path.resolve(process.argv[2] ?? '.');
const { CHAT_PROMPT, CHAT_LIMITS } = await import(pathToFileURL(path.join(shared, 'packages/core/src/chat.ts')));
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures.json'), 'utf8'));
assert.equal(fixture.system, CHAT_PROMPT);
for (const [key, value] of Object.entries({question:2000,turns:8,history:20000,answer:6000,citations:10,timeoutMs:30000})) assert.equal(CHAT_LIMITS[key],value);
const model = fs.readFileSync(path.join(shared,'packages/core/src/analysis.ts'),'utf8').match(/export const ANALYSIS_MODEL = '([^']+)';/)?.[1];
for (const file of ['../../ios/Sources/ClauseGuardAIPlugin/NativeChatPolicy.swift','../../android/src/main/java/app/clauseguard/ai/NativeChatPolicy.kt']) {
  assert.ok(model && fs.readFileSync(path.resolve(here,file),'utf8').includes('"'+model+'"'), 'Native model must match shared model');
}
console.log('Shared prompt/model/limit parity passed. No provider or SDK initialization.');
