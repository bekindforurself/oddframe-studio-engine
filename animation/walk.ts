import {ease,mix3,V3} from '../math';
export type WalkKey=[frame:number,x:number,z:number];
// Existing anchored gait; caller supplies the route and timing instead of film actor ids.
function path(keys:WalkKey[],f:number):V3{let a=keys[0];for(const b of keys.slice(1)){if(f<=b[0])return mix3([a[1],.045,a[2]],[b[1],.045,b[2]],ease((f-a[0])/(b[0]-a[0])));a=b;}return [a[1],.045,a[2]];}
export function sampleWalk(keys:WalkKey[],frame:number,stepFrames=10){
 if(!Number.isFinite(frame)||!Number.isFinite(stepFrames)||stepFrames<1||keys.length<2||keys.some((k,i)=>k.some(v=>!Number.isFinite(v))||(i>0&&k[0]<=keys[i-1][0])))throw new Error('Walk requires finite frame, positive stepFrames and increasing finite keys');
 const start=keys[0][0],end=keys[keys.length-1][0],f=Math.max(start,Math.min(end,frame)),root=path(keys,f);
 const anchor=(at:number,side:number):V3=>{const p=path(keys,at),a=path(keys,at-1),b=path(keys,at+1),d=Math.hypot(b[0]-a[0],b[2]-a[2])||1;return [p[0]-(b[2]-a[2])/d*side*.14,0,p[2]+(b[0]-a[0])/d*side*.14];};
 const span=stepFrames;
 const feet=[0,1].map(i=>{const side=i===0?-1:1;let previous=anchor(start,side);for(let s=start+i*span;s<end;s+=span*2){const e=Math.min(s+span,end),next=anchor(Math.min(e+5,end),side);if(f<s)return previous;if(f<e){const u=(f-s)/(e-s),p=mix3(previous,next,ease(u));p[1]=Math.sin(u*Math.PI)*.12;return p;}previous=next;}return previous;}) as [V3,V3];
 const moving=frame>start&&frame<end;root[1]-=.06*ease((f-start)/6)*(1-ease((f-end+6)/6));return {root,feet,moving};
}
