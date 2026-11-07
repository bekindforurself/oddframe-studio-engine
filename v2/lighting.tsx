import React,{useEffect} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {delayRender,continueRender,cancelRender} from 'remotion';
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';
export const CinematicLightRig=({hdr,night=true}:{hdr:string;night?:boolean})=>{
 const {gl,scene,advance}=useThree();
 useEffect(()=>{const handle=delayRender('Engine 2.0 local HDR ready'),pmrem=new THREE.PMREMGenerator(gl),old=scene.environment,oldTone=gl.toneMapping,oldExposure=gl.toneMappingExposure,oldIntensity=scene.environmentIntensity;let alive=true,target:THREE.WebGLRenderTarget|undefined;
  gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1;gl.shadowMap.type=THREE.PCFSoftShadowMap;scene.environmentIntensity=night?.22:.45;
  new RGBELoader().load(hdr,t=>{if(!alive){t.dispose();return;}try{target=pmrem.fromEquirectangular(t);scene.environment=target.texture;t.dispose();advance(0);continueRender(handle);}catch(e){cancelRender(e as Error);}},undefined,e=>cancelRender(new Error(String(e))));
  return ()=>{alive=false;scene.environment=old;scene.environmentIntensity=oldIntensity;gl.toneMapping=oldTone;gl.toneMappingExposure=oldExposure;target?.dispose();pmrem.dispose();continueRender(handle);};
 },[gl,scene,advance,hdr,night]);
 return <><hemisphereLight args={['#BBD5E4','#303544',night?.65:1]}/><directionalLight position={[-5,9,8]} color="#FFE0BA" intensity={night?2:2.4} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={18} shadow-camera-bottom={-8} shadow-camera-near={.5} shadow-camera-far={65} shadow-normalBias={.025} shadow-bias={-.0001} shadow-radius={3}/><directionalLight position={[6,6,-3]} color="#7AC8E7" intensity={1.1}/></>;
};
