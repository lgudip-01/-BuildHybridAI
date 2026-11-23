import type { AiBridge, ApprovedBatch, EntityKind } from '@clause-guard/core/types';
import { validateBatch } from '@clause-guard/core/analysis';
import { CHAT_LIMITS, ChatError, chatPlaceholders, sanitizeChatError, validateChatContent,
  type ApprovedChatContext, type ApprovedChatQuestion, type ChatQuestionPreview, type ChatReply } from '@clause-guard/core/chat';
import { approvedChatSnapshot, isCurrent, onApprovedRunInvalidated, type Run } from './approval';
import { streetAlias } from './chatSnapshot';
import { leakCheck } from './leakCheck';
import { normalize, toEntity, type Entity } from './merge';
import { readClause } from './onDevice';
import { PLACEHOLDER } from './placeholders';
import { findNames, findPatterns, type Span } from './regex';

export const CHAT_ENGINE_LIMITS = Object.freeze({ tokens: 512, drafts: 64, localTimeoutMs: 60_000 });
type Alias = { value: string; tokens: Set<string>; uncertain: boolean };
type State = {
  context: ApprovedChatContext; run: Run; closed: boolean;
  entries: Map<string, string>; aliases: Map<string, Alias>; counts: Map<string, number>;
  contractTokens: Set<string>; completedTokens: Set<string>; drafts: number; unsubscribe: () => void;
};
type Draft = { state: State; approved: boolean };
type Ticket = { state: State; consumed: boolean; allowed: Set<string> };
const contexts = new WeakMap<object, State>();
const drafts = new WeakMap<object, Draft>();
const tickets = new WeakMap<object, Ticket>();
const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;
const TOKEN = /^\[([A-Z]+)_([A-Z0-9]+)\]$/;
const QUESTION_WORD = /\b(?:What|When|Where|Who|Why|How|Does|Do|Did|Is|Are|Can|Could|Should|Would|Will|Please|Tell|Explain)\b/g;
const MODEL_QUESTION_LEAD = /^(?:What|When|Where|Who|Why|How|Does|Do|Did|Is|Are|Can|Could|Should|Would|Please|Tell|Explain)\b/i;

function stateFor(context: ApprovedChatContext): State {
  const state = isObject(context) ? contexts.get(context) : undefined;
  if (!state) throw new ChatError('not_approved');
  if (state.closed || !isCurrent(state.run)) { release(state); throw new ChatError('stale'); }
  return state;
}
function release(state: State): void {
  state.closed = true; state.unsubscribe(); state.entries.clear(); state.aliases.clear();
  state.counts.clear(); state.contractTokens.clear(); state.completedTokens.clear();
}

/** Only an actual current approve(mask(...)) batch can create this context. */
export function prepareChatContext(batch: ApprovedBatch): ApprovedChatContext {
  try {
    const { run, snapshot } = approvedChatSnapshot(batch);
    validateBatch(batch);
    if (Object.keys(snapshot.entries).length > CHAT_ENGINE_LIMITS.tokens) throw new ChatError('history_limit');
    const clauses = Object.freeze(batch.clauses.map(c => Object.freeze({ id: c.id, ...(c.type && { type: c.type }), text: c.text })));
    const contractTokens = chatPlaceholders(clauses.map(c => c.text));
    if ([...contractTokens].some(token => !Object.hasOwn(snapshot.entries, token))) throw new ChatError('unknown_placeholder');
    const context = Object.freeze({ sessionId: crypto.randomUUID(), docId: batch.docId,
      revision: `run-${run.run}`, clauses });
    const counts = new Map<string, number>();
    for (const token of Object.keys(snapshot.entries)) {
      const match = TOKEN.exec(token);
      if (!match) throw new ChatError('invalid_response');
      const kind = match[1]!, suffix = match[2]!;
      const n = kind === 'PARTY' && /^[A-Z]+$/.test(suffix)
        ? [...suffix].reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) : Number(suffix);
      if (!Number.isSafeInteger(n) || n < 1) throw new ChatError('invalid_response');
      counts.set(kind, Math.max(counts.get(kind) ?? 0, n));
    }
    const state: State = { context, run, closed: false, entries: new Map(Object.entries(snapshot.entries)),
      aliases: new Map(snapshot.aliases.map(a => [normalize(a.value), { value: a.value, tokens: new Set(a.tokens), uncertain: a.uncertain === true }])),
      counts, contractTokens, completedTokens: new Set(), drafts: 0, unsubscribe: () => {} };
    state.unsubscribe = onApprovedRunInvalidated(batch, () => release(state));
    contexts.set(context, state);
    return context;
  } catch (error) {
    // Existing analysis validation errors can carry detailed input; do not expose them.
    if (error instanceof ChatError || (isObject(error) && 'code' in error)) throw sanitizeChatError(error);
    throw new ChatError('invalid_response');
  }
}

