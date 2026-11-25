const { chromium } = require('../apps/storefront/node_modules/playwright');
const base='https://plusmark-storefront.pages.dev';
async function run(){
  const browser=await chromium.launch();
  const ctx=await browser.newContext();
  const page=await ctx.newPage();
  let testKey=false;
  page.on('response',async r=>{
    if(r.url().includes('/functions/v1/payment-') && r.request().method()==='POST'){
      const j=await r.json().catch(()=>({}));
      testKey ||= /^rzp_test_/.test(j.client_data?.key_id ?? j.data?.client_data?.key_id);
      console.log('payment',r.url().split('/').pop(),r.status(),'test',testKey);
    }
  });
  try {
    await page.goto(base+'/product/checkout-test-crystal-clear-base-clipboard',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/only necessary/i}).click({timeout:4000}).catch(()=>{});
    const option=page.locator('.pm-vbtn').first();
    if(await option.count()) await option.click();
    if(process.argv.includes('--buy-now')){
      await page.getByRole('button',{name:'Buy now',exact:true}).click();
      await page.waitForURL('**/checkout');
      console.log('Buy now opened checkout');
    } else {
      await page.locator('[data-add-to-cart]:visible').first().click();
      await page.locator('.pm-added__box').waitFor();
      console.log('PDP cart add passed');
      await page.goto(base+'/checkout',{waitUntil:'domcontentloaded'});
    }
    await page.fill('#pm-co-email','plusmark-qa@example.com');
    await page.fill('#pm-co-mobile','9999999999');
    await page.locator('[data-step=contact] button[type=submit]').click();
    await page.fill('#pm-co-pin',process.argv.includes('--buy-now')?'382445':'382405');
    await page.fill('#pm-co-name','Plusmark QA');
    await page.fill('#pm-co-line','QA test order - do not dispatch');
    await page.fill('#pm-co-city','Ahmedabad');
    await page.fill('#pm-co-state','Gujarat');
    await page.locator('[data-step=address] button[type=submit]').click();
    await page.locator('input[name=shipping-option]').first().check();
    await page.locator('[data-checkout-continue=delivery]').click();
    console.log('delivery passed, providers',await page.locator('input[name=payment-method]').evaluateAll(xs=>xs.map(x=>x.value)));
    const online=page.locator('input[name=payment-method]:not([value=cod])').first();
    await online.check();
    await page.locator('[data-checkout-pay]').click();
    await page.frameLocator('iframe[src*="razorpay.com"]').first().locator('body').waitFor({timeout:40000});
    if(!testKey) throw Error('Test provider key could not be verified');
    console.log('Razorpay test checkout opened');
    const {drive}=await import('./e2e/rzp-drive.mjs');
    process.env.RZP_STEPS='test';
    await drive(page,async()=>{},ctx);
    await page.waitForURL(/order-confirmation/,{timeout:20000});
    const summary=await page.locator('main').innerText();
    console.log('CONFIRMED',await page.locator('main h1').innerText(),summary.match(/PM-[A-Z0-9-]+/i)?.[0] ?? '');
  } catch(e) {
    console.log('stopped',e.message.slice(0,230));
    console.log('alerts',await page.locator('[role=alert]:visible').allTextContents());
    process.exitCode=1;
  } finally { await browser.close(); }
}
run().catch(e=>{console.log(e.message);process.exitCode=1;});
