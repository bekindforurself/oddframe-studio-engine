import React from 'react';
import {CinematicLightRig} from '../v2/lighting';
/** Film02/review05 values. No new postprocessing, temporal buffers or mirrors. */
export const ATMOSPHERE_PRESETS={nightCity:{background:'#071122',fog:'#14283E',density:.0055},ordinaryNight:{background:'#071122',fog:'#14283E',density:0},prehistoric:{background:'#302E30',fog:'#302E30',density:.008}} as const;
export const ProductionAtmosphere=({hdr,preset='ordinaryNight'}:{hdr:string;preset?:keyof typeof ATMOSPHERE_PRESETS})=>{
  const p=ATMOSPHERE_PRESETS[preset];
  return <><color attach="background" args={[p.background]}/>{p.density>0&&<fogExp2 attach="fog" args={[p.fog,p.density]}/>}<CinematicLightRig hdr={hdr} night/></>;
};