type Candidate = Span & { rank: number; alias?: Alias; entity?: Entity };
function occurrences(text: string, value: string): { start: number; end: number; text: string }[] {
  const escaped = value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  if (!escaped) return [];
  return [...text.matchAll(new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu'))]
    .map(match => ({ start: match.index, end: match.index + match[0].length, text: match[0] }));
}
const overlap = (a: { start: number; end: number }, b: { start: number; end: number }) => a.start < b.end && b.start < a.end;
function selected(candidates: Candidate[]): Candidate[] {
  const kept: Candidate[] = [];
  for (const c of candidates.sort((a, b) => (b.end - b.start) - (a.end - a.start) || a.rank - b.rank)) {
    if (!kept.some(k => overlap(c, k))) kept.push(c);
  }
  return kept.sort((a, b) => a.start - b.start);
}
async function localReading(bridge: AiBridge, raw: string): Promise<Entity[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      (async () => (await bridge.onDeviceStatus()) === 'available'
        ? (await readClause(bridge, { id: 'question', index: 0, text: raw })).entities : [])(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new ChatError('model_error')), CHAT_ENGINE_LIMITS.localTimeoutMs); }),
    ]);
  } catch { return []; } finally { if (timer) clearTimeout(timer); }
}
function letters(n: number): string {
  let result = '';
  for (let value = n; value; value = Math.floor((value - 1) / 26)) result = String.fromCharCode(65 + (value - 1) % 26) + result;
  return result;
}

