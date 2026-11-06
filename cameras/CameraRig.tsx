import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {ease,mix3,V3} from '../math';
export type CameraState={camera:V3;look:V3;fov:number};
export type CameraShot=CameraState&{start:number;end:number;travel?:V3};
/** Same frame-based small eased travel as the final-film cameras, without story cuts. */
export function sampleCameraShot(shot:CameraShot,frame:number):CameraState{
 const t=ease((frame-shot.start)/Math.max(1,shot.end-shot.start));
 const travel=shot.travel??[0,0,0];return {camera:mix3(shot.camera,[shot.camera[0]+travel[0],shot.camera[1]+travel[1],shot.camera[2]+travel[2]],t),look:[...shot.look],fov:shot.fov};
}
/** Place before actor children so billboard projection uses this frame's camera matrices. */
export const CameraRig=({state}:{state:CameraState})=>{
 const {camera}=useThree();camera.position.set(...state.camera);camera.lookAt(...state.look);
 (camera as THREE.PerspectiveCamera).fov=state.fov;camera.updateProjectionMatrix();camera.updateMatrixWorld();return null;
};
