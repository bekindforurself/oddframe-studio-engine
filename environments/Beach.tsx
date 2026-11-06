import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {V3} from '../math';
import {Contact} from './Contact';
export const Box=({p,s,c,rotation}:{p:V3;s:V3;c:string;rotation?:V3})=><mesh position={p} rotation={rotation}><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.82}/></mesh>;
const Ball=({p,r,c}:{p:V3;r:number;c:string})=><mesh position={p}><sphereGeometry args={[r,12,8]}/><meshStandardMaterial color={c} roughness={.7}/></mesh>;
const Palm=({p,lean=0,frame=0}:{p:V3;lean?:number;frame?:number})=>{
 const leaf=useMemo(()=>{const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(1.3,.85,2.8,0);s.quadraticCurveTo(1.5,-.6,0,0);return s;},[]);
 return <group position={p} rotation={[0,0,lean]}>
  <mesh position={[0,1.8,0]} rotation={[0,0,-.08]}><cylinderGeometry args={[.12,.22,3.6,9]}/><meshStandardMaterial color="#9C7953"/></mesh>
  {Array.from({length:9},(_,i)=><mesh key={i} position={[i*.024,1+i*.27,0]} rotation={[0,0,-.08]}><torusGeometry args={[.145+(8-i)*.006,.014,4,10]}/><meshStandardMaterial color="#725C43"/></mesh>)}
  {Array.from({length:7},(_,i)=><group key={i} position={[.15,3.65,0]} rotation={[0,i*Math.PI*2/7,0]}><mesh rotation={[-1.05,0,-.2+(i%3)*.15+Math.sin(frame*.02+i)*.025]}><shapeGeometry args={[leaf,8]}/><meshStandardMaterial color={i%2?'#638C63':'#427C65'} side={THREE.DoubleSide}/></mesh></group>)}
  {[0,1,2].map(i=><Ball key={i} p={[.15+Math.cos(i*2)*.16,3.48,Math.sin(i*2)*.16]} r={.16} c="#765A3E"/>)}
 </group>;
};
const Canopy=()=>{
 const geometry=useMemo(()=>{const points:number[]=[],colors:number[]=[];
  for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4,c=new THREE.Color(i%2?'#D59474':'#F0D6A6');points.push(0,.65,0,Math.cos(a)*1.55,0,Math.sin(a)*1.55,Math.cos(b)*1.55,0,Math.sin(b)*1.55);for(let n=0;n<3;n++)colors.push(c.r,c.g,c.b);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[]);useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh position={[0,2.6,0]} geometry={geometry}><meshStandardMaterial vertexColors side={THREE.DoubleSide}/></mesh>;
};
export const Beach:React.FC<{frame:number}>=({frame})=><>
 <fog attach="fog" args={['#AAD5D7',19,60]}/>
 <mesh position={[0,6,-12]}><sphereGeometry args={[45,20,12]}/><meshBasicMaterial color="#94CDDE" side={THREE.BackSide}/></mesh>
 <Box p={[0,-.16,2]} s={[50,.3,30]} c="#E4CBA1"/>
 <mesh position={[0,-.005,-25]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[100,45]}/><meshStandardMaterial color="#4BA7B1" roughness={.65}/></mesh>
 {[0,1,2].map(i=><mesh key={i} position={[0,.01+i*.003,-5.6-i*.7+Math.sin(frame*.025+i)*.15]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[40,.2-i*.035]}/><meshBasicMaterial color={i%2?'#A6D4C7':'#E5E8CE'} transparent opacity={.5}/></mesh>)}
 <mesh position={[7,6,-18]}><sphereGeometry args={[.8,16,12]}/><meshBasicMaterial color="#FFE4A2"/></mesh>
 {[-8,-1,5].map((x,i)=><group key={x} position={[x,5.8+i*.2,-14-i*2]}>
  {[0,1,2].map(n=><mesh key={n} position={[n*.6,Math.sin(n*2)*.18,0]} scale={[1.4, .5, .7]}><sphereGeometry args={[.7,12,8]}/><meshBasicMaterial color="#E9E8D3"/></mesh>)}
 </group>)}
 <group position={[-7,.05,-17]}><mesh><coneGeometry args={[3.5,1.5,12]}/><meshStandardMaterial color="#719786"/></mesh><mesh position={[0,.8,0]}><coneGeometry args={[2,1.6,10]}/><meshStandardMaterial color="#587F73"/></mesh></group>
 <Palm p={[-1.85,0,-1.8]} lean={.06} frame={frame}/><Palm p={[2.6,0,-4.2]} lean={-.08} frame={frame}/>
 <group position={[0,0,.6]}>
  <Box p={[0,.85,0]} s={[3.5,.1,1.3]} c="#B68E5C"/>
  <Box p={[.25,.96,0]} s={[2.8,.13,1.25]} c="#E8DDC0"/>
  <mesh position={[-1.15,1.16,0]} scale={[.48,.18,.61]} rotation={[0,0,.15]}><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#F7E9CD" roughness={1}/></mesh>
  {[-1.25,1.3].map(x=>[-.55,.55].map(z=><Box key={`${x}:${z}`} p={[x,.45,z]} s={[.09,.82,.09]} c="#8E704D" rotation={[0,0,x>0?-.2:.2]}/>))}
 </group>
 <group position={[2.1,0,.5]}>
  <mesh position={[0,1.45,0]}><cylinderGeometry args={[.035,.045,2.9,8]}/><meshStandardMaterial color="#A98459"/></mesh>
  <Canopy/>
 </group>
 <mesh position={[1.85,.65,1.8]}><cylinderGeometry args={[.37,.31,.06,12]}/><meshStandardMaterial color="#C7A876"/></mesh>
 <Box p={[1.85,.31,1.8]} s={[.07,.62,.07]} c="#97794E"/>
 <Ball p={[1.85,.85,1.8]} r={.18} c="#94764F"/>
 <Box p={[1.95,1.12,1.8]} s={[.024,.32,.024]} c="#D5CFAE" rotation={[0,0,-.25]}/>
 <Contact p={[0,.05,.6]} scale={[1.6,.55]}/>
</>;
