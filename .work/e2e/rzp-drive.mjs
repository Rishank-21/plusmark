// Discovery/driver for Razorpay Checkout (test mode) inside the storefront page.
export async function drive(page, shot, ctx) {
  const frame = () => page.frames().find((f) => f.url().includes('api.razorpay.com/v1/checkout'));
  const dump = async (label) => {
    const f = frame();
    await shot('rzp-' + label);
    if (!f) { console.log('[rzp]', label, 'no frame'); return; }
    const txt = await f.locator('body').innerText().catch(() => '');
    console.log('[rzp]', label, 'TEXT:', txt.replace(/\s+/g, ' ').slice(0, 700));
    const inputs = await f.locator('input:visible, button:visible, [role=button]:visible').evaluateAll((els) => els.slice(0, 40).map((e) => `${e.tagName}${e.name ? '[name=' + e.name + ']' : ''}${e.type ? '[' + e.type + ']' : ''}${e.getAttribute('data-testid') ? '{' + e.getAttribute('data-testid') + '}' : ''} ${(e.getAttribute('aria-label') || e.textContent || e.placeholder || '').trim().slice(0, 40)}`)).catch(() => []);
    console.log('[rzp]', label, 'CONTROLS:', JSON.stringify(inputs));
  };
  const step = process.env.RZP_STEPS ?? '';
  await dump('open');
  const f = frame();
  if (!f || !step) return;
  // Card flow
  const click = async (sel) => { await f.locator(sel).first().click({ timeout: 10000 }); await page.waitForTimeout(1500); };
  try {
    await page.waitForTimeout(3000); await f.locator('input[name=contact]').click(); await f.locator('input[name=contact]').pressSequentially('8123456780', { delay: 120 }); console.log('[rzp] val', await f.locator('input[name=contact]').inputValue()); await f.locator('input[name=contact]').press('Tab'); await page.waitForTimeout(500); await f.locator('input[name=contact]').press('Enter', { timeout: 5000 }).catch(()=>{}); await page.waitForTimeout(1000); if (await f.locator('button[name=button]').count()) await f.locator('button[name=button]').first().click({ timeout: 3000 }).catch(()=>{}); await page.waitForTimeout(3000); await dump('contact');
    await f.locator('[data-testid=card]').first().click({ timeout: 8000 }).catch(() => {}); await page.waitForTimeout(1500);
    await f.getByText(/^Cards?$/i).first().click({ timeout: 8000 }).catch(async () => f.getByText(/card/i).first().click({ timeout: 8000 }));
    await page.waitForTimeout(2000);
    await dump('card');
    await f.locator('input[name="card.number"], input[autocomplete="cc-number"], input[placeholder*="Card" i]').first().fill('4111 1111 1111 1111');
    await f.locator('input[name="card.expiry"], input[autocomplete="cc-exp"], input[placeholder*="MM" i]').first().fill('12 / 30');
    await f.locator('input[name="card.cvv"], input[autocomplete="cc-csc"], input[placeholder*="CVV" i]').first().fill('123');
    const name = f.locator('input[name="card.name"], input[autocomplete="cc-name"]');
    if (await name.count()) await name.first().fill('E2E Guest');
    await page.waitForTimeout(1500); if (await f.locator('input[name="card.name"]').count()) await f.locator('input[name="card.name"]').fill('E2E Guest');
    if (await f.locator('input[name=email]:visible').count()) await f.locator('input[name=email]').fill('delivered@resend.dev');
    await page.waitForTimeout(800);
    await dump('card-filled');
    await click('button:has-text("Pay"), button:has-text("Continue"), button[type=submit]');
    await page.waitForTimeout(4000);
    await dump('after-pay');
    // Possible "save card"/"maybe later" prompt
    const later = f.getByText(/maybe later|skip/i);
    if (await later.count()) { await later.first().click(); await page.waitForTimeout(3000); await dump('after-later'); }
    // Bank simulator popup or in-frame
    for (const p of ctx.pages()) console.log('[rzp] page', p.url().slice(0, 120));
    const popup = ctx.pages().find((p) => p !== page);
    if (popup) {
      await popup.waitForLoadState('domcontentloaded').catch(() => {});
      await popup.screenshot({ path: 'c:/Users/palha/plusmark/.work/e2e/rzp-popup.png' }).catch(() => {});
      console.log('[rzp] popup TEXT', (await popup.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500));
      const ok = popup.getByRole('button', { name: /success/i });
      await ok.first().waitFor({ timeout: 45000 }).catch(() => {});
      console.log('[rzp] popup2', popup.url().slice(0, 100), (await popup.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 300));
      if (await ok.count()) { await ok.first().click(); console.log('[rzp] clicked Success'); }
    } else {
      const ok = f.getByRole('button', { name: /success/i });
      if (await ok.count()) { await ok.first().click(); console.log('[rzp] clicked Success (frame)'); }
    }
    await page.waitForTimeout(12000);
    await dump('end');
  } catch (e) {
    console.log('[rzp] error', String(e).slice(0, 400));
    await dump('error');
  }
}








