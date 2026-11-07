import type {ActorProps} from '../characters/Human';
import type {P,RigArm,HumanRig,Gesture} from '../characters/humanArt';
import {ease} from '../math';
// Constant-length, outward-bending chains. Targets are wrist anchors, not fingertips.
export const ARM_LENGTHS=[146,142] as const;
export function solveConnectedArm(s:P,target:P,side:'left'|'right',style:RigArm['style']):RigArm{
 const dx=target[0]-s[0],dy=target[1]-s[1],raw=Math.hypot(dx,dy),d=Math.max(90,Math.min(283,raw));
 const ux=dx/(raw||1),uy=dy/(raw||1),along=(146**2-142**2+d*d)/(2*d),offset=Math.sqrt(Math.max(0,146**2-along**2));
 const branch=side==='left'?1:-1;
 return {shoulder:[...s],elbow:[s[0]+ux*along-uy*offset*branch,s[1]+uy*along+ux*offset*branch],hand:[s[0]+ux*d,s[1]+uy*d],style};
}
export function buildConnectedHumanRig(a:ActorProps):HumanRig{
 // Curated shoulder/forearm angles avoid the IK branch inversion at raised-hand poses.
 // Blend joint angles, then forward-project the fixed-length connected bones.
 const angles=(p:Gesture):[number,number,number,number]=>{
  const swing=Math.sin(a.frame*Math.PI/12);
  switch(p){
   case 'walk':return [100+swing*7,85+swing*5,80-swing*7,95-swing*5];
   case 'freeze':return [135,-15,45,-165];
   case 'tap':case 'point':return [100,85,55,-20+(p==='tap'?Math.sin(a.frame*.18)*2:0)];
   case 'shrug':case 'offer':return [133,-52,47,-128];
   case 'self':return [100,85,65,-145];
   case 'yawn':return [100,85,65,-125];
   case 'sleep':return [108,35,72,145];
   case 'receive':return [125,-20,80,95];
   case 'pay':return [100,85,65,-15];
   case 'desk':return [112,45,65,-120];
   case 'storm':return [120,70,50,-25];
   default:return [100,85,80,95];
  }
 };
 const to=angles(a.pose),from=angles(a.fromPose??a.pose),t=ease((a.poseAge??30)/20);
 const angle=(i:number)=>{const delta=Math.atan2(Math.sin((to[i]-from[i])*Math.PI/180),Math.cos((to[i]-from[i])*Math.PI/180));return from[i]*Math.PI/180+delta*t;};
 const project=(s:P,i:number,style:RigArm['style']):RigArm=>{const u=angle(i),v=angle(i+1),e:P=[s[0]+146*Math.cos(u),s[1]+146*Math.sin(u)];return {shoulder:s,elbow:e,hand:[e[0]+142*Math.cos(v),e[1]+142*Math.sin(v)],style};};
 const open=a.pose==='freeze'||a.pose==='shrug'||a.pose==='offer';
 return {left:project([265,416],0,open?'open':'closed'),right:project([419,416],2,a.pose==='point'||a.pose==='tap'?'point':open?'open':'closed'),bob:a.pose==='walk'?Math.sin(a.frame*Math.PI/12)*1.5:0,separateLegs:a.pose==='walk'};
}
