import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

// A PNG alone cannot prove hydration: these public pages can initially hide their hero.
export async function waitForRenderable(readState,{timeoutMs=20000,stableMs=800,intervalMs=200,now=()=>performance.now(),sleep:pause=sleep}={}){
 const started=now();let previous=null,stableSince=null,lastState=null;
 const expired=()=>Object.assign(new Error('Renderable heading deadline exceeded'),{lastState});
 while(now()-started<timeoutMs){
  let timer;
  try{lastState=await Promise.race([Promise.resolve().then(readState),new Promise((_,reject)=>{timer=setTimeout(()=>reject(expired()),Math.max(1,timeoutMs-(now()-started)));})]);}
  finally{clearTimeout(timer);}
  const ready=lastState&&['interactive','complete'].includes(lastState.readyState)&&lastState.fontsLoaded&&lastState.headingVisible&&!lastState.loading&&lastState.heading?.trim();
  const identity=ready?JSON.stringify([lastState.heading,lastState.geometry]):null;
  if(identity&&identity===previous){if(now()-stableSince>=stableMs)return {state:lastState,elapsedMs:Math.round(now()-started),stableMs};}
  else{previous=identity;stableSince=identity?now():null;}
  await pause(Math.min(intervalMs,Math.max(0,timeoutMs-(now()-started))));
 }
 throw expired();
}

