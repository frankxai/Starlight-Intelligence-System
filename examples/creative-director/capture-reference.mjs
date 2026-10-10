import {mkdtemp,mkdir,readFile,writeFile,rm} from "node:fs/promises";
import {spawn} from "node:child_process";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
const args=process.argv.slice(2),at=args.indexOf("--out");
const out=resolve(at>=0?args[at+1]:"creative-reference-proof");await mkdir(out,{recursive:true});
const sources=[["arcanea","https://arcanea.ai/"],["gencreator","https://gencreator.ai/"],["starlight","https://starlightintelligence.org/"]];
const receipts=[];
for(const [brand,url] of sources)for(const width of [375,768,1440]){
 const profile=await mkdtemp(join(tmpdir(),"creative-proof-")),file=join(out,brand+"-"+width+".png");
 // Public pages use live network/media; capture against a wall-clock deadline.
 const argv=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--hide-scrollbars","--force-device-scale-factor=1","--user-data-dir="+profile,"--window-size="+width+",900","--timeout=20000","--screenshot="+file,url];
 let exitCode,signal=null,timedOut=false,stderr="";
 try{
  exitCode=await new Promise((done,reject)=>{const child=spawn(process.env.CHROME_BIN||"google-chrome",argv,{stdio:["ignore","ignore","pipe"]});child.stderr.on("data",x=>stderr=(stderr+x.toString()).slice(-8000));child.once("error",reject);const timer=setTimeout(()=>{timedOut=true;child.kill("SIGTERM");},30000);child.once("close",(code,exitSignal)=>{clearTimeout(timer);signal=exitSignal;done(code);});});
  if(timedOut)throw new Error("Capture exceeded the 30-second process deadline");
  const png=await readFile(file),observedWidth=png.readUInt32BE(16),observedHeight=png.readUInt32BE(20);
  if(exitCode!==0||!png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||observedWidth!==width||observedHeight!==900)throw new Error("Capture failed or viewport dimensions differ");
  receipts.push({brand,url,width,observedWidth,observedHeight,file:brand+"-"+width+".png",exitCode,signal,timedOut,headSha:process.env.SOURCE_HEAD_SHA||null,kind:"existing-public-reference",visualVerdict:"requires image inspection"});
 }catch(e){receipts.push({brand,url,width,exitCode,signal,timedOut,error:e.message,stderr:stderr.slice(-1200)});}
 finally{await rm(profile,{recursive:true,force:true});}
}
await writeFile(join(out,"receipts.json"),JSON.stringify(receipts,null,2)+"\n");
console.log(JSON.stringify(receipts,null,2));
if(receipts.some(r=>r.error))process.exitCode=1;
