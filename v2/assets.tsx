import React,{useMemo,useLayoutEffect,useEffect,useRef} from 'react';
import * as THREE from 'three';
import {GLTFLoader,GLTF} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import type {V3} from '../math';

export type AssetRecord={id:string;url:string;license:string;licenseURL:string;sourceURL:string;sha256:string;maxBytes:number};
export function validateAssetRecord(r:AssetRecord){
 if(!r.id||!r.url||!r.license||!/^https:\/\//.test(r.licenseURL)||!/^https:\/\//.test(r.sourceURL)||!/^[a-f0-9]{64}$/i.test(r.sha256)||!Number.isFinite(r.maxBytes)||r.maxBytes<=0)throw Error('Asset needs provenance, hash and a byte budget');
 return r;
}
const models=new Map<string,Promise<GLTF>>(),textures=new Map<string,Promise<THREE.Texture>>();
export const assetCacheStats=()=>({models:models.size,textures:textures.size});
/** No remote decoder side effects. Compressed GLTF requires an explicitly configured loader. */
export function loadModel(url:string,loader=new GLTFLoader()){
 let pending=models.get(url);if(!pending){pending=loader.loadAsync(url).catch(e=>{models.delete(url);throw e;});models.set(url,pending);}return pending;
}
export function loadLicensedModel(record:AssetRecord,loader=new GLTFLoader()){
 const r=validateAssetRecord(record),key=r.url+'#'+r.sha256;let pending=models.get(key);
 if(!pending){pending=(async()=>{const response=await fetch(r.url);if(!response.ok)throw Error('Asset HTTP '+response.status);const data=await response.arrayBuffer();if(data.byteLength>r.maxBytes)throw Error('Asset exceeds byte budget');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join('');if(hash!==r.sha256.toLowerCase())throw Error('Asset SHA-256 mismatch');return loader.parseAsync(data,new URL('.',new URL(r.url,window.location.href)).href);})().catch(e=>{models.delete(key);throw e;});models.set(key,pending);}return pending;
}
export function loadTexture(url:string,role:'color'|'data'='color'){
 const key=role+':'+url;let pending=textures.get(key);if(!pending){pending=new THREE.TextureLoader().loadAsync(url).then(t=>{t.colorSpace=role==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;return t;}).catch(e=>{textures.delete(key);throw e;});textures.set(key,pending);}return pending;
}
export type MaterialSetup={roughness?:number;metalness?:number;envMapIntensity?:number;tint?:string};
export function configureMaterial(source:THREE.Material,setup:MaterialSetup){const m=source.clone() as THREE.MeshStandardMaterial;if(m.isMeshStandardMaterial){if(setup.roughness!==undefined)m.roughness=setup.roughness;if(setup.metalness!==undefined)m.metalness=setup.metalness;m.envMapIntensity=setup.envMapIntensity??.7;if(setup.tint)m.color.multiply(new THREE.Color(setup.tint));}return m;}
export function assetMetrics(scene:THREE.Object3D){let meshes=0,triangles=0,prototypeTriangles=0;const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{if(o instanceof THREE.Mesh){meshes++;geometries.add(o.geometry);const n=(o.geometry.index?.count??o.geometry.getAttribute('position')?.count??0)/3;prototypeTriangles+=n;triangles+=n*(o instanceof THREE.InstancedMesh?o.count:1);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});return {meshes,triangles,prototypeTriangles,uniqueGeometries:geometries.size,uniqueMaterials:materials.size};}
export const Model=({asset,node,position=[0,0,0],rotation=[0,0,0],scale=1,materialSetup={},frame=0,fps=30,clip,anchor='authored'}:{asset:GLTF;node?:string;position?:V3;rotation?:V3;scale?:number;materialSetup?:MaterialSetup;frame?:number;fps?:number;clip?:string;anchor?:'authored'|'ground-center'})=>{
 const settings=JSON.stringify(materialSetup),instance=useMemo(()=>{const source=node?asset.scene.getObjectByName(node):asset.scene;if(!source)throw Error('Missing GLTF node '+node);const root=clone(source),owned:THREE.Material[]=[];root.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=o.receiveShadow=true;const paint=(m:THREE.Material)=>{const n=configureMaterial(m,materialSetup);owned.push(n);return n;};o.material=Array.isArray(o.material)?o.material.map(paint):paint(o.material);}});return {root,owned,mixer:new THREE.AnimationMixer(root)};},[asset,node,settings]);
 useLayoutEffect(()=>{if(clip){const animation=asset.animations.find(a=>a.name===clip);if(!animation)throw Error('Missing animation '+clip);instance.mixer.stopAllAction();instance.mixer.clipAction(animation).play();instance.mixer.setTime(frame/fps);}},[instance,clip,frame,fps,asset]);
 useEffect(()=>()=>{instance.mixer.stopAllAction();instance.owned.forEach(m=>m.dispose());},[instance]);
 const offset=useMemo(()=>{if(anchor==='authored')return [0,0,0] as V3;instance.root.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(instance.root),center=bounds.getCenter(new THREE.Vector3());return [-center.x,-bounds.min.y,-center.z] as V3;},[instance,anchor]);
 return <group position={position} rotation={rotation} scale={scale}><group position={offset}><primitive object={instance.root} dispose={null}/></group></group>;
};
export type Placement={position:V3;rotation?:V3;scale?:V3};
const InstancePart=({geometry,material,matrices}:{geometry:THREE.BufferGeometry;material:THREE.Material|THREE.Material[];matrices:THREE.Matrix4[]})=>{const ref=useRef<THREE.InstancedMesh>(null);useLayoutEffect(()=>{matrices.forEach((m,i)=>ref.current!.setMatrixAt(i,m));ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere();},[matrices]);return <instancedMesh ref={ref} args={[geometry,material,matrices.length]} castShadow receiveShadow dispose={null}/>;};
/** One draw per GLTF primitive/material, not one draw per repeated window. Static meshes only. */
export const ModelInstances=({asset,node,placements}:{asset:GLTF;node:string;placements:Placement[]})=>{
 const parts=useMemo(()=>{const root=asset.scene.getObjectByName(node);if(!root)throw Error('Missing instanced node '+node);root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),out:{geometry:THREE.BufferGeometry;material:THREE.Material|THREE.Material[];local:THREE.Matrix4}[]=[];root.traverse(o=>{if(o instanceof THREE.SkinnedMesh)throw Error('Skinned nodes require Model, not ModelInstances');if(o instanceof THREE.Mesh)out.push({geometry:o.geometry,material:o.material,local:inverse.clone().multiply(o.matrixWorld)});});return out;},[asset,node]);
 const matrices=useMemo(()=>parts.map(p=>placements.map(t=>new THREE.Matrix4().compose(new THREE.Vector3(...t.position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(t.rotation??[0,0,0]))),new THREE.Vector3(...(t.scale??[1,1,1]))).multiply(p.local))),[parts,placements]);return <>{parts.map((p,i)=><InstancePart key={i} geometry={p.geometry} material={p.material} matrices={matrices[i]}/>)}</>;
};
