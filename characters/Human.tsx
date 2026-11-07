import React,{useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {drawHuman,HumanState,HUMAN_W,HUMAN_H,HUMAN_WORLD,HUMAN_SOLE} from './humanArt';
import {V3} from '../math';
export type ActorProps=HumanState&{position:V3;roll?:number;scale?:number;renderOrder?:number};
export const Human:React.FC<ActorProps>=({position,roll=0,scale=1,renderOrder=0,...state})=>{
 const {camera,gl}=useThree(),r=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=HUMAN_W*1.2;canvas.height=HUMAN_H*1.2;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
  return {canvas,texture};
 },[]);
 const depth=-new THREE.Vector3(position[0],position[1]+1.6,position[2]).applyMatrix4(camera.matrixWorldInverse).z;
 const ppu=gl.domElement.height/(2*Math.tan((camera as THREE.PerspectiveCamera).fov*Math.PI/360)*Math.max(.1,depth));
 const ink=Math.max(2,Math.min(8,2.25/(ppu*HUMAN_WORLD/HUMAN_H*scale)));
 useLayoutEffect(()=>{const g=r.canvas.getContext('2d')!;g.setTransform(1.2,0,0,1.2,0,0);drawHuman(g,{...state,ink});r.texture.needsUpdate=true;},[r,state.id,state.frame,state.emotion,state.pose,state.fatigue,state.look,state.direction,state.seat,state.fromPose,state.poseAge,state.rig,state.armRendering,ink]);
 useLayoutEffect(()=>()=>r.texture.dispose(),[r]);
 const yaw=Math.atan2(camera.position.x-position[0],camera.position.z-position[2]);
 return <group position={[position[0],position[1]+(HUMAN_SOLE-HUMAN_H/2)/HUMAN_H*HUMAN_WORLD*scale,position[2]]} rotation={[0,yaw,0]}>
  <mesh rotation={[0,0,roll]} scale={scale} renderOrder={renderOrder}><planeGeometry args={[HUMAN_WORLD*HUMAN_W/HUMAN_H,HUMAN_WORLD]}/><meshBasicMaterial map={r.texture} transparent alphaTest={.03} toneMapped={false} side={THREE.DoubleSide}/></mesh>
 </group>;
};
