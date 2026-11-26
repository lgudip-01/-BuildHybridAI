import 'fake-indexeddb/auto';
import { expect, it } from 'vitest';
import type { AiBridge } from '@clause-guard/core/types';
import { mask } from './mask';

it.each(['maria@example.com', 'https://example.com/u/maria'])('still asks for review when a model-only name also occurs inside %s', async contact => {
  const bridge: AiBridge = {
    onDeviceStatus:async()=> 'available',
    onDevice:async()=>JSON.stringify({type:'other',entities:[{text:'maria',kind:'person',party:false}]}),
    analyze:async()=>{throw new Error('No cloud calls in review');},
  };
  const result=await mask(`review-pr32-${contact}`, [
    {id:'c1',index:0,text:`Contact: ${contact}`},
    {id:'c2',index:1,text:'maria will sign; anna will witness.'},
  ],bridge);
  expect(result.ok).toBe(true);
  if(!result.ok) return;
  expect(result.clauses[1]!.text).not.toContain('maria');
  expect(result.clauses[1]!.text).toContain('anna');
  // Name recognition is still model-dependent; matching a word inside a
  // separately masked contact string is not rule coverage of the standalone name.
  expect(result.needsReview).toBe(true);
});

it.each([
  ['Northwind Analytics, Inc. ("Northwind") will perform.','Northwind','organization'],
  ['Jane Smith will perform; Jane agrees.','Jane','person'],
  ['Aurora Global Systems Solutions, Inc. ("Aurora") will perform.','Aurora','organization'],
])('keeps actual rule-derived aliases covered: %s',async (source,name,kind)=>{
  const bridge:AiBridge={onDeviceStatus:async()=> 'available',onDevice:async()=>JSON.stringify({type:'other',entities:[{text:name,kind,party:false}]}),analyze:async()=>{throw new Error('not used');}};
  const result=await mask(`review-alias-${name}`,[{id:'c1',index:0,text:source}],bridge);
  expect(result.ok).toBe(true); if(!result.ok)return;
  expect(result.needsReview).toBe(false);
});
