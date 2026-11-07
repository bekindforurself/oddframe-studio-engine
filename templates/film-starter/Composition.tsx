/** Unregistered factory, not a film or invented story. Import in a new film directory. */
import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {sceneAt,validateTimeline,type SceneInterval} from '../../v2_1/timing';
import {DrawingBufferProbe} from '../../v2_1/metrics';
export type FilmScene=SceneInterval&{camera?:string;environment?:string;characters?:string[]};
export type SceneRenderer=(clock:{frame:number;localFrame:number;scene:FilmScene})=>React.ReactNode;
export function createFilmComponent(spec:{frames:number;scenes:FilmScene[]},renderers:Record<string,SceneRenderer>) {
  validateTimeline(spec.scenes,spec.frames);
  for(const scene of spec.scenes)if(!renderers[scene.id])throw Error('Missing scene renderer '+scene.id);
  return function Film({qualityScale=1}:{qualityScale?:number}) {
    const frame=useCurrentFrame(),scene=sceneAt(spec.scenes,frame);
    if(![.5,1].includes(qualityScale))throw Error('Use validated preview .5 or native 1');
    return <AbsoluteFill style={{background:'#000'}}><ThreeCanvas width={1080} height={1920} dpr={qualityScale} shadows camera={{near:.08,far:300}} gl={{antialias:true,alpha:false,powerPreference:'low-power'}}>{renderers[scene.id]({frame,localFrame:frame-scene.start,scene})}<DrawingBufferProbe frame={frame} sampleFrames={spec.scenes.map(s=>s.start)}/></ThreeCanvas></AbsoluteFill>;
  };
}
