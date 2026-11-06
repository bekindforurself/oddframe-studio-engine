import fs from 'node:fs';
/** Extracted installed-browser lookup; no downloads or launches on import. Node only. */
export function installedBrowser(){
 const executable=[process.env.ODDFRAME_BROWSER,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>p&&fs.existsSync(p));
 if(!executable)throw new Error('Set ODDFRAME_BROWSER to installed Chrome/Edge. No download attempted.');
 return executable;
}
/** Existing bounded browser shutdown, reusable by a future caller-owned render script. */
export async function closeBrowser(browser){
 let timer,closed=false;try{await Promise.race([browser.close({silent:true}).then(()=>{closed=true;}),new Promise(resolve=>{timer=setTimeout(resolve,15000);})]);}finally{clearTimeout(timer);}if(!closed)browser.disconnect();return closed;
}
export const chromiumOptions={gl:'angle'};
