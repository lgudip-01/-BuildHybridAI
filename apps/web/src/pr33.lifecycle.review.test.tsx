import 'fake-indexeddb/auto';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AiBridge } from '@clause-guard/core/types';
import type { ReviewSession } from './reviewFlow';
const mock=vi.hoisted(()=>({read:vi.fn(),sessions:[] as unknown[],updates:[] as unknown[]}));
vi.mock('./importDocument',()=>({readDocument:mock.read}));
vi.mock('./reviewFlow',async original=>{
  const actual=await original<typeof import('./reviewFlow')>();
  return {...actual,ReviewSession:class extends actual.ReviewSession {
    constructor(...args:ConstructorParameters<typeof actual.ReviewSession>){super(...args);mock.sessions.push(this);}
  }};
});
// Capture the component's actual event handlers without adding a DOM dependency.
// The real ReviewSession is retained; no cloud/model or file parser is called.
vi.mock('react',async original=>({...await original<typeof import('react')>(),
  useState:(initial:unknown)=>[typeof initial==='function'?initial():initial,(value:unknown)=>mock.updates.push(value)],
  useMemo:(factory:()=>unknown)=>factory(),
  useRef:(initial:unknown)=>({current:initial}),useEffect:()=>{},useCallback:(callback:unknown)=>callback,
  useSyncExternalStore:(_subscribe:unknown,snapshot:()=>unknown)=>snapshot(),
}));
vi.mock('./motion',()=>({useReveal:()=>{}}));
import { Workbench } from './Workbench';
beforeEach(()=>{mock.read.mockReset();mock.sessions=[];mock.updates=[];});
function find(node:unknown,type:string):{props:Record<string,unknown>}|undefined {
  if(Array.isArray(node)) {for(const item of node){const result=find(item,type);if(result)return result;}return;}
  if(!node||typeof node!=='object')return;
  const element=node as {type?:unknown;props?:Record<string,unknown>};
  if(element.type===type&&element.props)return {props:element.props};
  return find(element.props?.children,type);
}
it('does not overwrite newer manual edits when a slow import finishes',async()=>{
  let finish!:(text:string)=>void;
  mock.read.mockReturnValueOnce(new Promise<string>(resolve=>{finish=resolve;}));
  const bridge:AiBridge & {downloadModel():Promise<void>}={onDeviceStatus:async()=> 'unavailable',onDevice:async()=>'',analyze:async()=>{throw new Error('not used');},downloadModel:async()=>{}};
  const tree=Workbench({bridge});
  const file=find(tree,'input')!,editor=find(tree,'textarea')!;
  (file.props.onChange as (e:unknown)=>void)({target:{files:[{name:'slow.docx'}]}});
  (editor.props.onChange as (e:unknown)=>void)({target:{value:'NEWER MANUAL CONTRACT'}});
  const session=mock.sessions[0] as ReviewSession;
  expect(session.getSnapshot().contract).toBe('NEWER MANUAL CONTRACT');
  finish('OLDER IMPORTED CONTRACT');
  await Promise.resolve(); await Promise.resolve();
  expect(session.getSnapshot().contract).toBe('NEWER MANUAL CONTRACT');
  expect(mock.updates.some(value=>typeof value==='string'&&value.includes('Import canceled'))).toBe(true);
});

it('keeps the latest import when an older file finishes afterwards',async()=>{
  let first!:(text:string)=>void,second!:(text:string)=>void;
  mock.read.mockReturnValueOnce(new Promise<string>(resolve=>{first=resolve;}))
    .mockReturnValueOnce(new Promise<string>(resolve=>{second=resolve;}));
  const bridge:AiBridge & {downloadModel():Promise<void>}={onDeviceStatus:async()=> 'unavailable',onDevice:async()=>'',analyze:async()=>{throw new Error('not used');},downloadModel:async()=>{}};
  const tree=Workbench({bridge}); const input=find(tree,'input')!;
  const choose=input.props.onChange as (e:unknown)=>void;
  choose({target:{files:[{name:'older.docx'}]}});choose({target:{files:[{name:'latest.docx'}]}});
  second('LATEST IMPORT');await Promise.resolve();await Promise.resolve();
  first('OLDER IMPORT');await Promise.resolve();await Promise.resolve();
  expect((mock.sessions[0] as ReviewSession).getSnapshot().contract).toBe('LATEST IMPORT');
});
