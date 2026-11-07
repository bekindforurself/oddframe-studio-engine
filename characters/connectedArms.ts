import type {Person,RigArm} from './humanArt';
type G=CanvasRenderingContext2D;
const ink='#201F23',skin='#F2C9A5';
function segment(g:G,a:number[],b:number[],width:number,color:string,line:number){
 g.lineJoin='round';g.lineCap='round';
 g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.strokeStyle=ink;g.lineWidth=width+line*2;g.stroke();
 g.strokeStyle=color;g.lineWidth=width;g.stroke();
}
/** Draw behind the torso; shoulder extends inside the shirt silhouette, never a detached cap. */
export function drawConnectedUpper(g:G,id:Person,a:RigArm,line:number){
 g.save();segment(g,a.shoulder,a.elbow,id==='worker'?51:62,id==='worker'?'#EBDCC1':'#5A9388',line);
 const dx=a.elbow[0]-a.shoulder[0],dy=a.elbow[1]-a.shoulder[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 g.beginPath();g.moveTo(a.shoulder[0]+nx*13,a.shoulder[1]+ny*13);g.lineTo(a.elbow[0]+nx*13,a.elbow[1]+ny*13);g.strokeStyle=id==='worker'?'#FFF0D3':'#8AB5A3';g.lineWidth=4;g.stroke();g.restore();
}
/** Forearm, cuff and hand share one elbow/wrist coordinate system and overlapping silhouettes. */
export function drawConnectedForearm(g:G,id:Person,a:RigArm,line:number){
 g.save();const [e,h]=[a.elbow,a.hand],angle=Math.atan2(h[1]-e[1],h[0]-e[0]);
 segment(g,e,h,id==='worker'?31:46,id==='worker'?skin:'#5A9388',line);
 // Sleeve cuff is perpendicular to the upper-arm tangent, anchored over the elbow joint.
 const upper=Math.atan2(e[1]-a.shoulder[1],e[0]-a.shoulder[0]);
 g.save();g.translate(e[0],e[1]);g.rotate(upper);
 g.beginPath();g.roundRect(-21,-27,31,54,9);g.fillStyle=id==='worker'?'#EBDCC1':'#35646A';g.strokeStyle=ink;g.lineWidth=line;g.fill();g.stroke();
 g.beginPath();g.moveTo(-8,-20);g.lineTo(-8,20);g.strokeStyle='#BBAC99';g.lineWidth=line*.65;g.stroke();g.restore();
 // Local +X follows the forearm. Wrist is inside the palm, with no separate floating hand offset.
 g.translate(h[0],h[1]);g.rotate(angle+(a.wristAngle??0));
 g.beginPath();
 if(a.style==='point'){
  g.moveTo(-13,-11);g.quadraticCurveTo(1,-20,15,-13);g.lineTo(43,-12);g.quadraticCurveTo(54,-10,45,-2);g.lineTo(20,0);g.quadraticCurveTo(30,17,11,24);g.quadraticCurveTo(-5,25,-13,12);
 }else if(a.style==='spread'){
  g.moveTo(-13,-10);g.lineTo(-7,-22);g.quadraticCurveTo(0,-26,4,-10);g.lineTo(16,-28);g.quadraticCurveTo(23,-31,22,-18);g.lineTo(18,-5);g.lineTo(32,-18);g.quadraticCurveTo(41,-22,35,-9);g.lineTo(26,4);g.lineTo(37,-1);g.quadraticCurveTo(46,1,37,10);g.lineTo(21,23);g.quadraticCurveTo(-3,28,-13,10);
 }else if(a.style==='relaxed'){
  g.moveTo(-13,-10);g.quadraticCurveTo(3,-18,21,-5);g.quadraticCurveTo(39,6,27,13);g.lineTo(14,11);g.quadraticCurveTo(22,25,9,24);g.quadraticCurveTo(-10,22,-13,9);
 }else if(a.style==='grip'){
  g.moveTo(-13,-10);g.quadraticCurveTo(8,-25,28,-9);g.lineTo(29,12);g.quadraticCurveTo(12,32,-10,16);g.closePath();
 }else if(a.style==='open'){
  g.moveTo(-13,-11);g.quadraticCurveTo(-2,-27,7,-22);g.lineTo(12,-10);g.quadraticCurveTo(36,-13,35,1);g.quadraticCurveTo(31,23,12,24);g.quadraticCurveTo(-4,23,-13,11);
 }else{
  g.moveTo(-13,-12);g.quadraticCurveTo(7,-21,22,-10);g.quadraticCurveTo(34,4,20,20);g.quadraticCurveTo(1,30,-13,12);
 }
 g.closePath();g.fillStyle=skin;g.strokeStyle=ink;g.lineWidth=line;g.fill();g.stroke();
 g.beginPath();g.moveTo(7,-3);g.quadraticCurveTo(15,1,16,8);g.strokeStyle='#B87964';g.lineWidth=line*.55;g.stroke();g.restore();
}
