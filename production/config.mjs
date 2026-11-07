import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export function validateProduction(c) {
  if(c.schemaVersion!==1||c.status!=='ready'||!c.id||!c.compositionId||!c.title) throw Error('Configure a ready film with metadata first');
  if(c.width!==1080||c.height!==1920||c.fps!==30||!Number.isInteger(c.frames)||c.frames<=0) throw Error('Expected native 1080x1920, 30 FPS and positive integer frames');
  if(!Array.isArray(c.scenes)||!c.scenes.length) throw Error('Scenes required');
  let end=0;const ids=new Set();
  for(const s of c.scenes){if(!s.id||ids.has(s.id)||s.start!==end||!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.end<=s.start)throw Error('Gapped/overlapping/invalid scene');ids.add(s.id);end=s.end;
    for(const [ref,registry] of [['camera','cameras'],['environment','environments']])if(s[ref]!==undefined&&!Object.hasOwn(c[registry]??{},s[ref]))throw Error('Missing '+ref+' reference');
    for(const id of s.characters??[])if(!Object.hasOwn(c.characters??{},id))throw Error('Missing character reference');
  }
  if(end!==c.frames)throw Error('Scene coverage differs from film length');
  const eventIds=new Set();for(const e of c.timelineEvents??[]){if(!e.id||eventIds.has(e.id)||!Number.isInteger(e.frame)||e.frame<0||e.frame>=c.frames)throw Error('Invalid timeline event');eventIds.add(e.id);}
  const cueIds=new Set();for(const cue of c.audioCues??[]){if(!cue.id||cueIds.has(cue.id)||!Number.isInteger(cue.frame)||cue.frame<0||cue.frame>=c.frames||!['sfx','music'].includes(cue.bus)||cue.durationFrames!==undefined&&(!Number.isInteger(cue.durationFrames)||cue.durationFrames<1||cue.frame+cue.durationFrames>c.frames))throw Error('Invalid audio cue');cueIds.add(cue.id);}
  for(const range of c.intentionalBlack??[])if(!Array.isArray(range)||range.length!==2||!range.every(Number.isInteger)||range[0]<0||range[1]<=range[0]||range[1]>c.frames)throw Error('Invalid black interval');
  return c;
}
export function readProduction(file){return validateProduction(JSON.parse(fs.readFileSync(file,'utf8')));}
export function renderPlan(c,{final=false,approved=false,scene}={}){
  validateProduction(c);if(final&&!approved)throw Error('Native final requires explicit human approval, then --approved-final');
  const selected=scene?c.scenes.find(s=>s.id===scene):undefined;if(scene&&!selected)throw Error('Unknown scene '+scene);
  const scale=final?1:.5;
  return {compositionId:c.compositionId,width:c.width*scale,height:c.height*scale,fps:c.fps,frames:selected?selected.end-selected.start:c.frames,frameRange:selected?[selected.start,selected.end-1]:undefined,scale,dpr:scale,concurrency:1,inputProps:{...c.inputProps,qualityScale:scale},muted:true,codec:'h264',crf:17};
}
/** Explicit dependencies avoid hashing outputs/caches or silently missing asset changes. */
export function fingerprint(c,files){
  if(!Array.isArray(files)||!files.length)throw Error('List source, assets, tools and lockfile in fingerprintInputs');
  const hash=crypto.createHash('sha256').update(JSON.stringify(c));
  for(const file of [...new Set(files)].sort()){if(!fs.statSync(file).isFile())throw Error('Fingerprint inputs must be files: '+file);hash.update(path.normalize(file));hash.update(fs.readFileSync(file));}
  return hash.digest('hex');
}
