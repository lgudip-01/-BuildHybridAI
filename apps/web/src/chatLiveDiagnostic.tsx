// Development-only manual verification on fixed public synthetic repository fixtures.
import './styles.css';
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { prepareSample } from './sampleRoundtrip';
import { approve } from '@clause-guard/privacy-engine/approval';
import { initAI, verifyAppCheck } from './firebase';
import { WebBridge } from './webBridge';
import { CloudChatBridge } from './cloudChat';
import { ChatConversation } from './chatFlow';
import { ChatPanel } from './ReviewChat';

if (!import.meta.env.DEV || !['localhost','127.0.0.1'].includes(location.hostname)) throw new Error('Local development only.');
const ai = initAI(), local = new WebBridge(ai), cloud = new CloudChatBridge(ai);
function Check() {
  const [sample,setSample] = useState('lease');
  const [prepared,setPrepared] = useState<Awaited<ReturnType<typeof prepareSample>> | null>(null);
  const [chat,setChat] = useState<ChatConversation | null>(null);
  const [status,setStatus] = useState('No cloud question requested.');
  const [busy,setBusy] = useState(false);
  const [payloads,setPayloads] = useState<unknown[]>([]);
  useEffect(() => {
    const original = window.fetch;
    let sequence = 0;
    // Observe the ACTUAL SDK generation body on this diagnostic page only.
    // Never capture headers, credentials, tokens, query strings or other endpoints.
    window.fetch = function(input, init) {
      let id: number | undefined;
      try {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.includes('firebasevertexai.googleapis.com/') && /:generateContent(?:\?|$)/.test(url) && typeof init?.body === 'string') {
          const body = JSON.parse(init.body);
          id = ++sequence;
          setPayloads(previous => [...previous, {id,httpStatus:"pending",model:new URL(url).pathname.match(/models\/([^/:]+):generateContent$/)?.[1],contents:body.contents,systemInstruction:body.systemInstruction,generationConfig:body.generationConfig}]);
        }
      } catch { setStatus('Payload observer could not inspect this request.'); }
      const pending = original.call(window,input,init);
      if (id !== undefined) {
        const patch = (fields: object) => setPayloads(previous => previous.map(entry => {
          const record=entry as {id?:number}; return record.id === id ? {...record,...fields} : record;
        }));
        void pending.then(response => {
          patch({httpStatus:response.status});
          if (!response.ok) void response.clone().json().then(body => {
            const code=body?.error?.status;
            patch({providerStatus:typeof code === 'string' && /^[A-Z_]{1,40}$/.test(code) ? code : 'unclassified'});
          }).catch(()=>{});
        },()=>patch({httpStatus:'network_error'}));
      }
      return pending;
    };
    return () => { window.fetch = original; };
  },[]);
  useEffect(() => () => chat?.close(),[chat]);
  async function mask() {
    chat?.close();setChat(null);setPrepared(null);setPayloads([]);setBusy(true);
    try { const preview=await prepareSample(sample);setPrepared(preview);setStatus('Inspect the exact masked contract before approval. No cloud generation requested.'); }
    catch { setStatus('Sample masking blocked. No cloud generation requested.'); }
    finally { setBusy(false); }
  }
  return <main style={{padding:'1.5rem',maxWidth:1100,margin:'auto'}}>
    <h1>Public-fixture live chat verification</h1>
    <p>Real engine, WebBridge, CloudChatBridge and ChatPanel. Fixed public synthetic fixtures only. Each cloud question requires manual preview approval. No automatic sends or retries.</p>
    <button onClick={() => void verifyAppCheck().then(()=>setStatus('App Check token verified; no token displayed.'),()=>setStatus('App Check failed; do not send.'))}>Verify App Check</button>
    <label>Public sample <select value={sample} disabled={busy} onChange={e=>{chat?.close();setChat(null);setPrepared(null);setSample(e.target.value);setPayloads([]);}}>
      {['lease','nda','freelance','offer-letter','saas','promissory-note'].map(name=><option key={name}>{name}</option>)}
    </select></label>
    <button disabled={busy} onClick={()=>void mask()}>{busy?'Masking on device…':'Mask public sample locally'}</button>
    <p role="status">{status}</p>
    {prepared && <><h2>Exact masked contract</h2><pre style={{whiteSpace:'pre-wrap'}}>{prepared.result.clauses.map(c=>`${c.id}: ${c.text}`).join('\n\n')}</pre>
      <button disabled={!!chat} onClick={()=>{try {setChat(new ChatConversation(approve(prepared.result,{reviewed:true}),local,cloud));setStatus('Contract approved locally. Prepare and review each question.');} catch {setStatus('Contract approval failed. Mask again.');}}}>Approve masked contract for chat</button></>}
    {chat && <section className="contract-chat"><h2>Real contract questions</h2><ChatPanel conversation={chat}/></section>}
    <h2>Actual SDK generation payloads ({payloads.length})</h2>
    <p>Body content only, observed in this page’s fetch call. Headers/tokens are not recorded. This is not all-endpoint privacy certification.</p>
    <pre id="actual-payloads" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(payloads,null,2)}</pre>
  </main>;
}
createRoot(document.getElementById('root')!).render(<Check/>);
