const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const {load}=require('./load-ts.cjs'),timing=load(path.join(__dirname,'../v2_1/timing.ts')),cameras=load(path.join(__dirname,'../v2_1/cameras.ts'));
const configPath=require('node:url').pathToFileURL(path.join(__dirname,'../production/config.mjs')).href;
const fixture=()=>({schemaVersion:1,status:'ready',id:'test-fixture',title:'Validation fixture',compositionId:'TestFixture',width:1080,height:1920,fps:30,frames:60,scenes:[{id:'a',start:0,end:30},{id:'b',start:30,end:60}],audioCues:[{id:'click',frame:29,bus:'sfx',durationFrames:1}],intentionalBlack:[[59,60]]});
test('half-open scene boundaries and invalid coverage',()=>{
 const c=fixture();timing.validateTimeline(c.scenes,60);assert.equal(timing.sceneAt(c.scenes,29).id,'a');assert.equal(timing.sceneAt(c.scenes,30).id,'b');assert.throws(()=>timing.sceneAt(c.scenes,60));assert.throws(()=>timing.validateTimeline([{id:'a',start:1,end:60}],60));assert.throws(()=>timing.validateTimeline([{id:'a',start:0,end:30},{id:'a',start:30,end:60}],60));
 assert.equal(timing.frameToSample(327),523200);assert.equal(timing.remapFrame(15,[10,20],[0,100]),50);assert.equal(timing.remapFrame(1,[10,20],[0,100]),0);assert.deepEqual(timing.activeCues([{id:'x',frame:10,durationFrames:2}],12),[]);
});
test('camera cuts and opt-in blend remain deterministic in reverse order',()=>{
 const a=cameras.makeShot('tracking',0,30,[0,2,5],[1,2,5],[0,1,0],[0,1,0]);
 const b={...cameras.makeShot('reveal',30,60,[4,3,6],[5,3,6],[1,1,0],[2,1,0]),blendFrames:8};
 const at=cameras.sampleShotSequence([a,b],30);assert.deepEqual(at,cameras.sampleShot(a,30));
 const forward=Array.from({length:60},(_,f)=>cameras.sampleShotSequence([a,b],f));
 for(let f=59;f>=0;f--)assert.deepEqual(cameras.sampleShotSequence([a,b],f),forward[f]);
 assert.deepEqual(cameras.sampleShotSequence([a,b],38),cameras.sampleShot(b,38));assert.throws(()=>cameras.sampleShotSequence([a,b],60));
});
test('render contracts, global scene ranges, human approval and input fingerprints',async()=>{
 const {validateProduction,renderPlan,fingerprint}=await import(configPath);const c=fixture();validateProduction(c);
 assert.throws(()=>renderPlan(c,{final:true}));assert.equal(renderPlan(c,{final:true,approved:true}).dpr,1);assert.equal(renderPlan(c).dpr,.5);assert.deepEqual(renderPlan(c,{scene:'b'}).frameRange,[30,59]);
 assert.throws(()=>renderPlan(c,{scene:'absent'}));assert.throws(()=>validateProduction({...c,status:'draft'}));assert.throws(()=>validateProduction({...c,scenes:[{id:'a',start:0,end:59}]}));assert.throws(()=>validateProduction({...c,audioCues:[{id:'bad',frame:60,bus:'sfx'}]}));
 assert.throws(()=>validateProduction({...c,scenes:[{id:'a',start:0,end:60,camera:'missing'}]}));assert.throws(()=>validateProduction({...c,timelineEvents:[{id:'late',frame:60}]}));
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'oddframe-fingerprint-'));try{const p=path.join(dir,'source.txt');fs.writeFileSync(p,'first');const a=fingerprint(c,[p]);fs.writeFileSync(p,'changed');assert.notEqual(fingerprint(c,[p]),a);}finally{fs.rmSync(dir,{recursive:true});}
});
