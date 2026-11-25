import { useEffect, useState, useSyncExternalStore } from 'react';
import { CHAT_LIMITS, sanitizeChatError, type ChatBridge } from '@clause-guard/core/chat';
import type { ReviewSession } from './reviewFlow';
import type { ChatConversation } from './chatFlow';

/** Render for current explicit document approval. The session owns engine authority. */
export function ReviewChat({ session, bridge }: { session: ReviewSession; bridge: ChatBridge }) {
  const review = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => session.closeChat(), [session]);
  function open() {
    try { setConversation(session.openChat(bridge)); setError(null); }
    catch (error) { const safe = sanitizeChatError(error); setError(safe.code === 'stale' ? 'The contract changed. Mask and approve the current document again.' : safe.message); }
  }
  function close() { session.closeChat(); setConversation(null); setError(null); }
  return <section className="contract-chat" aria-labelledby="chat-title">
    <div className="chat-head">
      <h2 id="chat-title">Ask about this contract</h2>
      {conversation && <button className="ghost" onClick={close}>Close chat</button>}
    </div>
    <p className="meta">Questions are masked on this device. Review each preview before sending. Only the approved masked contract, masked question and masked conversation history go to the cloud.</p>
    {!conversation && <button className="ghost" onClick={open}>Prepare a question</button>}
    {error && <p role="alert">{error}</p>}
    {conversation && <ChatPanel conversation={conversation} citationPrefix={review.phase === 'chat' ? 'chat-source-' : 'review-'} />}
    {conversation && review.phase === 'chat' && review.masked?.ok && <section aria-label="Approved masked source clauses">
      <h3>Approved masked source clauses</h3>
      {review.masked.clauses.map(clause => <details key={clause.id} id={`chat-source-${clause.id}`} tabIndex={-1}>
        <summary>Clause {clause.id}</summary><p className="chat-text">{clause.text}</p>
      </details>)}
    </section>}
  </section>;
}

export function ChatPanel({ conversation, citationPrefix = 'review-' }: { conversation: ChatConversation; citationPrefix?: 'review-' | 'chat-source-' }) {
  const chat = useSyncExternalStore(conversation.subscribe, conversation.getSnapshot, conversation.getSnapshot);
  const sending = chat.phase === 'sending';
  if (chat.phase === 'closed') return <>
    <p role="status">Conversation closed. Its local question and history have been cleared.</p>
    {chat.error && <p role="alert">{chat.error} Mask and approve the current document again before starting chat.</p>}
  </>;
  return <>
    {chat.messages.length > 0 && <ol className="chat-history" aria-label="Conversation">
      {chat.messages.map((message, index) => <li key={index}>
        <h3>Your question</h3><p className="chat-text">{message.question}</p>
        <h3>{message.status === 'insufficient_context' ? 'More contract context needed' : 'Preliminary answer'}</h3>
        <p className="meta">Answered in cloud · Details restored on this device · Not legal advice</p>
        <p className="chat-text">{message.answer}</p>
        {message.citations.length > 0 && <nav aria-label={`Sources for answer ${index + 1}`}>
          {message.citations.map(id => <a key={id} href={`#${citationPrefix}${encodeURIComponent(id)}`}>Clause {id}</a>)}
        </nav>}
      </li>)}
    </ol>}
    <label htmlFor="chat-question">Your question</label>
    <textarea id="chat-question" className="chat-question" value={chat.question}
      onChange={event => conversation.editQuestion(event.target.value)} readOnly={sending}
      maxLength={CHAT_LIMITS.question} rows={3} spellCheck={false} autoComplete="off" data-lenis-prevent
      aria-describedby="chat-question-help" />
    <p id="chat-question-help" className="meta">{chat.question.length} / {CHAT_LIMITS.question} characters. Review every masked question; names can be missed. Editing requires a new preview.</p>
    <button className="ghost" disabled={sending || chat.phase === 'masking' || !chat.question.trim()}
      onClick={() => void conversation.prepare()}>{chat.phase === 'masking' ? 'Masking question locally…' : 'Preview masked question'}</button>
    {chat.preview && chat.phase === 'review' && <div className="chat-preview">
      <h3>Review the masked question</h3>
      {renderMaskedPreview(chat.preview.text, chat.preview.reviewWords)}
      <p>Check that private details are replaced. The approved masked contract and masked conversation history would accompany this question.</p>
      {chat.preview.reviewWords.length > 0 && <p role="status">Check these unreplaced words: {chat.preview.reviewWords.join(', ')}. Rephrase any private names and preview again.</p>}
      <button className="primary" onClick={() => void conversation.approveAndSend()}>Approve &amp; send question</button>
    </div>}
    {sending && <p role="status">Checking the approved question…</p>}
    {chat.error && <p className="chat-error" role="alert">{chat.error}</p>}
  </>;
}

/** Presentation only: retain every character and the original engine preview object. */
function renderMaskedPreview(text: string, reviewWords: readonly string[]) {
  const words = new Set(reviewWords);
  const parts = text.split(/(\[[A-Z]+_[A-Z0-9]+\]|(?<![\p{L}\p{M}])\p{Lu}[\p{L}\p{M}'’-]*)/gu);
  return <pre className="chat-text">{parts.map((part, index) => words.has(part) ? <mark key={index}>{part}</mark> : part)}</pre>;
}
