import React,{useMemo,useEffect,useLayoutEffect,useRef} from 'react';
import * as THREE from 'three';
import {Block} from './Materials';
import {V3} from '../math';
const WindowBatch:React.FC<{cells:V3[];color:string}>=({cells,color})=>{
 const ref=useRef<THREE.InstancedMesh>(null);
 useLayoutEffect(()=>{const m=new THREE.Matrix4();cells.forEach((p,i)=>{m.makeScale(.19,.31,.025);m.setPosition(...p);ref.current!.setMatrixAt(i,m);});ref.current!.instanceMatrix.needsUpdate=true;},[cells]);
 return <instancedMesh ref={ref} args={[undefined,undefined,cells.length]}><boxGeometry args={[1,1,1]}/><meshBasicMaterial color={color}/></instancedMesh>;
};
export const Exterior=()=>{
 const r=useMemo(()=>{
  const a=document.createElement('canvas');a.width=64;a.height=256;const g=a.getContext('2d')!,gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#111C32');gr.addColorStop(.58,'#344E6A');gr.addColorStop(1,'#405A70');g.fillStyle=gr;g.fillRect(0,0,64,256);const sky=new THREE.CanvasTexture(a);sky.colorSpace=THREE.SRGBColorSpace;
  const buildings=[[-4.4,1.5,-6.5],[-2.9,1.85,-8.3],[-1,1.3,-7.4],[.9,2.2,-10],[2.9,1.5,-8],[4.7,2.3,-12]] as V3[];
  const cells:V3[][]=[[],[],[]];buildings.forEach((p,i)=>{for(let n=0;n<20;n++)cells[(n+i*3)%7===0?0:(n+i)%3===0?1:2].push([p[0]-.57+n%4*.36,.35+Math.floor(n/4)*.58,p[2]+.61]);});return {sky,buildings,cells};
 },[]);
 useEffect(()=>()=>r.sky.dispose(),[r]);
 return <group>
  <mesh position={[0,6,-14]}><sphereGeometry args={[38,24,16]}/><meshBasicMaterial map={r.sky} side={THREE.BackSide}/></mesh>
  {r.buildings.map((p,i)=><group key={i}>
   <Block p={p} s={[1.55,p[1]*2,1.2]} c={['#24384C','#31495E','#314C61'][i%3]}/>
   <Block p={[p[0],p[1]*2+.08,p[2]]} s={[1.7,.12,1.32]} c="#496173"/>
   {i%2===0&&<Block p={[p[0]+.3,p[1]*2+.3,p[2]]} s={[.38,.5,.45]} c="#2B4256"/>}
  </group>)}
  <WindowBatch cells={r.cells[0]} color="#E9C28C"/><WindowBatch cells={r.cells[1]} color="#7B9FB0"/><WindowBatch cells={r.cells[2]} color="#3F596A"/>
  <mesh position={[-1.2,4.6,-9.7]}><sphereGeometry args={[.42,24,16]}/><meshBasicMaterial color="#E5E4D2"/></mesh>
  <mesh position={[-1.06,4.7,-9.52]}><sphereGeometry args={[.37,20,12]}/><meshBasicMaterial color="#233A55"/></mesh>
  {Array.from({length:11},(_,i)=><mesh key={i} position={[-6+(i*1.71)%13,4.6+(i*.61)%3,-13]}><sphereGeometry args={[.018,5,4]}/><meshBasicMaterial color="#B9CDD4"/></mesh>)}
  {/* A near rooftop adds a separate depth layer outside the window. */}
  <Block p={[-2,.7,-5]} s={[3.8,.24,1.6]} c="#4E6470"/>
  {[-3.6,-2.8,-2,-1.2,-.4].map(x=><Block key={x} p={[x,1.06,-4.35]} s={[.025,.7,.025]} c="#72858C"/>)}
  <Block p={[-2,1.39,-4.35]} s={[3.5,.035,.04]} c="#82939A"/>
 </group>;
};
