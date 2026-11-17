export type Clause = { id: string; index: number; heading?: string; text: string };

export const CLAUSE_TYPES = [
  'payment',
  'termination',
  'confidentiality',
  'ip',
  'liability',
  'indemnity',
  'non_compete',
  'governing_law',
  'other',
] as const;

export type ClauseType = (typeof CLAUSE_TYPES)[number];

export type EntityKind =
  | 'PARTY'
  | 'PERSON'
  | 'ORG'
  | 'NAME'
  | 'ADDRESS'
  | 'AMOUNT'
  | 'DATE'
  | 'EMAIL'
  | 'PHONE'
  | 'ACCOUNT';

// Text that passed the leak check. Only privacy/leakCheck.ts creates one,
// and the cloud call only accepts this type, so raw text can't be sent by mistake.
export type CleanText = string & { readonly __brand: 'leakChecked' };

export type MaskedClause = { id: string; type?: ClauseType; text: CleanText };

// Never holds the real value.
export type LedgerEntry = { placeholder: string; kind: EntityKind; clauseIds: string[] };

export type Leak = { clauseId: string; snippet: string; reason: string };

export type MaskResult =
  // needsReview: masking ran without the on-device model, so the user must approve the text before it is sent.
  | { ok: true; clauses: MaskedClause[]; ledger: LedgerEntry[]; needsReview: boolean }
  | { ok: false; leaks: Leak[] };

export type Analysis = {
  clauseId: string;
  risk: 'low' | 'medium' | 'high';
  explanation: string;
  redline: string;
  questions: string[];
};

// Only the privacy engine's approve() creates a valid runtime batch.
export type ApprovedBatch = {
  readonly docId: string;
  readonly clauses: readonly MaskedClause[];
};

export type ClauseFailure = {
  clauseId: string;
  reason: 'unknown_placeholder' | 'invalid_response' | 'model_error';
  detail: string;
};

export type AnalyzeResult = {
  docId: string;
  results: Analysis[];
  failed: ClauseFailure[];
  ranOn: 'cloud' | 'device';
};

export type OnDeviceStatus = 'available' | 'downloadable' | 'downloading' | 'unavailable';

export interface AiBridge {
  onDeviceStatus(): Promise<OnDeviceStatus>;
  // ONLY_ON_DEVICE. The only call allowed to see raw contract text.
  onDevice(prompt: string, schema?: object): Promise<string>;
  // PREFER_IN_CLOUD. Requires the privacy engine's runtime approval guard.
  analyze(batch: ApprovedBatch): Promise<AnalyzeResult>;
}
