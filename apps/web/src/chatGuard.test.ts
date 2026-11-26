import { expect, it, vi } from 'vitest';
import 'fake-indexeddb/auto';
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

it('real native boundary and direct engine bindings reject every forged input', async()=>{
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

it('a genuine approved question cannot dispatch native chat before native release', async()=>{
  const { mask } = await import('@clause-guard/privacy-engine/mask');
  const { approve } = await import('@clause-guard/privacy-engine/approval');
  const local: import('@clause-guard/core/types').AiBridge = {
    onDeviceStatus: async()=> 'unavailable', onDevice: async()=> { throw new Error('No device model'); },
    analyze: async()=> { throw new Error('No analysis provider'); },
  };
  const result = await mask(crypto.randomUUID(),[{id:'c1',index:0,text:'By: Lucia Martinez\nPayment is $100.'}],local);
  if(!result.ok) throw new Error('Real masking fixture failed');
  const context=prepareChatContext(approve(result,{reviewed:true}));
  const draft=await maskQuestion(context,'What must Lucia pay?',local);
  const question=approveQuestion(context,draft,{reviewed:true});
  assertChatApproved(context,question);
  for(const bridge of [new NativeChatBridge()]) {
    await expect(bridge.ask(context,question)).rejects.toMatchObject({code:'release_pending'});
    assertChatApproved(context,question); // Disabled transports do not consume it.
  }
  expect(mock.config).not.toHaveBeenCalled(); expect(mock.factory).not.toHaveBeenCalled(); expect(mock.native).not.toHaveBeenCalled();
  closeChatContext(context);
});
