// CI browser proof of our generated HTTP-served code. No provider or account actions.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, mkdtemp, rm, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { sha256 } from './kernel.mjs';

const option=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const ROOT=resolve(option('root','creative-labs')),OUT=resolve(option('out','creative-ui-proof'));
await mkdir(OUT,{recursive:true});
const server=createServer(async(req,res)=>{const brand=new URL(req.url,'http://localhost').pathname.split('/')[1];if(!['starlight','arcanea','gencreator'].includes(brand)){res.writeHead(404);res.end();return;}try{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await readFile(join(ROOT,brand,'index.html')));}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const BASE='http://127.0.0.1:'+server.address().port;
const port=9600+Math.floor(Math.random()*300),profile=await mkdtemp(join(tmpdir(),'creative-proof-'));
const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--no-first-run','--remote-debugging-address=127.0.0.1','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let chromeLog='';chrome.stderr.on('data',chunk=>chromeLog=(chromeLog+chunk).slice(-4000));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rows=[],errors=[];
async function connect(){
 const tab=await(await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j;});
 let seq=0;const pending=new Map(),exceptions=[],requests=[];
 ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result);}}else if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails.text);else if(m.method==='Network.requestWillBeSent')requests.push(m.params.request.url);};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method));},15000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const x=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(x.exceptionDetails)throw new Error(x.exceptionDetails.exception?.description||x.exceptionDetails.text);return x.result?.value;};
 return {send,evaluate,exceptions,requests,close:async()=>{ws.close();await fetch('http://127.0.0.1:'+port+'/json/close/'+tab.id);}};
}
try{
 let started=false,lastStartError='';for(let i=0;i<120;i++){try{if((await fetch('http://127.0.0.1:'+port+'/json/version')).ok){started=true;break;}}catch(e){lastStartError=e.message+': '+e.cause?.message;}if(chrome.exitCode!==null)break;await sleep(250);}assert(started,'Chrome must start. Exit '+chrome.exitCode+'; '+lastStartError+'; '+chromeLog);
 for(const brand of ['starlight','arcanea','gencreator'])for(const width of [375,768,1440]){
  const c=await connect();const row={brand,width,sourceHead:process.env.SOURCE_HEAD_SHA||null,checks:[]};
  try{
   await c.send('Page.enable');await c.send('Runtime.enable');await c.send('Network.enable');
   await c.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===375});
   await c.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
   await c.send('Page.navigate',{url:BASE+'/'+brand+'/'});
   let loaded=false;for(let i=0;i<60;i++){if(await c.evaluate("document.getElementById('status')?.textContent.includes('Example loaded')")){loaded=true;break;}await sleep(100);}assert(loaded,'Module initializes');row.checks.push('module initialization');
   const metrics=await c.evaluate(`({title:document.title,overflow:Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-document.documentElement.clientWidth,nodes:document.querySelectorAll('.node-card').length,context:document.getElementById('proof-context').textContent,listMode:getComputedStyle(document.getElementById('plane')).position,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches})`);
   assert(metrics.overflow<=1,'No horizontal overflow at '+width+': '+metrics.overflow);assert.equal(metrics.nodes,brand==='gencreator'?7:13);assert(metrics.context.includes('3 example records'));assert(metrics.reduced);Object.assign(row,metrics);row.checks.push('responsive width','scoped context','reduced motion');
   const focus=[];for(let i=0;i<14;i++){await c.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await c.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});const f=await c.evaluate(`(()=>{const e=document.activeElement,s=getComputedStyle(e),r=e.getBoundingClientRect();return {name:e.id||e.tagName,visible:r.width>0&&r.height>0&&e.checkVisibility(),indicator:(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none'};})()`);assert(f.visible&&f.indicator,'Visible keyboard focus: '+JSON.stringify(f));focus.push(f.name);}row.focusStops=focus;row.checks.push('14 visible keyboard focus stops');
   await c.evaluate('document.activeElement.blur();window.scrollTo(0,0)');
   const layout=await c.send('Page.getLayoutMetrics'),shot=await c.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:Math.ceil(layout.cssContentSize.height),scale:1}});
   const png=Buffer.from(shot.data,'base64');assert.equal(png.readUInt32BE(16),width);await writeFile(join(OUT,brand+'-'+width+'.png'),png);row.screenshot=brand+'-'+width+'.png';
   if(width===1440){
    await c.evaluate(`document.getElementById('intent').value='A sufficiently long owned source for this proof. '.repeat(70);document.getElementById('apply-source').click()`);
    assert((await c.evaluate("document.getElementById('revision-label').textContent")).includes('revision 2'));row.checks.push('long-source edit');
    assert((await c.evaluate("document.getElementById('impact-label').textContent")).includes('steps need another pass'));row.checks.push('dependent invalidation');
    await c.evaluate("document.getElementById('save').click();document.getElementById('add-step').click()");assert.equal(await c.evaluate("document.querySelectorAll('.node-card').length"),brand==='gencreator'?8:14);
    await c.evaluate("document.getElementById('undo').click()");assert.equal(await c.evaluate("document.querySelectorAll('.node-card').length"),brand==='gencreator'?7:13);row.checks.push('add step and undo');
    await c.evaluate("document.getElementById('add-step').click();document.getElementById('restore').click()");assert((await c.evaluate("document.getElementById('revision-label').textContent")).includes('revision 2'));assert.equal(await c.evaluate("document.querySelectorAll('.node-card').length"),brand==='gencreator'?7:13);row.checks.push('local save and restore');
    await c.evaluate("document.getElementById('planning-cap').value='-1';document.getElementById('validate').click()");assert((await c.evaluate("document.getElementById('status').textContent")).includes('Enter a cap'));row.checks.push('negative budget rejected');
    if(brand!=='gencreator'){await c.evaluate("document.getElementById('planning-cap').value='0.01';document.getElementById('validate').click()");assert((await c.evaluate("document.getElementById('status').textContent")).toLowerCase().includes('budget'));row.checks.push('overspend rejected');}
    await c.evaluate("document.getElementById('planning-cap').value='12';document.querySelector('[data-pane=context]').click();document.getElementById('context-budget').value='1';document.getElementById('compile-context').click()");assert((await c.evaluate("document.getElementById('proof-context').textContent")).includes('blocked'));row.checks.push('required context never truncated');
    await c.evaluate("document.getElementById('context-budget').value='500';document.getElementById('compile-context').click();document.getElementById('node-data').value='{';document.getElementById('save-node').click()");assert(await c.evaluate("document.getElementById('node-error').textContent.length>0"));row.checks.push('invalid JSON edit rejected');
    const downloadDir=join(OUT,'exports',brand);await mkdir(downloadDir,{recursive:true});await c.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloadDir});
    await c.evaluate("document.getElementById('export').click()");let names=[];for(let i=0;i<60;i++){names=(await readdir(downloadDir)).filter(n=>n.endsWith('.json'));if(names.length)break;await sleep(100);}assert.equal(names.length,1,'One actual JSON download');const exported=JSON.parse(await readFile(join(downloadDir,names[0]),'utf8'));assert.equal(exported.authorization,null);assert.equal(exported.publishAuthorization,null);assert.equal(exported.identityVerified,false);assert.equal(exported.plan.externalDispatchAuthorized,false);assert.equal(exported.workflow.revision,2);assert.equal(exported.context.records.length,3);assert.equal(Object.keys(exported.semanticKeys).length,exported.workflow.nodes.length);assert.equal(exported.workflowDigest,await sha256(exported.workflow));row.checks.push('actual portable JSON export');
    await c.send('Page.reload');let reloaded=false;for(let i=0;i<60;i++){if(await c.evaluate("document.getElementById('status')?.textContent.includes('Example loaded')")){reloaded=true;break;}await sleep(100);}assert(reloaded);await c.evaluate("document.getElementById('restore').click()");assert((await c.evaluate("document.getElementById('revision-label').textContent")).includes('revision 2'));row.checks.push('restore after reload');
   }
   assert.equal(c.exceptions.length,0,'No browser runtime exceptions');assert(c.requests.every(url=>url.startsWith(BASE)||url.startsWith('blob:')),'No external page requests');row.checks.push('no runtime exceptions','no provider/network requests');row.pass=true;
  }catch(e){row.pass=false;row.error=e.message;errors.push(brand+' @'+width+': '+e.message);}finally{await c.close();rows.push(row);console.log(JSON.stringify(row));}
 }
}finally{chrome.kill();server.close();await sleep(300);await rm(profile,{recursive:true,force:true});await writeFile(join(OUT,'results.json'),JSON.stringify({schema:'starlight.creative-ui-proof.v1',sourceHead:process.env.SOURCE_HEAD_SHA||null,rows,errors},null,2)+'\n');}
assert.equal(errors.length,0,errors.join('\n'));
