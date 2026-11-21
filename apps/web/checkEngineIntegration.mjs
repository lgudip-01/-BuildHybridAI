import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('.', import.meta.url));
if (!existsSync(new URL('../../packages/privacy-engine/src/approval.ts', import.meta.url))) {
  console.error('BLOCKED: the real privacy-engine/approval.ts is missing (issue #8). No integration tests ran.');
  process.exit(2);
}
const require = createRequire(import.meta.url);
const cli = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
const result = spawnSync(process.execPath, [cli, 'run', 'src/engineIntegration.test.ts'], { cwd, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
