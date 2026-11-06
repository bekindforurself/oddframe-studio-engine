import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Human,ActorProps,Office,Contact,CinematicLighting,CameraRig,sampleCameraShot,buildHumanRig,sampleWalk,GroundedLegs,DepthFinish,SHORT_FORMAT,LOW_POWER_CANVAS,CAMERA_CLIP,WalkKey,CameraShot} from '../index';

/** Import-only usage example. Deliberately not added to the project's Root. */
export const futureShortSpec={id:'FutureShortExample',...SHORT_FORMAT,durationInFrames:180};
const route:WalkKey[]=[[0,1.0,.9],[120,1.4,.9],[180,1.4,.9]];
const shot:CameraShot={start:0,end:180,camera:[-3.2,3.25,8.3],look:[0,1.75,0],fov:43,travel:[0,0,-.08]};
const Scene=({frame}:{frame:number})=>{
 const walk=sampleWalk(route,frame),actor:ActorProps={id:'sleeper',frame,position:walk.root,emotion:'happy',pose:walk.moving?'walk':'idle'};
 actor.rig=buildHumanRig(actor);
 return <>
  <CameraRig state={sampleCameraShot(shot,frame)}/>
  <color attach="background" args={['#1B2D41']}/>
  <CinematicLighting/>
  <Office frame={frame} doorState={{door:-3,latch:0}}/>
  <Contact p={actor.position}/>
  {actor.rig.separateLegs&&<GroundedLegs actor={actor} feet={walk.feet}/>}
  <Human {...actor} renderOrder={4}/>
  <DepthFinish focusPositions={[actor.position]} shotSize="wide"/>
 </>;
};
export const FutureShort=()=>{
 const frame=useCurrentFrame();return <AbsoluteFill><ThreeCanvas {...SHORT_FORMAT} {...LOW_POWER_CANVAS} camera={{...CAMERA_CLIP,fov:43}} gl={{antialias:true,alpha:false,powerPreference:'low-power'}}><Scene frame={frame}/></ThreeCanvas></AbsoluteFill>;
};
