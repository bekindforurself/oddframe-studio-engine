import type {IllustrationPerformance} from './performanceTypes';
import {ease,mix} from '../math';
import {drawConnectedUpper,drawConnectedForearm} from './connectedArms';
export type Person='worker'|'sleeper';
export type Emotion='tired'|'hopeful'|'happy'|'asleep'|'yawn'|'angry'|'confused'|'shocked'|'relaxed';
export type Gesture='idle'|'desk'|'point'|'pay'|'receive'|'sleep'|'shrug'|'self'|'offer'|'storm'|'walk'|'freeze'|'yawn'|'tap';
export type P=[number,number];
export type RigArm={shoulder:P;elbow:P;hand:P;style:'closed'|'open'|'point'|'relaxed'|'spread'|'grip';wristAngle?:number};
export type HumanRig={left:RigArm;right:RigArm;bob:number;separateLegs?:boolean};
export type HumanState={id:Person;frame:number;emotion:Emotion;pose:Gesture;fatigue?:number;look?:number;direction?:number;ink?:number;seat?:number;fromPose?:Gesture;poseAge?:number;rig?:HumanRig;armRendering?:'connected';performance?:IllustrationPerformance};
export const HUMAN_W=700,HUMAN_H=1100,HUMAN_WORLD=3.2,HUMAN_SOLE=1040;
const C={ink:'#201F23',skin:'#F2C9A5',light:'#FFE0BE',shade:'#D39A79',deep:'#B87964',cream:'#EBDCC1',creamLight:'#FFF0D3',creamShade:'#BBAC99',hair:'#49342B',hairLight:'#77503A',teal:'#5A9388',tealLight:'#8AB5A3',tealShade:'#35646A',trousers:'#354351'};
type G=CanvasRenderingContext2D;
/** Thin lit contours and thicker shadow-side contours; no uniform alpha-expanded sticker border. */
class Ink {
 constructor(public g:G,public unit:number){}
 shape(d:string,color:string,split=350,stroke=true){const p=new Path2D(d),g=this.g;g.fillStyle=color;g.fill(p);if(stroke){g.save();g.strokeStyle=C.ink;g.lineJoin='round';g.lineCap='round';g.lineWidth=this.unit*1.1;g.stroke(p);g.beginPath();g.rect(split,-200,1000,1600);g.clip();g.lineWidth=this.unit*2.9;g.stroke(p);g.restore();}return p;}
 ellipse(x:number,y:number,rx:number,ry:number,color:string,stroke=false){const p=new Path2D();p.ellipse(x,y,rx,ry,0,0,Math.PI*2);this.g.fillStyle=color;this.g.fill(p);if(stroke){this.g.strokeStyle=C.ink;this.g.lineWidth=this.unit*1.35;this.g.stroke(p);}return p;}
 clip(p:Path2D,fn:()=>void){this.g.save();this.g.clip(p);fn();this.g.restore();}
 line(d:string,color=C.ink,w=1){this.g.strokeStyle=color;this.g.lineWidth=this.unit*w;this.g.lineCap='round';this.g.lineJoin='round';this.g.stroke(new Path2D(d));}
 limb(a:P,b:P,c:P,color:string,width:number){const d=`M${a} Q${b} ${c}`;this.line(d,C.ink,(width+this.unit*3.4)/this.unit);this.g.save();this.g.translate(-this.unit*.85,0);this.line(d,color,width/this.unit);this.g.restore();}
}

export function armsAt(pose:Gesture,frame:number):{left:P[];right:P[]}{
 const left:P[]=[[260,430],[224,587],[266,711]],right:P[]=[[421,430],[458,586],[420,711]];
 switch(pose){
 case 'desk':return {left:[[250,475],[216,625],[328,658]],right:[[410,475],[459,549],[418,318]]};
 case 'point':right[1]=[484,511];right[2]=[576,418];break;
 case 'pay':right[1]=[465,543];right[2]=[524,540];break;
 case 'receive':left[1]=[206,561];left[2]=[155,542];break;
 case 'shrug':left[1]=[207,558];left[2]=[155,458];right[1]=[479,558];right[2]=[557,458];break;
 case 'self':right[1]=[470,558];right[2]=[365,455];break;
 case 'offer':left[1]=[205,582];left[2]=[150,537];right[1]=[492,412];right[2]=[437,250];break;
 case 'storm':right[1]=[482,520];right[2]=[564,448];left[1]=[203,558];left[2]=[290,694];break;
 case 'sleep':left[1]=[266,560];left[2]=[362,626];right[1]=[443,554];right[2]=[402,647];break;
 case 'yawn':right[1]=[469,459];right[2]=[400,310];break;
 case 'tap':right[1]=[482,570];right[2]=[500+Math.sin(frame*.7)*9,528];break;
 case 'walk':{const w=Math.sin(frame*Math.PI/16)*58;left[1]=[241-w*.25,576];left[2]=[260-w,709];right[1]=[442+w*.25,576];right[2]=[420+w,709];break;}
 }
 return {left,right};
}

