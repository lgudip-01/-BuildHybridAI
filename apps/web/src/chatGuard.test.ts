import { expect, it, vi } from 'vitest';
import type { AI } from 'firebase/ai';
import type { ApprovedChatContext, ApprovedChatQuestion } from '@clause-guard/core/chat';
const mock = vi.hoisted(()=>({factory:vi.fn(),config:vi.fn(),native:vi.fn()}));
vi.mock('@capacitor/core',()=>({registerPlugin:()=>({chat:mock.native})}));
vi.mock('firebase/ai', async original=>({...await original<typeof import('firebase/ai')>(),getGenerativeModel:mock.factory}));
vi.mock('./analysisConfig',()=>({loadAnalysisConfig:mock.config}));
import { CloudChatBridge } from './cloudChat';
import { NativeChatBridge } from './nativeChat';
import { ChatConversation } from './chatFlow';
import { prepareChatContext, maskQuestion, approveQuestion, unmaskChatReply, closeChatContext } from './chatEngine';
import { assertChatApproved, assertChatCurrent, consumeChatQuestion } from './chatGuard';

it('real production boundary cannot authorize a forged ticket or make configuration/model requests', async()=>{
  const context=Object.freeze({sessionId:'s',docId:'d',revision:'r',clauses:Object.freeze([])}) as ApprovedChatContext;
  const question=Object.freeze({sessionId:'s',revision:'r',turnId:'t',text:'private raw question',__brand:'approvedChatQuestion'}) as ApprovedChatQuestion;
  for(const guard of [assertChatApproved,assertChatCurrent,consumeChatQuestion]) expect(()=>guard(context,question)).toThrow(expect.objectContaining({code:'not_approved'}));
  await expect(new CloudChatBridge({app:{}} as AI).ask(context,question)).rejects.toMatchObject({code:'not_approved'});
  expect(mock.config).not.toHaveBeenCalled(); expect(mock.factory).not.toHaveBeenCalled();
});

it('real native boundary and every engine integration seam remain fail closed', async()=>{
  const context=Object.freeze({sessionId:'s',docId:'d',revision:'r',clauses:Object.freeze([])}) as ApprovedChatContext;
  const question=Object.freeze({sessionId:'s',revision:'r',turnId:'t',text:'private raw question',__brand:'approvedChatQuestion'}) as ApprovedChatQuestion;
  await expect(new NativeChatBridge().ask(context,question)).rejects.toMatchObject({code:'not_approved'});
  const batch={docId:'d',clauses:[]};
  expect(()=>prepareChatContext(batch)).toThrow(expect.objectContaining({code:'not_approved'}));
  expect(()=>closeChatContext(context)).toThrow(expect.objectContaining({code:'not_approved'}));
  const local={} as import('@clause-guard/core/types').AiBridge;
  const preview={...question,reviewWords:[],needsReview:true as const};
  await expect(maskQuestion(context,'private raw question',local)).rejects.toMatchObject({code:'not_approved'});
  expect(()=>approveQuestion(context,preview,{reviewed:true})).toThrow(expect.objectContaining({code:'not_approved'}));
  await expect(unmaskChatReply(context,question,{} as import('@clause-guard/core/chat').ChatReply)).rejects.toMatchObject({code:'not_approved'});
  expect(()=>new ChatConversation(batch,local,new NativeChatBridge())).toThrow(expect.objectContaining({code:'not_approved'}));
  expect(mock.native).not.toHaveBeenCalled(); expect(mock.config).not.toHaveBeenCalled(); expect(mock.factory).not.toHaveBeenCalled();
});
