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
 const argv=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--hide-scrollbars","--force-device-scale-factor=1","--user-data-dir="+profile,"--window-size="+width+",900","--virtual-time-budget=5000","--timeout=20000","--screenshot="+file,url];
 let exitCode,stderr="";
 try{
  exitCode=await new Promise((done,reject)=>{const child=spawn(process.env.CHROME_BIN||"google-chrome",argv,{stdio:["ignore","ignore","pipe"]});child.stderr.on("data",x=>stderr+=x.toString().slice(0,1000));child.once("error",reject);const timer=setTimeout(()=>child.kill("SIGTERM"),30000);child.once("close",code=>{clearTimeout(timer);done(code);});});
  const png=await readFile(file),observedWidth=png.readUInt32BE(16),observedHeight=png.readUInt32BE(20);
  if(exitCode!==0||observedWidth!==width)throw new Error("Capture failed or viewport width differs");
  receipts.push({brand,url,width,observedWidth,observedHeight,file:brand+"-"+width+".png",exitCode,headSha:process.env.SOURCE_HEAD_SHA||null,kind:"existing-public-reference",visualVerdict:"requires image inspection"});
 }catch(e){receipts.push({brand,url,width,error:e.message,stderr:stderr.slice(-1200)});}
 finally{await rm(profile,{recursive:true,force:true});}
}
await writeFile(join(out,"receipts.json"),JSON.stringify(receipts,null,2)+"\n");
console.log(JSON.stringify(receipts,null,2));
if(receipts.some(r=>r.error))process.exitCode=1;
