import { expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { ApprovedChatContext, ApprovedChatQuestion } from '@clause-guard/core/chat';
const mock = vi.hoisted(()=>({factory:vi.fn(),config:vi.fn()}));
vi.mock('firebase/ai', async original=>({...await original<typeof import('firebase/ai')>(),getGenerativeModel:mock.factory}));
vi.mock('./analysisConfig',()=>({loadAnalysisConfig:mock.config}));
import { CloudChatBridge } from './cloudChat';
import { assertChatApproved, assertChatCurrent, consumeChatQuestion } from './chatGuard';

it('real production boundary cannot authorize a forged ticket or make configuration/model requests', async()=>{
  const context=Object.freeze({sessionId:'s',docId:'d',revision:'r',clauses:Object.freeze([])}) as ApprovedChatContext;
  const question=Object.freeze({sessionId:'s',revision:'r',turnId:'t',text:'private raw question',__brand:'approvedChatQuestion'}) as ApprovedChatQuestion;
  for(const guard of [assertChatApproved,assertChatCurrent,consumeChatQuestion]) expect(()=>guard(context,question)).toThrow(expect.objectContaining({code:'not_approved'}));
  await expect(new CloudChatBridge({app:{}} as AI).ask(context,question)).rejects.toMatchObject({code:'not_approved'});
  expect(mock.config).not.toHaveBeenCalled(); expect(mock.factory).not.toHaveBeenCalled();
});
