/** One-second technical fixture only; no narrative, production registration or Film03. */
import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {createFilmComponent} from '../templates/film-starter/Composition';
import {CameraRig,makeShot,sampleShotSequence,IllustratedActor,sampleLocomotion,cinematicPerformance} from '../v2_1';
const scenes=[{id:'a',start:0,end:15},{id:'b',start:15,end:30}];
const shots=[makeShot('tracking',0,15,[3,2.5,6],[2.9,2.5,6],[0,1.5,0],[0,1.5,0]),{...makeShot('dolly-in',15,30,[2.9,2.5,6],[2.7,2.5,5.8],[0,1.5,0],[.3,1.5,0]),blendFrames:3}];
function Sample({frame}:{frame:number}) {
  const walk=sampleLocomotion({start:0,end:29,points:[[0,0,0],[.4,0,0]]},frame);
  const actor=cinematicPerformance({id:'worker',frame,position:walk.root,pose:walk.moving?'walk':'idle',emotion:'confused'},walk.phase,walk.speed);
  return <><CameraRig state={sampleShotSequence(shots,frame)}/><color attach="background" args={['#15283A']}/><ambientLight intensity={1}/><directionalLight position={[3,6,4]} intensity={2}/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[20,20]}/><meshStandardMaterial color="#64707B" roughness={.9}/></mesh><IllustratedActor actor={actor} feet={walk.feet} moving={walk.moving} preset="nightCity"/></>;
}
const Fixture=createFilmComponent({frames:30,scenes},{a:clock=><Sample frame={clock.frame}/>,b:clock=><Sample frame={clock.frame}/>});
const Root=()=> <Composition id="Engine21TechnicalFixture" component={Fixture} durationInFrames={30} fps={30} width={1080} height={1920}/>;
registerRoot(Root);
