import {buildConnectedHumanRig} from '../animation/connectedRig';
import type {ActorProps} from '../characters/Human';
import type {V3} from '../math';
import {clamp,ease,mix,mix3} from '../math';
export type LocomotionPath={start:number;end:number;points:V3[];stride?:number};
/** Distance-driven cycle, with stationary world-space anchors through each stance. */
export function sampleLocomotion(path:LocomotionPath,frame:number){
 if(path.end<=path.start||path.points.length<2||!Number.isFinite(frame)||(path.stride??.64)<=0||path.points.some(p=>p.some(n=>!Number.isFinite(n))))throw Error('Invalid locomotion path');
 const lengths=path.points.slice(1).map((p,i)=>Math.hypot(...p.map((n,j)=>n-path.points[i][j]))),total=lengths.reduce((a,b)=>a+b,0);if(total<.001)throw Error('Locomotion path has no length');
 const at=(d:number):V3=>{let remainder=clamp(d/total)*total;for(let i=0;i<lengths.length;i++){if(remainder<=lengths[i]||i===lengths.length-1)return mix3(path.points[i],path.points[i+1],remainder/(lengths[i]||1));remainder-=lengths[i];}return [...path.points[0]];};
 const t=clamp((frame-path.start)/(path.end-path.start)),distance=total*(.5-.5*Math.cos(Math.PI*t)),speed=frame<=path.start||frame>=path.end?0:total*Math.PI*.5*Math.sin(Math.PI*t)/(path.end-path.start),stride=path.stride??.64,cycle=distance/stride;
 const center=at(distance);
 const anchor=(d:number,side:number):V3=>{const p=at(d),a=at(d-.01),b=at(d+.01),len=Math.hypot(b[0]-a[0],b[2]-a[2])||1;return [p[0]-(b[2]-a[2])/len*side*.13,p[1],p[2]+(b[0]-a[0])/len*side*.13];};
 const feet=[0,1].map(i=>{const offset=i*.5,u=cycle+offset,k=Math.floor(u),phase=u-k,side=i===0?-1:1,from=anchor((k-offset)*stride+.14,side),to=anchor((k+1-offset)*stride+.14,side),foot=phase<.6?from:mix3(from,to,ease((phase-.6)/.4));foot[1]+=.13*Math.sin(Math.PI*clamp((phase-.6)/.4))*ease((path.end-frame)/8);return foot;}) as [V3,V3];
 const moving=speed>.0001,weight=Math.sin(cycle*4*Math.PI),root:V3=[center[0],center[1]+.025-(moving?.022*Math.abs(weight)*clamp(speed/.02):0),center[2]];
 return {root,feet,moving,distance,speed,phase:cycle*2*Math.PI};
}
export function cinematicPerformance(actor:ActorProps,phase:number,speed:number,mood:'curious'|'awe'|'fear'|'resolve'='curious'):ActorProps{
 const strength=clamp(speed/.035),wave=Math.sin(phase),slow=Math.sin(actor.frame*.052),rig=buildConnectedHumanRig(actor),walking=actor.pose==='walk';
 for(const [side,arm] of [['left',rig.left],['right',rig.right]] as const){const sign=side==='left'?-1:1;
  arm.shoulder=[arm.shoulder[0]+sign*strength*2,arm.shoulder[1]+(walking?sign*wave*4:slow*1.8)];
  const oldU=Math.atan2(arm.elbow[1]-arm.shoulder[1],arm.elbow[0]-arm.shoulder[0]),oldV=Math.atan2(arm.hand[1]-arm.elbow[1],arm.hand[0]-arm.elbow[0]);
  const u=walking?Math.PI/2+sign*Math.sin(phase)*.25*strength:oldU,v=walking?Math.PI/2+sign*Math.sin(phase-.45)*.32*strength:oldV;
  arm.elbow=[arm.shoulder[0]+146*Math.cos(u),arm.shoulder[1]+146*Math.sin(u)];arm.hand=[arm.elbow[0]+142*Math.cos(v),arm.elbow[1]+142*Math.sin(v)];
  arm.wristAngle=Math.sin(phase-.7)*.055*strength;arm.style=walking?'relaxed':mood==='awe'?'spread':mood==='fear'?'grip':arm.style;
 }
 rig.bob=walking?Math.cos(phase*2)*2*strength:0;
 const blinkFrame=(actor.frame+17)%173,blink=blinkFrame<8?Math.sin(Math.PI*blinkFrame/8)**2:0;
 const result:ActorProps={...actor,rig,armRendering:'connected',emotion:mood==='fear'?'confused':mood==='awe'?'hopeful':'confused',performance:{lean:walking?strength*.025+Math.sin(phase)*.016:slow*.008,sway:walking?Math.sin(phase)*3*strength:slow*1.5,headTilt:walking?-Math.sin(phase-.35)*.025:slow*.02,headNod:walking?Math.cos(phase*2-.4)*2:slow*1.3,clothingDetail:true,face:{gazeX:mood==='awe'?.6:Math.sin(actor.frame*.025)*.28,gazeY:mood==='awe'?-.65:0,brow:mood==='awe'?-8:mood==='fear'?-4:0,asymmetry:mood==='curious'?5:1,eyeOpen:(mood==='awe'?1.12:.92)*(1-.96*blink),mouth:mood==='awe'?'awe':mood==='fear'?'worry':mood==='resolve'?'resolve':'neutral'}}};
 const t=ease((actor.poseAge??20)/12),face=result.performance!.face,previous=actor.fromPose==='shrug'?'awe':'curious';
 if(t<1){face.gazeX=mix(previous==='awe'?.6:Math.sin(actor.frame*.025)*.28,face.gazeX,t);face.gazeY=mix(previous==='awe'?-.65:0,face.gazeY,t);face.brow=mix(previous==='awe'?-8:0,face.brow,t);face.asymmetry=mix(previous==='awe'?1:5,face.asymmetry,t);face.eyeOpen=mix((previous==='awe'?1.12:.92)*(1-.96*blink),face.eyeOpen,t);if(t<.5)face.mouth=previous==='awe'?'awe':'neutral';}
 return result;
}
