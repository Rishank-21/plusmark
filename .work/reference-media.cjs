const fs = require('node:fs');
const ref = require('../../plusmark-ref/src/data/catalog.json');
const assets = require('../../plusmark-ref/src/lib/local-assets.ts');
const live = require('../src/data/live-catalog.json');
const rows = ref.products.map(p => ({
  handle: p.slug, specs: p.specs ?? [],
  images: require('../../plusmark-ref/media-audit.json').products.find(row => row.slug === p.slug).media,
  story: assets.aPlusPanelsFor(p.slug),
  seed: live.products[p.slug].images.filter(url => url.startsWith('https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/'))
}));
async function main(){
  const ids = [...new Set(rows.flatMap(p => [...p.images, ...p.story]))];
  const verified = new Set();
  await Promise.all(Array.from({length:12},async () => {
    while(ids.length){
      const id=ids.pop();
      const url='https://res.cloudinary.com/dtdooieec/image/upload/'+id;
      let r;
      for(let i=0;i<3;i++){
        try {r=await fetch(url,{method:'HEAD',signal:AbortSignal.timeout(20000)});} catch {}
        if(r?.ok || r?.status===404) break;
      }
      if(r?.ok && r.headers.get('content-type')?.startsWith('image/')) verified.add(id);
      else console.log('unverified',id,r?.status ?? 'network');
    }
  }));
  const output=rows.map(p=>({...p,images:p.images.filter(id=>verified.has(id)),story:p.story.filter(id=>verified.has(id))}));
  fs.writeFileSync('.work/ref-audited.json',JSON.stringify(output));
  console.log('products, verified media, galleries, story panels',output.length,verified.size,output.reduce((n,p)=>n+p.images.length,0),output.reduce((n,p)=>n+p.story.length,0));
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
