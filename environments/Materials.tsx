import React,{createContext,useContext,useEffect,useMemo} from 'react';
import * as THREE from 'three';
import {V3} from '../math';
type Library={wood:THREE.Texture;plaster:THREE.Texture;cloth:THREE.Texture};
const Materials=createContext<Library|null>(null);
function texture(kind:'wood'|'plaster'|'cloth'){
 const a=document.createElement('canvas');a.width=a.height=256;const g=a.getContext('2d')!;
 const grad=g.createLinearGradient(0,0,256,256);grad.addColorStop(0,'#E8E0D1');grad.addColorStop(1,'#BCB6AA');g.fillStyle=grad;g.fillRect(0,0,256,256);
 if(kind==='wood'){
  for(let i=0;i<90;i++){const y=i*3;g.strokeStyle=i%4?'rgba(89,66,43,.10)':'rgba(255,247,215,.22)';g.lineWidth=i%3?1:2;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(65,y+Math.sin(i*1.4)*11,185,y+Math.cos(i)*8,256,y+Math.sin(i*.7)*8);g.stroke();}
 }else if(kind==='cloth'){
  for(let i=0;i<128;i++){g.fillStyle=i%2?'rgba(60,61,55,.06)':'rgba(255,255,230,.1)';g.fillRect(i*2,0,1,256);g.fillRect(0,i*2,256,1);}
 }else{
  for(let i=0;i<4200;i++){const x=(i*137.29)%256,y=(i*73.17)%256;g.fillStyle=i%3?'rgba(73,80,80,.025)':'rgba(255,250,220,.05)';g.fillRect(x,y,1,1);}
 }
 const map=new THREE.CanvasTexture(a);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=2;return map;
}
export const MaterialLibrary:React.FC<React.PropsWithChildren>=({children})=>{
 const r=useMemo(()=>({wood:texture('wood'),plaster:texture('plaster'),cloth:texture('cloth')}),[]);
 useEffect(()=>()=>Object.values(r).forEach(t=>t.dispose()),[r]);return <Materials.Provider value={r}>{children}</Materials.Provider>;
};
export const Block:React.FC<{p:V3;s:V3;c:string;finish?:keyof Library|'metal';rotation?:V3}>=({p,s,c,finish,rotation})=>{
 const r=useContext(Materials),map=finish&&finish!=='metal'?r?.[finish]:undefined;
 return <mesh position={p} rotation={rotation}><boxGeometry args={s}/><meshStandardMaterial map={map} color={c} roughness={finish==='metal'?.36:finish==='cloth'?.98:.82} metalness={finish==='metal'?.5:0}/></mesh>;
};
export const GlowPatch:React.FC<{p:V3;size:[number,number];color:string;opacity?:number}>=({p,size,color,opacity=.35})=>{
 const map=useMemo(()=>{const a=document.createElement('canvas');a.width=a.height=128;const g=a.getContext('2d')!,gr=g.createRadialGradient(64,64,5,64,64,64);gr.addColorStop(0,color);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(a);t.colorSpace=THREE.SRGBColorSpace;return t;},[color]);
 useEffect(()=>()=>map.dispose(),[map]);return <mesh position={p} rotation={[-Math.PI/2,0,0]}><planeGeometry args={size}/><meshBasicMaterial map={map} transparent opacity={opacity} depthWrite={false}/></mesh>;
};
