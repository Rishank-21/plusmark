globalThis.process ??= {};
globalThis.process.env ??= {};
import { S as StoreApiError, c as createStoreApi } from "./client_DBsikFsU.mjs";
import { a as getJson, g as getCart, b as catalogMeta, d as getItem, s as setCart, c as clearCart, e as deliveryRules, n as notifyCartChanged } from "./route_Bqhf63D-.mjs";
let listenerQueue = [];
let lqIndex = 0;
const QUEUE_ITEMS_PER_LISTENER = 4;
const nanostoresGlobal = globalThis.nanostoresGlobal ||= { epoch: 0 };
let drainQueue = () => {
  let thrown;
  let i;
  while (lqIndex < listenerQueue.length) {
    i = lqIndex;
    lqIndex += QUEUE_ITEMS_PER_LISTENER;
    try {
      listenerQueue[i](
        listenerQueue[i + 1].value,
        listenerQueue[i + 2],
        listenerQueue[i + 3]
      );
    } catch (e) {
      thrown = e;
    }
  }
  listenerQueue.length = lqIndex = 0;
  if (thrown) throw thrown;
};
const atom = /* @__NO_SIDE_EFFECTS__ */ (initialValue) => {
  let listeners = [];
  let $atom = {
    eq: Object.is,
    get() {
      if (!$atom.lc) {
        $atom.listen(() => {
        })();
      }
      return $atom.value;
    },
    init: initialValue,
    lc: 0,
    listen(listener) {
      $atom.lc = listeners.push(listener);
      return () => {
        for (let i = lqIndex; i < listenerQueue.length; ) {
          if (listenerQueue[i] === listener && listenerQueue[i + 1] === $atom) {
            listenerQueue.splice(i, QUEUE_ITEMS_PER_LISTENER);
          } else {
            i += QUEUE_ITEMS_PER_LISTENER;
          }
        }
        let index = listeners.indexOf(listener);
        if (~index) {
          listeners.splice(index, 1);
          if (!--$atom.lc) $atom.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      nanostoresGlobal.epoch++;
      let runListenerQueue = !listenerQueue.length && true;
      for (let listener of listeners) {
        listenerQueue.push(
          listener,
          $atom,
          oldValue,
          changedKey
        );
      }
      if (runListenerQueue) {
        drainQueue();
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom.value;
      if (!$atom.eq(oldValue, newValue)) {
        $atom.value = newValue;
        $atom.notify(oldValue);
      }
    },
    subscribe(listener) {
      let unbind = $atom.listen(listener);
      listener($atom.value);
      return unbind;
    },
    value: initialValue
  };
  return $atom;
};
function getSession() {
  const s = getJson("sf.auth");
  return s && typeof s.access_token === "string" && typeof s.refresh_token === "string" ? s : null;
}
function currentAccessToken(now = Date.now()) {
  const s = getSession();
  return s && s.expires_at * 1e3 - now > 6e4 ? s.access_token : null;
}
const obj = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : {};
const num = (v) => typeof v === "number" && Number.isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
const text = (v) => typeof v === "string" ? v : "";
const QTY_DELAY_MS = 400;
const UNDO_MS = 1e4;
const emptyTotals = {
  subtotal: 0,
  discount: 0,
  shipping: null,
  tax: 0,
  total: 0,
  itemTotal: 0
};
const threshold = num(deliveryRules.free_delivery_threshold);
const $cart = /* @__PURE__ */ atom({
  status: "idle",
  lines: [],
  totals: emptyTotals,
  currency: "INR",
  codes: [],
  error: "",
  notice: null,
  undo: null,
  freeDeliveryThreshold: threshold,
  preview: null,
  busy: false
});
const set = (patch) => $cart.set({
  ...$cart.get(),
  ...patch
});
let apiInstance = null;
const api = () => apiInstance ??= createStoreApi({
  getAccessToken: () => currentAccessToken()
});
const codeOf = (e) => e instanceof StoreApiError ? e.code : "internal_error";
function mapView(view, previous) {
  const v = obj(view);
  const lines = (Array.isArray(v.items) ? v.items : []).map((raw) => {
    const i = obj(raw);
    const id = text(i.id);
    const qty = num(i.quantity) ?? 0;
    const unitPrice = num(i.unit_price) ?? 0;
    const was = previous?.[id];
    return {
      id,
      qty,
      unitPrice,
      productId: text(i.product_id),
      variantId: text(i.variant_id),
      title: text(i.product_title) || text(i.title),
      variantTitle: text(i.variant_title),
      handle: text(i.product_handle),
      thumbnail: text(i.thumbnail) || null,
      compareAt: num(i.compare_at_unit_price),
      total: num(i.total) ?? unitPrice * qty,
      changed: !!was && (was.price !== unitPrice || was.qty !== qty),
      unavailable: false
    };
  });
  const shippingMethods = Array.isArray(v.shipping_methods) ? v.shipping_methods : [];
  return {
    lines,
    currency: (text(v.currency_code) || "inr").toUpperCase(),
    totals: {
      subtotal: num(v.original_item_total) ?? num(v.item_total) ?? 0,
      discount: num(v.discount_total) ?? 0,
      shipping: shippingMethods.length ? num(v.shipping_total) ?? 0 : null,
      tax: num(v.tax_total) ?? 0,
      total: num(v.total) ?? 0,
      itemTotal: num(v.item_total) ?? 0
    }
  };
}
function snapshots(lines) {
  return Object.fromEntries(lines.map((l) => [l.id, {
    price: l.unitPrice,
    qty: l.qty,
    available: !l.unavailable,
    variantId: l.variantId,
    productId: l.productId,
    title: l.title,
    variantTitle: l.variantTitle,
    handle: l.handle,
    thumbnail: l.thumbnail
  }]));
}
function persist(lines) {
  const c = getCart();
  if (!c) return;
  setCart({
    ...c,
    lines: snapshots(lines)
  });
  notifyCartChanged();
}
function markUnavailable(lines, live) {
  const products = Array.isArray(obj(live).products) ? obj(live).products.map(obj) : [];
  return lines.map((l) => {
    const p = products.find((x) => x.id === l.productId);
    if (!p) return l;
    const variant = (Array.isArray(p.variants) ? p.variants : []).map(obj).find((x) => x.id === l.variantId);
    const gone = p.available === false || variant !== void 0 && (variant.available === false || variant.sellable === false || variant.in_stock === false);
    return gone ? {
      ...l,
      unavailable: true
    } : l;
  });
}
function apply(view, opts = {}) {
  const stored = getCart();
  const mapped = mapView(view, opts.compare ? stored?.lines ?? null : null);
  const prev = $cart.get().lines;
  const lines = markUnavailable(mapped.lines, opts.live).map((l) => opts.live === void 0 && prev.find((p) => p.id === l.id)?.unavailable ? {
    ...l,
    unavailable: true
  } : l);
  set({
    status: "ready",
    lines,
    totals: mapped.totals,
    currency: mapped.currency,
    error: ""
  });
  persist(lines);
}
async function regionId() {
  const known = text(catalogMeta.region_id) || text(deliveryRules.region_id);
  if (known) return known;
  try {
    return text(obj(await api().call("store_delivery_rules")).region_id) || null;
  } catch {
    return null;
  }
}
async function transferIfSignedIn() {
  const stored = getCart();
  if (!stored || !stored.token || !getSession() || !currentAccessToken()) return false;
  try {
    const r = obj(await api().call("store_cart_transfer", {
      p_cart_id: stored.id,
      p_cart_token: stored.token
    }));
    const cart = obj(r.cart);
    if (!text(cart.id)) return false;
    setCart({
      id: text(cart.id),
      token: ""
    });
    apply(cart);
    if (Array.isArray(r.not_merged) && r.not_merged.length) set({
      notice: {
        key: "notMerged"
      }
    });
    return true;
  } catch (e) {
    if (e instanceof StoreApiError && e.code === "not_found") clearCart();
    return false;
  }
}
async function ensureCart() {
  await transferIfSignedIn();
  if (getCart()) return;
  const region = await regionId();
  if (!region) throw new StoreApiError({
    code: "validation_failed",
    status: 400,
    message: "No region"
  });
  const r = obj(await api().call("store_create_cart", {
    p_region_id: region
  }));
  const cart = obj(r.cart);
  if (!text(cart.id)) throw new StoreApiError({
    code: "internal_error",
    status: 500
  });
  setCart({
    id: text(cart.id),
    token: text(r.cart_token)
  });
}
function fail(e) {
  const code = codeOf(e);
  set({
    error: code,
    busy: false
  });
}
async function run(fn) {
  set({
    busy: true,
    error: ""
  });
  try {
    apply(obj(await fn()).cart);
    set({
      busy: false
    });
    return true;
  } catch (e) {
    fail(e);
    return false;
  }
}
const cartArgs = () => ({});
async function loadCart() {
  const stored = getCart();
  if (!stored) {
    set({
      status: "ready",
      lines: [],
      totals: emptyTotals
    });
    return;
  }
  if ($cart.get().status === "idle" && stored.lines) {
    const lines = Object.entries(stored.lines).map(([id, s]) => ({
      id,
      qty: s.qty ?? 0,
      unitPrice: s.price ?? 0,
      productId: s.productId ?? "",
      variantId: s.variantId ?? "",
      title: s.title ?? "",
      variantTitle: s.variantTitle ?? "",
      handle: s.handle ?? "",
      thumbnail: s.thumbnail ?? null,
      compareAt: null,
      total: (s.price ?? 0) * (s.qty ?? 0),
      changed: false,
      unavailable: s.available === false
    }));
    set({
      status: "loading",
      lines
    });
  } else set({
    status: "loading"
  });
  await transferIfSignedIn();
  try {
    const view = obj(await api().cartCall("store_get_cart", cartArgs())).cart;
    const ids = [...new Set(mapView(view, null).lines.map((l) => l.productId).filter(Boolean))];
    let live;
    if (ids.length) {
      try {
        live = await api().call("store_live_data", {
          p_product_ids: `{${ids.map((i) => `"${i}"`).join(",")}}`,
          p_region_id: text(catalogMeta.region_id) || void 0
        });
      } catch {
        live = void 0;
      }
    }
    apply(view, {
      compare: true,
      live
    });
  } catch (e) {
    if (getCart() === null) set({
      status: "ready",
      lines: [],
      totals: emptyTotals
    });
    else set({
      status: "error",
      error: codeOf(e)
    });
  }
}
async function addItem(productId, variantId, qty = 1) {
  set({
    busy: true,
    error: "",
    notice: null
  });
  try {
    await ensureCart();
    const ok = await run(() => api().cartCall("store_cart_add_item", {
      p_variant_id: variantId,
      p_quantity: qty
    }));
    if (ok) set({
      notice: {
        key: "added"
      }
    });
    void productId;
    return ok;
  } catch (e) {
    fail(e);
    return false;
  }
}
const qtyTimers = /* @__PURE__ */ new Map();
function setQty(lineId, qty) {
  const s = $cart.get();
  if (qty < 1) return void removeLine(lineId);
  const lines = s.lines.map((l) => l.id === lineId ? {
    ...l,
    qty,
    total: l.unitPrice * qty
  } : l);
  set({
    lines
  });
  clearTimeout(qtyTimers.get(lineId));
  qtyTimers.set(lineId, setTimeout(() => {
    qtyTimers.delete(lineId);
    const q = $cart.get().lines.find((l) => l.id === lineId)?.qty ?? qty;
    void run(() => api().cartCall("store_cart_update_item", {
      p_line_item_id: lineId,
      p_quantity: q
    })).then((ok) => {
      if (!ok) void loadCart();
    });
  }, QTY_DELAY_MS));
}
let undoTimer;
async function removeLine(lineId) {
  const line = $cart.get().lines.find((l) => l.id === lineId);
  if (!line) return;
  clearTimeout(qtyTimers.get(lineId));
  qtyTimers.delete(lineId);
  set({
    lines: $cart.get().lines.filter((l) => l.id !== lineId)
  });
  const ok = await run(() => api().cartCall("store_cart_remove_item", {
    p_line_item_id: lineId
  }));
  if (!ok) return void loadCart();
  clearTimeout(undoTimer);
  set({
    undo: {
      title: line.title,
      productId: line.productId,
      variantId: line.variantId,
      qty: line.qty
    }
  });
  undoTimer = setTimeout(() => set({
    undo: null
  }), UNDO_MS);
}
async function undoRemove() {
  const u = $cart.get().undo;
  if (!u) return;
  clearTimeout(undoTimer);
  set({
    undo: null
  });
  await addItem(u.productId, u.variantId, u.qty);
}
async function applyCode(code) {
  const c = code.trim();
  if (!c) return false;
  const ok = await run(() => api().cartCall("store_cart_apply_code", {
    p_code: c
  }));
  if (ok) set({
    codes: [.../* @__PURE__ */ new Set([...$cart.get().codes, c.toUpperCase()])],
    notice: {
      key: "promoApplied",
      params: {
        code: c.toUpperCase()
      }
    }
  });
  return ok;
}
async function removeCode(code) {
  const ok = await run(() => api().cartCall("store_cart_remove_code", {
    p_code: code
  }));
  if (ok) set({
    codes: $cart.get().codes.filter((x) => x !== code)
  });
}
async function moveToWishlist(lineId) {
  const line = $cart.get().lines.find((l) => l.id === lineId);
  if (!line) return;
  if (!currentAccessToken()) return set({
    notice: {
      key: "signInWishlist"
    }
  });
  try {
    await api().call("store_add_to_wishlist", {
      p_product_id: line.productId,
      p_variant_id: line.variantId
    });
  } catch (e) {
    return fail(e);
  }
  const ok = await run(() => api().cartCall("store_cart_remove_item", {
    p_line_item_id: lineId
  }));
  if (ok) set({
    notice: {
      key: "movedToWishlist",
      params: {
        title: line.title
      }
    }
  });
}
function rememberedPin() {
  const raw = getJson("sf.pin");
  const v = typeof raw === "string" ? raw : obj(raw).pin ?? obj(raw).code ?? getItem("sf.pin") ?? "";
  const s = text(v);
  return /^[1-9]\d{5}$/.test(s) ? s : "";
}
async function previewDelivery(pin) {
  set({
    busy: true,
    error: ""
  });
  try {
    const r = obj(await api().cartCall("store_cart_delivery_preview", {
      p_postal_code: pin
    }));
    const ship = num(r.shipping_total);
    set({
      busy: false,
      preview: {
        pin,
        serviceable: r.serviceable === true,
        shipping: ship
      }
    });
  } catch (e) {
    fail(e);
  }
}
function resetCartForTests() {
  for (const t of qtyTimers.values()) clearTimeout(t);
  qtyTimers.clear();
  clearTimeout(undoTimer);
  apiInstance = null;
  $cart.set({
    ...$cart.get(),
    status: "idle",
    lines: [],
    totals: emptyTotals,
    undo: null,
    error: "",
    notice: null,
    codes: [],
    preview: null,
    busy: false
  });
}
export {
  $cart,
  QTY_DELAY_MS,
  UNDO_MS,
  addItem,
  applyCode,
  loadCart,
  mapView,
  markUnavailable,
  moveToWishlist,
  previewDelivery,
  rememberedPin,
  removeCode,
  removeLine,
  resetCartForTests,
  setQty,
  transferIfSignedIn,
  undoRemove
};
//# sourceMappingURL=store_XteqTnph.mjs.map
