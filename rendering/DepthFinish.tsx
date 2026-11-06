import {useEffect,useMemo} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {V3} from '../math';

export const DepthFinish=({focusPositions,shotSize='wide'}:{focusPositions:V3[];shotSize?:'wide'|'medium'})=>{
 const r=useMemo(()=>{
  const depth=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthTexture:depth,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,
   uniforms:{colorMap:{value:target.texture},depthMap:{value:depth},texel:{value:new THREE.Vector2()},band:{value:new THREE.Vector2()},radius:{value:0}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
   fragmentShader:`uniform sampler2D colorMap,depthMap;uniform vec2 texel,band;uniform float radius;varying vec2 vUv;
    float depthAt(vec2 uv){float z=texture2D(depthMap,uv).x;return .1*80./(80.-z*(80.-.1));}
    void main(){float d=depthAt(vUv),blur=radius*smoothstep(0.,3.,max(band.x-d,d-band.y));vec3 sum=texture2D(colorMap,vUv).rgb;float weight=1.;
     if(blur>.15){for(int i=0;i<8;i++){float a=float(i)*.78539816;vec2 uv=vUv+vec2(cos(a),sin(a))*texel*blur;float ds=depthAt(uv);float w=1.-smoothstep(.22,max(.7,d*.05),abs(ds-d));sum+=texture2D(colorMap,uv).rgb*w;weight+=w;}}
     // Preserve the approved human artwork's existing output color transform.
     vec3 c=sum/weight;c=c*vec3(1.012,1.,.985)+vec3(.002,.0025,.0035);float peak=max(c.r,max(c.g,c.b));if(peak>.88)c*=(.88+.12*(1.-exp(-(peak-.88)/.12)))/peak;gl_FragColor=vec4(c,1.);
     #include <colorspace_fragment>
    }`});
  const scene=new THREE.Scene(),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);scene.add(quad);
  return {depth,target,material,scene,quad,camera:new THREE.OrthographicCamera(-1,1,1,-1,0,1),size:new THREE.Vector2()};
 },[]);
 useEffect(()=>()=>{r.target.dispose();r.depth.dispose();r.material.dispose();r.quad.geometry.dispose();},[r]);
 useFrame(({gl,scene,camera})=>{
  gl.getDrawingBufferSize(r.size);if(r.target.width!==r.size.x||r.target.height!==r.size.y)r.target.setSize(r.size.x,r.size.y);
  const depths=(focusPositions.length?focusPositions:[[0,0,0] as V3]).map(p=>-new THREE.Vector3(p[0],1.6,p[2]).applyMatrix4(camera.matrixWorldInverse).z);
  const u=r.material.uniforms;u.band.value.set(Math.min(...depths)-.7,Math.max(...depths)+.7);u.texel.value.set(1/r.size.x,1/r.size.y);
  u.radius.value=(shotSize==='wide'?2.4:4)*r.size.y/1920;
  const previous=gl.getRenderTarget(),tone=gl.toneMapping;gl.toneMapping=THREE.NoToneMapping;
  gl.setRenderTarget(r.target);gl.clear();gl.render(scene,camera);gl.setRenderTarget(previous);gl.clear();gl.render(r.scene,r.camera);gl.toneMapping=tone;
 },1);return null;
};
