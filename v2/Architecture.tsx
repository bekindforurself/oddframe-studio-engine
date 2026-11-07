import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import type {GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {ModelInstances,Placement} from './assets';
import type {V3} from '../math';
/** Real modular openings, window frames, cornices and cornice shadows; no per-window clones. */
export const ArchitecturalFacade=({asset,columns=3,levels=4,position=[0,0,0],rotation=0}:{asset:GLTF;columns?:number;levels?:number;position?:V3;rotation?:number})=>{
 const layout=useMemo(()=>{const nodes:Record<string,Placement[]>={};const add=(node:string,x:number,y:number,z=0)=>{(nodes[node]??=[]).push({position:[x+1.5,y,z]});};
  for(let col=0;col<columns;col++){const x=(col-(columns-1)/2)*3;for(let row=0;row<levels;row++){
   const y=row*3,door=col===Math.floor(columns/2)&&row===0;
   add(door?'wall_door_centered_large_01':row%2?'wall_window_centered_large_02':'wall_window_centered_large_01',x,y);
   add(door?'door_centered_large_01':row%2?'window_centered_large_02':'window_centered_large_01',x,y);
   add('cornice_standard_standard_01',x,y+2.94);if(row===0&&!door)add('dado_standard_standard_01',x,0);
  }add('crown_standard_standard_01',x,levels*3);if(col!==Math.floor(columns/2))add('base_standard_01',x,-.65);}
  return Object.entries(nodes);
 },[columns,levels]);
 return <group position={position} rotation={[0,rotation,0]}>{layout.map(([node,placements])=><ModelInstances key={node} asset={asset} node={node} placements={placements}/>)}</group>;
};
export const WorldLabel=({text,position,width=3,height=.65,color='#CDF6EA'}:{text:string;position:V3;width?:number;height?:number;color?:string})=>{const map=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d')!;g.fillStyle='#0A202C';g.fillRect(0,0,1024,256);g.strokeStyle='#628C98';g.lineWidth=4;g.strokeRect(8,8,1008,240);g.fillStyle=color;g.font='bold 95px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,128,980);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[text,color]);useEffect(()=>()=>map.dispose(),[map]);return <mesh position={position}><planeGeometry args={[width,height]}/><meshBasicMaterial map={map} toneMapped={false}/></mesh>;};
const Block=({p,s,c,metal=0,rough=.6,glow}:{p:V3;s:V3;c:string;metal?:number;rough?:number;glow?:string})=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={rough} metalness={metal} emissive={glow??'#000000'} emissiveIntensity={glow?1.1:0}/></mesh>;
const DistrictStars=()=>{const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:65},(_,i)=>[Math.sin(i*2.399)*45,25+i%13*3,-35-Math.cos(i*2.399)*20]).flat(),3));return g;},[]);useEffect(()=>()=>geometry.dispose(),[geometry]);return <points geometry={geometry}><pointsMaterial color="#C6D8EA" size={.075} toneMapped={false}/></points>;};
export const TransitCourtyard=({asset,frame}:{asset:GLTF;frame:number})=>{
 const pavement=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d')!;g.fillStyle='#66727A';g.fillRect(0,0,512,512);for(let y=0;y<8;y++)for(let x=0;x<8;x++){g.fillStyle=['#606D76','#69747C','#626E76'][(x*7+y*5)%3];g.fillRect(x*64+1,y*64+1,62,62);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(8,12);return t;},[]);useEffect(()=>()=>pavement.dispose(),[pavement]);
 return <>
 <fog attach="fog" args={['#111E34',23,78]}/>
 <mesh position={[0,-.1,8]} receiveShadow><boxGeometry args={[40,.2,60]}/><meshStandardMaterial map={pavement} roughness={.32} metalness={.18} envMapIntensity={.8}/></mesh>
 {/* The imported kit supplies facade detail, not closed buildings. Give it real volumes. */}
 <Block p={[0,7.7,-7.5]} s={[15.2,15.4,8]} c="#5B554F" rough={.85}/>
 <Block p={[-14.5,6.15,8]} s={[8,12.3,12.2]} c="#625C55" rough={.85}/>
 <Block p={[14.5,9.2,8]} s={[8,18.4,12.2]} c="#55565A" rough={.85}/>
 <Block p={[0,15.46,-7.4]} s={[15.5,.16,8.5]} c="#303F4B" metal={.35}/>
 <Block p={[-14.4,12.4,8]} s={[8.6,.18,12.5]} c="#38424B" metal={.35}/>
 <Block p={[14.4,18.5,8]} s={[8.6,.18,12.5]} c="#38424B" metal={.35}/>
 <Block p={[0,16.6,-7.4]} s={[5.2,2.1,4.2]} c="#385A70" metal={.65} rough={.23}/>
 <Block p={[0,17.8,-7.4]} s={[6.2,.2,5.1]} c="#8A9EA4" metal={.75} rough={.25}/>
 {[0,1,2].map(i=><Block key={i} p={[14.4,19.4+i*1.4,8]} s={[7-i*1.7,1.5,9-i*2]} c={i%2?'#466079':'#3D4E65'} metal={.6} rough={.3}/>)}
 <mesh position={[-14.4,12.7,8]} scale={[3.5,1.6,4.8]} castShadow><sphereGeometry args={[1,20,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#547C8A" metalness={.65} roughness={.2}/></mesh>
 <ArchitecturalFacade asset={asset} position={[0,0,-3]} columns={5} levels={5}/>
 <ArchitecturalFacade asset={asset} position={[-10,0,8]} rotation={Math.PI/2} columns={4} levels={4}/>
 <ArchitecturalFacade asset={asset} position={[10,0,8]} rotation={-Math.PI/2} columns={4} levels={6}/>
 <Block p={[0,3.2,-2.25]} s={[3.7,.16,1.7]} c="#314453" metal={.75} rough={.28}/>
 <Block p={[0,3.09,-2.1]} s={[2.8,.035,1.25]} c="#FFDAB3" glow="#F0B06D"/>
 <WorldLabel text="2126  /  TRANSIT" position={[0,3.8,-2.7]} width={3.8} height={.65}/>
 {[-1,1].map(side=><group key={side}>
  {[1,7,13].map(z=><group key={z}><Block p={[side*6.4,2.5,z]} s={[.12,5,.12]} c="#425C6A" metal={.65}/><Block p={[side*6.05,5,z]} s={[.85,.08,.55]} c="#ACF4ED" glow="#4BAAB6"/><pointLight position={[side*6.1,4.7,z]} color="#7BC6DC" intensity={7} distance={8}/></group>)}
  <Block p={[side*4.8,.35,-.6]} s={[2,.7,.65]} c="#363E48" rough={.8}/>
  {Array.from({length:7},(_,i)=><mesh key={i} position={[side*4.8+(i-3)*.22,.85+(i%3)*.09,-.6]} scale={[.2,.45,.2]} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={i%2?'#3F7060':'#617E65'} roughness={1}/></mesh>)}
  <Block p={[side*3.7,.012,9]} s={[.04,.025,23]} c="#A5E8DA" glow="#3B7F8A"/>
 </group>)}
 <pointLight position={[0,2.8,-1.9]} color="#FFD5A4" intensity={16} distance={9}/>
 {Array.from({length:7},(_,i)=><group key={i} position={[(i-3)*5,0,-16-(i%2)*8]}><Block p={[0,12+i%3*4,0]} s={[3,24+i%3*8,5]} c={i%2?'#263B54':'#30485A'} metal={.55} rough={.4}/>{Array.from({length:5},(_,j)=><Block key={j} p={[.8,4+j*5,2.54]} s={[.07,3,.03]} c="#AAD4DA" glow="#395D7F"/>)}</group>)}
 <group position={[Math.sin(frame/65)*5,10,2+frame*.025]} rotation={[0,.2,0]}><mesh scale={[1.3,.35,.65]} castShadow><sphereGeometry args={[1,16,10]}/><meshStandardMaterial color="#7B8E9E" metalness={.75} roughness={.24}/></mesh><Block p={[0,-.25,0]} s={[1.7,.05,.65]} c="#A8ECE8" glow="#437E8C"/></group>
 <DistrictStars/>
 </>;
};
