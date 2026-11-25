const fs = require('node:fs');
const path = require('node:path');
const native = fs.promises.mkdir.bind(fs.promises);
fs.promises.mkdir = async function(dir, options) {
  for(let i=0;;i++) {
    try {return await native(dir,options);} catch(e){
      if(e.code!=='EPERM'||i>=5||typeof dir!=='string'||!path.resolve(dir).startsWith(process.cwd()+path.sep)) throw e;
      await new Promise(resolve=>setTimeout(resolve,100*(i+1)));
    }
  }
};
