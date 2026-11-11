const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {load}=require('./load-ts.cjs');
const contact=load(path.join(__dirname,'../v2_1/contact-v1.ts')),edit=load(path.join(__dirname,'../v2_1/editorial-v1.ts'));
const spec={frame:116,surface:[.42,1.385,-1.02],travel:.045,anticipation:18,down:6,hold:1,release:5,recovery:12,hoverHeight:.32,hoverX:.1,clearance:.002};
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);

test('surface press preserves Film03 motion at every frame and in reverse/shuffled order',()=>{
 const {ease}=load(path.join(__dirname,'../math.ts')),states=[];
 for(let f=0;f<250;f++){
  const age=f-spec.frame,approach=ease((age+24)/18),recovery=ease((age-6)/12),depression=.045*ease((age+6)/6)*(1-ease((age-1)/5));
  const state=contact.sampleSurfacePress(spec,f);near(state.depression,depression);near(state.lift,.32*(1-approach+recovery));near(state.tip[1],1.385-depression+state.lift+.002);states.push(state);
  assert(state.tip[1]-(1.385-state.depression)>=.0019999);assert(state.tip[1]-1.275587363740888>.0664);
 }
 for(let i=249;i>=0;i--)assert.deepEqual(contact.sampleSurfacePress(spec,i),states[i]);
 for(let i=0;i<250;i++){const f=i*137%250;assert.deepEqual(contact.sampleSurfacePress(spec,f),states[f]);}
 near(states[116].depression,.045);near(states[122].depression,0);assert(!states[134].active);assert(states[92].active);
 assert(states[100].tip[1]>states[110].tip[1]);assert(states[125].tip[1]>states[122].tip[1]);
 const other={...spec,frame:200,surface:[-4,3,7],travel:.12,hoverHeight:.6,clearance:.01};near(contact.sampleSurfacePress(other,200).tip[1],2.89);
});
test('surface press rejects invalid clocks, unsafe clearance and nonfinite dimensions',()=>{
 for(const patch of [{down:0},{hold:-1},{recovery:1.5},{travel:0},{surface:[0,NaN,0]},{clearance:0},{hoverHeight:-1},{frame:Infinity}])assert.throws(()=>contact.sampleSurfacePress({...spec,...patch},116));
 for(const f of [-1,1.5,NaN])assert.throws(()=>contact.sampleSurfacePress(spec,f));
});
test('actual lowest opaque outline maps to world surface under different bitmap sizes',()=>{
 for(const scale of [1,2,4]){
  const w=12*scale,h=18*scale,data=new Uint8ClampedArray(w*h*4);
  const y=14*scale;for(const x of [4*scale,5*scale,6*scale])data[(y*w+x)*4+3]=255;
  data[((h-1)*w+10*scale)*4+3]=15; // Low alpha must not pull the fingertip below its outline.
  const tip=contact.lowestOpaquePoint(data,w,h,16);near(tip.x,(10*scale+1)/2);near(tip.y,y+1);
  const world=[4,2,-1],u=.01/scale,center=contact.alignContactPlane(world,tip,w,h,u);
  near(center[0]+(tip.x-w/2)*u,world[0]);near(center[1]+(h/2-tip.y)*u,world[1]);near(center[2],world[2]);
 }
 assert.throws(()=>contact.lowestOpaquePoint(new Uint8Array(16),2,2));
 assert.throws(()=>contact.lowestOpaquePoint([],2,2));
 assert.throws(()=>contact.lowestOpaquePoint(new Uint8Array(16),2,2,255));
 assert.throws(()=>contact.alignContactPlane([0,1,0],{x:3,y:1},2,2,.1));
});
test('editing guard accepts readable beats and rejects missing empty-space holds or release',()=>{
 const beat={pressFrame:116,deleteFrame:144,button:[90,128],object:[128,176],reaction:[176,230]};
 assert(edit.validateDeletionBeat(beat));
 for(const patch of [{deleteFrame:132},{deleteFrame:170},{button:[90,120]},{reaction:[177,230]},{pressFrame:129}])assert.throws(()=>edit.validateDeletionBeat({...beat,...patch}));
 assert.throws(()=>edit.validateDeletionBeat(beat,{before:NaN}));
});
test('prop framing catches edge crops, behind-camera and near/far clipping',()=>{
 const camera={camera:[0,1,5],look:[0,1,0],fov:45};
 assert(edit.propFraming(camera,[-.3,.5,-.3],[.3,1.5,.3]).inside);
 assert(!edit.propFraming(camera,[-5,.5,0],[5,1.5,1]).inside);
 assert(!edit.propFraming(camera,[-.1,.9,6],[.1,1.1,7]).depthClear);
 assert(!edit.propFraming(camera,[-.01,.99,4.95],[.01,1.01,4.96]).inside);
 assert(!edit.propFraming(camera,[-.1,.9,-100],[.1,1.1,-90]).inside);
 assert.throws(()=>edit.propFraming({...camera,look:camera.camera},[0,0,0],[1,1,1]));
 assert.throws(()=>edit.propFraming(camera,[2,0,0],[1,1,1]));
});
test('approved Film03 data remains compatible without migrating its frozen implementation',t=>{
 const source=path.resolve(__dirname,'../../src/oddframe/film03-production');
 if(!fs.existsSync(source))return t.skip('Host film is intentionally excluded from engine-only publication');
 const ts=require('typescript'),originalTs=require.extensions['.ts'],originalTsx=require.extensions['.tsx'];
 const compile=(m,p)=>m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText,p);
 require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
 try{
  const film=require(path.join(source,'timeline.ts'));
  for(const p of film.PRESSES.slice(0,-1))for(let f=p-24;f<=p+18;f++){
   const a=film.pressAt(f),b=contact.sampleSurfacePress({...spec,frame:p},f);near(a.depression,b.depression);a.tip.forEach((v,i)=>near(v,b.tip[i]));
  }
  for(const [name,deleteFrame] of Object.entries(film.DELETIONS)){
   if(['worker','room'].includes(name))continue;
   const object=film.stateAt(deleteFrame).edit.shot,button=film.stateAt(object.start-1).edit.shot,reaction=film.stateAt(object.end).edit.shot;
   const pressFrame=film.PRESSES.filter(p=>p<object.start).at(-1);
   assert(edit.validateDeletionBeat({pressFrame,deleteFrame,button:[button.start,button.end],object:[object.start,object.end],reaction:[reaction.start,reaction.end]}));
  }
 }finally{if(originalTs)require.extensions['.ts']=originalTs;else delete require.extensions['.ts'];if(originalTsx)require.extensions['.tsx']=originalTsx;else delete require.extensions['.tsx'];}
});