export function poseArms(state:HumanState){
 const a=armsAt(state.fromPose??state.pose,state.frame),b=armsAt(state.pose,state.frame),t=ease((state.poseAge??20)/14);
 const blend=(x:P[],y:P[])=>x.map((v,i)=>[mix(v[0],y[i][0],t),mix(v[1],y[i][1],t)] as P);
 return {left:blend(a.left,b.left),right:blend(a.right,b.right)};
}

function hand(p:Ink,x:number,y:number,open:boolean,index:boolean,flip=1){
 const g=p.g;g.save();g.translate(x,y);g.scale(flip,1);
 if(open){
  p.shape('M-17 12 Q-36 0 -28 -14 Q-23 -20 -17 -10 L-8 -2 L-12 -35 Q-12 -46 -4 -43 L4 -13 L3 -49 Q7 -60 14 -50 L17 -13 L23 -44 Q31 -52 34 -41 L29 -8 L39 -30 Q48 -34 48 -23 L34 11 Q25 26 2 29 Z',C.skin,10);
  p.line('M-9 10 Q8 4 22 12',C.deep,.5);
 }else if(index){
  p.shape('M-18 15 Q-27 -7 -13 -16 L5 -20 L37 -45 Q49 -52 51 -40 L26 -12 Q45 -15 46 -2 L34 18 Q15 35 -8 28 Z',C.skin,8);
  p.line('M15 0 L28 10 M2 7 L14 18',C.deep,.65);
 }else{
  p.shape('M-22 -8 Q-13 -24 6 -20 Q28 -17 29 5 Q25 29 2 28 Q-20 29 -22 -8 Z',C.skin,3);
  p.line('M-7 -8 L-5 8 M4 -9 L6 8 M15 -5 L17 6',C.deep,.5);
 }
 g.restore();
}

function arm(p:Ink,id:Person,pts:P[],pose:Gesture,side:'left'|'right'){
 const [s,e,h]=pts,c=id==='worker'?C.cream:C.teal;
 p.limb(s,[(s[0]+e[0])*.5,(s[1]+e[1])*.5],e,c,id==='worker'?51:62);
 p.line(`M${s[0]-9} ${s[1]+9} Q${e[0]-16} ${(s[1]+e[1])*.5} ${e[0]-9} ${e[1]-12}`,id==='worker'?C.creamLight:C.tealLight,2.2);
 if(id==='worker'){
  p.limb(e,[(e[0]+h[0])*.5,(e[1]+h[1])*.5],h,C.skin,31);
  p.shape(`M${e[0]-31} ${e[1]-22} Q${e[0]} ${e[1]-37} ${e[0]+28} ${e[1]-20} L${e[0]+23} ${e[1]+15} Q${e[0]} ${e[1]+26} ${e[0]-28} ${e[1]+11} Z`,C.cream,e[0]);
  p.line(`M${e[0]-22} ${e[1]-9} Q${e[0]} ${e[1]-21} ${e[0]+20} ${e[1]-9}`,C.creamShade,.65);
 }else{
  p.limb(e,[(e[0]+h[0])*.5,(e[1]+h[1])*.5],h,c,49);
  p.line(`M${e[0]+10} ${e[1]+6} Q${h[0]+15} ${h[1]-26} ${h[0]+8} ${h[1]-9}`,C.tealShade,1.2);
  p.ellipse(h[0],h[1]-14,26,12,C.tealShade,true);
 }
 const open=pose==='shrug'||(pose==='receive'&&side==='left')||(pose==='offer'&&side==='left')||(pose==='tap'&&side==='right');
 hand(p,h[0],h[1],open,(pose==='point'||pose==='self'||pose==='storm'||pose==='offer')&&side==='right',side==='left'?-1:1);
}