export function validatePng(png,width){
 if(png.length<24||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new Error('Invalid PNG capture');
 const observedWidth=png.readUInt32BE(16),observedHeight=png.readUInt32BE(20);
 if(observedWidth!==width||observedHeight!==900)throw new Error('Capture viewport dimensions differ');
 return {observedWidth,observedHeight};
}

// Only the child spawned by this capture is eligible for termination.
export async function stopOwnedChild(child,{graceMs=2000,killMs=2000}={}){
 if(!child?.pid||child.exitCode!==null||child.signalCode!==null)return {exitCode:child?.exitCode??null,signal:child?.signalCode??null};
 return new Promise((done,reject)=>{
  let grace,deadline;
  const clear=()=>{clearTimeout(grace);clearTimeout(deadline);child.removeListener('close',closed);child.removeListener('error',failed);};
  const closed=(exitCode,signal)=>{clear();done({exitCode,signal});};
  const failed=error=>{clear();reject(error);};
  child.once('close',closed);child.once('error',failed);
  grace=setTimeout(()=>{try{child.kill('SIGKILL');}catch(error){failed(error);}},graceMs);
  deadline=setTimeout(()=>failed(new Error('Owned Chrome exit could not be confirmed')),graceMs+killMs);
  try{child.kill('SIGTERM');}catch(error){failed(error);}
 });
}

export function inspectRender(){
 const visible=element=>{
  const rect=element.getBoundingClientRect();
  if(rect.width<=0||rect.height<=0||rect.bottom<=0||rect.top>=innerHeight||rect.right<=0||rect.left>=innerWidth)return false;
  for(let node=element;node;node=node.parentElement){const style=getComputedStyle(node);if(style.display==='none'||style.visibility!=='visible'||Number(style.opacity)<0.9)return false;}
  return true;
 };
 const heading=[...document.querySelectorAll('h1,[role="heading"][aria-level="1"]')].find(element=>visible(element)&&element.innerText.trim());
 const rect=heading?.getBoundingClientRect();
 return {readyState:document.readyState,fontsLoaded:!document.fonts||document.fonts.status==='loaded',heading:heading?.innerText.slice(0,240)??'',headingVisible:!!heading,loading:[...document.querySelectorAll('[role="progressbar"],[aria-busy="true"]')].some(visible),geometry:rect?[rect.x,rect.y,rect.width,rect.height].map(Math.round):null};
}

async function connect(endpoint,signal){
 const ws=new WebSocket(endpoint),pending=new Map();let seq=0;
 const fail=error=>{for(const request of pending.values()){clearTimeout(request.timer);request.reject(error);}pending.clear();};
 const aborted=()=>{fail(signal.reason);ws.close();};signal.addEventListener('abort',aborted,{once:true});
 ws.addEventListener('close',()=>{signal.removeEventListener('abort',aborted);fail(new Error('Chrome connection closed'));});
 ws.addEventListener('message',({data})=>{try{const message=JSON.parse(data),request=pending.get(message.id);if(request){pending.delete(message.id);clearTimeout(request.timer);message.error?request.reject(new Error(JSON.stringify(message.error))):request.resolve(message.result);}}catch(error){fail(error);}});
 await new Promise((done,reject)=>{
  const timer=setTimeout(()=>{ws.close();reject(new Error('Chrome connection deadline'));},5000);
  ws.addEventListener('open',()=>{clearTimeout(timer);done();},{once:true});
  ws.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Chrome connection failed'));},{once:true});
 });
 const send=(method,params={})=>new Promise((done,reject)=>{
  if(signal.aborted||ws.readyState!==WebSocket.OPEN){reject(signal.reason??new Error('Chrome connection unavailable'));return;}
  const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP deadline: '+method));},5000);
  pending.set(id,{resolve:done,reject,timer});
  try{ws.send(JSON.stringify({id,method,params}));}catch(error){pending.delete(id);clearTimeout(timer);reject(error);}
 });
 return {send,close:()=>ws.close()};
}

async function capture(brand,url,width,out){
 const profile=await mkdtemp(join(tmpdir(),'creative-proof-')),controller=new AbortController();
 const row={brand,url,width,headSha:process.env.SOURCE_HEAD_SHA||null,kind:'existing-public-reference',visualVerdict:'requires image inspection',renderCriterion:'visible stable heading, loaded fonts, no visible busy indicator',reducedMotion:true};
 let child,cdp,stderr='',timer,endpointResolve,endpointReject;
 const endpoint=new Promise((done,reject)=>{endpointResolve=done;endpointReject=reject;});
 // Handle early spawn failure even if the startup await has not attached yet.
 endpoint.catch(()=>{});
 try{
  timer=setTimeout(()=>controller.abort(new Error('Capture exceeded the 35-second process deadline')),35000);
  child=spawn(process.env.CHROME_BIN||'google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--hide-scrollbars','--force-device-scale-factor=1','--no-first-run','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
  row.ownedPid=child.pid;
  child.stderr.on('data',data=>{stderr=(stderr+data.toString()).slice(-8000);const match=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match)endpointResolve(match[1]);});
  child.once('error',endpointReject);child.once('exit',()=>endpointReject(new Error('Chrome exited before capture')));
  const onAbort=()=>endpointReject(controller.signal.reason);controller.signal.addEventListener('abort',onAbort,{once:true});
  const debuggerUrl=new URL(await endpoint);controller.signal.removeEventListener('abort',onAbort);
  if(debuggerUrl.hostname!=='127.0.0.1'||debuggerUrl.protocol!=='ws:')throw new Error('Unexpected local Chrome endpoint');
  const target=await(await fetch('http://127.0.0.1:'+debuggerUrl.port+'/json/new?about:blank',{method:'PUT',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(5000)])})).json();
  const pageEndpoint=new URL(target.webSocketDebuggerUrl);
  if(pageEndpoint.hostname!=='127.0.0.1'||pageEndpoint.port!==debuggerUrl.port||pageEndpoint.protocol!=='ws:')throw new Error('Unexpected Chrome page endpoint');
  cdp=await connect(pageEndpoint.href,controller.signal);
  await cdp.send('Page.enable');await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===375});
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const navigation=await cdp.send('Page.navigate',{url});if(navigation.errorText)throw new Error('Navigation failed: '+navigation.errorText);
  row.render=await waitForRenderable(async()=>{const result=await cdp.send('Runtime.evaluate',{expression:'('+inspectRender.toString()+')()',returnByValue:true});if(result.exceptionDetails)throw new Error('Render inspection failed');return result.result.value;});
  const screenshot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,clip:{x:0,y:0,width,height:900,scale:1}});
  const png=Buffer.from(screenshot.data,'base64');Object.assign(row,validatePng(png,width));
  row.file=brand+'-'+width+'.png';await writeFile(join(out,row.file),png);row.captureSucceeded=true;
 }catch(error){row.captureSucceeded=false;row.error=error.message;if(error.lastState)row.lastRenderState=error.lastState;row.stderr=stderr.slice(-1200);}
 finally{
  clearTimeout(timer);row.timedOut=controller.signal.aborted||/deadline/i.test(row.error??'');
  if(cdp){try{await cdp.send('Browser.close');}catch{/* Closing Chrome can disconnect before its response. */}cdp.close();}
  try{Object.assign(row,await stopOwnedChild(child));row.ownedChildExited=true;await rm(profile,{recursive:true,force:true});}
  catch(error){row.captureSucceeded=false;row.cleanupError=error.message;row.ownedChildExited=false;row.profileRetained=true;}
 }
 return row;
}

async function main(){
 const args=process.argv.slice(2),at=args.indexOf('--out');
 const out=resolve(at>=0?args[at+1]:'creative-reference-proof');await mkdir(out,{recursive:true});
 const receipts=[];
 for(const [brand,url] of [['arcanea','https://arcanea.ai/'],['gencreator','https://gencreator.ai/'],['starlight','https://starlightintelligence.org/']])for(const width of [375,768,1440])receipts.push(await capture(brand,url,width,out));
 await writeFile(join(out,'receipts.json'),JSON.stringify(receipts,null,2)+'\n');console.log(JSON.stringify(receipts,null,2));
 if(receipts.some(row=>!row.captureSucceeded||!row.ownedChildExited))process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
