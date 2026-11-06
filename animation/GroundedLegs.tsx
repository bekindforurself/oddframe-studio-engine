import React,{useMemo,useLayoutEffect} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ActorProps} from '../characters/Human';
import {drawRigLeg,P} from '../characters/humanArt';
import {V3} from '../math';
import {ease} from '../math';
const H=3.2,W=700/1100*H;
const Leg:React.FC<{actor:ActorProps;foot:[number,number,number];hipX:number;order:number}>=({actor,foot,hipX,order})=>{
 const {camera,gl}=useThree();
 const r=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=700;canvas.height=1100;const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;return {canvas,map};},[]);
 const yaw=Math.atan2(camera.position.x-foot[0],camera.position.z-foot[2]),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),normal=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
 const origin=new THREE.Vector3(foot[0],foot[1]+.075+480/1100*H,foot[2]);
 const rootYaw=Math.atan2(camera.position.x-actor.position[0],camera.position.z-actor.position[2]),hx=(hipX-350)/1100*H;
 const breathe=Math.sin(actor.frame*.045)*2.5+(actor.rig?.bob??0);
 const hip=new THREE.Vector3(actor.position[0]+hx*Math.cos(rootYaw),actor.position[1]+(1040-712-breathe)/1100*H,actor.position[2]-hx*Math.sin(rootYaw));
 const ankle=new THREE.Vector3(foot[0],foot[1]+.075,foot[2]),u=ankle.clone().sub(hip),dist=u.length();u.normalize();
 const bend=camera.position.clone().sub(hip);bend.y=0;bend.addScaledVector(u,-bend.dot(u)).normalize();
 const k=hip.clone().addScaledVector(u,dist/2).addScaledVector(bend,Math.sqrt(Math.max(0,.505*.505-dist*dist/4)));
 const project=(v:THREE.Vector3):P=>{const ray=v.clone().sub(camera.position);const t=origin.clone().sub(camera.position).dot(normal)/ray.dot(normal);const p=camera.position.clone().addScaledVector(ray,t).sub(origin);return [350+p.dot(right)/W*700,550-p.y/H*1100];};
 const hip2=project(hip),knee2=project(k),depth=origin.clone().applyMatrix4(camera.matrixWorldInverse).z;
 const ppu=gl.domElement.height/(2*Math.tan((camera as THREE.PerspectiveCamera).fov*Math.PI/360)*Math.max(.1,-depth)),ink=Math.max(2,Math.min(8,2.25/(ppu*H/1100)));
 useLayoutEffect(()=>{drawRigLeg(r.canvas.getContext('2d')!,actor.id,hip2,knee2,[350,1030],ink);r.map.needsUpdate=true;},[r,actor.frame,actor.position[0],actor.position[1],actor.position[2],...hip2,...knee2,ink]);
 useLayoutEffect(()=>()=>r.map.dispose(),[r]);
 return <mesh position={origin} rotation={[0,yaw,0]} renderOrder={order}><planeGeometry args={[W,H]}/><meshBasicMaterial map={r.map} transparent alphaTest={.03} depthWrite={false} side={THREE.DoubleSide} toneMapped={false}/></mesh>;
};
export const GroundedLegs:React.FC<{actor:ActorProps;feet:[V3,V3]}>=({actor,feet})=>{
 const {camera}=useThree(),dist=feet.map(f=>camera.position.distanceToSquared(new THREE.Vector3(...f)));
 const screen=feet.map(f=>new THREE.Vector3(...f).project(camera).x),turn=ease((screen[0]-screen[1]+.08)/.16);
 // Frontal cutouts keep screen-left and screen-right hip attachments during a turn.
 // Feet retain their world anchors; only the attachment inside the hidden waistband blends.
 const hips=[310+83*turn,393-83*turn];
 return <>{feet.map((f,i)=><Leg key={i} actor={actor} foot={f} hipX={hips[i]} order={dist[i]>dist[1-i]?1:2}/>)}</>;
};
