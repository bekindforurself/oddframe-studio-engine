import React,{useMemo} from 'react';
import * as THREE from 'three';
import {Block,GlowPatch,MaterialLibrary} from './Materials';
import {Exterior} from './Exterior';
import {Contact} from './Contact';
import {V3} from '../math';
// Snapshot of the approved desk calibration; no story timeline dependency.
export const OFFICE_DESK_TOP=1.275587363740888;

const Lamp:React.FC<{p:V3;scale?:number}>=({p,scale=1})=><group position={p} scale={scale}>
 <mesh><cylinderGeometry args={[.2,.28,.065,20]}/><meshStandardMaterial color="#A68B61" metalness={.35} roughness={.4}/></mesh>
 <mesh position={[0,.3,0]} rotation={[0,0,-.12]}><cylinderGeometry args={[.027,.035,.62,10]}/><meshStandardMaterial color="#9F855F" metalness={.45} roughness={.35}/></mesh>
 <mesh position={[-.04,.64,0]}><cylinderGeometry args={[.18,.39,.35,20,1,true]}/><meshStandardMaterial color="#45645F" roughness={.5} side={THREE.DoubleSide}/></mesh>
 <mesh position={[-.04,.475,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.34,24]}/><meshBasicMaterial color="#FFE3AB"/></mesh>
 <mesh position={[-.04,.64,0]}><cylinderGeometry args={[.185,.19,.025,20]}/><meshStandardMaterial color="#C8AA74" metalness={.4}/></mesh>
 <pointLight position={[-.04,.45,.02]} color="#FFD19A" intensity={2.5} distance={4.3} decay={2}/>
</group>;
const Wire:React.FC<{points:V3[]}>=({points})=>{
 const curve=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);
 return <mesh><tubeGeometry args={[curve,20,.014,5,false]}/><meshStandardMaterial color="#252E37" roughness={.8}/></mesh>;
};
const PaperStack:React.FC<{p:V3;pages:number;angle?:number}>=({p,pages,angle=0})=><group position={p} rotation={[0,angle,0]}>
 {Array.from({length:pages},(_,i)=><Block key={i} p={[Math.sin(i*2.3)*.02,i*.017,Math.cos(i)*.016]} s={[.58,.014,.42]} c={i%4?'#E3D7BD':'#B8A88F'}/>)}
 {[0,1,2,3].map(n=><Block key={n} p={[-.03,pages*.017,-.12+n*.07]} s={[.36-n*.035,.003,.006]} c="#929A97"/>)}
 <Block p={[-.19,pages*.017+.008,-.15]} s={[.06,.016,.09]} c="#4A5860" finish="metal"/>
</group>;
const Books:React.FC<{p:V3;count?:number}>=({p,count=8})=><group position={p}>
 {Array.from({length:count},(_,i)=><group key={i} position={[i*.105,0,0]} rotation={[0,0,i===count-1?-.12:0]}>
  <Block p={[0,.18+(i%3)*.025,0]} s={[.085,.36+(i%3)*.05,.28]} c={['#607D82','#A37A57','#B7A381','#3E5568','#7F655C'][i%5]}/>
  {[.1,.26].map(y=><Block key={y} p={[0,y,.145]} s={[.065,.014,.006]} c="#D6C49E"/>)}
 </group>)}
</group>;
const Clock=({frame}:{frame:number})=><group position={[.95,4,-2.94]}>
 <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.35,.35,.07,32]}/><meshStandardMaterial color="#AD976E" metalness={.3}/></mesh>
 <mesh position={[0,0,.04]}><circleGeometry args={[.31,32]}/><meshBasicMaterial color="#D8D4C2"/></mesh>
 {Array.from({length:12},(_,n)=>{const a=n*Math.PI/6;return <Block key={n} p={[Math.sin(a)*.26,Math.cos(a)*.26,.048]} s={[.012,.04,.006]} c="#43505B" rotation={[0,0,-a]}/>;})}
 <group rotation={[0,0,-.5-frame*.002]}><Block p={[0,.085,.056]} s={[.02,.18,.008]} c="#34414D"/></group>
 <group rotation={[0,0,-2.3]}><Block p={[0,.05,.066]} s={[.03,.12,.008]} c="#34414D"/></group>
 <group rotation={[0,0,-frame*.065]}><Block p={[0,.11,.076]} s={[.008,.23,.006]} c="#B78B60"/></group>
