import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {V3} from '../math';
export const Contact:React.FC<{p:V3;scale?:[number,number]}>=({p,scale=[.5,.25]})=>{
 const texture=useMemo(()=>{const a=document.createElement('canvas');a.width=a.height=64;const g=a.getContext('2d')!,gr=g.createRadialGradient(32,32,0,32,32,31);gr.addColorStop(0,'rgba(20,23,34,.34)');gr.addColorStop(.45,'rgba(20,23,34,.12)');gr.addColorStop(1,'rgba(20,23,34,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(a);},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);return <mesh position={[p[0],.065,p[2]]} rotation={[-Math.PI/2,0,0]} scale={[scale[0]*2,scale[1]*2,1]}><planeGeometry args={[2,2]}/><meshBasicMaterial map={texture} transparent depthWrite={false}/></mesh>;
};