/** Local only. Never calls document mask(), reads/writes a vault, or sends a cloud request. */
export async function maskQuestion(context: ApprovedChatContext, raw: string, bridge: AiBridge): Promise<ChatQuestionPreview> {
  const state = stateFor(context);
  if (typeof raw !== 'string' || !raw.trim() || raw.length > CHAT_LIMITS.question) throw new ChatError('invalid_response');
  if (state.drafts >= CHAT_ENGINE_LIMITS.drafts) throw new ChatError('history_limit');
  // Prevent a typed/fabricated placeholder from reserving or impersonating a new token.
  validateChatContent(JSON.stringify({ status: 'insufficient_context', answer: raw, citations: [] }), new Set(state.entries.keys()), new Set());
  // A question can introduce a person or organization, but cannot establish
  // that it is a party to the approved document. Only reuse a known PARTY token.
  const modelEntities = (await localReading(bridge, raw)).map(entity => entity.kind === 'PARTY'
    ? { ...entity, kind: (entity.base === 'person' ? 'PERSON' : entity.base === 'org' ? 'ORG' : 'NAME') as EntityKind } : entity);
  stateFor(context); // Covers remask, close, model/status failure and late completion.
  if (state.drafts >= CHAT_ENGINE_LIMITS.drafts) throw new ChatError('history_limit');
  const protectedRanges = [...raw.matchAll(PLACEHOLDER)].map(m => ({ start: m.index, end: m.index + m[0].length }));
  const candidates: Candidate[] = [];
  for (const alias of state.aliases.values()) for (const hit of occurrences(raw, alias.value)) {
    const token = [...alias.tokens][0];
    candidates.push({ ...hit, value: alias.value, kind: (token?.match(TOKEN)?.[1] ?? 'NAME') as EntityKind, rank: 0, alias });
  }
  candidates.push(...findPatterns(raw).map(span => ({ ...span, rank: 1 })));
  const nameSource = raw.replace(QUESTION_WORD, word => ' '.repeat(word.length));
  const names = findNames(nameSource, true).map(span => ({ ...span, value: raw.slice(span.start, span.end), rank: 3 }));
  candidates.push(...names.map(span => ({ ...span, entity: toEntity(span.kind, span.value,
    span.kind === 'PERSON' ? 'person' : span.kind === 'ORG' ? 'org' : 'other') })));
  for (const entity of modelEntities.filter(e => !MODEL_QUESTION_LEAD.test(e.value))) {
    for (const hit of occurrences(raw, entity.value)) candidates.push({ ...hit, value: entity.value, kind: entity.kind, rank: 2, entity });
  }
  const known = candidates.filter(c => c.alias);
  const spans = selected(candidates.filter(c => {
    if (protectedRanges.some(range => overlap(c, range))) return false;
    if (c.alias || c.rank === 1) return true;
    const contained = known.filter(k => c.start <= k.start && c.end >= k.end && (c.start !== k.start || c.end !== k.end));
    // A broad/model phrase cannot swallow an already known full identity or a
    // coordinated group. A genuinely new typed full name may share a short name.
    if (contained.some(k => /\s/.test(k.value))) return false;
    if (c.rank === 3 && contained.length) {
      if (contained.length >= 2) return false;
      if (!candidates.some(m => m.rank === 2 && m.start === c.start && m.end === c.end)) throw new ChatError('ambiguous_entity');
      return false;
    }
    return true;
  }));
  const entries = new Map(state.entries), counts = new Map(state.counts);
  const aliases = new Map([...state.aliases].map(([key, a]) => [key, { ...a, tokens: new Set(a.tokens) }]));
  const addAlias = (value: string, token: string, uncertain = false) => {
    if (value.trim().length < 2) return;
    const key = normalize(value), alias = aliases.get(key) ?? { value, tokens: new Set<string>(), uncertain: false };
    if (token) alias.tokens.add(token); alias.uncertain ||= uncertain; aliases.set(key, alias);
  };
  const replacements: string[] = [];
  for (const [i, span] of spans.entries()) {
    if (span.alias) continue;
    let token = [...entries].find(([key, value]) => key.startsWith(`[${span.kind}_`) && normalize(value) === normalize(span.value))?.[0];
    if (!token) {
      if (entries.size >= CHAT_ENGINE_LIMITS.tokens) throw new ChatError('history_limit');
      const n = (counts.get(span.kind) ?? 0) + 1; counts.set(span.kind, n);
      token = `[${span.kind}_${span.kind === 'PARTY' ? letters(n) : n}]`;
      if (entries.has(token)) throw new ChatError('invalid_response');
      entries.set(token, span.value);
    }
    replacements[i] = token; addAlias(span.value, token);
    for (const variant of span.entity?.variants ?? []) addAlias(variant, token);
    if (span.kind === 'ADDRESS') { const street = streetAlias(span.value); if (street) addAlias(street, token); }
    if (span.kind === 'NAME') {
      const parts = span.value.split(/\s+/);
      if (parts.length > 1) for (const part of [parts[0]!, parts.at(-1)!]) if (part.length >= 3) addAlias(part, '', true);
    }
  }
  const aliasToken = (alias: Alias): string => {
    if (alias.uncertain || alias.tokens.size !== 1) throw new ChatError('ambiguous_entity');
    return [...alias.tokens][0]!;
  };
  // Resolve old short forms only AFTER every new full identity is registered,
  // including a new person sharing an earlier first name in this same question.
  for (const [i, span] of spans.entries()) if (span.alias) {
    replacements[i] = aliasToken(aliases.get(normalize(span.alias.value))!);
  }
  let masked = raw;
  for (let i = spans.length - 1; i >= 0; --i) masked = masked.slice(0, spans[i]!.start) + replacements[i] + masked.slice(spans[i]!.end);
  // New aliases may occur again later in the same question. This pass reuses
  // them, never allocates more tokens, and rejects new same-question ambiguity.
  const maskedRanges = [...masked.matchAll(PLACEHOLDER)].map(m => ({ start: m.index, end: m.index + m[0].length }));
  const repeats: Candidate[] = [];
  for (const alias of aliases.values()) for (const hit of occurrences(masked, alias.value)) {
    if (!maskedRanges.some(range => overlap(hit, range))) repeats.push({ ...hit, value: alias.value, kind: 'NAME', rank: 0, alias });
  }
  const repeated = selected(repeats);
  for (let i = repeated.length - 1; i >= 0; --i) {
    const span = repeated[i]!, token = aliasToken(span.alias!);
    masked = masked.slice(0, span.start) + token + masked.slice(span.end);
  }
  const knownValues = [...entries.values(), ...[...aliases.values()].map(a => a.value)];
  const checked = leakCheck([{ id: 'question', text: masked }], knownValues);
  if (!checked.ok) throw new ChatError('privacy_check_failed');
  if (masked.length > CHAT_LIMITS.question) throw new ChatError('invalid_response');
  const reviewWords = Object.freeze([...new Set(masked.replace(PLACEHOLDER, ' ').match(/(?<![\p{L}\p{M}])\p{Lu}[\p{L}\p{M}'’-]*/gu) ?? [])]);
  stateFor(context);
  // One synchronous commit after every await/validation. Failed or stale work
  // cannot overwrite the append-only map or publish a half-registered draft.
  state.entries = entries; state.aliases = aliases; state.counts = counts; ++state.drafts;
  const preview: ChatQuestionPreview = Object.freeze({ sessionId: context.sessionId, revision: context.revision,
    turnId: crypto.randomUUID(), text: checked.clauses[0]!.text, reviewWords, needsReview: true });
  drafts.set(preview, { state, approved: false });
  return preview;
}

export function approveQuestion(context: ApprovedChatContext, preview: ChatQuestionPreview, options: { reviewed?: boolean } = {}): ApprovedChatQuestion {
  const state = stateFor(context), draft = isObject(preview) ? drafts.get(preview) : undefined;
  if (!draft) throw new ChatError('not_approved');
  if (draft.state !== state) throw new ChatError('wrong_session');
  if (options.reviewed !== true) throw new ChatError('review_required');
  if (draft.approved) throw new ChatError('turn_consumed');
  const question: ApprovedChatQuestion = Object.freeze({ sessionId: context.sessionId, revision: context.revision,
    turnId: preview.turnId, text: preview.text, __brand: 'approvedChatQuestion' });
  const allowed = new Set([...state.contractTokens, ...state.completedTokens, ...chatPlaceholders([preview.text])]);
  draft.approved = true; tickets.set(question, { state, consumed: false, allowed });
  return question;
}
function ticketFor(context: ApprovedChatContext, question: ApprovedChatQuestion): Ticket {
  const state = stateFor(context), ticket = isObject(question) ? tickets.get(question) : undefined;
  if (!ticket) throw new ChatError('not_approved');
  if (ticket.state !== state) throw new ChatError('wrong_session');
  return ticket;
}
export function assertChatApproved(context: ApprovedChatContext, question: ApprovedChatQuestion): void {
  if (ticketFor(context, question).consumed) throw new ChatError('turn_consumed');
}
export function consumeChatQuestion(context: ApprovedChatContext, question: ApprovedChatQuestion): void {
  assertChatApproved(context, question); // All checks and consumption in ONE synchronous call.
  tickets.get(question)!.consumed = true;
}
export function assertChatCurrent(context: ApprovedChatContext, question: ApprovedChatQuestion): void { ticketFor(context, question); }

/** Restores only a consumed/current turn, into a NEW local display object. */
export async function unmaskChatReply(context: ApprovedChatContext, question: ApprovedChatQuestion, reply: ChatReply): Promise<ChatReply> {
  const ticket = ticketFor(context, question);
  if (!ticket.consumed) throw new ChatError('not_approved');
  await Promise.resolve();
  const state = stateFor(context); assertChatCurrent(context, question);
  if (!isObject(reply) || !Object.isFrozen(reply) || !Object.isFrozen(reply.citations) ||
      reply.sessionId !== context.sessionId || reply.docId !== context.docId || reply.revision !== context.revision ||
      reply.turnId !== question.turnId || reply.ranOn !== 'cloud') throw new ChatError('invalid_response');
  const content = validateChatContent(JSON.stringify({ status: reply.status, answer: reply.answer, citations: reply.citations }),
    ticket.allowed, new Set(context.clauses.map(c => c.id)));
  const checked = leakCheck([{ id: 'reply', text: content.answer }], [...state.entries.values(), ...[...state.aliases.values()].map(a => a.value)]);
  if (!checked.ok) throw new ChatError('privacy_check_failed');
  const restored = content.answer.replace(PLACEHOLDER, token => {
    const value = state.entries.get(token);
    if (value === undefined) throw new ChatError('unknown_placeholder');
    return value;
  });
  assertChatCurrent(context, question);
  for (const token of chatPlaceholders([question.text, content.answer])) state.completedTokens.add(token);
  return Object.freeze({ status: content.status, answer: restored, citations: Object.freeze([...content.citations]),
    sessionId: context.sessionId, docId: context.docId, revision: context.revision, turnId: question.turnId, ranOn: 'cloud' });
}
export function closeChatContext(context: ApprovedChatContext): void {
  const state = isObject(context) ? contexts.get(context) : undefined;
  if (!state) throw new ChatError('not_approved');
  release(state);
}
