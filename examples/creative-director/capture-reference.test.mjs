import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { runInNewContext } from 'node:vm';
import { waitForRenderable, stopOwnedChild, validatePng, inspectRender } from './capture-reference.mjs';

const ready={readyState:'complete',fontsLoaded:true,heading:'A real public heading',headingVisible:true,loading:false,geometry:[24,120,320,96]};
function schedule(states){let now=0,index=0;return {read:async()=>states[Math.min(index++,states.length-1)],options:{timeoutMs:100,stableMs:20,intervalMs:10,now:()=>now,sleep:async ms=>{now+=ms;}}};}
test('loading and invisible hero states cannot produce a success receipt',async()=>{
 for(const state of [{...ready,headingVisible:false},{...ready,loading:true},{...ready,fontsLoaded:false},{...ready,heading:''}]){
  const s=schedule([state]);await assert.rejects(waitForRenderable(s.read,s.options),/Renderable heading deadline/);
 }
});
test('waits for hydration, font readiness and stable visible heading geometry',async()=>{
 const s=schedule([{...ready,headingVisible:false},{...ready,fontsLoaded:false},ready,{...ready,geometry:[24,124,320,96]},ready,ready,ready]);
 const result=await waitForRenderable(s.read,s.options);assert.equal(result.state.heading,ready.heading);assert(result.elapsedMs>=60);assert.equal(result.stableMs,20);
});
test('bounds a hung browser state request and retains the last observed state',async()=>{
 await assert.rejects(waitForRenderable(()=>new Promise(()=>{}),{timeoutMs:20,stableMs:0}),/Renderable heading deadline/);
 const s=schedule([{...ready,loading:true}]);await assert.rejects(waitForRenderable(s.read,s.options),e=>e.lastState.loading===true);
});
test('owned child teardown escalates after SIGTERM and confirms exit',async()=>{
 const child=new EventEmitter();child.pid=123;child.exitCode=null;child.signalCode=null;const signals=[];
 child.kill=signal=>{signals.push(signal);if(signal==='SIGKILL'){child.signalCode=signal;queueMicrotask(()=>child.emit('close',null,signal));}return true;};
 const state=await stopOwnedChild(child,{graceMs:10,killMs:20});assert.deepEqual(signals,['SIGTERM','SIGKILL']);assert.equal(state.signal,'SIGKILL');
});
test('already exited or failed-to-spawn child is never signalled',async()=>{
 for(const child of [{pid:123,exitCode:0,signalCode:null},{pid:undefined,exitCode:null,signalCode:null}]){child.kill=()=>assert.fail('must not signal');await stopOwnedChild(child);}
});
test('unconfirmed child exit fails instead of reporting cleanup complete',async()=>{
 const child=new EventEmitter();child.pid=123;child.exitCode=null;child.signalCode=null;child.kill=()=>true;
 await assert.rejects(stopOwnedChild(child,{graceMs:5,killMs:5}),/exit could not be confirmed/);
 assert.equal(child.listenerCount('close'),0);assert.equal(child.listenerCount('error'),0);
});
test('browser render inspection rejects hidden ancestors and viewport-external headings',()=>{
 const style={display:'block',visibility:'visible',opacity:'1'},parent={style};
 const heading={innerText:'Real public hero',style,parentElement:parent,getBoundingClientRect:()=>({x:24,y:120,width:320,height:96,top:120,bottom:216,left:24,right:344})};
 const context={innerHeight:900,innerWidth:375,getComputedStyle:element=>element.style,document:{readyState:'complete',fonts:{status:'loaded'},querySelectorAll:selector=>selector.startsWith('h1')?[heading]:[]}};
 const inspect=()=>runInNewContext('('+inspectRender.toString()+')()',context);
 assert.equal(inspect().headingVisible,true);
 parent.style={...style,opacity:'0'};assert.equal(inspect().headingVisible,false);
 parent.style=style;heading.getBoundingClientRect=()=>({width:320,height:96,top:1000,bottom:1096,left:24,right:344});assert.equal(inspect().headingVisible,false);
});
test('PNG checks reject missing signature, truncated data and wrong viewport',()=>{
 const bytes=Buffer.alloc(24);Buffer.from([137,80,78,71,13,10,26,10]).copy(bytes);bytes.writeUInt32BE(375,16);bytes.writeUInt32BE(900,20);
 assert.deepEqual(validatePng(bytes,375),{observedWidth:375,observedHeight:900});
 assert.throws(()=>validatePng(bytes,768),/viewport/);assert.throws(()=>validatePng(bytes.subarray(0,20),375),/PNG/);bytes[0]=0;assert.throws(()=>validatePng(bytes,375),/PNG/);
});
