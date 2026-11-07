/** Production intervals are integer, half-open [start,end); clocks remain global. */
export type SceneInterval = {id:string; start:number; end:number};
export type FrameCue = {id:string; frame:number; durationFrames?:number};
export function validateTimeline(scenes:readonly SceneInterval[], frames:number) {
  if (!Number.isInteger(frames) || frames<=0 || !scenes.length) throw Error('A positive frame count and scenes are required');
  const ids=new Set<string>(); let end=0;
  for(const scene of scenes) {
    if(!scene.id || ids.has(scene.id) || !Number.isInteger(scene.start) || !Number.isInteger(scene.end) || scene.start!==end || scene.end<=scene.start) throw Error('Invalid/gapped/overlapping scene '+scene.id);
    ids.add(scene.id); end=scene.end;
  }
  if(end!==frames) throw Error('Scenes must cover the film exactly');
}
export function sceneAt<T extends SceneInterval>(scenes:readonly T[],frame:number):T {
  if(!Number.isInteger(frame)) throw Error('Frame must be an integer');
  const scene=scenes.find(s=>frame>=s.start&&frame<s.end);
  if(!scene) throw Error('Frame outside timeline');
  return scene;
}
/** Retiming adapter extracted from Film02 sourceAt; endpoints supplied by the film. */
export function remapFrame(frame:number,from:[number,number],to:[number,number],integer=false) {
  if(![frame,...from,...to].every(Number.isFinite)||from[1]<=from[0]) throw Error('Invalid frame mapping');
  const t=Math.max(0,Math.min(1,(frame-from[0])/(from[1]-from[0])));
  const result=to[0]+t*(to[1]-to[0]); return integer?Math.floor(result):result;
}
export function frameToSample(frame:number,fps=30,sampleRate=48000) {
  if(!Number.isFinite(frame)||frame<0||!Number.isFinite(fps)||fps<=0||!Number.isInteger(sampleRate)||sampleRate<=0) throw Error('Invalid audio clock');
  return Math.round(frame*sampleRate/fps);
}
export function activeCues<T extends FrameCue>(cues:readonly T[],frame:number):T[] {
  return cues.filter(c=>frame>=c.frame&&frame<c.frame+(c.durationFrames??1));
}
