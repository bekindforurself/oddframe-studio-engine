import React,{useEffect,useLayoutEffect,useMemo,useRef} from 'react';
import * as THREE from 'three';
import type {ActorProps} from '../characters/Human';
import {CinematicHuman} from '../v2/Human';
import {GroundedLegs} from '../animation/GroundedLegs';
/** Opt-in integration from review05/Film02. Existing renderers are unchanged. */
export const CHARACTER_INTEGRATION={ordinary:{emissive:.22,environment:.5},nightCity:{emissive:.16,environment:.5}} as const;
export function IllustratedActor({actor,feet,moving=false,preset='ordinary',floorY=.026,segmentLength=.49}:{actor:ActorProps;feet?:[THREE.Vector3Tuple,THREE.Vector3Tuple];moving?:boolean;preset?:keyof typeof CHARACTER_INTEGRATION;floorY?:number;segmentLength?:number}) {
  if((actor.scale??1)!==1) throw Error('Projected character legs support only the established 3.2-unit artwork calibration');
  if(moving&&!feet) throw Error('Moving actor requires world-anchored feet');
  const ref=useRef<THREE.Group>(null),settings=CHARACTER_INTEGRATION[preset];
  const shadow=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!,r=g.createRadialGradient(64,64,8,64,64,62);r.addColorStop(0,'rgba(0,5,12,.6)');r.addColorStop(1,'rgba(0,5,12,0)');g.fillStyle=r;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);},[]);
  useEffect(()=>()=>shadow.dispose(),[shadow]);
  useLayoutEffect(()=>{ref.current?.traverse(o=>{if(o instanceof THREE.Mesh){o.renderOrder=3;const m=o.material as THREE.MeshStandardMaterial;m.depthWrite=false;m.emissiveIntensity=settings.emissive;m.envMapIntensity=settings.environment;}});},[actor.frame,settings]);
  const staged:ActorProps={...actor,rig:actor.rig?{...actor.rig,separateLegs:moving}:undefined};
  return <>{moving&&feet&&<GroundedLegs actor={staged} feet={feet} lit segmentLength={segmentLength}/>}<group ref={ref}><CinematicHuman {...staged}/></group><mesh position={[actor.position[0],floorY,actor.position[2]]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.25,.9]}/><meshBasicMaterial map={shadow} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-1}/></mesh></>;
}
export {sampleLocomotion,cinematicPerformance} from '../v2/performance';
export type {LocomotionPath} from '../v2/performance';
