/** Authoring guards extracted from Film03. Reuse v2 camera paths without new defaults. */
import * as THREE from 'three';
import type {CameraState} from '../cameras/CameraRig';
import type {V3} from '../math';
export type DeletionBeat={pressFrame:number;deleteFrame:number;button:[number,number];object:[number,number];reaction:[number,number]};
export function validateDeletionBeat(beat:DeletionBeat,{before=10,after=12,releaseFrames=6}={}){
 const intervals=[beat.button,beat.object,beat.reaction];
 if(!Number.isInteger(before)||before<1||!Number.isInteger(after)||after<1||!Number.isInteger(releaseFrames)||releaseFrames<0||!Number.isInteger(beat.pressFrame)||!Number.isInteger(beat.deleteFrame)||intervals.some(v=>v.length!==2||v.some(f=>!Number.isInteger(f)||f<0)||v[1]<=v[0]))throw Error('Invalid deletion beat');
 if(beat.button[1]!==beat.object[0]||beat.object[1]!==beat.reaction[0]||beat.pressFrame<beat.button[0]||beat.pressFrame+releaseFrames>=beat.button[1]||beat.deleteFrame-beat.object[0]<before||beat.object[1]-beat.deleteFrame<after)throw Error('Unreadable action/object/reaction timing');
 return true;
}
export function propFraming(state:CameraState,min:V3,max:V3,{aspect=9/16,margin=.97,near=.1,far=80}={}){
 if([...state.camera,...state.look,state.fov,...min,...max,aspect,margin,near,far].some(n=>!Number.isFinite(n))||state.fov<=0||state.fov>=179||aspect<=0||margin<=0||margin>1||near<=0||far<=near||min.some((n,i)=>n>max[i])||new THREE.Vector3(...state.camera).distanceTo(new THREE.Vector3(...state.look))<1e-8)throw Error('Invalid prop framing');
 const camera=new THREE.PerspectiveCamera(state.fov,aspect,near,far);camera.position.set(...state.camera);camera.lookAt(...state.look);camera.updateMatrixWorld();
 let edge=0,depthClear=true;
 for(let i=0;i<8;i++){
  const p=new THREE.Vector3(...min.map((v,j)=>i&(1<<j)?max[j]:v) as V3),depth=-p.clone().applyMatrix4(camera.matrixWorldInverse).z,q=p.project(camera);
  edge=Math.max(edge,Math.abs(q.x),Math.abs(q.y));depthClear&&=depth>=near&&depth<=far;
 }
 return {inside:depthClear&&Number.isFinite(edge)&&edge<=margin,edge,depthClear};
}
