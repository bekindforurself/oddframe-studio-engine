import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import type {V3} from '../math';
import {clamp,mix,mix3} from '../math';
import type {CameraState} from '../cameras/CameraRig';
export type ShotKind='tracking'|'dolly-in'|'dolly-out'|'fly-through'|'crash-zoom'|'whip-pan'|'orbit'|'over-shoulder'|'reveal';
export type CinematicShot={id:string;kind:ShotKind;start:number;end:number;points:[V3,V3,V3,V3];lookFrom:V3;lookTo:V3;fov:[number,number];ramp?:'smooth'|'fast'|'linear';orbit?:{center:V3;radius:number;angles:[number,number];height:number}};
export type Obstacle={id:string;min:V3;max:V3};
const bezier=(p:CinematicShot['points'],t:number):V3=>[0,1,2].map(i=>(1-t)**3*p[0][i]+3*(1-t)**2*t*p[1][i]+3*(1-t)*t*t*p[2][i]+t**3*p[3][i]) as V3;
const tables=new WeakMap<CinematicShot,{lengths:number[];total:number}>();
function arcParameter(s:CinematicShot,u:number){let table=tables.get(s);if(!table){const lengths=[0];let previous=bezier(s.points,0);for(let i=1;i<=128;i++){const next=bezier(s.points,i/128);lengths.push(lengths[i-1]+Math.hypot(...next.map((x,j)=>x-previous[j])));previous=next;}table={lengths,total:lengths[128]};tables.set(s,table);}if(table.total<1e-8)return u;const d=u*table.total;let i=1;while(i<128&&table.lengths[i]<d)i++;const a=table.lengths[i-1],b=table.lengths[i];return (i-1+(d-a)/Math.max(1e-8,b-a))/128;}
/** Quintic ramp has zero velocity and acceleration at its ends. */
export function smoothSpeedRamp(t:number){const u=clamp(t);return u*u*u*(u*(u*6-15)+10);}
export function sampleShot(s:CinematicShot,frame:number):CameraState{
 if(s.end<=s.start||s.points.some(p=>p.some(n=>!Number.isFinite(n))))throw Error('Invalid cinematic shot');
 const time=clamp((frame-s.start)/(s.end-s.start)),u=s.ramp==='linear'?time:s.ramp==='fast'?smoothSpeedRamp(clamp(time/.8)):smoothSpeedRamp(time),position=bezier(s.points,arcParameter(s,u));
 if(s.kind==='orbit'&&s.orbit){const o=s.orbit,a=mix(o.angles[0],o.angles[1],u);position.splice(0,3,o.center[0]+Math.sin(a)*o.radius,o.center[1]+o.height,o.center[2]+Math.cos(a)*o.radius);}
 let look=mix3(s.lookFrom,s.lookTo,u);
 if(s.kind==='whip-pan'){const a=new THREE.Vector3(...s.lookFrom).sub(new THREE.Vector3(...s.points[0])),b=new THREE.Vector3(...s.lookTo).sub(new THREE.Vector3(...s.points[3])),distance=mix(a.length(),b.length(),u);a.normalize();b.normalize();const rotation=new THREE.Quaternion().setFromUnitVectors(a,b),partial=new THREE.Quaternion().slerp(rotation,u),direction=a.applyQuaternion(partial).multiplyScalar(distance);look=[position[0]+direction.x,position[1]+direction.y,position[2]+direction.z];}
 return {camera:position,look,fov:mix(s.fov[0],s.fov[1],s.kind==='crash-zoom'?smoothSpeedRamp(clamp(time/.5)):u)};
}
export function makeShot(kind:ShotKind,start:number,end:number,from:V3,to:V3,lookFrom:V3,lookTo:V3,options:Partial<CinematicShot>={}):CinematicShot{
 const delta=to.map((x,i)=>x-from[i]) as V3;
 return {id:kind,kind,start,end,points:[from,from.map((x,i)=>x+delta[i]/3) as V3,to.map((x,i)=>x-delta[i]/3) as V3,to],lookFrom,lookTo,fov:kind==='crash-zoom'?[55,30]:kind==='fly-through'?[60,60]:[46,46],ramp:kind==='whip-pan'||kind==='crash-zoom'?'fast':'smooth',...options};
}
export function overShoulder(start:number,end:number,actor:V3,focus:V3,side=1):CinematicShot{return makeShot('over-shoulder',start,end,[actor[0]+side*.9,actor[1]+2.6,actor[2]-2.1],[actor[0]+side*.8,actor[1]+2.65,actor[2]-1.9],focus,focus,{fov:[44,44]});}
/** Conservative swept camera/near-plane sphere vs AABBs. This validates; it does not navigate. */
export function validateShot(s:CinematicShot,obstacles:Obstacle[]|((frame:number)=>Obstacle[]),near=.1,aspect=9/16,padding=.18){const hits:{frame:number;obstacle:string}[]=[];let previous:THREE.Vector3|undefined,previousObstacles:Obstacle[]=[];
 for(let frame=s.start;frame<=s.end;frame++){const state=sampleShot(s,frame),point=new THREE.Vector3(...state.camera),radius=padding+near*Math.sqrt(1+Math.tan(state.fov*Math.PI/360)**2*(1+aspect*aspect));
  const current=typeof obstacles==='function'?obstacles(frame):obstacles;
  for(const o of current){const box=new THREE.Box3(new THREE.Vector3(...o.min),new THREE.Vector3(...o.max)),prior=previousObstacles.find(p=>p.id===o.id);if(prior)box.union(new THREE.Box3(new THREE.Vector3(...prior.min),new THREE.Vector3(...prior.max)));box.expandByScalar(radius);let collision=box.containsPoint(point);if(previous){const d=point.clone().sub(previous),distance=d.length();if(distance>1e-8){const contact=new THREE.Ray(previous,d.normalize()).intersectBox(box,new THREE.Vector3());collision||=!!contact&&contact.distanceTo(previous)<=distance;}}if(collision)hits.push({frame,obstacle:o.id});}previous=point;previousObstacles=current;
 }return {id:s.id,frames:s.end-s.start+1,hits,clear:hits.length===0};}
export const CameraPath=({shot}:{shot:CinematicShot})=>{const geometry=useMemo(()=>{const curve=new THREE.CatmullRomCurve3(Array.from({length:33},(_,i)=>new THREE.Vector3(...sampleShot(shot,shot.start+(shot.end-shot.start)*i/32).camera))),tube=new THREE.TubeGeometry(curve,48,.025,3,false),wire=new THREE.WireframeGeometry(tube);tube.dispose();return wire;},[shot]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <lineSegments geometry={geometry}><lineBasicMaterial color="#FFD58F" toneMapped={false}/></lineSegments>;};
