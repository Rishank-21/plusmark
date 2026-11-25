globalThis.process ??= {};
globalThis.process.env ??= {};
import { g as getCart, c as clearCart } from "./route_Bqhf63D-.mjs";
class StoreApiError extends Error {
  code;
  status;
  fields;
  details;
  requestId;
  /** Seconds from `Retry-After` (429, 503). */
  retryAfter;
  constructor(init) {
    super(init.message ?? init.code);
    this.name = "StoreApiError";
    this.code = init.code;
    this.status = init.status;
    this.fields = init.fields;
    this.details = init.details;
    this.requestId = init.requestId;
    this.retryAfter = init.retryAfter;
  }
  /** When to try again, for `rate_limited` (Req 21.6). */
  get retryAt() {
    return this.retryAfter == null ? void 0 : new Date(Date.now() + this.retryAfter * 1e3);
  }
  /** Safe to resend with the same Idempotency_Key. */
  get retryable() {
    return ["bot_check_unavailable", "provider_unavailable", "concurrency_conflict", "internal_error", "network_error", "timeout"].includes(this.code);
  }
}
const isRateLimited = (e) => e instanceof StoreApiError && e.code === "rate_limited";
function parseRetryAfter(value, now = Date.now()) {
  if (!value) return void 0;
  const n = Number(value);
  if (Number.isFinite(n) && n >= 0) return Math.ceil(n);
  const t = Date.parse(value);
  return Number.isNaN(t) ? void 0 : Math.max(0, Math.ceil((t - now) / 1e3));
}
const isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function toStoreError(status, body, headers) {
  const env = isObj(body) ? isObj(body.error) ? body.error : body : {};
  const fields = isObj(env.fields) ? env.fields : void 0;
  const requestId = headers.get("x-request-id") ?? (typeof env.request_id === "string" ? env.request_id : void 0) ?? (isObj(body) && typeof body.request_id === "string" ? body.request_id : void 0);
  const code = typeof env.code === "string" ? env.code : status === 429 ? "rate_limited" : status === 404 ? "not_found" : "internal_error";
  return new StoreApiError({
    code,
    status,
    message: typeof env.message === "string" ? env.message : void 0,
    fields,
    details: env.details,
    requestId,
    retryAfter: parseRetryAfter(headers.get("retry-after"))
  });
}
const __vite_import_meta_env__ = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_MEDIA_ORIGIN": "https://placehold.co", "PUBLIC_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_xlFRp85aCvi8vfvOW_mGrg_1f1Q6x68", "PUBLIC_SUPABASE_URL": "https://lkjxumiyesvufcxyaqcg.supabase.co", "PUBLIC_TURNSTILE_SITE_KEY": "1x00000000000000000000AA", "SITE": void 0, "SSR": true };
const GET_FUNCTIONS = /* @__PURE__ */ new Set([
  "store_list_products",
  "store_get_product",
  "store_live_data",
  "store_resolve_path",
  "store_catalog_export",
  "store_delivery_rules",
  "store_list_offers",
  "store_check_postal_code",
  "store_list_reviews",
  "store_preview",
  "store_list_collections",
  "store_list_categories",
  "store_search_products",
  "store_get_settings"
  // store_get_cart is VOLATILE in the database (PostgREST accepts only POST) and carries the Cart_Token: it is a POST.
]);
const AMOUNT_KEY = /(^|_)(price|amount|total|discount|tax)(s)?($|_)/i;
const ALLOWED_AMOUNT_KEY = "p_expected_total";
function assertNoAmounts(value, path = "args") {
  if (Array.isArray(value)) return value.forEach((v, i) => assertNoAmounts(v, `${path}[${i}]`));
  if (typeof value !== "object" || value === null) return;
  for (const [k, v] of Object.entries(value)) {
    if (k !== ALLOWED_AMOUNT_KEY && AMOUNT_KEY.test(k)) throw new Error(`Store_API request must not carry "${k}" (${path})`);
    assertNoAmounts(v, `${path}.${k}`);
  }
}
function assertPublicKey(key) {
  if (/^sb_secret_/.test(key)) throw new Error("The Store_API client must not use a service key");
  const part = key.split(".")[1];
  if (part) {
    try {
      const role = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/"))).role;
      if (role === "service_role") throw new Error("The Store_API client must not use a service key");
    } catch (e) {
      if (e instanceof Error && e.message.includes("service key")) throw e;
    }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function createStoreApi(opts = {}) {
  const env = Object.assign(__vite_import_meta_env__, { SUPABASE_URL: "http://127.0.0.1:54321", OS: "Windows_NT", PUBLIC: "C:\\Users\\Public", _: "C:/Program Files/nodejs/node.exe" }) ?? {};
  const base = (opts.url ?? env.PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const key = opts.key ?? env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!base || !key) throw new Error("PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY are required");
  assertPublicKey(key);
  const timeoutMs = opts.timeoutMs ?? 8e3;
  const retries = opts.retries ?? 2;
  const retryDelayMs = opts.retryDelayMs ?? 250;
  async function once(fn, args, get, idempotencyKey) {
    const doFetch = opts.fetch ?? globalThis.fetch;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const headers = {
      apikey: key,
      Authorization: `Bearer ${opts.getAccessToken?.() || key}`,
      Accept: "application/json",
      "Accept-Profile": "api"
    };
    let url = `${base}/rest/v1/rpc/${fn}`;
    const init = {
      method: get ? "GET" : "POST",
      headers,
      signal: ctrl.signal
    };
    if (get) {
      const q = new URLSearchParams();
      for (const [k, v] of Object.entries(args)) if (v !== void 0) q.set(k, typeof v === "string" ? v : JSON.stringify(v));
      const s = q.toString();
      if (s) url += `?${s}`;
    } else {
      headers["Content-Type"] = "application/json";
      headers["Content-Profile"] = "api";
      if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
      init.body = JSON.stringify(args);
    }
    let res;
    try {
      res = await doFetch(url, init);
    } catch (e) {
      throw new StoreApiError({
        code: ctrl.signal.aborted ? "timeout" : "network_error",
        status: 0,
        message: e instanceof Error ? e.message : void 0
      });
    } finally {
      clearTimeout(timer);
    }
    let body = null;
    const text = await res.text().catch(() => "");
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = null;
      }
    }
    const hasEnvelope = typeof body === "object" && body !== null && !Array.isArray(body) && "error" in body && body.error;
    if (!res.ok || hasEnvelope) throw toStoreError(res.ok ? 400 : res.status, body, res.headers);
    return body;
  }
  async function call(fn, args = {}, o = {}) {
    const get = GET_FUNCTIONS.has(fn);
    if (!get) assertNoAmounts(args);
    for (let attempt = 0; ; attempt++) {
      try {
        return await once(fn, args, get, o.idempotencyKey);
      } catch (e) {
        const transient = e instanceof StoreApiError && (e.code === "network_error" || e.code === "timeout" || [502, 503, 504].includes(e.status));
        if (!get || !transient || attempt >= retries) throw e;
        await sleep(retryDelayMs * 2 ** attempt);
      }
    }
  }
  async function cartCall(fn, args = {}, o = {}) {
    const cart = getCart();
    if (!cart) throw new StoreApiError({
      code: "not_found",
      status: 404,
      message: "No cart on this device"
    });
    try {
      return await call(fn, {
        ...args,
        p_cart_id: cart.id,
        p_cart_token: cart.token
      }, o);
    } catch (e) {
      if (e instanceof StoreApiError && e.code === "not_found") clearCart();
      throw e;
    }
  }
  const newIdempotencyKey = () => globalThis.crypto.randomUUID();
  function completeCart(idempotencyKey, expectedTotal) {
    return cartCall("store_complete_cart", {
      p_idempotency_key: idempotencyKey,
      p_expected_total: expectedTotal
    }, {
      idempotencyKey
    });
  }
  return {
    call,
    cartCall,
    newIdempotencyKey,
    completeCart
  };
}
export {
  GET_FUNCTIONS as G,
  StoreApiError as S,
  assertNoAmounts as a,
  createStoreApi as c,
  isRateLimited as i,
  parseRetryAfter as p,
  toStoreError as t
};
//# sourceMappingURL=client_DBsikFsU.mjs.map
