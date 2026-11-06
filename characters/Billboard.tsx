import React,{useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {V3} from '../math';
export const Billboard:React.FC<{p:V3;size:[number,number];draw:(g:CanvasRenderingContext2D,frame:number)=>void;frame:number;scale?:number}>=({p,size,draw,frame,scale=1})=>{
 const {camera}=useThree(),r=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=800;canvas.height=480;const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;return {canvas,map};},[]);
 useLayoutEffect(()=>{const g=r.canvas.getContext('2d')!;g.clearRect(0,0,800,480);draw(g,frame);r.map.needsUpdate=true;},[r,draw,frame]);
 useLayoutEffect(()=>()=>r.map.dispose(),[r]);const yaw=Math.atan2(camera.position.x-p[0],camera.position.z-p[2]);
 return <mesh position={p} rotation={[0,yaw,0]} scale={scale}><planeGeometry args={size}/><meshBasicMaterial map={r.map} transparent alphaTest={.025} toneMapped={false} side={THREE.DoubleSide}/></mesh>;
};