function head(p:Ink,state:HumanState){
 const {id,emotion,frame}=state,g=p.g,faceState=state.performance?.face,turn=faceState?.gazeX??state.look??0,tired=state.fatigue??0;
 // Natural ears, jaw, nose and hair replace all earlier geometric mascot silhouettes.
 p.ellipse(237,231,28,43,C.skin,true);p.line('M232 216 Q251 220 239 247',C.deep,.7);
 p.ellipse(447,228,22,36,C.shade,true);
 const face=p.shape(id==='worker'?'M252 143 Q327 97 403 140 Q449 170 442 248 Q441 316 395 340 Q350 366 301 341 Q250 325 242 273 Q229 215 252 143 Z':'M251 146 Q328 104 405 145 Q453 180 442 254 Q440 321 392 347 Q341 365 291 339 Q245 315 240 266 Q225 200 251 146 Z',C.skin,375);
 p.clip(face,()=>{
  p.shape('M398 110 Q424 205 404 279 Q388 324 325 345 L389 370 L476 299 L476 143 Z',C.shade,350,false);
  p.shape('M248 176 Q274 142 303 148 L280 290 Q256 263 251 217 Z',C.light,350,false);
  if(id==='worker'&&tired>.15){g.globalAlpha=tired*.35;p.ellipse(288,272,31,12,'#896C7B');p.ellipse(386,271,29,13,'#896C7B');g.globalAlpha=1;}
 });
 if(id==='worker'){
  p.shape('M239 253 Q210 244 220 203 L201 180 L226 151 L211 127 L254 120 L244 94 L286 99 Q305 53 351 81 Q389 47 410 94 Q453 94 466 134 L450 177 L456 218 L435 251 L415 206 L407 161 Q375 183 348 172 L352 144 Q312 192 275 190 L259 227 Z',C.hair,365);
  p.shape('M237 150 Q268 139 289 118 Q303 101 327 101 Q290 149 252 171 Z',C.hairLight,350,false);
  p.shape('M345 110 Q386 90 411 120 L432 151 Q389 139 365 153 Z','#684733',350,false);
  p.line('M250 218 L243 247',C.ink,1.3);
 }else{
  p.shape('M237 246 L222 198 Q214 154 240 123 Q270 85 327 100 Q354 67 397 102 Q434 98 457 140 Q464 169 437 183 L421 216 L419 171 Q365 182 331 148 Q294 178 258 169 L253 232 Z','#714B36',370);
  p.shape('M242 152 Q272 104 321 120 Q349 88 389 117 Q337 122 326 145 Q282 151 242 152 Z','#AC7750',350,false);
  p.line('M432 191 L436 236',C.ink,1.2);
 }
 g.save();g.translate(347+turn*13,0);g.scale(1-Math.abs(turn)*.035,1);g.translate(-347,0);
 const blink=(frame+(id==='worker'?0:53))%137,closed=faceState?false:emotion==='asleep'||emotion==='relaxed'||(blink>=123&&blink<=128);
 const yawning=emotion==='yawn',shocked=emotion==='shocked',angry=emotion==='angry';
 for(const [i,x] of [289,387].entries()){
  const y=233,drop=emotion==='tired'?8+tired*8:0;
  let by=192+(angry?(i===0?7:-3):emotion==='confused'?(i===0?-9:8):0);
  if(shocked||emotion==='hopeful')by-=11;
  if(faceState)by+=faceState.brow+(i===0?-1:1)*faceState.asymmetry;
  p.shape(`M${x-33} ${by+3} Q${x-4} ${by-12} ${x+29} ${by+6} L${x+28} ${by+13} Q${x-2} ${by-3} ${x-33} ${by+10} Z`,C.hair,350,false);
  g.save();if(faceState){g.translate(x,y);g.scale(1,Math.max(.04,faceState.eyeOpen));g.translate(-x,-y);}
  if(closed||yawning){p.line(`M${x-27} ${y+6} Q${x} ${y+(yawning?19:12)} ${x+26} ${y+3}`,C.ink,1.05);}
  else{
   const eye=p.shape(`M${x-29} ${y-17+drop} Q${x} ${y-35+drop} ${x+27} ${y-14+drop} Q${x+32} ${y+29} ${x} ${y+30} Q${x-31} ${y+27} ${x-29} ${y-17+drop} Z`,'#FFF0D8',x+12);
   p.clip(eye,()=>{p.ellipse(x+turn*8,y+3+(faceState?.gazeY??0)*10,shocked?8:12,shocked?12:19,'#342C2A');p.ellipse(x+turn*8-3,y-5,3,4,'#FFF9E9');});
   if(emotion==='tired')p.line(`M${x-29} ${y-9+drop} Q${x} ${y-4+drop} ${x+27} ${y-8+drop}`,C.shade,3.4);
  }
  g.restore();
  if(id==='worker'){p.line(`M${x-22} ${y+39} Q${x} ${y+46+tired*7} ${x+22} ${y+38}`,C.deep,.6);if(tired>.45)p.line(`M${x-15} ${y+49} L${x+16} ${y+53}`,C.deep,.45);}
 }
 p.line('M343 237 Q335 264 347 268 L357 265',C.deep,.65);
 if(faceState?.mouth==='awe'){p.ellipse(347,304,12,17,C.ink);}
 else if(faceState?.mouth==='worry'){p.line('M317 314 Q347 293 378 314',C.ink,1.1);}
 else if(faceState?.mouth==='resolve'){p.line('M319 307 Q348 310 378 303',C.ink,1.1);}
 else if(yawning){p.ellipse(346,300,23,34,C.ink);p.ellipse(345,321,13,10,'#C77E77');}
 else if(shocked){p.ellipse(347,302,18,23,C.ink);}
 else if(emotion==='happy'||emotion==='hopeful'){
  const m=p.shape('M309 291 Q347 311 391 286 Q380 340 345 332 Q320 327 309 291 Z',C.ink,350,false);p.clip(m,()=>p.shape('M310 291 Q350 308 391 286 L385 304 Q347 320 315 304 Z','#FFF0D8',350,false));
 }else if(emotion==='angry')p.line('M311 312 Q347 291 386 309',C.ink,1.3);
 else if(emotion==='confused')p.line('M316 308 L338 303 L356 309 L381 304',C.ink,1);
 else if(emotion==='asleep'||emotion==='relaxed')p.line('M324 305 Q347 319 374 304',C.ink,.8);
 else p.line(`M316 ${308+tired*5} Q347 ${302+tired*10} 377 ${310+tired*2}`,C.ink,1);
 g.restore();
}

