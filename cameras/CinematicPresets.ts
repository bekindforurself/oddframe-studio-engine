import type {CameraState} from './CameraRig';
import type {V3} from '../math';
import {mix,mix3,clamp,ease} from '../math';
export type Move={start:number;end:number;from:V3;to:V3;lookFrom:V3;lookTo:V3;fovFrom?:number;fovTo?:number};
const unit=(m:Move,f:number)=>clamp((f-m.start)/Math.max(1,m.end-m.start));
/** Integrated raised-cosine speed: zero velocity at both ends, maximum halfway. */
export function SpeedRamp(u:number){const t=clamp(u);return t-Math.sin(2*Math.PI*t)/(2*Math.PI);}
function travel(m:Move,t:number):CameraState{return {camera:mix3(m.from,m.to,t),look:mix3(m.lookFrom,m.lookTo,t),fov:mix(m.fovFrom??46,m.fovTo??46,t)};}
export function FastFlyThrough(m:Move,f:number):CameraState{const t=SpeedRamp(unit(m,f));return travel(m,t);}
export function CrashZoom(m:Move,f:number):CameraState{const u=unit(m,f),t=ease(clamp(u/.72));return travel(m,t);}
export function WhipPan(m:Move,f:number):CameraState{
 const t=SpeedRamp(unit(m,f)),s=travel(m,t),a=Math.atan2(m.lookFrom[0]-m.from[0],m.lookFrom[2]-m.from[2]),b=Math.atan2(m.lookTo[0]-m.to[0],m.lookTo[2]-m.to[2]);
 const yaw=a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
 s.look=[s.camera[0]+Math.sin(yaw)*18,mix(m.lookFrom[1],m.lookTo[1],t),s.camera[2]+Math.cos(yaw)*18];return s;
}
export function CinematicReveal(m:Move,f:number):CameraState{const t=ease(unit(m,f)),s=travel(m,t);s.camera[1]+=.18*Math.sin(Math.PI*t);return s;}
export function SmoothOrbit(center:V3,radius:number,fromAngle:number,toAngle:number,height:number,start:number,end:number,f:number):CameraState{
 const a=mix(fromAngle,toAngle,ease(clamp((f-start)/Math.max(1,end-start))));return {camera:[center[0]+Math.sin(a)*radius,center[1]+height,center[2]+Math.cos(a)*radius],look:[...center],fov:46};
}
