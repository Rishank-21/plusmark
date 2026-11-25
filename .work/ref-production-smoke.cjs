const { chromium }=require('../apps/storefront/node_modules/playwright');
const fs=require('fs');
const base='https://plusmark-storefront.pages.dev';
async function main() {
  const browser=await chromium.launch();
  let failures=0;
  try {
    for(const width of [1440,390]) {
      const page=await browser.newPage({viewport:{width,height:880}});
      for(const path of ['/','/shop','/shop/white-boards','/hi/shop','/product/metallic-premium-white-board','/cart','/checkout','/sign-in','/track-order','/contact']) {
        const response=await page.goto(base+path,{waitUntil:'domcontentloaded'});
        await page.locator('main').first().waitFor();
        const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,title:document.querySelector('h1')?.textContent?.trim()}));
        if(response.status()!==200 || result.overflow) failures++;
        console.log(width,path,response.status(),result.overflow?'OVERFLOW':'fits',result.title);
        if(path==='/shop') console.log('listing',await page.locator('[data-plp-count]').innerText());
        if(path.startsWith('/product/')){
          await page.locator('.pm-purchase-panel').waitFor();
          await page.getByRole('button',{name:/only necessary/i}).click({timeout:1500}).catch(()=>{});
          console.log('purchase columns',await page.locator('.pm-pdp__top').evaluate(e=>getComputedStyle(e).gridTemplateColumns));
          await page.screenshot({path:'.work/reference-pdp-'+width+'.png'});
        }
      }
      await page.close();
    }
    const ref=require('../../plusmark-ref/src/data/catalog.json');
    const missing=[];
    for(let i=0;i<ref.products.length;i+=8) await Promise.all(ref.products.slice(i,i+8).map(async p=>{
      const res=await fetch(base+'/product/'+p.slug);
      const html=await res.text();
      if(!res.ok || !html.includes('data-handle="'+p.slug+'"')) missing.push(p.slug);
    }));
    console.log('Reference product pages',ref.products.length-missing.length,'/',ref.products.length,'missing',missing.join(','));
    if(missing.length||failures) process.exitCode=1;
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