export function drawHuman(g:G,state:HumanState){
 g.clearRect(0,0,HUMAN_W,HUMAN_H);const p=new Ink(g,state.ink??4),id=state.id,seated=state.seat??(state.pose==='desk'?1:0);
 const walk=state.pose==='walk',phase=state.frame/32,dir=state.direction??1;
 const pants=id==='worker'?C.trousers:'#786A61';
 if(!state.rig?.separateLegs)for(const [i,x] of [310,393].entries()){
  const ph=(phase+i*.5)%1,swing=ph<.6?0:Math.sin((ph-.6)/.4*Math.PI),stride=walk?(ph<.6?55-ph/.6*110:-55+ease((ph-.6)/.4)*110)*dir:0;
  const foot:P=[x+mix(stride,i===0?40:65,seated),1030-swing*(walk?48:0)];
  const knee:P=[x+mix(stride*.35,95,seated),865-(walk?swing*12:0)];
  p.limb([x,712],knee,foot,pants,id==='worker'?59:74);
  p.line(`M${x+13} 739 Q${knee[0]+17} ${knee[1]} ${foot[0]+12} ${foot[1]-38}`,id==='worker'?'#25313E':'#5A524F',1.3);
  p.shape(`M${foot[0]-31} ${foot[1]-21} Q${foot[0]-5} ${foot[1]-34} ${foot[0]+33} ${foot[1]-18} L${foot[0]+46} ${foot[1]+4} Q${foot[0]+9} ${foot[1]+17} ${foot[0]-36} ${foot[1]+9} Z`,id==='worker'?'#493932':'#C8B693',foot[0]+4);
  p.line(`M${foot[0]-27} ${foot[1]+3} Q${foot[0]} ${foot[1]+9} ${foot[0]+36} ${foot[1]+2}`,id==='worker'?'#A27A55':'#F1D7AA',.7);
 }
 g.save();
 const breathe=Math.sin(state.frame*.045)*2.5+(state.rig?.bob??0),hunch=seated*(.045+(state.fatigue??0)*.035)+(state.pose==='storm'?-.035:0)+(state.performance?.lean??0);
 if(state.performance)g.translate(state.performance.sway,0);
 g.translate(350,720);g.rotate(hunch);g.translate(-350,-720+breathe);
 if(state.rig){if(state.armRendering==='connected'){drawConnectedUpper(g,id,state.rig.left,p.unit);drawConnectedUpper(g,id,state.rig.right,p.unit);}else{paintUpper(p,id,state.rig.left);paintUpper(p,id,state.rig.right);}}
 const body=p.shape('M274 384 Q345 360 414 388 Q443 438 434 533 L424 709 Q348 738 268 713 L256 519 Q239 433 274 384 Z',id==='worker'?C.cream:C.teal,389);
 p.clip(body,()=>{
  p.shape('M393 378 Q407 490 389 618 L413 720 L448 716 L448 399 Z',id==='worker'?C.creamShade:C.tealShade,350,false);
  p.shape('M274 403 L297 416 L285 615 L270 684 L264 515 Z',id==='worker'?C.creamLight:C.tealLight,350,false);
  p.line('M344 423 Q330 556 343 700',id==='worker'?C.creamShade:C.tealShade,.8);
  p.line('M276 637 Q299 620 314 636 M386 654 Q404 631 423 634',id==='worker'?C.creamShade:C.tealShade,1.1);
  p.line('M278 681 L316 693 M382 700 L415 683',C.ink,.55);
  if(state.performance?.clothingDetail){p.line('M267 441 Q285 460 294 474 M412 444 Q399 468 399 482 M279 569 Q294 579 307 575 M384 589 Q405 582 426 591',C.creamShade,.7);for(let i=0;i<4;i++)p.ellipse(349,479+i*48,3,3,'#B9A98F');}
 });
 p.shape('M309 327 L381 325 L385 396 Q353 432 310 398 Z',C.shade,369);
 if(id==='worker'){
  p.shape('M280 384 L309 369 L346 416 L313 445 Z',C.creamLight,329);
  p.shape('M382 370 L412 387 L377 445 L349 416 Z',C.creamLight,382);
  p.shape('M344 416 L365 429 L350 452 L330 435 Z','#637185',350);
  const tie=Math.sin(state.frame*.06)*(walk?18:3);p.shape(`M338 446 L353 449 L${365+tie} 628 L${344+tie} 659 L${326+tie} 637 Z`,'#465C73',350);
  p.shape(`M350 456 L${364+tie} 628 L${344+tie} 649 L${350+tie} 596 Z`,'#2B4055',350,false);
  p.shape('M282 484 L321 483 L319 532 Q304 545 283 532 Z',C.cream,310);
  p.line('M291 489 L291 509',C.ink,.6);p.line('M310 488 L310 511','#986449',.8);
  p.line('M274 711 Q350 727 420 707','#493932',2.1);
 }else{
  p.shape('M289 385 Q348 426 401 384 L412 403 Q351 448 277 405 Z',C.tealShade,382);
  p.line('M278 676 Q342 696 422 677',C.tealShade,2.7);
  p.shape('M365 494 L406 491 L407 530 L371 535 Z','#709E91',393);
 }
 g.save();
 g.translate(-22*seated,88*seated);
 const nod=state.emotion==='tired'?Math.max(0,Math.sin(state.frame*.067))*(.09+(state.fatigue??0)*.12):state.emotion==='yawn'?-.08:state.emotion==='angry'?-.045:0;
 g.translate(347,346);g.rotate(nod+(state.look??0)*.022+(state.performance?.headTilt??0));g.translate(0,state.performance?.headNod??0);g.translate(-347,-346);head(p,state);g.restore();
 if(state.rig){if(state.armRendering==='connected'){drawConnectedForearm(g,id,state.rig.left,p.unit);drawConnectedForearm(g,id,state.rig.right,p.unit);}else{paintForearm(p,id,state.rig.left);paintForearm(p,id,state.rig.right);}}
 else{const arms=poseArms(state);arm(p,id,arms.left,state.pose,'left');arm(p,id,arms.right,state.pose,'right');}
 if(state.pose==='desk'){
  // A drooping shirt collar and a hand at the temple exaggerate exhaustion without changing identity.
  p.line('M253 482 Q276 465 295 478',C.creamShade,.8);
 }
 g.restore();
}

