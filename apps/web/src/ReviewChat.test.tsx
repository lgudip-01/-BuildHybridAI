import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AiBridge } from '@clause-guard/core/types';
import { assertApproved } from '@clause-guard/privacy-engine/approval';
import { ApprovedChatDispatcher } from './chatDispatch';
import { ReviewSession } from './reviewFlow';
const hooks = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0, cleanups: [] as (() => void)[] }));
// Render actual event handlers with persistent state; the real session/controller,
// engine authority and unconditional outbound release check are retained.
vi.mock('react', async original => ({ ...await original<typeof import('react')>(),
  useState: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (next: unknown) => { hooks.values[index] = next; }];
  },
  useEffect: (effect: () => (() => void) | void) => { const cleanup = effect(); if (cleanup) hooks.cleanups.push(cleanup); },
  useSyncExternalStore: (_subscribe: unknown, snapshot: () => unknown) => snapshot(),
}));
import { ReviewChat, ChatPanel } from './ReviewChat';
import type { ChatConversation } from './chatFlow';
const transport = { loadConfig: vi.fn(), prepare: vi.fn() };
const cloud = new ApprovedChatDispatcher({}, transport);
const local: AiBridge = {
  onDeviceStatus: async () => 'unavailable', onDevice: async () => { throw new Error('No model'); },
  analyze: async batch => { assertApproved(batch); return { docId: batch.docId, results: [],
    failed: batch.clauses.map(c => ({ clauseId: c.id, reason: 'model_error', detail: 'Synthetic unavailable fixture' })), ranOn: 'device' }; },
};
beforeEach(() => { hooks.values = []; hooks.cursor = 0; hooks.cleanups = []; vi.clearAllMocks(); });
function render(session: ReviewSession) { hooks.cursor = 0; return ReviewChat({ session, bridge: cloud }); }
function elements(node: unknown, type: unknown): { props: Record<string, any> }[] {
  if (Array.isArray(node)) return node.flatMap(child => elements(child, type));
  if (!node || typeof node !== 'object') return [];
  const element = node as { type?: unknown; props?: Record<string, any> };
  return [...(element.type === type && element.props ? [element as { props: Record<string, any> }] : []), ...elements(element.props?.children, type)];
}
function button(tree: unknown, label: string) {
  const match = elements(tree, 'button').find(e => e.props.children === label);
  if (!match) throw new Error('Missing button: ' + label);
  return match.props.onClick as () => void;
}
async function open() {
  const session = new ReviewSession(local, 'By: Lucia Martinez\nPayment is $100.');
  await session.mask(); await session.analyzeReviewed();
  button(render(session), 'Prepare a question')();
  const tree = render(session);
  return { session, conversation: elements(tree, ChatPanel)[0]!.props.conversation as ChatConversation };
}
it('does not open automatically and refuses the open action before document approval', () => {
  const session = new ReviewSession(local, 'Payment is $100.');
  expect(elements(render(session), ChatPanel)).toHaveLength(0);
  button(render(session), 'Prepare a question')();
  const tree = render(session);
  expect(elements(tree, ChatPanel)).toHaveLength(0);
  expect(renderToStaticMarkup(tree)).toContain('Chat requires a current question approved by the privacy engine.');
  expect(transport.loadConfig).not.toHaveBeenCalled();
});
it('requires explicit question preview and approval; actual release stop renders without adding an answer', async () => {
  const { conversation } = await open();
  let tree = ChatPanel({ conversation });
  elements(tree, 'textarea')[0]!.props.onChange({ target: { value: 'What must Lucia pay?' } });
  expect(conversation.getSnapshot().phase).toBe('editing');
  tree = ChatPanel({ conversation });
  expect(elements(tree, 'pre')).toHaveLength(0);
  button(tree, 'Preview masked question')();
  await vi.waitFor(() => expect(conversation.getSnapshot().phase).toBe('review'));
  tree = ChatPanel({ conversation });
  const preview = elements(tree, 'pre')[0]!.props.children as string;
  expect(preview).not.toContain('Lucia'); expect(preview).toMatch(/\[[A-Z]+_[A-Z0-9]+\]/);
  expect(transport.loadConfig).not.toHaveBeenCalled();
  button(tree, 'Approve question & try sending')();
  await vi.waitFor(() => expect(conversation.getSnapshot().phase).toBe('error'));
  expect(renderToStaticMarkup(ChatPanel({ conversation }))).toContain('No question was sent.');
  expect(conversation.getSnapshot().messages).toHaveLength(0);
  expect(conversation.getSnapshot().preview).toBeUndefined();
  expect(transport.loadConfig).not.toHaveBeenCalled(); expect(transport.prepare).not.toHaveBeenCalled();
});
it('editing a question removes its approval action and renders raw input as text', async () => {
  const { conversation } = await open();
  conversation.editQuestion('What must Lucia pay?'); await conversation.prepare();
  const tree = ChatPanel({ conversation });
  elements(tree, 'textarea')[0]!.props.onChange({ target: { value: '<script>PRIVATE_EDIT()</script>' } });
  const html = renderToStaticMarkup(ChatPanel({ conversation }));
  expect(html).not.toContain('Approve question'); expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;script&gt;PRIVATE_EDIT()&lt;/script&gt;');
  expect(conversation.getSnapshot().phase).toBe('editing'); expect(transport.loadConfig).not.toHaveBeenCalled();
});
it.each(['close', 'document edit', 'unmount'])('%s clears the local draft and invalidates the old conversation', async action => {
  const { session, conversation } = await open(); conversation.editQuestion('LOCAL_DRAFT_SENTINEL');
  if (action === 'close') button(render(session), 'Close chat')();
  else if (action === 'document edit') session.edit('Replacement contract.');
  else hooks.cleanups[0]!();
  expect(conversation.getSnapshot()).toMatchObject({ phase: 'closed', question: '', messages: [] });
  expect(renderToStaticMarkup(ChatPanel({ conversation }))).not.toContain('LOCAL_DRAFT_SENTINEL');
  expect(transport.loadConfig).not.toHaveBeenCalled();
});
it('displays restored answers as escaped text and anchors only their supplied clause references', () => {
  const snapshot = { phase: 'editing' as const, question: '', messages: [{
    question: '<img src=x onerror=PRIVATE()>', answer: '<script>ANSWER()</script>',
    status: 'insufficient_context' as const, citations: ['c1'], ranOn: 'cloud' as const,
  }] };
  // Display-only fixture: never submitted to an engine or transport.
  const conversation = { getSnapshot: () => snapshot, subscribe: () => () => {} } as unknown as ChatConversation;
  const html = renderToStaticMarkup(ChatPanel({ conversation }));
  expect(html).toContain('More contract context needed');
  expect(html).toContain('Details restored on this device');
  expect(html).toContain('href="#review-c1"');
  expect(html).not.toContain('<script>'); expect(html).not.toContain('<img');
  expect(html).toContain('&lt;script&gt;ANSWER()&lt;/script&gt;');
});