</group>;
const Door:React.FC<{frame:number;state?:{door:number;latch:number}}>=({frame,state})=>{
 const s=state??{door:0,latch:0};return <group>
  {[.1,2.2].map(z=><Block key={z} p={[2.29,1.6,z]} s={[.19,3.2,.12]} c="#B9A080" finish="wood"/>)}
  <Block p={[2.29,3.2,1.15]} s={[.2,.13,2.23]} c="#B9A080" finish="wood"/>
  <Block p={[2.3,.035,1.15]} s={[.28,.065,2.1]} c="#AD9B7B" finish="metal"/>
  <group position={[2.3,0,2.2]} rotation={[0,s.door,0]}>
   <Block p={[0,1.55,-1.05]} s={[.09,3.1,2.1]} c="#7B6D5B" finish="wood"/>
   {[.8,2.2].map(y=><group key={y}>
    <Block p={[-.052,y,-1.05]} s={[.025,1.08,1.73]} c="#AC9371" finish="wood"/>
    <Block p={[-.071,y,-1.05]} s={[.012,.93,1.55]} c="#6B6559" finish="wood"/>
   </group>)}
   <mesh position={[-.09,1.45,-1.82]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.045,.045,.11,12]}/><meshStandardMaterial color="#D2B47A" metalness={.6} roughness={.3}/></mesh>
   <group position={[-.15,1.45,-1.82]} rotation={[s.latch,0,0]}><Block p={[0,0,.075]} s={[.045,.045,.19]} c="#D2B47A" finish="metal"/></group>
   {[.35,2.65].map(y=><Block key={y} p={[.005,y,-.04]} s={[.14,.17,.06]} c="#B09B75" finish="metal"/>)}
  </group>
 </group>;
};
const Bedroom=()=> <group>
 <Block p={[4.4,-.1,-.7]} s={[4.2,.2,7]} c="#B59C7A" finish="wood"/>
 <Block p={[6.55,2.9,-.7]} s={[.18,5.8,7]} c="#5F7177" finish="plaster"/>
 <Block p={[4.4,2.9,-3.2]} s={[4.4,5.8,.18]} c="#526772" finish="plaster"/>
 <Block p={[4.7,.04,-1]} s={[3.7,.06,2.7]} c="#807665" finish="cloth"/>
 <Block p={[4.8,.45,-1.1]} s={[2.8,.65,1.6]} c="#79634A" finish="wood"/>
 <Block p={[4.8,.85,-1.1]} s={[2.8,.3,1.65]} c="#E6DCC5" finish="cloth"/>
 <Block p={[4.4,1.04,-1.1]} s={[2.0,.15,1.69]} c="#6E8D90" finish="cloth"/>
 <Block p={[3.9,1.13,-1.1]} s={[.43,.028,1.7]} c="#BAA374" finish="cloth"/>
 <Block p={[6.2,1.07,-1.1]} s={[.15,1.8,1.85]} c="#6A614F" finish="wood"/>
 <Block p={[6.1,1.2,-1.1]} s={[.09,1.2,1.6]} c="#56717B" finish="cloth"/>
 {[-1.6,-.7].map(z=><mesh key={z} position={[5.7,1.12,z]} scale={[.45,.17,.34]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#F0E3C5" roughness={1}/></mesh>)}
 <Block p={[5.6,.55,-2.45]} s={[.7,1.1,.65]} c="#8E7759" finish="wood"/>
 <Lamp p={[5.6,1.16,-2.45]} scale={.8}/>
 <Block p={[4.25,2.8,-3.08]} s={[1.2,.85,.07]} c="#B29C72" finish="wood"/>
 <Block p={[4.25,2.8,-3.03]} s={[1.05,.7,.02]} c="#86A0A7"/>
 <mesh position={[4.25,2.85,-3.01]}><circleGeometry args={[.21,24]}/><meshBasicMaterial color="#D6CCAC"/></mesh>
 <Contact p={[4.8,.04,-1.1]} scale={[1.4,.8]}/>
</group>;
export const Office:React.FC<{frame:number;deskTop?:number;doorState?:{door:number;latch:number}}>=({frame,doorState,deskTop=OFFICE_DESK_TOP})=>{const D=deskTop;return <MaterialLibrary>
 <fog attach="fog" args={['#283C50',18,48]}/><Exterior/>
 <Block p={[-.6,-.12,0]} s={[6,.24,11]} c="#987B5D" finish="wood"/>
 {Array.from({length:14},(_,i)=><Block key={i} p={[-3.4+i*.42,.006,0]} s={[.008,.006,10.8]} c="#6D6150"/>)}
 <Block p={[-.55,.012,-.7]} s={[3.45,.012,3.1]} c="#4C5E65" finish="cloth"/>
 <Block p={[-.55,.020,-.7]} s={[3.2,.002,2.87]} c="#586A6D" finish="cloth"/>
 <Block p={[-3.5,2.9,-3.1]} s={[1.2,5.8,.2]} c="#465B69" finish="plaster"/>
 <Block p={[-1.75,.85,-3.1]} s={[2.3,1.7,.2]} c="#465B69" finish="plaster"/>
 <Block p={[-1.75,5.25,-3.1]} s={[2.3,1.3,.2]} c="#465B69" finish="plaster"/>
 <Block p={[.85,2.9,-3.1]} s={[2.9,5.8,.2]} c="#465B69" finish="plaster"/>
 <Block p={[-3.8,2.9,0]} s={[.18,5.8,6.3]} c="#3B5261" finish="plaster"/>
 <Block p={[2.3,2.9,-1.55]} s={[.18,5.8,3.3]} c="#536571" finish="plaster"/>
 <Block p={[2.3,2.9,3.7]} s={[.18,5.8,3]} c="#536571" finish="plaster"/>
 <Block p={[2.3,4.5,1.15]} s={[.18,2.6,2.1]} c="#536571" finish="plaster"/>
 <Block p={[1.2,5.85,0]} s={[10.8,.12,11]} c="#334954" finish="plaster"/>
 {[-2.94,-.56].map(x=><Block key={x} p={[x,3.2,-2.95]} s={[.11,3.03,.25]} c="#B3A385" finish="wood"/>)}
 {[1.68,4.71].map(y=><Block key={y} p={[-1.75,y,-2.95]} s={[2.5,.11,.25]} c="#B3A385" finish="wood"/>)}
 <Block p={[-1.75,3.2,-2.94]} s={[.065,2.9,.08]} c="#8B9999" finish="metal"/>
 <Block p={[-1.75,3.1,-2.93]} s={[2.3,.055,.08]} c="#8B9999" finish="metal"/>
 <Block p={[-1.75,1.61,-2.82]} s={[2.65,.12,.62]} c="#B5B39E" finish="wood"/>
 <Block p={[-.7,.18,-2.95]} s={[5.7,.26,.12]} c="#253B49"/>
 <Block p={[-.7,4.95,-2.92]} s={[5.7,.07,.09]} c="#8C9C9E"/>
 <Clock frame={frame}/><Door frame={frame} state={doorState}/><Bedroom/>
 {/* Shelves project into the room; books and lamp occupy distinct depths. */}
 <group position={[.9,0,-2.82]}>
  {[-.64,.64].map(x=><Block key={x} p={[x,1.9,0]} s={[.09,2.4,.46]} c="#9B8566" finish="wood"/>)}
  {[.72,1.44,2.18,3.1].map(y=><Block key={y} p={[0,y,0]} s={[1.4,.09,.48]} c="#A88E69" finish="wood"/>)}
  <Books p={[-.49,1.49,-.01]}/><Books p={[-.48,2.23,-.03]} count={6}/>
  <Block p={[.37,2.4,.03]} s={[.24,.28,.25]} c="#A68B67"/>
  <mesh position={[.37,2.65,.03]}><sphereGeometry args={[.13,12,8]}/><meshStandardMaterial color="#829D93"/></mesh>
 </group>
 <Block p={[-.6,D-.07,-.55]} s={[2.6,.14,1.6]} c="#B18A5D" finish="wood"/>
 <Block p={[-.6,D-.16,-.55]} s={[2.68,.035,1.65]} c="#D0AF7B" finish="wood"/>
 {[-1.7,.48].map(x=><Block key={x} p={[x,(D-.2)/2,-.55]} s={[.11,D-.2,1.25]} c="#384954" finish="metal"/>)}
 <Block p={[-1.35,.64,-.62]} s={[.6,.86,1.1]} c="#8B755A" finish="wood"/>
 {[.36,.67,.98].map(y=><group key={y}><Block p={[-1.35,y,-.03]} s={[.53,.25,.055]} c="#A28A68" finish="wood"/><Block p={[-1.35,y,.012]} s={[.19,.025,.03]} c="#CEB47C" finish="metal"/></group>)}
 <Block p={[-.45,.61,-1.65]} s={[.76,.12,.7]} c="#3B575E" finish="cloth"/>
 <Block p={[-.45,1.07,-1.82]} s={[.75,.9,.14]} c="#46636A" finish="cloth" rotation={[-.08,0,0]}/>
 <Block p={[-.45,.3,-1.65]} s={[.07,.56,.07]} c="#86938B" finish="metal"/>
 {[-.25,.25].map(x=><Block key={x} p={[-.45+x,.08,-1.65]} s={[.48,.06,.07]} c="#4B5D63" finish="metal"/>)}
 <Lamp p={[-1.47,D+.06,-.72]}/>
 <GlowPatch p={[-1.25,D+.005,-.52]} size={[1.5,1.3]} color="#FFD593" opacity={.3}/>
 <GlowPatch p={[-1.6,.061,-1.85]} size={[3,2.1]} color="#93C4DB" opacity={.13}/>
 <PaperStack p={[-.9,D+.035,-.05]} pages={9} angle={.08}/>
 <PaperStack p={[.4,D+.035,-.05]} pages={5} angle={-.22}/>
 <PaperStack p={[-.48,D+.025,-.86]} pages={3} angle={.02}/>
 <group position={[-1.08,D+.31,-1.1]} rotation={[0,-.15,0]}>
  <Block p={[0,0,0]} s={[.6,.47,.08]} c="#2A3C48" finish="metal"/>
  <Block p={[0,0,.046]} s={[.51,.37,.012]} c="#729CA2"/>
  {[0,1,2].map(n=><Block key={n} p={[-.04,.1-n*.07,.055]} s={[.32-n*.04,.012,.008]} c="#AEC4BA"/>)}
  <Block p={[0,-.25,.18]} s={[.65,.04,.34]} c="#465C64" finish="metal"/>
 </group>
 <Wire points={[[-1.1,D,-1.2],[-1.7,D-.2,-1.3],[-1.65,.2,-1.7],[-1.4,.08,-2.8],[-.6,.4,-2.95]]}/>
 <Wire points={[[-1.47,D,-.75],[-1.6,D,-1.0],[-1.9,.4,-1.1],[-2.0,.1,-1.7]]}/>
 <Block p={[-.6,.4,-2.91]} s={[.28,.16,.06]} c="#B5B7A9"/>
 {[0,1].map(n=><Block key={n} p={[-.66+n*.12,.4,-2.87]} s={[.02,.06,.008]} c="#4E6370"/>)}
 {/* Foreground trolley and chair establish parallax while remaining below the acting sightline. */}
 <group position={[-1.85,0,2.7]} rotation={[0,.12,0]}>
  {[.25,.83].map(y=><Block key={y} p={[0,y,0]} s={[1.0,.08,.68]} c="#79634E" finish="wood"/>)}
  {[-.43,.43].map(x=>[-.26,.26].map(z=><Block key={`${x}:${z}`} p={[x,.49,z]} s={[.045,.91,.045]} c="#3B4B56" finish="metal"/>))}
  <Books p={[-.35,.3,0]} count={6}/><PaperStack p={[.05,.89,0]} pages={6}/>
  {[-.4,.4].map(x=><mesh key={x} position={[x,.1,.23]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.07,.07,.07,10]}/><meshStandardMaterial color="#263945"/></mesh>)}
 </group>
 <Contact p={[-.6,.04,-.55]} scale={[1.4,.9]}/><Contact p={[-1.85,.04,2.7]} scale={[.7,.5]}/>
</MaterialLibrary>;};
