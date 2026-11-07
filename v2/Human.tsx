import React,{useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {drawHuman,HUMAN_H,HUMAN_W,HUMAN_WORLD,HUMAN_SOLE} from '../characters/humanArt';
import type {ActorProps} from '../characters/Human';
/** Opt-in lit illustration; legacy Human retains its exact unlit rendering path. */
export const CinematicHuman=({position,scale=1,roll=0,...state}:ActorProps)=>{
 const {camera}=useThree(),r=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1320;const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;return {canvas,map};},[]);
 useLayoutEffect(()=>{const g=r.canvas.getContext('2d')!;g.setTransform(1.2,0,0,1.2,0,0);drawHuman(g,{...state,ink:3});r.map.needsUpdate=true;},[r,state]);useLayoutEffect(()=>()=>r.map.dispose(),[r]);
 const yaw=Math.atan2(camera.position.x-position[0],camera.position.z-position[2]);
 return <group position={[position[0],position[1]+(HUMAN_SOLE-HUMAN_H/2)/HUMAN_H*HUMAN_WORLD*scale,position[2]]} rotation={[0,yaw,0]}><mesh rotation={[0,0,roll]} scale={scale} castShadow receiveShadow><planeGeometry args={[HUMAN_WORLD*HUMAN_W/HUMAN_H,HUMAN_WORLD]}/><meshStandardMaterial map={r.map} emissiveMap={r.map} emissive="#FFFFFF" emissiveIntensity={.32} roughness={.95} metalness={0} envMapIntensity={.35} transparent alphaTest={.15} side={THREE.DoubleSide}/></mesh></group>;
};
