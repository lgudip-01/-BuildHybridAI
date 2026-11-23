import type { AiBridge, Analysis, AnalyzeResult, Clause, ClauseFailure, MaskResult } from '@clause-guard/core/types';
import { mask } from '@clause-guard/privacy-engine/mask';
import { approve, assertApproved } from '@clause-guard/privacy-engine/approval';
import { deleteVault } from '@clause-guard/privacy-engine/vault';
import { unmask } from '@clause-guard/privacy-engine/unmask';

export type ReviewOutcome = { restored: Analysis[]; failed: ClauseFailure[]; ranOn?: 'cloud' | 'device' };
export type ReviewSnapshot = {
  contract: string;
  phase: 'editing' | 'masking' | 'review' | 'blocked' | 'analyzing' | 'deleting' | 'deleted' | 'results' | 'error';
  masked?: MaskResult;
  ms?: number;
  outcome?: ReviewOutcome;
  error?: string;
};

export function splitClauses(text: string): Clause[] {
  return text.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
    .map((text, index) => ({ id: `c${index + 1}`, index, text }));
}

export function reviewBusy(snapshot: ReviewSnapshot): boolean {
  return snapshot.phase === 'masking' || snapshot.phase === 'analyzing' || snapshot.phase === 'deleting';
}

/** UI lifecycle only. The privacy engine remains the sole approval authority. */
export class ReviewSession {
  private documentId = crypto.randomUUID();
  get docId() { return this.documentId; }
  private state: ReviewSnapshot;
  private listeners = new Set<() => void>();
  private revision = 0;

  constructor(private readonly bridge: AiBridge, contract: string) {
    this.state = { contract, phase: 'editing' };
  }

  getSnapshot = (): ReviewSnapshot => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  private update(next: ReviewSnapshot): void {
    this.state = next;
    this.listeners.forEach(listener => listener());
  }

  edit(contract: string): boolean {
    // The UI also makes input read-only while a request is running. Do not
    // accept edits and then let queued sends continue under old approval.
    if (reviewBusy(this.state) || contract === this.state.contract) return false;
    this.revision += 1;
    this.update({ contract, phase: 'editing' });
    return true;
  }

  async deleteDocument(): Promise<void> {
    if (reviewBusy(this.state) || this.state.phase === 'deleted') return;
    const { contract } = this.state;
    this.revision += 1;
    this.update({ contract, phase: 'deleting' });
    try {
      await deleteVault(this.docId);
    } catch {
      this.update({ contract, phase: 'error', error: 'Deletion could not finish. Try deleting this document again.' });
      return;
    }
    this.documentId = crypto.randomUUID();
    this.update({ contract: '', phase: 'deleted' });
  }

  async mask(): Promise<void> {
    if (reviewBusy(this.state)) return;
    const clauses = splitClauses(this.state.contract);
    if (!clauses.length) return;
    const revision = this.revision;
    const contract = this.state.contract;
    this.update({ contract, phase: 'masking' });
    try {
      const start = performance.now();
      const result = await mask(this.docId, clauses, this.bridge);
      if (revision !== this.revision) return;
      this.update({ contract, phase: result.ok ? 'review' : 'blocked', masked: result, ms: performance.now() - start });
    } catch {
      if (revision === this.revision) this.update({ contract, phase: 'error', error: 'Masking could not finish. Try masking again before analysis.' });
    }
  }

  /** Call only from the explicit review/approve action, never after mask(). */
  async analyzeReviewed(): Promise<void> {
    const current = this.state;
    if (current.phase !== 'review' || !current.masked?.ok) return;
    const revision = this.revision;
    this.update({ ...current, phase: 'analyzing', error: undefined, outcome: undefined });
    try {
      // Retain and approve the exact frozen result, not a reconstructed copy.
      const batch = approve(current.masked, { reviewed: true });
      const answer = await this.bridge.analyze(batch);
      assertApproved(batch);
      validateOutcome(answer, batch.docId, batch.clauses.map(clause => clause.id));
      const restored = answer.results.length ? await unmask(answer.docId, answer.results) : [];
      assertApproved(batch);
      if (revision !== this.revision) return;
      this.update({ ...current, phase: 'results', outcome: { restored, failed: answer.failed, ranOn: answer.ranOn } });
    } catch (error) {
      if (revision !== this.revision) return;
      const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
      const message = code === 'stale' ? 'This review is out of date. Mask the current contract again.'
        : code === 'review_required' || code === 'not_approved' ? 'The masked text was not approved. Mask and review it again.'
        : code === 'analysis_unavailable' ? 'No AI execution could be confirmed. Check your connection or on-device availability, then start a new review.'
        : 'Analysis could not finish. It may be disabled or unavailable. Your contract is still available for review.';
      const outcome: ReviewOutcome | undefined = code === 'analysis_unavailable'
        ? { restored: [], failed: current.masked.clauses.map(clause => ({ clauseId: clause.id, reason: 'model_error', detail: 'Analysis was unavailable.' })) }
        : undefined;
      this.update({ ...current, phase: 'error', error: message, outcome });
    }
  }
}

function validateOutcome(answer: AnalyzeResult, docId: string, clauseIds: string[]): void {
  if (answer.docId !== docId || !['cloud', 'device'].includes(answer.ranOn)) throw new Error('Unexpected analysis document/source.');
  const remaining = new Set(clauseIds);
  for (const entry of [...answer.results, ...answer.failed]) {
    if (!remaining.delete(entry.clauseId)) throw new Error('Unexpected or duplicate clause answer.');
  }
  if (remaining.size) throw new Error('Missing clause outcome.');
}
