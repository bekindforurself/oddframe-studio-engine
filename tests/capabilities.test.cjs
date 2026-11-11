const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const crypto=require('node:crypto');
const api=()=>import(pathToFileURL(path.join(__dirname,'../production/capabilities.mjs')).href);
const clone=x=>JSON.parse(JSON.stringify(x));
const engineDirectory=path.resolve(__dirname,'..');
const projectDirectory=fs.existsSync(path.join(engineDirectory,'package.json'))?engineDirectory:path.dirname(engineDirectory);
function fixture(){
  const project=fs.mkdtempSync(path.join(os.tmpdir(),'oddframe-capabilities-')),root=path.join(project,'engine'),directory=path.join(project,'film');
  fs.mkdirSync(path.join(root,'capabilities/profiles'),{recursive:true});fs.mkdirSync(path.join(root,'templates/film-starter'),{recursive:true});fs.mkdirSync(directory);
  const write=(f,x)=>{fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,typeof x==='string'?x:JSON.stringify(x));};
  write(path.join(root,'version.json'),{engineVersion:'2.1.0'});
  write(path.join(project,'package.json'),{private:true});write(path.join(project,'package-lock.json'),{packages:{'node_modules/three':{version:'0.170.0'}}});
  write(path.join(root,'a.ts'),"export {b} from './b';\nexport const a=1;\n");write(path.join(root,'b.ts'),'export const b=2;\n');
  write(path.join(root,'fixture'),'Technical test evidence only');
  write(path.join(root,'templates/film-starter/Composition.tsx'),"export const factory=1;\n");
  const record=(id,v,requires={})=>({id,version:v,status:'approved',runtime:'browser',files:['a.ts'],exports:[{file:'a.ts',names:['a']}],requires,packages:{},constraints:[],origin:'fixture',tests:[],evidence:['fixture'],implementationSha256:Object.fromEntries(['a.ts','b.ts'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')])),approval:{reference:'test only',scope:'test only'}});
  const registry={schemaVersion:1,capabilities:[record('test.a','2.1.0')]};
  const profile={schemaVersion:1,id:'test-profile',version:'1.0.0',status:'approved',engine:'^2.1.0',approval:{reference:'test only'},capabilities:{'test.a':'^2.1.0'}};
  const save=()=>{write(path.join(root,'capabilities/registry.json'),registry);write(path.join(root,'capabilities/profiles/v1.json'),profile);};save();
  const configFile=path.join(directory,'production.json');write(configFile,{capabilities:{required:true,profile:'test-profile'}});
  return {project,root,directory,record,registry,profile,save,write,configFile,close:()=>fs.rmSync(project,{recursive:true,force:true})};
}
test('real registry, approved profile and existing baseline resolve without mutation',async()=>{
  const a=await api(),c=a.loadCatalog(),before=JSON.stringify(c);
  const result=a.selectProfile(c,'illustrated-vertical-lowpower',projectDirectory);
  assert.equal(result.selected.length,14);assert(result.selected.every(c=>c.status==='approved'));
  const baseline=a.selectProfile({...c,profiles:c.profiles.filter(p=>p.version==='1.0.0')},'illustrated-vertical-lowpower',projectDirectory);
  assert.equal(baseline.selected.length,11);assert.equal(result.profile.version,'1.1.0');
  assert.equal(JSON.stringify(c),before);
});
test('stable version grammar, caret zero-major boundaries and unsupported ranges',async()=>{
  const {satisfies}=await api();
  for(const [v,r,expected] of [['2.2.0','^2.1.0',true],['3.0.0','^2.1.0',false],['0.170.1','^0.170.0',true],['0.171.0','^0.170.0',false],['0.0.2','^0.0.1',false],['2.1.9','~2.1.0',true],['2.2.0','~2.1.0',false],['2.1.1','2.1.0',false]])assert.equal(satisfies(v,r),expected);
  assert.throws(()=>satisfies('2.1.0','latest'));assert.throws(()=>satisfies('2.1.0-beta','^2.1.0'));
});
test('registry rejects duplicates, missing implementations, missing dependencies and missing approval',async()=>{
  const a=await api(),f=fixture();try{
    for(const change of [r=>r.capabilities.push(clone(r.capabilities[0])),r=>r.capabilities[0].files=['missing.ts'],r=>r.capabilities[0].requires={'missing.capability':'1.0.0'},r=>delete r.capabilities[0].approval,r=>r.capabilities[0].files=['../package.json']]){
      const r=clone(f.registry);change(r);assert.throws(()=>a.validateRegistry(r,f.root));
    }
  }finally{f.close();}
});
test('resolver backtracks dependency conflicts and rejects cycles and non-approved candidates',async()=>{
  const a=await api(),f=fixture();try{
    const r={schemaVersion:1,capabilities:[f.record('test.a','2.2.0',{'test.b':'2.2.0'}),f.record('test.a','2.1.0',{'test.b':'2.1.0'}),f.record('test.b','2.2.0'),f.record('test.b','2.1.0')]};
    const p={...f.profile,capabilities:{'test.a':'^2.1.0','test.b':'2.1.0'}};
    assert.deepEqual(a.resolveCapabilities(r,p,f.root).map(c=>c.version),['2.1.0','2.1.0']);
    const cycle=clone(r);cycle.capabilities.forEach(c=>{c.requires={[c.id==='test.a'?'test.b':'test.a']:'^2.1.0'};});assert.throws(()=>a.resolveCapabilities(cycle,p,f.root),/cycle|conflict/);
    f.registry.capabilities[0].status='candidate';assert.throws(()=>a.resolveCapabilities(f.registry,f.profile,f.root),/No approved/);
  }finally{f.close();}
});
test('latest selection skips incompatible versions and experimental profiles',async()=>{
  const a=await api(),f=fixture();try{
    const newer=f.record('test.a','2.2.0');newer.packages={three:'^0.171.0'};f.registry.capabilities.push(newer);
    const bad={...f.profile,version:'2.0.0',engine:'^3.0.0'},candidate={...f.profile,version:'3.0.0',status:'candidate'};
    const result=a.selectProfile({registry:f.registry,profiles:[candidate,bad,f.profile]},f.profile.id,f.project,f.root);
    assert.equal(result.profile.version,'1.0.0');assert.equal(result.selected[0].version,'2.1.0');
  }finally{f.close();}
});
test('film initialization is non-overwriting, verifies transitive fingerprints and freezes versions',async()=>{
  const a=await api(),f=fixture();try{
    const opts={project:f.project,root:f.root};const lock=a.initializeFilm(f.configFile,opts);
    assert(Object.keys(lock.files).includes('engine/b.ts'));
    assert(a.verifyCapabilityLock(lock,{...opts,directory:f.directory}));
    assert.throws(()=>a.initializeFilm(f.configFile,opts),/preserved/);
    f.registry.capabilities.push(f.record('test.a','2.2.0'));f.save();assert(a.verifyCapabilityLock(lock,{...opts,directory:f.directory}));
    f.write(path.join(f.root,'b.ts'),'export const b=3;');assert.throws(()=>a.verifyCapabilityLock(lock,{...opts,directory:f.directory}),/fingerprint mismatch/);
  }finally{f.close();}
});
test('lock metadata, missing coverage, generated bindings and package tampering fail closed',async()=>{
  const a=await api();
  for(const mutate of [
    (f,l)=>{l.profile.version='9.0.0';},
    (f,l)=>{delete l.files['engine/b.ts'];},
    (f)=>f.write(path.join(f.directory,'capabilities.ts'),'export const bypass=1;'),
    (f)=>f.write(path.join(f.project,'package-lock.json'),{packages:{}})
  ]){const f=fixture();try{const lock=a.initializeFilm(f.configFile,{project:f.project,root:f.root});mutate(f,lock);assert.throws(()=>a.verifyCapabilityLock(lock,{project:f.project,root:f.root,directory:f.directory}));}finally{f.close();}}
});
test('required production fingerprint inputs are enforced; legacy contracts remain optional',async()=>{
  const a=await api(),f=fixture();try{
    const opts={project:f.project,root:f.root};const lock=a.initializeFilm(f.configFile,opts);
    assert.throws(()=>a.verifyFilm(f.configFile,opts),/fingerprintInputs/);
    const generated=['capabilities.lock.json','capabilities.ts','FilmFactory.tsx'].map(x=>'film/'+x);
    f.write(f.configFile,{capabilities:{required:true,profile:'test-profile'},fingerprintInputs:[...Object.keys(lock.files),...generated]});
    assert(a.verifyFilm(f.configFile,opts));
    f.write(f.configFile,{status:'ready'});assert(a.verifyFilm(f.configFile,opts));
  }finally{f.close();}
});
test('new-film import policy rejects direct engine and other-film bypasses, including dynamic imports',async()=>{
  const a=await api(),f=fixture();try{
    a.initializeFilm(f.configFile,{project:f.project,root:f.root});
    const source=path.join(f.directory,'Film.tsx');
    for(const code of ["export {a} from '../engine/a';","import('../engine/a');","const a=require('../engine/a');","import('../other-film/Actor');","import(variable);"]){
      f.write(source,code);assert.throws(()=>a.verifyFilmImports(f.configFile,{project:f.project,root:f.root}));
    }
    f.write(source,"import {a} from './capabilities';");assert(a.verifyFilmImports(f.configFile,{project:f.project,root:f.root}));
    f.write(source,"import {a} from '../engine/a';");
    f.write(f.configFile,{capabilities:{required:true,profile:'test-profile',importExceptions:[{specifier:'../engine/a',reason:'Fixture adapter needs existing shared source',evidence:'engine/a.ts'}]}});
    assert(a.verifyFilmImports(f.configFile,{project:f.project,root:f.root}));
  }finally{f.close();}
});
test('generated real browser bindings and factory type-check without rendering a film',async()=>{
  const a=await api(),ts=require('typescript'),project=projectDirectory;
  const parent=path.join(project,'out');fs.mkdirSync(parent,{recursive:true});
  const directory=fs.mkdtempSync(path.join(parent,'cumulative-typecheck-'));
  try{
    const {browser,factory}=a.createCapabilityLock({project,directory});
    fs.writeFileSync(path.join(directory,'capabilities.ts'),browser);fs.writeFileSync(path.join(directory,'FilmFactory.tsx'),factory);
    const cfg=ts.readConfigFile(path.join(project,'tsconfig.json'),ts.sys.readFile);
    const options=ts.parseJsonConfigFileContent(cfg.config,ts.sys,project).options;
    const program=ts.createProgram([path.join(directory,'capabilities.ts'),path.join(directory,'FilmFactory.tsx')],options);
    const errors=ts.getPreEmitDiagnostics(program);assert.equal(errors.length,0,ts.formatDiagnosticsWithColorAndContext(errors,{getCurrentDirectory:()=>project,getCanonicalFileName:f=>f,getNewLine:()=> '\n'}));
    assert(!browser.includes('production/render'));assert(!browser.includes('production/audio'));
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
test('real starter locks the approved Film03 technical helpers and readProduction enforces preflight without rendering',async()=>{
  const a=await api(),project=projectDirectory;
  fs.mkdirSync(path.join(project,'out'),{recursive:true});
  const directory=fs.mkdtempSync(path.join(project,'out/cumulative-contract-'));
  try{
    const configFile=path.join(directory,'production.json');
    const config=JSON.parse(fs.readFileSync(path.join(engineDirectory,'templates/film-starter/production.json')));
    Object.assign(config,{status:'ready',id:'technical-contract',title:'Technical contract test, not a film',compositionId:'UnregisteredTechnicalFixture',frames:30,scenes:[{id:'fixture',start:0,end:30}]});
    fs.writeFileSync(configFile,JSON.stringify(config));
    const lock=a.initializeFilm(configFile,{project});assert.equal(lock.capabilities.length,14);
    assert.equal(lock.profile.version,'1.1.0');
    for(const id of ['animation.surface-contact','camera.prop-editorial','production.audio-retiming'])assert(lock.capabilities.some(c=>c.id===id));
    config.fingerprintInputs=a.capabilityFingerprintInputs(configFile);fs.writeFileSync(configFile,JSON.stringify(config));
    const {readProduction}=await import(pathToFileURL(path.join(engineDirectory,'production/config.mjs')).href);
    assert.equal(readProduction(configFile).id,'technical-contract');
    config.fingerprintInputs=[];fs.writeFileSync(configFile,JSON.stringify(config));assert.throws(()=>readProduction(configFile),/fingerprintInputs/);
  }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
