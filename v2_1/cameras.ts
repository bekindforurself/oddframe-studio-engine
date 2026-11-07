import {sampleShot,smoothSpeedRamp,type CinematicShot} from '../v2/cameras';
import type {CameraState} from '../cameras/CameraRig';
import {mix,mix3} from '../math';
export type ProductionShot=CinematicShot&{blendFrames?:number};
/** Reuse authored v2 paths; cuts are default. Blends must be explicitly requested. */
export function sampleShotSequence(shots:readonly ProductionShot[],frame:number):CameraState {
  const i=shots.findIndex(s=>frame>=s.start&&frame<s.end);
  if(i<0) throw Error('No camera shot for frame '+frame);
  const shot=shots[i],current=sampleShot(shot,frame),blend=shot.blendFrames??0;
  if(!Number.isInteger(blend)||blend<0||blend>shot.end-shot.start) throw Error('Invalid camera blend');
  if(!i||!blend||frame>=shot.start+blend) return current;
  if(shots[i-1].end!==shot.start) throw Error('Camera blend requires adjacent shots');
  const previous=sampleShot(shots[i-1],shots[i-1].end),u=smoothSpeedRamp((frame-shot.start)/blend);
  return {camera:mix3(previous.camera,current.camera,u),look:mix3(previous.look,current.look,u),fov:mix(previous.fov,current.fov,u)};
}
export {makeShot,overShoulder,sampleShot,validateShot,CameraPath,smoothSpeedRamp} from '../v2/cameras';
export type {CinematicShot,ShotKind,Obstacle} from '../v2/cameras';
