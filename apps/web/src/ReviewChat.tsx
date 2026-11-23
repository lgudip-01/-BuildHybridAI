import { useEffect, useState, useSyncExternalStore } from 'react';
import { CHAT_LIMITS, sanitizeChatError, type ChatBridge } from '@clause-guard/core/chat';
import type { ReviewSession } from './reviewFlow';
import type { ChatConversation } from './chatFlow';

/** Render only for the current document results. The session owns engine authority. */
export function ReviewChat({ session, bridge }: { session: ReviewSession; bridge: ChatBridge }) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => session.closeChat(), [session]);
  function open() {
    try { setConversation(session.openChat(bridge)); setError(null); }
    catch (error) { setError(sanitizeChatError(error).message); }
  }
  function close() { session.closeChat(); setConversation(null); setError(null); }
  return <section className="contract-chat" aria-labelledby="chat-title">
    <div className="chat-head">
      <h2 id="chat-title">Ask about this contract</h2>
      {conversation && <button className="ghost" onClick={close}>Close chat</button>}
    </div>
    <p className="meta">Chat is awaiting release checks. You can prepare a masked question locally; no question can be sent yet.</p>
    {!conversation && <button className="ghost" onClick={open}>Prepare a question</button>}
    {error && <p role="alert">{error}</p>}
    {conversation && <ChatPanel conversation={conversation} />}
  </section>;
}

export function ChatPanel({ conversation }: { conversation: ChatConversation }) {
  const chat = useSyncExternalStore(conversation.subscribe, conversation.getSnapshot, conversation.getSnapshot);
  const sending = chat.phase === 'sending';
  if (chat.phase === 'closed') return <p role="status">Conversation closed. Its local question and history have been cleared.</p>;
  return <>
    {chat.messages.length > 0 && <ol className="chat-history" aria-label="Conversation">
      {chat.messages.map((message, index) => <li key={index}>
        <h3>Your question</h3><p className="chat-text">{message.question}</p>
        <h3>{message.status === 'insufficient_context' ? 'More contract context needed' : 'Preliminary answer'}</h3>
        <p className="meta">Answered in cloud · Details restored on this device · Not legal advice</p>
        <p className="chat-text">{message.answer}</p>
        {message.citations.length > 0 && <nav aria-label={`Sources for answer ${index + 1}`}>
          {message.citations.map(id => <a key={id} href={`#review-${encodeURIComponent(id)}`}>Clause {id}</a>)}
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
      <pre className="chat-text">{chat.preview.text}</pre>
      <p>Check that private details are replaced. The approved masked contract and masked conversation history would accompany this question.</p>
      {chat.preview.reviewWords.length > 0 && <p role="status">Check these unreplaced words: {chat.preview.reviewWords.join(', ')}. Rephrase any private names and preview again.</p>}
      <button className="primary" onClick={() => void conversation.approveAndSend()}>Approve question &amp; try sending</button>
    </div>}
    {sending && <p role="status">Checking the approved question…</p>}
    {chat.error && <p className="chat-error" role="alert">{chat.error}</p>}
  </>;
}
