// Small trusted-source test loader. No changes to runtime builds or film loaders.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();
function load(file){
  file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;
  const m={exports:{}};cache.set(file,m);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React}}).outputText;
  function req(id){if(!id.startsWith('.'))return require(id);const base=path.resolve(path.dirname(file),id),resolved=[base+'.ts',base+'.tsx',path.join(base,'index.ts')].find(fs.existsSync);if(!resolved)throw Error('Unresolved test import '+id);return load(resolved);}
  vm.runInThisContext('(function(require,module,exports){'+code+'\n})',{filename:file})(req,m,m.exports);return m.exports;
}
module.exports={load};
