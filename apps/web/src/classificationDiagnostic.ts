import { CLAUSE_TYPES, type ClauseType } from '@clause-guard/core/types';
import { CLASSIFICATION_POLICY_VERSION } from '@clause-guard/privacy-engine/onDevice';
import { initAI } from './firebase';
import { WebBridge } from './webBridge';
import { evaluateClassification, type ClassificationCase } from './classificationEvaluation';

const texts = import.meta.glob('../../../samples/*.txt', { query: '?raw', import: 'default' });
const fixtures = import.meta.glob('../../../samples/*.json', { import: 'default' });
const selections = [
  ['nda', [2, 7], [4, 8]], ['freelance', [1, 5, 6], [4, 7]],
  ['lease', [1, 8], []], ['saas', [1, 2, 3, 5], [7]], ['offer-letter', [], [6]],
] as const;

export async function publicClassificationCases(): Promise<ClassificationCase[]> {
  const cases: ClassificationCase[] = [];
  for (const [sample, mismatches, controls] of selections) {
    const text = await texts[`../../../samples/${sample}.txt`]!() as string;
    const expected = await fixtures[`../../../samples/${sample}.json`]!() as { types: (ClauseType | ClauseType[])[] };
    const clauses = text.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean)
      .map((text, index) => ({ id: `c${index + 1}`, index, text }));
    for (const [group, numbers] of [['prior-mismatch', mismatches], ['control', controls]] as const) {
      for (const number of numbers) {
        const type = expected.types[number - 1]!;
        const allowed = Array.isArray(type) ? type : [type];
        if (!clauses[number - 1] || !allowed.length || allowed.some(t => !CLAUSE_TYPES.includes(t))) throw new Error('Invalid public fixture selection.');
        cases.push({ sample, group, clause: clauses[number - 1]!, expected: allowed });
      }
    }
  }
  return cases;
}

export function mountClassificationDiagnostic(root: HTMLElement): void {
  if (!import.meta.env.DEV || !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) throw new Error('Local development required.');
  root.innerHTML = `<h1>Public classification evaluation</h1>
    <p>One pass: 11 previously mismatched clauses and six controls. Fixed public fixtures only.
    Uses the local joint entity/type reader. No cloud analysis, retries or automatic relabeling.
    Stops on a read failure, 60-second read limit or three-minute total limit.</p>
    <button id="run">Run one local evaluation</button><p role="status" id="status">Ready; no model run.</p>
    <pre id="result" style="white-space:pre-wrap">No result.</pre>`;
  const button = root.querySelector<HTMLButtonElement>('#run')!, status = root.querySelector<HTMLElement>('#status')!;
  const result = root.querySelector<HTMLElement>('#result')!;
  let started = false;
  button.addEventListener('click', async () => {
    if (started) return;
    started = true; button.disabled = true;
    status.textContent = 'Preparing fixed public cases; local model only.';
    try {
      const cases = await publicClassificationCases();
      const answer = await evaluateClassification(cases, new WebBridge(initAI()), row => {
        status.textContent = `Read ${row.sample}/${row.clauseId}; preserving its actual label.`;
      });
      result.textContent = JSON.stringify({ policy: CLASSIFICATION_POLICY_VERSION, ...answer }, null, 2);
      status.textContent = `${answer.status}: ${answer.rows.filter(r => r.matched).length}/${answer.rows.length} labels match unchanged fixtures.`;
    } catch {
      status.textContent = 'Evaluation unavailable; no retry or cloud analysis requested.';
    }
  });
}