// Opt-in performance layers. Legacy drawings above retain their original default path.
function paintUpper(p:Ink,id:Person,a:RigArm){
 const s=a.shoulder,e=a.elbow,c=id==='worker'?C.cream:C.teal;
 p.limb(s,[(s[0]+e[0])/2,(s[1]+e[1])/2],e,c,id==='worker'?51:62);
 p.line(`M${s[0]-8} ${s[1]+8} L${e[0]-8} ${e[1]-9}`,id==='worker'?C.creamLight:C.tealLight,1.8);
}
function paintForearm(p:Ink,id:Person,a:RigArm){
 const e=a.elbow,h=a.hand,g=p.g,angle=Math.atan2(h[1]-e[1],h[0]-e[0]);
 p.limb(e,[(e[0]+h[0])/2,(e[1]+h[1])/2],h,id==='worker'?C.skin:C.teal,id==='worker'?31:49);
 g.save();g.translate(id==='worker'?e[0]:h[0],id==='worker'?e[1]:h[1]);g.rotate(angle-Math.PI/2);
 if(id==='worker'){
  p.shape('M-28 -17 Q0 -25 28 -17 L27 14 Q0 23 -28 14 Z',C.cream,7);
  p.line('M-21 -5 Q0 -12 21 -5',C.creamShade,.65);
 }else p.shape('M-26 -19 L26 -19 L25 -3 Q0 7 -25 -3 Z',C.tealShade,6);
 g.restore();g.save();g.translate(h[0],h[1]);
 if(a.style==='open'){
  // A rounded cupped mitten: one thumb, one continuous finger mass.
  p.shape('M-26 0 Q-34 -13 -23 -17 Q-15 -18 -10 -8 Q12 -22 28 -10 Q39 5 22 17 Q-5 28 -26 0 Z',C.skin,7);
  p.line('M-12 4 Q2 1 15 7',C.deep,.5);
 }else if(a.style==='point'){
  g.rotate(angle);
  p.shape('M-21 -10 Q-12 -25 4 -18 L34 -17 Q46 -17 46 -7 Q46 2 33 2 L15 3 Q26 10 18 21 Q-6 33 -22 12 Z',C.skin,8);
  p.line('M0 5 Q6 13 14 12',C.deep,.5);
 }else{
  g.rotate(angle);
  p.shape('M-21 -11 Q-9 -25 12 -17 Q31 -7 24 13 Q14 31 -8 23 Q-28 17 -21 -11 Z',C.skin,7);
  p.line('M-8 -4 Q2 -8 8 0',C.deep,.5);
 }
 g.restore();
}

/** A flat illustrated trouser/shoe layer. Only opt-in world-planted feet use this export. */
export function drawRigLeg(g:G,id:Person,hip:P,knee:P,foot:P,ink:number){
 g.clearRect(0,0,HUMAN_W,HUMAN_H);const p=new Ink(g,ink),color=id==='worker'?C.trousers:'#786A61';
 p.limb(hip,knee,foot,color,id==='worker'?59:74);
 p.line(`M${hip[0]+13} ${hip[1]+27} Q${knee[0]+17} ${knee[1]} ${foot[0]+12} ${foot[1]-38}`,id==='worker'?'#25313E':'#5A524F',1.3);
 const [x,y]=foot;
 p.shape(`M${x-31} ${y-21} Q${x-5} ${y-34} ${x+33} ${y-18} L${x+46} ${y+4} Q${x+9} ${y+17} ${x-36} ${y+9} Z`,id==='worker'?'#493932':'#C8B693',x+4);
 p.line(`M${x-27} ${y+3} Q${x} ${y+9} ${x+36} ${y+2}`,id==='worker'?'#A27A55':'#F1D7AA',.7);
}
