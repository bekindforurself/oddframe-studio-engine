/** Node-only capability catalog, deterministic resolution and immutable film locks. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const engineRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const stable=x=>JSON.stringify(x);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const slash=p=>p.split(path.sep).join('/');
function fail(message){throw Error('Capabilities: '+message);}
function inside(root,relative){
  if(typeof relative!=='string'||!relative||path.isAbsolute(relative))fail('Expected a relative path');
  const p=path.resolve(root,relative),r=path.relative(root,p);
  if(r==='..'||r.startsWith('..'+path.sep)||path.isAbsolute(r))fail('Path escapes root: '+relative);
  // Reject symlink escapes as well as lexical traversal.
  if(fs.existsSync(p)){const real=path.relative(fs.realpathSync(root),fs.realpathSync(p));if(real==='..'||real.startsWith('..'+path.sep))fail('Symlink escapes root');}
  return p;
}
function version(v){if(typeof v!=='string'||!/^\d+\.\d+\.\d+$/.test(v))fail('Unsupported version '+v);return v.split('.').map(Number);}
function compare(a,b){const aa=version(a),bb=version(b);return aa[0]-bb[0]||aa[1]-bb[1]||aa[2]-bb[2];}
/** Deliberately limited grammar: exact, ^ or ~ stable versions. Never guess ranges. */
export function satisfies(v,range){
  if(typeof range!=='string')fail('Missing version constraint');
  const op=/^[\^~]/.test(range)?range[0]:'',base=op?range.slice(1):range;
  const a=version(v),b=version(base);
  if(!op)return compare(v,base)===0;
  const upper=op==='~'?[b[0],b[1]+1,0]:b[0]?[b[0]+1,0,0]:b[1]?[0,b[1]+1,0]:[0,0,b[2]+1];
  return compare(v,base)>=0&&compare(v,upper.join('.'))<0;
}
const statuses=['experimental','candidate','approved','deprecated','blocked'];
export function validateRegistry(registry,root=engineRoot){
  if(registry.schemaVersion!==1||!Array.isArray(registry.capabilities)||!registry.capabilities.length)fail('Invalid registry');
  const keys=new Set();
  for(const c of registry.capabilities){
    if(!/^[a-z][a-z0-9.-]+$/.test(c.id)||!statuses.includes(c.status)||keys.has(c.id+'@'+c.version))fail('Duplicate/invalid capability');
    version(c.version);keys.add(c.id+'@'+c.version);
    if(!['browser','node','python'].includes(c.runtime)||!Array.isArray(c.files)||!c.files.length||!Array.isArray(c.constraints)||!c.origin||!Array.isArray(c.tests))fail('Incomplete record '+c.id);
    if(c.status==='approved'&&(!c.approval?.reference||!c.approval?.scope||!c.evidence?.length))fail('Approval evidence required: '+c.id);
    for(const f of c.files)if(!fs.statSync(inside(root,f)).isFile())fail('Missing implementation '+f);
    for(const [id,range] of Object.entries(c.requires??{})){satisfies('0.0.0',range);if(!registry.capabilities.some(x=>x.id===id&&satisfies(x.version,range)))fail('Missing dependency '+id);}
    for(const range of Object.values(c.packages??{}))satisfies('0.0.0',range);
    for(const f of [...(c.evidence??[]),...c.tests])if(!fs.existsSync(inside(root,f)))fail('Missing evidence/test '+f);
    for(const e of c.exports??[]){
      if(c.runtime!=='browser'||!c.files.includes(e.file)||![...(e.names??[]),...(e.types??[])].every(n=>/^[A-Za-z_$][\w$]*$/.test(n)))fail('Invalid browser export');
    }
    if(c.status==='approved'){
      const actual=Object.fromEntries(implementationFiles([c],root).map(f=>[f,hash(fs.readFileSync(inside(root,f)))]));
      if(stable(actual)!==stable(c.implementationSha256))fail('Approved implementation fingerprint mismatch: '+c.id);
    }
  }
  return registry;
}
/** Explicit maintenance helper: computes evidence bytes, never approves or writes. */
export function implementationFingerprint(capability,root=engineRoot){
  return Object.fromEntries(implementationFiles([capability],root).map(f=>[f,hash(fs.readFileSync(inside(root,f)))]));
}
function validateProfile(p){
  if(p.schemaVersion!==1||!p.id||p.status!=='approved'||!p.approval?.reference||!p.capabilities||!Object.keys(p.capabilities).length)fail('Approved profile required');
  version(p.version);satisfies('0.0.0',p.engine);
  for(const range of Object.values(p.capabilities))satisfies('0.0.0',range);
}
function acyclic(selected){
  const visiting=new Set(),done=new Set();
  function walk(id){if(visiting.has(id))fail('Dependency cycle at '+id);if(done.has(id))return;visiting.add(id);for(const dep of Object.keys(selected[id].requires??{}))walk(dep);visiting.delete(id);done.add(id);}
  Object.keys(selected).forEach(walk);
}
export function resolveCapabilities(registry,profile,root=engineRoot,accept=()=>true){
  validateRegistry(registry,root);validateProfile(profile);
  function solve(selected,requirements){
    for(const [id,c] of Object.entries(selected))if(!(requirements[id]??[]).every(r=>satisfies(c.version,r)))return null;
    const id=Object.keys(requirements).sort().find(k=>!selected[k]);
    if(!id){try{acyclic(selected);return selected;}catch{return null;}}
    const candidates=registry.capabilities.filter(c=>c.id===id&&c.status==='approved'&&accept(c)&&requirements[id].every(r=>satisfies(c.version,r))).sort((a,b)=>compare(b.version,a.version));
    for(const c of candidates){
      const next=Object.fromEntries(Object.entries(requirements).map(([k,v])=>[k,[...v]]));
      for(const [dep,range] of Object.entries(c.requires??{}))(next[dep]??=[]).push(range);
      const result=solve({...selected,[id]:c},next);if(result)return result;
    }
    return null;
  }
  const result=solve({},Object.fromEntries(Object.entries(profile.capabilities).map(([id,r])=>[id,[r]])));
  if(!result)fail('No approved compatible dependency solution (conflict or cycle)');
  return Object.values(result).sort((a,b)=>a.id.localeCompare(b.id));
}
export function loadCatalog(root=engineRoot){
  const registry=validateRegistry(json(path.join(root,'capabilities/registry.json')),root);
  const profiles=fs.readdirSync(path.join(root,'capabilities/profiles')).filter(f=>f.endsWith('.json')).map(f=>json(path.join(root,'capabilities/profiles',f)));
  for(const p of profiles){if(!statuses.includes(p.status))fail('Invalid profile status');version(p.version);if(p.status==='approved')validateProfile(p);}
  const keys=profiles.map(p=>p.id+'@'+p.version);if(new Set(keys).size!==keys.length)fail('Duplicate profile version');
  return {registry,profiles};
}
function compatible(selected,profile,project,root){
  if(!satisfies(json(path.join(root,'version.json')).engineVersion,profile.engine))fail('Incompatible engine version');
  const lock=json(path.join(project,'package-lock.json'));
  for(const c of selected)for(const [name,range] of Object.entries(c.packages??{})){
    const actual=lock.packages?.['node_modules/'+name]?.version;
    if(!actual||!satisfies(actual,range))fail('Incompatible package '+name+' for '+c.id);
  }
}
/** Latest approved profile that has an approved, compatible dependency solution. */
export function selectProfile(catalog,id,project,root=engineRoot){
  const options=catalog.profiles.filter(p=>p.id===id&&p.status==='approved').sort((a,b)=>compare(b.version,a.version));
  for(const profile of options){try{const selected=resolveCapabilities(catalog.registry,profile,root,c=>{try{compatible([c],profile,project,root);return true;}catch{return false;}});compatible(selected,profile,project,root);return {profile,selected};}catch{}}
  fail('No approved compatible profile '+id);
}
function relativeSource(root,file){
  const base=inside(root,file);
  for(const p of [base,base+'.ts',base+'.tsx',base+'.mjs',base+'.cjs',base+'.json',path.join(base,'index.ts'),path.join(base,'index.tsx')])if(fs.existsSync(p)&&fs.statSync(p).isFile())return p;
  fail('Unresolved local implementation dependency '+file);
}
/** Walk TypeScript relative imports/exports; non-TS dependencies are explicit files. */
function implementationFiles(selected,root){
  const seen=new Set();
  function visit(file){
    const full=relativeSource(root,file),rel=slash(path.relative(root,full));if(seen.has(rel))return;seen.add(rel);
    if(!/\.(ts|tsx|mjs|cjs)$/.test(full))return;
    const source=ts.createSourceFile(full,fs.readFileSync(full,'utf8'),ts.ScriptTarget.Latest,true);
    function inspect(node){
      if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier)){
        const spec=node.moduleSpecifier.text;if(spec.startsWith('.'))visit(slash(path.join(path.dirname(rel),spec)));
      }
      ts.forEachChild(node,inspect);
    }
    inspect(source);
  }
  for(const c of selected)for(const file of c.files)visit(file);
  return [...seen].sort();
}
function browserModule(selected,dir,root){
  const lines=['// Generated from capabilities.lock.json. Do not hand-edit or import Node/Python tools here.'];
  const names=new Set();
  for(const c of selected.filter(c=>c.runtime==='browser'))for(const e of c.exports??[]){
    let spec=slash(path.relative(dir,inside(root,e.file))).replace(/\.(ts|tsx)$/,'');if(!spec.startsWith('.'))spec='./'+spec;
    for(const n of [...(e.names??[]),...(e.types??[])]){if(names.has(n))fail('Duplicate export '+n);names.add(n);}
    if(e.names?.length)lines.push(`export {${e.names.join(',')}} from ${JSON.stringify(spec)};`);
    if(e.types?.length)lines.push(`export type {${e.types.join(',')}} from ${JSON.stringify(spec)};`);
  }
  return lines.join('\n')+'\n';
}
function factorySource(root){
  return fs.readFileSync(path.join(root,'templates/film-starter/Composition.tsx'),'utf8')
    .replace("from '../../v2_1/timing'","from './capabilities'")
    .replace("from '../../v2_1/metrics'","from './capabilities'");
}
const digestFiles=(files,project)=>Object.fromEntries([...new Set(files)].sort().map(file=>[file,hash(fs.readFileSync(inside(project,file)))]));
function lockFingerprint(lock){const {fingerprint,...body}=lock;return hash(stable(body));}
export function createCapabilityLock({project=process.cwd(),directory,profileId='illustrated-vertical-lowpower',root=engineRoot}){
  project=path.resolve(project);directory=path.resolve(directory);
  inside(project,slash(path.relative(project,directory)));
  const catalog=loadCatalog(root),{profile,selected}=selectProfile(catalog,profileId,project,root);
  const files=implementationFiles(selected,root).map(f=>slash(path.relative(project,path.join(root,f))));
  files.push('package.json','package-lock.json',slash(path.relative(project,path.join(root,'version.json'))),slash(path.relative(project,path.join(root,'templates/film-starter/Composition.tsx'))));
  const browser=browserModule(selected,directory,root),factory=factorySource(root);
  const lock={schemaVersion:1,profile,capabilities:selected,files:digestFiles(files,project),generated:{'capabilities.ts':hash(browser),'FilmFactory.tsx':hash(factory)}};
  lock.fingerprint=lockFingerprint(lock);
  return {lock,browser,factory};
}
export function verifyCapabilityLock(lock,{project=process.cwd(),directory,root=engineRoot}={}){
  if(lock.schemaVersion!==1||lock.fingerprint!==lockFingerprint(lock))fail('Lock fingerprint mismatch');
  const catalog=loadCatalog(root);
  // A newly published profile/version does not invalidate a frozen production.
  if(!catalog.profiles.some(p=>p.id===lock.profile.id&&p.version===lock.profile.version&&stable(p)===stable(lock.profile)))fail('Locked profile changed or missing');
  const pinned={...lock.profile,capabilities:Object.fromEntries(lock.capabilities.map(c=>[c.id,c.version]))};
  const resolved=resolveCapabilities(catalog.registry,pinned,root);
  if(stable(resolved)!==stable(lock.capabilities))fail('Locked capability metadata changed');
  compatible(resolved,lock.profile,project,root);
  const required=implementationFiles(resolved,root).map(f=>slash(path.relative(project,path.join(root,f))));
  required.push('package.json','package-lock.json',slash(path.relative(project,path.join(root,'version.json'))),slash(path.relative(project,path.join(root,'templates/film-starter/Composition.tsx'))));
  if(stable(Object.keys(lock.files).sort())!==stable([...new Set(required)].sort()))fail('Incomplete implementation fingerprint coverage');
  if(stable(digestFiles(required,project))!==stable(lock.files))fail('Implementation/package fingerprint mismatch');
  const expected={'capabilities.ts':hash(browserModule(resolved,directory,root)),'FilmFactory.tsx':hash(factorySource(root))};
  if(stable(expected)!==stable(lock.generated))fail('Generated bindings differ from locked profile');
  for(const [file,sha] of Object.entries(expected))if(hash(fs.readFileSync(inside(directory,file)))!==sha)fail('Generated binding changed: '+file);
  return true;
}
export function initializeFilm(configFile,{project=process.cwd(),root=engineRoot}={}){
  const config=json(configFile),dir=path.dirname(path.resolve(configFile));
  if(config.capabilities?.required!==true)fail('Starter must require capabilities');
  const generated=createCapabilityLock({project,directory:dir,profileId:config.capabilities.profile,root});
  const files={'capabilities.lock.json':JSON.stringify(generated.lock,null,2)+'\n','capabilities.ts':generated.browser,'FilmFactory.tsx':generated.factory};
  // Preflight every output before writing anything. No implicit upgrade/overwrite.
  for(const name of Object.keys(files))if(fs.existsSync(path.join(dir,name)))fail('Existing lock/bindings preserved; use a new revision');
  for(const [name,content] of Object.entries(files))fs.writeFileSync(path.join(dir,name),content,{flag:'wx'});
  return generated.lock;
}
/** New-film source policy; legacy film directories are never inspected or migrated. */
export function verifyFilmImports(configFile,{project=process.cwd(),root=engineRoot}={}){
  const config=json(configFile),dir=path.dirname(path.resolve(configFile));
  const exceptions=config.capabilities?.importExceptions??[];
  for(const e of exceptions){if(!e.specifier||!e.reason||!e.evidence||!fs.existsSync(inside(project,e.evidence)))fail('Import exception needs reason and evidence');}
  function inspectFile(file){
    if(path.basename(file)==='capabilities.ts'&&path.dirname(file)===dir)return; // Hash-verified generated bindings only.
    const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    function check(spec){
      if(!spec.startsWith('.')&&!path.isAbsolute(spec)){
        // Bare package imports cannot masquerade as a local engine module.
        if(spec.startsWith('engine/')||spec.startsWith('src/'))fail('Local import bypass: '+spec);
        return;
      }
      const target=path.resolve(path.dirname(file),spec),local=path.relative(dir,target);
      if(local!== '..'&&!local.startsWith('..'+path.sep)&&!path.isAbsolute(local))return;
      if(exceptions.some(e=>e.specifier===spec))return;
      fail('Import shared capabilities through ./capabilities; external local import requires documented exception: '+spec);
    }
    function visit(node){
      if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))check(node.moduleSpecifier.text);
      if(ts.isCallExpression(node)&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||ts.isIdentifier(node.expression)&&node.expression.text==='require')){
        const arg=node.arguments[0];if(!arg||!ts.isStringLiteral(arg))fail('Computed imports require explicit architectural review');check(arg.text);
      }
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
  function walk(folder){for(const e of fs.readdirSync(folder,{withFileTypes:true})){
    if(e.isSymbolicLink())fail('Symlink in film source tree');
    const file=path.join(folder,e.name);
    if(e.isDirectory()){if(!['node_modules','out','backups','.git'].includes(e.name))walk(file);}
    else if(/\.(ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(e.name))inspectFile(file);
  }}
  walk(dir);return true;
}
export function verifyFilm(configFile,{project=process.cwd(),root=engineRoot,requireInputs=true}={}){
  const config=json(configFile),dir=path.dirname(path.resolve(configFile));
  if(!config.capabilities)return true; // Legacy Film01/02 contracts are untouched.
  if(config.capabilities.required!==true)fail('Capabilities cannot be silently disabled');
  const lockFile=path.join(dir,'capabilities.lock.json'),lock=json(lockFile);
  if(config.capabilities.profile!==lock.profile.id)fail('Wrong locked profile');
  verifyCapabilityLock(lock,{project,directory:dir,root});
  verifyFilmImports(configFile,{project,root});
  if(requireInputs){
    const inputs=new Set((config.fingerprintInputs??[]).map(p=>path.resolve(project,p)));
    for(const f of [lockFile,...Object.keys(lock.generated).map(f=>path.join(dir,f)),...Object.keys(lock.files).map(f=>path.resolve(project,f))])if(!inputs.has(f))fail('Missing fingerprintInputs: '+slash(path.relative(project,f)));
  }
  return true;
}
export function capabilityFingerprintInputs(configFile){
  const dir=path.dirname(path.resolve(configFile)),lock=json(path.join(dir,'capabilities.lock.json'));
  return [...new Set([...Object.keys(lock.files),...['capabilities.lock.json',...Object.keys(lock.generated)].map(f=>slash(path.relative(process.cwd(),path.join(dir,f))))])].sort();
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const [command,...args]=process.argv.slice(2),arg=k=>args.find(a=>a.startsWith('--'+k+'='))?.slice(k.length+3);
    if(command==='catalog'){const c=loadCatalog();console.log(JSON.stringify({profiles:c.profiles.map(p=>p.id+'@'+p.version),capabilities:c.registry.capabilities.map(c=>c.id+'@'+c.version+':'+c.status)},null,2));}
    else if(command==='init'){if(!arg('config'))fail('--config required');const lock=initializeFilm(arg('config'));console.log('Locked '+lock.profile.id+'@'+lock.profile.version);console.log(JSON.stringify(capabilityFingerprintInputs(arg('config')),null,2));}
    else if(command==='verify'){if(!arg('config'))fail('--config required');verifyFilm(arg('config'));console.log('Capability lock and fingerprint inputs verified');}
    else fail('Use catalog | init --config=... | verify --config=...');
  }catch(e){console.error(e.message);process.exitCode=1;}
}
