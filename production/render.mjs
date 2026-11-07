/** Run in the consuming project. Uses its installed Remotion and existing browser helper. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {readProduction,renderPlan,fingerprint} from './config.mjs';
import {installedBrowser,chromiumOptions,closeBrowser} from '../rendering/browser.mjs';
const args=process.argv.slice(2),arg=k=>args.find(a=>a.startsWith('--'+k+'='))?.slice(k.length+3);
const c=readProduction(arg('config')??'production.json'),plan=renderPlan(c,{final:args.includes('--final'),approved:args.includes('--approved-final'),scene:arg('scene')});
if(args.includes('--plan')){console.log(JSON.stringify(plan,null,2));process.exit(0);}
if(!arg('out'))throw Error('Choose a new --out= revision');
const out=path.resolve(arg('out')),video=path.join(out,'picture.mp4'),checkpoint=path.join(out,'render-checkpoint.json');
const identity=fingerprint({config:c,plan},c.fingerprintInputs);
function probeMatches(file){const m=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-of','json',file],{encoding:'utf8'}));const v=m.streams.find(s=>s.codec_type==='video');return v?.width===plan.width&&v.height===plan.height&&Number(v.nb_frames)===plan.frames&&v.r_frame_rate==='30/1'&&!m.streams.some(s=>s.codec_type==='audio');}
if(fs.existsSync(video)){
  const receiptFile=video+'.validated.json',receipt=fs.existsSync(receiptFile)?JSON.parse(fs.readFileSync(receiptFile)):null;
  const verified=receipt?.decodePassed&&receipt?.sha256===crypto.createHash('sha256').update(fs.readFileSync(video)).digest('hex');
  if(fs.existsSync(checkpoint)&&JSON.parse(fs.readFileSync(checkpoint)).fingerprint===identity&&probeMatches(video)&&verified){console.log('Completed matching validated render reused: '+video);process.exit(0);}
  throw Error('Existing output is not a verified matching checkpoint; preserve it and use a new revision');
}
if(fs.existsSync(checkpoint))throw Error('Checkpoint exists without its video; inspect it and choose a new revision');
fs.mkdirSync(out,{recursive:true});const lease=path.join(out,'render-active.json');
if(fs.existsSync(lease)){const prior=JSON.parse(fs.readFileSync(lease));let live=true;try{process.kill(prior.pid,0);}catch(e){if(e.code==='ESRCH')live=false;else throw Error('Cannot prove old render stopped; inspect PID '+prior.pid);}if(live)throw Error('Render already active: PID '+prior.pid);fs.renameSync(lease,lease+'.stale-'+Date.now());}
fs.writeFileSync(lease,JSON.stringify({pid:process.pid,fingerprint:identity}),{flag:'wx'});
let browser;const errors=[],metrics=[];const start=performance.now();
try {
  const {bundle}=await import('@remotion/bundler'),{openBrowser,selectComposition,renderMedia}=await import('@remotion/renderer');
  const serveUrl=await bundle({entryPoint:path.resolve(c.entryPoint??'src/index.ts')});
  browser=await openBrowser('chrome',{browserExecutable:installedBrowser(),chromiumOptions});
  const composition=await selectComposition({serveUrl,id:c.compositionId,inputProps:plan.inputProps,puppeteerInstance:browser,chromiumOptions});
  if(composition.width!==c.width||composition.height!==c.height||composition.fps!==c.fps||composition.durationInFrames!==c.frames)throw Error('Registered composition differs from production contract');
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,chromiumOptions,scale:plan.scale,codec:'h264',crf:17,muted:true,concurrency:1,frameRange:plan.frameRange,outputLocation:video,onBrowserLog:l=>{if(l.type==='error')errors.push(l.text);if(l.text.startsWith('ODDFRAME_METRICS '))metrics.push(JSON.parse(l.text.slice(17)));},onProgress:p=>process.stdout.write('\r'+Math.floor(p.progress*100)+'%')});
  if(errors.length||!probeMatches(video))throw Error('Render failed validation: '+errors.join('\n'));
  if(!metrics.length||metrics.some(m=>m.drawingBuffer[0]!==plan.width||m.drawingBuffer[1]!==plan.height))throw Error('Missing/mismatched actual WebGL buffer evidence; add DrawingBufferProbe');
  fs.writeFileSync(checkpoint,JSON.stringify({status:'complete',fingerprint:identity,plan,seconds:(performance.now()-start)/1000,errors,metrics},null,2));
} finally {if(browser)await closeBrowser(browser);fs.unlinkSync(lease);}
