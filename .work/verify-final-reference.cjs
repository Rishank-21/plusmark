const {chromium}=require('../apps/storefront/node_modules/playwright');
const {strict:assert}=require('node:assert');
const base='https://plusmark-storefront.pages.dev';
async function main(){
 const b=await chromium.launch();
 try {
  const p=await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(base+'/shop');
  await p.locator('[data-plp-title]').waitFor();
  console.log('Shop',await p.locator('[data-plp-count]').innerText());
  await p.goto(base+'/product/key-hanger-board');
  const specs=p.locator('details[data-block=specifications]');
  if(await specs.count() && !(await specs.getAttribute('open')!==null)) await specs.locator('summary').click();
  for(const capacity of ['15 / 20 Keys','30 Keys','50 Keys','100 Keys','150 Keys']) {
    assert(await p.getByText(capacity,{exact:true}).last().isVisible(),capacity);
  }
  console.log('All five key capacities visible');
  await p.goto(base+'/product/metallic-premium-white-board');
  await p.getByRole('button',{name:/only necessary/i}).click({timeout:2000}).catch(()=>{});
  assert.equal(await p.locator('[data-gallery-thumb]').count(),7);
  await p.locator('[data-gallery-thumb="1"]').click();
  await p.locator('[data-gallery-thumb="1"][aria-current=true]').waitFor();
  console.log('Gallery and story panels',await p.locator('.pm-story img').count());
  await p.getByRole('button',{name:'Buy now',exact:true}).click();
  await p.locator('.pm-buybox__missing:visible').waitFor();
  await p.locator('.pm-vbtn').first().click();
  await p.getByRole('button',{name:'Buy now',exact:true}).click();
  await p.waitForURL('**/checkout');
  await p.locator('#pm-co-email').waitFor();
  console.log('Size validation, Buy now, checkout contact verified');
 } finally { await b.close(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
