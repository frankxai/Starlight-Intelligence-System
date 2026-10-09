import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = dirname(fileURLToPath(import.meta.url));
const read = name => readFile(resolve(root, name), 'utf8');
const digest = value => createHash('sha256').update(value).digest('hex');
const html = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const out = resolve(outIndex < 0 ? root + '/generated' : args[outIndex + 1]);
const [template, css, kernel, app, world, creator, records, team] = await Promise.all([
  read('lab-template.html'),read('lab.css'),read('kernel.mjs'),read('lab-app.mjs'),
  read('world-workflow.json').then(JSON.parse),read('creator-workflow.json').then(JSON.parse),
  read('context-records.json').then(JSON.parse),read('team.json').then(JSON.parse)
]);
const kernelDigest = digest(kernel);
const sourceRepository = 'frankxai/Starlight-Intelligence-System';
const sourceRef = 'ba5971e79eaff6d0991729d8d1081e156475a12c';
const sourceURL = 'https://github.com/' + sourceRepository + '/pull/309';
const details = {source:'The permitted source for this draft.',context:'Example context at the pinned revision.',storyboard:'An editable scene or format outline.',visual:'A visual direction before media execution.',creatorformat:'An editable format bound to example voice and rights.',transform:'An editable text scaffold. No model runs in this lab.',review:'A pending review draft.',textreview:'A pending review of source, voice and proof gaps.',export:'A portable draft handoff.',compare:'Compare the proposed candidates.',select:'A candidate selection draft.',audio:'An approved-audio reference draft.'};
const kindLabels = {source:'Source',context:'Context',storyboard:'Story',visual:'Direction',image:'Image request',compare:'Compare',select:'Select',video:'Scene request',audio:'Audio',review:'Review',textreview:'Review',export:'Export',creatorformat:'Format',transform:'Text'};
const brands = [
 {brand:'starlight',name:'Starlight',bg:'#08090f',eyebrow:'The shared foundation',headline:'Give your work a clear path.',intro:'Shape a brief into connected work. Inspect the context, edit the steps and carry a verifiable draft into the next execution.',note:'One source of intent.\nA visible path to an outcome.',endinglabel:'A portable beginning',ending:'Keep the work connected.',endingtext:'Source, context, decisions and draft identity travel together. The next connected slice will use the existing admission and memory owners.',contextintro:'These fictional records demonstrate scoped context. Required rules stay in the packet; proposals stay out.',requiredIds:['law','mara'],queryTerms:['coastal'],fixture:world,records},
 {brand:'arcanea',name:'Arcanea',bg:'#09090b',eyebrow:'From a world to a scene',headline:'Let your world take shape.',intro:'Give a scene its laws, character and visual direction. Follow the connections from your words to a production-ready draft.',note:'A character. A choice.\nA world that remembers.',endinglabel:'The next chapter',ending:'Every scene belongs to a world.',endingtext:'Keep the reason for each creative choice close to the work. Export this fictional draft, then connect an approved world snapshot and its creation proof.',contextintro:'Glass Tide is a fictional example, separate from Arcanea canon. Required world rules stay in the packet; proposals stay out.',requiredIds:['law','mara'],queryTerms:['coastal'],fixture:world,records},
 {brand:'gencreator',name:'GenCreator',bg:'#faf9f6',eyebrow:'One source. An edition in your voice.',headline:'Make something worth sharing.',intro:'Start with words you have the right to use. Arrange them into an article, a social sequence and a short-video outline. Keep your judgment in every draft.',note:'The source stays close.\nThe final word is yours.',endinglabel:'Your next edition',ending:'Carry your voice forward.',endingtext:'Take the drafts and their source into Creator Studio. The connected product will use your accepted CreatorPack and the existing Companion runtime.',contextintro:'This synthetic CreatorPack contains voice, source and rights examples. Required records stay in the packet; proposed changes stay out.',requiredIds:['voice','rights'],queryTerms:['source'],fixture:creator,records:[
  ...[{id:'voice',state:'accepted',title:'Voice',text:'Clear, precise and warm. Use concrete examples. Keep the creator\'s own judgment visible.'},{id:'rights',state:'accepted',title:'Source and rights',text:'Synthetic owned-source example. No external likeness, audio or publication rights are supplied.'},{id:'source-record',state:'source',title:'Permitted source',text:'The source says creative work improves when source, judgment and feedback stay connected.'},{id:'voice-proposal',state:'proposal',title:'Voice proposal',text:'Proposed voice change; excluded until accepted.'}].map(r=>({...r,tenantId:creator.tenantId,worldId:creator.worldId,worldRevision:creator.worldRevision,namespace:'Creative/creator-pack',visibility:'private'})),
  {id:'another-creator',state:'accepted',tenantId:'other-creator',worldId:creator.worldId,worldRevision:creator.worldRevision,namespace:'Creative/creator-pack',visibility:'private',text:'Another creator\'s private record.'}
 ]}
];
const manifest={schema:'starlight.creative-lab-projection.v1',kernelDigest,sourceRepository,kernelRef:sourceRef,inputs:Object.fromEntries([['template',template],['css',css],['app',app]].map(([k,v])=>[k,digest(v)])),products:{}};
for(const b of brands){
 const config={brand:b.brand,name:b.name,requiredIds:b.requiredIds,queryTerms:b.queryTerms,details,kindLabels,kernelDigest,sourceRepository,sourceRef,initialMessage:'Example loaded. Edit, save and export a local draft.'};
 const content={BRAND:b.brand,BG:b.bg,TITLE:b.name+' · Creative director',NAME:b.name,EYEBROW:b.eyebrow,HEADLINE:b.headline,INTRO:b.intro,NOTE:b.note,ENDINGLABEL:b.endinglabel,ENDING:b.ending,ENDINGTEXT:b.endingtext,CONTEXTINTRO:b.contextintro,SOURCEURL:sourceURL};
 let output=template.replace(/__(BRAND|BG|TITLE|NAME|EYEBROW|HEADLINE|INTRO|NOTE|ENDINGLABEL|ENDING|ENDINGTEXT|CONTEXTINTRO|SOURCEURL)__/g,(_,k)=>html(content[k]));
 const scripts={CSS:css,KERNEL:kernel.replace(/^export /gm,''),CONFIG:json(config),FIXTURE:json(b.fixture),CONTEXT:json(b.records),TEAM:json(team),APP:app};
 output=output.replace(/__(CSS|KERNEL|CONFIG|FIXTURE|CONTEXT|TEAM|APP)__/g,(_,k)=>scripts[k]);
 if(/__[A-Z]+__/.test(output))throw new Error('Unexpanded template placeholder');
 if((output.match(/<\/script>/gi)||[]).length!==1)throw new Error('Unsafe inline script delimiter');
 await mkdir(resolve(out,b.brand),{recursive:true});
 await writeFile(resolve(out,b.brand,'index.html'),output);
 manifest.products[b.brand]={htmlDigest:digest(output),nodes:b.fixture.nodes.length,edges:b.fixture.edges.length};
}
const canonical=resolve(root,'../../site/public/labs/creative-director');
if(args.includes('--write-site')){await mkdir(canonical,{recursive:true});await writeFile(resolve(canonical,'index.html'),await readFile(resolve(out,'starlight/index.html')));}
if(args.includes('--check')){const actual=await readFile(resolve(canonical,'index.html'),'utf8');if(digest(actual)!==manifest.products.starlight.htmlDigest)throw new Error('Starlight projection differs from shared source');const expected=JSON.parse(await read('projection-manifest.json'));if(JSON.stringify(expected)!==JSON.stringify(manifest))throw new Error('Projection manifest differs from source');}
await writeFile(resolve(out,'projection-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
if(args.includes('--write-site'))await writeFile(resolve(root,'projection-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({out,kernelDigest,products:manifest.products,checked:args.includes('--check')}));
