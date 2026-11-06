import React from 'react';
/** Values copied from the approved cinematic office/final-film light setups. */
export const CinematicLighting=({mode='night'}:{mode?:'night'|'day'})=>{
 const day=mode==='day';return <>
  <hemisphereLight args={[day?'#FFF1D2':'#D8E6ED',day?'#7F9F9C':'#263344',day?1.5:.9]}/>
  <directionalLight position={[-4,6,6]} color={day?'#FFE1A5':'#EAD6B6'} intensity={day?2:1.15}/>
  <directionalLight position={[-3,5,-4]} color="#99C7E8" intensity={day?.65:1.2}/>
  {!day&&<pointLight position={[-2.5,3.8,-2.8]} color="#9FCDEA" intensity={2} distance={6} decay={2}/>}
 </>;
};
