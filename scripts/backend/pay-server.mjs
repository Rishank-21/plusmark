// Local page that runs a REAL Razorpay test-mode payment for an order you placed.
//   node scripts/backend/pay-server.mjs      then open  http://localhost:4010/?order=<order_id>&token=<guest_token>
// It calls the create-payment function, opens Razorpay Checkout, then calls verify-payment.
import { createServer } from "node:http";
import { LOCAL, refuseRemote } from "./_lib.mjs";

refuseRemote();
const page = `<!doctype html><meta charset="utf-8"><title>Razorpay test payment</title>
<body style="font-family:sans-serif;max-width:640px;margin:40px auto">
<h2>Razorpay test payment</h2><pre id="log">Starting...</pre>
<button id="retry" style="display:none">Try again</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
const P = new URLSearchParams(location.search);
const order_id = P.get('order'), guest_token = P.get('token');
const FN = ${JSON.stringify(LOCAL.url)} + '/functions/v1/';
const H = { 'Content-Type': 'application/json', apikey: ${JSON.stringify(LOCAL.anon)}, Authorization: 'Bearer ' + ${JSON.stringify(LOCAL.anon)} };
const log = (m) => { document.getElementById('log').textContent += '\\n' + (typeof m === 'string' ? m : JSON.stringify(m, null, 2)); };
async function call(name, body) { const r = await fetch(FN + name, { method: 'POST', headers: H, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; }
async function start() {
  document.getElementById('log').textContent = 'Creating payment...';
  const init = await call('create-payment', { order_id, guest_token });
  log(init);
  if (init.status !== 200) return;
  const c = init.body;
  const rzp = new Razorpay({
    key: c.key_id, amount: c.amount, currency: c.currency, name: c.name, description: c.description,
    order_id: c.razorpay_order_id, prefill: c.prefill,
    handler: async (resp) => {
      log('Razorpay says paid. Verifying on our server...');
      log(await call('verify-payment', { order_id, guest_token, ...resp }));
    },
    modal: { ondismiss: () => { log('Checkout closed'); document.getElementById('retry').style.display = 'block'; } },
  });
  rzp.on('payment.failed', (r) => log({ payment_failed: r.error.description }));
  rzp.open();
}
document.getElementById('retry').onclick = start;
start();
</script></body>`;
createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page);
}).listen(4010, () => console.log("Open http://localhost:4010/?order=<order_id>&token=<guest_token>"));
