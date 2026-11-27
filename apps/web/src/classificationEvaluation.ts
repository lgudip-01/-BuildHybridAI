import type { AiBridge, Clause, ClauseType } from '@clause-guard/core/types';
import { readClause } from '@clause-guard/privacy-engine/onDevice';

export const CLASSIFICATION_LIMITS = Object.freeze({ cases: 17, clauseCharacters: 2000, readMs: 60_000, totalMs: 180_000 });
export type ClassificationCase = { sample: string; group: 'prior-mismatch' | 'control'; clause: Clause; expected: readonly ClauseType[] };
export type ClassificationRow = { sample: string; group: ClassificationCase['group']; clauseId: string;
  expected: readonly ClauseType[]; actual: ClauseType; matched: boolean; elapsedMs: number; entityCount: number };
type Stop = 'local_timeout' | 'local_read_failed' | 'invalid_type' | 'total_deadline';
export type ClassificationEvaluation = { status: 'complete' | 'unavailable' | 'stopped'; rows: ClassificationRow[]; stop?: Stop };
class Deadline extends Error {}

async function bounded<T>(request: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([request, new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Deadline()), milliseconds);
  })]); } finally { clearTimeout(timer); }
}

/** Fixed public evaluation only: the real joint entity/type reader, no analyze(),
 * retries or relabeling. A caller timeout stops dispatch; it does not cancel SDK work.
 */
export async function evaluateClassification(cases: readonly ClassificationCase[], bridge: AiBridge,
  onRow: (row: ClassificationRow) => void = () => {}): Promise<ClassificationEvaluation> {
  if (!cases.length || cases.length > CLASSIFICATION_LIMITS.cases ||
      cases.some(c => c.clause.text.length > CLASSIFICATION_LIMITS.clauseCharacters || !c.expected.length) ||
      new Set(cases.map(c => `${c.sample}/${c.clause.id}`)).size !== cases.length) {
    throw new Error('Choose unique bounded public classification cases.');
  }
  const rows: ClassificationRow[] = [], deadline = Date.now() + CLASSIFICATION_LIMITS.totalMs;
  try {
    if (await bounded(bridge.onDeviceStatus(), CLASSIFICATION_LIMITS.readMs) !== 'available') return { status: 'unavailable', rows };
  } catch (error) { return { status: 'stopped', rows, stop: error instanceof Deadline ? 'local_timeout' : 'local_read_failed' }; }
  for (const item of cases) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) return { status: 'stopped', rows, stop: 'total_deadline' };
    const started = Date.now();
    let reading: Awaited<ReturnType<typeof readClause>>;
    try { reading = await bounded(readClause(bridge, item.clause), Math.min(CLASSIFICATION_LIMITS.readMs, remaining)); }
    catch (error) { return { status: 'stopped', rows, stop: error instanceof Deadline ? 'local_timeout' : 'local_read_failed' }; }
    if (!reading.type) return { status: 'stopped', rows, stop: 'invalid_type' };
    const row: ClassificationRow = { sample: item.sample, group: item.group, clauseId: item.clause.id,
      expected: [...item.expected], actual: reading.type, matched: item.expected.includes(reading.type),
      elapsedMs: Date.now() - started, entityCount: reading.entities.length };
    rows.push(row);
    onRow(row);
  }
  return { status: 'complete', rows };
}
