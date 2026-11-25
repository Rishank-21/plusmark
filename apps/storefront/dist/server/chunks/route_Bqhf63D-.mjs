globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_eWEqj2m1.mjs";
import { o as createRenderInstruction, m as maybeRenderHead, h as addAttribute, k as renderTemplate, p as renderSlot, q as renderComponent, t as l$1, S, u as unescapeHTML, s as spreadAttributes, v as renderHead, w as Fragment } from "./worker-entry_DZntRQXo.mjs";
import { env } from "cloudflare:workers";
async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}<\/script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}
const __vite_glob_0_0$3 = [];
const $$Icon = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Icon;
  const PATHS = {
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4-4",
    cart: "M3 4h2l2.5 11h10L20 7H6.5M9 20h.01M17 20h.01",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0",
    close: "M6 6l12 12M18 6 6 18",
    menu: "M4 6h16M4 12h16M4 18h16",
    home: "M4 11l8-7 8 7v9H4z",
    chevron: "M9 6l6 6-6 6",
    check: "M5 12l5 5 9-10",
    phone: "M4 5c0-1 1-2 2-2h2l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v2c0 1-1 2-2 2A17 17 0 0 1 4 5z",
    whatsapp: "M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.2A8 8 0 1 1 20 12zM8.5 8.5c0 3.5 3 6.5 6.5 6.5l1.5-1.5-2-1.5-1 1a5 5 0 0 1-2.5-2.5l1-1L10.5 7 9 8.5z",
    truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7zM7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
    shield: "M12 3l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9V6zM9 12l2 2 4-4",
    invoice: "M6 3h9l3 3v15l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h4",
    ruler: "M3 15L15 3l6 6L9 21zM7 11l2 2M10 8l2 2M13 5l2 2",
    medal: "M8 3h8l-2 6H10zM12 9a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 3l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 14.3l2-.3z",
    arrow: "M5 12h14M13 6l6 6-6 6",
    star: "M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z",
    pin: "M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    clock: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 4v4l3 2"
  };
  const { name: name2, label, class: cls = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<svg${addAttribute(`pm-icon ${cls}`.trim(), "class")} viewBox="0 0 24 24" focusable="false"${addAttribute(label ? void 0 : "true", "aria-hidden")}${addAttribute(label ? "img" : void 0, "role")}${addAttribute(label, "aria-label")}> <path${addAttribute(PATHS[name2], "d")}></path> </svg>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Icon.astro", void 0);
const $$Dialog = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Dialog;
  const { id, title, closeLabel, variant = "dialog" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<dialog${addAttribute(id, "id")}${addAttribute(`pm-dialog ${variant === "sheet" ? "pm-dialog--sheet" : ""}`.trim(), "class")}${addAttribute(`${id}-title`, "aria-labelledby")} data-pm-dialog> <div class="pm-dialog__header"> <h2${addAttribute(`${id}-title`, "id")}>${title}</h2> <button type="button" class="pm-button pm-button--ghost" data-pm-close${addAttribute(closeLabel, "aria-label")}> <svg class="pm-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"></path></svg> </button> </div> ${renderSlot($$result, $$slots["default"])} </dialog>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Dialog.astro", void 0);
const $$VisuallyHidden = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$VisuallyHidden;
  const { as: Tag = "span" } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Tag", Tag, { "class": "pm-visually-hidden" }, { "default": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["default"])}` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/VisuallyHidden.astro", void 0);
var t$1, r, u$1, i, o = 0, f$1 = [], c = l$1, e = c.__b, a = c.__r, v = c.diffed, l = c.__c, m = c.unmount, p = c.__;
function s(n, t2) {
  c.__h && c.__h(r, n, o || t2), o = 0;
  var u2 = r.__H || (r.__H = { __: [], __h: [] });
  return n >= u2.__.length && u2.__.push({}), u2.__[n];
}
function d(n) {
  return o = 1, y(D, n);
}
function y(n, u2, i2) {
  var o2 = s(t$1++, 2);
  if (o2.t = n, !o2.__c && (o2.__ = [D(void 0, u2), function(n2) {
    var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n2);
    t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
  }], o2.__c = r, !r.__f)) {
    var f2 = function(n2, t2, r2) {
      if (!o2.__c.__H) return true;
      var u3 = false, i3 = o2.__c.props !== n2;
      if (o2.__c.__H.__.some(function(n3) {
        if (n3.__N) {
          u3 = true;
          var t3 = n3.__[0];
          n3.__ = n3.__N, n3.__N = void 0, t3 !== n3.__[0] && (i3 = true);
        }
      }), c2) {
        var f3 = c2.call(this, n2, t2, r2);
        return u3 ? f3 || i3 : f3;
      }
      return !u3 || i3;
    };
    r.__f = true;
    var c2 = r.shouldComponentUpdate, e2 = r.componentWillUpdate;
    r.componentWillUpdate = function(n2, t2, r2) {
      if (this.__e) {
        var u3 = c2;
        c2 = void 0, f2(n2, t2, r2), c2 = u3;
      }
      e2 && e2.call(this, n2, t2, r2);
    }, r.shouldComponentUpdate = f2;
  }
  return o2.__N || o2.__;
}
function h(n, u2) {
  var i2 = s(t$1++, 3);
  !c.__s && C(i2.__H, u2) && (i2.__ = n, i2.u = u2, r.__H.__h.push(i2));
}
function A(n) {
  return o = 5, T(function() {
    return { current: n };
  }, []);
}
function T(n, r2) {
  var u2 = s(t$1++, 7);
  return C(u2.__H, r2) && (u2.__ = n(), u2.__H = r2, u2.__h = n), u2.__;
}
function q(n, t2) {
  return o = 8, T(function() {
    return n;
  }, t2);
}
function g() {
  var n = s(t$1++, 11);
  if (!n.__) {
    for (var u2 = r.__v; null !== u2 && !u2.__m && null !== u2.__; ) u2 = u2.__;
    var i2 = u2.__m || (u2.__m = [0, 0]);
    n.__ = "P" + i2[0] + "-" + i2[1]++;
  }
  return n.__;
}
function j() {
  for (var n; n = f$1.shift(); ) {
    var t2 = n.__H;
    if (n.__P && t2) try {
      t2.__h.some(z), t2.__h.some(B), t2.__h = [];
    } catch (r2) {
      t2.__h = [], c.__e(r2, n.__v);
    }
  }
}
c.__b = function(n) {
  r = null, e && e(n);
}, c.__ = function(n, t2) {
  n && t2.__k && t2.__k.__m && (n.__m = t2.__k.__m), p && p(n, t2);
}, c.__r = function(n) {
  a && a(n), t$1 = 0;
  var i2 = (r = n.__c).__H;
  i2 && (u$1 === r ? (i2.__h = [], r.__h = [], i2.__.some(function(n2) {
    n2.__N && (n2.__ = n2.__N), n2.u = n2.__N = void 0;
  })) : (i2.__h.some(z), i2.__h.some(B), i2.__h = [], t$1 = 0)), u$1 = r;
}, c.diffed = function(n) {
  v && v(n);
  var t2 = n.__c;
  t2 && t2.__H && (t2.__H.__h.length && (1 !== f$1.push(t2) && i === c.requestAnimationFrame || ((i = c.requestAnimationFrame) || w)(j)), t2.__H.__.some(function(n2) {
    n2.u && (n2.__H = n2.u, n2.u = void 0);
  })), u$1 = r = null;
}, c.__c = function(n, t2) {
  t2.some(function(n2) {
    try {
      n2.__h.some(z), n2.__h = n2.__h.filter(function(n3) {
        return !n3.__ || B(n3);
      });
    } catch (r2) {
      t2.some(function(n3) {
        n3.__h && (n3.__h = []);
      }), t2 = [], c.__e(r2, n2.__v);
    }
  }), l && l(n, t2);
}, c.unmount = function(n) {
  m && m(n);
  var t2, r2 = n.__c;
  r2 && r2.__H && (r2.__H.__.some(function(n2) {
    try {
      z(n2);
    } catch (n3) {
      t2 = n3;
    }
  }), r2.__H = void 0, t2 && c.__e(t2, r2.__v));
};
var k = "function" == typeof requestAnimationFrame;
function w(n) {
  var t2, r2 = function() {
    clearTimeout(u2), k && cancelAnimationFrame(t2), setTimeout(n);
  }, u2 = setTimeout(r2, 35);
  k && (t2 = requestAnimationFrame(r2));
}
function z(n) {
  var t2 = r, u2 = n.__c;
  "function" == typeof u2 && (n.__c = void 0, u2()), r = t2;
}
function B(n) {
  var t2 = r;
  n.__c = n.__(), r = t2;
}
function C(n, t2) {
  return !n || n.length !== t2.length || t2.some(function(t3, r2) {
    return t3 !== n[r2];
  });
}
function D(n, t2) {
  return "function" == typeof t2 ? t2(n) : t2;
}
const ALLOWED$1 = {
  "sf.auth": {
    kind: "local",
    cls: "essential"
  },
  "sf.cart": {
    kind: "local",
    cls: "essential"
  },
  "sf.order": {
    kind: "session",
    cls: "essential"
  },
  "sf.lang": {
    kind: "local",
    cls: "essential"
  },
  "sf.consent": {
    kind: "local",
    cls: "essential"
  },
  "sf.pin": {
    kind: "local",
    cls: "essential"
  },
  "sf.recent": {
    kind: "local",
    cls: "essential"
  },
  "sf.saved": {
    kind: "local",
    cls: "essential"
  },
  "sf.searches": {
    kind: "local",
    cls: "essential"
  },
  "sf.shown": {
    kind: "session",
    cls: "essential"
  },
  "sf.closed": {
    kind: "local",
    cls: "essential"
  },
  "sf.sid": {
    kind: "local",
    cls: "analytics"
  },
  "sf.exp": {
    kind: "local",
    cls: "analytics"
  },
  "sf.events": {
    kind: "local",
    cls: "analytics"
  }
};
let analyticsAllowed = false;
const memory = /* @__PURE__ */ new Map();
function area(key2) {
  const spec = ALLOWED$1[key2];
  if (!spec) throw new Error(`Storage key "${key2}" is not on the allowlist`);
  try {
    return spec.kind === "local" ? globalThis.localStorage : globalThis.sessionStorage;
  } catch {
    return null;
  }
}
function permitted(key2) {
  return ALLOWED$1[key2].cls === "essential" || analyticsAllowed;
}
function getItem(key2) {
  const a2 = area(key2);
  if (!permitted(key2)) return null;
  try {
    return a2 ? a2.getItem(key2) : memory.get(key2) ?? null;
  } catch {
    return memory.get(key2) ?? null;
  }
}
function setItem(key2, value) {
  const a2 = area(key2);
  if (!permitted(key2)) return false;
  try {
    if (a2) a2.setItem(key2, value);
    else memory.set(key2, value);
  } catch {
    memory.set(key2, value);
  }
  return true;
}
function removeItem(key2) {
  const a2 = area(key2);
  memory.delete(key2);
  try {
    a2?.removeItem(key2);
  } catch {
  }
}
function getJson(key2) {
  const raw = getItem(key2);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function setJson(key2, value) {
  return setItem(key2, JSON.stringify(value));
}
const getCart = () => {
  const c2 = getJson("sf.cart");
  return c2 && typeof c2.id === "string" && typeof c2.token === "string" ? c2 : null;
};
const setCart = (cart) => setJson("sf.cart", cart);
const clearCart = () => removeItem("sf.cart");
const CART_CHANNEL = "sf.cart";
function cartItemCount(cart = getCart()) {
  if (!cart?.lines) return 0;
  let n = 0;
  for (const line of Object.values(cart.lines)) {
    const q2 = line?.qty;
    if (typeof q2 === "number" && Number.isFinite(q2) && q2 > 0) n += Math.floor(q2);
  }
  return n;
}
function notifyCartChanged() {
  try {
    const ch = new BroadcastChannel(CART_CHANNEL);
    ch.postMessage("changed");
    ch.close();
  } catch {
  }
}
function watchCartCount(onChange) {
  const update = () => onChange(cartItemCount());
  let channel = null;
  try {
    channel = new BroadcastChannel(CART_CHANNEL);
    channel.onmessage = update;
  } catch {
    channel = null;
  }
  const onStorage = (e2) => {
    if (e2.key === null || e2.key === CART_CHANNEL) update();
  };
  window.addEventListener("storage", onStorage);
  update();
  return () => {
    channel?.close();
    window.removeEventListener("storage", onStorage);
  };
}
var f = 0;
function u(e2, t2, n, o2, i2, u2) {
  t2 || (t2 = {});
  var a2, c2, p2 = t2;
  if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
  var l2 = { type: e2, props: p2, key: n, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f, __i: -1, __u: 0, __source: i2, __self: u2 };
  if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
  return l$1.vnode && l$1.vnode(l2), l2;
}
function CartCount({
  label
}) {
  const [count2, setCount] = d(0);
  h(() => watchCartCount(setCount), []);
  if (count2 < 1) return null;
  return u(S, {
    children: [u("span", {
      class: "pm-cart-count",
      "aria-hidden": "true",
      children: count2 > 99 ? "99+" : count2
    }), u("span", {
      class: "pm-visually-hidden",
      children: label.replace("{count}", String(count2))
    })]
  });
}
const a11y$1 = { "skipToContent": "Skip to main content", "close": "Close", "required": "required" };
const landmarks$1 = { "header": "Site header", "main": "Main content", "footer": "Site footer" };
const validation$1 = { "required": "This field is required.", "controlCharacters": "Remove special characters that cannot be printed.", "mobileInvalid": "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.", "emailInvalid": "Enter a valid email address, for example name@example.com.", "pinInvalid": "Enter a 6-digit PIN code.", "tooLong": "Use at most {max} characters.", "gstinInvalid": "Enter a valid 15-character GSTIN.", "quantityInvalid": "Enter a whole number of 1 or more.", "quantityMin": "The minimum order quantity is {min}.", "quantityMax": "You can order at most {max} of this item." };
const language$1 = { "name": "English", "switchLabel": "Language", "switchTo": "Switch to {language}", "english": "English", "hindi": "हिन्दी", "prompt": { "message": "This page is available in Hindi.", "accept": "View in Hindi", "close": "Close" } };
const consent$1 = { "title": "Your privacy choices", "text": "We always use what the store needs to work. You decide about the rest, and you can change it from the footer at any time.", "analytics": "Analytics and experiments", "analyticsText": "Helps us see how the store is used and test changes.", "marketing": "Marketing tags", "marketingText": "Lets us measure our advertising.", "acceptAll": "Accept all", "onlyNecessary": "Only necessary", "choose": "Choose", "save": "Save my choices" };
const count$3 = { "items": { "one": "{count} item", "other": "{count} items" } };
const nav$1 = { "menu": "Menu", "home": "Home", "categories": "Categories", "search": "Search", "cart": "Cart", "account": "Account", "quickLinks": "Quick links", "categoriesTitle": "Shop by category", "language": "Language", "otherLanguageName": "हिन्दी", "searchLabel": "Search products", "searchSubmit": "Search", "cartItems": "{count} items in your cart", "announce": "Made in Ahmedabad since 2015 · Delivered across India", "shopAll": "Shop all boards", "support": "Talk to us", "bulk": "Bulk & institutional orders" };
const footer$1 = { "policies": "Policies", "help": "Help and information", "seller": "Seller details", "contact": "Contact us", "sellerPage": "Seller details and Grievance Officer", "ranking": "How we rank products", "certificate": "Compliance certificate", "privacyChoices": "Privacy choices", "gstin": "GSTIN", "care": "Customer care", "grievance": "Grievance Officer", "pinCredit": "PIN code data: All India Pincode Directory from data.gov.in, published under the Government Open Data License – India.", "copyright": "© {year} {name}", "policy": { "returns": "Returns", "refunds": "Refunds", "exchanges": "Exchanges", "cancellations": "Cancellations", "shipping": "Shipping and delivery", "payments": "Payment methods", "warranties": "Warranties and guarantees", "privacy": "Privacy notice", "terms": "Terms of use" }, "why": "Why each part of this store is here" };
const price$1 = { "onRequest": "Price on request", "onRequestHint": "Contact us for a price and availability.", "yourPrice": "Your price", "srCurrent": "Current price {price}", "srPrior": "Previous price {price}", "inclTax": "incl. of all taxes", "saving": "You save {amount} ({percent})", "savingAmountOnly": "You save {amount}", "explainControl": "What is the previous price?", "priorExplain": "The previous price is the lowest price at which we offered this item in the 30 days before the price fell.", "mrp": "MRP (incl. of all taxes)", "unitPrice": "Unit price:", "tiersCaption": "Buy more, pay less per unit", "tierQuantity": "Quantity", "tierPrice": "Price per unit", "tierSaving": "Saving per unit", "noSaving": "No saving", "cartConfirms": "Your Cart confirms the final price." };
const social$1 = { "rating": "Rated {average} out of 5", "ratingCount": "({count} reviews)", "highlightsTitle": "What customers say", "highlightPositive": "Positive review", "highlightCritical": "Critical review", "highlightBy": "By {name}", "popularity": "{band}+ bought in the last 7 days", "lowStock": "Only {count} left in stock", "trustLabel": "Why shop here", "securePayment": "Secure online payment", "cod": "Cash on delivery available", "returns": "{value}-day returns", "gstInvoice": "GST invoice available", "origin": "Made in {value}" };
const journey$1 = { "freeProgress": "Add {amount} more for free delivery", "freeReached": "Delivery is free on this Cart", "savings": "You save {amount}", "goesWellTitle": "Goes well with", "bundleTitle": "Buy together", "bundleTotal": "Together {price}", "bundleSave": "You save {amount}", "bundleAdd": "Add all to Cart", "add": "Add to Cart", "recentTitle": "Recently viewed", "recentClear": "Clear list", "firstOrderTitle": "First order offer", "firstOrderClose": "Close", "progressLabel": "Checkout steps", "stepDone": "completed", "stepCurrent": "current step", "stickyAdd": "Add to Cart" };
const countdown$1 = { "saleEndsIn": "Offer ends in {time}", "saleThen": "Price after the offer: {price}", "saleEndsAt": "Offer ends at {time}", "saleEnded": "The offer has ended. The price is now {price}.", "srSale": "Offer ends in about {time}", "dispatchWithin": "Order within {time} for dispatch today", "srDispatch": "Order within {time} for dispatch today" };
const delivery$1 = { "pinLabel": "Check delivery to your PIN code", "pinHint": "Enter 6 digits.", "check": "Check", "checking": "Checking", "change": "Change PIN code", "forPin": "PIN code {pin}", "between": "Delivery between {range}", "workingDays": "Delivery in {min} to {max} working days", "workingDaysOne": "Delivery in {days} working days", "notServiceable": "We cannot deliver to this PIN code.", "noEstimate": "We have no delivery estimate for this PIN code yet. Checkout confirms it.", "codYes": "Cash on Delivery available", "codNo": "Cash on Delivery not available", "error": "We could not check this PIN code. Try again.", "pinInvalid": "Enter a 6-digit PIN code.", "unknownCountry": "We cannot estimate delivery for this address yet. Checkout confirms it." };
const legal$1 = { "policyMissing": "This policy has not been published yet. Please contact us for details.", "hindiFallback": "This page is not yet available in Hindi. The English text is shown.", "privacyChoicesHeading": "Your privacy choices", "privacyChoicesText": "You can change what we may use at any time.", "privacyChoicesButton": "Change privacy choices", "sellerTitle": "Seller details and Grievance Officer", "sellerHeading": "Seller details", "legalName": "Legal name", "address": "Registered address", "gstin": "GSTIN", "phone": "Phone", "email": "Email", "grievanceHeading": "Grievance Officer", "grievanceName": "Name", "designation": "Designation", "responseHeading": "How we respond to complaints", "responseAck": "We acknowledge your complaint within {hours} hours.", "responseResolve": "We resolve your complaint within one month of receiving it.", "helplineHeading": "National Consumer Helpline", "helplineText": "You can also contact the National Consumer Helpline on {phone} or {altPhone}, or at {site}.", "notSet": "Not provided", "contactTitle": "Contact us", "whatsapp": "WhatsApp", "supportHours": "Support hours", "contactIntro": "Reach us by phone, email or WhatsApp.", "rankingTitle": "How we rank products", "rankingIntro": "This page explains each way you can sort products and what decides the order.", "rankingSortOrder": "Sort order", "rankingFactor": "What decides the order", "rankingNoPayment": "No seller pays for a better place in any list. Paid placement does not exist on this store.", "ranking": { "order": { "featured": "Featured", "relevance": "Relevance", "newest": "Newest", "priceAsc": "Price: low to high", "priceDesc": "Price: high to low", "rating": "Best rated", "bestSelling": "Best-selling" }, "factor": { "storeOrder": "The order that the store sets for the category or collection.", "textMatch": "How closely a product's name and description match your search words.", "publicationTime": "When the product was published, newest first.", "priceLowToHigh": "The price, lowest first.", "priceHighToLow": "The price, highest first.", "ratingAndCount": "The average rating from customer reviews, then the number of reviews.", "unitsSold30Days": "The number of units sold in the last 30 days." } }, "certificateTitle": "Compliance certificate", "certificateDate": "Date of the certificate", "certificateMissing": "The compliance certificate has not been published yet.", "certificateImageAlt": "Compliance certificate", "pdp": { "summaryHeading": "Returns, warranty and delivery", "returns": "Returns", "warranty": "Warranty", "delivery": "Delivery", "readMore": "Read the full policy", "noSummary": "See the full policy for details.", "declarationsHeading": "Product details required by law", "country_of_origin": "Country of origin", "manufacturer": "Manufacturer or packer", "importer": "Importer", "generic_name": "Generic name", "consumer_care": "Consumer care", "net_quantity": "Net quantity", "manufacture_month": "Month and year of manufacture", "best_before_date": "Best before" } };
const account$1 = { "signIn": { "title": "Sign in or create an account", "resetTitle": "Reset your password", "newPasswordTitle": "Choose a new password", "tabSignIn": "Sign in", "tabSignUp": "Create account", "tabReset": "Forgot password", "email": "Email address", "password": "Password", "newPassword": "New password", "passwordHint": "At least 10 characters.", "submitSignIn": "Sign in", "submitSignUp": "Create account", "submitReset": "Send reset link", "submitNewPassword": "Save new password", "checkEmail": "Check your email and open the link to confirm your account, then sign in.", "resetSent": "If that email address has an account, a reset link is on its way.", "passwordUpdated": "Your password is updated. Sign in with it.", "captchaNeeded": "Complete the check below to continue.", "errInvalid": "The email address or password is not right.", "errNotConfirmed": "Confirm your email address first. The link is in the email we sent you.", "errWeak": "Choose a longer or less common password.", "errCaptcha": "The check did not pass. Try again.", "errRate": "Too many attempts. Wait a few minutes and try again.", "errExists": "An account with this email address already exists. Sign in instead.", "errNetwork": "Could not reach the store. Check your connection and try again.", "errUnknown": "Something went wrong. Try again.", "errEmail": "Enter a valid email address." }, "area": { "title": "Your account", "signedInAs": "Signed in as {email}", "signOut": "Sign out", "signedOut": "You have signed out.", "needSignIn": "Sign in to see your account.", "goSignIn": "Sign in", "loading": "Loading…", "loadFailed": "Could not load this. Try again.", "sections": "Account sections", "orders": "Orders", "addresses": "Addresses", "wishlists": "Wishlists", "reviews": "Reviews", "preferences": "Preferences", "language": "Language", "deletion": "Delete account" }, "orders": { "none": "You have no orders yet.", "number": "Order {id}", "placedOn": "Placed on {date}", "total": "Total {amount}", "view": "View order", "back": "Back to orders", "items": "Items", "status": "Status", "deliveryAddress": "Delivery address", "payment": "Payment", "tracking": "Track shipment", "history": "Status history", "cancel": "Cancel order", "cancelSure": "Cancel this order?", "cancelled": "The order is cancelled.", "returnHeading": "Return items", "returnQty": "Quantity to return", "returnSend": "Request return", "returnSent": "Your return request is sent.", "returnPick": "Choose at least one item to return.", "invoice": "Tax invoice", "invoiceOpen": "Open tax invoice", "invoiceNone": "The tax invoice is issued when the order ships.", "invoicePrint": "Print", "invoiceTitle": "Tax invoice for order {id}", "notFound": "This order was not found.", "actionFailed": "Could not do that. The order may have changed. Reload and try again." }, "addr": { "none": "You have no saved addresses.", "add": "Add an address", "save": "Save address", "remove": "Delete", "saved": "Address saved.", "removed": "Address deleted.", "name": "Full name", "line1": "Address line 1", "line2": "Address line 2", "city": "City", "state": "State", "pin": "PIN code", "phone": "Mobile number", "defaultShipping": "Use as my delivery address", "invalid": "Check the address and try again." }, "wish": { "none": "You have no saved products.", "remove": "Remove", "removed": "Removed from your list.", "view": "View product" }, "rev": { "none": "You have not written a review.", "awaiting": "Awaiting moderation", "published": "Published", "rejected": "Not published", "verified": "Verified purchase", "rating": "{n} out of 5 stars" }, "pref": { "marketing": "Send me offers and news by email", "saved": "Preference saved.", "languageLabel": "Language", "languageEn": "English", "languageHi": "हिन्दी", "languageSaved": "Language saved.", "on": "Yes, send them", "off": "No, stop sending" }, "del": { "text": "Deleting your account removes your personal details. Orders are kept as the law requires, without your details. This cannot be undone.", "confirm": "Delete my account", "sure": "Delete your account for good?", "done": "Your deletion request is received. You are signed out.", "recent": "For your safety, sign in again and then delete the account.", "failed": "Could not delete the account. Try again." }, "confirm": { "title": "Order confirmation", "thanks": "Thank you. Your order is placed.", "number": "Your order number is {id}.", "emailSent": "We sent the details to {email}.", "empty": "We could not find a recent order on this device.", "emptyHelp": "If you placed an order as a guest, you can open it with your order number and email address.", "trackLink": "Find my order", "continueShopping": "Continue shopping", "viewOrders": "View my orders", "createTitle": "Create an account to follow your orders", "createText": "Choose a password. We send a confirmation email, and your orders on this email address join your account once you confirm it.", "createSubmit": "Create account", "createSent": "Check your email and open the link to confirm your account.", "createDone": "Your account is ready.", "guestKept": "This page keeps your order only until you close the browser. Save your order number and email address to open it later." }, "track": { "title": "Track your order", "intro": "Enter your order number and the email address you used. We send a six-digit code to that address.", "orderNumber": "Order number", "email": "Email address", "sendCode": "Send code", "codeSent": "If the details match an order, we sent a code to that email address. It is valid for a short time.", "code": "Six-digit code", "verify": "Open order", "change": "Use other details", "checkNeeded": "Complete the check below to continue.", "errNumber": "Enter your order number.", "errCode": "Enter the six-digit code.", "errInvalidCode": "The code is not right or has expired. Check it or ask for a new one.", "errRate": "Too many attempts. Wait a few minutes and try again.", "errCaptcha": "The check did not pass. Try again.", "errNetwork": "Could not reach the store. Check your connection and try again.", "errUnknown": "Something went wrong. Try again." } };
const plp$1 = { "title": "Products", "productCount": { "one": "{count} product", "other": "{count} products" }, "breadcrumbs": "Breadcrumbs", "home": "Home", "sort": "Sort by", "sortFeatured": "Featured", "sortRelevance": "Relevance", "sortNewest": "Newest", "sortPriceAsc": "Price: low to high", "sortPriceDesc": "Price: high to low", "sortTitleAsc": "Name: A to Z", "rankingLink": "How we rank products", "filters": "Filters", "filtersApplied": "Filters ({count})", "closeFilters": "Close filters", "showResults": { "one": "Show {count} product", "other": "Show {count} products" }, "showResultsNone": "No matching products", "applyLoading": "Checking matches...", "categories": "Category", "collections": "Collection", "tags": "Tag", "types": "Type", "price": "Price", "priceMin": "Minimum price", "priceMax": "Maximum price", "appliedFilters": "Applied filters", "removeFilter": "Remove filter {name}", "clearAll": "Clear all filters", "from": "from", "save": "{percent} off", "moreColours": "+{count}", "chooseOptions": "Choose options", "addToCart": "Add to cart", "quickView": "Quick view", "quickViewFor": "Quick view: {title}", "quickViewLabel": "Quick view", "viewFull": "View full details", "close": "Close", "unavailable": "This product is no longer available.", "showing": "Showing {shown} of {total}", "loadMore": "Load {count} more", "loading": "Loading products...", "loaded": "{shown} of {total} products shown", "empty": "No products match your filters.", "emptyHint": "Remove a filter to see more products.", "error": "We could not load products. Check your connection and try again.", "retry": "Try again", "priceOnRequest": "Price on request", "srCurrent": "Current price {price}", "srPrior": "Previous price {price}", "badge": { "sale": "Sale", "new": "New", "best_seller": "Best seller", "low_stock": "Few left", "free_delivery": "Free delivery", "made_in_india": "Made in India" } };
const home$3 = { "title": "Plusmark", "description": "Shop products with clear prices and delivery dates.", "heroFallbackTitle": "Welcome to our store", "heroFallbackAction": "Shop all products", "eyebrow": "Writing & display systems since 2015", "heroTitle": "Boards that make every idea visible.", "heroBody": "Premium whiteboards, chalkboards and notice boards, manufactured in Ahmedabad and delivered across India. Clear prices, GST invoices and sizes for every room.", "heroPrimary": "Shop writing boards", "heroSecondary": "Get a bulk quote", "heroPoint1": "Direct from the manufacturer", "heroPoint2": "Custom sizes cut to order", "heroPoint3": "GST invoice with every order", "heroCardKicker": "Most ordered", "trustInvoice": "GST invoice", "trustDispatch": "Pan-India dispatch", "trustSince": "Since 2015", "trustCod": "Cash on Delivery up to {amount}", "decisionTitle": "Find the right board in under a minute", "decisionLead": "Start with the room, not the catalogue. Each range is built for a different job.", "decisionClassroom": "Classroom", "decisionClassroomBody": "Chalk and ceramic surfaces that take daily writing, dusting and long lessons.", "decisionOffice": "Office & meeting room", "decisionOfficeBody": "Magnetic whiteboards for plans, presentations and everything that changes weekly.", "decisionNotice": "Notice & display", "decisionNoticeBody": "Cork and felt pin boards that keep announcements visible without creating clutter.", "decisionCta": "Browse range", "benefitsTitle": "Why schools and offices choose Plusmark", "benefitsLead": "A board is a long-term purchase. These are the four things that decide how it feels three years from now.", "benefit1Title": "Made, not resold", "benefit1Body": "Panels, frames and finishing happen in our own unit, so quality and replacement parts stay in our control.", "benefit2Title": "Sizes that fit the wall", "benefit2Body": "Standard sizes ship fast. Custom sizes are cut to order for classrooms, labs and training rooms.", "benefit3Title": "Built for daily use", "benefit3Body": "Anodised aluminium frames and moisture-resistant boards that survive Indian classrooms and offices.", "benefit4Title": "One invoice, full support", "benefit4Body": "GST invoice, delivery tracking and a real person on call for installations and repeat orders.", "spotlightKicker": "Editor's pick", "spotlightTitle": "The board that sells itself", "spotlightBody": "Our metallic premium range uses a high-gloss marker-grade surface in an anodised aluminium frame — the finish most offices and schools reorder.", "spotlightCta": "View this board", "proofTitle": "Ordered by schools, offices and training teams", "proofBody": "Plusmark boards are specified for classrooms, meeting rooms, coaching centres and institutions that need the same finish, year after year.", "proofStat1": "Since 2015", "proofStat1Label": "Manufacturing boards in Ahmedabad", "proofStat2": "Pan-India", "proofStat2Label": "Dispatch with tracked delivery", "proofStat3": "GST", "proofStat3Label": "Invoice for institutional claims", "faqFallback1Q": "Do you make custom board sizes?", "faqFallback1A": "Yes. Boards are cut to order for walls and rooms that do not match standard sizes. Share the width and height and we will quote the closest practical size.", "faqFallback2Q": "Do you supply schools and offices in bulk?", "faqFallback2A": "Yes. Send a quantity list and delivery PIN codes for a bulk quotation with GST invoice and staged dispatch if needed.", "faqFallback3Q": "How is the board packed?", "faqFallback3A": "Boards travel in edge-protected cartons. Large sizes are crated, and every order includes a tracking reference.", "newsletterTitle": "A better board, one email at a time", "newsletterBody": "New ranges, size guides and institutional offers. No daily noise; unsubscribe in one click.", "railTitle": "A board for every room", "railLead": "Real sizes, real prices and the finish most buyers reorder.", "moreTitle": "More from the range", "categories": "Shop by category", "collections": "Collections", "bestSellers": "Best sellers", "newArrivals": "New arrivals", "rail": "Products", "viewAll": "View all", "offer": "Offer", "offerAction": "See the offer", "emptyTitle": "Our products are on their way", "emptyBody": "The catalogue is empty right now. Please check back soon.", "trust": "Why shop here", "trustFreeDelivery": "Free delivery on orders from {amount}", "faq": "Questions and answers", "brandStory": "Our story", "newsletter": "Stay in touch", "newsletterEmail": "Email address", "newsletterAction": "Subscribe", "newsletterNote": "We send marketing email only if you agree here. You can unsubscribe at any time.", "reviews": "What customers say", "recentLoaded": "Recently viewed products" };
const notFound$1 = { "title": "Page not found", "message": "We could not find that page. It may have moved. Search or pick a category.", "searchLabel": "Search products", "searchButton": "Search", "browse": "Shop by category" };
const search$1 = { "title": "Search", "resultsFor": 'Results for "{query}"', "prompt": "Type what you are looking for in the search box.", "noResults": 'No results for "{query}"', "noResultsHint": "Check the spelling, try fewer words, or browse a category.", "browse": "Browse categories", "bestSellers": "Best sellers", "suggestions": "Suggestions", "products": "Products", "categories": "Categories", "recent": "Recent searches", "clearRecent": "Clear recent searches", "seeAll": 'See all results for "{query}"', "loading": "Loading suggestions", "found": "{count} suggestions", "none": "No suggestions", "viewAll": "All {name}", "subcategories": "Subcategories of {name}", "breadcrumbSearch": "Search" };
const en$2 = {
  a11y: a11y$1,
  landmarks: landmarks$1,
  validation: validation$1,
  language: language$1,
  consent: consent$1,
  count: count$3,
  nav: nav$1,
  footer: footer$1,
  price: price$1,
  social: social$1,
  journey: journey$1,
  countdown: countdown$1,
  delivery: delivery$1,
  legal: legal$1,
  account: account$1,
  plp: plp$1,
  home: home$3,
  notFound: notFound$1,
  search: search$1
};
const a11y = { "skipToContent": "मुख्य सामग्री पर जाएँ", "close": "बंद करें", "required": "आवश्यक" };
const landmarks = { "header": "साइट हेडर", "main": "मुख्य सामग्री", "footer": "साइट फ़ुटर" };
const validation = { "required": "यह जानकारी आवश्यक है।", "controlCharacters": "ऐसे विशेष वर्ण हटाएँ जो छप नहीं सकते।", "mobileInvalid": "6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का मोबाइल नंबर दर्ज करें।", "emailInvalid": "सही ईमेल पता दर्ज करें, जैसे name@example.com।", "pinInvalid": "6 अंकों का पिन कोड दर्ज करें।", "tooLong": "अधिकतम {max} अक्षर लिखें।", "gstinInvalid": "15 अक्षरों का सही GSTIN दर्ज करें।", "quantityInvalid": "1 या उससे अधिक की पूरी संख्या दर्ज करें।", "quantityMin": "न्यूनतम ऑर्डर मात्रा {min} है।", "quantityMax": "आप इस उत्पाद की अधिकतम {max} इकाइयाँ ऑर्डर कर सकते हैं।" };
const language = { "name": "हिन्दी", "switchLabel": "भाषा", "switchTo": "{language} में देखें", "english": "English", "hindi": "हिन्दी", "prompt": { "message": "यह पेज हिन्दी में उपलब्ध है।", "accept": "हिन्दी में देखें", "close": "बंद करें" } };
const consent = { "title": "आपकी गोपनीयता के विकल्प", "text": "स्टोर को चलाने के लिए ज़रूरी चीज़ें हम हमेशा उपयोग करते हैं। बाकी का फ़ैसला आपका है, और आप इसे फ़ुटर से कभी भी बदल सकते हैं।", "analytics": "एनालिटिक्स और प्रयोग", "analyticsText": "इससे हम देख पाते हैं कि स्टोर कैसे उपयोग होता है और बदलावों को परख पाते हैं।", "marketing": "मार्केटिंग टैग", "marketingText": "इससे हम अपने विज्ञापनों का असर माप पाते हैं।", "acceptAll": "सभी स्वीकार करें", "onlyNecessary": "केवल ज़रूरी", "choose": "चुनें", "save": "मेरे विकल्प सहेजें" };
const count$2 = { "items": { "one": "{count} आइटम", "other": "{count} आइटम" } };
const nav = { "menu": "मेन्यू", "home": "होम", "categories": "श्रेणियाँ", "search": "खोजें", "cart": "कार्ट", "account": "खाता", "quickLinks": "त्वरित लिंक", "categoriesTitle": "श्रेणी के अनुसार खरीदें", "language": "भाषा", "otherLanguageName": "English", "searchLabel": "उत्पाद खोजें", "searchSubmit": "खोजें", "cartItems": "आपके कार्ट में {count} आइटम", "announce": "2015 से अहमदाबाद में निर्मित · पूरे भारत में डिलीवरी", "shopAll": "सभी बोर्ड देखें", "support": "हमसे बात करें", "bulk": "थोक और संस्थागत ऑर्डर" };
const footer = { "policies": "नीतियाँ", "help": "सहायता और जानकारी", "seller": "विक्रेता की जानकारी", "contact": "हमसे संपर्क करें", "sellerPage": "विक्रेता की जानकारी और शिकायत अधिकारी", "ranking": "हम उत्पादों को कैसे क्रम देते हैं", "certificate": "अनुपालन प्रमाणपत्र", "privacyChoices": "गोपनीयता विकल्प", "gstin": "GSTIN", "care": "ग्राहक सेवा", "grievance": "शिकायत अधिकारी", "pinCredit": "पिन कोड डेटा: data.gov.in से अखिल भारतीय पिनकोड निर्देशिका, जो Government Open Data License – India के अंतर्गत प्रकाशित है।", "copyright": "© {year} {name}", "policy": { "returns": "वापसी", "refunds": "रिफ़ंड", "exchanges": "बदली", "cancellations": "रद्द करना", "shipping": "शिपिंग और डिलीवरी", "payments": "भुगतान के तरीके", "warranties": "वारंटी और गारंटी", "privacy": "गोपनीयता सूचना", "terms": "उपयोग की शर्तें" }, "why": "यह स्टोर इस तरह क्यों बना है" };
const price = { "onRequest": "कीमत अनुरोध पर", "onRequestHint": "कीमत और उपलब्धता के लिए हमसे संपर्क करें।", "yourPrice": "आपकी कीमत", "srCurrent": "मौजूदा कीमत {price}", "srPrior": "पिछली कीमत {price}", "inclTax": "सभी करों सहित", "saving": "आपकी बचत {amount} ({percent})", "savingAmountOnly": "आपकी बचत {amount}", "explainControl": "पिछली कीमत क्या है?", "priorExplain": "पिछली कीमत वह सबसे कम कीमत है जिस पर हमने कीमत गिरने से पहले के 30 दिनों में यह वस्तु बेची।", "mrp": "MRP (सभी करों सहित)", "unitPrice": "इकाई मूल्य:", "tiersCaption": "अधिक लें, प्रति नग कम दें", "tierQuantity": "मात्रा", "tierPrice": "प्रति नग कीमत", "tierSaving": "प्रति नग बचत", "noSaving": "कोई बचत नहीं", "cartConfirms": "अंतिम कीमत की पुष्टि आपका कार्ट करता है।" };
const social = { "rating": "5 में से {average} रेटिंग", "ratingCount": "({count} समीक्षाएँ)", "highlightsTitle": "ग्राहक क्या कहते हैं", "highlightPositive": "सकारात्मक समीक्षा", "highlightCritical": "आलोचनात्मक समीक्षा", "highlightBy": "{name} द्वारा", "popularity": "पिछले 7 दिनों में {band}+ ने खरीदा", "lowStock": "स्टॉक में केवल {count} बचे हैं", "trustLabel": "यहाँ से क्यों खरीदें", "securePayment": "सुरक्षित ऑनलाइन भुगतान", "cod": "कैश ऑन डिलीवरी उपलब्ध", "returns": "{value} दिन में वापसी", "gstInvoice": "GST इनवॉइस उपलब्ध", "origin": "निर्माण देश: {value}" };
const journey = { "freeProgress": "मुफ़्त डिलीवरी के लिए {amount} और जोड़ें", "freeReached": "इस कार्ट पर डिलीवरी मुफ़्त है", "savings": "आपकी बचत {amount}", "goesWellTitle": "इसके साथ अच्छा लगता है", "bundleTitle": "साथ में खरीदें", "bundleTotal": "साथ में {price}", "bundleSave": "आपकी बचत {amount}", "bundleAdd": "सभी कार्ट में जोड़ें", "add": "कार्ट में जोड़ें", "recentTitle": "हाल में देखे गए", "recentClear": "सूची साफ़ करें", "firstOrderTitle": "पहले ऑर्डर का ऑफ़र", "firstOrderClose": "बंद करें", "progressLabel": "चेकआउट के चरण", "stepDone": "पूरा हुआ", "stepCurrent": "वर्तमान चरण", "stickyAdd": "कार्ट में जोड़ें" };
const countdown = { "saleEndsIn": "ऑफ़र खत्म होने में {time}", "saleThen": "ऑफ़र के बाद कीमत: {price}", "saleEndsAt": "ऑफ़र {time} पर खत्म होता है", "saleEnded": "ऑफ़र खत्म हो गया है। अब कीमत {price} है।", "srSale": "ऑफ़र खत्म होने में लगभग {time}", "dispatchWithin": "आज भेजे जाने के लिए {time} के भीतर ऑर्डर करें", "srDispatch": "आज भेजे जाने के लिए {time} के भीतर ऑर्डर करें" };
const delivery = { "pinLabel": "अपने पिन कोड पर डिलीवरी जाँचें", "pinHint": "6 अंक दर्ज करें।", "check": "जाँचें", "checking": "जाँच हो रही है", "change": "पिन कोड बदलें", "forPin": "पिन कोड {pin}", "between": "डिलीवरी {range} के बीच", "workingDays": "डिलीवरी {min} से {max} कार्य दिवसों में", "workingDaysOne": "डिलीवरी {days} कार्य दिवसों में", "notServiceable": "हम इस पिन कोड पर डिलीवरी नहीं कर सकते।", "noEstimate": "इस पिन कोड के लिए अभी डिलीवरी का अनुमान नहीं है। चेकआउट पर पुष्टि होगी।", "codYes": "कैश ऑन डिलीवरी उपलब्ध है", "codNo": "कैश ऑन डिलीवरी उपलब्ध नहीं है", "error": "हम इस पिन कोड को जाँच नहीं सके। फिर कोशिश करें।", "pinInvalid": "6 अंकों का पिन कोड दर्ज करें।", "unknownCountry": "इस पते के लिए अभी डिलीवरी का अनुमान नहीं है। चेकआउट पर पुष्टि होगी।" };
const legal = { "policyMissing": "यह नीति अभी प्रकाशित नहीं हुई है। जानकारी के लिए कृपया हमसे संपर्क करें।", "hindiFallback": "यह पृष्ठ अभी हिन्दी में उपलब्ध नहीं है। अंग्रेज़ी पाठ दिखाया गया है।", "privacyChoicesHeading": "आपकी गोपनीयता के विकल्प", "privacyChoicesText": "हम किस चीज़ का उपयोग कर सकते हैं, यह आप कभी भी बदल सकते हैं।", "privacyChoicesButton": "गोपनीयता के विकल्प बदलें", "sellerTitle": "विक्रेता का विवरण और शिकायत अधिकारी", "sellerHeading": "विक्रेता का विवरण", "legalName": "कानूनी नाम", "address": "पंजीकृत पता", "gstin": "जीएसटीआईएन", "phone": "फ़ोन", "email": "ईमेल", "grievanceHeading": "शिकायत अधिकारी", "grievanceName": "नाम", "designation": "पदनाम", "responseHeading": "हम शिकायतों का जवाब कैसे देते हैं", "responseAck": "हम आपकी शिकायत की पावती {hours} घंटे के भीतर देते हैं।", "responseResolve": "हम शिकायत मिलने के एक महीने के भीतर उसका समाधान करते हैं।", "helplineHeading": "राष्ट्रीय उपभोक्ता हेल्पलाइन", "helplineText": "आप राष्ट्रीय उपभोक्ता हेल्पलाइन से {phone} या {altPhone} पर, या {site} पर भी संपर्क कर सकते हैं।", "notSet": "उपलब्ध नहीं कराया गया", "contactTitle": "हमसे संपर्क करें", "whatsapp": "व्हाट्सऐप", "supportHours": "सहायता का समय", "contactIntro": "फ़ोन, ईमेल या व्हाट्सऐप से हमसे संपर्क करें।", "rankingTitle": "हम उत्पादों को कैसे क्रम देते हैं", "rankingIntro": "यह पृष्ठ बताता है कि आप उत्पादों को किन तरीकों से क्रम में लगा सकते हैं और क्रम किस आधार पर तय होता है।", "rankingSortOrder": "क्रम", "rankingFactor": "क्रम किस आधार पर तय होता है", "rankingNoPayment": "कोई विक्रेता किसी सूची में बेहतर स्थान के लिए भुगतान नहीं करता। इस स्टोर पर सशुल्क स्थान नहीं होता।", "ranking": { "order": { "featured": "चुनिंदा", "relevance": "प्रासंगिकता", "newest": "सबसे नया", "priceAsc": "कीमत: कम से ज़्यादा", "priceDesc": "कीमत: ज़्यादा से कम", "rating": "सबसे अच्छी रेटिंग", "bestSelling": "सबसे ज़्यादा बिकने वाले" }, "factor": { "storeOrder": "वह क्रम जो स्टोर श्रेणी या संग्रह के लिए तय करता है।", "textMatch": "उत्पाद का नाम और विवरण आपके खोज शब्दों से कितना मिलता है।", "publicationTime": "उत्पाद कब प्रकाशित हुआ, सबसे नया पहले।", "priceLowToHigh": "कीमत, सबसे कम पहले।", "priceHighToLow": "कीमत, सबसे ज़्यादा पहले।", "ratingAndCount": "ग्राहकों की समीक्षाओं की औसत रेटिंग, फिर समीक्षाओं की संख्या।", "unitsSold30Days": "पिछले 30 दिनों में बिकी इकाइयों की संख्या।" } }, "certificateTitle": "अनुपालन प्रमाणपत्र", "certificateDate": "प्रमाणपत्र की तारीख", "certificateMissing": "अनुपालन प्रमाणपत्र अभी प्रकाशित नहीं हुआ है।", "certificateImageAlt": "अनुपालन प्रमाणपत्र", "pdp": { "summaryHeading": "वापसी, वारंटी और डिलीवरी", "returns": "वापसी", "warranty": "वारंटी", "delivery": "डिलीवरी", "readMore": "पूरी नीति पढ़ें", "noSummary": "जानकारी के लिए पूरी नीति देखें।", "declarationsHeading": "कानून के अनुसार उत्पाद की जानकारी", "country_of_origin": "उत्पत्ति का देश", "manufacturer": "निर्माता या पैकर", "importer": "आयातक", "generic_name": "सामान्य नाम", "consumer_care": "उपभोक्ता सहायता", "net_quantity": "शुद्ध मात्रा", "manufacture_month": "निर्माण का महीना और वर्ष", "best_before_date": "इससे पहले उपयोग करें" } };
const account = { "signIn": { "title": "साइन इन करें या खाता बनाएँ", "resetTitle": "पासवर्ड रीसेट करें", "newPasswordTitle": "नया पासवर्ड चुनें", "tabSignIn": "साइन इन", "tabSignUp": "खाता बनाएँ", "tabReset": "पासवर्ड भूल गए", "email": "ईमेल पता", "password": "पासवर्ड", "newPassword": "नया पासवर्ड", "passwordHint": "कम से कम 10 अक्षर।", "submitSignIn": "साइन इन करें", "submitSignUp": "खाता बनाएँ", "submitReset": "रीसेट लिंक भेजें", "submitNewPassword": "नया पासवर्ड सहेजें", "checkEmail": "अपना ईमेल देखें और खाता पक्का करने के लिए लिंक खोलें, फिर साइन इन करें।", "resetSent": "अगर इस ईमेल पते पर खाता है, तो रीसेट लिंक भेजा जा रहा है।", "passwordUpdated": "आपका पासवर्ड बदल गया है। उससे साइन इन करें।", "captchaNeeded": "आगे बढ़ने के लिए नीचे की जाँच पूरी करें।", "errInvalid": "ईमेल पता या पासवर्ड सही नहीं है।", "errNotConfirmed": "पहले अपना ईमेल पता पक्का करें। लिंक हमारे भेजे ईमेल में है।", "errWeak": "लंबा या कम आम पासवर्ड चुनें।", "errCaptcha": "जाँच पूरी नहीं हुई। फिर कोशिश करें।", "errRate": "बहुत ज़्यादा कोशिशें। कुछ मिनट रुककर फिर कोशिश करें।", "errExists": "इस ईमेल पते से खाता पहले से है। साइन इन करें।", "errNetwork": "स्टोर तक नहीं पहुँच सके। कनेक्शन जाँचकर फिर कोशिश करें।", "errUnknown": "कुछ गड़बड़ हुई। फिर कोशिश करें।", "errEmail": "सही ईमेल पता लिखें।" }, "area": { "title": "आपका खाता", "signedInAs": "{email} से साइन इन", "signOut": "साइन आउट", "signedOut": "आप साइन आउट हो गए हैं।", "needSignIn": "अपना खाता देखने के लिए साइन इन करें।", "goSignIn": "साइन इन", "loading": "लोड हो रहा है…", "loadFailed": "यह लोड नहीं हो सका। फिर कोशिश करें।", "sections": "खाते के भाग", "orders": "ऑर्डर", "addresses": "पते", "wishlists": "विशलिस्ट", "reviews": "समीक्षाएँ", "preferences": "पसंद", "language": "भाषा", "deletion": "खाता हटाएँ" }, "orders": { "none": "आपका अभी कोई ऑर्डर नहीं है।", "number": "ऑर्डर {id}", "placedOn": "{date} को किया गया", "total": "कुल {amount}", "view": "ऑर्डर देखें", "back": "ऑर्डर पर वापस", "items": "सामान", "status": "स्थिति", "deliveryAddress": "डिलीवरी का पता", "payment": "भुगतान", "tracking": "शिपमेंट ट्रैक करें", "history": "स्थिति का इतिहास", "cancel": "ऑर्डर रद्द करें", "cancelSure": "यह ऑर्डर रद्द करें?", "cancelled": "ऑर्डर रद्द हो गया।", "returnHeading": "सामान वापस करें", "returnQty": "वापस करने की संख्या", "returnSend": "वापसी का अनुरोध करें", "returnSent": "आपका वापसी अनुरोध भेज दिया गया।", "returnPick": "वापस करने के लिए कम से कम एक सामान चुनें।", "invoice": "टैक्स इनवॉइस", "invoiceOpen": "टैक्स इनवॉइस खोलें", "invoiceNone": "ऑर्डर शिप होने पर टैक्स इनवॉइस जारी होता है।", "invoicePrint": "प्रिंट करें", "invoiceTitle": "ऑर्डर {id} का टैक्स इनवॉइस", "notFound": "यह ऑर्डर नहीं मिला।", "actionFailed": "यह नहीं हो सका। ऑर्डर बदल गया होगा। पेज फिर खोलकर कोशिश करें।" }, "addr": { "none": "आपका कोई सहेजा हुआ पता नहीं है।", "add": "पता जोड़ें", "save": "पता सहेजें", "remove": "हटाएँ", "saved": "पता सहेज लिया।", "removed": "पता हटा दिया।", "name": "पूरा नाम", "line1": "पता, पंक्ति 1", "line2": "पता, पंक्ति 2", "city": "शहर", "state": "राज्य", "pin": "पिन कोड", "phone": "मोबाइल नंबर", "defaultShipping": "इसे मेरा डिलीवरी पता बनाएँ", "invalid": "पता जाँचकर फिर कोशिश करें।" }, "wish": { "none": "आपका कोई सहेजा हुआ उत्पाद नहीं है।", "remove": "हटाएँ", "removed": "आपकी सूची से हटा दिया।", "view": "उत्पाद देखें" }, "rev": { "none": "आपने कोई समीक्षा नहीं लिखी है।", "awaiting": "जाँच की प्रतीक्षा में", "published": "प्रकाशित", "rejected": "प्रकाशित नहीं हुई", "verified": "खरीद की पुष्टि हुई", "rating": "5 में से {n} सितारे" }, "pref": { "marketing": "मुझे ऑफ़र और खबरें ईमेल से भेजें", "saved": "पसंद सहेज ली।", "languageLabel": "भाषा", "languageEn": "English", "languageHi": "हिन्दी", "languageSaved": "भाषा सहेज ली।", "on": "हाँ, भेजें", "off": "नहीं, न भेजें" }, "del": { "text": "खाता हटाने पर आपकी निजी जानकारी हट जाती है। कानून के अनुसार ऑर्डर आपकी जानकारी के बिना रखे जाते हैं। इसे वापस नहीं किया जा सकता।", "confirm": "मेरा खाता हटाएँ", "sure": "खाता हमेशा के लिए हटाएँ?", "done": "आपका हटाने का अनुरोध मिल गया। आप साइन आउट हो गए हैं।", "recent": "सुरक्षा के लिए दोबारा साइन इन करें, फिर खाता हटाएँ।", "failed": "खाता नहीं हट सका। फिर कोशिश करें।" }, "confirm": { "title": "ऑर्डर की पुष्टि", "thanks": "धन्यवाद। आपका ऑर्डर हो गया है।", "number": "आपका ऑर्डर नंबर {id} है।", "emailSent": "हमने विवरण {email} पर भेजा है।", "empty": "इस डिवाइस पर कोई हाल का ऑर्डर नहीं मिला।", "emptyHelp": "अगर आपने अतिथि के रूप में ऑर्डर किया था, तो ऑर्डर नंबर और ईमेल पते से उसे खोल सकते हैं।", "trackLink": "मेरा ऑर्डर खोजें", "continueShopping": "खरीदारी जारी रखें", "viewOrders": "मेरे ऑर्डर देखें", "createTitle": "ऑर्डर देखने के लिए खाता बनाएँ", "createText": "पासवर्ड चुनें। हम पुष्टि का ईमेल भेजते हैं, और पुष्टि के बाद इस ईमेल पते के ऑर्डर आपके खाते में जुड़ जाते हैं।", "createSubmit": "खाता बनाएँ", "createSent": "अपना ईमेल देखें और खाते की पुष्टि के लिए लिंक खोलें।", "createDone": "आपका खाता तैयार है।", "guestKept": "यह पेज आपका ऑर्डर केवल ब्राउज़र बंद होने तक रखता है। बाद में खोलने के लिए ऑर्डर नंबर और ईमेल पता सहेज लें।" }, "track": { "title": "अपना ऑर्डर ट्रैक करें", "intro": "अपना ऑर्डर नंबर और इस्तेमाल किया गया ईमेल पता लिखें। हम उस पते पर छह अंकों का कोड भेजते हैं।", "orderNumber": "ऑर्डर नंबर", "email": "ईमेल पता", "sendCode": "कोड भेजें", "codeSent": "अगर विवरण किसी ऑर्डर से मेल खाता है, तो हमने उस ईमेल पते पर कोड भेजा है। यह थोड़े समय के लिए मान्य है।", "code": "छह अंकों का कोड", "verify": "ऑर्डर खोलें", "change": "दूसरा विवरण लिखें", "checkNeeded": "आगे बढ़ने के लिए नीचे की जाँच पूरी करें।", "errNumber": "अपना ऑर्डर नंबर लिखें।", "errCode": "छह अंकों का कोड लिखें।", "errInvalidCode": "कोड सही नहीं है या समाप्त हो गया है। उसे जाँचें या नया कोड मँगवाएँ।", "errRate": "बहुत ज़्यादा प्रयास हुए। कुछ मिनट रुककर फिर कोशिश करें।", "errCaptcha": "जाँच पूरी नहीं हुई। फिर कोशिश करें।", "errNetwork": "स्टोर से संपर्क नहीं हो सका। कनेक्शन जाँचकर फिर कोशिश करें।", "errUnknown": "कुछ गड़बड़ हो गई। फिर कोशिश करें।" } };
const plp = { "title": "उत्पाद", "productCount": { "one": "{count} उत्पाद", "other": "{count} उत्पाद" }, "breadcrumbs": "ब्रेडक्रंब", "home": "होम", "sort": "क्रम", "sortFeatured": "चुनिंदा", "sortRelevance": "प्रासंगिकता", "sortNewest": "सबसे नए", "sortPriceAsc": "कीमत: कम से ज़्यादा", "sortPriceDesc": "कीमत: ज़्यादा से कम", "sortTitleAsc": "नाम: अ से ज्ञ", "rankingLink": "हम उत्पादों को कैसे क्रम देते हैं", "filters": "फ़िल्टर", "filtersApplied": "फ़िल्टर ({count})", "closeFilters": "फ़िल्टर बंद करें", "showResults": { "one": "{count} उत्पाद दिखाएं", "other": "{count} उत्पाद दिखाएं" }, "showResultsNone": "कोई उत्पाद मेल नहीं खाता", "applyLoading": "मिलान जांच रहे हैं...", "categories": "श्रेणी", "collections": "संग्रह", "tags": "टैग", "types": "प्रकार", "price": "कीमत", "priceMin": "न्यूनतम कीमत", "priceMax": "अधिकतम कीमत", "appliedFilters": "लगाए गए फ़िल्टर", "removeFilter": "फ़िल्टर {name} हटाएं", "clearAll": "सभी फ़िल्टर हटाएं", "from": "से", "save": "{percent} की छूट", "moreColours": "+{count}", "chooseOptions": "विकल्प चुनें", "addToCart": "कार्ट में जोड़ें", "quickView": "तुरंत देखें", "quickViewFor": "तुरंत देखें: {title}", "quickViewLabel": "तुरंत देखें", "viewFull": "पूरा विवरण देखें", "close": "बंद करें", "unavailable": "यह उत्पाद अब उपलब्ध नहीं है।", "showing": "{total} में से {shown} दिख रहे हैं", "loadMore": "{count} और दिखाएं", "loading": "उत्पाद लोड हो रहे हैं...", "loaded": "{total} में से {shown} उत्पाद दिख रहे हैं", "empty": "आपके फ़िल्टर से कोई उत्पाद मेल नहीं खाता।", "emptyHint": "ज़्यादा उत्पाद देखने के लिए कोई फ़िल्टर हटाएं।", "error": "उत्पाद लोड नहीं हो सके। अपना कनेक्शन जांचें और फिर कोशिश करें।", "retry": "फिर कोशिश करें", "priceOnRequest": "कीमत पूछने पर", "srCurrent": "मौजूदा कीमत {price}", "srPrior": "पिछली कीमत {price}", "badge": { "sale": "सेल", "new": "नया", "best_seller": "बेस्ट सेलर", "low_stock": "कुछ ही बचे", "free_delivery": "मुफ़्त डिलीवरी", "made_in_india": "भारत में बना" } };
const home$2 = { "title": "Plusmark", "description": "साफ़ कीमतों और डिलीवरी की तारीख़ों के साथ ख़रीदारी करें।", "heroFallbackTitle": "हमारे स्टोर में आपका स्वागत है", "heroFallbackAction": "सभी उत्पाद देखें", "eyebrow": "2015 से राइटिंग और डिस्प्ले सिस्टम", "heroTitle": "हर विचार को दिखने लायक बनाइए।", "heroBody": "अहमदाबाद में निर्मित प्रीमियम व्हाइटबोर्ड, चॉकबोर्ड और नोटिस बोर्ड, पूरे भारत में डिलीवरी के साथ। साफ कीमत, GST इनवॉइस और हर कमरे के लिए सही साइज।", "heroPrimary": "राइटिंग बोर्ड देखें", "heroSecondary": "थोक कोटेशन लें", "heroPoint1": "सीधे निर्माता से", "heroPoint2": "कस्टम साइज ऑर्डर पर", "heroPoint3": "हर ऑर्डर पर GST इनवॉइस", "heroCardKicker": "सबसे ज़्यादा ऑर्डर", "trustInvoice": "GST इनवॉइस", "trustDispatch": "पूरे भारत में डिस्पैच", "trustSince": "2015 से", "trustCod": "{amount} तक कैश ऑन डिलीवरी", "decisionTitle": "एक मिनट में सही बोर्ड चुनें", "decisionLead": "कैटलॉग से पहले कमरा सोचें। हर रेंज एक अलग ज़रूरत के लिए बनी है।", "decisionClassroom": "क्लासरूम", "decisionClassroomBody": "रोज़ की लिखाई, सफाई और लंबे पीरियड के लिए चॉक और सिरेमिक सतह।", "decisionOffice": "ऑफिस और मीटिंग रूम", "decisionOfficeBody": "प्लान, प्रेज़ेंटेशन और हर बदलती जानकारी के लिए मैग्नेटिक व्हाइटबोर्ड।", "decisionNotice": "नोटिस और डिस्प्ले", "decisionNoticeBody": "कॉर्क और फेल्ट पिन बोर्ड जो सूचनाएँ सामने रखें, क्लटर नहीं।", "decisionCta": "रेंज देखें", "benefitsTitle": "स्कूल और ऑफिस Plusmark क्यों चुनते हैं", "benefitsLead": "बोर्ड लंबे समय का खरीद है। तीन साल बाद अनुभव इन चार बातों से तय होता है।", "benefit1Title": "खुद बनाते हैं, बेचते नहीं", "benefit1Body": "पैनल, फ्रेम और फिनिशिंग हमारी अपनी यूनिट में होती है, इसलिए क्वालिटी और पार्ट्स हमारे नियंत्रण में रहते हैं।", "benefit2Title": "दीवार के हिसाब से साइज", "benefit2Body": "स्टैंडर्ड साइज जल्दी भेजते हैं। क्लासरूम, लैब और ट्रेनिंग रूम के लिए कस्टम साइज ऑर्डर पर कटते हैं।", "benefit3Title": "रोज़ के इस्तेमाल के लिए", "benefit3Body": "एनोडाइज़्ड एल्युमिनियम फ्रेम और नमी-रोधी बोर्ड जो भारतीय क्लासरूम और ऑफिस में टिकते हैं।", "benefit4Title": "एक इनवॉइस, पूरा सपोर्ट", "benefit4Body": "GST इनवॉइस, डिलीवरी ट्रैकिंग और इंस्टॉलेशन व रिपीट ऑर्डर के लिए सीधा संपर्क।", "spotlightKicker": "एडिटर की पसंद", "spotlightTitle": "वह बोर्ड जो खुद बिकता है", "spotlightBody": "मैटेलिक प्रीमियम रेंज में हाई-ग्लॉस मार्कर-ग्रेड सतह और एनोडाइज़्ड एल्युमिनियम फ्रेम है — वही फिनिश जो ऑफिस और स्कूल दोबारा मंगाते हैं।", "spotlightCta": "यह बोर्ड देखें", "proofTitle": "स्कूल, ऑफिस और ट्रेनिंग टीमों का भरोसा", "proofBody": "Plusmark बोर्ड क्लासरूम, मीटिंग रूम, कोचिंग सेंटर और संस्थानों के लिए चुने जाते हैं जहाँ हर साल वही फिनिश चाहिए।", "proofStat1": "2015 से", "proofStat1Label": "अहमदाबाद में बोर्ड निर्माण", "proofStat2": "पूरे भारत में", "proofStat2Label": "ट्रैकिंग के साथ डिस्पैच", "proofStat3": "GST", "proofStat3Label": "संस्थागत क्लेम के लिए इनवॉइस", "faqFallback1Q": "क्या कस्टम साइज के बोर्ड बनते हैं?", "faqFallback1A": "हाँ। जिन दीवारों और कमरों की माप स्टैंडर्ड नहीं है, उनके बोर्ड ऑर्डर पर काटे जाते हैं। चौड़ाई और ऊँचाई बताइए, हम नज़दीकी व्यावहारिक साइज का कोटेशन देंगे।", "faqFallback2Q": "स्कूल और ऑफिस को थोक में सप्लाई होती है?", "faqFallback2A": "हाँ। मात्रा और डिलीवरी पिन कोड भेजिए; GST इनवॉइस और ज़रूरत पर चरणबद्ध डिस्पैच के साथ थोक कोटेशन मिलेगा।", "faqFallback3Q": "बोर्ड की पैकिंग कैसे होती है?", "faqFallback3A": "बोर्ड किनारों की सुरक्षा वाले कार्टन में जाते हैं। बड़े साइज क्रेट में आते हैं और हर ऑर्डर के साथ ट्रैकिंग रेफरेंस मिलता है।", "newsletterTitle": "एक बेहतर बोर्ड, एक ईमेल में", "newsletterBody": "नई रेंज, साइज गाइड और संस्थागत ऑफर। रोज़ का शोर नहीं; एक क्लिक में अनसब्सक्राइब।", "railTitle": "हर कमरे के लिए एक बोर्ड", "railLead": "असली साइज, साफ कीमत और वही फिनिश जो खरीदार दोबारा मंगाते हैं।", "moreTitle": "रेंज से और भी", "categories": "श्रेणी के अनुसार ख़रीदें", "collections": "संग्रह", "bestSellers": "सबसे ज़्यादा बिकने वाले", "newArrivals": "नए उत्पाद", "rail": "उत्पाद", "viewAll": "सभी देखें", "offer": "ऑफ़र", "offerAction": "ऑफ़र देखें", "emptyTitle": "हमारे उत्पाद जल्द आ रहे हैं", "emptyBody": "अभी कैटलॉग ख़ाली है। कृपया थोड़ी देर बाद देखें।", "trust": "यहाँ से क्यों ख़रीदें", "trustFreeDelivery": "{amount} से ऊपर के ऑर्डर पर मुफ़्त डिलीवरी", "faq": "सवाल और जवाब", "brandStory": "हमारी कहानी", "newsletter": "जुड़े रहें", "newsletterEmail": "ईमेल पता", "newsletterAction": "सदस्यता लें", "newsletterNote": "मार्केटिंग ईमेल केवल तभी भेजे जाते हैं जब आप यहाँ सहमति दें। आप कभी भी सदस्यता छोड़ सकते हैं।", "reviews": "ग्राहक क्या कहते हैं", "recentLoaded": "हाल में देखे गए उत्पाद" };
const notFound = { "title": "पेज नहीं मिला", "message": "हमें वह पेज नहीं मिला। वह हट गया हो सकता है। खोजें या कोई श्रेणी चुनें।", "searchLabel": "उत्पाद खोजें", "searchButton": "खोजें", "browse": "श्रेणी के अनुसार खरीदें" };
const search = { "title": "खोज", "resultsFor": '"{query}" के नतीजे', "prompt": "खोज बॉक्स में लिखें कि आप क्या ढूँढ रहे हैं।", "noResults": '"{query}" के लिए कोई नतीजा नहीं', "noResultsHint": "वर्तनी जाँचें, कम शब्द आज़माएँ, या कोई श्रेणी देखें।", "browse": "श्रेणियाँ देखें", "bestSellers": "सबसे ज़्यादा बिकने वाले", "suggestions": "सुझाव", "products": "उत्पाद", "categories": "श्रेणियाँ", "recent": "हाल की खोजें", "clearRecent": "हाल की खोजें मिटाएँ", "seeAll": '"{query}" के सभी नतीजे देखें', "loading": "सुझाव लोड हो रहे हैं", "found": "{count} सुझाव", "none": "कोई सुझाव नहीं", "viewAll": "सभी {name}", "subcategories": "{name} की उप-श्रेणियाँ", "breadcrumbSearch": "खोज" };
const hi$2 = {
  a11y,
  landmarks,
  validation,
  language,
  consent,
  count: count$2,
  nav,
  footer,
  price,
  social,
  journey,
  countdown,
  delivery,
  legal,
  account,
  plp,
  home: home$2,
  notFound,
  search
};
const dictionaries = {
  en: en$2,
  hi: hi$2
};
const RTL_LOCALES = [];
function dir(locale) {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
function lookup(d2, key2) {
  let cur = d2;
  for (const part of key2.split(".")) {
    if (cur && typeof cur === "object" && Object.prototype.hasOwnProperty.call(cur, part)) {
      cur = cur[part];
    } else return void 0;
  }
  return cur;
}
const lookupString = (d2, key2) => {
  const v2 = lookup(d2, key2);
  return typeof v2 === "string" ? v2 : void 0;
};
function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m2, name2) => Object.prototype.hasOwnProperty.call(params, name2) ? String(params[name2]) : m2);
}
function t(locale, key2, params) {
  const text2 = lookupString(dictionaries[locale], key2) ?? lookupString(dictionaries.en, key2) ?? key2;
  return interpolate(text2, params);
}
function stripLocale(pathname) {
  const p2 = pathname.replace(/^\/hi(?=\/|$)/, "") || "/";
  return p2.length > 1 ? p2.replace(/\/+$/, "") : p2;
}
function localizePath(locale, path) {
  const p2 = stripLocale(path);
  if (locale === "en") return p2;
  return p2 === "/" ? "/hi" : `/hi${p2}`;
}
function otherLocale(locale) {
  return locale === "en" ? "hi" : "en";
}
function alternatePath(locale, pathname) {
  return localizePath(otherLocale(locale), pathname);
}
function currentNav(pathname) {
  const p2 = stripLocale(pathname);
  if (p2 === "/") return "home";
  if (p2 === "/search" || p2.startsWith("/search/")) return "search";
  if (p2 === "/cart") return "cart";
  if (p2 === "/account" || p2.startsWith("/account/")) return "account";
  return null;
}
const products = /* @__PURE__ */ JSON.parse(`[{"id":"prod_01M7WWSD0TS4D0VZTY7ZWZYGBP","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Acrylic Folder Display Board","width":null,"handle":"acrylic-folder-display-board","height":null,"images":[{"id":"img_01M81YFRCCJ8B8VXPFVAPEBCX3","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/acrylic-folder-display-board","rank":0},{"id":"img_01M81YFRCEP7F1VCBMRPHA1J71","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/acrylic-folder-display-board-2","rank":1},{"id":"img_01M81YFRCGHT7ETP00AXJS5W8A","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/acrylic-folder-display-board-3","rank":2}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSD10BDSZPK2S2H4VYEQ3","title":"Size","values":[{"id":"optval_01M7WWSD16EAS1111Y1A3HZCEK","value":"Standard size"},{"id":"optval_01M7WWSD1BG0VZFT0NKEFEQ596","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSD2BFQ54W7SCYBCR6MVK","sku":"ACRYLIC-FOLDER-DISPLAY-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":2920,"is_tax_inclusive":false,"calculated_amount":2920},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSD10BDSZPK2S2H4VYEQ3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSD34H72TCDTYXTENZA9E","sku":"ACRYLIC-FOLDER-DISPLAY-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":2920,"is_tax_inclusive":false,"calculated_amount":2920},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSD10BDSZPK2S2H4VYEQ3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/acrylic-folder-display-board","attributes":[{"key":"folders","value":"Transparent front folders"},{"key":"layout","value":"Folder size and quantity as per customer requirement"},{"key":"frame","value":"Strong aluminium frame suitable for industrial use"}],"categories":[{"id":"pcat_01M7WWS7QW5782C2Z9HF6PK6TT","name":"Specialty Display Boards","handle":"specialty-boards"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:37.922032+00:00","description":"The Acrylic Folder Display Board gives clear visibility through transparent front folders for easy document viewing. It is ideal for organised display of charts, reports, SOPs and production data, and papers can be inserted and replaced quickly. Folder size and quantity are made as per customer requirement, in a strong aluminium frame suitable for industrial use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSD2BFQ54W7SCYBCR6MVK":{"tiers":[],"amount":2920,"prior_price":null},"variant_01M7WWSD34H72TCDTYXTENZA9E":{"tiers":[],"amount":2920,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7Y6B2R7DTG4Y1DQWQBK8RY8","tags":[],"type":null,"title":"Checkout test - Crystal Clear Base Clipboard","width":null,"handle":"checkout-test-crystal-clear-base-clipboard","height":null,"images":[{"id":"img_01M7Y6B2VH9FF41G93Z3BK0GMB","url":"https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-clear-base-clipboard","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7Y6B2T419EGXC6X5NAK1D4D","title":"Size","values":[{"id":"optval_01M7Y6B2TKWSEE561J4Y1FQV5W","value":"Test unit"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7Y6B2WAY4JXZQ5Y6MQD6QKE","sku":"CHECKOUT-TEST-CRYSTAL-CLEAR-BASE-CLIPBOARD","price":{"currency_code":"inr","original_amount":1.12,"is_tax_inclusive":true,"calculated_amount":1.12},"title":"Test unit","options":[{"value":"Test unit","option_id":"opt_01M7Y6B2T419EGXC6X5NAK1D4D","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-clear-base-clipboard","attributes":[],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"}],"collection":null,"created_at":"2026-11-21T04:37:55.575721+00:00","updated_at":"2026-11-21T04:37:55.575721+00:00","description":"Razorpay test purchase. No physical item will ship.","is_giftcard":false,"declarations":{},"discountable":false,"key_highlights":[],"origin_country":null,"variant_prices":{"variant_01M7Y6B2WAY4JXZQ5Y6MQD6QKE":{"tiers":[],"amount":1.12,"prior_price":null}},"best_seller_rank":1},{"id":"prod_01M7Y6B2YWQXM6KZP83KXPMKQ4","tags":[],"type":null,"title":"Checkout test - Crystal Colour Base Clipboard","width":null,"handle":"checkout-test-crystal-colour-base-clipboard","height":null,"images":[{"id":"img_01M7Y6B2ZC67APN4XCY3CKBVEA","url":"https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-colour-base-clipboard","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7Y6B2Z0ASDFKJ0S75KSH6ST","title":"Size","values":[{"id":"optval_01M7Y6B2Z473NVFCVXYJKKEEKQ","value":"Test unit"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7Y6B2ZMXYQ1RW1ZE1ZMPKXP","sku":"CHECKOUT-TEST-CRYSTAL-COLOUR-BASE-CLIPBOARD","price":{"currency_code":"inr","original_amount":1.12,"is_tax_inclusive":true,"calculated_amount":1.12},"title":"Test unit","options":[{"value":"Test unit","option_id":"opt_01M7Y6B2Z0ASDFKJ0S75KSH6ST","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/drt0rpkn2/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-colour-base-clipboard","attributes":[],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"}],"collection":null,"created_at":"2026-11-21T04:37:55.575721+00:00","updated_at":"2026-11-21T04:37:55.575721+00:00","description":"Razorpay test purchase. No physical item will ship.","is_giftcard":false,"declarations":{},"discountable":false,"key_highlights":[],"origin_country":null,"variant_prices":{"variant_01M7Y6B2ZMXYQ1RW1ZE1ZMPKXP":{"tiers":[],"amount":1.12,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSDPVXK4YXM8F8Y9S75JR","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Combination Board","width":null,"handle":"combination-board","height":null,"images":[{"id":"img_01M81YFVX282VGQYV917M9AQMS","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/combination-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSDQ1RRDRK5HWGVF4XA9C","title":"Size","values":[{"id":"optval_01M7WWSDQ91S3N8SYPCEWVEM4X","value":"Standard size"},{"id":"optval_01M7WWSDQDDC2GSJNKD0BSPA08","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSDRG3DSH44YYQM08V5PW","sku":"COMBINATION-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSDQ1RRDRK5HWGVF4XA9C","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDSB7F9JBMXF80T03126","sku":"COMBINATION-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSDQ1RRDRK5HWGVF4XA9C","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/combination-board","attributes":[{"key":"surface","value":"Dry wipe white board on one side and fabric notice board on the other"},{"key":"functionality","value":"Writing with markers plus pin-up display in a single board"},{"key":"customization","value":"Allows frequent pinning and removal without surface damage or loss of grip"},{"key":"performance","value":"Smooth marker writing with easy erase and durable fabric surface for repeated pin use"},{"key":"durability","value":"Long-lasting surface performance for regular notice display use"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:41.531986+00:00","description":"The Combination Board has a dry wipe white board on one side and a fabric notice board on the other, combining writing with markers and pin-up display in a single board. It offers smooth marker writing with easy erase, and a durable fabric surface for repeated pin use with long-lasting surface performance.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSDRG3DSH44YYQM08V5PW":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSDSB7F9JBMXF80T03126":{"tiers":[],"amount":2580,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCTG7DKJ7B9E42BJPTAH","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Cork Notice Board","width":null,"handle":"cork-notice-board","height":null,"images":[{"id":"img_01M81YFQ7EVCYDDBDBSK7PSCS0","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/cork-notice-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCTP4678SNR5ZJGEFTPE","title":"Size","values":[{"id":"optval_01M7WWSCTWTFXY940ZJESE497Z","value":"Standard size"},{"id":"optval_01M7WWSCV0VEV0W9X1NSY1H182","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCW269TTS9QE177E821X","sku":"CORK-NOTICE-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":3070,"is_tax_inclusive":false,"calculated_amount":3070},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCTP4678SNR5ZJGEFTPE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCWWYSZ17AFDDXSMG563","sku":"CORK-NOTICE-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":3070,"is_tax_inclusive":false,"calculated_amount":3070},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCTP4678SNR5ZJGEFTPE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/cork-notice-board","attributes":[{"key":"surface","value":"High-quality natural cork surface suitable for repeated pin use"},{"key":"core","value":"Soft and resilient base material designed specially for smooth pin insertion and firm holding"},{"key":"performance","value":"Allows frequent pinning and removal without surface damage or loss of grip"},{"key":"finish","value":"Uniform cork texture with a neat and professional appearance"},{"key":"durability","value":"Long-lasting surface performance for regular notice display use"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"},{"id":"pcat_01M7WWS7QH8BPCS17YKQDTRBN8","name":"Pin-Up Boards","handle":"notice-boards-pin-up"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:36.742193+00:00","description":"The Cork Notice Board has a high-quality natural cork surface suitable for repeated pin use. Its soft and resilient base material is designed specially for smooth pin insertion and firm holding, allowing frequent pinning and removal without surface damage or loss of grip. A uniform cork texture gives a neat, professional appearance with long-lasting surface performance.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCW269TTS9QE177E821X":{"tiers":[],"amount":3070,"prior_price":null},"variant_01M7WWSCWWYSZ17AFDDXSMG563":{"tiers":[],"amount":3070,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCHCAH9CAZTSFFNCDJ5H","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Crystal Clear Base Clipboard","width":null,"handle":"crystal-clear-base-clipboard","height":null,"images":[{"id":"img_01M81YFNKS1G47BKMZC7XB2B3T","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-clear-base-clipboard","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCHHV9GKJ0D4M3622BM1","title":"Size","values":[{"id":"optval_01M7WWSCHRXWVCKT4YM1BY3Q61","value":"Standard size"},{"id":"optval_01M7WWSCHW0K79PM41DPZ85FHW","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCJWS50EPZ9R2PMPT0Q6","sku":"CRYSTAL-CLEAR-BASE-CLIPBOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":490,"is_tax_inclusive":false,"calculated_amount":490},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCHHV9GKJ0D4M3622BM1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCKNBZ0SVC0TB1N7AKQZ","sku":"CRYSTAL-CLEAR-BASE-CLIPBOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":490,"is_tax_inclusive":false,"calculated_amount":490},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCHHV9GKJ0D4M3622BM1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-clear-base-clipboard","attributes":[{"key":"base","value":"Crystal Clear Base — Glass-Like Clarity with Modern Appeal"},{"key":"clip","value":"Chrome Electroplated Clip — Rust-Resistant Finish"},{"key":"rivets","value":"Dual-Side Cap Rivets — Uniform Look on Both Sides"}],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"},{"id":"pcat_01M7WWS7RSW0ATVM0VCHZAPB88","name":"Acrylic Base","handle":"clipboards-acrylic"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:35.089745+00:00","description":"Crystal clear base with glass-like clarity and modern appeal, Chrome Electroplated Clip and Dual-Side Cap Rivets for a uniform look on both sides.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCJWS50EPZ9R2PMPT0Q6":{"tiers":[],"amount":490,"prior_price":null},"variant_01M7WWSCKNBZ0SVC0TB1N7AKQZ":{"tiers":[],"amount":490,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCMDDMGHP77BGS1KVWXN","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Crystal Colour Base Clipboard","width":null,"handle":"crystal-colour-base-clipboard","height":null,"images":[{"id":"img_01M81YFP5MK363P5BKQB2DSNXR","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-colour-base-clipboard","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCMJNDNFBXB859V5ZGSZ","title":"Size","values":[{"id":"optval_01M7WWSCMS08BGBS95CBMF1X75","value":"Standard size"},{"id":"optval_01M7WWSCMXE2YVW73NVK4HAAAR","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCNX624BT2JQB6WNS2Z1","sku":"CRYSTAL-COLOUR-BASE-CLIPBOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":390,"is_tax_inclusive":false,"calculated_amount":390},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCMJNDNFBXB859V5ZGSZ","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCPPFJQXQ45E6V040GZ1","sku":"CRYSTAL-COLOUR-BASE-CLIPBOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":390,"is_tax_inclusive":false,"calculated_amount":390},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCMJNDNFBXB859V5ZGSZ","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/crystal-colour-base-clipboard","attributes":[{"key":"base","value":"Crystal-Tint Acrylic Base — Modern Transparent Colour with Elegant Appeal"},{"key":"edge","value":"Rounded Edge — Soft Rounded Corners for Safety & Comfort"},{"key":"clip","value":"Chrome Electroplated Clip — Anti-Rust Protection"},{"key":"rivets","value":"Dual-Cap Rivet System — Balanced & Neat Appearance"}],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"},{"id":"pcat_01M7WWS7RSW0ATVM0VCHZAPB88","name":"Acrylic Base","handle":"clipboards-acrylic"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:35.662257+00:00","description":"Crystal-tint acrylic base in a modern transparent colour with elegant appeal, soft rounded corners and an anti-rust Chrome Electroplated Clip.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCNX624BT2JQB6WNS2Z1":{"tiers":[],"amount":390,"prior_price":null},"variant_01M7WWSCPPFJQXQ45E6V040GZ1":{"tiers":[],"amount":390,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSBSFZ8DAE5E0P5QDQGVA","tags":[{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Deluxe 45 mm ADC Notice Board (Double Door)","width":null,"handle":"deluxe-45mm-adc-notice-board-double-door","height":null,"images":[{"id":"img_01M81YFK0WW0EW4NAX2999PCA2","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-45mm-adc-notice-board-double-door","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSBSMQ27EJ8S94XX1G24S","title":"Size","values":[{"id":"optval_01M7WWSBST8A40CQMMB80FQRWT","value":"3 x 4 ft"},{"id":"optval_01M7WWSBSYZV3FGZV338MZPY6T","value":"4 x 4 ft"},{"id":"optval_01M7WWSBT2V8BNJXV2A8TJFPSY","value":"5 x 4 ft"},{"id":"optval_01M7WWSBT61HPHTPH1JG0SFH0C","value":"6 x 4 ft"},{"id":"optval_01M7WWSBTAR4S9YSJE3TS6T8GP","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSBVA98T32071FRB0X16F","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-DOUBLE-DOOR-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSBSMQ27EJ8S94XX1G24S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBW38AAE84GFWT1Q4Q9P","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-DOUBLE-DOOR-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSBSMQ27EJ8S94XX1G24S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBWVKNGRG50NZ52S359J","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-DOUBLE-DOOR-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSBSMQ27EJ8S94XX1G24S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBXKS4872581DXK5CQNB","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-DOUBLE-DOOR-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSBSMQ27EJ8S94XX1G24S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBYB8QP7FJ3W4KRJ6V9N","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-DOUBLE-DOOR-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSBSMQ27EJ8S94XX1G24S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-45mm-adc-notice-board-double-door","attributes":[{"key":"type","value":"Acrylic Door Covered Notice Board (Double Door Design)"},{"key":"framing","value":"Deluxe 45 mm Triple Aluminium Framing for added strength and premium appearance"},{"key":"cover","value":"Transparent acrylic door cover to protect notices from dust and handling"},{"key":"locking","value":"Secure double-door system suitable for controlled notice display"}],"categories":[{"id":"pcat_01M7WWS7QRTQYCMEC0KPPBK0BD","name":"Acrylic Door Cover Notice Boards","handle":"acrylic-door-cover-notice-boards"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:32.436584+00:00","description":"The Deluxe 45 mm Acrylic Door Cover (ADC) Notice Board (Double Door) is a notice board with a double-door acrylic cover. Deluxe 45 mm Triple Aluminium Framing adds strength and a premium appearance, while the transparent acrylic door cover protects notices from dust and handling. A secure double-door system is suitable for controlled notice display.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSBVA98T32071FRB0X16F":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSBW38AAE84GFWT1Q4Q9P":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSBWVKNGRG50NZ52S359J":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSBXKS4872581DXK5CQNB":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSBYB8QP7FJ3W4KRJ6V9N":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSDT50A71RBSE3AZW2HSM","tags":[{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Deluxe 45 mm ADC Notice Board (Single Door)","width":null,"handle":"deluxe-45mm-adc-notice-board-single-door","height":null,"images":[{"id":"img_01M81YFWED5HJ8F480YF5NRX2R","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-45mm-adc-notice-board-single-door","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSDTBR2NM6H7S3EDH9WX9","title":"Size","values":[{"id":"optval_01M7WWSDTJF0T3S36TH8RY7VP0","value":"3 x 4 ft"},{"id":"optval_01M7WWSDTQ1WSW66YHS0C50YA8","value":"4 x 4 ft"},{"id":"optval_01M7WWSDTVS4THNJDKPYPKFVQN","value":"5 x 4 ft"},{"id":"optval_01M7WWSDV0RNYRG50G17C031CV","value":"6 x 4 ft"},{"id":"optval_01M7WWSDV4XZTKS4EJ5VN5Q5Y7","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSDWAJ72MYQM48ATSWSH8","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-SINGLE-DOOR-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSDTBR2NM6H7S3EDH9WX9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDX820WNBXS2XB564MAT","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-SINGLE-DOOR-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSDTBR2NM6H7S3EDH9WX9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDY4VBWERXTRMHV8HFEP","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-SINGLE-DOOR-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSDTBR2NM6H7S3EDH9WX9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDYZMB54Z0KKC351PTH6","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-SINGLE-DOOR-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSDTBR2NM6H7S3EDH9WX9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDZVPDA8CVF0YQV2EWN0","sku":"DELUXE-45MM-ADC-NOTICE-BOARD-SINGLE-DOOR-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSDTBR2NM6H7S3EDH9WX9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-45mm-adc-notice-board-single-door","attributes":[{"key":"type","value":"Acrylic door covered notice board with single door design"},{"key":"framing","value":"Deluxe 45 mm triple aluminium framing for strength, stability, and long-term durability"},{"key":"cover","value":"Transparent acrylic door cover to protect displayed notices from dust, moisture, and handling"},{"key":"locking","value":"Secure single-door locking system for controlled and safe notice display"},{"key":"performance","value":"Smooth door operation with clear visibility of notices"},{"key":"finish","value":"Neat and professional finish suitable for regular indoor use"}],"categories":[{"id":"pcat_01M7WWS7QRTQYCMEC0KPPBK0BD","name":"Acrylic Door Cover Notice Boards","handle":"acrylic-door-cover-notice-boards"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:42.087144+00:00","description":"The Deluxe 45 mm Acrylic Door Cover (ADC) Notice Board (Single Door) is a notice board with a single-door acrylic cover. Deluxe 45 mm triple aluminium framing provides strength, stability and long-term durability. The transparent acrylic door cover protects displayed notices from dust, moisture and handling, with a secure single-door locking system, smooth door operation and clear visibility of notices.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSDWAJ72MYQM48ATSWSH8":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSDX820WNBXS2XB564MAT":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSDY4VBWERXTRMHV8HFEP":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSDYZMB54Z0KKC351PTH6":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSDZVPDA8CVF0YQV2EWN0":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSB8HGPGK2PKSTFG8KNXR","tags":[{"id":"ptag_01M7WWS8DBA7FX4Y24BNA2ST3D","value":"ceramic"},{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Deluxe Standard Ceramic Board","width":null,"handle":"deluxe-standard-ceramic-board","height":null,"images":[{"id":"img_01M81YFHBE1XXX8S5QZSXBMZVF","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-ceramic-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSB8PY3X52FVKD02C5W5Z","title":"Size","values":[{"id":"optval_01M7WWSB8W0KBY4WJBQV2DG981","value":"3 x 4 ft"},{"id":"optval_01M7WWSB90R3A64Z8N59011HK9","value":"4 x 4 ft"},{"id":"optval_01M7WWSB944VAVHC0TSNV16VSQ","value":"5 x 4 ft"},{"id":"optval_01M7WWSB981CEG32HD93FAQQ8R","value":"6 x 4 ft"},{"id":"optval_01M7WWSB9C48ZPFS2HMN0SHQX5","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSBACKB7GVH0GKK2YFQ1Z","sku":"DELUXE-STANDARD-CERAMIC-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSB8PY3X52FVKD02C5W5Z","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBB4M817PRQE5PPS73JW","sku":"DELUXE-STANDARD-CERAMIC-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSB8PY3X52FVKD02C5W5Z","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBBV432WNV2MFN90RPAT","sku":"DELUXE-STANDARD-CERAMIC-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSB8PY3X52FVKD02C5W5Z","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBCMQ8FER3SNR59H49H4","sku":"DELUXE-STANDARD-CERAMIC-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSB8PY3X52FVKD02C5W5Z","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBDBGJ8SP91Z1W0MKE8J","sku":"DELUXE-STANDARD-CERAMIC-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSB8PY3X52FVKD02C5W5Z","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-ceramic-board","attributes":[{"key":"type","value":"Ceramic Steel Magnetic Board"},{"key":"surface","value":"Ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options"},{"key":"product_life","value":"Designed for very long product life under regular institutional use"},{"key":"performance","value":"Hard, non-porous surface suitable for continuous writing and frequent cleaning"},{"key":"finish","value":"Smooth writing surface with consistent performance over time"},{"key":"maintenance","value":"Easy to clean and maintain for daily classroom use"},{"key":"design","value":"Aluminium frame with Electroplated Chrome Corners"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PNZ5KK0DQ412K4TZAK","name":"Ceramic White Boards","handle":"white-boards-ceramic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:30.727703+00:00","description":"The Deluxe Standard Ceramic Board has a ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options, designed for very long product life under regular institutional use. The hard, non-porous surface is suitable for continuous writing and is easy to clean and maintain. Aluminium frame with Electroplated Chrome Corners.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSBACKB7GVH0GKK2YFQ1Z":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSBB4M817PRQE5PPS73JW":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSBBV432WNV2MFN90RPAT":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSBCMQ8FER3SNR59H49H4":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSBDBGJ8SP91Z1W0MKE8J":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSBE2VH07P3MQB0MP1YRY","tags":[{"id":"ptag_01M7WWS8DBA7FX4Y24BNA2ST3D","value":"ceramic"},{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"}],"type":null,"title":"Deluxe Standard Ceramic Chalk Board","width":null,"handle":"deluxe-standard-ceramic-chalk-board","height":null,"images":[],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSBE848653DF7PDZ9PYZ1","title":"Size","values":[{"id":"optval_01M7WWSBEDCTWSV8T3FXES8FAJ","value":"3 x 4 ft"},{"id":"optval_01M7WWSBEHK31FM337N8CBEXV4","value":"4 x 4 ft"},{"id":"optval_01M7WWSBENEP8FQ1NPS2XK29GQ","value":"5 x 4 ft"},{"id":"optval_01M7WWSBES23WRFQWRPG2FRB4R","value":"6 x 4 ft"},{"id":"optval_01M7WWSBEXNZ1SGQQZ0PA85K87","value":"8 x 4 ft"}]}],"material":"Aluminium frame","metadata":{},"pairings":{},"subtitle":"Ceramic steel green chalk surface; accepts magnets","variants":[{"id":"variant_01M7WWSBFY0193R1JPB59YVFRK","sku":"DELUXE-STANDARD-CERAMIC-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSBE848653DF7PDZ9PYZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBGPC79J4HC8KERHDANE","sku":"DELUXE-STANDARD-CERAMIC-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSBE848653DF7PDZ9PYZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBHEFMAYZZJM5B4349BP","sku":"DELUXE-STANDARD-CERAMIC-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSBE848653DF7PDZ9PYZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBJ6AXZPTFPF2RV3EHR4","sku":"DELUXE-STANDARD-CERAMIC-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSBE848653DF7PDZ9PYZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBJZ467M291SMBQT51BT","sku":"DELUXE-STANDARD-CERAMIC-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSBE848653DF7PDZ9PYZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":null,"attributes":[{"key":"type","value":"Ceramic Steel Magnetic Chalk Board"},{"key":"surface","value":"Ceramic steel green chalk surface; accepts magnets"},{"key":"product_life","value":"Designed for very long product life under regular institutional use"},{"key":"design","value":"Aluminium frame with Electroplated Chrome Corners"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7Q6DQE5CV93E16K4NRY","name":"Ceramic Chalk Boards","handle":"chalk-boards-ceramic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:31.258328+00:00","description":"The Deluxe Standard Ceramic Chalk Board combines a porcelain enamel / ceramic steel green chalk surface that accepts magnets with an aluminium frame and Electroplated Chrome Corners. Ideal for colleges and institutions requiring long surface life with standard framing.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSBFY0193R1JPB59YVFRK":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSBGPC79J4HC8KERHDANE":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSBHEFMAYZZJM5B4349BP":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSBJ6AXZPTFPF2RV3EHR4":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSBJZ467M291SMBQT51BT":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSARQJQPCXM4596THQW7Z","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Deluxe Standard Chalk Board","width":null,"handle":"deluxe-standard-chalk-board","height":null,"images":[{"id":"img_01M81YFFT9A41715PM1ZBJYWFH","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-chalk-board-correct","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSARWCGV9KFXH9AAEC258","title":"Size","values":[{"id":"optval_01M7WWSAS2HVK5MDJMEJ60KPA5","value":"3 x 4 ft"},{"id":"optval_01M7WWSAS5T2EBKP0ZGA6YM8FZ","value":"4 x 4 ft"},{"id":"optval_01M7WWSAS96YNBJ7TV8Y9JYZ54","value":"5 x 4 ft"},{"id":"optval_01M7WWSASC5F1PPMH7H65HMVRZ","value":"6 x 4 ft"},{"id":"optval_01M7WWSASGCRPRCAPC0SNNM7AD","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSATCC6QQKW1R3KWXRQB9","sku":"DELUXE-STANDARD-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSARWCGV9KFXH9AAEC258","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAV3GB6Z1PHWVS607464","sku":"DELUXE-STANDARD-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSARWCGV9KFXH9AAEC258","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAVTFJVD277ACP6Z6NFB","sku":"DELUXE-STANDARD-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSARWCGV9KFXH9AAEC258","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAWHWZ38BZ0BXY236K4G","sku":"DELUXE-STANDARD-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSARWCGV9KFXH9AAEC258","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAX7HR0D44FJY7QCVEMH","sku":"DELUXE-STANDARD-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSARWCGV9KFXH9AAEC258","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-chalk-board-correct","attributes":[{"key":"type","value":"Non-Magnetic Chalk Board"},{"key":"material","value":"Regular quality materials with balanced performance"},{"key":"design","value":"Electroplated Chrome Corners for a clean finish"},{"key":"surface","value":"Chalk Grade HPL Sheet; non-reflective, glare-free, with clear visibility from all angles"},{"key":"durability","value":"Durable and dependable for everyday use"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7PXMEEH6PBRZAHQ0W2N","name":"Non-Magnetic Chalk Boards","handle":"chalk-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:29.153139+00:00","description":"The Deluxe Standard Chalk Board uses regular quality materials with balanced performance and Electroplated Chrome Corners for a clean finish. The Chalk Grade HPL Sheet is non-reflective and glare-free, with clear visibility from all angles. Durable and dependable for everyday use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSATCC6QQKW1R3KWXRQB9":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSAV3GB6Z1PHWVS607464":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSAVTFJVD277ACP6Z6NFB":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSAWHWZ38BZ0BXY236K4G":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSAX7HR0D44FJY7QCVEMH":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSAXY0KSBAAJV7756R8TB","tags":[{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"}],"type":null,"title":"Deluxe Standard Magnetic Board","width":null,"handle":"deluxe-standard-magnetic-board","height":null,"images":[{"id":"img_01M81YFG9S1C3P154EZJSGBT63","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-magnetic-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSAY3T65HTY5TYFXAN310","title":"Size","values":[{"id":"optval_01M7WWSAY9NZHERJKYBMJDCMQW","value":"3 x 4 ft"},{"id":"optval_01M7WWSAYC2K3QVSMRM1KPC31J","value":"4 x 4 ft"},{"id":"optval_01M7WWSAYG60096PNVMH9F9TZH","value":"5 x 4 ft"},{"id":"optval_01M7WWSAYKRJSAHTHQ50F6TWZB","value":"6 x 4 ft"},{"id":"optval_01M7WWSAYQ99GNKXW6NDVCCWMN","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSAZMFGJSQQJGQCBXSNDT","sku":"DELUXE-STANDARD-MAGNETIC-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSAY3T65HTY5TYFXAN310","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB0B2JN9N0E2HYG10MF6","sku":"DELUXE-STANDARD-MAGNETIC-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSAY3T65HTY5TYFXAN310","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB1298EJ9NGE05DF6V6E","sku":"DELUXE-STANDARD-MAGNETIC-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSAY3T65HTY5TYFXAN310","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB1S84NC66Z220P8KDVB","sku":"DELUXE-STANDARD-MAGNETIC-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSAY3T65HTY5TYFXAN310","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB2F1Z6SQDZYA738S0CF","sku":"DELUXE-STANDARD-MAGNETIC-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSAY3T65HTY5TYFXAN310","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-magnetic-board","attributes":[{"key":"type","value":"Resin Coated Steel Magnetic Board"},{"key":"surface","value":"Resin coated writing surface available in white and green options"},{"key":"magnetic_use","value":"Suitable for standard magnetic accessories"},{"key":"design","value":"Aluminium frame with Electroplated Chrome Corners"},{"key":"finish","value":"Smooth surface suitable for daily classroom or office writing"},{"key":"build","value":"Balanced construction for regular use"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PHP0Y7RH2Y21PXANWK","name":"Magnetic White Boards","handle":"white-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:29.649217+00:00","description":"The Deluxe Standard Magnetic Board accepts magnets and has a resin coated writing surface available in white and green options, suitable for standard magnetic accessories. An aluminium frame with Electroplated Chrome Corners and balanced construction make it suitable for daily classroom or office writing.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSAZMFGJSQQJGQCBXSNDT":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSB0B2JN9N0E2HYG10MF6":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSB1298EJ9NGE05DF6V6E":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSB1S84NC66Z220P8KDVB":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSB2F1Z6SQDZYA738S0CF":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSB36HHFMJ4Z0RQEHKDP7","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"}],"type":null,"title":"Deluxe Standard Magnetic Chalk Board","width":null,"handle":"deluxe-standard-magnetic-chalk-board","height":null,"images":[{"id":"img_01M81YFGSY1M9GMD09S6W19CBH","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-magnetic-chalk-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSB3BAD08SVKK82H6Q03Y","title":"Size","values":[{"id":"optval_01M7WWSB3GTPFGD1K248PCSTGH","value":"3 x 4 ft"},{"id":"optval_01M7WWSB3MST0Y1PD9FZ5494ZS","value":"4 x 4 ft"},{"id":"optval_01M7WWSB3RR785QTXPRBBMJXF8","value":"5 x 4 ft"},{"id":"optval_01M7WWSB3V7FE4E7FT3JRDP28V","value":"6 x 4 ft"},{"id":"optval_01M7WWSB3ZS0S16Z8ZN9ZWF5SW","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSB4WRM9C23F44KZSK5PR","sku":"DELUXE-STANDARD-MAGNETIC-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSB3BAD08SVKK82H6Q03Y","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB5KZVZY4MM7YF3CEACR","sku":"DELUXE-STANDARD-MAGNETIC-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSB3BAD08SVKK82H6Q03Y","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB6BMFMM3BFDZA5X21ZQ","sku":"DELUXE-STANDARD-MAGNETIC-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSB3BAD08SVKK82H6Q03Y","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB73GKQSW3SQEXQCKKS5","sku":"DELUXE-STANDARD-MAGNETIC-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSB3BAD08SVKK82H6Q03Y","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSB7TENBRXYSHXNZSDAZR","sku":"DELUXE-STANDARD-MAGNETIC-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSB3BAD08SVKK82H6Q03Y","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-magnetic-chalk-board","attributes":[{"key":"type","value":"Resin Coated Steel Magnetic Chalk Board"},{"key":"surface","value":"Resin coated green chalk writing surface; accepts magnets"},{"key":"magnetic_use","value":"Suitable for standard magnetic accessories"},{"key":"design","value":"Aluminium frame with Electroplated Chrome Corners"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7Q2B6W1HSYG9XKR3MC8","name":"Magnetic Chalk Boards","handle":"chalk-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:30.167309+00:00","description":"The Deluxe Standard Magnetic Chalk Board accepts magnets and has a resin coated green chalk writing surface suitable for standard magnetic accessories. An aluminium frame with Electroplated Chrome Corners and balanced construction make it dependable for daily school and coaching use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSB4WRM9C23F44KZSK5PR":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSB5KZVZY4MM7YF3CEACR":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSB6BMFMM3BFDZA5X21ZQ":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSB73GKQSW3SQEXQCKKS5":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSB7TENBRXYSHXNZSDAZR":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSBKQQ16YDPPVA31TPRHS","tags":[{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Deluxe Standard Notice Board","width":null,"handle":"deluxe-standard-notice-board","height":null,"images":[{"id":"img_01M81YFJCRTP4J2YZMYCKSKW4N","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-notice-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSBKXJQXAQ4A0BCBS8Q3K","title":"Size","values":[{"id":"optval_01M7WWSBM31EPX1P5B0BDDSE10","value":"3 x 4 ft"},{"id":"optval_01M7WWSBM7Z8B6P3KFRN9TZ1PR","value":"4 x 4 ft"},{"id":"optval_01M7WWSBMB2E3M5XCB846FAWCP","value":"5 x 4 ft"},{"id":"optval_01M7WWSBMFVTWAVXY1H5VEDR0J","value":"6 x 4 ft"},{"id":"optval_01M7WWSBMKS62AZ487T70FYAJQ","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSBNNDQMD3RPV1WA51PDS","sku":"DELUXE-STANDARD-NOTICE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSBKXJQXAQ4A0BCBS8Q3K","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBPDFE59XSRCGBA8SVHV","sku":"DELUXE-STANDARD-NOTICE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSBKXJQXAQ4A0BCBS8Q3K","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBQ6HZB49FGTY6CJH2GN","sku":"DELUXE-STANDARD-NOTICE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSBKXJQXAQ4A0BCBS8Q3K","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBQYNCSKD5W5SZG25SMF","sku":"DELUXE-STANDARD-NOTICE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSBKXJQXAQ4A0BCBS8Q3K","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSBRQ9MD6F6RXWQEJT09M","sku":"DELUXE-STANDARD-NOTICE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSBKXJQXAQ4A0BCBS8Q3K","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-notice-board","attributes":[{"key":"material","value":"Standard quality materials with Electroplated Chrome Corners"},{"key":"surface","value":"Super Fine Velvet Cloth for everyday pin usage"},{"key":"core","value":"Soft core suitable for normal pin use"},{"key":"durability","value":"Reliable for daily use"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"},{"id":"pcat_01M7WWS7QH8BPCS17YKQDTRBN8","name":"Pin-Up Boards","handle":"notice-boards-pin-up"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:31.792659+00:00","description":"The Deluxe Standard Notice Board is made from standard quality materials with Electroplated Chrome Corners. Its Super Fine Velvet Cloth surface is made for everyday pin usage over a soft core suitable for normal pin use. Reliable for daily use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSBNNDQMD3RPV1WA51PDS":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSBPDFE59XSRCGBA8SVHV":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSBQ6HZB49FGTY6CJH2GN":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSBQYNCSKD5W5SZG25SMF":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSBRQ9MD6F6RXWQEJT09M":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSAKJA799TTN232AXNKKX","tags":[{"id":"ptag_01M7WWSAMEAKRS46F0RTWQ3GGM","value":"deluxe-standard"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Deluxe Standard White Board","width":null,"handle":"deluxe-standard-white-board","height":null,"images":[{"id":"img_01M81YFF8M0W6PBRNMXMP19WV3","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-white-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSAKQK5B1F50QMS9ADJ94","title":"Size","values":[{"id":"optval_01M7WWSAKWXZ8MNWC8XHM4JRBH","value":"3 x 4 ft"},{"id":"optval_01M7WWSAM082GFPEFS9F6AAJAC","value":"4 x 4 ft"},{"id":"optval_01M7WWSAM37D58A24DJCFKYZJZ","value":"5 x 4 ft"},{"id":"optval_01M7WWSAM78TZF90XQP76R9ZG0","value":"6 x 4 ft"},{"id":"optval_01M7WWSAMAW2T7C2ABKGC9G397","value":"8 x 4 ft"}]}],"material":"Deluxe anodized aluminium frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSAN9AXV0YRCJGRFWXZW6","sku":"DELUXE-STANDARD-WHITE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2580,"is_tax_inclusive":false,"calculated_amount":2580},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSAKQK5B1F50QMS9ADJ94","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSANYR8MMA8AVQKH39EB0","sku":"DELUXE-STANDARD-WHITE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3240,"is_tax_inclusive":false,"calculated_amount":3240},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSAKQK5B1F50QMS9ADJ94","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAPM2MKY0FFCD8TR9V3M","sku":"DELUXE-STANDARD-WHITE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSAKQK5B1F50QMS9ADJ94","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAQA53MEYPT9C13X884X","sku":"DELUXE-STANDARD-WHITE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":4560,"is_tax_inclusive":false,"calculated_amount":4560},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSAKQK5B1F50QMS9ADJ94","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAR18XX6931MBY7KCHT6","sku":"DELUXE-STANDARD-WHITE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":5880,"is_tax_inclusive":false,"calculated_amount":5880},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSAKQK5B1F50QMS9ADJ94","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/deluxe-standard-white-board","attributes":[{"key":"type","value":"Non-Magnetic White Board"},{"key":"material","value":"Regular quality materials"},{"key":"design","value":"Electroplated Chrome Corners for a clean and professional look"},{"key":"surface","value":"High Gloss Melamine Writing Surface, smooth and easy to clean"},{"key":"durability","value":"Dependable for regular use"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PBSRT0KQDQ4636CJFS","name":"Non-Magnetic White Boards","handle":"white-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:28.588369+00:00","description":"The Deluxe Standard White Board is made from regular quality materials, with Electroplated Chrome Corners for a clean and professional look. Its High Gloss Melamine Writing Surface is smooth and easy to clean, and the board is dependable for regular use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSAN9AXV0YRCJGRFWXZW6":{"tiers":[],"amount":2580,"prior_price":null},"variant_01M7WWSANYR8MMA8AVQKH39EB0":{"tiers":[],"amount":3240,"prior_price":null},"variant_01M7WWSAPM2MKY0FFCD8TR9V3M":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWSAQA53MEYPT9C13X884X":{"tiers":[],"amount":4560,"prior_price":null},"variant_01M7WWSAR18XX6931MBY7KCHT6":{"tiers":[],"amount":5880,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSD3XMPTSW61T4H4C51YP","tags":[{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Dry Wipe Schedule Board","width":null,"handle":"dry-wipe-schedule-board","height":null,"images":[{"id":"img_01M81YFRXK8K62WCWMWP9TRAAD","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/dry-wipe-schedule-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSD43DF4X61H8M3CTS7DF","title":"Size","values":[{"id":"optval_01M7WWSD4ASN8TJMNQWGYWNVCS","value":"Standard size"},{"id":"optval_01M7WWSD4ETJYHS9Z8MZGWBA2Z","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSD5FN0JG7PJQJE884P7T","sku":"DRY-WIPE-SCHEDULE-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":3870,"is_tax_inclusive":false,"calculated_amount":3870},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSD43DF4X61H8M3CTS7DF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSD685DSD4K2T2Q5H6M2M","sku":"DRY-WIPE-SCHEDULE-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":3870,"is_tax_inclusive":false,"calculated_amount":3870},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSD43DF4X61H8M3CTS7DF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/dry-wipe-schedule-board","attributes":[{"key":"design","value":"Any design"},{"key":"size","value":"Any size"},{"key":"required_before_order","value":"Quantity of board, sizes of board, sketch of board as per customer requirements"},{"key":"sketch_format","value":"CorelDRAW, Photoshop or Word file"}],"categories":[{"id":"pcat_01M7WWS7S1S4ESA00P9AC7GQQN","name":"Schedule Boards","handle":"schedule-boards"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:38.476979+00:00","description":"The Dry Wipe Schedule Board is available in any design and any size. Before ordering, provide the quantity of boards, the sizes of the boards and a sketch of the board as per your requirements. The sketch should be in CorelDRAW, Photoshop or Word file format. When Plusmark makes the design of a board, additional charges are applicable.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSD5FN0JG7PJQJE884P7T":{"tiers":[],"amount":3870,"prior_price":null},"variant_01M7WWSD685DSD4K2T2Q5H6M2M":{"tiers":[],"amount":3870,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSBZ2WGGFBSR5N1HHEFJR","tags":[{"id":"ptag_01M7WWS9DEBCEDWBF53RYDT6N7","value":"eco-regular"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Eco ADC Notice Board (Single Door)","width":null,"handle":"eco-adc-notice-board-single-door","height":null,"images":[{"id":"img_01M81YFKHNNRJ0N7CMBJ6QTA30","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-adc-notice-board-single-door","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","title":"Size","values":[{"id":"optval_01M7WWSBZEFQ7YDSQFN42RVN2V","value":"1 x 1 ft"},{"id":"optval_01M7WWSBZJVZ4K73G4F82NPS93","value":"2 x 2 ft"},{"id":"optval_01M7WWSBZQ48BFKBM6M2X0NH6K","value":"2 x 3 ft"},{"id":"optval_01M7WWSBZV9Z62S3R9CDQ1X7BH","value":"2 x 4 ft"},{"id":"optval_01M7WWSBZZCC035CJ4XN5PASMZ","value":"3 x 4 ft"},{"id":"optval_01M7WWSC03A4M1ZKXQC4151EE4","value":"4 x 4 ft"},{"id":"optval_01M7WWSC0771K8JJH0X39JJ077","value":"5 x 4 ft"},{"id":"optval_01M7WWSC0BECZEZ2QS56E9S9YT","value":"6 x 4 ft"},{"id":"optval_01M7WWSC0F6JFHC5A7T7JYMF2X","value":"8 x 4 ft"}]}],"material":"Lightweight ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSC1GZQ356E1R0QE2Y73N","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-1-X-1-FT","price":{"currency_code":"inr","original_amount":580,"is_tax_inclusive":false,"calculated_amount":580},"title":"1 x 1 ft","options":[{"value":"1 x 1 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC292CP7M94GA1VAAWC3","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-2-X-2-FT","price":{"currency_code":"inr","original_amount":970,"is_tax_inclusive":false,"calculated_amount":970},"title":"2 x 2 ft","options":[{"value":"2 x 2 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC31CSJKTKZ22VP04DKA","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-2-X-3-FT","price":{"currency_code":"inr","original_amount":1230,"is_tax_inclusive":false,"calculated_amount":1230},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC3TBSF0V4K48VJNRYY1","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-2-X-4-FT","price":{"currency_code":"inr","original_amount":1490,"is_tax_inclusive":false,"calculated_amount":1490},"title":"2 x 4 ft","options":[{"value":"2 x 4 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC4JM471NM7FEAVBWS2E","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-3-X-4-FT","price":{"currency_code":"inr","original_amount":2010,"is_tax_inclusive":false,"calculated_amount":2010},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC5BDA271H7ZV0QYSG98","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-4-X-4-FT","price":{"currency_code":"inr","original_amount":2530,"is_tax_inclusive":false,"calculated_amount":2530},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC63Z99T0K1SG8T18HZF","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-5-X-4-FT","price":{"currency_code":"inr","original_amount":3050,"is_tax_inclusive":false,"calculated_amount":3050},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC6WE86BQ6ZCJV9VP0Q4","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-6-X-4-FT","price":{"currency_code":"inr","original_amount":3570,"is_tax_inclusive":false,"calculated_amount":3570},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSC7NN2VHQGFXRD8XZ96B","sku":"ECO-ADC-NOTICE-BOARD-SINGLE-DOOR-8-X-4-FT","price":{"currency_code":"inr","original_amount":4610,"is_tax_inclusive":false,"calculated_amount":4610},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSBZ72HPDT4K8JXVKMBBX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-adc-notice-board-single-door","attributes":[{"key":"type","value":"Acrylic door covered notice board with single door design"},{"key":"framing","value":"Lightweight aluminium framing for economical and practical use"},{"key":"cover","value":"Transparent acrylic door cover to protect notices from dust and handling"},{"key":"locking","value":"Single-door locking system for safe and controlled notice display"},{"key":"performance","value":"Smooth door operation with clear visibility of displayed notices"},{"key":"finish","value":"Clean and simple finish suitable for regular indoor applications"}],"categories":[{"id":"pcat_01M7WWS7QRTQYCMEC0KPPBK0BD","name":"Acrylic Door Cover Notice Boards","handle":"acrylic-door-cover-notice-boards"}],"collection":{"id":"pcol_01M7WWS7SV0Y85VGQXZKVVV188","title":"Eco Regular","handle":"eco-regular"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:32.974264+00:00","description":"The Eco Acrylic Door Cover (ADC) Notice Board (Single Door) is a notice board with a single-door acrylic cover and lightweight aluminium framing for economical and practical use. A transparent acrylic door cover protects notices from dust and handling, with a single-door locking system, smooth door operation and a clean, simple finish for regular indoor applications.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSC1GZQ356E1R0QE2Y73N":{"tiers":[],"amount":580,"prior_price":null},"variant_01M7WWSC292CP7M94GA1VAAWC3":{"tiers":[],"amount":970,"prior_price":null},"variant_01M7WWSC31CSJKTKZ22VP04DKA":{"tiers":[],"amount":1230,"prior_price":null},"variant_01M7WWSC3TBSF0V4K48VJNRYY1":{"tiers":[],"amount":1490,"prior_price":null},"variant_01M7WWSC4JM471NM7FEAVBWS2E":{"tiers":[],"amount":2010,"prior_price":null},"variant_01M7WWSC5BDA271H7ZV0QYSG98":{"tiers":[],"amount":2530,"prior_price":null},"variant_01M7WWSC63Z99T0K1SG8T18HZF":{"tiers":[],"amount":3050,"prior_price":null},"variant_01M7WWSC6WE86BQ6ZCJV9VP0Q4":{"tiers":[],"amount":3570,"prior_price":null},"variant_01M7WWSC7NN2VHQGFXRD8XZ96B":{"tiers":[],"amount":4610,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS97934ZY6XZZE2KXT45Z","tags":[{"id":"ptag_01M7WWS8SKDRVWJB3CCXQGFX2M","value":"eco-premium"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Eco Premium Double-Sided Board","width":null,"handle":"eco-premium-both-side-board","height":null,"images":[{"id":"img_01M81YFBV8Z6CTRPBBZTEWK1VR","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board","rank":0},{"id":"img_01M81YFBVAN646GDFT3Z7F89AP","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board-2","rank":1},{"id":"img_01M81YFBVCE4ZTCNJKM6MD6KPV","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board-3","rank":2},{"id":"img_01M81YFBVECB6SVZAFJMGF6NK3","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board-4","rank":3},{"id":"img_01M81YFBVGGDBFYP7CPYST4TFF","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board-5","rank":4},{"id":"img_01M81YFBVHP7QM1B4CP0BJ1RMN","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board-6","rank":5},{"id":"img_01M81YFBVK39TX0E2ED3QWYTEC","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS97DW933CBQZXARMZR8G","title":"Size","values":[{"id":"optval_01M7WWS97JZWXF39H72TDVFHJN","value":"2 x 3 ft"},{"id":"optval_01M7WWS97ND15QAAJB5NSS8GJM","value":"3 x 4 ft"},{"id":"optval_01M7WWS97RYNQ2YJGQ10C58S14","value":"4 x 4 ft"},{"id":"optval_01M7WWS97V39A4WQGB6RH0JM19","value":"5 x 4 ft"},{"id":"optval_01M7WWS97Y5K2H1R4X4WNHMT1R","value":"6 x 4 ft"},{"id":"optval_01M7WWS981R9QRH2MPQ1JKX5EH","value":"8 x 4 ft"}]}],"material":"Ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS98R3N2PECE8J4H3G78A","sku":"ECO-PREMIUM-BOTH-SIDE-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1900,"is_tax_inclusive":false,"calculated_amount":1900},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS97DW933CBQZXARMZR8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS99BFDG9BM3T1X2CZJQ2","sku":"ECO-PREMIUM-BOTH-SIDE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":3100,"is_tax_inclusive":false,"calculated_amount":3100},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS97DW933CBQZXARMZR8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS99YZB6KPHCAATQPPV71","sku":"ECO-PREMIUM-BOTH-SIDE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS97DW933CBQZXARMZR8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9AH230SEC66V0GZRRWK","sku":"ECO-PREMIUM-BOTH-SIDE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":4700,"is_tax_inclusive":false,"calculated_amount":4700},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS97DW933CBQZXARMZR8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9B3KVDZ93ZF0V17EYK6","sku":"ECO-PREMIUM-BOTH-SIDE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":5500,"is_tax_inclusive":false,"calculated_amount":5500},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS97DW933CBQZXARMZR8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9BP7NNFC1A87DWWA57K","sku":"ECO-PREMIUM-BOTH-SIDE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":7100,"is_tax_inclusive":false,"calculated_amount":7100},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS97DW933CBQZXARMZR8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-both-side-board","attributes":[{"key":"type","value":"Non-Magnetic Both Side Board"},{"key":"surfaces","value":"Front: White Board (marker writing) · Back: Chalk Board (chalk writing)"},{"key":"frame","value":"Premium Aluminium Anodised Frame"},{"key":"design","value":"ABS Dual-Tone Edge"},{"key":"installation","value":"Quick wall-mount installation, horizontal or vertical"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-both-side-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7QA4D29XXKCCX6WVZ57","name":"Double-Sided Boards","handle":"double-sided-boards"}],"collection":{"id":"pcol_01M7WWS7SK93BNHESYSS7FEX6G","title":"Eco Premium","handle":"eco-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:25.089759+00:00","description":"The Eco Premium Both Side Board puts two writing surfaces in one frame: a white board on the front for marker and a chalk board on the back for chalk. The non-magnetic, easy-to-clean surfaces sit in a premium aluminium anodised frame with ABS dual-tone edges, and quick wall-mount installation lets the board hang horizontally or vertically.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS98R3N2PECE8J4H3G78A":{"tiers":[],"amount":1900,"prior_price":null},"variant_01M7WWS99BFDG9BM3T1X2CZJQ2":{"tiers":[],"amount":3100,"prior_price":null},"variant_01M7WWS99YZB6KPHCAATQPPV71":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWS9AH230SEC66V0GZRRWK":{"tiers":[],"amount":4700,"prior_price":null},"variant_01M7WWS9B3KVDZ93ZF0V17EYK6":{"tiers":[],"amount":5500,"prior_price":null},"variant_01M7WWS9BP7NNFC1A87DWWA57K":{"tiers":[],"amount":7100,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS8XGG5CV3K6N78TBX8GV","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWS8SKDRVWJB3CCXQGFX2M","value":"eco-premium"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Eco Premium Chalk Board","width":null,"handle":"eco-premium-chalk-board","height":null,"images":[{"id":"img_01M81YFARJMR4CRQXYNX3EPACY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board","rank":0},{"id":"img_01M81YFARMS01A9GSZXZJMN2NJ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board-2","rank":1},{"id":"img_01M81YFARPWRZNB3GZ0V8Q84G2","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board-3","rank":2},{"id":"img_01M81YFARRDFC5R4FVVRNZESNV","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board-4","rank":3},{"id":"img_01M81YFARTQ9EG3E5SHCSJHKM9","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board-5","rank":4},{"id":"img_01M81YFARV0S3P6ESYWW3D0EYF","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board-6","rank":5},{"id":"img_01M81YFARXCTW76F4Y9A904MKY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","title":"Size","values":[{"id":"optval_01M7WWS8XSGW9G67E8QN7ET4Y8","value":"2 x 3 ft"},{"id":"optval_01M7WWS8XWRSJZ8TJ42ZEMR78J","value":"3 x 4 ft"},{"id":"optval_01M7WWS8XZ80VQK4QDXMMDW07D","value":"4 x 4 ft"},{"id":"optval_01M7WWS8Y2AA84QME660JSR29J","value":"5 x 4 ft"},{"id":"optval_01M7WWS8Y48KAG00784414YRSR","value":"6 x 4 ft"},{"id":"optval_01M7WWS8Y75TNCGR8RHHCB8X57","value":"8 x 4 ft"}]}],"material":"Ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS8YYFRFSPNABY6CRR24B","sku":"ECO-PREMIUM-CHALK-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1900,"is_tax_inclusive":false,"calculated_amount":1900},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8ZGV732VZR8VFPSHN2N","sku":"ECO-PREMIUM-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":3100,"is_tax_inclusive":false,"calculated_amount":3100},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9027KSNPBV7K7F10R4D","sku":"ECO-PREMIUM-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS90M2CQ1JP8X2X8K8PYK","sku":"ECO-PREMIUM-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":4700,"is_tax_inclusive":false,"calculated_amount":4700},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS916VDTADET1Z7YQ28FG","sku":"ECO-PREMIUM-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":5500,"is_tax_inclusive":false,"calculated_amount":5500},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS91RHN7NSYMMC2895E2M","sku":"ECO-PREMIUM-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":7100,"is_tax_inclusive":false,"calculated_amount":7100},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS8XMBTS9NZQ81MTVG92V","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-chalk-board","attributes":[{"key":"type","value":"Non-Magnetic Chalk Board"},{"key":"material","value":"Premium-grade strong materials"},{"key":"design","value":"ABS Dual-Tone Corner Design for added strength"},{"key":"surface","value":"Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance; non-reflective and glare-free with clear visibility from all angles"},{"key":"durability","value":"Reliable and long-lasting for regular institutional use"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7PXMEEH6PBRZAHQ0W2N","name":"Non-Magnetic Chalk Boards","handle":"chalk-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SK93BNHESYSS7FEX6G","title":"Eco Premium","handle":"eco-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:23.978159+00:00","description":"The Eco Premium Chalk Board is built from premium-grade strong materials with an ABS Dual-Tone Corner Design for added strength. Its Hardcore Chalk Grade HPL Sheet offers enhanced scratch resistance and is non-reflective and glare-free, with clear visibility from all angles. Reliable and long-lasting for regular institutional use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS8YYFRFSPNABY6CRR24B":{"tiers":[],"amount":1900,"prior_price":null},"variant_01M7WWS8ZGV732VZR8VFPSHN2N":{"tiers":[],"amount":3100,"prior_price":null},"variant_01M7WWS9027KSNPBV7K7F10R4D":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWS90M2CQ1JP8X2X8K8PYK":{"tiers":[],"amount":4700,"prior_price":null},"variant_01M7WWS916VDTADET1Z7YQ28FG":{"tiers":[],"amount":5500,"prior_price":null},"variant_01M7WWS91RHN7NSYMMC2895E2M":{"tiers":[],"amount":7100,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS92AFYS22M5GN50RCP0Q","tags":[{"id":"ptag_01M7WWS8SKDRVWJB3CCXQGFX2M","value":"eco-premium"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Eco Premium Notice Board","width":null,"handle":"eco-premium-notice-board","height":null,"images":[{"id":"img_01M81YFBAD78VKS5F34M2BZMF6","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board","rank":0},{"id":"img_01M81YFBAGYQ3JD4SN7TXW90G5","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board-2","rank":1},{"id":"img_01M81YFBAH0H9ACDJA2KQ0B7A1","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board-3","rank":2},{"id":"img_01M81YFBAKHMKHAY6Y705A4CR8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board-4","rank":3},{"id":"img_01M81YFBANX07YXNYE3SQVB5RJ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board-5","rank":4},{"id":"img_01M81YFBAQ8FYHT9TA1PKJF63Y","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board-6","rank":5},{"id":"img_01M81YFBAREHN9E3GTTTM83TNN","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","title":"Size","values":[{"id":"optval_01M7WWS92KARA58DVG9VG47455","value":"2 x 3 ft"},{"id":"optval_01M7WWS92PE3HPWWG2HXD3T48Z","value":"3 x 4 ft"},{"id":"optval_01M7WWS92S09QQYTB19BX23V4C","value":"4 x 4 ft"},{"id":"optval_01M7WWS92WJJ5NZ9DPNDEDG9AM","value":"5 x 4 ft"},{"id":"optval_01M7WWS92ZK3JMFX670YYZFKQX","value":"6 x 4 ft"},{"id":"optval_01M7WWS93203RYG7CHMJ7BHAE6","value":"8 x 4 ft"}]}],"material":"Ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS93T8NTDM7NP97A076XC","sku":"ECO-PREMIUM-NOTICE-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1900,"is_tax_inclusive":false,"calculated_amount":1900},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS94CTFPFJ4F3X53A8406","sku":"ECO-PREMIUM-NOTICE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":3100,"is_tax_inclusive":false,"calculated_amount":3100},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS94ZRSDZH1EYFKRWDKDD","sku":"ECO-PREMIUM-NOTICE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS95J5GX10X9F74VBAMKX","sku":"ECO-PREMIUM-NOTICE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":4700,"is_tax_inclusive":false,"calculated_amount":4700},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS964XTZGD1W72HTT18H2","sku":"ECO-PREMIUM-NOTICE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":5500,"is_tax_inclusive":false,"calculated_amount":5500},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS96PXGRWHE626Q4QW8JZ","sku":"ECO-PREMIUM-NOTICE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":7100,"is_tax_inclusive":false,"calculated_amount":7100},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS92ESHJ4RNA7S59PXX1H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-notice-board","attributes":[{"key":"material","value":"Premium-grade construction for reliable performance"},{"key":"surface","value":"2 mm Blazer Cloth suitable for regular institutional use"},{"key":"core","value":"Soft core material for repeated pinning"},{"key":"durability","value":"Long-lasting with consistent performance"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"},{"id":"pcat_01M7WWS7QH8BPCS17YKQDTRBN8","name":"Pin-Up Boards","handle":"notice-boards-pin-up"}],"collection":{"id":"pcol_01M7WWS7SK93BNHESYSS7FEX6G","title":"Eco Premium","handle":"eco-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:24.545486+00:00","description":"The Eco Premium Notice Board uses premium-grade construction for reliable performance. The 2 mm Blazer Cloth surface is suitable for regular institutional use, over a soft core material for repeated pinning. Long-lasting with consistent performance.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS93T8NTDM7NP97A076XC":{"tiers":[],"amount":1900,"prior_price":null},"variant_01M7WWS94CTFPFJ4F3X53A8406":{"tiers":[],"amount":3100,"prior_price":null},"variant_01M7WWS94ZRSDZH1EYFKRWDKDD":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWS95J5GX10X9F74VBAMKX":{"tiers":[],"amount":4700,"prior_price":null},"variant_01M7WWS964XTZGD1W72HTT18H2":{"tiers":[],"amount":5500,"prior_price":null},"variant_01M7WWS96PXGRWHE626Q4QW8JZ":{"tiers":[],"amount":7100,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS8RSCT215C1ZSZDFVF85","tags":[{"id":"ptag_01M7WWS8SKDRVWJB3CCXQGFX2M","value":"eco-premium"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Eco Premium White Board","width":null,"handle":"eco-premium-white-board","height":null,"images":[{"id":"img_01M81YFA74APCRNMEMWN5EBK25","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board","rank":0},{"id":"img_01M81YFA76MK8HJ0A4PABX8DN9","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board-2","rank":1},{"id":"img_01M81YFA78ZE6AA5RKYWTDW7HJ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board-3","rank":2},{"id":"img_01M81YFA7AGHA3FXPF1WE1W909","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board-4","rank":3},{"id":"img_01M81YFA7CFPADWKFBG8B2792N","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board-5","rank":4},{"id":"img_01M81YFA7E7N40CPE87HJFCWYX","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board-6","rank":5},{"id":"img_01M81YFA7G1294FC1S1SY5MVY7","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","title":"Size","values":[{"id":"optval_01M7WWS8S1K6JD0KDS08EVSSVF","value":"2 x 3 ft"},{"id":"optval_01M7WWS8S4S5PSFPJ5X5XAMK5X","value":"3 x 4 ft"},{"id":"optval_01M7WWS8S7SW3B1H1XVQJF98XJ","value":"4 x 4 ft"},{"id":"optval_01M7WWS8SA00RG8F1J2QEDJS7Y","value":"5 x 4 ft"},{"id":"optval_01M7WWS8SDKZ6S0SHANNM6GPHJ","value":"6 x 4 ft"},{"id":"optval_01M7WWS8SG7BA29GNDRBTRNPTZ","value":"8 x 4 ft"}]}],"material":"Ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS8T6FG06EM9XQRT1CPV1","sku":"ECO-PREMIUM-WHITE-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1900,"is_tax_inclusive":false,"calculated_amount":1900},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8TRZ80SVK6HQ26DX48B","sku":"ECO-PREMIUM-WHITE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":3100,"is_tax_inclusive":false,"calculated_amount":3100},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8V9KMT5FQXWPE7NH3Q9","sku":"ECO-PREMIUM-WHITE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":3900,"is_tax_inclusive":false,"calculated_amount":3900},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8VV55W1PQQZEM45PTDG","sku":"ECO-PREMIUM-WHITE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":4700,"is_tax_inclusive":false,"calculated_amount":4700},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8WC2CJXY1V93S8WGYJ0","sku":"ECO-PREMIUM-WHITE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":5500,"is_tax_inclusive":false,"calculated_amount":5500},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8WYKJ6R0TWGXBAMZCZ1","sku":"ECO-PREMIUM-WHITE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":7100,"is_tax_inclusive":false,"calculated_amount":7100},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS8RX8KWYFNFV2X3TMS6S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-premium-white-board","attributes":[{"key":"type","value":"Non-Magnetic White Board"},{"key":"material","value":"Premium-grade materials with High Gloss Marker Grade HPL Sheet for enhanced durability"},{"key":"design","value":"ABS Dual-Tone Corner Design for added strength and refined appearance"},{"key":"frame","value":"Aluminium Anodized Frame"},{"key":"surface","value":"Smooth, high-gloss surface ensuring seamless writing experience"},{"key":"durability","value":"Reliable and long-lasting for daily institutional use"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PBSRT0KQDQ4636CJFS","name":"Non-Magnetic White Boards","handle":"white-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SK93BNHESYSS7FEX6G","title":"Eco Premium","handle":"eco-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:23.41769+00:00","description":"The Eco Premium White Board uses premium-grade materials with High Gloss Marker Grade HPL Sheet for enhanced durability. Its ABS Dual-Tone Corner Design adds strength and a refined appearance, and the smooth, high-gloss surface ensures a seamless writing experience. Reliable and long-lasting for daily institutional use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS8T6FG06EM9XQRT1CPV1":{"tiers":[],"amount":1900,"prior_price":null},"variant_01M7WWS8TRZ80SVK6HQ26DX48B":{"tiers":[],"amount":3100,"prior_price":null},"variant_01M7WWS8V9KMT5FQXWPE7NH3Q9":{"tiers":[],"amount":3900,"prior_price":null},"variant_01M7WWS8VV55W1PQQZEM45PTDG":{"tiers":[],"amount":4700,"prior_price":null},"variant_01M7WWS8WC2CJXY1V93S8WGYJ0":{"tiers":[],"amount":5500,"prior_price":null},"variant_01M7WWS8WYKJ6R0TWGXBAMZCZ1":{"tiers":[],"amount":7100,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS9KPNCZ2WBD7FZ65KZ40","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWS9DEBCEDWBF53RYDT6N7","value":"eco-regular"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Eco Regular Chalk Board","width":null,"handle":"eco-regular-chalk-board","height":null,"images":[{"id":"img_01M81YFCZKJBJXMV972F6HF347","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-correct","rank":0},{"id":"img_01M81YFCZPF29JHFVQHKVJDSKM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-2","rank":1},{"id":"img_01M81YFCZQRQ2BPF3B524MT3V5","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-3","rank":2},{"id":"img_01M81YFCZS470VZAD94TKSYWAT","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-4","rank":3},{"id":"img_01M81YFCZVJGFD6BNXVZEZXQDB","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-5","rank":4},{"id":"img_01M81YFCZXKE8NAFZAPG5VBMBG","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-6","rank":5},{"id":"img_01M81YFCZZPT8DYAQT5TTS9B1D","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","title":"Size","values":[{"id":"optval_01M7WWS9KZ6GM798XG69NYR6FM","value":"1 x 1 ft"},{"id":"optval_01M7WWS9M2AAZ58EPNSDTCD1H6","value":"2 x 2 ft"},{"id":"optval_01M7WWS9M68RBWN330M12898KN","value":"2 x 3 ft"},{"id":"optval_01M7WWS9M9XS623DA0FR19YR1K","value":"2 x 4 ft"},{"id":"optval_01M7WWS9MCZYA46FASYHCRM5DQ","value":"3 x 4 ft"},{"id":"optval_01M7WWS9MGWHC52P4ZE3RD1304","value":"4 x 4 ft"},{"id":"optval_01M7WWS9MKBSN6ZY6FP9D7K7PF","value":"5 x 4 ft"},{"id":"optval_01M7WWS9MPQR0JXB5YHB2H5VZY","value":"6 x 4 ft"},{"id":"optval_01M7WWS9MS8RZG29E6QTH1Q0W6","value":"8 x 4 ft"}]}],"material":"Lightweight ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWS9NJZ1H6YPNWF8NYX9EJ","sku":"ECO-REGULAR-CHALK-BOARD-1-X-1-FT","price":{"currency_code":"inr","original_amount":580,"is_tax_inclusive":false,"calculated_amount":580},"title":"1 x 1 ft","options":[{"value":"1 x 1 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9P60JSA6VH7MMP282NW","sku":"ECO-REGULAR-CHALK-BOARD-2-X-2-FT","price":{"currency_code":"inr","original_amount":970,"is_tax_inclusive":false,"calculated_amount":970},"title":"2 x 2 ft","options":[{"value":"2 x 2 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9PTFX645TNVF125D287","sku":"ECO-REGULAR-CHALK-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1230,"is_tax_inclusive":false,"calculated_amount":1230},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9QEH4YR5KHYFBPA9R81","sku":"ECO-REGULAR-CHALK-BOARD-2-X-4-FT","price":{"currency_code":"inr","original_amount":1490,"is_tax_inclusive":false,"calculated_amount":1490},"title":"2 x 4 ft","options":[{"value":"2 x 4 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9R2VZFB90V8MXZCGG50","sku":"ECO-REGULAR-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2010,"is_tax_inclusive":false,"calculated_amount":2010},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9RPZNWR6ATDEBEMN9Z0","sku":"ECO-REGULAR-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":2530,"is_tax_inclusive":false,"calculated_amount":2530},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9SB169S1AN68GK7MCAD","sku":"ECO-REGULAR-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3050,"is_tax_inclusive":false,"calculated_amount":3050},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9T0FNEP72A5J92FV7BE","sku":"ECO-REGULAR-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":3570,"is_tax_inclusive":false,"calculated_amount":3570},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9TMRKESC8YHSM1JBJE8","sku":"ECO-REGULAR-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":4610,"is_tax_inclusive":false,"calculated_amount":4610},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS9KTW9GNFZFE4X824TKF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-chalk-board-correct","attributes":[{"key":"type","value":"Non-Magnetic Chalk Board"},{"key":"material","value":"Cost-effective, regular materials"},{"key":"design","value":"Lightweight frame with standard plastic corners"},{"key":"surface","value":"Chalk Grade HPL Sheet; non-reflective, glare-free, with clear visibility from all angles"},{"key":"durability","value":"Suitable for light and economical use"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-chalk-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7PXMEEH6PBRZAHQ0W2N","name":"Non-Magnetic Chalk Boards","handle":"chalk-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SV0Y85VGQXZKVVV188","title":"Eco Regular","handle":"eco-regular"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:26.250457+00:00","description":"The Eco Regular Chalk Board uses cost-effective, regular materials with a lightweight frame and standard plastic corners. The Chalk Grade HPL Sheet is non-reflective and glare-free, with clear visibility from all angles. Suitable for light and economical use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS9NJZ1H6YPNWF8NYX9EJ":{"tiers":[],"amount":580,"prior_price":null},"variant_01M7WWS9P60JSA6VH7MMP282NW":{"tiers":[],"amount":970,"prior_price":null},"variant_01M7WWS9PTFX645TNVF125D287":{"tiers":[],"amount":1230,"prior_price":null},"variant_01M7WWS9QEH4YR5KHYFBPA9R81":{"tiers":[],"amount":1490,"prior_price":null},"variant_01M7WWS9R2VZFB90V8MXZCGG50":{"tiers":[],"amount":2010,"prior_price":null},"variant_01M7WWS9RPZNWR6ATDEBEMN9Z0":{"tiers":[],"amount":2530,"prior_price":null},"variant_01M7WWS9SB169S1AN68GK7MCAD":{"tiers":[],"amount":3050,"prior_price":null},"variant_01M7WWS9T0FNEP72A5J92FV7BE":{"tiers":[],"amount":3570,"prior_price":null},"variant_01M7WWS9TMRKESC8YHSM1JBJE8":{"tiers":[],"amount":4610,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS9V9JK9V38CXW5S90CT1","tags":[{"id":"ptag_01M7WWS9DEBCEDWBF53RYDT6N7","value":"eco-regular"},{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"}],"type":null,"title":"Eco Regular Magnetic Board","width":null,"handle":"eco-regular-magnetic-board","height":null,"images":[{"id":"img_01M81YFDGT31P152W24WQF8W86","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-correct","rank":0},{"id":"img_01M81YFDGW31G1Y14XVW4TY685","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-2","rank":1},{"id":"img_01M81YFDGYSP05YFC9ETJMMN15","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-3","rank":2},{"id":"img_01M81YFDH07RMYF64FATNQFFB8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-4","rank":3},{"id":"img_01M81YFDH22X2JX4W0DJCR7QZY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-5","rank":4},{"id":"img_01M81YFDH4KBMAJP8H3RNDECRS","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-6","rank":5},{"id":"img_01M81YFDH7S3Y8GS1VX0GGME32","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","title":"Size","values":[{"id":"optval_01M7WWS9VKRQSPHVM86M5HXPES","value":"1 x 1 ft"},{"id":"optval_01M7WWS9VP40QPQ1N4HT32G2VQ","value":"2 x 2 ft"},{"id":"optval_01M7WWS9VSTMZPPXWQHJM0CAZX","value":"2 x 3 ft"},{"id":"optval_01M7WWS9VXKG6Z6JC5PW6X490K","value":"2 x 4 ft"},{"id":"optval_01M7WWS9W0J4JMS45C5S4DN7A2","value":"3 x 4 ft"},{"id":"optval_01M7WWS9W3TTNC1ZTG6QWP5HCK","value":"4 x 4 ft"},{"id":"optval_01M7WWS9W777H5JWSHGE34C48K","value":"5 x 4 ft"},{"id":"optval_01M7WWS9WA66K867V37K4KFZ8T","value":"6 x 4 ft"},{"id":"optval_01M7WWS9WDEJ79H3E8VB4XADDH","value":"8 x 4 ft"}]}],"material":"Lightweight ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWS9X7FYQ53Y50Y88PXW7N","sku":"ECO-REGULAR-MAGNETIC-BOARD-1-X-1-FT","price":{"currency_code":"inr","original_amount":580,"is_tax_inclusive":false,"calculated_amount":580},"title":"1 x 1 ft","options":[{"value":"1 x 1 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9XVWN612G8S9FHKZ1YB","sku":"ECO-REGULAR-MAGNETIC-BOARD-2-X-2-FT","price":{"currency_code":"inr","original_amount":970,"is_tax_inclusive":false,"calculated_amount":970},"title":"2 x 2 ft","options":[{"value":"2 x 2 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9YGB94Q307ZP04E2QJ2","sku":"ECO-REGULAR-MAGNETIC-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1230,"is_tax_inclusive":false,"calculated_amount":1230},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9Z4VJ9M0D86MND5DJHS","sku":"ECO-REGULAR-MAGNETIC-BOARD-2-X-4-FT","price":{"currency_code":"inr","original_amount":1490,"is_tax_inclusive":false,"calculated_amount":1490},"title":"2 x 4 ft","options":[{"value":"2 x 4 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9ZSSY6WP59DTREQXMSE","sku":"ECO-REGULAR-MAGNETIC-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2010,"is_tax_inclusive":false,"calculated_amount":2010},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA0ERWFVENM4W7ESR9HR","sku":"ECO-REGULAR-MAGNETIC-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":2530,"is_tax_inclusive":false,"calculated_amount":2530},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA12E977E3H8HJ7P15MS","sku":"ECO-REGULAR-MAGNETIC-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3050,"is_tax_inclusive":false,"calculated_amount":3050},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA1QVN7HQMJA3S0ZJ2BK","sku":"ECO-REGULAR-MAGNETIC-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":3570,"is_tax_inclusive":false,"calculated_amount":3570},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA2CCRN1XN1ZBMTZX3QG","sku":"ECO-REGULAR-MAGNETIC-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":4610,"is_tax_inclusive":false,"calculated_amount":4610},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS9VE5B4V8NW1BCAK49S1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-board-correct","attributes":[{"key":"type","value":"Resin Coated Steel Magnetic Board"},{"key":"surface","value":"Resin coated writing surface in white and green variants"},{"key":"magnetic_use","value":"Supports basic magnetic accessories"},{"key":"design","value":"Lightweight aluminium frame with standard plastic corners"},{"key":"finish","value":"Functional writing surface for basic requirements"},{"key":"build","value":"Economical option designed for light usage"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-white-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PHP0Y7RH2Y21PXANWK","name":"Magnetic White Boards","handle":"white-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SV0Y85VGQXZKVVV188","title":"Eco Regular","handle":"eco-regular"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:26.801608+00:00","description":"The Eco Regular Magnetic Board accepts magnets and supports basic magnetic accessories. Its resin coated writing surface comes in white and green variants, set in a lightweight aluminium frame with standard plastic corners. A functional writing surface for basic requirements — an economical option designed for light usage.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS9X7FYQ53Y50Y88PXW7N":{"tiers":[],"amount":580,"prior_price":null},"variant_01M7WWS9XVWN612G8S9FHKZ1YB":{"tiers":[],"amount":970,"prior_price":null},"variant_01M7WWS9YGB94Q307ZP04E2QJ2":{"tiers":[],"amount":1230,"prior_price":null},"variant_01M7WWS9Z4VJ9M0D86MND5DJHS":{"tiers":[],"amount":1490,"prior_price":null},"variant_01M7WWS9ZSSY6WP59DTREQXMSE":{"tiers":[],"amount":2010,"prior_price":null},"variant_01M7WWSA0ERWFVENM4W7ESR9HR":{"tiers":[],"amount":2530,"prior_price":null},"variant_01M7WWSA12E977E3H8HJ7P15MS":{"tiers":[],"amount":3050,"prior_price":null},"variant_01M7WWSA1QVN7HQMJA3S0ZJ2BK":{"tiers":[],"amount":3570,"prior_price":null},"variant_01M7WWSA2CCRN1XN1ZBMTZX3QG":{"tiers":[],"amount":4610,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSA30RABKP3JP34GV4GD0","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWS9DEBCEDWBF53RYDT6N7","value":"eco-regular"},{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"}],"type":null,"title":"Eco Regular Magnetic Chalk Board","width":null,"handle":"eco-regular-magnetic-chalk-board","height":null,"images":[{"id":"img_01M81YFE1XQKWCR7ZRBFEC9H0T","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-correct","rank":0},{"id":"img_01M81YFE1ZSBHCXDT0VKPCA556","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-2","rank":1},{"id":"img_01M81YFE21D7KPMWFXZ3K01ET8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-3","rank":2},{"id":"img_01M81YFE233YA5KT9RBR5BFG77","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-4","rank":3},{"id":"img_01M81YFE25Q1Q7QCGYW01SWY9Q","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-5","rank":4},{"id":"img_01M81YFE274KSZRT22T42B4CSA","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-6","rank":5},{"id":"img_01M81YFE29NS1SGQTZD290EEB6","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","title":"Size","values":[{"id":"optval_01M7WWSA3AHKP512PCP988SDXX","value":"1 x 1 ft"},{"id":"optval_01M7WWSA3E2T788YKCMV7G3TA6","value":"2 x 2 ft"},{"id":"optval_01M7WWSA3HJK6ZYRENC24J0R8H","value":"2 x 3 ft"},{"id":"optval_01M7WWSA3NR568CWFYTESFWQQZ","value":"2 x 4 ft"},{"id":"optval_01M7WWSA3RRAQNANAA0JPG2AHH","value":"3 x 4 ft"},{"id":"optval_01M7WWSA3WDJ7Q2EW5EH0H6GR1","value":"4 x 4 ft"},{"id":"optval_01M7WWSA3ZDYVKMQZNPB4NVEYP","value":"5 x 4 ft"},{"id":"optval_01M7WWSA4300X49X9V1MHA2YBH","value":"6 x 4 ft"},{"id":"optval_01M7WWSA470DJ2ZAT8ZYZZ7EPV","value":"8 x 4 ft"}]}],"material":"Lightweight ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSA5328FH4S3WMDBW14CT","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-1-X-1-FT","price":{"currency_code":"inr","original_amount":580,"is_tax_inclusive":false,"calculated_amount":580},"title":"1 x 1 ft","options":[{"value":"1 x 1 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA5RVS725TCMQED50CKW","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-2-X-2-FT","price":{"currency_code":"inr","original_amount":970,"is_tax_inclusive":false,"calculated_amount":970},"title":"2 x 2 ft","options":[{"value":"2 x 2 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA6DXM0KMQS43YDZG048","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1230,"is_tax_inclusive":false,"calculated_amount":1230},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA73N5QVY7QZESYXE30Q","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-2-X-4-FT","price":{"currency_code":"inr","original_amount":1490,"is_tax_inclusive":false,"calculated_amount":1490},"title":"2 x 4 ft","options":[{"value":"2 x 4 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA7RX3YFN2PXW245BC22","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2010,"is_tax_inclusive":false,"calculated_amount":2010},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA8DJ9PW53GMTD63FWCP","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":2530,"is_tax_inclusive":false,"calculated_amount":2530},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA92JPWDN8GWWZ85MR09","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3050,"is_tax_inclusive":false,"calculated_amount":3050},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSA9RR7E3T78V967HSWJT","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":3570,"is_tax_inclusive":false,"calculated_amount":3570},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAAE7QH4112E2EK0073E","sku":"ECO-REGULAR-MAGNETIC-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":4610,"is_tax_inclusive":false,"calculated_amount":4610},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSA35A4YMJ6CSX6FYZ4G5","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-magnetic-chalk-board-correct","attributes":[{"key":"type","value":"Resin Coated Steel Magnetic Chalk Board"},{"key":"surface","value":"Resin coated green chalk writing surface; accepts magnets"},{"key":"magnetic_use","value":"Supports basic magnetic accessories"},{"key":"design","value":"Lightweight aluminium frame with standard plastic corners"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-magnetic-chalk-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7Q2B6W1HSYG9XKR3MC8","name":"Magnetic Chalk Boards","handle":"chalk-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SV0Y85VGQXZKVVV188","title":"Eco Regular","handle":"eco-regular"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:27.348816+00:00","description":"The Eco Regular Magnetic Chalk Board accepts magnets and supports basic magnetic accessories. Its resin coated green chalk writing surface comes in a lightweight aluminium frame with standard plastic corners — an economical option designed for light and budget-friendly institutional use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSA5328FH4S3WMDBW14CT":{"tiers":[],"amount":580,"prior_price":null},"variant_01M7WWSA5RVS725TCMQED50CKW":{"tiers":[],"amount":970,"prior_price":null},"variant_01M7WWSA6DXM0KMQS43YDZG048":{"tiers":[],"amount":1230,"prior_price":null},"variant_01M7WWSA73N5QVY7QZESYXE30Q":{"tiers":[],"amount":1490,"prior_price":null},"variant_01M7WWSA7RX3YFN2PXW245BC22":{"tiers":[],"amount":2010,"prior_price":null},"variant_01M7WWSA8DJ9PW53GMTD63FWCP":{"tiers":[],"amount":2530,"prior_price":null},"variant_01M7WWSA92JPWDN8GWWZ85MR09":{"tiers":[],"amount":3050,"prior_price":null},"variant_01M7WWSA9RR7E3T78V967HSWJT":{"tiers":[],"amount":3570,"prior_price":null},"variant_01M7WWSAAE7QH4112E2EK0073E":{"tiers":[],"amount":4610,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSAB4Z62DSEPVEFPA7Z9M","tags":[{"id":"ptag_01M7WWS9DEBCEDWBF53RYDT6N7","value":"eco-regular"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Eco Regular Notice Board","width":null,"handle":"eco-regular-notice-board","height":null,"images":[{"id":"img_01M81YFEQ0D5EXPAK4RV3M2YZB","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-correct","rank":0},{"id":"img_01M81YFEQ2PYD75GN5YT52MJ9H","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-2","rank":1},{"id":"img_01M81YFEQ49RA178GQ8BK8YV6C","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-3","rank":2},{"id":"img_01M81YFEQ6Q9EBGKTNQJDSZQX0","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-4","rank":3},{"id":"img_01M81YFEQ8WYZYA9H6E7CA0E41","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-5","rank":4},{"id":"img_01M81YFEQ9HGSAZJX78GJC5XMX","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-6","rank":5},{"id":"img_01M81YFEQBPD7PHQWE6CVJXB95","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","title":"Size","values":[{"id":"optval_01M7WWSABEK77YMWA1RSMX1ZH0","value":"1 x 1 ft"},{"id":"optval_01M7WWSABJZCBDR5RME6TD3T2P","value":"2 x 2 ft"},{"id":"optval_01M7WWSABN7M358WQFWG7K9FFW","value":"2 x 3 ft"},{"id":"optval_01M7WWSABS9SVVDFC6B3GNDV5B","value":"2 x 4 ft"},{"id":"optval_01M7WWSABW95FVMSWQSTRF3P97","value":"3 x 4 ft"},{"id":"optval_01M7WWSAC0YAK8263RXFAEWQFV","value":"4 x 4 ft"},{"id":"optval_01M7WWSAC4Y6RBT3FZJFM40A42","value":"5 x 4 ft"},{"id":"optval_01M7WWSAC7NEQW7ZKS33XAFS2N","value":"6 x 4 ft"},{"id":"optval_01M7WWSACB717NGWA4AVXZ8AP1","value":"8 x 4 ft"}]}],"material":"Lightweight ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWSAD9GNV7HKHSGSXK7E35","sku":"ECO-REGULAR-NOTICE-BOARD-1-X-1-FT","price":{"currency_code":"inr","original_amount":580,"is_tax_inclusive":false,"calculated_amount":580},"title":"1 x 1 ft","options":[{"value":"1 x 1 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSADYSNHPEVMFM02W51Y3","sku":"ECO-REGULAR-NOTICE-BOARD-2-X-2-FT","price":{"currency_code":"inr","original_amount":970,"is_tax_inclusive":false,"calculated_amount":970},"title":"2 x 2 ft","options":[{"value":"2 x 2 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAEMBGP1D5ADSG8EEDGJ","sku":"ECO-REGULAR-NOTICE-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1230,"is_tax_inclusive":false,"calculated_amount":1230},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAFBNGYF2KGP3QKMA7H6","sku":"ECO-REGULAR-NOTICE-BOARD-2-X-4-FT","price":{"currency_code":"inr","original_amount":1490,"is_tax_inclusive":false,"calculated_amount":1490},"title":"2 x 4 ft","options":[{"value":"2 x 4 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAG1EG8W9K7JC9WDGKHR","sku":"ECO-REGULAR-NOTICE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2010,"is_tax_inclusive":false,"calculated_amount":2010},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAGQ6JWRP4EXZDXZD8TC","sku":"ECO-REGULAR-NOTICE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":2530,"is_tax_inclusive":false,"calculated_amount":2530},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAHD8P5HYY0G2GPNKRRM","sku":"ECO-REGULAR-NOTICE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3050,"is_tax_inclusive":false,"calculated_amount":3050},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAJ4CT7XQG82PC1JH3BX","sku":"ECO-REGULAR-NOTICE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":3570,"is_tax_inclusive":false,"calculated_amount":3570},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSAJVMPJR8ZBQ2K73WK8W","sku":"ECO-REGULAR-NOTICE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":4610,"is_tax_inclusive":false,"calculated_amount":4610},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWSAB9KHCYWKYSZWWBP7K4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-notice-board-correct","attributes":[{"key":"material","value":"Economical materials with standard plastic corners"},{"key":"surface","value":"Super Fine Velvet Cloth for basic pin-up needs"},{"key":"core","value":"Soft core for light pin usage"},{"key":"durability","value":"Suitable for light and occasional use"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-notice-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"},{"id":"pcat_01M7WWS7QH8BPCS17YKQDTRBN8","name":"Pin-Up Boards","handle":"notice-boards-pin-up"}],"collection":{"id":"pcol_01M7WWS7SV0Y85VGQXZKVVV188","title":"Eco Regular","handle":"eco-regular"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:28.023455+00:00","description":"The Eco Regular Notice Board uses economical materials with standard plastic corners. Super Fine Velvet Cloth covers basic pin-up needs, over a soft core for light pin usage. Suitable for light and occasional use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSAD9GNV7HKHSGSXK7E35":{"tiers":[],"amount":580,"prior_price":null},"variant_01M7WWSADYSNHPEVMFM02W51Y3":{"tiers":[],"amount":970,"prior_price":null},"variant_01M7WWSAEMBGP1D5ADSG8EEDGJ":{"tiers":[],"amount":1230,"prior_price":null},"variant_01M7WWSAFBNGYF2KGP3QKMA7H6":{"tiers":[],"amount":1490,"prior_price":null},"variant_01M7WWSAG1EG8W9K7JC9WDGKHR":{"tiers":[],"amount":2010,"prior_price":null},"variant_01M7WWSAGQ6JWRP4EXZDXZD8TC":{"tiers":[],"amount":2530,"prior_price":null},"variant_01M7WWSAHD8P5HYY0G2GPNKRRM":{"tiers":[],"amount":3050,"prior_price":null},"variant_01M7WWSAJ4CT7XQG82PC1JH3BX":{"tiers":[],"amount":3570,"prior_price":null},"variant_01M7WWSAJVMPJR8ZBQ2K73WK8W":{"tiers":[],"amount":4610,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS9C9RTGHNB35VF6XK0AE","tags":[{"id":"ptag_01M7WWS9DEBCEDWBF53RYDT6N7","value":"eco-regular"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Eco Regular White Board","width":null,"handle":"eco-regular-white-board","height":null,"images":[{"id":"img_01M81YFCD2AHG0S09PWV3M9SY6","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-correct","rank":0},{"id":"img_01M81YFCD5J1CE3GGQ9SA097N6","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-2","rank":1},{"id":"img_01M81YFCD7SY18147T2PVRZ6YK","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-3","rank":2},{"id":"img_01M81YFCD9RHWYDRK2Q4QPV45P","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-4","rank":3},{"id":"img_01M81YFCDAFWD5K37094ZDYYMP","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-5","rank":4},{"id":"img_01M81YFCDC6P2QBTRQAZ4AS42D","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-6","rank":5},{"id":"img_01M81YFCDEK55KGW4T1TNEGA4A","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","title":"Size","values":[{"id":"optval_01M7WWS9CJNRXTETZASBR1ZYHM","value":"1 x 1 ft"},{"id":"optval_01M7WWS9CNQEHF4MAXQ60CKR38","value":"2 x 2 ft"},{"id":"optval_01M7WWS9CRB0WN9TCDXGXVJ31V","value":"2 x 3 ft"},{"id":"optval_01M7WWS9CWS9XB06XRY5DSET7F","value":"2 x 4 ft"},{"id":"optval_01M7WWS9CZ1WRHY3JQC4WDG6V6","value":"3 x 4 ft"},{"id":"optval_01M7WWS9D2DPV2667EM6NY5TY4","value":"4 x 4 ft"},{"id":"optval_01M7WWS9D5VPG82NMYDJTDASXN","value":"5 x 4 ft"},{"id":"optval_01M7WWS9D8MKR9TJDRZCYZQ9HH","value":"6 x 4 ft"},{"id":"optval_01M7WWS9DBZY97T6P4J1A75C6G","value":"8 x 4 ft"}]}],"material":"Lightweight ribbed aluminium anodized frame","metadata":{},"pairings":{},"subtitle":"High gloss melamine writing surface","variants":[{"id":"variant_01M7WWS9E4VVQP8KT34KQ774AE","sku":"ECO-REGULAR-WHITE-BOARD-1-X-1-FT","price":{"currency_code":"inr","original_amount":580,"is_tax_inclusive":false,"calculated_amount":580},"title":"1 x 1 ft","options":[{"value":"1 x 1 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9EQF807P620CCVP11KQ","sku":"ECO-REGULAR-WHITE-BOARD-2-X-2-FT","price":{"currency_code":"inr","original_amount":970,"is_tax_inclusive":false,"calculated_amount":970},"title":"2 x 2 ft","options":[{"value":"2 x 2 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9FBG7YQZ1NZ65SFNM3C","sku":"ECO-REGULAR-WHITE-BOARD-2-X-3-FT","price":{"currency_code":"inr","original_amount":1230,"is_tax_inclusive":false,"calculated_amount":1230},"title":"2 x 3 ft","options":[{"value":"2 x 3 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9FYFXY014X8QG9GKBRS","sku":"ECO-REGULAR-WHITE-BOARD-2-X-4-FT","price":{"currency_code":"inr","original_amount":1490,"is_tax_inclusive":false,"calculated_amount":1490},"title":"2 x 4 ft","options":[{"value":"2 x 4 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9GJJ87ZB84S90WE86MG","sku":"ECO-REGULAR-WHITE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":2010,"is_tax_inclusive":false,"calculated_amount":2010},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9H6WVPS633YHG1Z3ZCC","sku":"ECO-REGULAR-WHITE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":2530,"is_tax_inclusive":false,"calculated_amount":2530},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9HTDMD1BCEY5GHXA2WF","sku":"ECO-REGULAR-WHITE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":3050,"is_tax_inclusive":false,"calculated_amount":3050},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9JE0EEBNBSJWSNTK3PG","sku":"ECO-REGULAR-WHITE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":3570,"is_tax_inclusive":false,"calculated_amount":3570},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS9K2M3SM6NRN4GDKHZY3","sku":"ECO-REGULAR-WHITE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":4610,"is_tax_inclusive":false,"calculated_amount":4610},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS9CDQ2EZFBJ0NHGC2TTM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-regular-white-board-correct","attributes":[{"key":"type","value":"Non-Magnetic White Board"},{"key":"material","value":"Cost-effective, regular materials"},{"key":"design","value":"Lightweight frame with standard plastic corners, easy to handle and install"},{"key":"surface","value":"High Gloss Melamine Writing Surface suitable for basic writing needs"},{"key":"durability","value":"Good for light use and budget-friendly applications"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/eco-white-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PBSRT0KQDQ4636CJFS","name":"Non-Magnetic White Boards","handle":"white-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SV0Y85VGQXZKVVV188","title":"Eco Regular","handle":"eco-regular"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:25.657056+00:00","description":"The Eco Regular White Board uses cost-effective, regular materials. A lightweight frame with standard plastic corners makes it easy to handle and install, and the High Gloss Melamine Writing Surface suits basic writing needs. Good for light use and budget-friendly applications.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS9E4VVQP8KT34KQ774AE":{"tiers":[],"amount":580,"prior_price":null},"variant_01M7WWS9EQF807P620CCVP11KQ":{"tiers":[],"amount":970,"prior_price":null},"variant_01M7WWS9FBG7YQZ1NZ65SFNM3C":{"tiers":[],"amount":1230,"prior_price":null},"variant_01M7WWS9FYFXY014X8QG9GKBRS":{"tiers":[],"amount":1490,"prior_price":null},"variant_01M7WWS9GJJ87ZB84S90WE86MG":{"tiers":[],"amount":2010,"prior_price":null},"variant_01M7WWS9H6WVPS633YHG1Z3ZCC":{"tiers":[],"amount":2530,"prior_price":null},"variant_01M7WWS9HTDMD1BCEY5GHXA2WF":{"tiers":[],"amount":3050,"prior_price":null},"variant_01M7WWS9JE0EEBNBSJWSNTK3PG":{"tiers":[],"amount":3570,"prior_price":null},"variant_01M7WWS9K2M3SM6NRN4GDKHZY3":{"tiers":[],"amount":4610,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCXNFQYW6JV2ZRXDZMKH","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Fabric Notice Board","width":null,"handle":"fabric-notice-board","height":null,"images":[{"id":"img_01M81YFQTBP59Y53WST07BR7Z1","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/fabric-notice-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCXV37YT3VBH2HWAKPN3","title":"Size","values":[{"id":"optval_01M7WWSCY10JN62QQAGHXB7Y6H","value":"Standard size"},{"id":"optval_01M7WWSCY5KYESJABJAR2FPPK2","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCZ69CF566JWVDRMS832","sku":"FABRIC-NOTICE-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":2910,"is_tax_inclusive":false,"calculated_amount":2910},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCXV37YT3VBH2HWAKPN3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSD02CA2VY11Z6N91DW9M","sku":"FABRIC-NOTICE-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":2910,"is_tax_inclusive":false,"calculated_amount":2910},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCXV37YT3VBH2HWAKPN3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/fabric-notice-board","attributes":[{"key":"surface","value":"Fabric notice board suitable for repeated pin use"},{"key":"color_options","value":"Available in customer's preferred fabric colour"},{"key":"customization","value":"Fabric colour and board layout can be provided as per customer requirement"},{"key":"core","value":"Soft core material for easy pin insertion and firm holding"},{"key":"performance","value":"Durable fabric surface suitable for regular notice display"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"},{"id":"pcat_01M7WWS7QH8BPCS17YKQDTRBN8","name":"Pin-Up Boards","handle":"notice-boards-pin-up"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:37.348033+00:00","description":"The Fabric Notice Board is suitable for repeated pin use and is available in the customer's preferred fabric colour. Fabric colour and board layout can be provided as per customer requirement. A soft core material allows easy pin insertion and firm holding, and the durable fabric surface suits regular notice display.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCZ69CF566JWVDRMS832":{"tiers":[],"amount":2910,"prior_price":null},"variant_01M7WWSD02CA2VY11Z6N91DW9M":{"tiers":[],"amount":2910,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSEH6F0PBDQ15PX6JBMEB","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"File Rack","width":null,"handle":"file-rack","height":null,"images":[{"id":"img_01M81YFZ37GHGQR7BHZG7RZPSM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/file-rack","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSEHDE37SKQ4QR16R4MC8","title":"Size","values":[{"id":"optval_01M7WWSEHMB4DC1JSEA3EPFKTY","value":"Standard size"},{"id":"optval_01M7WWSEHRFVB63T71GVKZB7RZ","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSEJVAV5FE83N8H6HMXG0","sku":"FILE-RACK-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4420,"is_tax_inclusive":false,"calculated_amount":4420},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSEHDE37SKQ4QR16R4MC8","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSEKS0B9W9ZSMAMNQR7Q8","sku":"FILE-RACK-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4420,"is_tax_inclusive":false,"calculated_amount":4420},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSEHDE37SKQ4QR16R4MC8","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/file-rack","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7REYZ7MRJE57JYQAX4K","name":"Storage & Racks","handle":"board-stands-storage"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:44.801539+00:00","description":"The File Rack is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSEJVAV5FE83N8H6HMXG0":{"tiers":[],"amount":4420,"prior_price":null},"variant_01M7WWSEKS0B9W9ZSMAMNQR7Q8":{"tiers":[],"amount":4420,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSEYVEJWM4XTBDNT6ZYVC","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"First Aid Box","width":null,"handle":"first-aid-box","height":null,"images":[{"id":"img_01M81YG0QT91V2DJMJTEE84614","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/first-aid-box","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSEZ29WM0130NGFBK53CF","title":"Size","values":[{"id":"optval_01M7WWSEZ9TTPCEMK2CFS8TJTZ","value":"Standard size"},{"id":"optval_01M7WWSEZE39P9KKPKBP9EDB5E","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSF0JSJ2B3DYHZTGEGK2S","sku":"FIRST-AID-BOX-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4340,"is_tax_inclusive":false,"calculated_amount":4340},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSEZ29WM0130NGFBK53CF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSF1G3JEYNXTFR4JX6AHV","sku":"FIRST-AID-BOX-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4340,"is_tax_inclusive":false,"calculated_amount":4340},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSEZ29WM0130NGFBK53CF","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/first-aid-box","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7REYZ7MRJE57JYQAX4K","name":"Storage & Racks","handle":"board-stands-storage"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:46.484202+00:00","description":"The First Aid Box is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSF0JSJ2B3DYHZTGEGK2S":{"tiers":[],"amount":4340,"prior_price":null},"variant_01M7WWSF1G3JEYNXTFR4JX6AHV":{"tiers":[],"amount":4340,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSE0NKSDAFPKBZ2Q5ZJJB","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Four Leg Stand","width":null,"handle":"four-leg-stand","height":null,"images":[{"id":"img_01M81YFX2HHSSTNVDSCX2AJB4D","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/four-leg-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSE0VSPE26Z4H8RE5MA96","title":"Size","values":[{"id":"optval_01M7WWSE11XD91KBNY8QZK39BH","value":"Standard size"},{"id":"optval_01M7WWSE16SPZ9CEHEA49GKTRB","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSE29RMSN80PZWR3WE52W","sku":"FOUR-LEG-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4510,"is_tax_inclusive":false,"calculated_amount":4510},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSE0VSPE26Z4H8RE5MA96","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSE33GEAQZTX23DYJ5Z4K","sku":"FOUR-LEG-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4510,"is_tax_inclusive":false,"calculated_amount":4510},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSE0VSPE26Z4H8RE5MA96","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/four-leg-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7RAJ9SADEZ7K1W7XTH1","name":"Display Stands","handle":"board-stands-stands"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:42.727801+00:00","description":"The Four Leg Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSE29RMSN80PZWR3WE52W":{"tiers":[],"amount":4510,"prior_price":null},"variant_01M7WWSE33GEAQZTX23DYJ5Z4K":{"tiers":[],"amount":4510,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSD70Y0S1QRZ393JJ7D12","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Four Line & Square Line Practice Board","width":null,"handle":"four-line-square-line-practice-board","height":null,"images":[{"id":"img_01M81YFSEG8GK5V68A22SB2Z2B","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/four-line-square-line-practice-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSD76NEBPYHCCYK86K72D","title":"Size","values":[{"id":"optval_01M7WWSD7DJW9MFQ6DRBNDK711","value":"Standard size"},{"id":"optval_01M7WWSD7HSCJ4TP9GKHXH5N7V","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSD8H4EBFS79WKKT5VR4D","sku":"FOUR-LINE-SQUARE-LINE-PRACTICE-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":690,"is_tax_inclusive":false,"calculated_amount":690},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSD76NEBPYHCCYK86K72D","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSD9CGGX1WFZTTP2R13SM","sku":"FOUR-LINE-SQUARE-LINE-PRACTICE-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":690,"is_tax_inclusive":false,"calculated_amount":690},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSD76NEBPYHCCYK86K72D","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/four-line-square-line-practice-board","attributes":[{"key":"line_layout","value":"Four line and square grid sections"},{"key":"line_marking","value":"Provided as per School / Customer Requirements"},{"key":"surface","value":"Smooth Writing Surface Suitable for Daily Classroom Use"}],"categories":[{"id":"pcat_01M7WWS7QZAEK9B31MH8XVGGWA","name":"Board & Study Essentials","handle":"board-study-essentials"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:39.014956+00:00","description":"The Four Line & Square Line Practice Board is specially designed for handwriting improvement and ensures proper letter size, spacing and alignment. Its square grid section supports accurate number writing and basic maths practice. Line marking is provided as per school / customer requirements, on a smooth writing surface suitable for daily classroom use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSD8H4EBFS79WKKT5VR4D":{"tiers":[],"amount":690,"prior_price":null},"variant_01M7WWSD9CGGX1WFZTTP2R13SM":{"tiers":[],"amount":690,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCBCN7HGZRKF865DX339","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Graphic MDF Base Clipboard","width":null,"handle":"graphic-mdf-base-clipboard","height":null,"images":[{"id":"img_01M81YFMMC94G1TN5ER6WMNKEX","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/graphic-mdf-base-clipboard","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCBJ86TT117ZBCRFYJ9S","title":"Size","values":[{"id":"optval_01M7WWSCBR7QAGS23ZG6BA3AG5","value":"Standard size"},{"id":"optval_01M7WWSCBW7A3M1V7W82HW2H5E","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCCWNBNX35S085SPDZFM","sku":"GRAPHIC-MDF-BASE-CLIPBOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":420,"is_tax_inclusive":false,"calculated_amount":420},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCBJ86TT117ZBCRFYJ9S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCDN31CGVF9E4KCCH9RE","sku":"GRAPHIC-MDF-BASE-CLIPBOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":420,"is_tax_inclusive":false,"calculated_amount":420},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCBJ86TT117ZBCRFYJ9S","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/graphic-mdf-base-clipboard","attributes":[{"key":"base","value":"Graphic MDF Base"},{"key":"clip","value":"Chrome Electroplated Clip — Rust-Resistant Finish"},{"key":"printing","value":"Premium Graphic Printing — Sharp & Fade-Resistant"},{"key":"rivets","value":"Dual-Side Cap Rivets — Uniform Finish on Both Sides"}],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"},{"id":"pcat_01M7WWS7RN6AXVYARFMB4EEYG5","name":"MDF Base","handle":"clipboards-mdf"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:34.085588+00:00","description":"Graphic MDF base with premium graphic printing that is sharp and fade-resistant, a Chrome Electroplated Clip and Dual-Side Cap Rivets.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCCWNBNX35S085SPDZFM":{"tiers":[],"amount":420,"prior_price":null},"variant_01M7WWSCDN31CGVF9E4KCCH9RE":{"tiers":[],"amount":420,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSDA4GBK6HRFG41KXJ8E0","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Grooved Boards","width":null,"handle":"grooved-boards","height":null,"images":[{"id":"img_01M81YFSYK6XZAXD33YQKCAPQQ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/grooved-boards","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSDAA77CC83VP9SDT331F","title":"Size","values":[{"id":"optval_01M7WWSDAGEFK6KRF13KJFR776","value":"Standard size"},{"id":"optval_01M7WWSDANZ7VG4V0MSA4YMDK9","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSDBPDNVGHBH7MQ4JY672","sku":"GROOVED-BOARDS-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":2910,"is_tax_inclusive":false,"calculated_amount":2910},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSDAA77CC83VP9SDT331F","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDCGZX10EE3EPJ5SKRZ0","sku":"GROOVED-BOARDS-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":2910,"is_tax_inclusive":false,"calculated_amount":2910},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSDAA77CC83VP9SDT331F","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/grooved-boards","attributes":[{"key":"sizes","value":"Nine sizes in landscape and portrait"}],"categories":[{"id":"pcat_01M7WWS7R3S2GQ82DAZXBMFN9B","name":"Display Boards","handle":"display-boards"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:39.5313+00:00","description":"Grooved Boards are suitable for use in hotels, reception areas, leisure centres and similar spaces, and are available in nine sizes in landscape and portrait orientation.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSDBPDNVGHBH7MQ4JY672":{"tiers":[],"amount":2910,"prior_price":null},"variant_01M7WWSDCGZX10EE3EPJ5SKRZ0":{"tiers":[],"amount":2910,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCQFP1QDJQJ1JK7G63HF","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Heavy Duty Clear Acrylic Clipboard","width":null,"handle":"heavy-duty-clear-acrylic-clipboard","height":null,"images":[{"id":"img_01M81YFPNYV6087AYTXPGDCFV9","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/heavy-duty-clear-acrylic-clipboard","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCQNECRMVGJ63T15DNJN","title":"Size","values":[{"id":"optval_01M7WWSCQVXASS8103B1ZMTS3X","value":"Standard size"},{"id":"optval_01M7WWSCQZKR9JHG4Q24SFD25P","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCRZEWX9FRHYJKZN33DP","sku":"HEAVY-DUTY-CLEAR-ACRYLIC-CLIPBOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":490,"is_tax_inclusive":false,"calculated_amount":490},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCQNECRMVGJ63T15DNJN","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCSR0WNXE92D34JVEW7R","sku":"HEAVY-DUTY-CLEAR-ACRYLIC-CLIPBOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":490,"is_tax_inclusive":false,"calculated_amount":490},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCQNECRMVGJ63T15DNJN","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/heavy-duty-clear-acrylic-clipboard","attributes":[{"key":"base","value":"Heavy-Duty Clear Acrylic — High Impact Strength & Shatter-Resistant"}],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"},{"id":"pcat_01M7WWS7RSW0ATVM0VCHZAPB88","name":"Acrylic Base","handle":"clipboards-acrylic"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:36.184028+00:00","description":"Heavy-duty clear acrylic clipboard with high impact strength and a shatter-resistant build.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCRZEWX9FRHYJKZN33DP":{"tiers":[],"amount":490,"prior_price":null},"variant_01M7WWSCSR0WNXE92D34JVEW7R":{"tiers":[],"amount":490,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSDGESND7DDEM26S654Q2","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Key Hanger Board","width":null,"handle":"key-hanger-board","height":null,"images":[{"id":"img_01M81YFTYZ1A97N0WFCHY5BGQM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/key-hanger-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSDGMM11A93F8DRJDJWTT","title":"Size","values":[{"id":"optval_01M7WWSDGT9YA3G8AFZ5CW9Q33","value":"Standard size"},{"id":"optval_01M7WWSDGZ3NZ1A82S15ABZGRW","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSDJ0VGEW024AG2GS2A4Q","sku":"KEY-HANGER-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":770,"is_tax_inclusive":false,"calculated_amount":770},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSDGMM11A93F8DRJDJWTT","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDJTWT0NYTFFSBS5JHMF","sku":"KEY-HANGER-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":770,"is_tax_inclusive":false,"calculated_amount":770},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSDGMM11A93F8DRJDJWTT","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/key-hanger-board","attributes":[{"key":"size_1_x_1p5_ft","value":"15 / 20 Keys"},{"key":"size_1p5_x_2_ft","value":"30 Keys"},{"key":"size_2_x_2_ft","value":"50 Keys"},{"key":"size_2_x_3_ft","value":"100 Keys"},{"key":"size_3_x_4_ft","value":"150 Keys"}],"categories":[{"id":"pcat_01M7WWS7QZAEK9B31MH8XVGGWA","name":"Board & Study Essentials","handle":"board-study-essentials"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:40.569185+00:00","description":"The Key Hanger Board is a secure key management system with locking facility. A lockable acrylic door gives clear visibility of keys, in a professional and durable design suitable for offices, companies and workshops.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSDJ0VGEW024AG2GS2A4Q":{"tiers":[],"amount":770,"prior_price":null},"variant_01M7WWSDJTWT0NYTFFSBS5JHMF":{"tiers":[],"amount":770,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSC8DX524GMASE2GYNBBB","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Laminate MDF Base Clipboard (Wood Finish)","width":null,"handle":"laminate-mdf-base-clipboard","height":null,"images":[{"id":"img_01M81YFM38T4BQKD3YHHXBBNGY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/laminate-mdf-base-clipboard","rank":0},{"id":"img_01M81YFM3AMZY2KS5TV20G955S","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/laminate-mdf-base-clipboard-2","rank":1},{"id":"img_01M81YFM3CXAD09VGYBV2JKPZG","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/laminate-mdf-base-clipboard-3","rank":2}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSC8J182G97RV6BCJRAR9","title":"Size","values":[{"id":"optval_01M7WWSC8RQQ5D5JXAX2ZXKPBR","value":"Standard size"},{"id":"optval_01M7WWSC8WM1K9AFWXFNJZ7EB1","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSC9WNZQD7EMSSAT7GDVK","sku":"LAMINATE-MDF-BASE-CLIPBOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":430,"is_tax_inclusive":false,"calculated_amount":430},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSC8J182G97RV6BCJRAR9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCAN4M4T84YWKJTYDSHE","sku":"LAMINATE-MDF-BASE-CLIPBOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":430,"is_tax_inclusive":false,"calculated_amount":430},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSC8J182G97RV6BCJRAR9","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/laminate-mdf-base-clipboard","attributes":[{"key":"base","value":"Laminate MDF Base (Wood Finish) — HPL Sheet Wood Grade"},{"key":"clip","value":"Chrome Electroplated Clip — Rust-Resistant Finish"},{"key":"finish","value":"Smooth & Premium Appearance — Uniform Finish on Both Sides"},{"key":"edge","value":"Rounded Edge — Safe & Clean Finish"},{"key":"rivets","value":"Dual-Side Cap Rivets"}],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"},{"id":"pcat_01M7WWS7RN6AXVYARFMB4EEYG5","name":"MDF Base","handle":"clipboards-mdf"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:33.536039+00:00","description":"The Laminate MDF Base Clipboard (Wood Finish) uses an HPL Sheet Wood Grade base for a smooth and premium appearance with a uniform finish on both sides. A Chrome Electroplated Clip with rust-resistant finish, Dual-Side Cap Rivets and rounded edges for a safe and clean finish complete the design.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSC9WNZQD7EMSSAT7GDVK":{"tiers":[],"amount":430,"prior_price":null},"variant_01M7WWSCAN4M4T84YWKJTYDSHE":{"tiers":[],"amount":430,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSEVDYC7Q350JWGV029T6","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Letter Box","width":null,"handle":"letter-box","height":null,"images":[{"id":"img_01M81YG0AAXT6SZWSEXKHQX6RB","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/letter-box","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSEVKEZW3RXDHYZG02GGP","title":"Size","values":[{"id":"optval_01M7WWSEVTXF791YQRTY9M72PY","value":"Standard size"},{"id":"optval_01M7WWSEVZRDB4DTYBDDQ2PXNF","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSEX4R1M02XSWVNYH6MHJ","sku":"LETTER-BOX-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":3690,"is_tax_inclusive":false,"calculated_amount":3690},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSEVKEZW3RXDHYZG02GGP","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSEY0DF9C1KF2PT8E7B3M","sku":"LETTER-BOX-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":3690,"is_tax_inclusive":false,"calculated_amount":3690},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSEVKEZW3RXDHYZG02GGP","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/letter-box","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7REYZ7MRJE57JYQAX4K","name":"Storage & Racks","handle":"board-stands-storage"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:46.05083+00:00","description":"The Letter Box is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSEX4R1M02XSWVNYH6MHJ":{"tiers":[],"amount":3690,"prior_price":null},"variant_01M7WWSEY0DF9C1KF2PT8E7B3M":{"tiers":[],"amount":3690,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSDKMPJV6MG5S858T44G7","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Letters and Figures Set","width":null,"handle":"letters-and-figures-set","height":null,"images":[{"id":"img_01M81YFVCP2ARHKPMAJKYSD32T","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/letters-and-figures-set","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSDKTE96D2B9MN3Z39TKZ","title":"Size","values":[{"id":"optval_01M7WWSDM133ZSXRTFQFRES96R","value":"Standard size"},{"id":"optval_01M7WWSDM5YTQ4CND1BB8KWDX4","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSDN7KNFFB3XKWNSH1YZN","sku":"LETTERS-AND-FIGURES-SET-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":2490,"is_tax_inclusive":false,"calculated_amount":2490},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSDKTE96D2B9MN3Z39TKZ","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDP2C6M91ERQ4C7YAK4S","sku":"LETTERS-AND-FIGURES-SET-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":2490,"is_tax_inclusive":false,"calculated_amount":2490},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSDKTE96D2B9MN3Z39TKZ","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/letters-and-figures-set","attributes":[{"key":"letters_a_e_i_o","value":"5 each — 20 pcs"},{"key":"letters_c_n_r_s_t","value":"4 each — 20 pcs"},{"key":"letters_b_d_f_g_h_k","value":"3 each — 18 pcs"},{"key":"letters_l_m_p_u_w_y","value":"3 each — 18 pcs"},{"key":"letters_j_q_v","value":"2 each — 06 pcs"},{"key":"letters_x_z","value":"1 each — 02 pcs"},{"key":"punctuation_symbols","value":"Remaining pieces of the set (. , {} & % / and others)"},{"key":"letters_set_total","value":"112 pcs"},{"key":"figures_1_5_0","value":"14 each — 42 pcs"},{"key":"figure_2","value":"10 pcs"},{"key":"figures_3_4_6","value":"8 each — 24 pcs"},{"key":"figures_7_8_9","value":"8 each — 24 pcs"},{"key":"figures_set_total","value":"100 pcs"}],"categories":[{"id":"pcat_01M7WWS7R3S2GQ82DAZXBMFN9B","name":"Display Boards","handle":"display-boards"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:41.007418+00:00","description":"The display board range includes a letters set of 112 pieces and a figures set of 100 pieces, each offered in 12 mm, 18 mm, 24 mm and 36 mm letter sizes.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSDN7KNFFB3XKWNSH1YZN":{"tiers":[],"amount":2490,"prior_price":null},"variant_01M7WWSDP2C6M91ERQ4C7YAK4S":{"tiers":[],"amount":2490,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSEMKRDJRRBFNTX2JRHBJ","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Magazine Stand","width":null,"handle":"magazine-stand","height":null,"images":[{"id":"img_01M81YFZFSH04BFG6148194303","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/magazine-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSEMSCP3JNZR203DPFPJM","title":"Size","values":[{"id":"optval_01M7WWSEN0SE25MYY74XAAD5TC","value":"Standard size"},{"id":"optval_01M7WWSEN5JGR3PJ37JMXXSNQJ","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSEP81NJVPKZVZ7M1D2JC","sku":"MAGAZINE-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":3640,"is_tax_inclusive":false,"calculated_amount":3640},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSEMSCP3JNZR203DPFPJM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSEQ4H7F573AKHZTZ8KGC","sku":"MAGAZINE-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":3640,"is_tax_inclusive":false,"calculated_amount":3640},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSEMSCP3JNZR203DPFPJM","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/magazine-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7REYZ7MRJE57JYQAX4K","name":"Storage & Racks","handle":"board-stands-storage"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:45.202526+00:00","description":"The Magazine Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSEP81NJVPKZVZ7M1D2JC":{"tiers":[],"amount":3640,"prior_price":null},"variant_01M7WWSEQ4H7F573AKHZTZ8KGC":{"tiers":[],"amount":3640,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS8CHDT5Y9ZM7FHYR7ZWN","tags":[{"id":"ptag_01M7WWS8DBA7FX4Y24BNA2ST3D","value":"ceramic"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Metallic Premium Ceramic Board","width":null,"handle":"metallic-premium-ceramic-board","height":null,"images":[{"id":"img_01M81YF8H1M4C8V4F4162ESWYT","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board","rank":0},{"id":"img_01M81YF8H3D70XWBJFTVA18J4J","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board-2","rank":1},{"id":"img_01M81YF8H53GB27X5RQ4JRZTNY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board-3","rank":2},{"id":"img_01M81YF8H6KCS5QG31YTW139V3","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board-4","rank":3},{"id":"img_01M81YF8H84V6DY2DPWXSWHP9M","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board-5","rank":4},{"id":"img_01M81YF8HAKY1WFR446WG1B3M4","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board-6","rank":5},{"id":"img_01M81YF8HB5QZ6JFR69Z7N45VQ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS8CPWHWWKJPTE6TQZ0NC","title":"Size","values":[{"id":"optval_01M7WWS8CTS1NZJ92SRWAA5MCF","value":"3 x 4 ft"},{"id":"optval_01M7WWS8CXSXH52Y8NKPJR5Y57","value":"4 x 4 ft"},{"id":"optval_01M7WWS8D0Y62AH2YJ1C1K4AHQ","value":"5 x 4 ft"},{"id":"optval_01M7WWS8D3C49A774A8MW8632D","value":"6 x 4 ft"},{"id":"optval_01M7WWS8D5GFMTZHHXWYFAYBFZ","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS8DX8CYVCZNTX39S3EG8","sku":"METALLIC-PREMIUM-CERAMIC-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS8CPWHWWKJPTE6TQZ0NC","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8EE5HCHNA10KRV7PF53","sku":"METALLIC-PREMIUM-CERAMIC-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS8CPWHWWKJPTE6TQZ0NC","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8EYVV47G7PEZ58B4VRM","sku":"METALLIC-PREMIUM-CERAMIC-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS8CPWHWWKJPTE6TQZ0NC","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8FFH9P2ZVFX5PJW5HMA","sku":"METALLIC-PREMIUM-CERAMIC-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS8CPWHWWKJPTE6TQZ0NC","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8FZ9DHW1R9N3YYMP8XR","sku":"METALLIC-PREMIUM-CERAMIC-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS8CPWHWWKJPTE6TQZ0NC","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-board","attributes":[{"key":"type","value":"Ceramic Steel Magnetic Board"},{"key":"surface","value":"Ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options"},{"key":"product_life","value":"Designed for very long product life under regular institutional use"},{"key":"performance","value":"Hard, non-porous surface suitable for continuous writing and frequent cleaning"},{"key":"finish","value":"Smooth writing surface with consistent performance over time"},{"key":"maintenance","value":"Easy to clean and maintain for daily classroom use"},{"key":"design","value":"Aluminium frame with Signature Dual-Tone Corners"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-white-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PNZ5KK0DQ412K4TZAK","name":"Ceramic White Boards","handle":"white-boards-ceramic"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:21.688957+00:00","description":"The Metallic Premium Ceramic Board has a ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options. The hard, non-porous surface is suitable for continuous writing and frequent cleaning, with consistent performance over time, and is designed for very long product life under regular institutional use. Aluminium frame with Signature Dual-Tone Corners.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS8DX8CYVCZNTX39S3EG8":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS8EE5HCHNA10KRV7PF53":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS8EYVV47G7PEZ58B4VRM":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS8FFH9P2ZVFX5PJW5HMA":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS8FZ9DHW1R9N3YYMP8XR":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS8GHBF9RW42KNPEEM709","tags":[{"id":"ptag_01M7WWS8DBA7FX4Y24BNA2ST3D","value":"ceramic"},{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Metallic Premium Ceramic Chalk Board","width":null,"handle":"metallic-premium-ceramic-chalk-board","height":null,"images":[{"id":"img_01M81YF938FXB1PNBYW5YHJ1ZJ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board","rank":0},{"id":"img_01M81YF93BN533EVTE2PV8P29E","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board-2","rank":1},{"id":"img_01M81YF93CAY3819MJXNQ7BBHR","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board-3","rank":2},{"id":"img_01M81YF93FY36Z3RCTA0X2JXH7","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board-4","rank":3},{"id":"img_01M81YF93HK9Y9C6BHD468EKS1","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board-5","rank":4},{"id":"img_01M81YF93JW88NM8B2286DXWF9","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board-6","rank":5},{"id":"img_01M81YF93MQK3QA5KKH0F0P8YW","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS8GQE5C51QP3R0PPACP3","title":"Size","values":[{"id":"optval_01M7WWS8GVSZ6PPQJ74Z9G3HH0","value":"3 x 4 ft"},{"id":"optval_01M7WWS8GY8PYZXS231XTW2575","value":"4 x 4 ft"},{"id":"optval_01M7WWS8H12FBTBG1VF8AMMRGQ","value":"5 x 4 ft"},{"id":"optval_01M7WWS8H418X5JF6Q5AV0EENQ","value":"6 x 4 ft"},{"id":"optval_01M7WWS8H71T3DT356JVGEZ8ET","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS8HY2VVKGX9KKXKP4S7W","sku":"METALLIC-PREMIUM-CERAMIC-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS8GQE5C51QP3R0PPACP3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8JFSAXXSZDQHBGWSZR1","sku":"METALLIC-PREMIUM-CERAMIC-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS8GQE5C51QP3R0PPACP3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8K0DYKYVA3MKDHRZ0S4","sku":"METALLIC-PREMIUM-CERAMIC-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS8GQE5C51QP3R0PPACP3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8KHYHFWFF3RWDNGPED8","sku":"METALLIC-PREMIUM-CERAMIC-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS8GQE5C51QP3R0PPACP3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8M2JA2A578NAJW5XGCS","sku":"METALLIC-PREMIUM-CERAMIC-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS8GQE5C51QP3R0PPACP3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-ceramic-chalk-board","attributes":[{"key":"type","value":"Ceramic Steel Magnetic Chalk Board"},{"key":"surface","value":"Ceramic steel / porcelain enamel green chalk surface; accepts magnets"},{"key":"product_life","value":"Designed for very long product life under regular institutional use"},{"key":"design","value":"Aluminium frame with Signature Dual-Tone Corners"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-ceramic-chalk-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7Q6DQE5CV93E16K4NRY","name":"Ceramic Chalk Boards","handle":"chalk-boards-ceramic"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:22.273961+00:00","description":"The Metallic Premium Ceramic Chalk Board has a porcelain enamel / ceramic steel green surface that accepts magnets. The ultra-hard, scratch-resistant surface is built for decades of intensive institutional use with glare-free chalk writing and effortless cleaning. Heavy-duty aluminium framing with Signature Dual-Tone Corners.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS8HY2VVKGX9KKXKP4S7W":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS8JFSAXXSZDQHBGWSZR1":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS8K0DYKYVA3MKDHRZ0S4":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS8KHYHFWFF3RWDNGPED8":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS8M2JA2A578NAJW5XGCS":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS8147FFAM8KEFQ7NZ882","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Metallic Premium Chalk Board","width":null,"handle":"metallic-premium-chalk-board","height":null,"images":[{"id":"img_01M81YF6VDF5NS7WE1QKE84GNV","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board","rank":0},{"id":"img_01M81YF6VKF0ATT3YG6AY5BC00","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board-2","rank":1},{"id":"img_01M81YF6VN8EZN659YSFQK69Q8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board-3","rank":2},{"id":"img_01M81YF6VRKY8G6D8F0D15BS2H","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board-4","rank":3},{"id":"img_01M81YF6VTC5A46GRHMNHTDJG4","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board-5","rank":4},{"id":"img_01M81YF6VYWPW8J4QBJYCZ3QRY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board-6","rank":5},{"id":"img_01M81YF6W1PJC7977CPK01AB1E","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS818FRF1NXJ8ECJMPBB6","title":"Size","values":[{"id":"optval_01M7WWS81DD0BHXVKKTYJR3C3T","value":"3 x 4 ft"},{"id":"optval_01M7WWS81GW0VNE2PG9001T7S8","value":"4 x 4 ft"},{"id":"optval_01M7WWS81J7453SVGH3BJA97CT","value":"5 x 4 ft"},{"id":"optval_01M7WWS81N6KWG7Q0C35J7BX3S","value":"6 x 4 ft"},{"id":"optval_01M7WWS81R38SCVG5X02N094KX","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS82GCCR77XTYH4RMWRVN","sku":"METALLIC-PREMIUM-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS818FRF1NXJ8ECJMPBB6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS831DS5V9BTHBB2NFY10","sku":"METALLIC-PREMIUM-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS818FRF1NXJ8ECJMPBB6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS83GS9MMZH1R4VAF85EK","sku":"METALLIC-PREMIUM-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS818FRF1NXJ8ECJMPBB6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS840G4Z5GA0TKTM6GH81","sku":"METALLIC-PREMIUM-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS818FRF1NXJ8ECJMPBB6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS84FCM6NQ4SD6C1AY9EG","sku":"METALLIC-PREMIUM-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS818FRF1NXJ8ECJMPBB6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-chalk-board","attributes":[{"key":"type","value":"Non-Magnetic Chalk Board"},{"key":"material","value":"High-quality materials with rigid core construction"},{"key":"design","value":"Heavy-duty aluminium framing with Signature Dual-Tone Corners"},{"key":"surface","value":"Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance; non-reflective, glare-free, with clear visibility from all angles"},{"key":"durability","value":"Designed for intensive daily institutional use"},{"key":"installation","value":"Wall-mountable, easy to install"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-chalk-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7PXMEEH6PBRZAHQ0W2N","name":"Non-Magnetic Chalk Boards","handle":"chalk-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:19.958769+00:00","description":"The Metallic Premium Chalk Board is made from high-quality materials with rigid core construction. Heavy-duty aluminium framing with Signature Dual-Tone Corners surrounds a Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance — non-reflective, glare-free, with clear visibility from all angles. Designed for intensive daily institutional use and wall-mountable for easy installation.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS82GCCR77XTYH4RMWRVN":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS831DS5V9BTHBB2NFY10":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS83GS9MMZH1R4VAF85EK":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS840G4Z5GA0TKTM6GH81":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS84FCM6NQ4SD6C1AY9EG":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS84Z5EJ7N0M5DRA919BK","tags":[{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"},{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"}],"type":null,"title":"Metallic Premium Magnetic Board","width":null,"handle":"metallic-premium-magnetic-board","height":null,"images":[{"id":"img_01M81YF7ERK1VNRAVQ0XJ1MDEA","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board","rank":0},{"id":"img_01M81YF7ETWJ7QW1HD1P7P40JY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board-2","rank":1},{"id":"img_01M81YF7EW4WWF5SAT9HSN3WS2","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board-3","rank":2},{"id":"img_01M81YF7EYEKAXFR5PFHWF7YPK","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board-4","rank":3},{"id":"img_01M81YF7F0NKX5EPXMQG2G59SP","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board-5","rank":4},{"id":"img_01M81YF7F222QEHGQB3D8ATTNB","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board-6","rank":5},{"id":"img_01M81YF7F5HM7XD5CG16W38J6J","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS854ZCXQFN48QXKXPT45","title":"Size","values":[{"id":"optval_01M7WWS858YH730GT3GHQ6X9TW","value":"3 x 4 ft"},{"id":"optval_01M7WWS85BCPPYGJ7J0PJ747M8","value":"4 x 4 ft"},{"id":"optval_01M7WWS85E5664CXZSZW6Z420B","value":"5 x 4 ft"},{"id":"optval_01M7WWS85GPE61SNB583DZH5RM","value":"6 x 4 ft"},{"id":"optval_01M7WWS85K6X5Y2R73102SY1DF","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS869JCCJ7XDV7DKAR93N","sku":"METALLIC-PREMIUM-MAGNETIC-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS854ZCXQFN48QXKXPT45","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS86SKVSR353FXDX1DV4T","sku":"METALLIC-PREMIUM-MAGNETIC-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS854ZCXQFN48QXKXPT45","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS879Z8P7V332BNEHKD1C","sku":"METALLIC-PREMIUM-MAGNETIC-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS854ZCXQFN48QXKXPT45","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS87RNB3C78Q24M5ARSRV","sku":"METALLIC-PREMIUM-MAGNETIC-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS854ZCXQFN48QXKXPT45","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS888YH0XNF3XT8P8MWE0","sku":"METALLIC-PREMIUM-MAGNETIC-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS854ZCXQFN48QXKXPT45","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-board","attributes":[{"key":"type","value":"Resin Coated Steel Magnetic Board"},{"key":"surface","value":"Resin coated writing surface suitable for marker (white) and chalk (green) boards"},{"key":"magnetic_use","value":"Compatible with magnetic accessories such as magnets, charts, and holders"},{"key":"design","value":"Heavy-duty aluminium framing with Signature Dual-Tone Corners"},{"key":"finish","value":"Smooth writing surface for regular writing and erasing"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-white-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PHP0Y7RH2Y21PXANWK","name":"Magnetic White Boards","handle":"white-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:20.590073+00:00","description":"The Metallic Premium Magnetic Board is a Resin Coated Steel Magnetic Board that accepts magnets. Its resin coated writing surface is suitable for marker (white) and chalk (green) boards and is compatible with magnetic accessories such as magnets, charts and holders. Heavy-duty aluminium framing with Signature Dual-Tone Corners surrounds a smooth writing surface for regular writing and erasing.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS869JCCJ7XDV7DKAR93N":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS86SKVSR353FXDX1DV4T":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS879Z8P7V332BNEHKD1C":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS87RNB3C78Q24M5ARSRV":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS888YH0XNF3XT8P8MWE0":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS88RJ2GQ81KJF7S4TF8V","tags":[{"id":"ptag_01M7WWS81T89S2VS8V22XWDC1T","value":"chalk"},{"id":"ptag_01M7WWS85PCQDD44CAJSPX4G55","value":"magnetic"},{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"}],"type":null,"title":"Metallic Premium Magnetic Chalk Board","width":null,"handle":"metallic-premium-magnetic-chalk-board","height":null,"images":[{"id":"img_01M81YF80PEJQ6MMGBG3V3ND1C","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board","rank":0},{"id":"img_01M81YF80R187WY499NAN9R0EJ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board-2","rank":1},{"id":"img_01M81YF80T1HQC6VXH09EEWXSS","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board-3","rank":2},{"id":"img_01M81YF80X9QGT8WNY8NGJP7MB","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board-4","rank":3},{"id":"img_01M81YF80ZNF5F94RR4M1PZY51","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board-5","rank":4},{"id":"img_01M81YF8116KMJZ8FS6XWGK770","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board-6","rank":5},{"id":"img_01M81YF812XA945XK9XVW4AAMR","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS88X1W18Z4YD3HQ8PWC2","title":"Size","values":[{"id":"optval_01M7WWS891JHXXR3EAVKSHAR8Z","value":"3 x 4 ft"},{"id":"optval_01M7WWS894F97ECBGQ90ZTRD2J","value":"4 x 4 ft"},{"id":"optval_01M7WWS897262DYN1WHD0EH94W","value":"5 x 4 ft"},{"id":"optval_01M7WWS89AN3ZWAMCNTC46QBT7","value":"6 x 4 ft"},{"id":"optval_01M7WWS89C696RW7JMYJ93PPY9","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS8A15MTTAJWC7YF5V9BK","sku":"METALLIC-PREMIUM-MAGNETIC-CHALK-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS88X1W18Z4YD3HQ8PWC2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8AH854CS3PN6CSWX553","sku":"METALLIC-PREMIUM-MAGNETIC-CHALK-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS88X1W18Z4YD3HQ8PWC2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8B1C5C7YV9SVBNX83MK","sku":"METALLIC-PREMIUM-MAGNETIC-CHALK-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS88X1W18Z4YD3HQ8PWC2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8BHNPX6PWX74FC33D0X","sku":"METALLIC-PREMIUM-MAGNETIC-CHALK-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS88X1W18Z4YD3HQ8PWC2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8C1T8D9AGK9JJ422MT3","sku":"METALLIC-PREMIUM-MAGNETIC-CHALK-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS88X1W18Z4YD3HQ8PWC2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-magnetic-chalk-board","attributes":[{"key":"type","value":"Resin Coated Steel Magnetic Chalk Board"},{"key":"surface","value":"Resin coated green chalk surface; accepts magnets"},{"key":"magnetic_use","value":"Compatible with magnetic pins, dusters, and charts"},{"key":"design","value":"Heavy-duty aluminium framing with Signature Dual-Tone Corners"},{"key":"finish","value":"Smooth green writing surface for regular chalk writing and erasing"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-magnetic-chalk-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ","name":"Chalk Boards","handle":"chalk-boards"},{"id":"pcat_01M7WWS7Q2B6W1HSYG9XKR3MC8","name":"Magnetic Chalk Boards","handle":"chalk-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:21.166785+00:00","description":"The Metallic Premium Magnetic Chalk Board is a Resin Coated Steel Magnetic Board designed for chalk writing. It accepts magnets and is compatible with magnetic accessories such as magnetic pins, charts, and holders. Heavy-duty aluminium framing with Signature Dual-Tone Corners surrounds a durable, non-reflective green chalk surface.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS8A15MTTAJWC7YF5V9BK":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS8AH854CS3PN6CSWX553":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS8B1C5C7YV9SVBNX83MK":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS8BHNPX6PWX74FC33D0X":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS8C1T8D9AGK9JJ422MT3":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS8MKKEJKB7M78E993126","tags":[{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"},{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWS8N92PPW5JT3EBQFGSNA","value":"pin-up"}],"type":null,"title":"Metallic Premium Notice Board","width":null,"handle":"metallic-premium-notice-board","height":null,"images":[{"id":"img_01M81YF9ND5S2DZNE3D7HTKWK7","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board","rank":0},{"id":"img_01M81YF9NJ9KB8W7ZKJGY2YRWM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board-2","rank":1},{"id":"img_01M81YF9NNS4VQ11QCQMEAHQVF","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board-3","rank":2},{"id":"img_01M81YF9NQ5EBJG6DDGPETAKHR","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board-4","rank":3},{"id":"img_01M81YF9NSAH01FZ2PW80N25HM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board-5","rank":4},{"id":"img_01M81YF9NW2JCY4CSTR99ZJCB5","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board-6","rank":5},{"id":"img_01M81YF9NYBQ2GBW51CSWMV0HA","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS8MQGMJPNVAATW43E3K2","title":"Size","values":[{"id":"optval_01M7WWS8MW1NPD8XEX7AXG1CXP","value":"3 x 4 ft"},{"id":"optval_01M7WWS8MZFAK0GKP68GYDJTBQ","value":"4 x 4 ft"},{"id":"optval_01M7WWS8N2NFHFHY5YS9KDJFB8","value":"5 x 4 ft"},{"id":"optval_01M7WWS8N5FX7J6XPZ81H31PH9","value":"6 x 4 ft"},{"id":"optval_01M7WWS8N8G2SKWZHXWMV3XWZK","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS8P1BG322ZQDYQGKS81C","sku":"METALLIC-PREMIUM-NOTICE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS8MQGMJPNVAATW43E3K2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8PJ2M3ZMF6B1SH3BMTW","sku":"METALLIC-PREMIUM-NOTICE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS8MQGMJPNVAATW43E3K2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8Q32V0FGFT1CACPQ2JY","sku":"METALLIC-PREMIUM-NOTICE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS8MQGMJPNVAATW43E3K2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8QNNQJQ1H3TBZNGJ0WX","sku":"METALLIC-PREMIUM-NOTICE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS8MQGMJPNVAATW43E3K2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8R639J8QZPESZ5BPNNT","sku":"METALLIC-PREMIUM-NOTICE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS8MQGMJPNVAATW43E3K2","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-notice-board","attributes":[{"key":"material","value":"Premium aluminium construction with Signature Dual-Tone Corners"},{"key":"surface","value":"2 mm Blazer Cloth with long-lasting colour retention"},{"key":"core","value":"Soft pin-friendly core for frequent and heavy pin usage"},{"key":"durability","value":"Highest grade, designed for long-term institutional use"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-notice-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7QDBE07027DZ4ENKH9A","name":"Notice Boards","handle":"notice-boards"},{"id":"pcat_01M7WWS7QH8BPCS17YKQDTRBN8","name":"Pin-Up Boards","handle":"notice-boards-pin-up"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:22.843403+00:00","description":"The Metallic Premium Notice Board combines premium aluminium construction and Signature Dual-Tone Corners with 2 mm Blazer Cloth that offers long-lasting colour retention. Its soft pin-friendly core is made for frequent and heavy pin usage. Highest grade, designed for long-term institutional use.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS8P1BG322ZQDYQGKS81C":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS8PJ2M3ZMF6B1SH3BMTW":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS8Q32V0FGFT1CACPQ2JY":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS8QNNQJQ1H3TBZNGJ0WX":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS8R639J8QZPESZ5BPNNT":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWS7T7YGNHA4NVSCT5W9XK","tags":[{"id":"ptag_01M7WWS7VS0Q6Q6Z3RBXHRES3Z","value":"marker"},{"id":"ptag_01M7WWS7VZSH06W8Y5SC7C24J1","value":"metallic-premium"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"}],"type":null,"title":"Metallic Premium White Board","width":null,"handle":"metallic-premium-white-board","height":null,"images":[{"id":"img_01M81YF64785ZT2NHS7TBFNCR4","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board","rank":0},{"id":"img_01M81YF654QY1FQQ287HH3N2S0","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board-2","rank":1},{"id":"img_01M81YF65794TBWK3VC1RZ1S6N","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board-3","rank":2},{"id":"img_01M81YF6594DBBG44SQKFXRAKE","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board-4","rank":3},{"id":"img_01M81YF65EWCK9ZACHQFHWK6BC","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board-5","rank":4},{"id":"img_01M81YF65GGBDJFAE5GCMK31CY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board-6","rank":5},{"id":"img_01M81YF65JKTE0VVBVY3X6TCRY","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board-7","rank":6}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWS7TSM8ERY0V3RPPG2VQE","title":"Size","values":[{"id":"optval_01M7WWS7V636PZHVC7FWA7VPYG","value":"3 x 4 ft"},{"id":"optval_01M7WWS7VAX2ZVQPX5YED99X9W","value":"4 x 4 ft"},{"id":"optval_01M7WWS7VDHRHD9N7SE8GTN0QF","value":"5 x 4 ft"},{"id":"optval_01M7WWS7VGE1D5ATBCG81YP5ZS","value":"6 x 4 ft"},{"id":"optval_01M7WWS7VKB82VFG503YH9AKCC","value":"8 x 4 ft"}]}],"material":"Aluminium anodized frame, heavy-duty","metadata":{},"pairings":{},"subtitle":"High Gloss Marker Grade HPL Sheet","variants":[{"id":"variant_01M7WWS7XA3SBX2XRNGSYC28D8","sku":"METALLIC-PREMIUM-WHITE-BOARD-3-X-4-FT","price":{"currency_code":"inr","original_amount":4020,"is_tax_inclusive":false,"calculated_amount":4020},"title":"3 x 4 ft","options":[{"value":"3 x 4 ft","option_id":"opt_01M7WWS7TSM8ERY0V3RPPG2VQE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS7YZ32S8J43QKY3WX9TH","sku":"METALLIC-PREMIUM-WHITE-BOARD-4-X-4-FT","price":{"currency_code":"inr","original_amount":5060,"is_tax_inclusive":false,"calculated_amount":5060},"title":"4 x 4 ft","options":[{"value":"4 x 4 ft","option_id":"opt_01M7WWS7TSM8ERY0V3RPPG2VQE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS7ZH7DX3R9DX3FCJY70X","sku":"METALLIC-PREMIUM-WHITE-BOARD-5-X-4-FT","price":{"currency_code":"inr","original_amount":6100,"is_tax_inclusive":false,"calculated_amount":6100},"title":"5 x 4 ft","options":[{"value":"5 x 4 ft","option_id":"opt_01M7WWS7TSM8ERY0V3RPPG2VQE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS8023GWKJBQCFGJ34F5D","sku":"METALLIC-PREMIUM-WHITE-BOARD-6-X-4-FT","price":{"currency_code":"inr","original_amount":7140,"is_tax_inclusive":false,"calculated_amount":7140},"title":"6 x 4 ft","options":[{"value":"6 x 4 ft","option_id":"opt_01M7WWS7TSM8ERY0V3RPPG2VQE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWS80K49F37ZFYNECNKAR8","sku":"METALLIC-PREMIUM-WHITE-BOARD-8-X-4-FT","price":{"currency_code":"inr","original_amount":9220,"is_tax_inclusive":false,"calculated_amount":9220},"title":"8 x 4 ft","options":[{"value":"8 x 4 ft","option_id":"opt_01M7WWS7TSM8ERY0V3RPPG2VQE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-premium-white-board","attributes":[{"key":"type","value":"Non-Magnetic White Board"},{"key":"material","value":"High-quality, durable materials with High Gloss Marker Grade HPL Sheet"},{"key":"design","value":"Heavy-duty framing with Signature Dual-Tone Corners"},{"key":"frame","value":"Aluminium Anodized Frame"},{"key":"surface","value":"Ultra-smooth, high-gloss surface for effortless writing and easy erasing"},{"key":"durability","value":"Extremely long-lasting and highly resistant to wear and tear"},{"key":"product_story_1","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/brand"},{"key":"product_story_2","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-1"},{"key":"product_story_3","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-2"},{"key":"product_story_4","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-3"},{"key":"product_story_5","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-4"},{"key":"product_story_6","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-5"},{"key":"product_story_7","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-6"},{"key":"product_story_8","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-7"},{"key":"product_story_9","value":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/metallic-white-board/source-8"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PBSRT0KQDQ4636CJFS","name":"Non-Magnetic White Boards","handle":"white-boards-non-magnetic"}],"collection":{"id":"pcol_01M7WWS7SCTP9MK3FX2HAC9BK2","title":"Metallic Premium","handle":"metallic-premium"},"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:19.133861+00:00","description":"The Metallic Premium White Board is built from high-quality, durable materials with a High Gloss Marker Grade HPL Sheet. Heavy-duty framing with Signature Dual-Tone Corners frames an ultra-smooth, high-gloss surface for effortless writing and easy erasing. It is extremely long-lasting and highly resistant to wear and tear.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWS7XA3SBX2XRNGSYC28D8":{"tiers":[],"amount":4020,"prior_price":null},"variant_01M7WWS7YZ32S8J43QKY3WX9TH":{"tiers":[],"amount":5060,"prior_price":null},"variant_01M7WWS7ZH7DX3R9DX3FCJY70X":{"tiers":[],"amount":6100,"prior_price":null},"variant_01M7WWS8023GWKJBQCFGJ34F5D":{"tiers":[],"amount":7140,"prior_price":null},"variant_01M7WWS80K49F37ZFYNECNKAR8":{"tiers":[],"amount":9220,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSER0SCA8X6FQCSPYZS29","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Newspaper Stand","width":null,"handle":"newspaper-stand","height":null,"images":[{"id":"img_01M81YFZWKHRRVH0JXCXG6VPCZ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/newspaper-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSER6AZWSA6EQJPV5DR66","title":"Size","values":[{"id":"optval_01M7WWSERDNN133F6CS3Z7AY7K","value":"Standard size"},{"id":"optval_01M7WWSERJNAYX86ZXRZHX22AD","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSESPK3NF5PY0702W26M2","sku":"NEWSPAPER-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4200,"is_tax_inclusive":false,"calculated_amount":4200},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSER6AZWSA6EQJPV5DR66","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSETJM797JG0FK7A274Z2","sku":"NEWSPAPER-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4200,"is_tax_inclusive":false,"calculated_amount":4200},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSER6AZWSA6EQJPV5DR66","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/newspaper-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7REYZ7MRJE57JYQAX4K","name":"Storage & Racks","handle":"board-stands-storage"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:45.612886+00:00","description":"The Newspaper Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSESPK3NF5PY0702W26M2":{"tiers":[],"amount":4200,"prior_price":null},"variant_01M7WWSETJM797JG0FK7A274Z2":{"tiers":[],"amount":4200,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSF5QHDQ0Y7D6S70KR4W1","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"PDS-500","width":null,"handle":"pds-500","height":null,"images":[{"id":"img_01M81YG1P5D8QHXYP6ANH27J8X","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-500","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSF5Y2GZE8ZR2YMP59FZE","title":"Size","values":[{"id":"optval_01M7WWSF66R2MNSWVSDE13YF4X","value":"Standard size"},{"id":"optval_01M7WWSF6BKPZTGJYGQVFK7RD5","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSF7HTM1DCH6B4B4KR68W","sku":"PDS-500-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":3550,"is_tax_inclusive":false,"calculated_amount":3550},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSF5Y2GZE8ZR2YMP59FZE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSF8E0N7WZGGZMR56K28A","sku":"PDS-500-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":3550,"is_tax_inclusive":false,"calculated_amount":3550},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSF5Y2GZE8ZR2YMP59FZE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-500","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:47.453789+00:00","description":"The PDS-500 is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSF7HTM1DCH6B4B4KR68W":{"tiers":[],"amount":3550,"prior_price":null},"variant_01M7WWSF8E0N7WZGGZMR56K28A":{"tiers":[],"amount":3550,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSF9AG0C7HM6W7T6KXD88","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 801","width":null,"handle":"pds-sb-801","height":null,"images":[{"id":"img_01M81YG229C52HNDXKH4BWETGE","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-801","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSF9GJ7WCX2WTFX5424W6","title":"Size","values":[{"id":"optval_01M7WWSF9RN7M3M3QY63NKTEBT","value":"Standard size"},{"id":"optval_01M7WWSF9XS7N0QC5QH5EN92B7","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSFB2MJEGTA7E7PV7Q1FH","sku":"PDS-SB-801-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7560,"is_tax_inclusive":false,"calculated_amount":7560},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSF9GJ7WCX2WTFX5424W6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSFBZF163XW1M3VMNYJQ6","sku":"PDS-SB-801-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7560,"is_tax_inclusive":false,"calculated_amount":7560},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSF9GJ7WCX2WTFX5424W6","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-801","attributes":[{"key":"model","value":"PDS-SB 801"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:47.841785+00:00","description":"PDS-SB 801 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSFB2MJEGTA7E7PV7Q1FH":{"tiers":[],"amount":7560,"prior_price":null},"variant_01M7WWSFBZF163XW1M3VMNYJQ6":{"tiers":[],"amount":7560,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSFCVG209XDDQCGGPCZG5","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 802","width":null,"handle":"pds-sb-802","height":null,"images":[{"id":"img_01M81YG2JK732B00YXDYKZ0DFN","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-802","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSFD13X65HKT861T6SKX4","title":"Size","values":[{"id":"optval_01M7WWSFD92A9M9DMYV88P5GV8","value":"Standard size"},{"id":"optval_01M7WWSFDEX3TXWPBG2GWDRWD8","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSFEM8CHD12J2A76KJ2TP","sku":"PDS-SB-802-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7590,"is_tax_inclusive":false,"calculated_amount":7590},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSFD13X65HKT861T6SKX4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSFFHRWMBYF78T29YKNYW","sku":"PDS-SB-802-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7590,"is_tax_inclusive":false,"calculated_amount":7590},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSFD13X65HKT861T6SKX4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-802","attributes":[{"key":"model","value":"PDS-SB 802"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:48.364492+00:00","description":"PDS-SB 802 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSFEM8CHD12J2A76KJ2TP":{"tiers":[],"amount":7590,"prior_price":null},"variant_01M7WWSFFHRWMBYF78T29YKNYW":{"tiers":[],"amount":7590,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSFGC1ZZTEVAZW8F9YAMM","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 803","width":null,"handle":"pds-sb-803","height":null,"images":[{"id":"img_01M81YG32V5PMD94YREAYFXV8F","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-803","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSFGKXZEACR3GP7R5W85H","title":"Size","values":[{"id":"optval_01M7WWSFGTC8G90K035F1JX5G5","value":"Standard size"},{"id":"optval_01M7WWSFGZTYGHZGHKA0BNEF5G","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSFJ66DWWABPCHC1GJKPB","sku":"PDS-SB-803-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7620,"is_tax_inclusive":false,"calculated_amount":7620},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSFGKXZEACR3GP7R5W85H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSFK27XTD2PMBMD8PSBJ3","sku":"PDS-SB-803-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7620,"is_tax_inclusive":false,"calculated_amount":7620},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSFGKXZEACR3GP7R5W85H","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-803","attributes":[{"key":"model","value":"PDS-SB 803"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:48.884762+00:00","description":"PDS-SB 803 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSFJ66DWWABPCHC1GJKPB":{"tiers":[],"amount":7620,"prior_price":null},"variant_01M7WWSFK27XTD2PMBMD8PSBJ3":{"tiers":[],"amount":7620,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSFKXE4QC8VN9N418EF06","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 804","width":null,"handle":"pds-sb-804","height":null,"images":[{"id":"img_01M81YG3MFBFDQG4QTN0YVCC66","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-804","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSFM4XTXH64WQ7J9NSXPX","title":"Size","values":[{"id":"optval_01M7WWSFMBGQ9K4WG9P2WDBSTM","value":"Standard size"},{"id":"optval_01M7WWSFMG5RFS51H100F52EC8","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSFNNY4K62MSWERH2NXMA","sku":"PDS-SB-804-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7640,"is_tax_inclusive":false,"calculated_amount":7640},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSFM4XTXH64WQ7J9NSXPX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSFPKQ303W35CS9ND2G1K","sku":"PDS-SB-804-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7640,"is_tax_inclusive":false,"calculated_amount":7640},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSFM4XTXH64WQ7J9NSXPX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-804","attributes":[{"key":"model","value":"PDS-SB 804"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:49.448636+00:00","description":"PDS-SB 804 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSFNNY4K62MSWERH2NXMA":{"tiers":[],"amount":7640,"prior_price":null},"variant_01M7WWSFPKQ303W35CS9ND2G1K":{"tiers":[],"amount":7640,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSFQGDM2NAXKEV9Y5QYYX","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 805","width":null,"handle":"pds-sb-805","height":null,"images":[{"id":"img_01M81YG48FHK33MYZ5K2WAGZPD","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-805","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSFQP1QZYBFNRJ3HQV20J","title":"Size","values":[{"id":"optval_01M7WWSFQY9CFHWDZBDSWPTHXK","value":"Standard size"},{"id":"optval_01M7WWSFR36NTGMDWBSRB3QY70","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSFS90XB58THMVHQ48FXB","sku":"PDS-SB-805-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7670,"is_tax_inclusive":false,"calculated_amount":7670},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSFQP1QZYBFNRJ3HQV20J","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSFT6HKT04BAQ5F32Z0D7","sku":"PDS-SB-805-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7670,"is_tax_inclusive":false,"calculated_amount":7670},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSFQP1QZYBFNRJ3HQV20J","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-805","attributes":[{"key":"model","value":"PDS-SB 805"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:50.088088+00:00","description":"PDS-SB 805 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSFS90XB58THMVHQ48FXB":{"tiers":[],"amount":7670,"prior_price":null},"variant_01M7WWSFT6HKT04BAQ5F32Z0D7":{"tiers":[],"amount":7670,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSFV1J5WHT9VPQB4VR03C","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 806","width":null,"handle":"pds-sb-806","height":null,"images":[{"id":"img_01M81YG4RR6DCX282JENA5VS28","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-806","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSFV8VG8SC6HYWAG29C3J","title":"Size","values":[{"id":"optval_01M7WWSFVG6RNR0T8D4NNRJ6ES","value":"Standard size"},{"id":"optval_01M7WWSFVMD3F1TR41T39SG28Q","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSFWTFSD469ZPY762MQTQ","sku":"PDS-SB-806-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7690,"is_tax_inclusive":false,"calculated_amount":7690},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSFV8VG8SC6HYWAG29C3J","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSFXS369MSW2SE06VRB23","sku":"PDS-SB-806-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7690,"is_tax_inclusive":false,"calculated_amount":7690},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSFV8VG8SC6HYWAG29C3J","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-806","attributes":[{"key":"model","value":"PDS-SB 806"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:50.608599+00:00","description":"PDS-SB 806 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSFWTFSD469ZPY762MQTQ":{"tiers":[],"amount":7690,"prior_price":null},"variant_01M7WWSFXS369MSW2SE06VRB23":{"tiers":[],"amount":7690,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSFYMJ1M8189MJEXFCPET","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 807","width":null,"handle":"pds-sb-807","height":null,"images":[{"id":"img_01M81YG59J6NFWV0FGFQPA55G8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-807","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSFYVZY0DNY5YJXZN9RSX","title":"Size","values":[{"id":"optval_01M7WWSFZ2R21JK76RW4FZR74D","value":"Standard size"},{"id":"optval_01M7WWSFZ75JPDVZH1XPR2574F","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSG0DAB3G5V53DMVRBXCS","sku":"PDS-SB-807-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7720,"is_tax_inclusive":false,"calculated_amount":7720},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSFYVZY0DNY5YJXZN9RSX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSG1A9PK04AB5HSH8AVKJ","sku":"PDS-SB-807-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7720,"is_tax_inclusive":false,"calculated_amount":7720},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSFYVZY0DNY5YJXZN9RSX","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-807","attributes":[{"key":"model","value":"PDS-SB 807"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:51.146903+00:00","description":"PDS-SB 807 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSG0DAB3G5V53DMVRBXCS":{"tiers":[],"amount":7720,"prior_price":null},"variant_01M7WWSG1A9PK04AB5HSH8AVKJ":{"tiers":[],"amount":7720,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSG266T99YKWJY11ERQ35","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 808","width":null,"handle":"pds-sb-808","height":null,"images":[{"id":"img_01M81YG5TVXWRCHDT79H1286DW","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-808","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSG2DPB20CZ3BAYWY5040","title":"Size","values":[{"id":"optval_01M7WWSG2MGQENKHQVZ1M6E2J1","value":"Standard size"},{"id":"optval_01M7WWSG2S9E1VNWKV8SBQAQBR","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSG4119AVWBQY7YDZRAEF","sku":"PDS-SB-808-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7740,"is_tax_inclusive":false,"calculated_amount":7740},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSG2DPB20CZ3BAYWY5040","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSG4ZVFBMEPJPWXXG9NYQ","sku":"PDS-SB-808-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7740,"is_tax_inclusive":false,"calculated_amount":7740},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSG2DPB20CZ3BAYWY5040","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-808","attributes":[{"key":"model","value":"PDS-SB 808"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:51.700631+00:00","description":"PDS-SB 808 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSG4119AVWBQY7YDZRAEF":{"tiers":[],"amount":7740,"prior_price":null},"variant_01M7WWSG4ZVFBMEPJPWXXG9NYQ":{"tiers":[],"amount":7740,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSG5V6JKQJC53TWEA132G","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 809","width":null,"handle":"pds-sb-809","height":null,"images":[{"id":"img_01M81YG6CQP1QPJCB9SN6ZYX10","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-809","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSG62XFK20W1C9YZTRKAE","title":"Size","values":[{"id":"optval_01M7WWSG695R59F889JYPGH456","value":"Standard size"},{"id":"optval_01M7WWSG6EGMKW9THKZ6XDZTHG","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSG7NW72KB8HGN7BA1Q93","sku":"PDS-SB-809-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7770,"is_tax_inclusive":false,"calculated_amount":7770},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSG62XFK20W1C9YZTRKAE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSG8MFTCWBEDEKW9KMG51","sku":"PDS-SB-809-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7770,"is_tax_inclusive":false,"calculated_amount":7770},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSG62XFK20W1C9YZTRKAE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-809","attributes":[{"key":"model","value":"PDS-SB 809"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:52.273298+00:00","description":"PDS-SB 809 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSG7NW72KB8HGN7BA1Q93":{"tiers":[],"amount":7770,"prior_price":null},"variant_01M7WWSG8MFTCWBEDEKW9KMG51":{"tiers":[],"amount":7770,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSG9JJE4JFH35JCVKMY2W","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 810","width":null,"handle":"pds-sb-810","height":null,"images":[{"id":"img_01M81YG6XDGH8E68W29KCNXABZ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-810","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSG9SJW6BFGBABM3Z3W4P","title":"Size","values":[{"id":"optval_01M7WWSGA1TR7S988VJQZJ6FPD","value":"Standard size"},{"id":"optval_01M7WWSGA5T0YP1C97YB34703D","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSGBCTBWN5AVPNQ6REKKK","sku":"PDS-SB-810-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7560,"is_tax_inclusive":false,"calculated_amount":7560},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSG9SJW6BFGBABM3Z3W4P","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSGCAYMNFYYE7EKEHSXY4","sku":"PDS-SB-810-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7560,"is_tax_inclusive":false,"calculated_amount":7560},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSG9SJW6BFGBABM3Z3W4P","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-810","attributes":[{"key":"model","value":"PDS-SB 810"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:52.806646+00:00","description":"PDS-SB 810 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSGBCTBWN5AVPNQ6REKKK":{"tiers":[],"amount":7560,"prior_price":null},"variant_01M7WWSGCAYMNFYYE7EKEHSXY4":{"tiers":[],"amount":7560,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSGD6X99ATTSV6QW7ET6X","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 811","width":null,"handle":"pds-sb-811","height":null,"images":[{"id":"img_01M81YG7D95VA077EK9CBQCF65","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-811","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSGDD76QPCYFWHEE72CZ4","title":"Size","values":[{"id":"optval_01M7WWSGDN0GMBE0WT8DFW3P64","value":"Standard size"},{"id":"optval_01M7WWSGDT5TN3CSQTQQZTAR05","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSGF1MB0NKZ2CGXGNK91M","sku":"PDS-SB-811-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7590,"is_tax_inclusive":false,"calculated_amount":7590},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSGDD76QPCYFWHEE72CZ4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSGG1WTND7JH0CFEEM7W5","sku":"PDS-SB-811-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7590,"is_tax_inclusive":false,"calculated_amount":7590},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSGDD76QPCYFWHEE72CZ4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-811","attributes":[{"key":"model","value":"PDS-SB 811"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:53.314303+00:00","description":"PDS-SB 811 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSGF1MB0NKZ2CGXGNK91M":{"tiers":[],"amount":7590,"prior_price":null},"variant_01M7WWSGG1WTND7JH0CFEEM7W5":{"tiers":[],"amount":7590,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSGGY2X1XJNRCR9NNJ7XA","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 812","width":null,"handle":"pds-sb-812","height":null,"images":[{"id":"img_01M81YG7WJ19NMM1Q79VTQ9KKV","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-812","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSGH58CV937NSD40MPSX4","title":"Size","values":[{"id":"optval_01M7WWSGHCNVMBHP26XSZEY0E1","value":"Standard size"},{"id":"optval_01M7WWSGHHESBD31PCCPF03BBB","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSGJSGCJS1V3T9CVBNTGD","sku":"PDS-SB-812-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7620,"is_tax_inclusive":false,"calculated_amount":7620},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSGH58CV937NSD40MPSX4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSGKRVWBTTSARNXKM00MH","sku":"PDS-SB-812-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7620,"is_tax_inclusive":false,"calculated_amount":7620},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSGH58CV937NSD40MPSX4","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-812","attributes":[{"key":"model","value":"PDS-SB 812"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:53.803663+00:00","description":"PDS-SB 812 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSGJSGCJS1V3T9CVBNTGD":{"tiers":[],"amount":7620,"prior_price":null},"variant_01M7WWSGKRVWBTTSARNXKM00MH":{"tiers":[],"amount":7620,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSGMN42T2D1MFCH92DCP0","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 813","width":null,"handle":"pds-sb-813","height":null,"images":[{"id":"img_01M81YG8DJGZK6R116EKQHCH5F","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-813","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSGMW3ZFGB02A4SDPNTZ1","title":"Size","values":[{"id":"optval_01M7WWSGN4GBMVKT09AQYWJPRY","value":"Standard size"},{"id":"optval_01M7WWSGN9G7BEJKMNAD6DDTWX","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSGPKCEZPNXRM1DF9QSPC","sku":"PDS-SB-813-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7640,"is_tax_inclusive":false,"calculated_amount":7640},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSGMW3ZFGB02A4SDPNTZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSGQHG3WWWRR29NQ9728Q","sku":"PDS-SB-813-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7640,"is_tax_inclusive":false,"calculated_amount":7640},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSGMW3ZFGB02A4SDPNTZ1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-813","attributes":[{"key":"model","value":"PDS-SB 813"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:54.347923+00:00","description":"PDS-SB 813 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSGPKCEZPNXRM1DF9QSPC":{"tiers":[],"amount":7640,"prior_price":null},"variant_01M7WWSGQHG3WWWRR29NQ9728Q":{"tiers":[],"amount":7640,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSGRETFW0DQ03GSRNDJQM","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 814","width":null,"handle":"pds-sb-814","height":null,"images":[{"id":"img_01M81YG8YZ9JZM8DRE2XMPSEHA","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-814","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSGRNCXMXYEN44VJR4GBR","title":"Size","values":[{"id":"optval_01M7WWSGRWARZTJ9G19DGC91C1","value":"Standard size"},{"id":"optval_01M7WWSGS1A71GT5HKD924P7DB","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSGT9T3CAZ7A416DS6AJP","sku":"PDS-SB-814-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7670,"is_tax_inclusive":false,"calculated_amount":7670},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSGRNCXMXYEN44VJR4GBR","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSGV7MZ2N9VRH1RXCQ1DM","sku":"PDS-SB-814-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7670,"is_tax_inclusive":false,"calculated_amount":7670},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSGRNCXMXYEN44VJR4GBR","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-814","attributes":[{"key":"model","value":"PDS-SB 814"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:54.905093+00:00","description":"PDS-SB 814 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSGT9T3CAZ7A416DS6AJP":{"tiers":[],"amount":7670,"prior_price":null},"variant_01M7WWSGV7MZ2N9VRH1RXCQ1DM":{"tiers":[],"amount":7670,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSGW69DWW4T4RNXS9ZCP4","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"School Bench PDS-SB 815","width":null,"handle":"pds-sb-815","height":null,"images":[{"id":"img_01M81YG9FW3599DQMY3SDTVH9Y","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-815","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSGWDQFGKYSB80MT1MCKE","title":"Size","values":[{"id":"optval_01M7WWSGWN17AS99MWXPRCY0JZ","value":"Standard size"},{"id":"optval_01M7WWSGWTEK49B0HGX7B3C4A1","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSGY2CG01NCF9MSDSY3ZA","sku":"PDS-SB-815-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":7690,"is_tax_inclusive":false,"calculated_amount":7690},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSGWDQFGKYSB80MT1MCKE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSGZ14MN0XPJSKFD8BF9B","sku":"PDS-SB-815-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":7690,"is_tax_inclusive":false,"calculated_amount":7690},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSGWDQFGKYSB80MT1MCKE","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pds-sb-815","attributes":[{"key":"model","value":"PDS-SB 815"}],"categories":[{"id":"pcat_01M7WWS7RX9PXMXJKSKP1P2T6P","name":"School Benches","handle":"school-benches"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:55.446011+00:00","description":"PDS-SB 815 is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSGY2CG01NCF9MSDSY3ZA":{"tiers":[],"amount":7690,"prior_price":null},"variant_01M7WWSGZ14MN0XPJSKFD8BF9B":{"tiers":[],"amount":7690,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSDD8JVAVZKX8Z9JJSQRD","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Perforated Board","width":null,"handle":"perforated-board","height":null,"images":[{"id":"img_01M81YFTF1JP30FXQZCJ9WD0MW","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/perforated-board","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSDDDBDR5B22Z0XMJSWV8","title":"Size","values":[{"id":"optval_01M7WWSDDMQTTJ59DE63ACAA6M","value":"Standard size"},{"id":"optval_01M7WWSDDR2TZGCA3N759NJH1Q","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSDEVMA0PAXFZPKAAYT6Z","sku":"PERFORATED-BOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":2850,"is_tax_inclusive":false,"calculated_amount":2850},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSDDDBDR5B22Z0XMJSWV8","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSDFNBA54Y6MR09C0MQKV","sku":"PERFORATED-BOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":2850,"is_tax_inclusive":false,"calculated_amount":2850},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSDDDBDR5B22Z0XMJSWV8","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/perforated-board","attributes":[{"key":"board","value":"Black perforated board"},{"key":"frame","value":"Golden Anodized frame"},{"key":"felt_colors","value":"Red, Maroon"}],"categories":[{"id":"pcat_01M7WWS7R3S2GQ82DAZXBMFN9B","name":"Display Boards","handle":"display-boards"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:40.058881+00:00","description":"Black perforated boards are very popular boards to display information vertically as well as horizontally. Used in offices, hotels and many other public places, with a golden anodized frame and felt available in red and maroon.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSDEVMA0PAXFZPKAAYT6Z":{"tiers":[],"amount":2850,"prior_price":null},"variant_01M7WWSDFNBA54Y6MR09C0MQKV":{"tiers":[],"amount":2850,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSCECN5M5TMNNRX8225MC","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Pre-Lam MDF Base Clipboard (Wood Finish)","width":null,"handle":"pre-lam-mdf-base-clipboard","height":null,"images":[{"id":"img_01M81YFN47V5ZXWVQPBZZHHJQS","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pre-lam-mdf-base-clipboard","rank":0},{"id":"img_01M81YFN490D4DQ6D77RVPP5X4","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pre-lam-mdf-base-clipboard-2","rank":1},{"id":"img_01M81YFN4C2EQY6Y3XJ5HW2QWM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pre-lam-mdf-base-clipboard-3","rank":2}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSCEJ91R62CR56HE4ZZF3","title":"Size","values":[{"id":"optval_01M7WWSCERYHVGYFTRTKCSDS30","value":"Standard size"},{"id":"optval_01M7WWSCEWYA0108M096E9ACEV","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSCFWYGS4ZK8GQ0AGW3NA","sku":"PRE-LAM-MDF-BASE-CLIPBOARD-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":500,"is_tax_inclusive":false,"calculated_amount":500},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSCEJ91R62CR56HE4ZZF3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSCGN8JXMSM5NGAC9EYQC","sku":"PRE-LAM-MDF-BASE-CLIPBOARD-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":500,"is_tax_inclusive":false,"calculated_amount":500},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSCEJ91R62CR56HE4ZZF3","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/pre-lam-mdf-base-clipboard","attributes":[{"key":"base","value":"Pre-Lam MDF Base (Wood Finish)"},{"key":"clip","value":"Chrome Electroplated Clip — Rust-Resistant Finish"},{"key":"finish","value":"Pre-Lam wood Finish — Smooth Wood Finish"},{"key":"rivets","value":"Dual-Side Cap Rivets"}],"categories":[{"id":"pcat_01M7WWS7RJM8TZBQ91785CAKGE","name":"Clipboards","handle":"clipboards"},{"id":"pcat_01M7WWS7RN6AXVYARFMB4EEYG5","name":"MDF Base","handle":"clipboards-mdf"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:34.592543+00:00","description":"Pre-Lam MDF base with a smooth wood finish, Chrome Electroplated Clip with rust-resistant finish and Dual-Side Cap Rivets.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSCFWYGS4ZK8GQ0AGW3NA":{"tiers":[],"amount":500,"prior_price":null},"variant_01M7WWSCGN8JXMSM5NGAC9EYQC":{"tiers":[],"amount":500,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSEAJ3XP2T7K74CK4STRQ","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Revolving Stand","width":null,"handle":"revolving-stand","height":null,"images":[{"id":"img_01M81YFYAF6FT01GSNT7S306PR","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/revolving-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSEARV9H46V363R1SVGEW","title":"Size","values":[{"id":"optval_01M7WWSEAZW8Q60Z82EE41MG2Q","value":"Standard size"},{"id":"optval_01M7WWSEB3MX35VCZTJ3A2BVHT","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSEC58YRHJG91FWFSAPM7","sku":"REVOLVING-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4310,"is_tax_inclusive":false,"calculated_amount":4310},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSEARV9H46V363R1SVGEW","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSED1NNMCJHXC78ZP7FBT","sku":"REVOLVING-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4310,"is_tax_inclusive":false,"calculated_amount":4310},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSEARV9H46V363R1SVGEW","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/revolving-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7RAJ9SADEZ7K1W7XTH1","name":"Display Stands","handle":"board-stands-stands"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:44.007971+00:00","description":"The Revolving Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSEC58YRHJG91FWFSAPM7":{"tiers":[],"amount":4310,"prior_price":null},"variant_01M7WWSED1NNMCJHXC78ZP7FBT":{"tiers":[],"amount":4310,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSF2BCQX8K7KZZ6RQH4X6","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Homework Table","width":null,"handle":"student-study-table","height":null,"images":[{"id":"img_01M81YG14NFZG8K8S8CYWPMGEW","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table","rank":0},{"id":"img_01M81YG14QMGE3PDXYS68HNCCX","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-2","rank":1},{"id":"img_01M81YG14RA5RK7NEYZJB5Q6QS","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-3","rank":2},{"id":"img_01M81YG14T5AVJ3K9FNRPDWCAJ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-4","rank":3},{"id":"img_01M81YG14WJ4VHY45E6CAVA6BD","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-5","rank":4},{"id":"img_01M81YG14Y8YQ88EN8K3S0J2TM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-6","rank":5},{"id":"img_01M81YG14ZGJZQG7MJZ4V6MZQ8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-7","rank":6},{"id":"img_01M81YG151GEXZBEZSKG8TMFJ8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-8","rank":7},{"id":"img_01M81YG153DNBBEP0XT4FCVQ26","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-9","rank":8},{"id":"img_01M81YG155P2K3P053SCJ9D3W8","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-10","rank":9},{"id":"img_01M81YG156SAFN4XWCMK735SRM","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-11","rank":10},{"id":"img_01M81YG15804ZV6Q4EV6HHA0BB","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-12","rank":11},{"id":"img_01M81YG15ATEGW9EH6A0WJY6CK","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table-13","rank":12}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSF2HB83ZZQ9V6HB3CSFJ","title":"Size","values":[{"id":"optval_01M7WWSF2RF9JE26YAFEHB9SYF","value":"Standard size"},{"id":"optval_01M7WWSF2XWY09KR53S0EK8N8X","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSF41MEQA20P7PY527A9C","sku":"STUDENT-STUDY-TABLE-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":740,"is_tax_inclusive":false,"calculated_amount":740},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSF2HB83ZZQ9V6HB3CSFJ","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSF4XVH0BPMP2C7QMVXQH","sku":"STUDENT-STUDY-TABLE-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":740,"is_tax_inclusive":false,"calculated_amount":740},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSF2HB83ZZQ9V6HB3CSFJ","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/student-study-table","attributes":[{"key":"writing_area_size","value":"16 × 24 inches"},{"key":"height","value":"9.5 inches"},{"key":"surface","value":"Smooth White Board Writing Surface"},{"key":"top","value":"Tilting top with support stand (Adjust Your Height) and Table Top Clip"},{"key":"design","value":"Foldable & Space-Saving Design"}],"categories":[{"id":"pcat_01M7WWS7QZAEK9B31MH8XVGGWA","name":"Board & Study Essentials","handle":"board-study-essentials"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:46.89342+00:00","description":"The Plusmark Homework Table is a foldable student study table, ideal for daily study and homework. Its smooth white board writing surface is easy to clean and maintain, a table top clip holds papers in place, and the top tilts up on a support stand to adjust the writing height. Foldable and space-saving, it doubles as a reading and laptop table. Writing area: 16 × 24 inches; height: 9.5 inches.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSF41MEQA20P7PY527A9C":{"tiers":[],"amount":740,"prior_price":null},"variant_01M7WWSF4XVH0BPMP2C7QMVXQH":{"tiers":[],"amount":740,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSEDT31DW7NK2NQVZ811R","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Telescopic Stand","width":null,"handle":"telescopic-stand","height":null,"images":[{"id":"img_01M81YFYQ1332AKZE2JYEX67R1","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/telescopic-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSEE1DCGCF030DKDBV4NG","title":"Size","values":[{"id":"optval_01M7WWSEE8ZRMYRMHVX53N4BMH","value":"Standard size"},{"id":"optval_01M7WWSEECGRY85WCFXVSSBJMV","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSEFHY5688S3SJQ1VHMAP","sku":"TELESCOPIC-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":3990,"is_tax_inclusive":false,"calculated_amount":3990},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSEE1DCGCF030DKDBV4NG","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSEGC2K1JNYV8GBT8Y3E1","sku":"TELESCOPIC-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":3990,"is_tax_inclusive":false,"calculated_amount":3990},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSEE1DCGCF030DKDBV4NG","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/telescopic-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7RAJ9SADEZ7K1W7XTH1","name":"Display Stands","handle":"board-stands-stands"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:44.408297+00:00","description":"The Telescopic Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSEFHY5688S3SJQ1VHMAP":{"tiers":[],"amount":3990,"prior_price":null},"variant_01M7WWSEGC2K1JNYV8GBT8Y3E1":{"tiers":[],"amount":3990,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M815NRBGFGPPBQR2MK0ZDJZD","tags":[{"id":"ptag_01M815NRMZC66P9R9JZ2ENW2T2","value":"bee"},{"id":"ptag_01M815NRM83RR5MTA1B8NH7P3B","value":"hi"},{"id":"ptag_01M815NRN251HGDRFAF2Q64FR0","value":"jeee"},{"id":"ptag_01M815NRMVXPE8Z1P4FZS3NTJM","value":"neee"}],"type":{"id":"ptyp_01M815KRA81DQ4GJB0TK2X3RAM","value":"hellow"},"title":"test","width":null,"handle":"test","height":null,"images":[{"id":"img_01M815RTCFSTRVRPDTGNV6PH6P","url":"https://lkjxumiyesvufcxyaqcg.supabase.co/storage/v1/object/public/catalog-media/prod_01M815NRBGFGPPBQR2MK0ZDJZD/img_01M815RTCFSTRVRPDTGNV6PH6P.jpg","rank":0},{"id":"img_01M815RVG3W7KXWMCW16CMXHB3","url":"https://lkjxumiyesvufcxyaqcg.supabase.co/storage/v1/object/public/catalog-media/prod_01M815NRBGFGPPBQR2MK0ZDJZD/img_01M815RVG3W7KXWMCW16CMXHB3.jpg","rank":1},{"id":"img_01M815RWB4TV92SSBMD7CC3M6N","url":"https://lkjxumiyesvufcxyaqcg.supabase.co/storage/v1/object/public/catalog-media/prod_01M815NRBGFGPPBQR2MK0ZDJZD/img_01M815RWB4TV92SSBMD7CC3M6N.jpg","rank":2},{"id":"img_01M815RWTW3TF1AX1Q7YHATKRB","url":"https://lkjxumiyesvufcxyaqcg.supabase.co/storage/v1/object/public/catalog-media/prod_01M815NRBGFGPPBQR2MK0ZDJZD/img_01M815RWTW3TF1AX1Q7YHATKRB.jpg","rank":3},{"id":"img_01M815RXCP93EDPYV1W0SK4TBZ","url":"https://lkjxumiyesvufcxyaqcg.supabase.co/storage/v1/object/public/catalog-media/prod_01M815NRBGFGPPBQR2MK0ZDJZD/img_01M815RXCP93EDPYV1W0SK4TBZ.jpg","rank":4}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M815NRJRT53DDENWABTPM3WT","title":"size","values":[{"id":"optval_01M815NRKG5JDG85ZJNQ133044","value":"5+6"},{"id":"optval_01M815NRKYF66B7Y8CJYQJ2TR9","value":"9+5"},{"id":"optval_01M815NRM2X1W1N44JX79JF05K","value":"13+8"}]}],"material":"my materail","metadata":{},"pairings":{},"subtitle":"jungle","variants":[{"id":"variant_01M815PXVBD66T18ES20QSTWB5","sku":"vt5896","price":{"currency_code":"inr","original_amount":3500,"is_tax_inclusive":false,"calculated_amount":3500},"title":"varients","options":[{"value":"5+6","option_id":"opt_01M815NRJRT53DDENWABTPM3WT","option_title":"size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":true}],"thumbnail":null,"attributes":[{"key":"key_attributes","value":"01"},{"key":"key_highlights","value":"highlight\\nhighlite\\nhighlite\\nhighlight\\nhighligt"},{"key":"key_attirbutes","value":"54"}],"categories":[{"id":"pcat_01M7WWS7N9RSAAGJMBCQ9N712X","name":"White Boards","handle":"white-boards"},{"id":"pcat_01M7WWS7PBSRT0KQDQ4636CJFS","name":"Non-Magnetic White Boards","handle":"white-boards-non-magnetic"},{"id":"pcat_01M7WWS7PHP0Y7RH2Y21PXANWK","name":"Magnetic White Boards","handle":"white-boards-magnetic"}],"collection":{"id":"pcol_01M7WWS7SQFBQ8VCXD7P8N58MK","title":"Deluxe Standard","handle":"deluxe-standard"},"created_at":"2026-11-22T08:23:59.994317+00:00","updated_at":"2026-11-22T08:31:36.454866+00:00","description":"hellow","is_giftcard":false,"declarations":{"variant_01M815PXVBD66T18ES20QSTWB5":{"mrp":3500,"net_quantity":1,"currency_code":"inr","best_before_date":null,"manufacture_month":null,"net_quantity_unit":"unit"}},"discountable":true,"key_highlights":["highlight","highlite","highlite","highlight","highligt"],"origin_country":null,"variant_prices":{"variant_01M815PXVBD66T18ES20QSTWB5":{"tiers":[],"amount":3500,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSE3W74CSQQ2HGZN4FFRF","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Three Leg Stand","width":null,"handle":"three-leg-stand","height":null,"images":[{"id":"img_01M81YFXFJ9W0ZSGYCGYS47JZZ","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/three-leg-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSE43FPPGDPS1Z1DZKP8G","title":"Size","values":[{"id":"optval_01M7WWSE492JPQSRJR6EA3AM0P","value":"Standard size"},{"id":"optval_01M7WWSE4EQ398HJWB2NYZQFMG","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSE5HZDZM7J0ZXNXA7BRC","sku":"THREE-LEG-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4390,"is_tax_inclusive":false,"calculated_amount":4390},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSE43FPPGDPS1Z1DZKP8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSE6EWK07MVNXT84NRFNG","sku":"THREE-LEG-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4390,"is_tax_inclusive":false,"calculated_amount":4390},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSE43FPPGDPS1Z1DZKP8G","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/three-leg-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7RAJ9SADEZ7K1W7XTH1","name":"Display Stands","handle":"board-stands-stands"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:43.146895+00:00","description":"The Three Leg Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSE5HZDZM7J0ZXNXA7BRC":{"tiers":[],"amount":4390,"prior_price":null},"variant_01M7WWSE6EWK07MVNXT84NRFNG":{"tiers":[],"amount":4390,"prior_price":null}},"best_seller_rank":null},{"id":"prod_01M7WWSE778RSQ12KNYTJF3P9H","tags":[{"id":"ptag_01M7WWS8NCRDG4D6FXVF35R7MF","value":"n/a"},{"id":"ptag_01M7WWS7W1253CP5SHMFVSCMPZ","value":"non-magnetic"},{"id":"ptag_01M7WWSC93VCWX9X7G846RVB74","value":"other"}],"type":null,"title":"Zig Zag Stand","width":null,"handle":"zig-zag-stand","height":null,"images":[{"id":"img_01M81YFXYA9RYYXP4SXA7QNN5S","url":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/zig-zag-stand","rank":0}],"length":null,"rating":null,"weight":null,"options":[{"id":"opt_01M7WWSE7D70X6CB6VWZKN5VT1","title":"Size","values":[{"id":"optval_01M7WWSE7MJ4S5MR1N87903CE0","value":"Standard size"},{"id":"optval_01M7WWSE7SDQDABS017HJ6YQSJ","value":"Made to order"}]}],"material":null,"metadata":{},"pairings":{},"subtitle":null,"variants":[{"id":"variant_01M7WWSE8W898K576JM1M84MHY","sku":"ZIG-ZAG-STAND-STANDARD-SIZE","price":{"currency_code":"inr","original_amount":4450,"is_tax_inclusive":false,"calculated_amount":4450},"title":"Standard size","options":[{"value":"Standard size","option_id":"opt_01M7WWSE7D70X6CB6VWZKN5VT1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false},{"id":"variant_01M7WWSE9QYF6YN6T79BJE6ARJ","sku":"ZIG-ZAG-STAND-MADE-TO-ORDER","price":{"currency_code":"inr","original_amount":4450,"is_tax_inclusive":false,"calculated_amount":4450},"title":"Made to order","options":[{"value":"Made to order","option_id":"opt_01M7WWSE7D70X6CB6VWZKN5VT1","option_title":"Size"}],"thumbnail":null,"variant_rank":0,"allow_backorder":true,"manage_inventory":false}],"thumbnail":"https://res.cloudinary.com/dtdooieec/image/upload/f_auto,q_auto,w_1600,c_limit/plusmark/products/zig-zag-stand","attributes":[],"categories":[{"id":"pcat_01M7WWS7R7DXXRWY8WQA3EADEQ","name":"Board Stands & Storage","handle":"board-stands"},{"id":"pcat_01M7WWS7RAJ9SADEZ7K1W7XTH1","name":"Display Stands","handle":"board-stands-stands"}],"collection":null,"created_at":"2026-11-20T16:31:39.145462+00:00","updated_at":"2026-11-22T15:37:43.61992+00:00","description":"The Zig Zag Stand is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.","is_giftcard":false,"declarations":{},"discountable":true,"key_highlights":[],"origin_country":"in","variant_prices":{"variant_01M7WWSE8W898K576JM1M84MHY":{"tiers":[],"amount":4450,"prior_price":null},"variant_01M7WWSE9QYF6YN6T79BJE6ARJ":{"tiers":[],"amount":4450,"prior_price":null}},"best_seller_rank":null}]`);
const catalog_version = { "store": 2744, "sales_channel": 1590 };
const currency_code$1 = "inr";
const region_id$1 = "reg_01M7W6G2TTAMHEP6AGZZ88G9Z2";
const catalogMeta = {
  products,
  catalog_version,
  currency_code: currency_code$1,
  region_id: region_id$1
};
const cod = { "fee": null, "max_order_amount": null };
const options = [{ "id": "so_01M7ZE3MQ15BR2XPQ0KQP0XSV3", "name": "Standard delivery", "price_type": "flat", "charge_rules": [{ "amount": 0, "max_item_total": null, "min_item_total": null }], "requires_quote": false }];
const region_id = "reg_01M7W6G2TTAMHEP6AGZZ88G9Z2";
const currency_code = "inr";
const free_delivery_threshold = 0;
const deliveryRules$2 = {
  cod,
  options,
  region_id,
  currency_code,
  free_delivery_threshold
};
const count$1 = 0;
const offers$2 = [];
const server_time = "2026-11-23T07:22:08.923718+00:00";
const __vite_glob_0_2$1 = {
  count: count$1,
  offers: offers$2,
  server_time
};
const __vite_glob_0_0$2 = {
  "branding.accent_color": "#0B6E4F",
  "branding.accent_text_color": "#FFFFFF",
  "branding.logo_url": null,
  "branding.primary_color": "#1F3A5F",
  "branding.primary_text_color": "#FFFFFF",
  "storefront.compliance_certificate": {},
  "storefront.component.back_in_stock_alert": true,
  "storefront.component.bundle_offer": true,
  "storefront.component.checkout_progress": true,
  "storefront.component.delivery_promise": true,
  "storefront.component.dispatch_countdown": true,
  "storefront.component.first_order_offer": false,
  "storefront.component.free_delivery_progress": true,
  "storefront.component.goes_well_with": true,
  "storefront.component.low_stock_notice": true,
  "storefront.component.popularity_notice": true,
  "storefront.component.recently_viewed": true,
  "storefront.component.review_highlights": true,
  "storefront.component.review_summary": true,
  "storefront.component.sale_countdown": true,
  "storefront.component.savings_summary": true,
  "storefront.component.sticky_buy_bar": true,
  "storefront.component.trust_strip": true,
  "storefront.contact": {},
  "storefront.enquiry_reply_hours": 48,
  "storefront.grievance_officer": {},
  "storefront.layout.badges": [],
  "storefront.layout.pdp_blocks": [],
  "storefront.layout.plp_filters": [],
  "storefront.layout.preset": null,
  "storefront.layout.sections": [],
  "storefront.policies": {},
  "storefront.privacy_notice": {},
  "storefront.privacy_notice_version": "1",
  "storefront.seller_details": {}
};
const CLOUD = "https://res.cloudinary.com/drt0rpkn2/image/upload";
const FOLDER = "plusmark/products";
const IMAGE_MAP = {
  "magnetic-whiteboard": "metallic-premium-magnetic-board",
  "non-magnetic-whiteboard": "metallic-premium-white-board",
  "cork-notice-board": "cork-notice-board",
  "a4-clipboard": "laminate-mdf-base-clipboard",
  "mobile-whiteboard-stand": "telescopic-stand",
  "tripod-easel-stand": "three-leg-stand"
};
const isPlaceholder = (url) => typeof url !== "string" || url === "" || url.includes("placehold.co");
function realImageUrl(handle) {
  const id = IMAGE_MAP[handle];
  return id ? `${CLOUD}/f_auto,q_auto,w_1000,c_fill,g_auto/${FOLDER}/${id}` : null;
}
function withRealMedia(product) {
  const handle = String(product.handle ?? "");
  const images = Array.isArray(product.images) ? product.images : [];
  const alreadyReal = images.some((image) => image && typeof image === "object" && !isPlaceholder(image.url));
  if (alreadyReal) return product;
  const url = realImageUrl(handle);
  return {
    ...product,
    images: url ? [{
      id: `plusmark-${handle}`,
      url,
      width: 1e3,
      height: 1e3
    }] : [],
    thumbnail: url
  };
}
const __vite_import_meta_env__$1 = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_MEDIA_ORIGIN": "https://placehold.co", "PUBLIC_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_xlFRp85aCvi8vfvOW_mGrg_1f1Q6x68", "PUBLIC_SUPABASE_URL": "https://lkjxumiyesvufcxyaqcg.supabase.co", "PUBLIC_TURNSTILE_SITE_KEY": "1x00000000000000000000AA", "SITE": void 0, "SSR": true };
var define_process_env_default = {};
const files$1 = /* @__PURE__ */ Object.assign({
  "../data/catalog.json": catalogMeta,
  "../data/delivery-rules.json": deliveryRules$2,
  "../data/offers.json": __vite_glob_0_2$1,
  "../data/settings.json": __vite_glob_0_0$2
});
const isObj$8 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const read = (name2) => files$1[`../data/${name2}.json`];
const isDemoProduct = (p2) => (Array.isArray(p2.categories) ? p2.categories : []).some((c2) => isObj$8(c2) && String(c2.handle ?? "").startsWith("demo-"));
function loadPdpData() {
  const catalog = read("catalog");
  const rules = read("delivery-rules");
  const settings = read("settings");
  return {
    products: isObj$8(catalog) && Array.isArray(catalog.products) ? catalog.products.filter(isObj$8).filter((p2) => !isDemoProduct(p2)).map(withRealMedia) : [],
    currency: (isObj$8(catalog) && typeof catalog.currency_code === "string" && catalog.currency_code ? catalog.currency_code : "inr").toUpperCase(),
    regionId: isObj$8(catalog) && typeof catalog.region_id === "string" ? catalog.region_id : null,
    offers: read("offers") ?? {
      offers: []
    },
    rules: isObj$8(rules) ? rules : {},
    settings: isObj$8(settings) ? settings : {}
  };
}
async function loadReviews(productId) {
  const env2 = Object.assign(__vite_import_meta_env__$1, { SUPABASE_URL: "http://127.0.0.1:54321", PUBLIC: "C:\\Users\\Public", _: "C:/Program Files/nodejs/node.exe" });
  const base = (env2.PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const key2 = env2.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  if (!base || !key2 || /^sb_secret_/.test(key2) || define_process_env_default.BUILD_DATA_MODE === "fixture") return {
    enabled: false,
    reviews: []
  };
  try {
    const q2 = new URLSearchParams({
      p_product_id: productId,
      p_limit: "50"
    });
    const res = await fetch(`${base}/rest/v1/rpc/store_list_reviews?${q2}`, {
      headers: {
        apikey: key2,
        Authorization: `Bearer ${key2}`,
        Accept: "application/json",
        "Accept-Profile": "api"
      },
      signal: AbortSignal.timeout(15e3)
    });
    if (!res.ok) return {
      enabled: false,
      reviews: []
    };
    const body = await res.json();
    return isObj$8(body) && Array.isArray(body.reviews) ? {
      enabled: true,
      reviews: body
    } : {
      enabled: false,
      reviews: []
    };
  } catch {
    return {
      enabled: false,
      reviews: []
    };
  }
}
const isObj$7 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const str$4 = (x) => typeof x === "string" ? x : "";
const num$1 = (x) => typeof x === "number" && Number.isFinite(x) ? x : typeof x === "string" && x.trim() !== "" && Number.isFinite(Number(x)) ? Number(x) : null;
const arr$1 = (x) => Array.isArray(x) ? x : [];
function parsePdpProduct(raw, fallbackCurrency = "INR") {
  if (!isObj$7(raw) || !str$4(raw.id) || !str$4(raw.handle)) return null;
  const prices = isObj$7(raw.variant_prices) ? raw.variant_prices : {};
  const decls = isObj$7(raw.declarations) ? raw.declarations : {};
  const options2 = arr$1(raw.options).filter(isObj$7).map((o2) => ({
    id: str$4(o2.id),
    title: str$4(o2.title),
    values: arr$1(o2.values).filter(isObj$7).map((v2) => str$4(v2.value)).filter(Boolean)
  })).filter((o2) => o2.id && o2.values.length > 0);
  let currency = "";
  const variants = arr$1(raw.variants).filter(isObj$7).map((v2) => {
    const id = str$4(v2.id);
    const vp = isObj$7(prices[id]) ? prices[id] : null;
    const p2 = isObj$7(v2.price) ? v2.price : null;
    if (!currency && p2 && str$4(p2.currency_code)) currency = str$4(p2.currency_code).toUpperCase();
    const decl = isObj$7(decls[id]) ? decls[id] : {};
    const price2 = num$1(vp?.amount) ?? num$1(p2?.calculated_amount);
    const prior = num$1(vp?.prior_price);
    return {
      id,
      title: str$4(v2.title),
      sku: str$4(v2.sku),
      thumbnail: str$4(v2.thumbnail) || null,
      options: Object.fromEntries(arr$1(v2.options).filter(isObj$7).map((o2) => [str$4(o2.option_id), str$4(o2.value)])),
      price: price2,
      prior: price2 !== null && prior !== null && prior > price2 ? prior : null,
      mrp: num$1(decl.mrp),
      netQuantity: num$1(decl.net_quantity),
      netQuantityUnit: str$4(decl.net_quantity_unit) || null,
      tiers: arr$1(vp?.tiers).filter(isObj$7).map((t2) => ({
        minQuantity: num$1(t2.min_quantity) ?? 0,
        amount: num$1(t2.amount) ?? -1
      })).filter((t2) => t2.minQuantity > 1 && t2.amount >= 0),
      allowBackorder: v2.allow_backorder === true
    };
  }).filter((v2) => v2.id);
  const images = arr$1(raw.images).filter(isObj$7).map((i2) => ({
    id: str$4(i2.id),
    url: str$4(i2.url)
  })).filter((i2) => i2.url);
  if (!images.length && str$4(raw.thumbnail)) images.push({
    id: "thumbnail",
    url: str$4(raw.thumbnail)
  });
  const rating = isObj$7(raw.rating) && (num$1(raw.rating.review_count) ?? 0) > 0 ? {
    count: Math.trunc(num$1(raw.rating.review_count)),
    average: num$1(raw.rating.average) ?? 0
  } : null;
  const pairings = isObj$7(raw.pairings) ? Object.fromEntries(Object.entries(raw.pairings).map(([k2, v2]) => [k2, arr$1(v2).map(str$4).filter(Boolean)])) : {};
  return {
    id: str$4(raw.id),
    handle: str$4(raw.handle),
    title: str$4(raw.title),
    subtitle: str$4(raw.subtitle),
    description: str$4(raw.description),
    images,
    options: options2,
    variants,
    currency: currency || fallbackCurrency.toUpperCase(),
    keyHighlights: arr$1(raw.key_highlights).map(str$4).map((s2) => s2.trim()).filter(Boolean),
    rating,
    categories: arr$1(raw.categories).filter(isObj$7).map((c2) => ({
      id: str$4(c2.id),
      name: str$4(c2.name),
      handle: str$4(c2.handle)
    })),
    attributes: arr$1(raw.attributes).filter(isObj$7).map((a2) => ({
      key: str$4(a2.key),
      value: a2.value
    })).filter((a2) => a2.key),
    originCountry: str$4(raw.origin_country),
    pairings
  };
}
function variantFor(m2, sel) {
  if (m2.options.some((o2) => !sel[o2.id])) return null;
  return m2.variants.find((v2) => m2.options.every((o2) => v2.options[o2.id] === sel[o2.id])) ?? null;
}
function missingOption$2(m2, sel) {
  return m2.options.find((o2) => !sel[o2.id]) ?? null;
}
function selectionOf(m2, v2) {
  return Object.fromEntries(m2.options.map((o2) => [o2.id, v2.options[o2.id] ?? ""]).filter(([, val]) => val));
}
function initialSelection(m2, variantParam) {
  const byParam = variantParam ? m2.variants.find((v2) => v2.id === variantParam) : void 0;
  if (byParam) return selectionOf(m2, byParam);
  if (m2.variants.length === 1) return selectionOf(m2, m2.variants[0]);
  return Object.fromEntries(m2.options.filter((o2) => o2.values.length === 1).map((o2) => [o2.id, o2.values[0]]));
}
function displayVariant(m2, chosen) {
  if (chosen) return chosen;
  const priced = m2.variants.filter((v2) => v2.price !== null).sort((a2, b) => a2.price - b.price);
  return priced[0] ?? m2.variants[0] ?? null;
}
const pricesDiffer = (m2) => new Set(m2.variants.map((v2) => v2.price)).size > 1;
const STATES = ["in_stock", "low_stock", "out_of_stock", "backorder"];
function stockStateOf(body, productId, variantId) {
  if (!isObj$7(body) || !Array.isArray(body.products)) return null;
  const p2 = body.products.find((x) => isObj$7(x) && x.id === productId);
  if (!isObj$7(p2) || p2.available === false) return null;
  const v2 = arr$1(p2.variants).find((x) => isObj$7(x) && x.id === variantId);
  const s2 = isObj$7(v2) ? str$4(v2.stock_state) : "";
  return STATES.includes(s2) ? s2 : null;
}
const isSellable = (s2) => s2 !== "out_of_stock";
function valueOutOfStock(m2, optionId, value, stock) {
  const vs = m2.variants.filter((v2) => v2.options[optionId] === value);
  if (!vs.length) return true;
  return vs.every((v2) => stock(v2.id) === "out_of_stock");
}
function imageIndexFor(m2, v2) {
  if (!v2?.thumbnail) return -1;
  return m2.images.findIndex((i2) => i2.url === v2.thumbnail);
}
function withVariantParam(search2, variantId) {
  const q2 = new URLSearchParams(search2);
  if (variantId) q2.set("variant", variantId);
  else q2.delete("variant");
  const s2 = q2.toString();
  return s2 ? `?${s2}` : "";
}
function parsePdpReviews(raw) {
  const rows = isObj$7(raw) ? arr$1(raw.reviews) : [];
  return rows.filter(isObj$7).flatMap((r2) => {
    const rating = num$1(r2.rating);
    if (!str$4(r2.id) || rating === null || rating < 1 || rating > 5 || typeof r2.body !== "string") return [];
    return [{
      id: str$4(r2.id),
      rating,
      title: str$4(r2.title) || null,
      body: r2.body,
      author: str$4(r2.author),
      createdAt: str$4(r2.created_at),
      verified: r2.verified_purchase === true
    }];
  });
}
function sortReviews(rs, sort) {
  const t2 = (r2) => Date.parse(r2.createdAt) || 0;
  const by = {
    newest: (a2, b) => t2(b) - t2(a2),
    highest: (a2, b) => b.rating - a2.rating || t2(b) - t2(a2),
    lowest: (a2, b) => a2.rating - b.rating || t2(b) - t2(a2)
  }[sort];
  return [...rs].sort(by);
}
function ratingDistribution(rs) {
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: rs.filter((r2) => Math.round(r2.rating) === stars).length
  }));
}
const words = (x) => arr$1(x).flatMap((e2) => typeof e2 === "string" ? [e2] : isObj$7(e2) ? [str$4(e2.text) || str$4(e2.description) || str$4(e2.label)] : []).map((s2) => s2.trim()).filter(Boolean);
function offersFor(offers2, formatValue) {
  const rows = isObj$7(offers2) ? arr$1(offers2.offers) : [];
  return rows.filter(isObj$7).flatMap((o2) => {
    const v2 = isObj$7(o2.value) ? o2.value : null;
    const amount = v2 ? num$1(v2.value) : null;
    if (!str$4(o2.id) || !v2 || amount === null) return [];
    return [{
      id: str$4(o2.id),
      code: o2.is_automatic === true ? null : str$4(o2.code) || null,
      description: formatValue(str$4(v2.type), amount, str$4(v2.currency_code).toUpperCase() || "INR"),
      conditions: [...words(o2.conditions), ...words(o2.buy_conditions), ...words(o2.target_conditions)]
    }];
  });
}
const plainText = (html, max = 160) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
function componentSwitches(settings) {
  const prefix = "storefront.component.";
  const out = {};
  for (const [k2, v2] of Object.entries(settings)) {
    if (!k2.startsWith(prefix)) continue;
    const off = v2 === false || v2 === "off" || isObj$7(v2) && (v2.enabled === false || v2.on === false);
    if (off) out[k2.slice(prefix.length)] = false;
  }
  return out;
}
function parseCategories(raw) {
  const rows = isObj$7(raw) ? arr$1(raw.categories) : [];
  return rows.filter(isObj$7).map((c2) => ({
    id: str$4(c2.id),
    handle: str$4(c2.handle),
    name: str$4(c2.name),
    parent: str$4(c2.parent_category_id) || null
  })).filter((c2) => c2.id && c2.handle).filter((c2) => !c2.handle.startsWith("demo-"));
}
function categoryPath(rows, id) {
  const byId = new Map(rows.map((r2) => [r2.id, r2]));
  const parts = [];
  for (let cur = byId.get(id), n = 0; cur && n < 10; cur = cur.parent ? byId.get(cur.parent) : void 0, n++) parts.unshift(cur.handle);
  return parts.join("/");
}
function categoryChain(rows, id) {
  const byId = new Map(rows.map((r2) => [r2.id, r2]));
  const chain = [];
  for (let cur = byId.get(id), n = 0; cur && n < 10; cur = cur.parent ? byId.get(cur.parent) : void 0, n++) chain.unshift(cur);
  return chain;
}
function menuTree(rows) {
  const item = (r2) => ({
    id: r2.id,
    name: r2.name || r2.handle,
    path: categoryPath(rows, r2.id)
  });
  return rows.filter((r2) => !r2.parent).map((r2) => ({
    ...item(r2),
    children: rows.filter((c2) => c2.parent === r2.id).map(item)
  }));
}
const MAX_BADGES = 2;
const NEW_WINDOW_DAYS = 30;
const DAY_MS$1 = 864e5;
function badgeHolds(key2, p2, now) {
  switch (key2) {
    case "sale":
      return p2.priceReduction === true;
    case "new":
      return typeof p2.publishedAt === "number" && p2.publishedAt <= now && now - p2.publishedAt < NEW_WINDOW_DAYS * DAY_MS$1;
    case "best_seller":
      return p2.bestSeller === true;
    case "low_stock":
      return p2.lowStock === true;
    case "free_delivery":
      return typeof p2.price === "number" && typeof p2.freeDeliveryThreshold === "number" && p2.freeDeliveryThreshold > 0 && p2.price >= p2.freeDeliveryThreshold;
    case "made_in_india":
      return typeof p2.countryOfOrigin === "string" && /^(india|bharat|in)$/i.test(p2.countryOfOrigin.trim());
  }
}
function selectBadges(p2, priority, now) {
  const out = [];
  for (const key2 of priority) {
    if (out.length >= MAX_BADGES) break;
    if (!isBadgeKey(key2) || out.includes(key2)) continue;
    if (badgeHolds(key2, p2, now)) out.push(key2);
  }
  return out;
}
const KEYS$3 = ["sale", "new", "best_seller", "low_stock", "free_delivery", "made_in_india"];
const isBadgeKey = (k2) => KEYS$3.includes(k2);
const BADGES = ["sale", "new", "best_seller", "low_stock", "free_delivery", "made_in_india"];
function cardLabels(locale) {
  return {
    from: t(locale, "plp.from"),
    priceOnRequest: t(locale, "plp.priceOnRequest"),
    save: t(locale, "plp.save"),
    moreColours: t(locale, "plp.moreColours"),
    chooseOptions: t(locale, "plp.chooseOptions"),
    unavailable: t(locale, "plp.unavailable"),
    addToCart: t(locale, "plp.addToCart"),
    quickView: t(locale, "plp.quickView"),
    quickViewFor: t(locale, "plp.quickViewFor"),
    viewFull: t(locale, "plp.viewFull"),
    srCurrent: t(locale, "plp.srCurrent"),
    srPrior: t(locale, "plp.srPrior"),
    badges: Object.fromEntries(BADGES.filter(isBadgeKey).map((b) => [b, t(locale, `plp.badge.${b}`)]))
  };
}
const UI_KEYS = ["showResultsNone", "applyLoading", "removeFilter", "showing", "loading", "loaded", "empty", "emptyHint", "error", "retry", "categories", "collections", "tags", "types", "priceMin", "priceMax", "filtersApplied", "filters", "loadMore"];
function plpUiLabels(locale) {
  const base = Object.fromEntries(UI_KEYS.map((k2) => [k2, t(locale, `plp.${k2}`)]));
  return {
    ...base,
    showResultsOne: t(locale, "plp.showResults.one"),
    showResultsOther: t(locale, "plp.showResults.other"),
    productCountOne: t(locale, "plp.productCount.one"),
    productCountOther: t(locale, "plp.productCount.other")
  };
}
const categories$1 = [{ "id": "pcat_01M7WWS7N9RSAAGJMBCQ9N712X", "name": "White Boards", "rank": 0, "handle": "white-boards", "description": "Marker boards in Non-Magnetic, Magnetic and Ceramic variants, with High Gloss Marker Grade HPL Sheet and premium writing surfaces.", "parent_category_id": null }, { "id": "pcat_01M7WWS7PBSRT0KQDQ4636CJFS", "name": "Non-Magnetic White Boards", "rank": 1, "handle": "white-boards-non-magnetic", "description": "Marker boards in Non-Magnetic, Magnetic and Ceramic variants, with High Gloss Marker Grade HPL Sheet and premium writing surfaces.", "parent_category_id": "pcat_01M7WWS7N9RSAAGJMBCQ9N712X" }, { "id": "pcat_01M7WWS7PHP0Y7RH2Y21PXANWK", "name": "Magnetic White Boards", "rank": 2, "handle": "white-boards-magnetic", "description": "Marker boards in Non-Magnetic, Magnetic and Ceramic variants, with High Gloss Marker Grade HPL Sheet and premium writing surfaces.", "parent_category_id": "pcat_01M7WWS7N9RSAAGJMBCQ9N712X" }, { "id": "pcat_01M7WWS7PNZ5KK0DQ412K4TZAK", "name": "Ceramic White Boards", "rank": 3, "handle": "white-boards-ceramic", "description": "Marker boards in Non-Magnetic, Magnetic and Ceramic variants, with High Gloss Marker Grade HPL Sheet and premium writing surfaces.", "parent_category_id": "pcat_01M7WWS7N9RSAAGJMBCQ9N712X" }, { "id": "pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ", "name": "Chalk Boards", "rank": 10, "handle": "chalk-boards", "description": "Chalk boards in Non-Magnetic, Magnetic and Ceramic variants with Chalk Grade HPL Sheet — non-reflective, glare-free surfaces.", "parent_category_id": null }, { "id": "pcat_01M7WWS7PXMEEH6PBRZAHQ0W2N", "name": "Non-Magnetic Chalk Boards", "rank": 11, "handle": "chalk-boards-non-magnetic", "description": "Chalk boards in Non-Magnetic, Magnetic and Ceramic variants with Chalk Grade HPL Sheet — non-reflective, glare-free surfaces.", "parent_category_id": "pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ" }, { "id": "pcat_01M7WWS7Q2B6W1HSYG9XKR3MC8", "name": "Magnetic Chalk Boards", "rank": 12, "handle": "chalk-boards-magnetic", "description": "Chalk boards in Non-Magnetic, Magnetic and Ceramic variants with Chalk Grade HPL Sheet — non-reflective, glare-free surfaces.", "parent_category_id": "pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ" }, { "id": "pcat_01M7WWS7Q6DQE5CV93E16K4NRY", "name": "Ceramic Chalk Boards", "rank": 13, "handle": "chalk-boards-ceramic", "description": "Chalk boards in Non-Magnetic, Magnetic and Ceramic variants with Chalk Grade HPL Sheet — non-reflective, glare-free surfaces.", "parent_category_id": "pcat_01M7WWS7PSJPM7ZKT55EY3NPDJ" }, { "id": "pcat_01M7WWS7QA4D29XXKCCX6WVZ57", "name": "Double-Sided Boards", "rank": 20, "handle": "double-sided-boards", "description": "Two writing surfaces in one frame — marker on one side and chalk on the other, in premium aluminium frames.", "parent_category_id": null }, { "id": "pcat_01M7WWS7QDBE07027DZ4ENKH9A", "name": "Notice Boards", "rank": 30, "handle": "notice-boards", "description": "Pin-up notice boards in Blazer Cloth, Velvet Cloth, Cork and Fabric surfaces, in four aluminium frame series.", "parent_category_id": null }, { "id": "pcat_01M7WWS7QH8BPCS17YKQDTRBN8", "name": "Pin-Up Boards", "rank": 31, "handle": "notice-boards-pin-up", "description": "Pin-up notice boards in Blazer Cloth, Velvet Cloth, Cork and Fabric surfaces, in four aluminium frame series.", "parent_category_id": "pcat_01M7WWS7QDBE07027DZ4ENKH9A" }, { "id": "pcat_01M7WWS7QMAF75CRWWBA7A1QMC", "name": "Acrylic Door Cover (ADC)", "rank": 32, "handle": "notice-boards-adc", "description": "Pin-up notice boards in Blazer Cloth, Velvet Cloth, Cork and Fabric surfaces, in four aluminium frame series.", "parent_category_id": "pcat_01M7WWS7QDBE07027DZ4ENKH9A" }, { "id": "pcat_01M7WWS7QRTQYCMEC0KPPBK0BD", "name": "Acrylic Door Cover Notice Boards", "rank": 40, "handle": "acrylic-door-cover-notice-boards", "description": "Lockable notice boards with transparent acrylic door covers that protect notices from dust and handling.", "parent_category_id": null }, { "id": "pcat_01M7WWS7QW5782C2Z9HF6PK6TT", "name": "Specialty Display Boards", "rank": 50, "handle": "specialty-boards", "description": "Acrylic folder display boards for organised display of charts, reports, SOPs and production data.", "parent_category_id": null }, { "id": "pcat_01M7WWS7QZAEK9B31MH8XVGGWA", "name": "Board & Study Essentials", "rank": 60, "handle": "board-study-essentials", "description": "Practice boards for handwriting, lockable key hanger boards and a foldable homework table.", "parent_category_id": null }, { "id": "pcat_01M7WWS7R3S2GQ82DAZXBMFN9B", "name": "Display Boards", "rank": 70, "handle": "display-boards", "description": "Grooved boards and black perforated boards with letter and figure sets for information display.", "parent_category_id": null }, { "id": "pcat_01M7WWS7R7DXXRWY8WQA3EADEQ", "name": "Board Stands & Storage", "rank": 80, "handle": "board-stands", "description": "Board stands, newspaper and magazine stands, file racks, first aid boxes and letter boxes.", "parent_category_id": null }, { "id": "pcat_01M7WWS7RAJ9SADEZ7K1W7XTH1", "name": "Display Stands", "rank": 81, "handle": "board-stands-stands", "description": "Board stands, newspaper and magazine stands, file racks, first aid boxes and letter boxes.", "parent_category_id": "pcat_01M7WWS7R7DXXRWY8WQA3EADEQ" }, { "id": "pcat_01M7WWS7REYZ7MRJE57JYQAX4K", "name": "Storage & Racks", "rank": 82, "handle": "board-stands-storage", "description": "Board stands, newspaper and magazine stands, file racks, first aid boxes and letter boxes.", "parent_category_id": "pcat_01M7WWS7R7DXXRWY8WQA3EADEQ" }, { "id": "pcat_01M7WWS7RJM8TZBQ91785CAKGE", "name": "Clipboards", "rank": 90, "handle": "clipboards", "description": "MDF and acrylic clipboards with Chrome Electroplated Clips and Dual-Side Cap Rivets.", "parent_category_id": null }, { "id": "pcat_01M7WWS7RN6AXVYARFMB4EEYG5", "name": "MDF Base", "rank": 91, "handle": "clipboards-mdf", "description": "MDF and acrylic clipboards with Chrome Electroplated Clips and Dual-Side Cap Rivets.", "parent_category_id": "pcat_01M7WWS7RJM8TZBQ91785CAKGE" }, { "id": "pcat_01M7WWS7RSW0ATVM0VCHZAPB88", "name": "Acrylic Base", "rank": 92, "handle": "clipboards-acrylic", "description": "MDF and acrylic clipboards with Chrome Electroplated Clips and Dual-Side Cap Rivets.", "parent_category_id": "pcat_01M7WWS7RJM8TZBQ91785CAKGE" }, { "id": "pcat_01M7WWS7RX9PXMXJKSKP1P2T6P", "name": "School Benches", "rank": 100, "handle": "school-benches", "description": "School bench models PDS-SB 801 to PDS-SB 815 for schools and educational institutions.", "parent_category_id": null }, { "id": "pcat_01M7WWS7S1S4ESA00P9AC7GQQN", "name": "Schedule Boards", "rank": 110, "handle": "schedule-boards", "description": "Dry wipe schedule boards available in any design and any size, made to the customer's sketch.", "parent_category_id": null }];
const count = 24;
const categoriesJson = {
  categories: categories$1,
  count
};
var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(cooked.slice()) }));
var _a$2;
const $$Header = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Header;
  const { locale, pathname, shell } = Astro2.props;
  const current = currentNav(pathname);
  const other = otherLocale(locale);
  const home2 = localizePath(locale, "/");
  const rows = parseCategories(categoriesJson);
  const menu = rows.length ? menuTree(rows) : shell.categories.filter((c2) => !c2.slug.startsWith("demo-")).map((c2) => ({ id: c2.slug, name: c2.name[locale], path: c2.slug, children: [] }));
  const topNav = menu.slice(0, 6);
  const useWordmark = !shell.brand.logoUrl && shell.brand.name.toLowerCase() === "plusmark";
  const pdp = loadPdpData();
  const supportPhone = shell.seller.customerCarePhone;
  const searchConfig = JSON.stringify({
    locale,
    regionId: pdp.regionId,
    currency: pdp.currency.toLowerCase(),
    categories: rows.map((r2) => ({ id: r2.id, handle: r2.handle, name: r2.name, parent: r2.parent })),
    searchPath: localizePath(locale, "/search"),
    shopPrefix: localizePath(locale, "/shop"),
    labels: { ...Object.fromEntries(["suggestions", "products", "categories", "recent", "clearRecent", "seeAll", "loading", "found", "none"].map((k2) => [k2, t(locale, `search.${k2}`)])), card: cardLabels(locale) }
  }).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");
  return renderTemplate(_a$2 || (_a$2 = __template$2(["", '<header class="pm-header" data-pm-header', '> <div class="pm-announce"> <div class="pm-container pm-announce__inner"> <p>', "</p> <a", ' class="pm-announce__link">', '</a> </div> </div> <div class="pm-container pm-header__inner"> <button type="button" class="pm-button pm-button--ghost pm-header__menu" data-pm-open="pm-menu" aria-haspopup="dialog"> ', " ", ' </button> <a class="pm-header__brand"', "", "> ", " <span", ">", '</span> </a> <nav class="pm-header__nav"', "> <ul> ", ' <li><a class="pm-header__nav-all"', ">", '</a></li> </ul> </nav> <form class="pm-header__search" role="search"', ' method="get"> <label class="pm-visually-hidden" for="pm-search-q">', '</label> <input class="pm-input" id="pm-search-q" name="q" type="search" enterkeyhint="search" autocomplete="off"', ' role="combobox" aria-expanded="false" aria-controls="pm-suggest" aria-autocomplete="list"> <button type="submit" class="pm-header__search-button"', "> ", ' </button> <div class="pm-suggest" id="pm-suggest" data-pm-suggest hidden></div> <p class="pm-visually-hidden" role="status" aria-live="polite" data-pm-suggest-status></p> </form> ', ' <a class="pm-header__action"', "", "> ", ' <span class="pm-header__action-text">', '</span> </a> <a class="pm-header__action pm-header__cart"', "", "> ", ' <span class="pm-header__action-text">', "</span> ", " </a> </div> ", ' <script type="application/json" id="pm-search-config">', "<\/script> </header>"])), maybeRenderHead(), addAttribute(t(locale, "landmarks.header"), "aria-label"), t(locale, "nav.announce"), addAttribute(localizePath(locale, "/contact"), "href"), t(locale, "nav.bulk"), renderComponent($$result, "Icon", $$Icon, { "name": "menu" }), renderComponent($$result, "VisuallyHidden", $$VisuallyHidden, {}, { "default": ($$result2) => renderTemplate`${t(locale, "nav.menu")}` }), addAttribute(home2, "href"), addAttribute(current === "home" ? "page" : void 0, "aria-current"), shell.brand.logoUrl ? renderTemplate`<img${addAttribute(shell.brand.logoUrl, "src")} alt="" height="34" class="pm-header__logo">` : useWordmark ? renderTemplate`<img class="pm-header__wordmark" src="/plusmark-wordmark.png" width="150" height="30" alt="">` : renderTemplate`<span class="pm-header__mark" aria-hidden="true">${shell.brand.name.charAt(0)}</span>`, addAttribute(useWordmark ? "pm-visually-hidden" : "pm-header__name", "class"), shell.brand.name, addAttribute(t(locale, "nav.categoriesTitle"), "aria-label"), topNav.map((c2) => c2.children.length > 0 ? renderTemplate`<li class="pm-nav-item"> <a${addAttribute(localizePath(locale, `/shop/${c2.path}`), "href")}>${c2.name}</a>  <div class="pm-mega"> <p class="pm-mega__title">${c2.name}</p> <ul class="pm-mega__links"> ${c2.children.slice(0, 10).map((s2) => renderTemplate`<li><a${addAttribute(localizePath(locale, `/shop/${s2.path}`), "href")}>${s2.name}</a></li>`)} </ul> <a class="pm-mega__all"${addAttribute(localizePath(locale, `/shop/${c2.path}`), "href")}> ${t(locale, "search.viewAll", { name: c2.name })} </a> </div> </li>` : renderTemplate`<li><a${addAttribute(localizePath(locale, `/shop/${c2.path}`), "href")}>${c2.name}</a></li>`), addAttribute(localizePath(locale, "/shop"), "href"), t(locale, "nav.shopAll"), addAttribute(localizePath(locale, "/search"), "action"), t(locale, "nav.searchLabel"), addAttribute(t(locale, "nav.searchLabel"), "placeholder"), addAttribute(t(locale, "nav.searchSubmit"), "aria-label"), renderComponent($$result, "Icon", $$Icon, { "name": "search" }), supportPhone && renderTemplate`<a class="pm-header__action pm-header__support"${addAttribute(`tel:${supportPhone.replace(/[^+\d]/g, "")}`, "href")}> ${renderComponent($$result, "Icon", $$Icon, { "name": "phone" })} <span class="pm-header__action-text">${t(locale, "nav.support")}</span> </a>`, addAttribute(localizePath(locale, "/account"), "href"), addAttribute(current === "account" ? "page" : void 0, "aria-current"), renderComponent($$result, "Icon", $$Icon, { "name": "user" }), t(locale, "nav.account"), addAttribute(localizePath(locale, "/cart"), "href"), addAttribute(current === "cart" ? "page" : void 0, "aria-current"), renderComponent($$result, "Icon", $$Icon, { "name": "cart" }), t(locale, "nav.cart"), renderComponent($$result, "CartCount", CartCount, { "client:idle": true, "label": t(locale, "nav.cartItems"), "client:component-hydration": "idle", "client:component-path": "C:/Users/palha/plusmark/apps/storefront/src/components/shell/CartCount", "client:component-export": "default" }), renderComponent($$result, "Dialog", $$Dialog, { "id": "pm-menu", "title": t(locale, "nav.menu"), "closeLabel": t(locale, "a11y.close"), "variant": "sheet" }, { "default": ($$result2) => renderTemplate` <nav${addAttribute(t(locale, "nav.categoriesTitle"), "aria-label")}> <h3>${t(locale, "nav.categoriesTitle")}</h3> <ul class="pm-menu-list"> ${menu.map((c2) => renderTemplate`<li> ${c2.children.length === 0 ? renderTemplate`<a class="pm-menu-link"${addAttribute(localizePath(locale, `/shop/${c2.path}`), "href")}>${c2.name}</a>` : renderTemplate`<details class="pm-menu-group"> <summary class="pm-menu-link">${c2.name}</summary> <ul class="pm-menu-sublist"${addAttribute(t(locale, "search.subcategories", { name: c2.name }), "aria-label")}> <li><a class="pm-menu-link"${addAttribute(localizePath(locale, `/shop/${c2.path}`), "href")}>${t(locale, "search.viewAll", { name: c2.name })}</a></li> ${c2.children.map((s2) => renderTemplate`<li><a class="pm-menu-link"${addAttribute(localizePath(locale, `/shop/${s2.path}`), "href")}>${s2.name}</a></li>`)} </ul> </details>`} </li>`)} </ul> </nav> <div class="pm-menu-language"> <h3>${t(locale, "nav.language")}</h3> <a class="pm-menu-link"${addAttribute(alternatePath(locale, pathname), "href")}${addAttribute(other, "hreflang")}${addAttribute(other, "lang")} data-pm-lang-switch>${t(locale, "nav.otherLanguageName")}</a> </div> ` }), unescapeHTML(searchConfig));
}, "C:/Users/palha/plusmark/apps/storefront/src/components/shell/Header.astro", void 0);
const $$BottomNav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BottomNav;
  const { locale, pathname } = Astro2.props;
  const current = currentNav(pathname);
  const link = (key2) => ({
    href: localizePath(locale, key2 === "home" ? "/" : `/${key2}`),
    "aria-current": current === key2 ? "page" : void 0
  });
  return renderTemplate`${maybeRenderHead()}<nav class="pm-bottomnav" data-pm-bottomnav${addAttribute(t(locale, "nav.quickLinks"), "aria-label")}> <ul> <li> <a class="pm-bottomnav__item"${spreadAttributes(link("home"))}>${renderComponent($$result, "Icon", $$Icon, { "name": "home" })}<span>${t(locale, "nav.home")}</span></a> </li> <li> <button type="button" class="pm-bottomnav__item" data-pm-open="pm-menu" aria-haspopup="dialog">${renderComponent($$result, "Icon", $$Icon, { "name": "menu" })}<span>${t(locale, "nav.categories")}</span></button> </li> <li> <a class="pm-bottomnav__item"${spreadAttributes(link("search"))}>${renderComponent($$result, "Icon", $$Icon, { "name": "search" })}<span>${t(locale, "nav.search")}</span></a> </li> <li> <a class="pm-bottomnav__item pm-header__cart"${spreadAttributes(link("cart"))}> ${renderComponent($$result, "Icon", $$Icon, { "name": "cart" })}<span>${t(locale, "nav.cart")}</span> ${renderComponent($$result, "CartCount", CartCount, { "client:idle": true, "label": t(locale, "nav.cartItems"), "client:component-hydration": "idle", "client:component-path": "C:/Users/palha/plusmark/apps/storefront/src/components/shell/CartCount", "client:component-export": "default" })} </a> </li> <li> <a class="pm-bottomnav__item"${spreadAttributes(link("account"))}>${renderComponent($$result, "Icon", $$Icon, { "name": "user" })}<span>${t(locale, "nav.account")}</span></a> </li> </ul> </nav>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/shell/BottomNav.astro", void 0);
const $$RequestSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$RequestSection;
  const { locale, id, heading, intro, signInPath } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="pm-request"${addAttribute(id, "id")}${addAttribute(heading ? `${id}-h` : void 0, "aria-labelledby")} data-pm-requests${addAttribute(locale, "data-locale")}${addAttribute(signInPath, "data-signin-path")}> ${heading && renderTemplate`<h2${addAttribute(`${id}-h`, "id")} class="pm-request__heading">${heading}</h2>`} ${intro && renderTemplate`<p class="pm-request__intro">${intro}</p>`} ${renderSlot($$result, $$slots["default"])} <p class="pm-request__status" data-pm-status role="status" aria-live="polite" hidden></p> </section> ${renderScript($$result, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/RequestSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/RequestSection.astro", void 0);
const generated$1 = /* @__PURE__ */ Object.assign({
  "../data/settings.json": __vite_glob_0_0$2
});
function loadSettings() {
  return Object.values(generated$1)[0] ?? {};
}
const DEFAULT_REPLY_HOURS = 48;
function featuresFrom(settings) {
  const on = (k2) => settings[`feature.${k2}`] === true;
  const hours = Number(settings["storefront.enquiry_reply_hours"]);
  return {
    reviews: on("reviews"),
    enquiries: on("enquiries"),
    quotations: on("quotations"),
    wishlists: on("wishlists"),
    backInStock: componentSwitches(settings).back_in_stock_alert !== false,
    replyHours: Number.isInteger(hours) && hours > 0 ? hours : DEFAULT_REPLY_HOURS
  };
}
const save$1 = "Save";
const saved$1 = "Saved";
const saveFor$1 = "Save {title}";
const savedFor$1 = "Remove {title} from saved products";
const saveAdded$1 = "Saved.";
const saveRemoved$1 = "Removed from saved products.";
const saveFull$1 = "You can save up to 50 products on this device. Remove one to save another.";
const saveFailed$1 = "The product could not be saved. Try again.";
const saveMoved$1 = "Your saved products were added to your wishlist.";
const send$1 = "Send";
const sending$1 = "Sending…";
const required$1 = "required";
const captchaNeeded$1 = "Complete the security check first.";
const captchaUnavailable$1 = "The security check is not available. Reload the page and try again.";
const errInvalid$1 = "Check the highlighted field: {field}.";
const errRate$1 = "Too many requests. Wait a while and try again. Your text is kept.";
const errRateAt$1 = "Too many requests. Try again after {time}. Your text is kept.";
const errCaptcha$1 = "The security check failed. Try again.";
const errNetwork$1 = "The request did not reach us. Check your connection and try again.";
const errUnknown$1 = "The request could not be completed. Try again.";
const errOff$1 = "This is not available right now.";
const en$1 = {
  save: save$1,
  saved: saved$1,
  saveFor: saveFor$1,
  savedFor: savedFor$1,
  saveAdded: saveAdded$1,
  saveRemoved: saveRemoved$1,
  saveFull: saveFull$1,
  saveFailed: saveFailed$1,
  saveMoved: saveMoved$1,
  send: send$1,
  sending: sending$1,
  required: required$1,
  captchaNeeded: captchaNeeded$1,
  captchaUnavailable: captchaUnavailable$1,
  errInvalid: errInvalid$1,
  errRate: errRate$1,
  errRateAt: errRateAt$1,
  errCaptcha: errCaptcha$1,
  errNetwork: errNetwork$1,
  errUnknown: errUnknown$1,
  errOff: errOff$1,
  "field.rating": "rating",
  "field.title": "title",
  "field.body": "review",
  "field.name": "name",
  "field.email": "email address",
  "field.phone": "phone number",
  "field.message": "message",
  "field.note": "note",
  "field.quantity": "quantity",
  "field.items": "products",
  "rev.heading": "Write a review",
  "rev.rating": "Rating",
  "rev.star": "{n} out of 5",
  "rev.title": "Title (optional)",
  "rev.body": "Your review",
  "rev.submit": "Submit review",
  "rev.signIn": "Sign in to write a review.",
  "rev.signInLink": "Sign in",
  "rev.done": "Thank you. Your review is awaiting moderation and will show once the store approves it.",
  "rev.yours": "Your review (awaiting moderation)",
  "rev.already": "You have already reviewed this product.",
  "rev.unauthorized": "Sign in to write a review.",
  "enq.heading": "Ask about this product",
  "enq.headingGeneral": "Send us an enquiry",
  "enq.name": "Name",
  "enq.email": "Email address",
  "enq.phone": "Phone number (optional)",
  "enq.message": "Message",
  "enq.submit": "Send enquiry",
  "enq.done": "Thank you. We reply within {hours} hours.",
  "quote.heading": "Request a quotation",
  "quote.intro": "Ask for a price for larger quantities. We reply within {hours} hours.",
  "quote.variant": "Product option",
  "quote.quantity": "Quantity",
  "quote.addLine": "Add another option",
  "quote.removeLine": "Remove",
  "quote.email": "Email address",
  "quote.note": "Note (optional)",
  "quote.submit": "Request quotation",
  "quote.done": "Thank you. Your quotation request {id} is received. We reply within {hours} hours.",
  "bis.heading": "Tell me when it is back",
  "bis.text": "This option is out of stock. We send one email when it is available again and use your address for nothing else.",
  "bis.email": "Email address",
  "bis.submit": "Notify me",
  "bis.done": "Done. We will send one email when this product is back in stock.",
  "bis.inStock": "This option is in stock now.",
  "news.heading": "Newsletter",
  "news.text": "Offers and news by email. We send a link to confirm your address first.",
  "news.email": "Email address",
  "news.submit": "Sign up",
  "news.done": "Check your email and follow the link to confirm your sign-up.",
  "quotes.heading": "Quotations",
  "quotes.none": "You have no quotations.",
  "quotes.number": "Quotation {id}",
  "quotes.status": "Status",
  "quotes.expires": "Valid until {date}",
  "quotes.unit": "{qty} × {price}",
  "quotes.unpriced": "Awaiting our price",
  "quotes.total": "Total {amount}",
  "quotes.accept": "Accept and add to cart",
  "quotes.accepted": "Quotation accepted. Your cart is ready.",
  "quotes.goCart": "Go to cart",
  "quotes.acceptFailed": "This quotation can no longer be accepted.",
  "quotes.cartReady": "Added to a cart"
};
const save = "सहेजें";
const saved = "सहेजा गया";
const saveFor = "{title} सहेजें";
const savedFor = "{title} को सहेजे गए उत्पादों से हटाएँ";
const saveAdded = "सहेज लिया गया।";
const saveRemoved = "सहेजे गए उत्पादों से हटा दिया।";
const saveFull = "इस डिवाइस पर अधिकतम 50 उत्पाद सहेज सकते हैं। नया सहेजने के लिए एक हटाएँ।";
const saveFailed = "उत्पाद सहेजा नहीं जा सका। दोबारा कोशिश करें।";
const saveMoved = "आपके सहेजे गए उत्पाद विशलिस्ट में जोड़ दिए गए।";
const send = "भेजें";
const sending = "भेजा जा रहा है…";
const required = "ज़रूरी";
const captchaNeeded = "पहले सुरक्षा जाँच पूरी करें।";
const captchaUnavailable = "सुरक्षा जाँच उपलब्ध नहीं है। पेज दोबारा खोलकर कोशिश करें।";
const errInvalid = "चिह्नित फ़ील्ड जाँचें: {field}।";
const errRate = "बहुत अधिक अनुरोध। कुछ देर बाद दोबारा कोशिश करें। आपका लिखा हुआ सुरक्षित है।";
const errRateAt = "बहुत अधिक अनुरोध। {time} के बाद दोबारा कोशिश करें। आपका लिखा हुआ सुरक्षित है।";
const errCaptcha = "सुरक्षा जाँच विफल रही। दोबारा कोशिश करें।";
const errNetwork = "अनुरोध हम तक नहीं पहुँचा। कनेक्शन जाँचकर दोबारा कोशिश करें।";
const errUnknown = "अनुरोध पूरा नहीं हो सका। दोबारा कोशिश करें।";
const errOff = "यह अभी उपलब्ध नहीं है।";
const hi$1 = {
  save,
  saved,
  saveFor,
  savedFor,
  saveAdded,
  saveRemoved,
  saveFull,
  saveFailed,
  saveMoved,
  send,
  sending,
  required,
  captchaNeeded,
  captchaUnavailable,
  errInvalid,
  errRate,
  errRateAt,
  errCaptcha,
  errNetwork,
  errUnknown,
  errOff,
  "field.rating": "रेटिंग",
  "field.title": "शीर्षक",
  "field.body": "समीक्षा",
  "field.name": "नाम",
  "field.email": "ईमेल पता",
  "field.phone": "फ़ोन नंबर",
  "field.message": "संदेश",
  "field.note": "नोट",
  "field.quantity": "मात्रा",
  "field.items": "उत्पाद",
  "rev.heading": "समीक्षा लिखें",
  "rev.rating": "रेटिंग",
  "rev.star": "5 में से {n}",
  "rev.title": "शीर्षक (वैकल्पिक)",
  "rev.body": "आपकी समीक्षा",
  "rev.submit": "समीक्षा भेजें",
  "rev.signIn": "समीक्षा लिखने के लिए साइन इन करें।",
  "rev.signInLink": "साइन इन",
  "rev.done": "धन्यवाद। आपकी समीक्षा मॉडरेशन की प्रतीक्षा में है और स्टोर की मंज़ूरी के बाद दिखेगी।",
  "rev.yours": "आपकी समीक्षा (मॉडरेशन की प्रतीक्षा में)",
  "rev.already": "आप इस उत्पाद की समीक्षा पहले ही कर चुके हैं।",
  "rev.unauthorized": "समीक्षा लिखने के लिए साइन इन करें।",
  "enq.heading": "इस उत्पाद के बारे में पूछें",
  "enq.headingGeneral": "हमें पूछताछ भेजें",
  "enq.name": "नाम",
  "enq.email": "ईमेल पता",
  "enq.phone": "फ़ोन नंबर (वैकल्पिक)",
  "enq.message": "संदेश",
  "enq.submit": "पूछताछ भेजें",
  "enq.done": "धन्यवाद। हम {hours} घंटे के भीतर उत्तर देते हैं।",
  "quote.heading": "कोटेशन माँगें",
  "quote.intro": "अधिक मात्रा के लिए कीमत पूछें। हम {hours} घंटे के भीतर उत्तर देते हैं।",
  "quote.variant": "उत्पाद विकल्प",
  "quote.quantity": "मात्रा",
  "quote.addLine": "एक और विकल्प जोड़ें",
  "quote.removeLine": "हटाएँ",
  "quote.email": "ईमेल पता",
  "quote.note": "नोट (वैकल्पिक)",
  "quote.submit": "कोटेशन माँगें",
  "quote.done": "धन्यवाद। आपका कोटेशन अनुरोध {id} मिल गया है। हम {hours} घंटे के भीतर उत्तर देते हैं।",
  "bis.heading": "स्टॉक में आने पर बताएँ",
  "bis.text": "यह विकल्प स्टॉक में नहीं है। दोबारा उपलब्ध होने पर हम एक ईमेल भेजेंगे और आपके पते का किसी और काम में उपयोग नहीं होगा।",
  "bis.email": "ईमेल पता",
  "bis.submit": "मुझे बताएँ",
  "bis.done": "हो गया। उत्पाद के दोबारा स्टॉक में आने पर हम एक ईमेल भेजेंगे।",
  "bis.inStock": "यह विकल्प अब स्टॉक में है।",
  "news.heading": "न्यूज़लेटर",
  "news.text": "ऑफ़र और ख़बरें ईमेल से। पहले हम आपका पता पक्का करने का लिंक भेजते हैं।",
  "news.email": "ईमेल पता",
  "news.submit": "साइन अप करें",
  "news.done": "अपना ईमेल देखें और साइन-अप पक्का करने के लिए लिंक खोलें।",
  "quotes.heading": "कोटेशन",
  "quotes.none": "आपका कोई कोटेशन नहीं है।",
  "quotes.number": "कोटेशन {id}",
  "quotes.status": "स्थिति",
  "quotes.expires": "{date} तक मान्य",
  "quotes.unit": "{qty} × {price}",
  "quotes.unpriced": "हमारी कीमत की प्रतीक्षा",
  "quotes.total": "कुल {amount}",
  "quotes.accept": "स्वीकार करें और कार्ट में जोड़ें",
  "quotes.accepted": "कोटेशन स्वीकार हुआ। आपका कार्ट तैयार है।",
  "quotes.goCart": "कार्ट पर जाएँ",
  "quotes.acceptFailed": "यह कोटेशन अब स्वीकार नहीं किया जा सकता।",
  "quotes.cartReady": "कार्ट में जोड़ा गया"
};
const DICT$1 = {
  en: en$1,
  hi: {
    ...en$1,
    ...hi$1
  }
};
const rq = (locale, key2, params) => interpolate(DICT$1[locale][key2] ?? key2, params);
const buildFeatures = () => featuresFrom(loadSettings());
const $$FormEnd = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$FormEnd;
  const { locale, submit } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="pm-request__captcha" data-pm-captcha></div> <button type="submit" class="pm-button pm-button--primary" data-pm-submit${addAttribute(rq(locale, "sending"), "data-sending")}>${submit}</button>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/FormEnd.astro", void 0);
const $$NewsletterForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$NewsletterForm;
  const { locale, heading, intro, hideHeading = false } = Astro2.props;
  const id = "pm-news";
  return renderTemplate`${renderComponent($$result, "RequestSection", $$RequestSection, { "locale": locale, "id": id, "heading": hideHeading ? void 0 : heading ?? rq(locale, "news.heading"), "intro": hideHeading ? void 0 : intro ?? rq(locale, "news.text") }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<form class="pm-request__form" data-pm-form data-action="newsletter_signup" novalidate> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-email`, "for")}>${rq(locale, "news.email")}</label> <input class="pm-input"${addAttribute(`${id}-email`, "id")} name="email" type="email" inputmode="email" maxlength="254" autocomplete="email" required></div> ${renderComponent($$result2, "FormEnd", $$FormEnd, { "locale": locale, "submit": rq(locale, "news.submit") })} </form> <div class="pm-request__done" data-pm-done hidden></div> ` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/NewsletterForm.astro", void 0);
const $$Footer = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Footer;
  const { locale, pathname, shell } = Astro2.props;
  const other = otherLocale(locale);
  const { seller: seller2, grievanceOfficer: grievanceOfficer2 } = shell;
  const POLICIES = ["returns", "refunds", "exchanges", "cancellations", "shipping", "payments", "warranties", "privacy", "terms"];
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const page2 = (path) => localizePath(locale, path);
  const hasSellerDetails = Object.values(seller2).some(Boolean) || Object.values(grievanceOfficer2).some(Boolean);
  return renderTemplate`${maybeRenderHead()}<footer class="pm-footer"${addAttribute(t(locale, "landmarks.footer"), "aria-label")}> <div class="pm-container pm-footer__grid"> <section aria-labelledby="pm-footer-policies"> <h2 id="pm-footer-policies" class="pm-footer__heading">${t(locale, "footer.policies")}</h2> <ul class="pm-footer__list"> ${POLICIES.map((slug) => renderTemplate`<li><a class="pm-link"${addAttribute(page2(`/policies/${slug}`), "href")}>${t(locale, `footer.policy.${slug}`)}</a></li>`)} </ul> </section> <section aria-labelledby="pm-footer-help"> <h2 id="pm-footer-help" class="pm-footer__heading">${t(locale, "footer.help")}</h2> <ul class="pm-footer__list"> <li><a class="pm-link"${addAttribute(page2("/contact"), "href")}>${t(locale, "footer.contact")}</a></li> <li><a class="pm-link"${addAttribute(page2("/seller"), "href")}>${t(locale, "footer.sellerPage")}</a></li> <li><a class="pm-link"${addAttribute(page2("/ranking-disclosure"), "href")}>${t(locale, "footer.ranking")}</a></li> <li><a class="pm-link" href="/why">${t(locale, "footer.why")}</a></li> <li><a class="pm-link"${addAttribute(page2("/compliance-certificate"), "href")}>${t(locale, "footer.certificate")}</a></li> <li><a class="pm-link"${addAttribute(page2("/policies/privacy#choices"), "href")} data-pm-privacy-choices>${t(locale, "footer.privacyChoices")}</a></li> <li><a class="pm-link"${addAttribute(alternatePath(locale, pathname), "href")}${addAttribute(other, "hreflang")}${addAttribute(other, "lang")} data-pm-lang-switch>${t(locale, "nav.otherLanguageName")}</a></li> </ul> </section> ${hasSellerDetails && renderTemplate`<section aria-labelledby="pm-footer-seller"> <h2 id="pm-footer-seller" class="pm-footer__heading">${t(locale, "footer.seller")}</h2> <p class="pm-footer__text"><strong>${seller2.legalName}</strong><br>${seller2.registeredAddress}</p> <dl class="pm-footer__facts"> ${seller2.gstin && renderTemplate`<div><dt>${t(locale, "footer.gstin")}</dt><dd>${seller2.gstin}</dd></div>`} ${(seller2.customerCarePhone || seller2.customerCareEmail) && renderTemplate`<div><dt>${t(locale, "footer.care")}</dt><dd>${seller2.customerCarePhone && renderTemplate`<a${addAttribute(`tel:${seller2.customerCarePhone.replace(/[^+\d]/g, "")}`, "href")}>${seller2.customerCarePhone}</a>`}${seller2.customerCarePhone && seller2.customerCareEmail ? ", " : ""}${seller2.customerCareEmail && renderTemplate`<a${addAttribute(`mailto:${seller2.customerCareEmail}`, "href")}>${seller2.customerCareEmail}</a>`}</dd></div>`} ${(grievanceOfficer2.name || grievanceOfficer2.designation || grievanceOfficer2.phone || grievanceOfficer2.email) && renderTemplate`<div><dt>${t(locale, "footer.grievance")}</dt><dd>${[grievanceOfficer2.name, grievanceOfficer2.designation].filter(Boolean).join(", ")}${(grievanceOfficer2.name || grievanceOfficer2.designation) && (grievanceOfficer2.phone || grievanceOfficer2.email) ? ", " : ""}${grievanceOfficer2.phone && renderTemplate`<a${addAttribute(`tel:${grievanceOfficer2.phone.replace(/[^+\d]/g, "")}`, "href")}>${grievanceOfficer2.phone}</a>`}${grievanceOfficer2.phone && grievanceOfficer2.email ? ", " : ""}${grievanceOfficer2.email && renderTemplate`<a${addAttribute(`mailto:${grievanceOfficer2.email}`, "href")}>${grievanceOfficer2.email}</a>`}</dd></div>`} </dl> </section>`} </div> <div class="pm-container"> ${renderComponent($$result, "NewsletterForm", $$NewsletterForm, { "locale": locale })} </div> <div class="pm-container pm-footer__legal"> <p>${t(locale, "footer.pinCredit")}</p> <p>${t(locale, "footer.copyright").replace("{year}", String(year)).replace("{name}", shell.brand.name)}</p> </div> </footer>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/shell/Footer.astro", void 0);
const $$HindiPrompt = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$HindiPrompt;
  const { pathname } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="pm-hindi-prompt" data-pm-hindi-prompt role="region"${addAttribute(t("en", "language.switchLabel"), "aria-label")} hidden> <p class="pm-hindi-prompt__text">${t("en", "language.prompt.message")}</p> <a class="pm-hindi-prompt__accept"${addAttribute(alternatePath("en", pathname), "href")} hreflang="hi" lang="hi" data-pm-lang-switch>${t("en", "language.prompt.accept")}</a> <button type="button" class="pm-hindi-prompt__close" data-pm-hindi-prompt-close${addAttribute(t("en", "language.prompt.close"), "aria-label")}>&times;</button> </div>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/shell/HindiPrompt.astro", void 0);
const __vite_import_meta_env__ = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_MEDIA_ORIGIN": "https://placehold.co", "PUBLIC_SUPABASE_PUBLISHABLE_KEY": "sb_publishable_xlFRp85aCvi8vfvOW_mGrg_1f1Q6x68", "PUBLIC_SUPABASE_URL": "https://lkjxumiyesvufcxyaqcg.supabase.co", "PUBLIC_TURNSTILE_SITE_KEY": "1x00000000000000000000AA", "SITE": void 0, "SSR": true };
(Object.assign(__vite_import_meta_env__, { PUBLIC: "C:\\Users\\Public", _: "C:/Program Files/nodejs/node.exe" })?.PUBLIC_PRIVACY_NOTICE_VERSION ?? "").trim() || "v1";
const BUTTON_LOOK = {
  className: "pm-button pm-button--secondary pm-consent__button"
};
const $$ConsentBanner = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ConsentBanner;
  const { locale } = Astro2.props;
  const cls = BUTTON_LOOK.className;
  return renderTemplate`${maybeRenderHead()}<section class="pm-consent" data-pm-consent role="region" aria-labelledby="pm-consent-title" hidden> <h2 id="pm-consent-title" class="pm-consent__title">${t(locale, "consent.title")}</h2> <p class="pm-consent__text">${t(locale, "consent.text")}</p> <div class="pm-consent__choices" data-pm-consent-choices hidden> <label class="pm-consent__switch"> <input type="checkbox" role="switch" data-pm-consent-purpose="analytics"> <span><strong>${t(locale, "consent.analytics")}</strong> ${t(locale, "consent.analyticsText")}</span> </label> <label class="pm-consent__switch"> <input type="checkbox" role="switch" data-pm-consent-purpose="marketing_tags"> <span><strong>${t(locale, "consent.marketing")}</strong> ${t(locale, "consent.marketingText")}</span> </label> </div> <div class="pm-consent__actions"> <button type="button"${addAttribute(cls, "class")} data-pm-consent-accept>${t(locale, "consent.acceptAll")}</button> <button type="button"${addAttribute(cls, "class")} data-pm-consent-necessary>${t(locale, "consent.onlyNecessary")}</button> <button type="button"${addAttribute(cls, "class")} data-pm-consent-choose aria-expanded="false">${t(locale, "consent.choose")}</button> <button type="button"${addAttribute(cls, "class")} data-pm-consent-save hidden>${t(locale, "consent.save")}</button> </div> </section>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/shell/ConsentBanner.astro", void 0);
const $$QuickView = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$QuickView;
  const { locale } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<dialog id="pm-quick-view" class="pm-quickview" aria-labelledby="pm-quick-view-title" data-pm-dialog> <div class="pm-quickview__media"> <img class="pm-quickview__img" data-quick-view-img alt="" width="640" height="640" hidden> <ul class="pm-quickview__badges" data-quick-view-badges hidden></ul> </div> <div class="pm-quickview__body"> <div class="pm-quickview__head"> <h2 id="pm-quick-view-title" tabindex="-1" data-quick-view-title></h2> <button type="button" class="pm-button pm-button--ghost pm-quickview__close" data-pm-close${addAttribute(t(locale, "plp.close"), "aria-label")}> <span aria-hidden="true">✕</span> </button> </div> <p class="pm-quickview__price" data-quick-view-price></p> <p class="pm-quickview__prior" data-quick-view-prior hidden></p> <div class="pm-quickview__actions" data-quick-view-actions></div> <a class="pm-quickview__full" data-quick-view-full href="#">${t(locale, "plp.viewFull")}</a> </div> </dialog> ${renderScript($$result, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/QuickView.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/QuickView.astro", void 0);
const brand = { "name": "Plusmark" };
const categories = [{ "slug": "white-boards", "name": { "en": "White Boards", "hi": "White Boards" } }, { "slug": "chalk-boards", "name": { "en": "Chalk Boards", "hi": "Chalk Boards" } }, { "slug": "double-sided-boards", "name": { "en": "Double-Sided Boards", "hi": "Double-Sided Boards" } }, { "slug": "notice-boards", "name": { "en": "Notice Boards", "hi": "Notice Boards" } }, { "slug": "acrylic-door-cover-notice-boards", "name": { "en": "Acrylic Door Cover Notice Boards", "hi": "Acrylic Door Cover Notice Boards" } }, { "slug": "specialty-boards", "name": { "en": "Specialty Display Boards", "hi": "Specialty Display Boards" } }, { "slug": "board-study-essentials", "name": { "en": "Board & Study Essentials", "hi": "Board & Study Essentials" } }, { "slug": "display-boards", "name": { "en": "Display Boards", "hi": "Display Boards" } }, { "slug": "board-stands", "name": { "en": "Board Stands & Storage", "hi": "Board Stands & Storage" } }, { "slug": "clipboards", "name": { "en": "Clipboards", "hi": "Clipboards" } }, { "slug": "school-benches", "name": { "en": "School Benches", "hi": "School Benches" } }, { "slug": "schedule-boards", "name": { "en": "Schedule Boards", "hi": "Schedule Boards" } }];
const seller = {};
const grievanceOfficer = {};
const __vite_glob_0_0$1 = {
  brand,
  categories,
  seller,
  grievanceOfficer
};
const MAX_MENU_CATEGORIES = 8;
const FIXTURE_SHELL_DATA = {
  brand: {
    name: "Plusmark"
  },
  categories: [],
  seller: {
    legalName: "",
    registeredAddress: "",
    gstin: "",
    customerCarePhone: "",
    customerCareEmail: ""
  },
  grievanceOfficer: {
    name: "",
    designation: "",
    phone: "",
    email: ""
  }
};
const text$1 = (v2) => typeof v2 === "string" ? v2 : "";
function normalizeShellData(raw) {
  const base = FIXTURE_SHELL_DATA;
  if (!raw) return base;
  const categories2 = (raw.categories ?? base.categories).filter((c2) => c2 && text$1(c2.slug) && text$1(c2.name?.en)).slice(0, MAX_MENU_CATEGORIES).map((c2) => ({
    slug: c2.slug,
    name: {
      en: c2.name.en,
      hi: text$1(c2.name.hi) || c2.name.en
    }
  }));
  return {
    brand: {
      name: text$1(raw.brand?.name) || base.brand.name,
      logoUrl: raw.brand?.logoUrl || void 0
    },
    categories: categories2,
    seller: {
      ...base.seller,
      ...raw.seller
    },
    grievanceOfficer: {
      ...base.grievanceOfficer,
      ...raw.grievanceOfficer
    }
  };
}
const generated = /* @__PURE__ */ Object.assign({
  "../data/shell.json": __vite_glob_0_0$1
});
function loadShellData() {
  const raw = Object.values(generated)[0];
  return normalizeShellData(raw && Object.keys(raw).length ? raw : FIXTURE_SHELL_DATA);
}
const key$6 = "b2b";
const name$6 = { "en": "B2B and industrial", "hi": "बी2बी और औद्योगिक" };
const sections$6 = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "Supply for your business", "hi": "आपके व्यवसाय के लिए आपूर्ति" }, "text": { "en": "Bulk prices and quotations on request.", "hi": "थोक कीमतें और अनुरोध पर कोटेशन।" } } }, { "id": "categories", "type": "category_grid", "settings": {} }, { "id": "trust", "type": "trust_strip", "settings": {} }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Most ordered", "hi": "सबसे ज़्यादा ऑर्डर किए गए" } } }, { "id": "story", "type": "brand_story", "settings": {} }, { "id": "faq", "type": "faq", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks$6 = ["description", "quantity_tiers", "minimum_order_quantity", "quotation_request", "specifications"];
const plp_filters$6 = ["categories", "types", "price", "options", "tags"];
const badges$6 = ["best_seller", "low_stock", "free_delivery", "made_in_india", "new", "sale"];
const attributes$6 = [{ "key": "minimum_order_quantity", "type": "number", "unit": "pc", "block": "minimum_order_quantity", "mandatory_declaration": false }, { "key": "price_on_request", "type": "boolean", "unit": null, "block": "quotation_request", "mandatory_declaration": false }, { "key": "hsn_code", "type": "text", "unit": null, "block": "specifications", "mandatory_declaration": false }, { "key": "lead_time_days", "type": "number", "unit": "days", "block": "quantity_tiers", "mandatory_declaration": false }, { "key": "brand", "type": "text", "unit": null, "block": "specifications", "mandatory_declaration": false }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_0 = {
  key: key$6,
  name: name$6,
  sections: sections$6,
  pdp_blocks: pdp_blocks$6,
  plp_filters: plp_filters$6,
  badges: badges$6,
  attributes: attributes$6
};
const key$5 = "beauty";
const name$5 = { "en": "Beauty and personal care", "hi": "ब्यूटी और पर्सनल केयर" };
const sections$5 = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "Care that suits your skin", "hi": "आपकी त्वचा के अनुकूल देखभाल" } } }, { "id": "categories", "type": "category_grid", "settings": {} }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Best sellers", "hi": "सबसे ज़्यादा बिकने वाले" } } }, { "id": "reviews", "type": "review_highlights", "settings": {} }, { "id": "new", "type": "product_rail", "settings": { "source": "newest", "limit": 8, "heading": { "en": "New arrivals", "hi": "नए उत्पाद" } } }, { "id": "story", "type": "brand_story", "settings": {} }, { "id": "faq", "type": "faq", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks$5 = ["description", "ingredients", "suitability", "how_to_use", "specifications"];
const plp_filters$5 = ["categories", "price", "tags", "options", "collections"];
const badges$5 = ["sale", "new", "best_seller", "low_stock", "free_delivery", "made_in_india"];
const attributes$5 = [{ "key": "ingredients", "type": "text", "unit": null, "block": "ingredients", "mandatory_declaration": false }, { "key": "skin_type", "type": "text", "unit": null, "block": "suitability", "mandatory_declaration": false }, { "key": "suitable_for", "type": "text", "unit": null, "block": "suitability", "mandatory_declaration": false }, { "key": "how_to_use", "type": "text", "unit": null, "block": "how_to_use", "mandatory_declaration": false }, { "key": "net_quantity", "type": "number", "unit": "g|ml|pc", "block": "declarations", "mandatory_declaration": true }, { "key": "manufactured_on", "type": "date", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "generic_name", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_1 = {
  key: key$5,
  name: name$5,
  sections: sections$5,
  pdp_blocks: pdp_blocks$5,
  plp_filters: plp_filters$5,
  badges: badges$5,
  attributes: attributes$5
};
const key$4 = "electronics";
const name$4 = { "en": "Electronics and gadgets", "hi": "इलेक्ट्रॉनिक्स और गैजेट" };
const sections$4 = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "Gadgets that work as promised", "hi": "गैजेट जो वादे पर खरे उतरें" } } }, { "id": "offer", "type": "offer_banner", "settings": {} }, { "id": "categories", "type": "category_grid", "settings": {} }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Top picks", "hi": "सबसे पसंदीदा" } } }, { "id": "trust", "type": "trust_strip", "settings": {} }, { "id": "new", "type": "product_rail", "settings": { "source": "newest", "limit": 8, "heading": { "en": "Just launched", "hi": "अभी लॉन्च हुए" } } }, { "id": "reviews", "type": "review_highlights", "settings": {} }, { "id": "faq", "type": "faq", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks$4 = ["description", "key_specifications", "warranty", "comparison", "specifications"];
const plp_filters$4 = ["categories", "price", "options", "types", "tags"];
const badges$4 = ["sale", "low_stock", "best_seller", "new", "free_delivery", "made_in_india"];
const attributes$4 = [{ "key": "warranty_months", "type": "number", "unit": "months", "block": "warranty", "mandatory_declaration": false }, { "key": "warranty_terms", "type": "text", "unit": null, "block": "warranty", "mandatory_declaration": false }, { "key": "model_number", "type": "text", "unit": null, "block": "key_specifications", "mandatory_declaration": false }, { "key": "processor", "type": "text", "unit": null, "block": "key_specifications", "mandatory_declaration": false }, { "key": "battery", "type": "text", "unit": null, "block": "key_specifications", "mandatory_declaration": false }, { "key": "display", "type": "text", "unit": null, "block": "key_specifications", "mandatory_declaration": false }, { "key": "connectivity", "type": "text", "unit": null, "block": "key_specifications", "mandatory_declaration": false }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_2 = {
  key: key$4,
  name: name$4,
  sections: sections$4,
  pdp_blocks: pdp_blocks$4,
  plp_filters: plp_filters$4,
  badges: badges$4,
  attributes: attributes$4
};
const key$3 = "fashion";
const name$3 = { "en": "Fashion and apparel", "hi": "फ़ैशन और परिधान" };
const sections$3 = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "New season, new look", "hi": "नया मौसम, नया अंदाज़" } } }, { "id": "categories", "type": "category_grid", "settings": {} }, { "id": "new", "type": "product_rail", "settings": { "source": "newest", "limit": 8, "heading": { "en": "New in", "hi": "नया आया" } } }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Best sellers", "hi": "सबसे ज़्यादा बिकने वाले" } } }, { "id": "offer", "type": "offer_banner", "settings": {} }, { "id": "reviews", "type": "review_highlights", "settings": {} }, { "id": "trust", "type": "trust_strip", "settings": {} }, { "id": "story", "type": "brand_story", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks$3 = ["description", "size_guide", "fit_notes", "specifications"];
const plp_filters$3 = ["categories", "options", "price", "collections", "tags"];
const badges$3 = ["sale", "new", "best_seller", "low_stock", "free_delivery", "made_in_india"];
const attributes$3 = [{ "key": "fit", "type": "text", "unit": null, "block": "fit_notes", "mandatory_declaration": false }, { "key": "fabric", "type": "text", "unit": null, "block": "fit_notes", "mandatory_declaration": false }, { "key": "size_chart", "type": "text", "unit": null, "block": "size_guide", "mandatory_declaration": false }, { "key": "care_instructions", "type": "text", "unit": null, "block": "fit_notes", "mandatory_declaration": false }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_3 = {
  key: key$3,
  name: name$3,
  sections: sections$3,
  pdp_blocks: pdp_blocks$3,
  plp_filters: plp_filters$3,
  badges: badges$3,
  attributes: attributes$3
};
const key$2 = "grocery";
const name$2 = { "en": "Grocery and FMCG", "hi": "किराना और एफ़एमसीजी" };
const sections$2 = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "Fresh groceries, delivered", "hi": "ताज़ा किराना, घर तक" } } }, { "id": "offer", "type": "offer_banner", "settings": {} }, { "id": "categories", "type": "category_grid", "settings": {} }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Everyday essentials", "hi": "रोज़मर्रा की ज़रूरतें" } } }, { "id": "new", "type": "product_rail", "settings": { "source": "newest", "limit": 8, "heading": { "en": "New on the shelf", "hi": "शेल्फ़ पर नया" } } }, { "id": "trust", "type": "trust_strip", "settings": {} }, { "id": "faq", "type": "faq", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks$2 = ["description", "net_quantity", "unit_price", "best_before", "ingredients", "specifications"];
const plp_filters$2 = ["categories", "price", "tags", "options"];
const badges$2 = ["sale", "free_delivery", "new", "best_seller", "low_stock", "made_in_india"];
const attributes$2 = [{ "key": "net_quantity", "type": "number", "unit": "g|kg|ml|l|pc", "block": "net_quantity", "mandatory_declaration": true }, { "key": "best_before", "type": "date", "unit": null, "block": "best_before", "mandatory_declaration": true }, { "key": "manufactured_on", "type": "date", "unit": null, "block": "best_before", "mandatory_declaration": false }, { "key": "ingredients", "type": "text", "unit": null, "block": "ingredients", "mandatory_declaration": false }, { "key": "generic_name", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "fssai_license", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": false }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_4 = {
  key: key$2,
  name: name$2,
  sections: sections$2,
  pdp_blocks: pdp_blocks$2,
  plp_filters: plp_filters$2,
  badges: badges$2,
  attributes: attributes$2
};
const key$1 = "home";
const name$1 = { "en": "Home and furniture", "hi": "घर और फ़र्नीचर" };
const sections$1 = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "Make every room yours", "hi": "हर कमरे को बनाएँ अपना" } } }, { "id": "collections", "type": "collection_grid", "settings": {} }, { "id": "categories", "type": "category_grid", "settings": {} }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Customer favourites", "hi": "ग्राहकों की पसंद" } } }, { "id": "reviews", "type": "review_highlights", "settings": {} }, { "id": "new", "type": "product_rail", "settings": { "source": "newest", "limit": 8, "heading": { "en": "New for your home", "hi": "आपके घर के लिए नया" } } }, { "id": "story", "type": "brand_story", "settings": {} }, { "id": "trust", "type": "trust_strip", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks$1 = ["description", "dimensions", "materials", "assembly", "specifications"];
const plp_filters$1 = ["categories", "collections", "price", "options", "tags"];
const badges$1 = ["sale", "new", "best_seller", "free_delivery", "low_stock", "made_in_india"];
const attributes$1 = [{ "key": "dimensions", "type": "text", "unit": "cm", "block": "dimensions", "mandatory_declaration": false }, { "key": "weight", "type": "number", "unit": "kg", "block": "dimensions", "mandatory_declaration": false }, { "key": "material", "type": "text", "unit": null, "block": "materials", "mandatory_declaration": false }, { "key": "finish", "type": "text", "unit": null, "block": "materials", "mandatory_declaration": false }, { "key": "assembly_required", "type": "boolean", "unit": null, "block": "assembly", "mandatory_declaration": false }, { "key": "assembly_instructions", "type": "text", "unit": null, "block": "assembly", "mandatory_declaration": false }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_5 = {
  key: key$1,
  name: name$1,
  sections: sections$1,
  pdp_blocks: pdp_blocks$1,
  plp_filters: plp_filters$1,
  badges: badges$1,
  attributes: attributes$1
};
const key = "jewellery";
const name = { "en": "Jewellery and handmade", "hi": "आभूषण और हस्तनिर्मित" };
const sections = [{ "id": "hero", "type": "hero_banner", "settings": { "title": { "en": "Made with care, worn with pride", "hi": "सँवारकर बनाया, गर्व से पहना" } } }, { "id": "collections", "type": "collection_grid", "settings": {} }, { "id": "new", "type": "product_rail", "settings": { "source": "newest", "limit": 8, "heading": { "en": "New designs", "hi": "नए डिज़ाइन" } } }, { "id": "best", "type": "product_rail", "settings": { "source": "best_sellers", "limit": 8, "heading": { "en": "Most loved", "hi": "सबसे पसंदीदा" } } }, { "id": "story", "type": "brand_story", "settings": {} }, { "id": "reviews", "type": "review_highlights", "settings": {} }, { "id": "trust", "type": "trust_strip", "settings": {} }, { "id": "faq", "type": "faq", "settings": {} }, { "id": "newsletter", "type": "newsletter", "settings": {} }];
const pdp_blocks = ["description", "metal", "purity", "weight", "certification", "specifications"];
const plp_filters = ["categories", "collections", "price", "options", "tags"];
const badges = ["new", "best_seller", "made_in_india", "sale", "low_stock", "free_delivery"];
const attributes = [{ "key": "metal", "type": "text", "unit": null, "block": "metal", "mandatory_declaration": true }, { "key": "purity", "type": "text", "unit": null, "block": "purity", "mandatory_declaration": true }, { "key": "weight", "type": "number", "unit": "g", "block": "weight", "mandatory_declaration": true }, { "key": "certification", "type": "text", "unit": null, "block": "certification", "mandatory_declaration": false }, { "key": "hallmark", "type": "text", "unit": null, "block": "certification", "mandatory_declaration": false }, { "key": "stone", "type": "text", "unit": null, "block": "specifications", "mandatory_declaration": false }, { "key": "country_of_origin", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "manufacturer", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }, { "key": "consumer_care", "type": "text", "unit": null, "block": "declarations", "mandatory_declaration": true }];
const __vite_glob_0_6 = {
  key,
  name,
  sections,
  pdp_blocks,
  plp_filters,
  badges,
  attributes
};
const isObj$6 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const str$3 = (x) => typeof x === "string" ? x : "";
const SECTION_TYPES = ["hero_banner", "category_grid", "collection_grid", "product_rail", "review_highlights", "trust_strip", "brand_story", "offer_banner", "faq", "newsletter"];
const isSectionType = (x) => typeof x === "string" && SECTION_TYPES.includes(x);
const DEFAULT_SECTIONS = [{
  id: "hero",
  type: "hero_banner",
  settings: {}
}, {
  id: "categories",
  type: "category_grid",
  settings: {}
}, {
  id: "best",
  type: "product_rail",
  settings: {
    source: "best_sellers",
    title: "bestSellers"
  }
}, {
  id: "offer",
  type: "offer_banner",
  settings: {}
}, {
  id: "reviews",
  type: "review_highlights",
  settings: {}
}, {
  id: "trust",
  type: "trust_strip",
  settings: {}
}, {
  id: "new",
  type: "product_rail",
  settings: {
    source: "newest",
    title: "newArrivals"
  }
}, {
  id: "story",
  type: "brand_story",
  settings: {}
}, {
  id: "faq",
  type: "faq",
  settings: {}
}, {
  id: "newsletter",
  type: "newsletter",
  settings: {}
}];
function normalizeSections(raw) {
  const list = isObj$6(raw) && Array.isArray(raw.sections) ? raw.sections : raw;
  if (!Array.isArray(list)) return DEFAULT_SECTIONS;
  const out = [];
  list.forEach((s2, i2) => {
    if (!isObj$6(s2) || !isSectionType(s2.type) || s2.hidden === true || s2.enabled === false) return;
    out.push({
      id: str$3(s2.id) || `${s2.type}-${i2}`,
      type: s2.type,
      settings: isObj$6(s2.settings) ? s2.settings : {}
    });
  });
  return out.length > 0 ? out : DEFAULT_SECTIONS;
}
const PRESET_KEYS = ["fashion", "electronics", "grocery", "home", "beauty", "b2b", "jewellery"];
const isPresetKey = (x) => typeof x === "string" && PRESET_KEYS.includes(x);
const files = /* @__PURE__ */ Object.assign({
  "../../presets/b2b.json": __vite_glob_0_0,
  "../../presets/beauty.json": __vite_glob_0_1,
  "../../presets/electronics.json": __vite_glob_0_2,
  "../../presets/fashion.json": __vite_glob_0_3,
  "../../presets/grocery.json": __vite_glob_0_4,
  "../../presets/home.json": __vite_glob_0_5,
  "../../presets/jewellery.json": __vite_glob_0_6
});
const PRESETS = Object.fromEntries(Object.values(files).map((p2) => [p2.key, p2]));
const presetByKey = (key2) => isPresetKey(key2) ? PRESETS[key2] ?? null : null;
const DEFAULT_BADGE_PRIORITY = ["sale", "new", "best_seller", "low_stock", "free_delivery", "made_in_india"];
const FILTER_GROUPS = ["categories", "collections", "types", "tags", "options", "price"];
const UNIT_PRICE_BLOCK = "unit_price";
const keyList = (v2) => Array.isArray(v2) ? v2.filter((k2) => typeof k2 === "string" && k2.length > 0) : null;
function resolveLayout(settings) {
  const preset = presetByKey(settings["storefront.layout.preset"]);
  const own = (k2) => {
    const l2 = keyList(settings[`storefront.layout.${k2}`]);
    return l2 && l2.length > 0 ? l2 : null;
  };
  const rawSections = settings["storefront.layout.sections"];
  const hasSections = Array.isArray(rawSections) && rawSections.length > 0;
  const sections2 = hasSections ? normalizeSections(rawSections) : preset ? normalizeSections(preset.sections) : DEFAULT_SECTIONS;
  const pdpBlocks = own("pdp_blocks") ?? preset?.pdp_blocks ?? [];
  const plpFilters = own("plp_filters") ?? preset?.plp_filters ?? [];
  const badgePriority = (own("badges") ?? preset?.badges ?? [...DEFAULT_BADGE_PRIORITY]).filter(isBadgeKey);
  return {
    preset: preset?.key ?? null,
    sections: sections2,
    pdpBlocks,
    plpFilters,
    badgePriority,
    requireUnitPrice: pdpBlocks.includes(UNIT_PRICE_BLOCK)
  };
}
function hiddenFilterGroups(plpFilters) {
  if (plpFilters.length === 0) return [];
  return FILTER_GROUPS.filter((g2) => !plpFilters.includes(g2));
}
const pdpBlockShows = (blocks, key2, hasData) => hasData && (blocks.length === 0 || blocks.includes(key2));
const IMAGE_SLOTS = {
  card: "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  hero: "100vw",
  gallery: "(min-width: 1024px) 50vw, 100vw",
  thumb: "80px",
  rail: "(min-width: 1024px) 20vw, 45vw"
};
function variantUrl(mediaBase, id, hash, width, ext) {
  return `${mediaBase.replace(/\/+$/, "")}/${id}/${hash}/${width}.${ext}`;
}
function usableWidths(img) {
  const all = [...new Set(img.variants ?? [])].filter((w2) => w2 > 0).sort((a2, b) => a2 - b);
  const within = all.filter((w2) => w2 <= img.width);
  return within.length ? within : all.slice(0, 1);
}
function saveDataWidth(widths, cssWidth) {
  return widths.find((w2) => w2 >= cssWidth) ?? widths[widths.length - 1];
}
const SD_CSS_WIDTH = {
  card: 180,
  hero: 360,
  gallery: 360,
  thumb: 80,
  rail: 162
};
function pictureData(img, opts) {
  const widths = usableWidths(img);
  const hasVariants = widths.length > 0;
  const ratio = img.width > 0 && img.height > 0 ? img.height / img.width : 1;
  const list = (ext) => widths.map((w2) => `${variantUrl(opts.mediaBase, img.id, img.hash, w2, ext)} ${w2}w`).join(", ");
  const sd = hasVariants ? saveDataWidth(widths, SD_CSS_WIDTH[opts.slot]) : 0;
  const largest = widths[widths.length - 1];
  return {
    webpSrcset: list("webp"),
    jpegSrcset: list("jpg"),
    sdWebp: hasVariants ? variantUrl(opts.mediaBase, img.id, img.hash, sd, "webp") : "",
    sdJpeg: hasVariants ? variantUrl(opts.mediaBase, img.id, img.hash, sd, "jpg") : "",
    src: hasVariants ? variantUrl(opts.mediaBase, img.id, img.hash, largest, "jpg") : img.originalUrl ?? "",
    sizes: IMAGE_SLOTS[opts.slot],
    width: img.width,
    height: Math.round(img.width * ratio) || img.height,
    alt: img.alt,
    loading: opts.priority ? void 0 : "lazy",
    decoding: opts.priority ? void 0 : "async",
    fetchpriority: opts.priority ? "high" : void 0,
    hasVariants
  };
}
const SAVE_DATA_SCRIPT = `(function(){var c=navigator.connection;if(!c||!c.saveData)return;function f(e){if(e.nodeType!==1)return;var l=e.matches&&e.matches('img[loading=lazy],picture source')?[e]:[];if(e.querySelectorAll)l=l.concat([].slice.call(e.querySelectorAll('img[loading=lazy],picture source')));l.forEach(function(n){var p=n.tagName==='SOURCE'?n.parentNode.querySelector('img'):n;if(!p||p.getAttribute('loading')!=='lazy')return;var d=n.getAttribute('data-sd');if(d){n.setAttribute('srcset',d);n.removeAttribute('sizes');if(n===p)n.removeAttribute('data-sd')}})}new MutationObserver(function(m){m.forEach(function(r){[].forEach.call(r.addedNodes,f)})}).observe(document,{childList:true,subtree:true})})();`;
const EXPERIMENTS_BLOCK_ID = "pm-experiments";
function normalizeExperiments(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter((e2) => !!e2 && typeof e2.id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(e2.id) && typeof e2.share === "number" && e2.share >= 0 && e2.share <= 1).map((e2) => {
    const out = {
      id: e2.id,
      share: e2.share
    };
    if (typeof e2.component === "string" && /^[a-z][a-z0-9_]{0,62}$/.test(e2.component)) out.component = e2.component;
    return out;
  });
}
function experimentsJson(list) {
  return JSON.stringify(normalizeExperiments(list)).replace(/</g, "\\u003c");
}
const EXPERIMENT_SCRIPT = `(function(){try{var d=document.documentElement;var b=document.getElementById('${EXPERIMENTS_BLOCK_ID}');if(!b)return;var l=JSON.parse(b.textContent||'[]');if(!l.length)return;var c=JSON.parse(localStorage.getItem('sf.consent')||'null');var p=c&&(c.purposes||c);if(!p||p.analytics!==true)return;var s=localStorage.getItem('sf.sid');if(!s)return;try{var o=JSON.parse(s);if(o&&typeof o==='object')s=o.id}catch(e){}if(typeof s!=='string'||!s)return;var a=[],x=[];for(var i=0;i<l.length;i++){var h=2166136261,k=s+':'+l[i].id;for(var j=0;j<k.length;j++){h^=k.charCodeAt(j);h=Math.imul(h,16777619)>>>0}var v=h/4294967296<l[i].share?'t':'c';a.push(l[i].id+'='+v);if(v==='t'&&l[i].component)x.push(l[i].component)}d.setAttribute('data-pm-exp',a.join(' '));if(x.length)d.setAttribute('data-pm-xt',x.join(' '))}catch(e){}})();`;
const HEAD_SCRIPT = `${EXPERIMENT_SCRIPT}${SAVE_DATA_SCRIPT}`;
const HI_PREFIX = "/hi";
const HREFLANG = {
  en: "en-IN",
  hi: "hi-IN"
};
const isSitePath = (href) => href.startsWith("/") && !href.startsWith("//");
function splitSuffix(href) {
  const i2 = href.search(/[?#]/);
  return i2 < 0 ? {
    path: href,
    suffix: ""
  } : {
    path: href.slice(0, i2),
    suffix: href.slice(i2)
  };
}
function splitLocale(pathname) {
  if (pathname === HI_PREFIX || pathname === `${HI_PREFIX}/`) return {
    locale: "hi",
    path: "/"
  };
  if (pathname.startsWith(`${HI_PREFIX}/`)) return {
    locale: "hi",
    path: pathname.slice(HI_PREFIX.length)
  };
  return {
    locale: "en",
    path: pathname || "/"
  };
}
function localizedHref(href, locale) {
  if (!isSitePath(href)) return href;
  const {
    path,
    suffix
  } = splitSuffix(href);
  const base = splitLocale(path).path;
  return `${base === "/" ? HI_PREFIX : HI_PREFIX + base}${suffix}`;
}
const origin = (site) => site ? String(site).replace(/\/+$/, "") : "";
function cleanPath(pathname) {
  const {
    path
  } = splitSuffix(pathname);
  return path.length > 1 ? path.replace(/\/+$/, "") || "/" : path || "/";
}
function canonicalUrl(pathname, site) {
  const p2 = cleanPath(pathname);
  return `${origin(site)}${p2}` || "/";
}
function alternateLinks(pathname, site) {
  const {
    path
  } = splitLocale(cleanPath(pathname));
  const o2 = origin(site);
  const en2 = `${o2}${path}`;
  const hi2 = `${o2}${localizedHref(path)}`;
  return [{
    hreflang: HREFLANG.en,
    href: en2
  }, {
    hreflang: HREFLANG.hi,
    href: hi2
  }, {
    hreflang: "x-default",
    href: en2
  }];
}
const PAGE_SIZE = 24;
const SORTS = ["featured", "relevance", "newest", "price_asc", "price_desc", "title_asc"];
const emptyState = (q2 = "") => ({
  sort: defaultSort(q2),
  q: q2,
  categories: [],
  collections: [],
  tags: [],
  types: [],
  options: {},
  priceMin: null,
  priceMax: null,
  shown: PAGE_SIZE
});
const defaultSort = (q2) => q2 ? "relevance" : "featured";
const DESCRIPTION_MAX = 155;
function stripText(s2) {
  return s2.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
}
function metaDescription(text2, fallback = "") {
  const plain = stripText(text2) || stripText(fallback);
  const chars = [...plain];
  if (chars.length <= DESCRIPTION_MAX) return plain;
  const cut = chars.slice(0, DESCRIPTION_MAX - 1).join("");
  const space = cut.lastIndexOf(" ");
  return `${(space > DESCRIPTION_MAX / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}
const robotsContent = (noindex) => noindex ? "noindex, follow" : null;
const abs = (url, site) => /^https?:\/\//.test(url) ? url : `${site.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
function breadcrumbJsonLd(crumbs, pageUrl, site) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c2, i2) => ({
      "@type": "ListItem",
      position: i2 + 1,
      name: c2.label,
      item: c2.href ? abs(c2.href, site) : pageUrl
    }))
  };
}
function availabilityOf(v2, quantity2) {
  const q2 = typeof quantity2 === "number" ? quantity2 : null;
  if (q2 !== null && q2 <= 0) return v2.allowBackorder ? "https://schema.org/BackOrder" : "https://schema.org/OutOfStock";
  return "https://schema.org/InStock";
}
const priceText = (n) => String(Math.round(n * 100) / 100);
function productJsonLd(i2) {
  const {
    model,
    raw
  } = i2;
  const prices = raw && typeof raw.variant_prices === "object" && raw.variant_prices ? raw.variant_prices : {};
  const stock = raw && typeof raw.variant_stock === "object" && raw.variant_stock ? raw.variant_stock : {};
  const priced = model.variants.filter((v2) => v2.price !== null);
  const endOf = (v2) => {
    const e2 = prices[v2.id]?.ends_at ?? prices[v2.id]?.sale_ends_at;
    return typeof e2 === "string" && Number.isFinite(Date.parse(e2)) ? new Date(e2).toISOString() : void 0;
  };
  const offerOf = (v2) => ({
    "@type": "Offer",
    price: priceText(v2.price),
    priceCurrency: model.currency,
    availability: availabilityOf(v2, stock[v2.id]),
    url: i2.url,
    ...endOf(v2) ? {
      priceValidUntil: endOf(v2)
    } : {}
  });
  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: model.title,
    image: model.images.map((m2) => m2.url),
    brand: {
      "@type": "Brand",
      name: i2.brand
    }
  };
  const description2 = metaDescription(model.description || model.subtitle);
  if (description2) ld.description = description2;
  const sku2 = (priced[0] ?? model.variants[0])?.sku;
  if (sku2) ld.sku = sku2;
  if (priced.length === 1) ld.offers = offerOf(priced[0]);
  else if (priced.length > 1) {
    const amounts = priced.map((v2) => v2.price);
    const ends = priced.map(endOf).filter((e2) => !!e2).sort();
    ld.offers = {
      "@type": "AggregateOffer",
      lowPrice: priceText(Math.min(...amounts)),
      highPrice: priceText(Math.max(...amounts)),
      priceCurrency: model.currency,
      offerCount: priced.length,
      availability: priced.some((v2) => availabilityOf(v2, stock[v2.id]) === "https://schema.org/InStock") ? "https://schema.org/InStock" : availabilityOf(priced[0], stock[priced[0].id]),
      url: i2.url,
      ...ends.length ? {
        priceValidUntil: ends[0]
      } : {}
    };
  }
  if (i2.reviews.length > 0) {
    const avg = i2.reviews.reduce((s2, r2) => s2 + r2.rating, 0) / i2.reviews.length;
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(avg * 10) / 10,
      reviewCount: i2.reviews.length
    };
  }
  return ld;
}
const jsonLdText = (data) => JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
function socialTags(s2) {
  const tags = [{
    attr: "property",
    key: "og:type",
    content: s2.type ?? "website"
  }, {
    attr: "property",
    key: "og:title",
    content: s2.title
  }, {
    attr: "property",
    key: "og:url",
    content: s2.url
  }, {
    attr: "property",
    key: "og:locale",
    content: s2.locale === "hi" ? "hi_IN" : "en_IN"
  }, {
    attr: "name",
    key: "twitter:card",
    content: s2.image ? "summary_large_image" : "summary"
  }, {
    attr: "name",
    key: "twitter:title",
    content: s2.title
  }];
  if (s2.siteName) tags.push({
    attr: "property",
    key: "og:site_name",
    content: s2.siteName
  });
  if (s2.description) tags.push({
    attr: "property",
    key: "og:description",
    content: s2.description
  }, {
    attr: "name",
    key: "twitter:description",
    content: s2.description
  });
  if (s2.image) tags.push({
    attr: "property",
    key: "og:image",
    content: s2.image
  }, {
    attr: "name",
    key: "twitter:image",
    content: s2.image
  });
  return tags;
}
var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1, _b;
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title, locale = "en", description: description2, path = Astro2.url.pathname.replace(/\/index(\.html)?$/, "").replace(/\.html$/, "") || "/", alternates = true, bottomBar = false, shell = loadShellData(), noindex = false, image, jsonLd = [], ogType = "website" } = Astro2.props;
  const experimentFiles = /* @__PURE__ */ Object.assign({ "../data/experiments.json": __vite_glob_0_0$3 });
  const experiments = normalizeExperiments(Object.values(experimentFiles)[0]);
  const canonical = canonicalUrl(path, Astro2.site);
  const links = alternates ? alternateLinks(path, Astro2.site) : [];
  const metaDesc = metaDescription(description2 ?? "", title);
  const robots = robotsContent(noindex);
  const cardImage = image ?? shell.brand.logoUrl;
  const absolute = (u2) => u2 && Astro2.site && !/^https?:\/\//.test(u2) ? new URL(u2, Astro2.site).href : u2;
  const cards = socialTags({ title, description: metaDesc, image: absolute(cardImage), url: canonical, type: ogType, locale, siteName: shell.brand.name });
  const presetKey = resolveLayout(loadPdpData().settings).preset;
  return renderTemplate(_b || (_b = __template$1(["<html", "", '> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script type="application/json"', ">", "<\/script><script>", "<\/script><title>", '</title><meta name="description"', ">", "", "", '<link rel="canonical"', ">", '<link rel="stylesheet" href="/brand.css">', "</head> <body", "", '> <a class="pm-skip-link" href="#main">', "</a> ", ' <main id="main" tabindex="-1"', "> ", " </main> ", " ", " ", " ", " ", ' <div id="pm-live" class="pm-visually-hidden" role="status" aria-live="polite" aria-atomic="true"></div> ', " </body> </html>"])), addAttribute(locale, "lang"), addAttribute(dir(locale), "dir"), addAttribute(EXPERIMENTS_BLOCK_ID, "id"), unescapeHTML(experimentsJson(experiments)), unescapeHTML(HEAD_SCRIPT), title, addAttribute(metaDesc, "content"), robots && renderTemplate`<meta name="robots"${addAttribute(robots, "content")}>`, cards.map((c2) => c2.attr === "property" ? renderTemplate`<meta${addAttribute(c2.key, "property")}${addAttribute(c2.content, "content")}>` : renderTemplate`<meta${addAttribute(c2.key, "name")}${addAttribute(c2.content, "content")}>`), jsonLd.map((d2) => renderTemplate(_a$1 || (_a$1 = __template$1(['<script type="application/ld+json">', "<\/script>"])), unescapeHTML(jsonLdText(d2)))), addAttribute(canonical, "href"), links.map((l2) => renderTemplate`<link rel="alternate"${addAttribute(l2.hreflang, "hreflang")}${addAttribute(l2.href, "href")}>`), renderHead(), addAttribute(bottomBar ? "" : void 0, "data-bottom-bar"), addAttribute(presetKey ?? void 0, "data-preset"), t(locale, "a11y.skipToContent"), renderComponent($$result, "Header", $$Header, { "locale": locale, "pathname": path, "shell": shell }), addAttribute(t(locale, "landmarks.main"), "aria-label"), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, { "locale": locale, "pathname": path, "shell": shell }), renderComponent($$result, "BottomNav", $$BottomNav, { "locale": locale, "pathname": path }), locale === "en" && renderTemplate`${renderComponent($$result, "HindiPrompt", $$HindiPrompt, { "pathname": path })}`, renderComponent($$result, "ConsentBanner", $$ConsentBanner, { "locale": locale, "pathname": path }), renderComponent($$result, "QuickView", $$QuickView, { "locale": locale }), renderScript($$result, "C:/Users/palha/plusmark/apps/storefront/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts"));
}, "C:/Users/palha/plusmark/apps/storefront/src/layouts/BaseLayout.astro", void 0);
const $$Container = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Container;
  const { as: Tag = "div", class: cls = "" } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Tag", Tag, { "class": `pm-container ${cls}`.trim() }, { "default": ($$result2) => renderTemplate`${renderSlot($$result2, $$slots["default"])}` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Container.astro", void 0);
const $$Picture = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Picture;
  const { image, slot, priority = false, class: className, mediaBase = "" } = Astro2.props;
  const p2 = pictureData(image, { mediaBase, slot, priority });
  return renderTemplate`${p2.hasVariants ? renderTemplate`${maybeRenderHead()}<picture${addAttribute(className, "class")}><source type="image/webp"${addAttribute(p2.webpSrcset, "srcset")}${addAttribute(p2.sizes, "sizes")}${addAttribute(p2.sdWebp, "data-sd")}><img${addAttribute(p2.src, "src")}${addAttribute(p2.jpegSrcset, "srcset")}${addAttribute(p2.sizes, "sizes")}${addAttribute(p2.width, "width")}${addAttribute(p2.height, "height")}${addAttribute(p2.alt, "alt")}${addAttribute(p2.loading, "loading")}${addAttribute(p2.decoding, "decoding")}${addAttribute(p2.fetchpriority, "fetchpriority")}${addAttribute(p2.sdJpeg, "data-sd")}></picture>` : renderTemplate`<img${addAttribute(className, "class")}${addAttribute(p2.src, "src")}${addAttribute(p2.width, "width")}${addAttribute(p2.height, "height")}${addAttribute(p2.alt, "alt")}${addAttribute(p2.loading, "loading")}${addAttribute(p2.decoding, "decoding")}${addAttribute(p2.fetchpriority, "fetchpriority")}>`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Picture.astro", void 0);
const $$Badge = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<span class="pm-badge">${renderSlot($$result, $$slots["default"])}</span>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Badge.astro", void 0);
const $$Price = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<span class="pm-price" translate="no">${renderSlot($$result, $$slots["default"])}</span>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Price.astro", void 0);
const DEFAULT_TIMEZONE = "Asia/Kolkata";
const MISSING = "—";
const INTL_LOCALE = {
  en: "en-IN",
  hi: "hi-IN"
};
const isNum$2 = (n) => typeof n === "number" && Number.isFinite(n);
function roundToPaisa(n) {
  const s2 = Math.sign(n);
  return s2 * Math.round(Math.abs(n) * 100 + 1e-9) / 100;
}
const nfCache = /* @__PURE__ */ new Map();
function nf(locale, opts) {
  const key2 = locale + JSON.stringify(opts);
  let f2 = nfCache.get(key2);
  if (!f2) {
    f2 = new Intl.NumberFormat(INTL_LOCALE[locale], {
      ...opts,
      numberingSystem: "latn"
    });
    nfCache.set(key2, f2);
  }
  return f2;
}
function formatNumber(n, locale = "en", maxFractionDigits = 0) {
  if (!isNum$2(n)) return MISSING;
  return nf(locale, {
    maximumFractionDigits: maxFractionDigits
  }).format(n);
}
function formatCount(n, locale = "en") {
  return isNum$2(n) ? formatNumber(Math.trunc(n), locale) : MISSING;
}
function formatMoney(amount, currency = "INR", locale = "en") {
  if (!isNum$2(amount)) return MISSING;
  const code = currency.toUpperCase();
  if (code === "INR") {
    const v2 = roundToPaisa(amount);
    const hasPaise = Math.abs(v2 - Math.round(v2)) > 1e-9;
    const d2 = hasPaise ? 2 : 0;
    return nf(locale, {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: d2,
      maximumFractionDigits: d2
    }).format(v2);
  }
  return nf(locale, {
    style: "currency",
    currency: code
  }).format(amount);
}
function formatPercent(pct, locale = "en") {
  if (!isNum$2(pct)) return MISSING;
  return nf(locale, {
    style: "percent",
    maximumFractionDigits: 0
  }).format(pct / 100);
}
function savingPercent(prior, price2) {
  if (!isNum$2(prior) || !isNum$2(price2) || prior <= 0 || price2 >= prior) return 0;
  return Math.floor((prior - price2) / prior * 100 + 1e-9);
}
function savingAmount(prior, price2) {
  if (!isNum$2(prior) || !isNum$2(price2) || price2 >= prior) return 0;
  return roundToPaisa(prior - price2);
}
const TO_BASE = {
  kg: ["kg", 1],
  g: ["kg", 1e-3],
  mg: ["kg", 1e-6],
  l: ["L", 1],
  ml: ["L", 1e-3],
  m: ["m", 1],
  cm: ["m", 0.01],
  mm: ["m", 1e-3],
  unit: ["unit", 1],
  piece: ["unit", 1],
  pc: ["unit", 1]
};
function unitPrice(price2, netQuantity, unit) {
  const conv = TO_BASE[unit.toLowerCase()];
  if (!conv || !isNum$2(price2) || !isNum$2(netQuantity) || netQuantity <= 0) return null;
  const qtyBase = netQuantity * conv[1];
  return {
    amount: roundToPaisa(price2 / qtyBase),
    per: conv[0]
  };
}
const PER_LABEL = {
  en: {
    kg: "kg",
    L: "L",
    m: "m",
    unit: "piece"
  },
  hi: {
    kg: "किग्रा",
    L: "लीटर",
    m: "मीटर",
    unit: "नग"
  }
};
function formatUnitPrice(price2, netQuantity, unit, currency = "INR", locale = "en") {
  if (!isNum$2(price2) || !isNum$2(netQuantity) || !unit) return MISSING;
  const u2 = unitPrice(price2, netQuantity, unit);
  if (!u2) return MISSING;
  return `${formatMoney(u2.amount, currency, locale)} / ${PER_LABEL[locale][u2.per]}`;
}
function tierSavings(singlePrice, tiers) {
  return [...tiers].sort((a2, b) => a2.minQuantity - b.minQuantity).map((t2) => ({
    ...t2,
    savingPerUnit: roundToPaisa(singlePrice - t2.unitPrice)
  }));
}
function formatTier(t2, currency = "INR", locale = "en") {
  return {
    quantity: `${formatCount(t2.minQuantity, locale)}+`,
    unitPrice: formatMoney(t2.unitPrice, currency, locale),
    saving: formatMoney(t2.savingPerUnit, currency, locale)
  };
}
const toDate = (d2) => {
  if (d2 === null || d2 === void 0) return null;
  const v2 = d2 instanceof Date ? d2 : new Date(d2);
  return Number.isNaN(v2.getTime()) ? null : v2;
};
const dfCache = /* @__PURE__ */ new Map();
function df(locale, tz, opts) {
  const key2 = locale + tz + JSON.stringify(opts);
  let f2 = dfCache.get(key2);
  if (!f2) {
    f2 = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      ...opts,
      timeZone: tz,
      numberingSystem: "latn"
    });
    dfCache.set(key2, f2);
  }
  return f2;
}
const yearOf = (d2, tz) => Number(df("en", tz, {
  year: "numeric"
}).format(d2));
function formatDate(date, locale = "en", opts = {}) {
  const d2 = toDate(date);
  if (!d2) return MISSING;
  const tz = opts.timeZone ?? DEFAULT_TIMEZONE;
  const now = toDate(opts.now) ?? /* @__PURE__ */ new Date();
  const withYear = yearOf(d2, tz) !== yearOf(now, tz);
  return df(locale, tz, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...withYear ? {
      year: "numeric"
    } : {}
  }).format(d2);
}
function formatDateRange(from2, to, locale = "en", opts = {}) {
  const a2 = toDate(from2);
  const b = toDate(to);
  if (!a2 || !b) return MISSING;
  const tz = opts.timeZone ?? DEFAULT_TIMEZONE;
  const first = formatDate(a2, locale, opts);
  const last = formatDate(b, locale, opts);
  if (first === last) return first;
  const ymd = (d2) => df("en", tz, {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  }).format(d2);
  if (ymd(a2) === ymd(b)) return first;
  const sameMonthYear = df("en", tz, {
    year: "numeric",
    month: "numeric"
  }).format(a2) === df("en", tz, {
    year: "numeric",
    month: "numeric"
  }).format(b);
  if (sameMonthYear) {
    const short = df(locale, tz, {
      weekday: "short",
      day: "numeric"
    }).format(a2);
    return `${short} – ${last}`;
  }
  return `${first} – ${last}`;
}
const DURATION_LABELS = {
  en: {
    d: "day",
    h: "hr",
    m: "min",
    lessThanMinute: "less than a minute"
  },
  hi: {
    d: "दिन",
    h: "घंटे",
    m: "मिनट",
    lessThanMinute: "एक मिनट से कम"
  }
};
function formatDuration(ms, locale = "en") {
  if (!isNum$2(ms)) return MISSING;
  const L = DURATION_LABELS[locale];
  const totalMin = Math.floor(Math.max(0, ms) / 6e4);
  if (totalMin < 1) return L.lessThanMinute;
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor(totalMin % 1440 / 60);
  const mins = totalMin % 60;
  const parts = [];
  if (days) parts.push(`${formatNumber(days, locale)} ${L.d}`);
  if (hours) parts.push(`${formatNumber(hours, locale)} ${L.h}`);
  if (mins && !days) parts.push(`${formatNumber(mins, locale)} ${L.m}`);
  return parts.slice(0, 2).join(" ");
}
const isObj$5 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const str$2 = (x) => typeof x === "string" ? x : "";
const num = (x) => typeof x === "number" && Number.isFinite(x) ? x : x !== null && x !== "" && Number.isFinite(Number(x)) ? Number(x) : null;
const MAX_SWATCHES = 5;
const COLOUR_OPTION$1 = /^(colou?rs?|shade|रंग)$/i;
const CSS_COLOUR$1 = /^(#[0-9a-f]{3,8}|[a-z]{3,20})$/i;
function swatchesOf(p2) {
  const opt = (Array.isArray(p2.options) ? p2.options : []).find((o2) => isObj$5(o2) && COLOUR_OPTION$1.test(str$2(o2.title).trim()));
  if (!isObj$5(opt)) return {
    swatches: [],
    extra: 0
  };
  const used = /* @__PURE__ */ new Set();
  for (const v2 of Array.isArray(p2.variants) ? p2.variants : []) {
    if (!isObj$5(v2)) continue;
    for (const o2 of Array.isArray(v2.options) ? v2.options : []) if (isObj$5(o2) && o2.option_id === opt.id) used.add(str$2(o2.value));
  }
  const values = (Array.isArray(opt.values) ? opt.values : []).map((x) => isObj$5(x) ? str$2(x.value) : "").filter((v2) => v2 && used.has(v2));
  const all = values.map((value) => ({
    value,
    css: CSS_COLOUR$1.test(value) ? value : null
  }));
  return {
    swatches: all.slice(0, MAX_SWATCHES),
    extra: Math.max(0, all.length - MAX_SWATCHES)
  };
}
function cardOf(product, ctx) {
  if (!isObj$5(product) || !str$2(product.id) || !str$2(product.handle)) return null;
  const variants = (Array.isArray(product.variants) ? product.variants : []).filter(isObj$5);
  const priced = variants.map((v2) => ({
    v: v2,
    price: isObj$5(v2.price) ? v2.price : null
  })).map(({
    v: v2,
    price: price22
  }) => ({
    v: v2,
    price: price22,
    amount: price22 ? num(price22.calculated_amount) : null
  })).filter((x) => x.price !== null && x.amount !== null);
  priced.sort((a2, b) => a2.amount - b.amount);
  const lowest = priced[0];
  const price2 = lowest?.amount ?? null;
  const original = lowest ? num(lowest.price.original_amount) : null;
  const prior = price2 !== null && original !== null && original > price2 ? original : null;
  const highest = priced[priced.length - 1];
  const images = (Array.isArray(product.images) ? product.images : []).filter(isObj$5);
  const first = images[0];
  const {
    swatches,
    extra
  } = swatchesOf(product);
  const attrs = {};
  for (const a2 of Array.isArray(product.attributes) ? product.attributes : []) if (isObj$5(a2) && str$2(a2.key)) attrs[str$2(a2.key)] = str$2(a2.value);
  const id = str$2(product.id);
  const badges2 = selectBadges({
    priceReduction: prior !== null,
    publishedAt: Date.parse(str$2(product.created_at)) || null,
    bestSeller: ctx.bestSellerIds?.has(id) ?? false,
    price: price2,
    freeDeliveryThreshold: ctx.freeDeliveryThreshold ?? null,
    countryOfOrigin: str$2(product.origin_country) || null
  }, ctx.badgePriority, ctx.now);
  return {
    id,
    handle: str$2(product.handle),
    title: str$2(product.title),
    imageId: first ? str$2(first.id) || null : null,
    imageUrl: (first ? str$2(first.url) : "") || str$2(product.thumbnail) || null,
    price: price2,
    from: !!lowest && !!highest && highest.amount > lowest.amount,
    prior,
    currency: lowest ? str$2(lowest.price.currency_code).toUpperCase() || "INR" : "INR",
    swatches,
    extraSwatches: extra,
    badges: badges2,
    singleVariantId: variants.length === 1 ? str$2(variants[0].id) || null : null,
    attributes: attrs
  };
}
const fill$3 = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m2, k2) => k2 in vars ? String(vars[k2]) : m2);
function priceParts(c2, locale, labels) {
  if (c2.price === null) return {
    current: labels.priceOnRequest,
    prior: null,
    saving: null,
    from: false
  };
  const saving = c2.prior !== null ? savingPercent(c2.prior, c2.price) : 0;
  return {
    current: formatMoney(c2.price, c2.currency, locale),
    prior: c2.prior !== null ? formatMoney(c2.prior, c2.currency, locale) : null,
    saving: saving > 0 ? fill$3(labels.save, {
      percent: `${saving}%`
    }) : null,
    from: c2.from
  };
}
const productPath = (handle, locale) => `${locale === "hi" ? "/hi" : ""}/product/${encodeURIComponent(handle)}`;
const $$SaveButton = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$SaveButton;
  const { productId, title, locale, class: cls = "" } = Astro2.props;
  const on = buildFeatures().wishlists;
  return renderTemplate`${on && renderTemplate`${maybeRenderHead()}<button type="button"${addAttribute(`pm-save ${cls}`.trim(), "class")}${addAttribute(productId, "data-pm-save")}${addAttribute(locale, "data-locale")}${addAttribute(rq(locale, "saveFor", { title }), "data-label-save")}${addAttribute(rq(locale, "savedFor", { title }), "data-label-saved")} aria-pressed="false"${addAttribute(rq(locale, "saveFor", { title }), "aria-label")}><span aria-hidden="true" data-pm-save-icon>♡</span><span data-pm-save-text>${rq(locale, "save")}</span></button>
  ${renderScript($$result, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/SaveButton.astro?astro&type=script&index=0&lang.ts")}`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/SaveButton.astro", void 0);
const $$ProductCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ProductCard;
  const { card, locale, labels, image, priority = false } = Astro2.props;
  const href = productPath(card.handle, locale);
  const pp = priceParts(card, locale, labels);
  return renderTemplate`${maybeRenderHead()}<li class="pm-card pm-product-card"${addAttribute(card.id, "data-live-product")}${addAttribute(card.id, "data-product-id")}> <div class="pm-card__media"> <a class="pm-card__link"${addAttribute(href, "href")} tabindex="-1" aria-hidden="true"></a> ${image ? renderTemplate`${renderComponent($$result, "Picture", $$Picture, { "image": { ...image, alt: "" }, "slot": "card", "priority": priority, "class": "pm-card__picture" })}` : card.imageUrl ? renderTemplate`<img class="pm-card__img"${addAttribute(card.imageUrl, "src")} width="480" height="480" alt=""${addAttribute(priority ? void 0 : "lazy", "loading")}${addAttribute(priority ? void 0 : "async", "decoding")}${addAttribute(priority ? "high" : void 0, "fetchpriority")}>` : renderTemplate`<span class="pm-card__img pm-card__img--empty" aria-hidden="true"></span>`} ${card.badges.length > 0 && renderTemplate`<ul class="pm-card__badges"> ${card.badges.map((b) => renderTemplate`<li>${renderComponent($$result, "Badge", $$Badge, {}, { "default": ($$result2) => renderTemplate`${labels.badges[b] ?? b}` })}</li>`)} </ul>`} ${renderComponent($$result, "SaveButton", $$SaveButton, { "productId": card.id, "title": card.title, "locale": locale })} <button type="button" class="pm-card__quick" data-pm-quick-view${addAttribute(card.title, "data-quick-title")}${addAttribute(href, "data-quick-url")}${addAttribute(card.imageUrl ?? "", "data-quick-image")}${addAttribute(pp.current, "data-quick-price")}${addAttribute(pp.prior ?? void 0, "data-quick-prior")}${addAttribute(card.badges.map((b) => labels.badges[b] ?? b).join("|"), "data-quick-badges")}${addAttribute(card.price !== null && card.singleVariantId ? card.id : void 0, "data-quick-product-id")}${addAttribute(card.price !== null && card.singleVariantId ? card.singleVariantId : void 0, "data-quick-variant-id")}${addAttribute(labels.addToCart, "data-quick-add")}${addAttribute(labels.viewFull, "data-quick-full")}${addAttribute(t(locale, "plp.quickViewFor", { title: card.title }), "aria-label")}>${labels.quickView}</button> </div> <div class="pm-card__body"> <h3 class="pm-card__title"><a${addAttribute(href, "href")}>${card.title}</a></h3> ${card.swatches.length > 0 && renderTemplate`<ul class="pm-swatches"${addAttribute(card.swatches.map((s2) => s2.value).join(", "), "aria-label")}> ${card.swatches.map((s2) => renderTemplate`<li class="pm-swatch"${addAttribute(s2.value, "title")}${addAttribute(s2.css ?? void 0, "data-colour")}>${s2.css ? "" : s2.value.slice(0, 2)}</li>`)} ${card.extraSwatches > 0 && renderTemplate`<li class="pm-swatch pm-swatch--more">${labels.moreColours.replace("{count}", String(card.extraSwatches))}</li>`} </ul>`} <div class="pm-card__foot"> <p class="pm-card__price"> ${pp.from && renderTemplate`<span class="pm-card__from">${labels.from} </span>`} ${renderComponent($$result, "Price", $$Price, {}, { "default": ($$result2) => renderTemplate` <span class="pm-card__now"> <span class="pm-visually-hidden">${labels.srCurrent.replace("{price}", pp.current)}</span> <span aria-hidden="true">${pp.current}</span> </span> ${pp.prior && renderTemplate`<s class="pm-card__prior"> <span class="pm-visually-hidden">${labels.srPrior.replace("{price}", pp.prior)}</span> <span aria-hidden="true">${pp.prior}</span> </s>`}` })} ${pp.saving && renderTemplate`<span class="pm-card__saving"> ${pp.saving}</span>`} </p> <p class="pm-unavailable-note" data-unavailable-note${addAttribute(card.id, "data-product-id")} hidden>${labels.unavailable}</p> ${card.singleVariantId && card.price !== null ? renderTemplate`<button type="button" class="pm-button pm-button--secondary pm-card__add" data-add-to-cart${addAttribute(card.id, "data-product-id")}${addAttribute(card.singleVariantId, "data-variant-id")}>${labels.addToCart}</button>` : renderTemplate`<a class="pm-button pm-button--secondary pm-card__add"${addAttribute(href, "href")}>${labels.chooseOptions}</a>`} </div> </div> </li>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/ProductCard.astro", void 0);
const ALLOWED = /* @__PURE__ */ new Set(["p", "br", "ul", "ol", "li", "strong", "b", "em", "i", "a"]);
const VOID = /* @__PURE__ */ new Set(["br"]);
const DROP_CONTENT = /* @__PURE__ */ new Set(["script", "style", "iframe", "frame", "frameset", "object", "embed", "noscript", "template", "textarea", "select", "svg", "math", "title", "head", "applet", "noembed", "xmp"]);
const SAFE_SCHEMES = /* @__PURE__ */ new Set(["http", "https", "mailto", "tel"]);
const NAMED = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " "
};
function decodeEntities(s2) {
  return s2.replace(/&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([a-zA-Z]+));?/g, (m2, dec, hex, name2) => {
    if (name2) return Object.hasOwn(NAMED, name2.toLowerCase()) && (m2.endsWith(";") || name2 === "amp" || name2 === "lt" || name2 === "gt") ? NAMED[name2.toLowerCase()] : m2;
    const cp = dec ? parseInt(dec, 10) : parseInt(hex, 16);
    if (!Number.isFinite(cp) || cp === 0 || cp > 1114111 || cp >= 55296 && cp <= 57343) return "�";
    return String.fromCodePoint(cp);
  });
}
function escapeText(s2) {
  return s2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(s2) {
  return escapeText(s2).replace(/"/g, "&quot;");
}
function safeHref(raw) {
  const probe = decodeEntities(raw).replace(/[\u0000-\u001f\u007f-\u009f]/g, "").replace(/\s/g, "");
  if (probe === "") return null;
  const scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(probe);
  if (scheme) return SAFE_SCHEMES.has(scheme[1].toLowerCase()) ? probe : null;
  if (probe.startsWith("//") || probe.startsWith("\\")) return null;
  if (/^[^/?#]*:/.test(probe)) return null;
  return probe;
}
const TAG_RE = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/;
const ATTR_RE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
function readHref(attrs) {
  ATTR_RE.lastIndex = 0;
  let m2;
  while ((m2 = ATTR_RE.exec(attrs)) !== null) {
    if (m2[1].toLowerCase() === "href") return m2[2] ?? m2[3] ?? m2[4] ?? "";
  }
  return null;
}
function tokenize(html) {
  const out = [];
  let i2 = 0;
  let text2 = "";
  const flush = () => {
    if (text2) out.push({
      kind: "text",
      text: text2
    });
    text2 = "";
  };
  while (i2 < html.length) {
    const lt = html.indexOf("<", i2);
    if (lt === -1) {
      text2 += html.slice(i2);
      break;
    }
    text2 += html.slice(i2, lt);
    const rest = html.slice(lt);
    if (rest.startsWith("<!--")) {
      const end = rest.indexOf("-->", 4);
      i2 = end === -1 ? html.length : lt + end + 3;
      continue;
    }
    if (rest.startsWith("<!") || rest.startsWith("<?")) {
      const end = rest.indexOf(">");
      i2 = end === -1 ? html.length : lt + end + 1;
      continue;
    }
    const m2 = TAG_RE.exec(rest);
    if (!m2) {
      text2 += "<";
      i2 = lt + 1;
      continue;
    }
    flush();
    out.push({
      kind: "tag",
      close: m2[1] === "/",
      name: m2[2].toLowerCase(),
      attrs: m2[3]
    });
    i2 = lt + m2[0].length;
  }
  flush();
  return out;
}
function sanitizeHtml(input) {
  if (!input) return "";
  const tokens = tokenize(String(input));
  const stack = [];
  let out = "";
  let skip = null;
  for (const t2 of tokens) {
    if (skip) {
      if (t2.kind === "tag" && t2.close && t2.name === skip) skip = null;
      continue;
    }
    if (t2.kind === "text") {
      out += escapeText(decodeEntities(t2.text));
      continue;
    }
    if (DROP_CONTENT.has(t2.name)) {
      if (!t2.close) skip = t2.name;
      continue;
    }
    if (!ALLOWED.has(t2.name)) continue;
    if (t2.close) {
      if (VOID.has(t2.name)) continue;
      const idx = stack.lastIndexOf(t2.name);
      if (idx === -1) continue;
      while (stack.length > idx) out += `</${stack.pop()}>`;
      continue;
    }
    if (t2.name === "a") {
      const raw = readHref(t2.attrs);
      const href = raw === null ? null : safeHref(raw);
      if (href === null) continue;
      out += `<a href="${escapeAttr(href)}" rel="nofollow noopener">`;
      stack.push("a");
      continue;
    }
    if (VOID.has(t2.name)) {
      out += `<${t2.name}>`;
      continue;
    }
    out += `<${t2.name}>`;
    stack.push(t2.name);
  }
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}
function toPlainText(input) {
  if (!input) return "";
  let out = "";
  let skip = null;
  for (const t2 of tokenize(String(input))) {
    if (skip) {
      if (t2.kind === "tag" && t2.close && t2.name === skip) skip = null;
      continue;
    }
    if (t2.kind === "text") out += decodeEntities(t2.text);
    else if (DROP_CONTENT.has(t2.name)) {
      if (!t2.close) skip = t2.name;
    }
  }
  return out;
}
const POLICY_KEY = {
  returns: "returns",
  refunds: "refunds",
  exchanges: "exchanges",
  cancellations: "cancellations",
  shipping: "shipping",
  payments: "payments",
  warranties: "warranties",
  terms: "terms"
};
const isObj$4 = (v2) => typeof v2 === "object" && v2 !== null && !Array.isArray(v2);
const str$1 = (v2) => typeof v2 === "string" ? v2 : "";
function pickLocalized(v2, locale) {
  if (typeof v2 === "string") return {
    html: sanitizeHtml(v2),
    fallback: locale !== "en"
  };
  if (!isObj$4(v2)) return {
    html: "",
    fallback: false
  };
  const own = sanitizeHtml(str$1(v2[locale]));
  if (own) return {
    html: own,
    fallback: false
  };
  if (locale === "en") return {
    html: "",
    fallback: false
  };
  const en2 = sanitizeHtml(str$1(v2.en));
  return {
    html: en2,
    fallback: Boolean(en2)
  };
}
function policyContent(settings, slug, locale) {
  const raw = slug === "privacy" ? settings["storefront.privacy_notice"] : isObj$4(settings["storefront.policies"]) ? settings["storefront.policies"][POLICY_KEY[slug]] : void 0;
  return {
    slug,
    ...pickLocalized(raw, locale)
  };
}
function formatCertificateDate(date, locale) {
  const m2 = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m2) return "";
  const d2 = new Date(Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3])));
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(d2);
}
function policySummary(html) {
  const text2 = toPlainText(html).replace(/\s+/g, " ").trim();
  if (!text2) return "";
  const end = text2.search(/[.!?।](\s|$)/);
  const first = end >= 0 ? text2.slice(0, end + 1) : text2;
  return first.length > 200 ? `${first.slice(0, 197).trimEnd()}...` : first;
}
function pdpSummary(settings, locale) {
  const rows = [["returns", "returns"], ["warranty", "warranties"], ["delivery", "shipping"]];
  return rows.map(([kind, policy]) => ({
    kind,
    policy,
    text: policySummary(policyContent(settings, policy, locale).html)
  }));
}
const ATTRIBUTE_KINDS = ["country_of_origin", "manufacturer", "importer", "generic_name", "consumer_care"];
function attrText(v2) {
  if (typeof v2 === "string") return toPlainText(v2).trim();
  if (isObj$4(v2)) return [v2.name, v2.address].map((x) => toPlainText(str$1(x)).trim()).filter(Boolean).join(", ");
  if (typeof v2 === "number") return String(v2);
  return "";
}
const UNIT_LABEL = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  mm: "mm",
  cm: "cm",
  m: "m",
  unit: "units"
};
function monthYear(date, locale) {
  const m2 = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!m2) return "";
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(Number(m2[1]), Number(m2[2]) - 1, 1)));
}
function mandatoryDeclarations(product, variantId, locale = "en") {
  const attrs = new Map((product.attributes ?? []).map((a2) => [a2.key, a2.value]));
  const out = [];
  for (const kind of ATTRIBUTE_KINDS) {
    const value = attrText(attrs.get(kind));
    if (value) out.push({
      kind,
      value
    });
  }
  const d2 = variantId ? product.declarations?.[variantId] : void 0;
  if (d2) {
    if (typeof d2.net_quantity === "number" && d2.net_quantity > 0 && d2.net_quantity_unit) {
      out.push({
        kind: "net_quantity",
        value: `${new Intl.NumberFormat(locale === "hi" ? "hi-IN" : "en-IN").format(d2.net_quantity)} ${UNIT_LABEL[d2.net_quantity_unit] ?? d2.net_quantity_unit}`
      });
    }
    if (d2.manufacture_month) {
      const v2 = monthYear(d2.manufacture_month, locale);
      if (v2) out.push({
        kind: "manufacture_month",
        value: v2
      });
    }
    if (d2.best_before_date) {
      const v2 = formatCertificateDate(d2.best_before_date.slice(0, 10), locale);
      if (v2) out.push({
        kind: "best_before_date",
        value: v2
      });
    }
  }
  return out;
}
const $$PdpSummary = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PdpSummary;
  const { locale, settings } = Astro2.props;
  const items = pdpSummary(settings, locale);
  return renderTemplate`${maybeRenderHead()}<section class="pm-pdp-legal" aria-labelledby="pm-pdp-summary"> <h2 id="pm-pdp-summary" class="pm-pdp-legal__heading">${t(locale, "legal.pdp.summaryHeading")}</h2> <ul class="pm-pdp-legal__list"> ${items.map((i2) => renderTemplate`<li> <strong>${t(locale, `legal.pdp.${i2.kind}`)}:</strong> ${" "}${i2.text || t(locale, "legal.pdp.noSummary")} ${" "}<a class="pm-link"${addAttribute(localizePath(locale, `/policies/${i2.policy}`), "href")}>${t(locale, "legal.pdp.readMore")}</a> </li>`)} </ul> </section>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/legal/PdpSummary.astro", void 0);
const $$Declarations = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Declarations;
  const { locale, product, variantId = null } = Astro2.props;
  const lines = mandatoryDeclarations(product, variantId, locale);
  return renderTemplate`${lines.length > 0 && renderTemplate`${maybeRenderHead()}<section class="pm-pdp-legal" aria-labelledby="pm-pdp-declarations"><h2 id="pm-pdp-declarations" class="pm-pdp-legal__heading">${t(locale, "legal.pdp.declarationsHeading")}</h2><dl class="pm-legal__facts">${lines.map((l2) => renderTemplate`<div><dt>${t(locale, `legal.pdp.${l2.kind}`)}</dt><dd>${l2.value}</dd></div>`)}</dl></section>`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/legal/Declarations.astro", void 0);
const finite = (n) => typeof n === "number" && Number.isFinite(n);
function isPriceReduction(amount, prior) {
  return finite(amount) && finite(prior) && amount >= 0 && prior > amount;
}
function buildPriceBlock(input, locale = "en") {
  const currency = input.currency ?? "INR";
  const empty = {
    onRequest: true,
    price: null,
    taxInclusive: false,
    reduction: false,
    priorPrice: null,
    savingAmount: null,
    savingPercent: null,
    mrp: null,
    unitPrice: null,
    tiers: [],
    customerGroup: false
  };
  const {
    amount
  } = input;
  if (!finite(amount) || amount < 0) return empty;
  const reduction = isPriceReduction(amount, input.priorPrice);
  const prior = reduction ? input.priorPrice : null;
  const pct = prior === null ? 0 : savingPercent(prior, amount);
  const unit = input.requireUnitPrice && finite(input.netQuantity) && input.netQuantityUnit ? formatUnitPrice(amount, input.netQuantity, input.netQuantityUnit, currency, locale) : null;
  const tiers = tierSavings(amount, (input.tiers ?? []).filter((t2) => finite(t2.minQuantity) && finite(t2.amount) && t2.minQuantity > 1 && t2.amount >= 0).map((t2) => ({
    minQuantity: t2.minQuantity,
    unitPrice: t2.amount
  }))).map((t2) => {
    const f2 = formatTier(t2, currency, locale);
    return {
      quantity: f2.quantity,
      unitPrice: f2.unitPrice,
      saving: t2.savingPerUnit > 0 ? f2.saving : null
    };
  });
  return {
    onRequest: false,
    price: formatMoney(amount, currency, locale),
    taxInclusive: true,
    reduction,
    priorPrice: prior === null ? null : formatMoney(prior, currency, locale),
    savingAmount: prior === null ? null : formatMoney(savingAmount(prior, amount), currency, locale),
    // A saving under 1% rounds down to 0%: show the amount only.
    savingPercent: prior !== null && pct >= 1 ? formatPercent(pct, locale) : null,
    mrp: finite(input.mrp) && input.mrp > 0 ? formatMoney(input.mrp, currency, locale) : null,
    unitPrice: unit && unit !== "—" ? unit : null,
    tiers,
    customerGroup: !!input.customerGroup
  };
}
function pickLiveVariant(body, productId, variantId) {
  const products2 = body?.products;
  if (!Array.isArray(products2)) return null;
  const p2 = products2.find((x) => x && typeof x === "object" && x.id === productId);
  if (!p2 || p2.available === false || !Array.isArray(p2.variants)) return null;
  return p2.variants.find((v2) => v2?.id === variantId) ?? null;
}
const LIVE_TIMEOUT_MS = 8e3;
const DEFAULT_MAX_AGE_MS = 6e4;
const LIVE_PATH = "/_live/v1/products";
const MAX_IDS = 60;
function buildLiveUrl(p2, base = LIVE_PATH) {
  const ids = [...new Set(p2.ids.filter(Boolean))].sort().slice(0, MAX_IDS);
  const q2 = new URLSearchParams({
    ids: ids.join(",")
  });
  if (p2.region) q2.set("region", p2.region);
  if (p2.currency) q2.set("currency", p2.currency);
  return `${base}?${q2.toString()}`;
}
function parseLiveUrl(url) {
  const q2 = new URL(url, "https://x.invalid").searchParams;
  return {
    ids: (q2.get("ids") ?? "").split(",").map((s2) => s2.trim()).filter(Boolean),
    region: q2.get("region") || null,
    channel: q2.get("channel") || null,
    currency: q2.get("currency") || null
  };
}
const isObj$3 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
function isLiveData(body) {
  return isObj$3(body) && Array.isArray(body.products);
}
function findProduct(body, productId) {
  if (!isLiveData(body)) return null;
  return body.products.find((p2) => isObj$3(p2) && p2.id === productId) ?? null;
}
function isProductUnavailable(body, productId) {
  return findProduct(body, productId)?.available === false;
}
function newHandleOf(body, productId, currentHandle) {
  const p2 = findProduct(body, productId);
  if (!p2 || p2.available === false || typeof p2.handle !== "string" || !p2.handle) return null;
  return p2.handle !== currentHandle ? p2.handle : null;
}
function replaceHandleInPath(path, oldHandle, newHandle) {
  const m2 = /^([^?#]*)([?#].*)?$/.exec(path);
  const segs = (m2?.[1] ?? path).split("/");
  const i2 = segs.lastIndexOf(encodeURIComponent(oldHandle));
  const at = i2 >= 0 ? i2 : segs.lastIndexOf(oldHandle);
  if (at < 1 || segs[at - 1] !== "product") return null;
  segs[at] = encodeURIComponent(newHandle);
  return segs.join("/") + (m2?.[2] ?? "");
}
function syncHandleUrl(body, productId, currentHandle, loc = location, hist = history) {
  const next2 = newHandleOf(body, productId, currentHandle);
  if (!next2) return null;
  const path = replaceHandleInPath(loc.pathname + loc.search + loc.hash, currentHandle, next2);
  if (!path) return null;
  hist.replaceState(hist.state, "", path);
  return path;
}
function applyAvailability(root, body) {
  let n = 0;
  root.querySelectorAll("[data-add-to-cart][data-product-id]").forEach((el) => {
    const id = el.getAttribute("data-product-id") ?? "";
    if (!isProductUnavailable(body, id)) return;
    el.setAttribute("disabled", "");
    el.setAttribute("aria-disabled", "true");
    n++;
  });
  root.querySelectorAll("[data-unavailable-note][data-product-id]").forEach((el) => {
    if (isProductUnavailable(body, el.getAttribute("data-product-id") ?? "")) el.removeAttribute("hidden");
  });
  return n;
}
function applyCustomerPrices(body, prices) {
  if (!isLiveData(body) || !isObj$3(prices) || !Array.isArray(prices.prices)) return body;
  const byVariant = /* @__PURE__ */ new Map();
  for (const r2 of prices.prices) if (isObj$3(r2) && typeof r2.variant_id === "string") byVariant.set(r2.variant_id, r2);
  if (!byVariant.size) return body;
  const products2 = body.products.map((p2) => {
    if (!isObj$3(p2) || !Array.isArray(p2.variants)) return p2;
    const variants = p2.variants.map((v2) => {
      if (!isObj$3(v2) || typeof v2.id !== "string") return v2;
      const r2 = byVariant.get(v2.id);
      if (!r2 || typeof r2.calculated_amount !== "number") return v2;
      const prev2 = isObj$3(v2.price) ? v2.price : {};
      const changed = prev2.amount !== r2.calculated_amount;
      return {
        ...v2,
        price: {
          ...prev2,
          amount: r2.calculated_amount,
          currency_code: r2.currency_code ?? prev2.currency_code,
          is_tax_inclusive: r2.is_tax_inclusive ?? prev2.is_tax_inclusive
        },
        prior_price: changed ? null : v2.prior_price ?? null,
        countdown: changed ? null : v2.countdown ?? null,
        customer_price: true
      };
    });
    return {
      ...p2,
      variants
    };
  });
  return {
    ...body,
    products: products2
  };
}
function maxAgeMsOf(body) {
  const s2 = isObj$3(body) ? body.max_age_seconds : void 0;
  return typeof s2 === "number" && s2 > 0 ? s2 * 1e3 : DEFAULT_MAX_AGE_MS;
}
function withDeadline(p2, ms) {
  return new Promise((resolve, reject) => {
    const t2 = setTimeout(() => reject(new Error("timeout")), Math.max(0, ms));
    p2.then((v2) => {
      clearTimeout(t2);
      resolve(v2);
    }, (e2) => {
      clearTimeout(t2);
      reject(e2);
    });
  });
}
function createLiveClient(deps = {}) {
  const now = deps.now ?? (() => performance.now());
  const timeoutMs = deps.timeoutMs ?? LIVE_TIMEOUT_MS;
  const memo = /* @__PURE__ */ new Map();
  const staleResult = () => ({
    status: "stale",
    body: null,
    source: "none",
    customerPrices: false,
    fetchedAt: now(),
    maxAgeMs: DEFAULT_MAX_AGE_MS
  });
  async function defaultCall(fn, args) {
    const {
      createStoreApi
    } = await import("./store-api_CT_BcvPg.mjs");
    return createStoreApi({
      getAccessToken: deps.getAccessToken,
      fetch: deps.fetch,
      timeoutMs,
      retries: 0
    }).call(fn, args);
  }
  const call = deps.call ?? defaultCall;
  async function fromWorker(url, deadline) {
    const doFetch = deps.fetch ?? globalThis.fetch;
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), Math.max(0, deadline - now()));
    try {
      const res = await doFetch(url, {
        signal: ctl.signal,
        headers: {
          Accept: "application/json"
        }
      });
      if (!res.ok) throw new Error(`live ${res.status}`);
      const body = await res.json();
      if (!isLiveData(body)) throw new Error("live shape");
      return body;
    } finally {
      clearTimeout(timer);
    }
  }
  async function fromSupabase(p2) {
    const body = await call("store_live_data", {
      // PostgREST reads a text[] in a GET query as a Postgres array literal.
      p_product_ids: `{${p2.ids.map((i2) => `"${i2.replace(/(["\\])/g, "\\$1")}"`).join(",")}}`,
      p_region_id: p2.region ?? void 0,
      p_sales_channel_id: p2.channel ?? void 0,
      p_currency_code: p2.currency ?? void 0
    });
    if (!isLiveData(body)) throw new Error("live shape");
    return body;
  }
  async function run(url, signedIn) {
    const params = parseLiveUrl(url);
    if (!params.ids.length) return staleResult();
    const deadline = now() + timeoutMs;
    let body;
    let source = "worker";
    try {
      body = await fromWorker(url, deadline);
    } catch {
      try {
        body = await withDeadline(fromSupabase(params), deadline - now());
        source = "supabase";
      } catch {
        return staleResult();
      }
    }
    let customerPrices = false;
    if (signedIn) {
      const variantIds = body.products.flatMap((p2) => isObj$3(p2) && Array.isArray(p2.variants) ? p2.variants : []).map((v2) => isObj$3(v2) && typeof v2.id === "string" ? v2.id : "").filter(Boolean).slice(0, 100);
      if (variantIds.length) {
        try {
          const prices = await withDeadline(call("store_price_for_customer", {
            p_variant_ids: variantIds,
            p_region_id: params.region ?? void 0,
            p_currency_code: params.currency ?? void 0,
            p_sales_channel_id: params.channel ?? void 0
          }), deadline - now());
          const next2 = applyCustomerPrices(body, prices);
          customerPrices = next2 !== body;
          body = next2;
        } catch {
        }
      }
    }
    return {
      status: "ready",
      body,
      source,
      customerPrices,
      fetchedAt: now(),
      maxAgeMs: maxAgeMsOf(body)
    };
  }
  const isExpired = (r2) => r2.status !== "ready" || now() - r2.fetchedAt > r2.maxAgeMs;
  return {
    isExpired,
    reset: () => memo.clear(),
    load(url) {
      const signedIn = !!deps.getAccessToken?.();
      const hit = memo.get(url);
      if (hit && hit.signedIn === signedIn) return hit.promise;
      const promise = run(url, signedIn).catch(staleResult);
      memo.set(url, {
        promise,
        signedIn
      });
      void promise.then((r2) => {
        if (r2.status !== "ready") memo.delete(url);
        else setTimeout(() => memo.get(url)?.promise === promise && memo.delete(url), r2.maxAgeMs);
      });
      return promise;
    }
  };
}
let page$1 = null;
let tokenReader;
function pageLiveClient() {
  return page$1 ??= createLiveClient({
    getAccessToken: () => tokenReader?.()
  });
}
const NO_TRANSLATE$1 = {
  translate: "no"
};
const fill$2 = (s2, p2) => s2.replace(/\{(\w+)\}/g, (m2, k2) => p2[k2] ?? m2);
function PriceBlock({
  locale,
  initial,
  labels,
  liveUrl = null,
  productId = "",
  variantId = "",
  switchOn = true,
  idPrefix = "pm-price"
}) {
  const [input, setInput] = d(initial);
  const [stale, setStale] = d(false);
  const [explain, setExplain] = d(false);
  h(() => {
    if (!liveUrl) return;
    let cancelled = false;
    pageLiveClient().load(liveUrl).then((res) => {
      if (cancelled) return;
      const v2 = res.status === "ready" ? pickLiveVariant(res.body, productId, variantId) : null;
      const amount = v2?.price?.amount;
      if (!v2 || typeof amount !== "number") return setStale(true);
      setInput((cur) => ({
        ...cur,
        amount,
        priorPrice: v2.prior_price ?? null
      }));
      setStale(false);
    }).catch(() => !cancelled && setStale(true));
    return () => {
      cancelled = true;
    };
  }, [liveUrl, productId, variantId]);
  const m2 = buildPriceBlock(switchOn ? input : {
    amount: input.amount,
    currency: input.currency
  }, locale);
  const explainId = `${idPrefix}-explain`;
  if (m2.onRequest) {
    return u("div", {
      class: "pm-price-block pm-price-block--request",
      "data-state": "request",
      children: [u("p", {
        class: "pm-price-block__request",
        children: labels.onRequest
      }), u("p", {
        class: "pm-price-block__note",
        children: labels.onRequestHint
      })]
    });
  }
  return u("div", {
    class: "pm-price-block",
    "data-state": m2.reduction ? "reduction" : "regular",
    "data-stale": stale ? "true" : "false",
    children: [m2.customerGroup && u("p", {
      class: "pm-price-block__group",
      children: labels.yourPrice
    }), u("p", {
      class: "pm-price-block__line",
      children: [u("span", {
        class: "pm-visually-hidden",
        children: fill$2(labels.srCurrent, {
          price: m2.price ?? ""
        })
      }), u("strong", {
        class: "pm-price-block__now",
        ...NO_TRANSLATE$1,
        "aria-hidden": "true",
        children: m2.price
      }), m2.reduction && u(S, {
        children: [u("span", {
          class: "pm-visually-hidden",
          children: fill$2(labels.srPrior, {
            price: m2.priorPrice ?? ""
          })
        }), u("del", {
          class: "pm-price-block__prior",
          ...NO_TRANSLATE$1,
          "aria-hidden": "true",
          children: m2.priorPrice
        })]
      })]
    }), u("p", {
      class: "pm-price-block__tax",
      children: labels.inclTax
    }), m2.reduction && u("p", {
      class: "pm-price-block__saving",
      children: [u("span", {
        children: m2.savingPercent ? fill$2(labels.saving, {
          amount: m2.savingAmount ?? "",
          percent: m2.savingPercent
        }) : fill$2(labels.savingAmountOnly, {
          amount: m2.savingAmount ?? ""
        })
      }), u("button", {
        type: "button",
        class: "pm-price-block__explain-btn",
        "aria-expanded": explain,
        "aria-controls": explainId,
        onClick: () => setExplain((v2) => !v2),
        children: labels.explainControl
      })]
    }), m2.reduction && u("p", {
      id: explainId,
      class: "pm-price-block__note",
      hidden: !explain,
      children: labels.priorExplain
    }), m2.mrp && u("p", {
      class: "pm-price-block__mrp",
      children: [labels.mrp, " ", u("span", {
        ...NO_TRANSLATE$1,
        children: m2.mrp
      })]
    }), m2.unitPrice && u("p", {
      class: "pm-price-block__unit",
      children: [labels.unitPrice, " ", u("span", {
        ...NO_TRANSLATE$1,
        children: m2.unitPrice
      })]
    }), m2.tiers.length > 0 && u("table", {
      class: "pm-price-block__tiers",
      children: [u("caption", {
        children: labels.tiersCaption
      }), u("thead", {
        children: u("tr", {
          children: [u("th", {
            scope: "col",
            children: labels.tierQuantity
          }), u("th", {
            scope: "col",
            children: labels.tierPrice
          }), u("th", {
            scope: "col",
            children: labels.tierSaving
          })]
        })
      }), u("tbody", {
        children: m2.tiers.map((t2) => u("tr", {
          children: [u("th", {
            scope: "row",
            children: t2.quantity
          }), u("td", {
            ...NO_TRANSLATE$1,
            children: t2.unitPrice
          }), u("td", {
            ...NO_TRANSLATE$1,
            children: t2.saving ?? labels.noSaving
          })]
        }, t2.quantity))
      })]
    }), stale && u("p", {
      class: "pm-price-block__note",
      children: labels.cartConfirms
    })]
  });
}
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;
const CUTOFF = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 864e5;
const MAX_SEARCH_DAYS = 400;
function parseDispatchSettings(raw) {
  if (!raw || typeof raw !== "object") return null;
  const o2 = raw;
  const timezone = typeof o2.timezone === "string" && o2.timezone ? o2.timezone : DEFAULT_TIMEZONE;
  try {
    new Intl.DateTimeFormat("en", {
      timeZone: timezone
    });
  } catch {
    return null;
  }
  const days = Array.isArray(o2.working_days) ? o2.working_days.filter((d2) => Number.isInteger(d2) && d2 >= 1 && d2 <= 7) : [1, 2, 3, 4, 5, 6];
  const holidays = Array.isArray(o2.holidays) ? o2.holidays.filter((h2) => typeof h2 === "string" && YMD.test(h2)) : [];
  const cutoff = typeof o2.dispatch_cutoff === "string" && CUTOFF.test(o2.dispatch_cutoff) ? o2.dispatch_cutoff : null;
  return {
    timezone,
    cutoff,
    workingDays: days,
    holidays
  };
}
const fmtCache = /* @__PURE__ */ new Map();
function zonedParts(ms, timeZone) {
  let f2 = fmtCache.get(timeZone);
  if (!f2) {
    f2 = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    fmtCache.set(timeZone, f2);
  }
  const p2 = {};
  for (const part of f2.formatToParts(new Date(ms))) p2[part.type] = part.value;
  const ymd = `${p2.year}-${p2.month}-${p2.day}`;
  return {
    ymd,
    weekday: isoWeekday(ymd),
    secondOfDay: Number(p2.hour) * 3600 + Number(p2.minute) * 60 + Number(p2.second)
  };
}
const ymdToUtcMs = (ymd) => {
  const m2 = YMD.exec(ymd);
  return m2 ? Date.UTC(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3])) : NaN;
};
function isoWeekday(ymd) {
  const d2 = new Date(ymdToUtcMs(ymd)).getUTCDay();
  return d2 === 0 ? 7 : d2;
}
function addDays(ymd, n) {
  return new Date(ymdToUtcMs(ymd) + n * DAY_MS).toISOString().slice(0, 10);
}
function isWorkingDay(ymd, s2) {
  return s2.workingDays.includes(isoWeekday(ymd)) && !s2.holidays.includes(ymd);
}
function nextWorkingDay(ymd, s2) {
  for (let i2 = 0; i2 < MAX_SEARCH_DAYS; i2++) {
    const d2 = addDays(ymd, i2);
    if (isWorkingDay(d2, s2)) return d2;
  }
  return null;
}
const cutoffSecond = (cutoff) => {
  const m2 = CUTOFF.exec(cutoff);
  return Number(m2[1]) * 3600 + Number(m2[2]) * 60;
};
function dispatchDay(nowMs, s2) {
  const now = zonedParts(nowMs, s2.timezone);
  const beforeCutoff = s2.cutoff === null || now.secondOfDay < cutoffSecond(s2.cutoff);
  if (beforeCutoff && isWorkingDay(now.ymd, s2)) return {
    day: now.ymd,
    sameDay: true
  };
  const day = nextWorkingDay(addDays(now.ymd, 1), s2);
  return day ? {
    day,
    sameDay: false
  } : null;
}
function addWorkingDays(ymd, n, s2) {
  let day = ymd;
  for (let left = n; left > 0; left--) {
    const next2 = nextWorkingDay(addDays(day, 1), s2);
    if (!next2) return null;
    day = next2;
  }
  return day;
}
function deliveryEstimate(nowMs, s2, etaMinDays, etaMaxDays) {
  const ok2 = (n) => typeof n === "number" && Number.isInteger(n) && n >= 0;
  if (!ok2(etaMinDays) || !ok2(etaMaxDays) || etaMaxDays < etaMinDays) return null;
  const d2 = dispatchDay(nowMs, s2);
  if (!d2) return null;
  const from2 = addWorkingDays(d2.day, etaMinDays, s2);
  const to = addWorkingDays(d2.day, etaMaxDays, s2);
  return from2 && to ? {
    from: from2,
    to,
    dispatchDay: d2.day
  } : null;
}
function formatEstimate(e2, locale, nowMs, timeZone) {
  const noon = (ymd) => ymdToUtcMs(ymd) + DAY_MS / 2;
  const today = zonedParts(nowMs, timeZone).ymd;
  return formatDateRange(noon(e2.from), noon(e2.to), locale, {
    timeZone: "UTC",
    now: noon(today)
  });
}
function dispatchCountdownMs(nowMs, s2, sellable) {
  if (!s2.cutoff || !sellable) return null;
  const now = zonedParts(nowMs, s2.timezone);
  if (!isWorkingDay(now.ymd, s2)) return null;
  const left = (cutoffSecond(s2.cutoff) - now.secondOfDay) * 1e3;
  return left > 0 ? left : null;
}
const SALE_COUNTDOWN_WINDOW_MS = 48 * 36e5;
function parseSaleCountdown(raw) {
  if (!raw || typeof raw !== "object") return null;
  const o2 = raw;
  const endsAt = typeof o2.ends_at === "string" ? Date.parse(o2.ends_at) : NaN;
  const later = typeof o2.later_price === "number" ? o2.later_price : typeof o2.later_price === "string" ? Number(o2.later_price) : NaN;
  return Number.isFinite(endsAt) && Number.isFinite(later) && later >= 0 ? {
    endsAt,
    laterPrice: later
  } : null;
}
function saleCountdownMs(nowMs, e2) {
  if (!e2) return null;
  const left = e2.endsAt - nowMs;
  return left > 0 && left <= SALE_COUNTDOWN_WINDOW_MS ? left : null;
}
function createServerClock(serverTime, mono = () => performance.now()) {
  const base = typeof serverTime === "number" ? serverTime : Date.parse(serverTime);
  if (!Number.isFinite(base)) return null;
  const at = mono();
  return {
    now: () => base + (mono() - at)
  };
}
function formatClock(ms, locale = "en") {
  const total = Math.max(0, Math.floor(ms / 1e3));
  const two = (n) => formatNumber(n, locale).padStart(2, "0");
  return `${two(Math.floor(total / 3600))}:${two(Math.floor(total % 3600 / 60))}:${two(total % 60)}`;
}
const minuteOf = (ms) => Math.floor(Math.max(0, ms) / 6e4);
function formatEndTime(ms, locale, timeZone) {
  return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    day: "numeric",
    month: "short",
    numberingSystem: "latn"
  }).format(new Date(ms));
}
function pickLiveDelivery(body, productId, variantId) {
  const b = body;
  if (!b || !Array.isArray(b.products)) return null;
  const p2 = b.products.find((x) => x && typeof x === "object" && x.id === productId);
  if (!p2 || p2.available === false || !Array.isArray(p2.variants)) return null;
  const v2 = p2.variants.find((x) => x?.id === variantId);
  if (!v2) return null;
  return {
    serverTime: typeof b.server_time === "string" ? b.server_time : null,
    dispatch: parseDispatchSettings(b.dispatch),
    sellable: v2.stock_state === "in_stock" || v2.stock_state === "low_stock",
    countdown: parseSaleCountdown(v2.countdown)
  };
}
function parsePostalCheck(raw) {
  if (!raw || typeof raw !== "object" || raw.error) return null;
  const o2 = raw;
  const num2 = (v2) => typeof v2 === "number" && Number.isFinite(v2) ? v2 : null;
  return {
    serviceable: typeof o2.serviceable === "boolean" ? o2.serviceable : null,
    cod: o2.cod_available === true,
    etaMin: num2(o2.eta_min_days),
    etaMax: num2(o2.eta_max_days)
  };
}
const ok = (value) => ({
  ok: true,
  value
});
const fail = (key2, params) => ({
  ok: false,
  error: params ? {
    key: key2,
    params
  } : {
    key: key2
  }
});
function validatePin(input) {
  const s2 = (input ?? "").replace(/\s/g, "");
  if (s2 === "") return fail("validation.required");
  return /^[1-9][0-9]{5}$/.test(s2) ? ok(s2) : fail("validation.pinInvalid");
}
const COUNTDOWN_KEYS = ["saleEndsIn", "saleThen", "saleEndsAt", "saleEnded", "srSale", "dispatchWithin", "srDispatch"];
const DELIVERY_KEYS = ["pinLabel", "pinHint", "check", "checking", "change", "forPin", "between", "workingDays", "workingDaysOne", "notServiceable", "noEstimate", "codYes", "codNo", "error", "pinInvalid", "unknownCountry"];
const countdownLabels = (locale) => Object.fromEntries(COUNTDOWN_KEYS.map((k2) => [k2, t(locale, `countdown.${k2}`)]));
const deliveryLabels = (locale) => Object.fromEntries(DELIVERY_KEYS.map((k2) => [k2, t(locale, `delivery.${k2}`)]));
const fill$1 = (s2, p2) => s2.replace(/\{(\w+)\}/g, (m2, k2) => p2[k2] ?? m2);
const DEFAULT_MAX_AGE_S = 60;
function useLiveDelivery(liveUrl, productId, variantId, initialBody = null) {
  const [state, setState] = d(() => {
    const delivery2 = initialBody ? pickLiveDelivery(initialBody, productId, variantId) : null;
    const clock = delivery2?.serverTime ? createServerClock(delivery2.serverTime) : null;
    return delivery2 && clock ? {
      status: "ready",
      data: delivery2,
      clock
    } : {
      status: liveUrl ? "loading" : "stale",
      data: null,
      clock: null
    };
  });
  const [tick, setTick] = d(0);
  const loadedAt = A(state.status === "ready" ? performance.now() : null);
  const maxAgeMs = A(DEFAULT_MAX_AGE_S * 1e3);
  const refetch = q(() => setTick((n) => n + 1), []);
  h(() => {
    if (!liveUrl) return;
    let cancelled = false;
    const load = () => {
      void pageLiveClient().load(liveUrl).then((res) => {
        if (cancelled) return;
        const body = res.status === "ready" ? res.body : null;
        const delivery2 = body ? pickLiveDelivery(body, productId, variantId) : null;
        const clock = delivery2?.serverTime ? createServerClock(delivery2.serverTime) : null;
        if (!delivery2 || !clock) return markStale();
        maxAgeMs.current = res.maxAgeMs;
        loadedAt.current = performance.now();
        setState({
          status: "ready",
          data: delivery2,
          clock
        });
      }).catch(() => !cancelled && markStale());
    };
    const markStale = () => setState((cur) => loadedAt.current !== null && performance.now() - loadedAt.current <= maxAgeMs.current ? cur : {
      status: "stale",
      data: null,
      clock: null
    });
    load();
    const every = setInterval(() => document.visibilityState === "visible" && load(), maxAgeMs.current);
    return () => {
      cancelled = true;
      clearInterval(every);
    };
  }, [liveUrl, productId, variantId, tick]);
  return {
    ...state,
    refetch
  };
}
function useVisible(ref) {
  const [inView, setInView] = d(true);
  const [tabVisible, setTabVisible] = d(() => typeof document === "undefined" || document.visibilityState === "visible");
  h(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    let io = null;
    if (ref.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => setInView(entries.some((e2) => e2.isIntersecting)));
      io.observe(ref.current);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [ref]);
  return inView && tabVisible;
}
function usePrefersReducedMotion() {
  const [reduced, setReduced] = d(() => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  h(() => {
    if (typeof matchMedia !== "function") return;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}
const PIN_LENGTH = 6;
function DeliveryDate({
  locale,
  labels,
  liveUrl = null,
  productId,
  variantId,
  initialBody = null,
  countryCode = "in",
  switchOn = true,
  apiUrl,
  apiKey
}) {
  const live = useLiveDelivery(switchOn ? liveUrl : null, productId, variantId, switchOn ? initialBody : null);
  const [phase, setPhase] = d({
    name: "idle"
  });
  const [value, setValue] = d("");
  const [invalid, setInvalid] = d(false);
  const id = g();
  const run = async (raw) => {
    const v2 = validatePin(raw);
    if (!v2.ok) return setInvalid(true);
    setInvalid(false);
    setPhase({
      name: "checking"
    });
    try {
      const {
        createStoreApi
      } = await import("./store-api_CT_BcvPg.mjs");
      const api = createStoreApi(apiUrl ? {
        url: apiUrl,
        key: apiKey ?? "sb_publishable_fixture"
      } : {});
      const check = parsePostalCheck(await api.call("store_check_postal_code", {
        p_country_code: countryCode,
        p_postal_code: v2.value
      }));
      if (!check) return setPhase({
        name: "error"
      });
      setItem("sf.pin", v2.value);
      setPhase({
        name: "done",
        pin: v2.value,
        check
      });
    } catch {
      setPhase({
        name: "error"
      });
    }
  };
  h(() => {
    if (!switchOn) return;
    const stored = getItem("sf.pin");
    if (stored && validatePin(stored).ok) {
      setValue(stored);
      void run(stored);
    }
  }, [switchOn]);
  if (!switchOn) return u("div", {
    class: "pm-delivery",
    hidden: true
  });
  const change = () => {
    removeItem("sf.pin");
    setPhase({
      name: "idle"
    });
  };
  const result = () => {
    if (phase.name !== "done") return null;
    const {
      check
    } = phase;
    if (check.serviceable === false) return u("p", {
      class: "pm-delivery__error",
      children: labels.notServiceable
    });
    if (check.serviceable === null || check.etaMin === null || check.etaMax === null) {
      return u("p", {
        class: "pm-delivery__note",
        children: check.serviceable === null ? labels.unknownCountry : labels.noEstimate
      });
    }
    const data = live.status === "ready" ? live.data : null;
    const est = data?.dispatch && live.clock ? deliveryEstimate(live.clock.now(), data.dispatch, check.etaMin, check.etaMax) : null;
    const line = est && data?.dispatch && live.clock ? fill$1(labels.between, {
      range: formatEstimate(est, locale, live.clock.now(), data.dispatch.timezone)
    }) : check.etaMin === check.etaMax ? fill$1(labels.workingDaysOne, {
      days: formatNumber(check.etaMax, locale)
    }) : fill$1(labels.workingDays, {
      min: formatNumber(check.etaMin, locale),
      max: formatNumber(check.etaMax, locale)
    });
    return u(S, {
      children: [u("p", {
        class: "pm-delivery__date",
        children: line
      }), u("p", {
        class: "pm-delivery__note",
        children: check.cod ? labels.codYes : labels.codNo
      })]
    });
  };
  const inputId = `${id}-pin`;
  const hintId = `${id}-hint`;
  return u("div", {
    class: "pm-delivery",
    "data-state": phase.name,
    children: [phase.name === "done" ? u("p", {
      class: "pm-delivery__head",
      children: [u("span", {
        class: "pm-delivery__forpin",
        children: fill$1(labels.forPin, {
          pin: phase.pin
        })
      }), u("button", {
        type: "button",
        class: "pm-delivery__link",
        onClick: change,
        children: labels.change
      })]
    }) : u("form", {
      class: "pm-delivery__form",
      onSubmit: (e2) => {
        e2.preventDefault();
        void run(value);
      },
      children: [u("label", {
        class: "pm-delivery__title",
        for: inputId,
        children: labels.pinLabel
      }), u("div", {
        class: "pm-delivery__row",
        children: [u("input", {
          id: inputId,
          class: "pm-delivery__input",
          type: "text",
          inputMode: "numeric",
          autoComplete: "postal-code",
          maxLength: PIN_LENGTH,
          value,
          "aria-invalid": invalid,
          "aria-describedby": hintId,
          onInput: (e2) => setValue(e2.currentTarget.value)
        }), u("button", {
          type: "submit",
          class: "pm-delivery__btn",
          disabled: phase.name === "checking",
          children: phase.name === "checking" ? labels.checking : labels.check
        })]
      }), u("p", {
        id: hintId,
        class: invalid ? "pm-delivery__error" : "pm-delivery__hint",
        children: invalid ? labels.pinInvalid : labels.pinHint
      })]
    }), u("div", {
      role: "status",
      "aria-live": "polite",
      children: [phase.name === "error" && u("p", {
        class: "pm-delivery__error",
        children: labels.error
      }), result()]
    })]
  });
}
function Countdown({
  kind,
  locale,
  labels,
  liveUrl = null,
  productId,
  variantId,
  initialBody = null,
  switchOn = true,
  currency = "INR"
}) {
  const ref = A(null);
  const live = useLiveDelivery(switchOn ? liveUrl : null, productId, variantId, switchOn ? initialBody : null);
  const visible = useVisible(ref);
  const reduced = usePrefersReducedMotion();
  const [now, setNow] = d(null);
  const [ended, setEnded] = d(null);
  const [announce, setAnnounce] = d("");
  const shown = A(false);
  const firstMinute = A(null);
  const clock = live.clock;
  const data = live.status === "ready" ? live.data : null;
  h(() => {
    if (!clock || !visible) return;
    setNow(clock.now());
    const id = setInterval(() => setNow(clock.now()), 1e3);
    return () => clearInterval(id);
  }, [clock, visible]);
  const remaining = now === null || !data ? null : kind === "sale" ? saleCountdownMs(now, data.countdown) : data.dispatch ? dispatchCountdownMs(now, data.dispatch, data.sellable) : null;
  h(() => {
    if (remaining !== null) {
      shown.current = true;
      return;
    }
    if (!shown.current || !data) return;
    shown.current = false;
    if (kind === "sale" && data.countdown) setEnded({
      price: data.countdown.laterPrice
    });
    live.refetch();
  }, [remaining === null]);
  h(() => setEnded(null), [live.data]);
  const minute = remaining === null ? null : minuteOf(remaining);
  h(() => {
    if (minute === null) {
      firstMinute.current = null;
      return setAnnounce("");
    }
    if (firstMinute.current === null) {
      firstMinute.current = minute;
      return;
    }
    setAnnounce(fill$1(kind === "sale" ? labels.srSale : labels.srDispatch, {
      time: formatDuration(minute * 6e4, locale)
    }));
  }, [minute]);
  const body = () => {
    if (remaining !== null && data) {
      const time = reduced ? formatDuration(remaining, locale) : formatClock(remaining, locale);
      if (kind === "dispatch") {
        return u("p", {
          class: "pm-countdown__line",
          children: fill$1(labels.dispatchWithin, {
            time: formatDuration(remaining, locale)
          })
        });
      }
      const sale = data.countdown;
      return u(S, {
        children: [u("p", {
          class: "pm-countdown__line",
          "aria-hidden": "true",
          children: [fill$1(labels.saleEndsIn, {
            time
          }), sale && u("span", {
            class: "pm-countdown__then",
            children: fill$1(labels.saleThen, {
              price: formatMoney(sale.laterPrice, currency, locale)
            })
          })]
        }), sale && data.dispatch && u("p", {
          class: "pm-countdown__static",
          children: fill$1(labels.saleEndsAt, {
            time: formatEndTime(sale.endsAt, locale, data.dispatch.timezone)
          })
        }), sale && !data.dispatch && u("p", {
          class: "pm-countdown__static",
          children: fill$1(labels.saleEndsAt, {
            time: formatEndTime(sale.endsAt, locale, "Asia/Kolkata")
          })
        })]
      });
    }
    if (ended) {
      return u("p", {
        class: "pm-countdown__static",
        children: fill$1(labels.saleEnded, {
          price: formatMoney(ended.price, currency, locale)
        })
      });
    }
    return null;
  };
  return u("div", {
    class: "pm-countdown",
    "data-kind": kind,
    "data-active": remaining !== null ? "true" : "false",
    ref,
    children: [switchOn && body(), u("span", {
      class: "pm-visually-hidden",
      role: "status",
      "aria-live": "polite",
      children: announce
    })]
  });
}
const POPULARITY_BANDS = [5, 10, 25, 50, 100, 250, 500, 1e3];
const MIN_HIGHLIGHT_CHARS = 100;
const isObj$2 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const isNum$1 = (x) => typeof x === "number" && Number.isFinite(x);
function parseReviewSummary(raw) {
  const s2 = isObj$2(raw) && isObj$2(raw.summary) ? raw.summary : raw;
  if (!isObj$2(s2) || !isNum$1(s2.count) || !isNum$1(s2.average)) return null;
  const count2 = Math.trunc(s2.count);
  if (count2 < 1 || s2.average < 1 || s2.average > 5) return null;
  return {
    count: count2,
    average: s2.average
  };
}
const formatRating = (average) => (Math.round(average * 10) / 10).toFixed(1);
function parseReviews(raw) {
  const rows = isObj$2(raw) && Array.isArray(raw.reviews) ? raw.reviews : [];
  const out = [];
  for (const r2 of rows) {
    if (!isObj$2(r2) || typeof r2.id !== "string" || !isNum$1(r2.rating) || typeof r2.body !== "string" || typeof r2.created_at !== "string") continue;
    out.push({
      id: r2.id,
      rating: r2.rating,
      title: typeof r2.title === "string" ? r2.title : null,
      body: r2.body,
      author: typeof r2.author === "string" ? r2.author : "",
      createdAt: r2.created_at
    });
  }
  return out;
}
function pickHighlights(reviews2) {
  const long = reviews2.filter((r2) => r2.body.trim().length >= MIN_HIGHLIGHT_CHARS);
  const newest = (xs) => xs.reduce((a2, r2) => !a2 || Date.parse(r2.createdAt) > Date.parse(a2.createdAt) ? r2 : a2, null);
  const positive = newest(long.filter((r2) => r2.rating >= 4 && r2.rating <= 5));
  const critical = newest(long.filter((r2) => r2.rating >= 1 && r2.rating < 4));
  return positive && critical ? {
    positive,
    critical
  } : null;
}
function parsePopularityBand(v2) {
  return isNum$1(v2) && POPULARITY_BANDS.includes(v2) ? v2 : null;
}
function lowStockQuantity(q2, allowBackorder, threshold = null) {
  if (!isNum$1(q2) || allowBackorder !== false) return null;
  if (q2 <= 0 || !Number.isInteger(q2)) return null;
  return threshold !== null && q2 > threshold ? null : q2;
}
function pickLiveSocial(body, productId, variantId) {
  if (!isObj$2(body) || !Array.isArray(body.products)) return null;
  const p2 = body.products.find((x) => isObj$2(x) && x.id === productId);
  if (!isObj$2(p2) || p2.available === false || !Array.isArray(p2.variants)) return null;
  const v2 = p2.variants.find((x) => isObj$2(x) && x.id === variantId);
  if (!isObj$2(v2)) return null;
  return {
    popularityBand: parsePopularityBand(p2.popularity_band),
    quantity: lowStockQuantity(v2.sellable_quantity, v2.allow_backorder)
  };
}
function trustItems(e2) {
  if (!e2) return [];
  const out = [];
  if (e2.securePayment === true) out.push({
    key: "securePayment"
  });
  if (e2.cod === true) out.push({
    key: "cod"
  });
  if (isNum$1(e2.returnDays) && e2.returnDays > 0 && Number.isInteger(e2.returnDays)) out.push({
    key: "returns",
    value: String(e2.returnDays)
  });
  if (e2.gstInvoice === true) out.push({
    key: "gstInvoice"
  });
  if (typeof e2.origin === "string" && e2.origin.trim()) out.push({
    key: "origin",
    value: e2.origin.trim()
  });
  return out;
}
function ReviewSummary({
  locale,
  labels,
  evidence,
  switchOn = true
}) {
  const s2 = switchOn ? parseReviewSummary(evidence) : null;
  if (!s2) return null;
  return u("p", {
    class: "pm-review-summary",
    children: [u("span", {
      "aria-hidden": "true",
      children: "★"
    }), " ", u("span", {
      children: fill$1(labels.rating, {
        average: formatRating(s2.average)
      })
    }), " ", u("span", {
      children: fill$1(labels.ratingCount, {
        count: formatCount(s2.count, locale)
      })
    })]
  });
}
function Highlight({
  r: r2,
  kind,
  labels
}) {
  return u("figure", {
    class: "pm-review-highlight",
    "data-kind": kind,
    children: [u("figcaption", {
      children: [kind === "positive" ? labels.highlightPositive : labels.highlightCritical, " · ", fill$1(labels.rating, {
        average: formatRating(r2.rating)
      })]
    }), r2.title && u("p", {
      children: u("strong", {
        children: r2.title
      })
    }), u("blockquote", {
      children: r2.body
    }), r2.author && u("p", {
      children: fill$1(labels.highlightBy, {
        name: r2.author
      })
    })]
  });
}
function ReviewHighlights({
  labels,
  evidence,
  switchOn = true
}) {
  const h2 = switchOn ? pickHighlights(parseReviews(evidence)) : null;
  if (!h2) return null;
  return u("section", {
    class: "pm-review-highlights",
    "aria-label": labels.highlightsTitle,
    children: [u("h2", {
      children: labels.highlightsTitle
    }), u(Highlight, {
      r: h2.positive,
      kind: "positive",
      labels
    }), u(Highlight, {
      r: h2.critical,
      kind: "critical",
      labels
    })]
  });
}
function useLiveSocial(liveUrl, productId, variantId, initialBody) {
  const initial = () => {
    const e2 = initialBody ? pickLiveSocial(initialBody, productId, variantId) : null;
    return e2 ? {
      status: "ready",
      evidence: e2
    } : {
      status: liveUrl ? "loading" : "stale"
    };
  };
  const [state, setState] = d(initial);
  h(() => {
    if (!liveUrl) return;
    let cancelled = false;
    const client = pageLiveClient();
    const load = () => void client.load(liveUrl).then((res) => {
      if (cancelled) return;
      const e2 = res.status === "ready" ? pickLiveSocial(res.body, productId, variantId) : null;
      setState(e2 ? {
        status: "ready",
        evidence: e2
      } : {
        status: "stale"
      });
    }, () => !cancelled && setState({
      status: "stale"
    }));
    load();
    const every = setInterval(() => document.visibilityState === "visible" && load(), 6e4);
    return () => {
      cancelled = true;
      clearInterval(every);
    };
  }, [liveUrl, productId, variantId]);
  return state;
}
function PopularityNotice({
  locale,
  labels,
  liveUrl = null,
  productId,
  variantId,
  initialBody = null,
  switchOn = true
}) {
  const live = useLiveSocial(switchOn ? liveUrl : null, productId, variantId, switchOn ? initialBody : null);
  if (!switchOn || live.status !== "ready" || live.evidence.popularityBand === null) return null;
  return u("p", {
    class: "pm-popularity",
    children: fill$1(labels.popularity, {
      band: formatNumber(live.evidence.popularityBand, locale)
    })
  });
}
function LowStockNotice({
  locale,
  labels,
  liveUrl = null,
  productId,
  variantId,
  initialBody = null,
  switchOn = true
}) {
  const live = useLiveSocial(switchOn ? liveUrl : null, productId, variantId, switchOn ? initialBody : null);
  if (!switchOn || live.status !== "ready" || live.evidence.quantity === null) return null;
  return u("p", {
    class: "pm-low-stock",
    role: "status",
    children: fill$1(labels.lowStock, {
      count: formatNumber(live.evidence.quantity, locale)
    })
  });
}
function TrustStrip({
  locale,
  labels,
  evidence,
  switchOn = true
}) {
  const items = switchOn ? trustItems(evidence) : [];
  if (!items.length) return null;
  return u("ul", {
    class: "pm-trust-strip",
    "aria-label": labels.trustLabel,
    children: items.map((i2) => u("li", {
      children: fill$1(labels[i2.key], {
        value: i2.key === "returns" && i2.value ? formatNumber(Number(i2.value), locale) : i2.value ?? ""
      })
    }, i2.key))
  });
}
const isNum = (x) => typeof x === "number" && Number.isFinite(x);
const PERCENT_MAX = 100;
function freeDeliveryProgress(subtotal2, threshold) {
  if (!isNum(subtotal2) || !isNum(threshold) || threshold <= 0 || subtotal2 < 0) return null;
  const reached = subtotal2 >= threshold;
  return {
    remaining: reached ? 0 : threshold - subtotal2,
    percent: Math.min(100, Math.floor(subtotal2 / threshold * 100)),
    reached
  };
}
function pairedProducts(self, paired) {
  const seen = /* @__PURE__ */ new Set([self]);
  return paired.filter((p2) => p2 && p2.available && !seen.has(p2.id) && !!seen.add(p2.id));
}
const RECENT_MAX = 10;
function recentlyViewed() {
  const v2 = getJson("sf.recent");
  return Array.isArray(v2) ? v2.filter((x) => typeof x === "string").slice(0, RECENT_MAX) : [];
}
function recordViewed(id) {
  const next2 = [id, ...recentlyViewed().filter((x) => x !== id)].slice(0, RECENT_MAX);
  setJson("sf.recent", next2);
  return next2;
}
const STICKY_BELOW_PX = 768;
const stickyBarVisible = (viewportWidth, buyBoxInView) => viewportWidth < STICKY_BELOW_PX && !buyBoxInView;
function FreeDeliveryProgress({
  locale,
  labels,
  currency = "INR",
  subtotal: subtotal2,
  threshold,
  switchOn = true
}) {
  const p2 = switchOn ? freeDeliveryProgress(subtotal2, threshold) : null;
  if (!p2) return null;
  const text2 = p2.reached ? labels.freeReached : fill$1(labels.freeProgress, {
    amount: formatMoney(p2.remaining, currency, locale)
  });
  return u("div", {
    class: "pm-free-delivery",
    children: [u("p", {
      children: text2
    }), u("progress", {
      value: p2.percent,
      max: PERCENT_MAX,
      "aria-label": text2
    })]
  });
}
function GoesWellWith({
  locale,
  labels,
  currency = "INR",
  self,
  paired,
  onAdd,
  switchOn = true
}) {
  const items = switchOn ? pairedProducts(self, paired) : [];
  if (!items.length) return null;
  return u("section", {
    class: "pm-goes-well",
    "aria-label": labels.goesWellTitle,
    children: [u("h2", {
      children: labels.goesWellTitle
    }), u("ul", {
      children: items.map((p2) => u("li", {
        children: [p2.url ? u("a", {
          href: p2.url,
          children: p2.title
        }) : u("span", {
          children: p2.title
        }), " ", u("span", {
          children: formatMoney(p2.price, currency, locale)
        }), " ", u("button", {
          type: "button",
          class: "pm-btn",
          "data-add-product": p2.id,
          onClick: () => onAdd(p2.id),
          children: labels.add
        })]
      }, p2.id))
    })]
  });
}
function StickyBuyBar({
  locale,
  labels,
  currency = "INR",
  buyBoxId,
  price: price2,
  onAdd,
  disabled = false,
  switchOn = true
}) {
  const [inView, setInView] = d(true);
  const [width, setWidth] = d(() => typeof window === "undefined" ? Infinity : window.innerWidth);
  h(() => {
    const el = document.getElementById(buyBoxId);
    const io = el && typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((e2) => setInView(e2[0]?.isIntersecting ?? true)) : null;
    if (el) io?.observe(el);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [buyBoxId]);
  if (!switchOn || !stickyBarVisible(width, inView)) return null;
  return u("div", {
    class: "pm-sticky-buy",
    children: [price2 !== null && u("span", {
      class: "pm-sticky-price",
      children: formatMoney(price2, currency, locale)
    }), u("button", {
      type: "button",
      class: "pm-btn",
      "data-add-to-cart": true,
      disabled,
      onClick: onAdd,
      children: labels.stickyAdd
    })]
  });
}
const COLOUR_OPTION = /^(colou?rs?|shade|रंग)$/i;
const CSS_COLOUR = /^(#[0-9a-f]{3,8}|[a-z]{3,20})$/i;
const MIN_QTY = 1;
const MAX_QTY = 100;
const NO_TRANSLATE = {
  translate: "no"
};
const fill = (s2, p2) => s2.replace(/\{(\w+)\}/g, (m2, k2) => k2 in p2 ? String(p2[k2]) : m2);
const BUY_BOX_ID = "pdp-buybox";
const optionButtonId = (optionId, i2) => `pdp-opt-${optionId}-${i2}`;
function Slot({
  k: k2,
  showTo,
  children
}) {
  return showTo[k2] ? u("div", {
    "data-pm-component": k2,
    "data-pm-show": showTo[k2],
    children
  }) : u(S, {
    children
  });
}
function PdpBuyBox({
  children,
  locale,
  text: text2,
  model,
  liveUrl,
  switches,
  showTo = {},
  requireUnitPrice = false,
  priceOnRequest = false,
  requestLinks = null,
  labels,
  freeDeliveryThreshold,
  countryCode,
  facts = null,
  totalLabel = "",
  panelNote: panelNote2 = ""
}) {
  const [selection, setSelection] = d(() => initialSelection(model, null));
  const [qty, setQty] = d(1);
  const [body, setBody] = d(null);
  const [missing, setMissing] = d(null);
  const [busy, setBusy] = d(false);
  const [error, setError] = d("");
  const [added, setAdded] = d(null);
  const addRef = A(null);
  const hasMounted = A(false);
  h(() => {
    const id = new URLSearchParams(location.search).get("variant");
    if (id) setSelection(initialSelection(model, id));
    recordViewed(model.id);
  }, [model]);
  h(() => {
    if (!liveUrl) return;
    let cancelled = false;
    pageLiveClient().load(liveUrl).then((res) => {
      if (cancelled || res.status !== "ready") return;
      setBody(res.body);
      applyAvailability(document, res.body);
      syncHandleUrl(res.body, model.id, model.handle);
    }, () => void 0);
    return () => {
      cancelled = true;
    };
  }, [liveUrl, model.id, model.handle]);
  const chosen = variantFor(model, selection);
  const shown = displayVariant(model, chosen);
  const shownId = shown?.id ?? "";
  const stock = (variantId) => stockStateOf(body, model.id, variantId);
  const state = chosen ? stock(chosen.id) : null;
  const unavailable2 = isProductUnavailable(body, model.id);
  const soldOut = !!chosen && state !== null && !isSellable(state);
  h(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (chosen) history.replaceState(history.state, "", location.pathname + withVariantParam(location.search, chosen.id) + location.hash);
    window.dispatchEvent(new CustomEvent("pdp:variant", {
      detail: {
        variantId: chosen?.id ?? null,
        imageIndex: imageIndexFor(model, chosen)
      }
    }));
  }, [chosen?.id]);
  const pick = (optionId, value) => {
    setSelection((s2) => ({
      ...s2,
      [optionId]: value
    }));
    setMissing(null);
    setError("");
    setAdded(null);
  };
  const add = async (checkout2 = false) => {
    if (busy || unavailable2) return;
    const miss = missingOption$2(model, selection);
    if (miss || !chosen) {
      const o2 = miss ?? model.options[0];
      setMissing(o2?.id ?? null);
      if (o2) {
        const buttons = [...document.querySelectorAll(`[data-pdp-option="${CSS.escape(o2.id)}"] button`)];
        const target = buttons[0];
        target?.scrollIntoView({
          block: "center"
        });
        target?.focus();
      }
      return;
    }
    if (soldOut) return;
    setBusy(true);
    setError("");
    try {
      const cart = await import("./store_XteqTnph.mjs");
      const ok2 = await cart.addItem(model.id, chosen.id, qty);
      if (!ok2) {
        setError(text2.addError);
        return;
      }
      if (checkout2) {
        location.assign(localizePath(locale, "/checkout"));
        return;
      }
      const s2 = cart.$cart.get();
      setAdded({
        title: model.title,
        qty,
        subtotal: s2.totals.subtotal,
        currency: s2.currency
      });
    } catch {
      setError(text2.addError);
    } finally {
      setBusy(false);
    }
  };
  const options2 = T(() => model.options, [model]);
  const asRequest = priceOnRequest && !!requestLinks;
  const price2 = shown && !asRequest ? {
    amount: shown.price,
    currency: model.currency,
    priorPrice: shown.prior,
    mrp: shown.mrp,
    netQuantity: shown.netQuantity,
    netQuantityUnit: shown.netQuantityUnit,
    tiers: shown.tiers.length ? shown.tiers : null,
    requireUnitPrice
  } : {
    amount: null,
    currency: model.currency
  };
  const showFrom = !chosen && pricesDiffer(model);
  const missingTitle = missing ? options2.find((o2) => o2.id === missing)?.title ?? "" : "";
  const statusText = !chosen || state === null ? "" : state === "out_of_stock" ? text2.outOfStock : state === "backorder" ? text2.backorder : text2.inStock;
  const addDisabled = unavailable2 || busy || soldOut;
  return u("div", {
    class: "pm-buybox",
    "data-live-product": model.id,
    children: [u("div", {
      class: "pm-buybox__core",
      id: BUY_BOX_ID,
      children: [u(Slot, {
        k: "popularity_notice",
        showTo,
        children: u(PopularityNotice, {
          locale,
          labels: labels.social,
          liveUrl,
          productId: model.id,
          variantId: shownId,
          switchOn: switches.popularity_notice !== false
        })
      }), showFrom && u("p", {
        class: "pm-buybox__from",
        children: text2.from
      }), u(Slot, {
        k: "price_block",
        showTo,
        children: u(PriceBlock, {
          locale,
          initial: price2,
          labels: labels.price,
          liveUrl: asRequest ? null : liveUrl,
          productId: model.id,
          variantId: shownId,
          switchOn: switches.price_block !== false,
          idPrefix: "pdp-price"
        }, shownId)
      }), u(Slot, {
        k: "sale_countdown",
        showTo,
        children: u(Countdown, {
          kind: "sale",
          locale,
          labels: labels.countdown,
          liveUrl,
          productId: model.id,
          variantId: shownId,
          switchOn: switches.sale_countdown !== false,
          currency: model.currency
        })
      }), u("div", {
        id: "pdp-variants",
        children
      }), options2.map((o2) => {
        const isColour = COLOUR_OPTION.test(o2.title.trim());
        const gid = `pdp-opt-label-${o2.id}`;
        return u("div", {
          class: "pm-variants",
          role: "group",
          "aria-labelledby": gid,
          "data-pdp-option": o2.id,
          children: [u("p", {
            class: "pm-variants__label",
            id: gid,
            children: [o2.title, selection[o2.id] ? u(S, {
              children: [": ", u("strong", {
                children: selection[o2.id]
              })]
            }) : null]
          }), u("ul", {
            class: "pm-variants__list",
            children: o2.values.map((v2, i2) => {
              const on = selection[o2.id] === v2;
              const oos = valueOutOfStock(model, o2.id, v2, stock);
              const css = isColour && CSS_COLOUR.test(v2) ? v2 : null;
              const candidate = variantFor(model, {
                ...selection,
                [o2.id]: v2
              });
              return u("li", {
                children: u("button", {
                  type: "button",
                  id: optionButtonId(o2.id, i2),
                  class: `pm-vbtn${css ? " pm-vbtn--swatch" : ""}${oos ? " is-oos" : ""}`,
                  "aria-pressed": on,
                  "aria-label": oos ? fill(text2.outOfStockValue, {
                    value: v2
                  }) : void 0,
                  "data-value": v2,
                  title: oos ? fill(text2.outOfStockValue, {
                    value: v2
                  }) : v2,
                  onClick: () => pick(o2.id, v2),
                  children: [css ? u("span", {
                    class: "pm-vbtn__dot",
                    "data-colour": css,
                    "aria-hidden": "true"
                  }) : null, u("span", {
                    class: css ? "pm-visually-hidden" : void 0,
                    children: v2
                  }), !asRequest && candidate?.price != null && !isColour && u("small", {
                    children: formatMoney(candidate.price, model.currency, locale)
                  })]
                })
              }, v2);
            })
          })]
        }, o2.id);
      }), u("p", {
        class: "pm-error pm-buybox__missing",
        role: "alert",
        hidden: !missing,
        children: missing ? fill(text2.missingOption, {
          option: missingTitle
        }) : ""
      })]
    }), u("aside", {
      class: "pm-purchase-panel",
      id: "pdp-delivery",
      "aria-label": text2.purchaseOptions,
      children: [!asRequest && shown?.price != null && u("div", {
        class: "pm-ref-amount",
        children: [showFrom && u("small", {
          children: [text2.from, " "]
        }), u("span", {
          ...NO_TRANSLATE,
          children: formatMoney(shown.price, model.currency, locale)
        }), u("small", {
          children: labels.price.inclTax
        })]
      }), u("div", {
        class: "pm-buybox__status",
        "aria-live": "polite",
        children: [statusText && u("p", {
          class: `pm-stock${soldOut ? " pm-stock--out" : ""}`,
          children: statusText
        }), chosen?.sku ? u("p", {
          class: "pm-buybox__sku",
          children: [text2.sku, ": ", u("span", {
            ...NO_TRANSLATE,
            children: chosen.sku
          })]
        }) : null, u(Slot, {
          k: "low_stock_notice",
          showTo,
          children: u(LowStockNotice, {
            locale,
            labels: labels.social,
            liveUrl,
            productId: model.id,
            variantId: shownId,
            switchOn: switches.low_stock_notice !== false
          })
        }), u(Slot, {
          k: "dispatch_countdown",
          showTo,
          children: u(Countdown, {
            kind: "dispatch",
            locale,
            labels: labels.countdown,
            liveUrl,
            productId: model.id,
            variantId: shownId,
            switchOn: switches.dispatch_countdown !== false,
            currency: model.currency
          })
        })]
      }), u(Slot, {
        k: "delivery_promise",
        showTo,
        children: u(DeliveryDate, {
          locale,
          labels: labels.delivery,
          liveUrl,
          productId: model.id,
          variantId: shownId,
          countryCode,
          switchOn: switches.delivery_promise !== false
        })
      }), asRequest && requestLinks && u("div", {
        class: "pm-buybox__actions pm-buybox__actions--request",
        children: [u("a", {
          class: "pm-button pm-button--primary",
          href: requestLinks.quotation,
          "data-quotation-request": true,
          children: text2.quoteCta
        }), u("a", {
          class: "pm-button pm-button--secondary",
          href: requestLinks.enquiry,
          "data-enquiry-request": true,
          children: text2.enquiryCta
        })]
      }), u("div", {
        class: "pm-buybox__actions",
        hidden: asRequest,
        children: [u("div", {
          class: "pm-qty",
          role: "group",
          "aria-label": text2.quantity,
          children: [u("button", {
            type: "button",
            class: "pm-qty__btn",
            "aria-label": text2.decrease,
            disabled: qty <= 1,
            onClick: () => setQty((q2) => Math.max(1, q2 - 1)),
            children: "−"
          }), u("input", {
            class: "pm-qty__input",
            type: "number",
            inputMode: "numeric",
            min: MIN_QTY,
            max: MAX_QTY,
            value: qty,
            "aria-label": text2.quantity,
            onInput: (e2) => {
              const n = Math.trunc(Number(e2.currentTarget.value));
              setQty(Number.isFinite(n) ? Math.min(MAX_QTY, Math.max(1, n)) : 1);
            }
          }), u("button", {
            type: "button",
            class: "pm-qty__btn",
            "aria-label": text2.increase,
            disabled: qty >= MAX_QTY,
            onClick: () => setQty((q2) => Math.min(MAX_QTY, q2 + 1)),
            children: "+"
          })]
        }), u("button", {
          type: "button",
          class: "pm-button pm-button--primary pm-buybox__direct",
          disabled: addDisabled,
          onClick: () => void add(true),
          children: text2.buyNow
        }), u("button", {
          type: "button",
          ref: addRef,
          class: "pm-button pm-button--secondary pm-buybox__add",
          "data-add-to-cart": true,
          "data-product-id": model.id,
          "data-variant-id": chosen?.id ?? "",
          disabled: addDisabled,
          "aria-disabled": addDisabled ? "true" : void 0,
          onClick: () => void add(),
          children: busy ? text2.adding : text2.addToCart
        })]
      }), !asRequest && shown?.price != null && totalLabel && u("p", {
        class: "pm-ref-total",
        ...NO_TRANSLATE,
        children: fill(totalLabel, {
          qty,
          amount: formatMoney(shown.price * qty, model.currency, locale)
        })
      }), facts && u("dl", {
        class: "pm-pdp-facts",
        children: [u("div", {
          children: [u("dt", {
            children: text2.shipsFrom
          }), u("dd", {
            children: facts.shipsFrom
          })]
        }), u("div", {
          children: [u("dt", {
            children: text2.soldBy
          }), u("dd", {
            children: facts.soldBy
          })]
        }), u("div", {
          children: [u("dt", {
            children: text2.gstInvoice
          }), u("dd", {
            children: text2.gstWithHsn
          })]
        }), u("div", {
          children: [u("dt", {
            children: text2.payment
          }), u("dd", {
            children: text2.paymentValue
          })]
        })]
      }), panelNote2 && u("p", {
        class: "pm-buybox__note",
        children: panelNote2
      }), u("p", {
        class: "pm-unavailable-note pm-error",
        "data-unavailable-note": true,
        "data-product-id": model.id,
        hidden: !unavailable2,
        children: text2.unavailable
      }), u("p", {
        class: "pm-error",
        role: "alert",
        hidden: !error,
        children: error
      }), u("div", {
        class: "pm-added",
        role: "status",
        "aria-live": "polite",
        children: added && u("section", {
          class: "pm-added__box",
          "aria-label": text2.addedTitle,
          children: [u("h2", {
            class: "pm-added__title",
            children: text2.addedTitle
          }), u("p", {
            children: fill(text2.addedLine, {
              qty: added.qty,
              title: added.title
            })
          }), u("p", {
            children: fill(text2.subtotal, {
              amount: formatMoney(added.subtotal, added.currency, locale)
            })
          }), u(Slot, {
            k: "free_delivery_progress",
            showTo,
            children: u(FreeDeliveryProgress, {
              locale,
              labels: labels.journey,
              currency: added.currency,
              subtotal: added.subtotal,
              threshold: freeDeliveryThreshold,
              switchOn: switches.free_delivery_progress !== false
            })
          }), u("p", {
            class: "pm-added__links",
            children: [u("a", {
              class: "pm-button pm-button--secondary",
              href: localizePath(locale, "/cart"),
              children: text2.viewCart
            }), " ", u("a", {
              class: "pm-button pm-button--primary",
              href: localizePath(locale, "/checkout"),
              children: text2.checkout
            }), " ", u("button", {
              type: "button",
              class: "pm-link",
              onClick: () => setAdded(null),
              children: text2.dismiss
            })]
          })]
        })
      })]
    }), u(StickyBuyBar, {
      locale,
      labels: labels.journey,
      currency: model.currency,
      buyBoxId: BUY_BOX_ID,
      price: shown?.price ?? null,
      onAdd: () => void add(),
      disabled: unavailable2 || busy || soldOut,
      switchOn: switches.sticky_buy_bar !== false && !asRequest
    })]
  });
}
const $$ExperimentSlot = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ExperimentSlot;
  const { component, showTo } = Astro2.props;
  return renderTemplate`${showTo ? renderTemplate`${maybeRenderHead()}<div${addAttribute(component, "data-pm-component")}${addAttribute(showTo, "data-pm-show")}>${renderSlot($$result, $$slots["default"])}</div>` : renderTemplate`${renderSlot($$result, $$slots["default"])}`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/persuasion/ExperimentSlot.astro", void 0);
const SLOTTED_KEYS = ["review_summary", "trust_strip", "review_highlights", "goes_well_with", "popularity_notice", "price_block", "sale_countdown", "low_stock_notice", "dispatch_countdown", "delivery_promise", "free_delivery_progress"];
function experimentSlots(switches, running) {
  const render = {
    ...switches
  };
  const showTo = {};
  for (const e2 of running) {
    const key2 = e2.component;
    if (!key2 || !SLOTTED_KEYS.includes(key2) || key2 in showTo) continue;
    const isOn = switches[key2] !== false;
    render[key2] = true;
    showTo[key2] = isOn ? "control" : "treatment";
  }
  return {
    render,
    showTo
  };
}
function loadExperiments() {
  const files2 = /* @__PURE__ */ Object.assign({
    "../data/experiments.json": __vite_glob_0_0$3
  });
  return normalizeExperiments(Object.values(files2)[0]);
}
function PdpGoesWell({
  locale,
  labels,
  currency,
  self,
  paired,
  switchOn = true,
  errorText
}) {
  const [error, setError] = d("");
  const onAdd = async (id) => {
    const p2 = paired.find((x) => x.id === id);
    if (!p2) return;
    if (!p2.variantId) {
      if (p2.url) location.assign(p2.url);
      return;
    }
    setError("");
    try {
      const cart = await import("./store_XteqTnph.mjs");
      if (!await cart.addItem(p2.id, p2.variantId, 1)) setError(errorText);
    } catch {
      setError(errorText);
    }
  };
  return u("div", {
    children: [u(GoesWellWith, {
      locale,
      labels,
      currency,
      self,
      paired,
      onAdd: (id) => void onAdd(id),
      switchOn
    }), u("p", {
      class: "pm-error",
      role: "alert",
      hidden: !error,
      children: error
    })]
  });
}
const $$BackInStockForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BackInStockForm;
  const { locale, productId, variantIds, liveUrl } = Astro2.props;
  const id = "pm-bis";
  return renderTemplate`${maybeRenderHead()}<div data-pm-bis${addAttribute(productId, "data-product-id")}${addAttribute(JSON.stringify(variantIds), "data-variant-ids")}${addAttribute(liveUrl ?? void 0, "data-live-url")} hidden> ${renderComponent($$result, "RequestSection", $$RequestSection, { "locale": locale, "id": id, "heading": rq(locale, "bis.heading"), "intro": rq(locale, "bis.text") }, { "default": ($$result2) => renderTemplate` <form class="pm-request__form" data-pm-form data-action="back_in_stock" novalidate> <input type="hidden" name="variant_id" value="" data-bis-variant> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-email`, "for")}>${rq(locale, "bis.email")}</label> <input class="pm-input"${addAttribute(`${id}-email`, "id")} name="email" type="email" inputmode="email" maxlength="254" autocomplete="email" required></div> ${renderComponent($$result2, "FormEnd", $$FormEnd, { "locale": locale, "submit": rq(locale, "bis.submit") })} </form> <div class="pm-request__done" data-pm-done hidden></div> ` })} </div>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/BackInStockForm.astro", void 0);
const $$PdpAlerts = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PdpAlerts;
  const { locale, productId, title, variantIds, liveUrl } = Astro2.props;
  const features = buildFeatures();
  return renderTemplate`${maybeRenderHead()}<div class="pm-pdp__extras"> ${renderComponent($$result, "SaveButton", $$SaveButton, { "productId": productId, "title": title, "locale": locale })} </div> ${features.backInStock && variantIds.length > 0 && renderTemplate`${renderComponent($$result, "BackInStockForm", $$BackInStockForm, { "locale": locale, "productId": productId, "variantIds": variantIds, "liveUrl": liveUrl })}`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/PdpAlerts.astro", void 0);
const $$ReviewForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ReviewForm;
  const { locale, productId } = Astro2.props;
  const id = "pm-review-form";
  return renderTemplate`${renderComponent($$result, "RequestSection", $$RequestSection, { "locale": locale, "id": id, "heading": rq(locale, "rev.heading"), "signInPath": localizePath(locale, "/sign-in") }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<p data-pm-signin-note hidden>${rq(locale, "rev.signIn")} <a class="pm-link" data-pm-signin-link${addAttribute(localizePath(locale, "/sign-in"), "href")}>${rq(locale, "rev.signInLink")}</a></p> <form class="pm-request__form" data-pm-form data-action="submit_review"${addAttribute(productId, "data-product-id")} data-needs-session novalidate> <fieldset class="pm-request__rating"> <legend class="pm-label">${rq(locale, "rev.rating")}</legend> ${[5, 4, 3, 2, 1].map((n) => renderTemplate`<label class="pm-request__star"><input type="radio" name="rating"${addAttribute(String(n), "value")} required> ${"★".repeat(n)}<span class="pm-visually-hidden"> ${rq(locale, "rev.star", { n })}</span></label>`)} </fieldset> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-title`, "for")}>${rq(locale, "rev.title")}</label> <input class="pm-input"${addAttribute(`${id}-title`, "id")} name="title" maxlength="120" autocomplete="off"></div> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-body`, "for")}>${rq(locale, "rev.body")}</label> <textarea class="pm-input"${addAttribute(`${id}-body`, "id")} name="body" rows="5" maxlength="4000" required></textarea></div> ${renderComponent($$result2, "FormEnd", $$FormEnd, { "locale": locale, "submit": rq(locale, "rev.submit") })} </form> <div class="pm-request__done" data-pm-done hidden></div> ` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/ReviewForm.astro", void 0);
const $$EnquiryForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$EnquiryForm;
  const { locale, replyHours, productId, idPrefix = "pm-enquiry" } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "RequestSection", $$RequestSection, { "locale": locale, "id": idPrefix, "heading": rq(locale, productId ? "enq.heading" : "enq.headingGeneral") }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<form class="pm-request__form" data-pm-form data-action="submit_enquiry"${addAttribute(productId, "data-product-id")}${addAttribute(String(replyHours), "data-reply-hours")} novalidate> <div class="pm-field"><label class="pm-label"${addAttribute(`${idPrefix}-name`, "for")}>${rq(locale, "enq.name")}</label> <input class="pm-input"${addAttribute(`${idPrefix}-name`, "id")} name="name" maxlength="120" autocomplete="name" required></div> <div class="pm-field"><label class="pm-label"${addAttribute(`${idPrefix}-email`, "for")}>${rq(locale, "enq.email")}</label> <input class="pm-input"${addAttribute(`${idPrefix}-email`, "id")} name="email" type="email" inputmode="email" maxlength="254" autocomplete="email" required></div> <div class="pm-field"><label class="pm-label"${addAttribute(`${idPrefix}-phone`, "for")}>${rq(locale, "enq.phone")}</label> <input class="pm-input"${addAttribute(`${idPrefix}-phone`, "id")} name="phone" type="tel" inputmode="tel" maxlength="30" autocomplete="tel"></div> <div class="pm-field"><label class="pm-label"${addAttribute(`${idPrefix}-message`, "for")}>${rq(locale, "enq.message")}</label> <textarea class="pm-input"${addAttribute(`${idPrefix}-message`, "id")} name="message" rows="4" maxlength="4000" required></textarea></div> ${renderComponent($$result2, "FormEnd", $$FormEnd, { "locale": locale, "submit": rq(locale, "enq.submit") })} </form> <div class="pm-request__done" data-pm-done hidden></div> ` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/EnquiryForm.astro", void 0);
const $$QuotationForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$QuotationForm;
  const { locale, variants, replyHours, id = "pm-quote" } = Astro2.props;
  const options2 = variants.length ? variants : [];
  return renderTemplate`${renderComponent($$result, "RequestSection", $$RequestSection, { "locale": locale, "id": id, "heading": rq(locale, "quote.heading"), "intro": rq(locale, "quote.intro", { hours: replyHours }) }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<form class="pm-request__form" data-pm-form data-action="request_quotation"${addAttribute(String(replyHours), "data-reply-hours")} novalidate> <div data-pm-lines> <div class="pm-request__line" data-pm-line> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-variant-0`, "for")}>${rq(locale, "quote.variant")}</label> <select class="pm-input"${addAttribute(`${id}-variant-0`, "id")} data-line-variant> ${options2.map((v2) => renderTemplate`<option${addAttribute(v2.id, "value")}>${v2.title}</option>`)} </select></div> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-qty-0`, "for")}>${rq(locale, "quote.quantity")}</label> <input class="pm-input"${addAttribute(`${id}-qty-0`, "id")} type="number" min="1" max="9999" value="1" inputmode="numeric" data-line-qty></div> <button type="button" class="pm-link" data-line-remove hidden>${rq(locale, "quote.removeLine")}</button> </div> </div> <button type="button" class="pm-button pm-button--ghost" data-pm-add-line${addAttribute(options2.length < 2, "hidden")}>${rq(locale, "quote.addLine")}</button> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-email`, "for")}>${rq(locale, "quote.email")}</label> <input class="pm-input"${addAttribute(`${id}-email`, "id")} name="email" type="email" inputmode="email" maxlength="254" autocomplete="email" required></div> <div class="pm-field"><label class="pm-label"${addAttribute(`${id}-note`, "for")}>${rq(locale, "quote.note")}</label> <textarea class="pm-input"${addAttribute(`${id}-note`, "id")} name="note" rows="3" maxlength="2000"></textarea></div> ${renderComponent($$result2, "FormEnd", $$FormEnd, { "locale": locale, "submit": rq(locale, "quote.submit") })} </form> <div class="pm-request__done" data-pm-done hidden></div> ` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/QuotationForm.astro", void 0);
const $$PdpRequests = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PdpRequests;
  const { locale, productId, variants } = Astro2.props;
  const f2 = buildFeatures();
  return renderTemplate`${f2.reviews && renderTemplate`${renderComponent($$result, "ReviewForm", $$ReviewForm, { "locale": locale, "productId": productId })}`}${f2.enquiries && renderTemplate`${renderComponent($$result, "EnquiryForm", $$EnquiryForm, { "locale": locale, "productId": productId, "replyHours": f2.replyHours })}`}${f2.quotations && variants.length > 0 && renderTemplate`${renderComponent($$result, "QuotationForm", $$QuotationForm, { "locale": locale, "variants": variants, "replyHours": f2.replyHours })}`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/requests/PdpRequests.astro", void 0);
const KEYS$2 = ["onRequest", "onRequestHint", "yourPrice", "srCurrent", "srPrior", "inclTax", "saving", "savingAmountOnly", "explainControl", "priorExplain", "mrp", "unitPrice", "tiersCaption", "tierQuantity", "tierPrice", "tierSaving", "noSaving", "cartConfirms"];
function priceBlockLabels(locale) {
  return Object.fromEntries(KEYS$2.map((k2) => [k2, t(locale, `price.${k2}`)]));
}
const KEYS$1 = ["rating", "ratingCount", "highlightsTitle", "highlightPositive", "highlightCritical", "highlightBy", "popularity", "lowStock", "trustLabel", "securePayment", "cod", "returns", "gstInvoice", "origin"];
const socialLabels = (locale) => Object.fromEntries(KEYS$1.map((k2) => [k2, t(locale, `social.${k2}`)]));
const KEYS = ["freeProgress", "freeReached", "savings", "goesWellTitle", "bundleTitle", "bundleTotal", "bundleSave", "bundleAdd", "add", "recentTitle", "recentClear", "firstOrderTitle", "firstOrderClose", "progressLabel", "stepDone", "stepCurrent", "stickyAdd"];
const journeyLabels = (locale) => Object.fromEntries(KEYS.map((k2) => [k2, t(locale, `journey.${k2}`)]));
const visitStore$1 = "Visit the Plusmark Store";
const series$1 = "Series";
const purchaseOptions$1 = "Purchase options";
const buyNow$1 = "Buy now";
const breadcrumbs$1 = "Breadcrumbs";
const home$1 = "Home";
const galleryLabel$1 = "Product images";
const position$1 = "{index} of {total}";
const prev$1 = "Previous image";
const next$1 = "Next image";
const open$1 = "View full size";
const close$1 = "Close";
const zoomIn$1 = "Zoom in";
const zoomOut$1 = "Zoom out";
const showImage$1 = "Show image {index}";
const noImage$1 = "No image";
const from$1 = "From";
const chooseOption$1 = "Choose {option}";
const missingOption$1 = "Choose {option} before you add this to your Cart.";
const outOfStockValue$1 = "{value}, out of stock";
const optionSelected$1 = "{option}: {value}";
const sku$1 = "SKU";
const inStock$1 = "In stock";
const outOfStock$1 = "Out of stock";
const backorder$1 = "Available on backorder";
const quantity$1 = "Quantity";
const decrease$1 = "Decrease quantity";
const increase$1 = "Increase quantity";
const addToCart$1 = "Add to Cart";
const adding$1 = "Adding…";
const unavailable$1 = "This product is not available any more.";
const addError$1 = "We could not add this to your Cart. Try again.";
const addedTitle$1 = "Added to your Cart";
const addedLine$1 = "{qty} × {title}";
const subtotal$1 = "Cart subtotal {amount}";
const viewCart$1 = "View Cart";
const checkout$1 = "Checkout";
const dismiss$1 = "Close";
const share$1 = "Share";
const copyLink$1 = "Copy link";
const copied$1 = "Link copied";
const whatsapp$1 = "Share on WhatsApp";
const highlights$1 = "Key highlights";
const details$1 = "Product details";
const description$1 = "Description";
const specifications$1 = "Specifications";
const offers$1 = "Offers";
const offerCode$1 = "Code {code}";
const offerAutomatic$1 = "Applied automatically";
const offerConditions$1 = "Conditions";
const offerPercent$1 = "{value}% off";
const offerAmount$1 = "{amount} off";
const deliveryRules$1 = "Delivery charges";
const freeDeliveryAbove$1 = "Free delivery on orders of {amount} or more.";
const codFee$1 = "Cash on Delivery fee: {amount}.";
const codFree$1 = "No fee for Cash on Delivery.";
const reviews$1 = "Customer reviews";
const reviewsCount$1 = "Based on {count} reviews";
const distribution$1 = "Rating breakdown";
const starsRow$1 = "{stars} stars: {count}";
const sortBy$1 = "Sort reviews";
const sortNewest$1 = "Newest";
const sortHighest$1 = "Highest rating";
const sortLowest$1 = "Lowest rating";
const filterBy$1 = "Show";
const allRatings$1 = "All ratings";
const starsOption$1 = "{stars} stars";
const verified$1 = "Verified purchase";
const noMatch$1 = "No reviews match this filter.";
const reviewBy$1 = "By {name}";
const stickyLabel$1 = "Buy bar";
const railTitle$1 = "More to explore";
const yes$1 = "Yes";
const no$1 = "No";
const block_net_quantity$1 = "Net quantity";
const block_best_before$1 = "Dates";
const block_ingredients$1 = "Ingredients";
const block_suitability$1 = "Suitable for";
const block_how_to_use$1 = "How to use";
const block_key_specifications$1 = "Key specifications";
const block_warranty$1 = "Warranty";
const block_comparison$1 = "Compare";
const block_size_guide$1 = "Size guide";
const block_fit_notes$1 = "Fit and care";
const block_dimensions$1 = "Dimensions and weight";
const block_materials$1 = "Materials";
const block_assembly$1 = "Assembly";
const block_quantity_tiers$1 = "Bulk prices";
const block_minimum_order_quantity$1 = "Minimum order";
const block_quotation_request$1 = "Request a quotation";
const block_metal$1 = "Metal";
const block_purity$1 = "Purity";
const block_weight$1 = "Weight";
const block_certification$1 = "Certification";
const tierQuantity$1 = "Quantity";
const tierPrice$1 = "Price each";
const tierFrom$1 = "{qty} or more";
const compareAttribute$1 = "Specification";
const compareThis$1 = "{title} (this product)";
const quoteBody$1 = "This product has no listed price. Ask for a quotation or send an enquiry.";
const quoteCta$1 = "Request a quotation";
const enquiryCta$1 = "Send an enquiry";
const buyAgainTitle$1 = "Buy again";
const buyAgainSignIn$1 = "Sign in to see the products you ordered before.";
const stepperQty$1 = "Quantity of {title} in your Cart";
const stepperInc$1 = "Increase quantity of {title}";
const stepperDec$1 = "Decrease quantity of {title}";
const serviceInfo$1 = "Service information";
const serviceDispatch$1 = "Pan-India dispatch";
const servicePickup$1 = "Free Ahmedabad pickup";
const serviceGst$1 = "GST invoice with HSN";
const serviceSingle$1 = "Order a single board";
const serviceBulk$1 = "Bulk pricing on request";
const serviceSupport$1 = "Order desk support";
const offerCount$1 = "{count} offer";
const offerGstTitle$1 = "GST invoice";
const offerGstBody$1 = "Every order carries a GST invoice with the HSN code, so a business can claim input tax credit.";
const offerBulkTitle$1 = "Bulk pricing";
const offerBulkBody$1 = "Ordering several boards for a school, office or site? Ask the order desk for a bulk rate.";
const offerCustomTitle$1 = "Made to order";
const offerCustomBody$1 = "Non-standard sizes and layouts are manufactured once the specification and price are confirmed.";
const quoteCardBody$1 = "Request a quote for your size and quantity.";
const shipsFrom$1 = "Ships from";
const shipsFromValue$1 = "Plusmark, Ahmedabad";
const soldBy$1 = "Sold by";
const soldByValue$1 = "Plusmark Boards";
const gstInvoice$1 = "GST invoice";
const gstWithHsn$1 = "With HSN";
const payment$1 = "Payment";
const paymentValue$1 = "Online payment or order-desk invoice";
const totalFor$1 = "Total for {qty}: {amount}";
const panelNote$1 = "The order desk confirms the exact price, stock and GST for the size and quantity before dispatch.";
const askAbout$1 = "Ask about this board";
const en = {
  visitStore: visitStore$1,
  series: series$1,
  purchaseOptions: purchaseOptions$1,
  buyNow: buyNow$1,
  breadcrumbs: breadcrumbs$1,
  home: home$1,
  galleryLabel: galleryLabel$1,
  position: position$1,
  prev: prev$1,
  next: next$1,
  open: open$1,
  close: close$1,
  zoomIn: zoomIn$1,
  zoomOut: zoomOut$1,
  showImage: showImage$1,
  noImage: noImage$1,
  from: from$1,
  chooseOption: chooseOption$1,
  missingOption: missingOption$1,
  outOfStockValue: outOfStockValue$1,
  optionSelected: optionSelected$1,
  sku: sku$1,
  inStock: inStock$1,
  outOfStock: outOfStock$1,
  backorder: backorder$1,
  quantity: quantity$1,
  decrease: decrease$1,
  increase: increase$1,
  addToCart: addToCart$1,
  adding: adding$1,
  unavailable: unavailable$1,
  addError: addError$1,
  addedTitle: addedTitle$1,
  addedLine: addedLine$1,
  subtotal: subtotal$1,
  viewCart: viewCart$1,
  checkout: checkout$1,
  dismiss: dismiss$1,
  share: share$1,
  copyLink: copyLink$1,
  copied: copied$1,
  whatsapp: whatsapp$1,
  highlights: highlights$1,
  details: details$1,
  description: description$1,
  specifications: specifications$1,
  offers: offers$1,
  offerCode: offerCode$1,
  offerAutomatic: offerAutomatic$1,
  offerConditions: offerConditions$1,
  offerPercent: offerPercent$1,
  offerAmount: offerAmount$1,
  deliveryRules: deliveryRules$1,
  freeDeliveryAbove: freeDeliveryAbove$1,
  codFee: codFee$1,
  codFree: codFree$1,
  reviews: reviews$1,
  reviewsCount: reviewsCount$1,
  distribution: distribution$1,
  starsRow: starsRow$1,
  sortBy: sortBy$1,
  sortNewest: sortNewest$1,
  sortHighest: sortHighest$1,
  sortLowest: sortLowest$1,
  filterBy: filterBy$1,
  allRatings: allRatings$1,
  starsOption: starsOption$1,
  verified: verified$1,
  noMatch: noMatch$1,
  reviewBy: reviewBy$1,
  stickyLabel: stickyLabel$1,
  railTitle: railTitle$1,
  yes: yes$1,
  no: no$1,
  block_net_quantity: block_net_quantity$1,
  block_best_before: block_best_before$1,
  block_ingredients: block_ingredients$1,
  block_suitability: block_suitability$1,
  block_how_to_use: block_how_to_use$1,
  block_key_specifications: block_key_specifications$1,
  block_warranty: block_warranty$1,
  block_comparison: block_comparison$1,
  block_size_guide: block_size_guide$1,
  block_fit_notes: block_fit_notes$1,
  block_dimensions: block_dimensions$1,
  block_materials: block_materials$1,
  block_assembly: block_assembly$1,
  block_quantity_tiers: block_quantity_tiers$1,
  block_minimum_order_quantity: block_minimum_order_quantity$1,
  block_quotation_request: block_quotation_request$1,
  block_metal: block_metal$1,
  block_purity: block_purity$1,
  block_weight: block_weight$1,
  block_certification: block_certification$1,
  tierQuantity: tierQuantity$1,
  tierPrice: tierPrice$1,
  tierFrom: tierFrom$1,
  compareAttribute: compareAttribute$1,
  compareThis: compareThis$1,
  quoteBody: quoteBody$1,
  quoteCta: quoteCta$1,
  enquiryCta: enquiryCta$1,
  buyAgainTitle: buyAgainTitle$1,
  buyAgainSignIn: buyAgainSignIn$1,
  stepperQty: stepperQty$1,
  stepperInc: stepperInc$1,
  stepperDec: stepperDec$1,
  serviceInfo: serviceInfo$1,
  serviceDispatch: serviceDispatch$1,
  servicePickup: servicePickup$1,
  serviceGst: serviceGst$1,
  serviceSingle: serviceSingle$1,
  serviceBulk: serviceBulk$1,
  serviceSupport: serviceSupport$1,
  offerCount: offerCount$1,
  offerGstTitle: offerGstTitle$1,
  offerGstBody: offerGstBody$1,
  offerBulkTitle: offerBulkTitle$1,
  offerBulkBody: offerBulkBody$1,
  offerCustomTitle: offerCustomTitle$1,
  offerCustomBody: offerCustomBody$1,
  quoteCardBody: quoteCardBody$1,
  shipsFrom: shipsFrom$1,
  shipsFromValue: shipsFromValue$1,
  soldBy: soldBy$1,
  soldByValue: soldByValue$1,
  gstInvoice: gstInvoice$1,
  gstWithHsn: gstWithHsn$1,
  payment: payment$1,
  paymentValue: paymentValue$1,
  totalFor: totalFor$1,
  panelNote: panelNote$1,
  askAbout: askAbout$1
};
const visitStore = "प्लसमार्क स्टोर देखें";
const series = "श्रेणी";
const purchaseOptions = "खरीद के विकल्प";
const buyNow = "अभी खरीदें";
const breadcrumbs = "ब्रेडक्रंब";
const home = "होम";
const galleryLabel = "उत्पाद की तस्वीरें";
const position = "{total} में से {index}";
const prev = "पिछली तस्वीर";
const next = "अगली तस्वीर";
const open = "पूरे आकार में देखें";
const close = "बंद करें";
const zoomIn = "ज़ूम बढ़ाएँ";
const zoomOut = "ज़ूम घटाएँ";
const showImage = "तस्वीर {index} दिखाएँ";
const noImage = "कोई तस्वीर नहीं";
const from = "शुरू";
const chooseOption = "{option} चुनें";
const missingOption = "कार्ट में जोड़ने से पहले {option} चुनें।";
const outOfStockValue = "{value}, स्टॉक में नहीं";
const optionSelected = "{option}: {value}";
const sku = "SKU";
const inStock = "स्टॉक में है";
const outOfStock = "स्टॉक में नहीं";
const backorder = "बैकऑर्डर पर उपलब्ध";
const quantity = "मात्रा";
const decrease = "मात्रा घटाएँ";
const increase = "मात्रा बढ़ाएँ";
const addToCart = "कार्ट में जोड़ें";
const adding = "जोड़ रहे हैं…";
const unavailable = "यह उत्पाद अब उपलब्ध नहीं है।";
const addError = "इसे आपके कार्ट में नहीं जोड़ा जा सका। फिर कोशिश करें।";
const addedTitle = "आपके कार्ट में जोड़ा गया";
const addedLine = "{qty} × {title}";
const subtotal = "कार्ट का उप-योग {amount}";
const viewCart = "कार्ट देखें";
const checkout = "चेकआउट";
const dismiss = "बंद करें";
const share = "साझा करें";
const copyLink = "लिंक कॉपी करें";
const copied = "लिंक कॉपी हो गया";
const whatsapp = "WhatsApp पर साझा करें";
const highlights = "मुख्य विशेषताएँ";
const details = "उत्पाद का विवरण";
const description = "विवरण";
const specifications = "विनिर्देश";
const offers = "ऑफ़र";
const offerCode = "कोड {code}";
const offerAutomatic = "अपने आप लागू होता है";
const offerConditions = "शर्तें";
const offerPercent = "{value}% की छूट";
const offerAmount = "{amount} की छूट";
const deliveryRules = "डिलीवरी शुल्क";
const freeDeliveryAbove = "{amount} या उससे अधिक के ऑर्डर पर डिलीवरी मुफ़्त।";
const codFee = "कैश ऑन डिलीवरी शुल्क: {amount}।";
const codFree = "कैश ऑन डिलीवरी पर कोई शुल्क नहीं।";
const reviews = "ग्राहकों की समीक्षाएँ";
const reviewsCount = "{count} समीक्षाओं के आधार पर";
const distribution = "रेटिंग का विवरण";
const starsRow = "{stars} स्टार: {count}";
const sortBy = "समीक्षाएँ क्रमबद्ध करें";
const sortNewest = "सबसे नई";
const sortHighest = "सबसे ऊँची रेटिंग";
const sortLowest = "सबसे कम रेटिंग";
const filterBy = "दिखाएँ";
const allRatings = "सभी रेटिंग";
const starsOption = "{stars} स्टार";
const verified = "सत्यापित खरीद";
const noMatch = "इस फ़िल्टर से कोई समीक्षा मेल नहीं खाती।";
const reviewBy = "{name} द्वारा";
const stickyLabel = "खरीद बार";
const railTitle = "और देखें";
const yes = "हाँ";
const no = "नहीं";
const block_net_quantity = "शुद्ध मात्रा";
const block_best_before = "तारीख़ें";
const block_ingredients = "सामग्री";
const block_suitability = "किनके लिए उपयुक्त";
const block_how_to_use = "इस्तेमाल कैसे करें";
const block_key_specifications = "मुख्य विनिर्देश";
const block_warranty = "वारंटी";
const block_comparison = "तुलना करें";
const block_size_guide = "साइज़ गाइड";
const block_fit_notes = "फ़िट और देखभाल";
const block_dimensions = "आकार और वज़न";
const block_materials = "सामग्री";
const block_assembly = "असेंबली";
const block_quantity_tiers = "थोक कीमतें";
const block_minimum_order_quantity = "न्यूनतम ऑर्डर";
const block_quotation_request = "कोटेशन माँगें";
const block_metal = "धातु";
const block_purity = "शुद्धता";
const block_weight = "वज़न";
const block_certification = "प्रमाणन";
const tierQuantity = "मात्रा";
const tierPrice = "प्रति नग कीमत";
const tierFrom = "{qty} या अधिक";
const compareAttribute = "विनिर्देश";
const compareThis = "{title} (यह उत्पाद)";
const quoteBody = "इस उत्पाद की कीमत सूचीबद्ध नहीं है। कोटेशन माँगें या पूछताछ भेजें।";
const quoteCta = "कोटेशन माँगें";
const enquiryCta = "पूछताछ भेजें";
const buyAgainTitle = "फिर से खरीदें";
const buyAgainSignIn = "पहले ऑर्डर किए उत्पाद देखने के लिए साइन इन करें।";
const stepperQty = "आपके कार्ट में {title} की मात्रा";
const stepperInc = "{title} की मात्रा बढ़ाएँ";
const stepperDec = "{title} की मात्रा घटाएँ";
const serviceInfo = "सेवा जानकारी";
const serviceDispatch = "पूरे भारत में डिस्पैच";
const servicePickup = "अहमदाबाद से मुफ़्त पिकअप";
const serviceGst = "HSN के साथ GST बिल";
const serviceSingle = "एक बोर्ड भी ऑर्डर करें";
const serviceBulk = "माँग पर थोक दर";
const serviceSupport = "ऑर्डर डेस्क सहायता";
const offerCount = "{count} ऑफ़र";
const offerGstTitle = "GST बिल";
const offerGstBody = "हर ऑर्डर के साथ HSN कोड वाला GST बिल मिलता है, जिससे व्यवसाय इनपुट टैक्स क्रेडिट ले सकता है।";
const offerBulkTitle = "थोक दर";
const offerBulkBody = "स्कूल, ऑफ़िस या साइट के लिए कई बोर्ड चाहिए? ऑर्डर डेस्क से थोक दर पूछें।";
const offerCustomTitle = "माँग पर निर्माण";
const offerCustomBody = "मानक से अलग साइज़ और लेआउट ब्यौरा और दाम तय होने के बाद बनाए जाते हैं।";
const quoteCardBody = "अपने साइज़ और मात्रा के लिए कोटेशन माँगें।";
const shipsFrom = "यहाँ से भेजा जाता है";
const shipsFromValue = "प्लस मार्क, अहमदाबाद";
const soldBy = "विक्रेता";
const soldByValue = "प्लस मार्क बोर्ड्स";
const gstInvoice = "GST बिल";
const gstWithHsn = "HSN के साथ";
const payment = "भुगतान";
const paymentValue = "ऑनलाइन भुगतान या ऑर्डर डेस्क इनवॉइस";
const totalFor = "{qty} के लिए कुल: {amount}";
const panelNote = "डिस्पैच से पहले ऑर्डर डेस्क साइज़ और मात्रा के लिए सही दाम, स्टॉक और GST की पुष्टि करता है।";
const askAbout = "इस बोर्ड के बारे में पूछें";
const hi = {
  visitStore,
  series,
  purchaseOptions,
  buyNow,
  breadcrumbs,
  home,
  galleryLabel,
  position,
  prev,
  next,
  open,
  close,
  zoomIn,
  zoomOut,
  showImage,
  noImage,
  from,
  chooseOption,
  missingOption,
  outOfStockValue,
  optionSelected,
  sku,
  inStock,
  outOfStock,
  backorder,
  quantity,
  decrease,
  increase,
  addToCart,
  adding,
  unavailable,
  addError,
  addedTitle,
  addedLine,
  subtotal,
  viewCart,
  checkout,
  dismiss,
  share,
  copyLink,
  copied,
  whatsapp,
  highlights,
  details,
  description,
  specifications,
  offers,
  offerCode,
  offerAutomatic,
  offerConditions,
  offerPercent,
  offerAmount,
  deliveryRules,
  freeDeliveryAbove,
  codFee,
  codFree,
  reviews,
  reviewsCount,
  distribution,
  starsRow,
  sortBy,
  sortNewest,
  sortHighest,
  sortLowest,
  filterBy,
  allRatings,
  starsOption,
  verified,
  noMatch,
  reviewBy,
  stickyLabel,
  railTitle,
  yes,
  no,
  block_net_quantity,
  block_best_before,
  block_ingredients,
  block_suitability,
  block_how_to_use,
  block_key_specifications,
  block_warranty,
  block_comparison,
  block_size_guide,
  block_fit_notes,
  block_dimensions,
  block_materials,
  block_assembly,
  block_quantity_tiers,
  block_minimum_order_quantity,
  block_quotation_request,
  block_metal,
  block_purity,
  block_weight,
  block_certification,
  tierQuantity,
  tierPrice,
  tierFrom,
  compareAttribute,
  compareThis,
  quoteBody,
  quoteCta,
  enquiryCta,
  buyAgainTitle,
  buyAgainSignIn,
  stepperQty,
  stepperInc,
  stepperDec,
  serviceInfo,
  serviceDispatch,
  servicePickup,
  serviceGst,
  serviceSingle,
  serviceBulk,
  serviceSupport,
  offerCount,
  offerGstTitle,
  offerGstBody,
  offerBulkTitle,
  offerBulkBody,
  offerCustomTitle,
  offerCustomBody,
  quoteCardBody,
  shipsFrom,
  shipsFromValue,
  soldBy,
  soldByValue,
  gstInvoice,
  gstWithHsn,
  payment,
  paymentValue,
  totalFor,
  panelNote,
  askAbout
};
const DICT = {
  en,
  hi
};
const pdpText = (locale) => ({
  ...en,
  ...DICT[locale]
});
const pt = (locale, key2, params) => interpolate(pdpText(locale)[key2], params);
const DEFAULT_BLOCKS = ["description", "specifications"];
const OWN_RENDER = /* @__PURE__ */ new Set(["description", "specifications", "unit_price"]);
const NEVER_IN_SPECS = /* @__PURE__ */ new Set(["key_highlights", "return_days", "country_of_origin", "manufacturer", "importer", "generic_name", "consumer_care", "price_on_request"]);
const COMPARE_BLOCK = "key_specifications";
const MAX_COMPARED = 2;
const BLOCK_ATTRS = {};
for (const preset of Object.values(PRESETS)) {
  for (const a2 of preset.attributes) {
    if (a2.block === "declarations") continue;
    const list = BLOCK_ATTRS[a2.block] ??= [];
    if (!list.some((x) => x.key === a2.key)) list.push({
      key: a2.key,
      unit: a2.unit,
      block: a2.block
    });
  }
}
const attributesOfBlock = (block) => (BLOCK_ATTRS[block] ?? []).map((a2) => a2.key);
const text = (v2) => typeof v2 === "string" || typeof v2 === "number" ? String(v2).trim() : "";
const isTrue = (v2) => v2 === true || typeof v2 === "string" && v2.trim().toLowerCase() === "true";
const isBool = (v2) => typeof v2 === "boolean" || v2 === "true" || v2 === "false";
const attrOf = (m2, key2) => m2.attributes.find((a2) => a2.key === key2)?.value;
function isPriceOnRequest(m2) {
  if (isTrue(attrOf(m2, "price_on_request"))) return true;
  return m2.variants.length > 0 && m2.variants.every((v2) => v2.price === null);
}
const singleUnit = (u2) => u2 && !u2.includes("|") ? u2 : "";
function rowsOf(m2, block, formatDate2) {
  const rows = [];
  for (const def of BLOCK_ATTRS[block] ?? []) {
    const raw = attrOf(m2, def.key);
    if (raw === void 0 || raw === null) continue;
    if (isBool(raw)) {
      rows.push({
        key: def.key,
        value: isTrue(raw) ? "true" : "false",
        boolean: true
      });
      continue;
    }
    let value = text(raw);
    if (!value) continue;
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) value = formatDate2(value);
    const unit = singleUnit(def.unit);
    rows.push({
      key: def.key,
      value: unit && /^\d/.test(value) ? `${value} ${unit}` : value
    });
  }
  return rows;
}
const firstVariant = (m2) => m2.variants.find((v2) => v2.price !== null) ?? m2.variants[0] ?? null;
function compareView(ctx) {
  const others = (ctx.model.pairings.comparison ?? []).map((h2) => ctx.byHandle.get(h2)).filter((p2) => !!p2 && p2.id !== ctx.model.id).slice(0, MAX_COMPARED);
  if (others.length === 0) return null;
  const products2 = [ctx.model, ...others];
  const rows = attributesOfBlock(COMPARE_BLOCK).map((key2) => ({
    key: key2,
    values: products2.map((p2) => text(attrOf(p2, key2)))
  })).filter((r2) => r2.values.some((v2) => v2 !== ""));
  if (rows.length === 0) return null;
  return {
    kind: "compare",
    head: products2.map((p2) => p2.title),
    rows
  };
}
function blockView(block, ctx) {
  if (OWN_RENDER.has(block)) return null;
  const m2 = ctx.model;
  if (block === "comparison") return compareView(ctx);
  if (block === "quotation_request") return ctx.priceOnRequest ? {
    kind: "quote"
  } : null;
  if (block === "quantity_tiers") {
    const v2 = firstVariant(m2);
    const tiers = v2?.tiers ?? [];
    const rows2 = rowsOf(m2, block, ctx.formatDate);
    return tiers.length > 0 || rows2.length > 0 ? {
      kind: "tiers",
      tiers,
      rows: rows2
    } : null;
  }
  if (block === "net_quantity") {
    const rows2 = rowsOf(m2, block, ctx.formatDate);
    const v2 = firstVariant(m2);
    if (rows2.length === 0 && v2?.netQuantity != null) rows2.push({
      key: "net_quantity",
      value: `${v2.netQuantity}${v2.netQuantityUnit ? ` ${v2.netQuantityUnit}` : ""}`
    });
    return rows2.length > 0 ? {
      kind: "rows",
      rows: rows2
    } : null;
  }
  const rows = rowsOf(m2, block, ctx.formatDate);
  return rows.length > 0 ? {
    kind: "rows",
    rows
  } : null;
}
function claimedAttributes(blocks) {
  const claimed = /* @__PURE__ */ new Set();
  for (const b of blocks) if (b !== "specifications") attributesOfBlock(b).forEach((k2) => claimed.add(k2));
  NEVER_IN_SPECS.forEach((k2) => claimed.add(k2));
  return claimed;
}
const blocksToShow = (blocks) => blocks.length > 0 ? [...blocks] : [...DEFAULT_BLOCKS];
const $$PdpPage = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PdpPage;
  const { locale, product, catalog, categories: categories2, settings, offers: offers2, rules, currency, regionId, reviews: reviews2, badgePriority = [], requireUnitPrice = false, pdpBlocks = [] } = Astro2.props;
  const model = parsePdpProduct(product, currency);
  const text2 = pdpText(locale);
  const switches = componentSwitches(settings);
  const slots = experimentSlots(switches, loadExperiments());
  const on = (k2) => slots.render[k2] !== false;
  const liveUrl = buildLiveUrl({ ids: [model.id], region: regionId, currency: currency.toLowerCase() });
  const num2 = (x) => typeof x === "number" && Number.isFinite(x) ? x : null;
  const images = model.images.map((i2, n) => ({
    id: i2.id || `img-${n}`,
    hash: "",
    width: 800,
    height: 800,
    originalUrl: i2.url,
    alt: n === 0 ? model.title : `${model.title} ${n + 1}`
  }));
  const firstCat = model.categories[0];
  const chain = firstCat ? categoryChain(categories2, firstCat.id) : [];
  const crumbs = [
    { label: t(locale, "plp.home"), href: localizePath(locale, "/") },
    ...chain.map((c2) => ({ label: c2.name, href: localizePath(locale, `/shop/${categoryPath(categories2, c2.id)}`) })),
    { label: model.title, href: "" }
  ];
  const soleVariantId = model.variants.length === 1 ? model.variants[0].id : null;
  const declarationProduct = {
    attributes: model.attributes,
    declarations: product.declarations ?? {}
  };
  const sellerDetails = settings["storefront.seller_details"] ?? {};
  const sellerText = (key2) => typeof sellerDetails[key2] === "string" ? String(sellerDetails[key2]).trim() : "";
  const returnDays = Number(model.attributes.find((a2) => a2.key === "return_days")?.value);
  const trust = {
    returnDays: Number.isInteger(returnDays) && returnDays > 0 ? returnDays : null,
    gstInvoice: sellerText("gstin") !== "" ? true : void 0,
    origin: model.originCountry || null
  };
  const facts = {
    shipsFrom: sellerText("registered_address") ? `${text2.soldBy}: ${sellerText("registered_address")}` : text2.shipsFromValue,
    soldBy: sellerText("legal_name") || text2.soldByValue
  };
  const offerRows = offersFor(offers2, (type, value, cur) => type === "percentage" ? pt(locale, "offerPercent", { value }) : pt(locale, "offerAmount", { amount: formatMoney(value, cur, locale) }));
  const STANDING_OFFERS = [
    { title: text2.offerGstTitle, body: text2.offerGstBody },
    { title: text2.offerBulkTitle, body: text2.offerBulkBody },
    { title: text2.offerCustomTitle, body: text2.offerCustomBody }
  ];
  const SERVICES = [
    { icon: "truck", label: text2.serviceDispatch },
    { icon: "pin", label: text2.servicePickup },
    { icon: "invoice", label: text2.serviceGst },
    { icon: "cart", label: text2.serviceSingle },
    { icon: "medal", label: text2.serviceBulk },
    { icon: "phone", label: text2.serviceSupport }
  ];
  const highlights2 = model.keyHighlights.slice(0, 5);
  const HIDDEN_ATTRS = /* @__PURE__ */ new Set(["key_highlights", "return_days", "country_of_origin", "manufacturer", "importer", "generic_name", "consumer_care"]);
  const specText = (v2) => typeof v2 === "string" || typeof v2 === "number" || typeof v2 === "boolean" ? String(v2).trim() : "";
  const claimed = pdpBlocks.length > 0 ? claimedAttributes(pdpBlocks) : /* @__PURE__ */ new Set();
  const storyKey = /^product_story_(\d+)$/;
  const storyPhotos = model.attributes.filter((a2) => storyKey.test(a2.key) && typeof a2.value === "string" && a2.value.startsWith("https://res.cloudinary.com/")).sort((a2, b) => Number(a2.key.slice(14)) - Number(b.key.slice(14)));
  const specs = model.attributes.map((a2) => ({ key: a2.key, value: specText(a2.value) })).filter((a2) => a2.value && !storyKey.test(a2.key) && !HIDDEN_ATTRS.has(a2.key) && !claimed.has(a2.key));
  const descriptionHtml = model.description ? sanitizeHtml(model.description) : "";
  const priceOnRequest = pdpBlocks.includes("quotation_request") && isPriceOnRequest(model);
  const compared = /* @__PURE__ */ new Map();
  for (const h2 of model.pairings.comparison ?? []) {
    const raw = catalog.find((p2) => p2.handle === h2);
    const parsed = raw ? parsePdpProduct(raw, currency) : null;
    if (parsed) compared.set(h2, parsed);
  }
  const blockCtx = { model, byHandle: compared, formatDate: (iso) => formatDate(iso, locale), priceOnRequest };
  const blockList = blocksToShow(pdpBlocks);
  const presetBlocks = /* @__PURE__ */ new Map();
  for (const key2 of blockList) {
    const view = blockView(key2, blockCtx);
    if (view) presetBlocks.set(key2, view);
  }
  const blockTitle = (key2) => text2[`block_${key2}`] ?? key2.replace(/[_-]+/g, " ");
  const rowLabel = (key2) => /^size_\d/.test(key2) ? key2.slice(5).replace(/(\d)p(?=\d)/g, "$1.").replace(/_x_/g, " × ").replace(/_/g, " ") : key2.replace(/[_-]+/g, " ");
  const rowValue = (r2) => r2.boolean ? r2.value === "true" ? text2.yes : text2.no : r2.value;
  const quoteHref = (kind) => `${localizePath(locale, "/contact")}?${kind}=${encodeURIComponent(model.handle)}#${kind}`;
  const threshold = num2(rules.free_delivery_threshold);
  const cod2 = rules.cod ?? {};
  const codFee2 = num2(cod2.fee);
  const ruleLines = [
    ...threshold && threshold > 0 ? [pt(locale, "freeDeliveryAbove", { amount: formatMoney(threshold, currency, locale) })] : [],
    ...cod2.max_order_amount !== void 0 && codFee2 !== null ? [codFee2 > 0 ? pt(locale, "codFee", { amount: formatMoney(codFee2, currency, locale) }) : pt(locale, "codFree")] : []
  ];
  const reviewList = sortReviews(parsePdpReviews(reviews2.reviews), "newest");
  const dist = ratingDistribution(reviewList);
  const reviewSummaryEvidence = model.rating ? { count: model.rating.count, average: model.rating.average } : null;
  const byHandle = new Map(catalog.map((p2) => [String(p2.handle), p2]));
  const pairedProducts2 = (model.pairings.goes_well_with ?? []).map((h2) => byHandle.get(h2)).filter((p2) => !!p2).map((p2) => cardOf(p2, { badgePriority, now: 0 })).filter((c2) => c2 !== null).map((c2) => ({ id: c2.id, title: c2.title, price: c2.price ?? 0, available: c2.price !== null, url: productPath(c2.handle, locale), variantId: c2.singleVariantId }));
  const showPaired = on("goes_well_with") && pairedProducts2.length >= 2;
  const pairedIds = new Set(pairedProducts2.map((p2) => p2.id));
  const related = catalog.filter((p2) => p2.id !== model.id && !pairedIds.has(String(p2.id)) && Array.isArray(p2.categories) && p2.categories.some((c2) => model.categories.some((m2) => m2.id === c2.id))).slice(0, 4).map((p2) => cardOf(p2, { badgePriority, now: 0 })).filter((c2) => c2 !== null);
  const labels = cardLabels(locale);
  const slim = { ...model, description: "", images: [], attributes: [], pairings: {}, keyHighlights: [], categories: [] };
  const stickyOn = on("sticky_buy_bar");
  return renderTemplate`${renderComponent($$result, "Container", $$Container, { "class": "pm-product-shell" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="pm-pdp" data-pdp${addAttribute(model.handle, "data-handle")}${addAttribute(model.id, "data-product-id")}${addAttribute(stickyOn ? "" : void 0, "data-sticky")}> <nav${addAttribute(text2.breadcrumbs, "aria-label")} class="pm-breadcrumbs"> <ol> ${crumbs.map((b, i2) => renderTemplate`<li>${i2 < crumbs.length - 1 ? renderTemplate`<a${addAttribute(b.href, "href")}>${b.label}</a>` : renderTemplate`<span aria-current="page">${b.label}</span>`}</li>`)} </ol> </nav> <div class="pm-pdp__top"> <section class="pm-gallery" aria-roledescription="carousel"${addAttribute(text2.galleryLabel, "aria-label")} data-gallery${addAttribute(text2.position, "data-position-text")}> ${images.length > 0 ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <ul class="pm-gallery__track" data-gallery-track tabindex="0"> ${images.map((img, i2) => renderTemplate`<li class="pm-gallery__slide"${addAttribute(img.originalUrl, "data-full")}${addAttribute(img.alt, "data-alt")} aria-roledescription="slide"${addAttribute(pt(locale, "position", { index: i2 + 1, total: images.length }), "aria-label")}> ${renderComponent($$result3, "Picture", $$Picture, { "image": img, "slot": "gallery", "priority": i2 === 0, "class": "pm-gallery__img" })} </li>`)} </ul> <button type="button" class="pm-gallery__btn pm-gallery__btn--prev" data-gallery-prev${addAttribute(text2.prev, "aria-label")}${addAttribute(images.length < 2, "hidden")}>‹</button> <button type="button" class="pm-gallery__btn pm-gallery__btn--next" data-gallery-next${addAttribute(text2.next, "aria-label")}${addAttribute(images.length < 2, "hidden")}>›</button> <p class="pm-gallery__pos" data-gallery-pos aria-live="polite">${pt(locale, "position", { index: 1, total: images.length })}</p> <button type="button" class="pm-gallery__open" data-gallery-open>${text2.open}</button> ${images.length > 1 && renderTemplate`<ul class="pm-gallery__thumbs"> ${images.map((img, i2) => renderTemplate`<li><button type="button" class="pm-gallery__thumb"${addAttribute(i2, "data-gallery-thumb")}${addAttribute(pt(locale, "showImage", { index: i2 + 1 }), "aria-label")}${addAttribute(i2 === 0 ? "true" : void 0, "aria-current")}><img${addAttribute(img.originalUrl, "src")} width="60" height="60" loading="lazy" alt=""></button></li>`)} </ul>`}<div class="pm-share" data-share${addAttribute(model.title, "data-title")}${addAttribute(text2.copied, "data-copied")}> <button type="button" class="pm-button pm-button--secondary" data-share-button${addAttribute(text2.share, "aria-label")}>${text2.share}</button> <div class="pm-share__fallback" data-share-fallback hidden> <button type="button" class="pm-link" data-share-copy>${text2.copyLink}</button> <a class="pm-link" data-share-whatsapp href="https://wa.me/" target="_blank" rel="noopener noreferrer">${text2.whatsapp}</a> </div> <p class="pm-share__status" role="status" data-share-status></p> </div> ` })}` : renderTemplate`<p class="pm-gallery__none">${text2.noImage}</p>`} </section> <div class="pm-commerce-layout"> <div class="pm-reference-title"> <h1 class="pm-pdp__title">${model.title}</h1> <a class="pm-pdp__store"${addAttribute(localizePath(locale, "/shop"), "href")}>${text2.visitStore}</a> ${renderComponent($$result2, "ExperimentSlot", $$ExperimentSlot, { "component": "review_summary", "showTo": slots.showTo.review_summary }, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "ReviewSummary", ReviewSummary, { "locale": locale, "labels": socialLabels(locale), "evidence": reviewSummaryEvidence, "switchOn": on("review_summary") })}` })} </div> ${renderComponent($$result2, "PdpBuyBox", PdpBuyBox, { "client:load": true, "locale": locale, "text": text2, "model": slim, "liveUrl": liveUrl, "switches": slots.render, "showTo": slots.showTo, "requireUnitPrice": requireUnitPrice, "priceOnRequest": priceOnRequest, "requestLinks": priceOnRequest ? { quotation: quoteHref("quotation"), enquiry: quoteHref("enquiry") } : null, "labels": { price: priceBlockLabels(locale), delivery: deliveryLabels(locale), countdown: countdownLabels(locale), social: socialLabels(locale), journey: journeyLabels(locale) }, "freeDeliveryThreshold": threshold, "countryCode": "in", "facts": facts, "totalLabel": text2.totalFor, "panelNote": text2.panelNote, "client:component-hydration": "load", "client:component-path": "C:/Users/palha/plusmark/apps/storefront/src/persuasion/PdpBuyBox", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <section class="pm-ref-offers" aria-labelledby="pdp-offers-heading" data-rail> <div class="pm-ref-head"> <h2 id="pdp-offers-heading">${text2.offers}</h2> <div class="pm-ref-arrows"> <button type="button" data-rail-prev${addAttribute(text2.prev, "aria-label")} disabled>‹</button> <button type="button" data-rail-next${addAttribute(text2.next, "aria-label")}>›</button> </div> </div> <div class="pm-ref-cards" data-rail-track> ${offerRows.map((o2) => renderTemplate`<article> <strong>${o2.description}</strong> <p>${o2.conditions.join(" · ") || text2.offerAutomatic}</p> <span class="pm-ref-cards__more">${o2.code ? pt(locale, "offerCode", { code: o2.code }) : text2.offerAutomatic} ›</span> </article>`)} ${STANDING_OFFERS.map((o2) => renderTemplate`<article> <strong>${o2.title}</strong> <p>${o2.body}</p> <span class="pm-ref-cards__more">${pt(locale, "offerCount", { count: 1 })} ›</span> </article>`)} <a${addAttribute(quoteHref("quotation"), "href")}> <strong>${text2.quoteCta}</strong> <p>${text2.quoteCardBody}</p> <span class="pm-ref-cards__more">${pt(locale, "offerCount", { count: 1 })} ›</span> </a> <a${addAttribute(quoteHref("enquiry"), "href")}> <strong>${text2.enquiryCta}</strong> <p>${model.subtitle || model.title}</p> <span class="pm-ref-cards__more">${pt(locale, "offerCount", { count: 1 })} ›</span> </a> </div> </section> <section class="pm-ref-services" aria-labelledby="pdp-services-heading"> <h2 id="pdp-services-heading">${text2.serviceInfo}</h2> <ul class="pm-ref-service-grid"> ${SERVICES.map((s2) => renderTemplate`<li class="pm-ref-service"> <span class="pm-ref-service__dot">${renderComponent($$result3, "Icon", $$Icon, { "name": s2.icon })}</span> <span>${s2.label}</span> </li>`)} </ul> <div class="pm-ref-links"> <a href="#pdp-delivery">${text2.deliveryRules}</a> <a href="#pdp-details">${text2.specifications}</a> <a${addAttribute(quoteHref("quotation"), "href")}>${text2.quoteCta}</a> </div> </section> ` })} <div class="pm-ref-extras"> ${renderComponent($$result2, "SaveButton", $$SaveButton, { "productId": model.id, "title": model.title, "locale": locale })} <a class="pm-pdp__store"${addAttribute(quoteHref("enquiry"), "href")}>${text2.askAbout}</a> ${renderComponent($$result2, "PdpAlerts", $$PdpAlerts, { "locale": locale, "productId": model.id, "title": model.title, "variantIds": model.variants.map((v2) => v2.id), "liveUrl": liveUrl })} </div> ${offerRows.length > 0 && renderTemplate`<section class="pm-offers" aria-labelledby="pdp-offers"> <h2 id="pdp-offers">${text2.offers}</h2> <ul> ${offerRows.map((o2) => renderTemplate`<li class="pm-offer"> <strong>${o2.description}</strong> ${" "}<span>${o2.code ? pt(locale, "offerCode", { code: o2.code }) : text2.offerAutomatic}</span> ${o2.conditions.length > 0 && renderTemplate`<ul class="pm-offer__conditions"${addAttribute(text2.offerConditions, "aria-label")}> ${o2.conditions.map((c2) => renderTemplate`<li>${c2}</li>`)} </ul>`} </li>`)} </ul> </section>`} ${ruleLines.length > 0 && renderTemplate`<section class="pm-delivery-rules" aria-labelledby="pdp-delivery-rules"> <h2 id="pdp-delivery-rules">${text2.deliveryRules}</h2> <ul>${ruleLines.map((l2) => renderTemplate`<li>${l2}</li>`)}</ul> </section>`} ${renderComponent($$result2, "ExperimentSlot", $$ExperimentSlot, { "component": "trust_strip", "showTo": slots.showTo.trust_strip }, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "TrustStrip", TrustStrip, { "locale": locale, "labels": socialLabels(locale), "evidence": trust, "switchOn": on("trust_strip") })}` })} </div> </div> ${highlights2.length > 0 && renderTemplate`<section class="pm-highlights" aria-labelledby="pdp-highlights"> <h2 id="pdp-highlights">${text2.highlights}</h2> <ul>${highlights2.map((h2) => renderTemplate`<li>${h2}</li>`)}</ul> </section>`} <nav class="pm-detail-links"${addAttribute(text2.details, "aria-label")}> ${descriptionHtml && renderTemplate`<a href="#pdp-description">${text2.description}</a>`} ${specs.length > 0 && renderTemplate`<a href="#pdp-specifications">${text2.specifications}</a>`} <a href="#pdp-variants">${text2.purchaseOptions}</a> ${storyPhotos.length > 0 && renderTemplate`<a href="#pdp-story">${text2.details}</a>`} </nav> ${storyPhotos.length > 0 && renderTemplate`<section class="pm-story" id="pdp-story"${addAttribute(text2.details, "aria-label")}> ${storyPhotos.map((a2, index) => renderTemplate`<img${addAttribute(String(a2.value), "src")}${addAttribute(pt(locale, "showImage", { index: index + 1 }) + " · " + model.title, "alt")} loading="lazy" decoding="async">`)} </section>`} <section class="pm-blocks" aria-labelledby="pdp-details" data-blocks> <h2 id="pdp-details" class="pm-visually-hidden">${text2.details}</h2> ${blockList.map((key2) => {
    if (key2 === "description") {
      return pdpBlockShows(pdpBlocks, "description", !!descriptionHtml) && renderTemplate`<details class="pm-block" id="pdp-description" open data-block="description"> <summary>${text2.description}</summary> <div class="pm-block__body">${unescapeHTML(descriptionHtml)}</div> </details>`;
    }
    if (key2 === "specifications") {
      return pdpBlockShows(pdpBlocks, "specifications", specs.length > 0) && renderTemplate`<details class="pm-block" id="pdp-specifications" data-block="specifications"> <summary>${text2.specifications}</summary> <dl class="pm-block__body pm-specs"> ${specs.map((s2) => renderTemplate`<div><dt>${rowLabel(s2.key)}</dt><dd>${s2.value}</dd></div>`)} </dl> </details>`;
    }
    const view = presetBlocks.get(key2);
    if (!view) return null;
    return renderTemplate`<details class="pm-block"${addAttribute(view.kind === "quote", "open")}${addAttribute(key2, "data-block")}> <summary>${blockTitle(key2)}</summary> ${view.kind === "rows" && renderTemplate`<dl class="pm-block__body pm-specs"> ${view.rows.map((r2) => renderTemplate`<div><dt>${rowLabel(r2.key)}</dt><dd>${rowValue(r2)}</dd></div>`)} </dl>`} ${view.kind === "tiers" && renderTemplate`<div class="pm-block__body"> ${view.tiers.length > 0 && renderTemplate`<table class="pm-table pm-tiers"> <thead><tr><th scope="col">${text2.tierQuantity}</th><th scope="col">${text2.tierPrice}</th></tr></thead> <tbody> ${view.tiers.map((t2) => renderTemplate`<tr><td>${pt(locale, "tierFrom", { qty: t2.minQuantity })}</td><td>${formatMoney(t2.amount, currency, locale)}</td></tr>`)} </tbody> </table>`} ${view.rows.length > 0 && renderTemplate`<dl class="pm-specs"> ${view.rows.map((r2) => renderTemplate`<div><dt>${rowLabel(r2.key)}</dt><dd>${rowValue(r2)}</dd></div>`)} </dl>`} </div>`} ${view.kind === "compare" && renderTemplate`<div class="pm-block__body pm-compare"> <table class="pm-table"> <thead> <tr> <th scope="col">${text2.compareAttribute}</th> ${view.head.map((h2, i2) => renderTemplate`<th scope="col">${i2 === 0 ? pt(locale, "compareThis", { title: h2 }) : h2}</th>`)} </tr> </thead> <tbody> ${view.rows.map((r2) => renderTemplate`<tr><th scope="row">${rowLabel(r2.key)}</th>${r2.values.map((v2) => renderTemplate`<td>${v2 || "—"}</td>`)}</tr>`)} </tbody> </table> </div>`} ${view.kind === "quote" && renderTemplate`<div class="pm-block__body"> <p>${text2.quoteBody}</p> <p class="pm-block__actions"> <a class="pm-button pm-button--primary"${addAttribute(quoteHref("quotation"), "href")} data-quotation-request>${text2.quoteCta}</a>${" "} <a class="pm-button pm-button--secondary"${addAttribute(quoteHref("enquiry"), "href")} data-enquiry-request>${text2.enquiryCta}</a> </p> </div>`} </details>`;
  })} </section> ${renderComponent($$result2, "Declarations", $$Declarations, { "locale": locale, "product": declarationProduct, "variantId": soleVariantId })} ${renderComponent($$result2, "PdpSummary", $$PdpSummary, { "locale": locale, "settings": settings })} ${reviews2.enabled && reviewList.length > 0 && renderTemplate`<section class="pm-reviews" aria-labelledby="pdp-reviews" data-reviews> <h2 id="pdp-reviews">${text2.reviews}</h2> ${reviewSummaryEvidence && renderTemplate`<p>${pt(locale, "reviewsCount", { count: reviewSummaryEvidence.count })}</p>`} ${renderComponent($$result2, "ExperimentSlot", $$ExperimentSlot, { "component": "review_highlights", "showTo": slots.showTo.review_highlights }, { "default": ($$result3) => renderTemplate`${renderComponent($$result3, "ReviewHighlights", ReviewHighlights, { "labels": socialLabels(locale), "evidence": reviews2.reviews, "switchOn": on("review_highlights") })}` })} <ul class="pm-reviews__dist"${addAttribute(text2.distribution, "aria-label")}> ${dist.map((d2) => renderTemplate`<li>${pt(locale, "starsRow", { stars: d2.stars, count: d2.count })}</li>`)} </ul> <div class="pm-reviews__controls"> <label for="pdp-review-sort">${text2.sortBy}</label> <select class="pm-input" id="pdp-review-sort" data-review-sort> <option value="newest">${text2.sortNewest}</option> <option value="highest">${text2.sortHighest}</option> <option value="lowest">${text2.sortLowest}</option> </select> <label for="pdp-review-filter">${text2.filterBy}</label> <select class="pm-input" id="pdp-review-filter" data-review-filter> <option value="">${text2.allRatings}</option> ${[5, 4, 3, 2, 1].map((s2) => renderTemplate`<option${addAttribute(String(s2), "value")}>${pt(locale, "starsOption", { stars: s2 })}</option>`)} </select> </div> <ul class="pm-reviews__list" data-review-list> ${reviewList.map((r2) => renderTemplate`<li class="pm-review"${addAttribute(Math.round(r2.rating), "data-rating")}${addAttribute(Date.parse(r2.createdAt) || 0, "data-time")}> <p class="pm-review__head"><span aria-hidden="true">${"★".repeat(Math.round(r2.rating))}</span><span class="pm-visually-hidden">${pt(locale, "starsOption", { stars: Math.round(r2.rating) })}</span>${r2.title && renderTemplate`<strong> ${r2.title}</strong>`}</p> <p>${r2.body}</p> <p class="pm-review__meta">${r2.author && renderTemplate`<span>${pt(locale, "reviewBy", { name: r2.author })}</span>`}${r2.verified && renderTemplate`<span class="pm-badge">${text2.verified}</span>`}</p> </li>`)} </ul> <p data-review-empty hidden>${text2.noMatch}</p> </section>`} ${renderComponent($$result2, "PdpRequests", $$PdpRequests, { "locale": locale, "productId": model.id, "variants": model.variants.map((v2) => ({ id: v2.id, title: v2.title || model.title })) })} ${showPaired && renderTemplate`${renderComponent($$result2, "ExperimentSlot", $$ExperimentSlot, { "component": "goes_well_with", "showTo": slots.showTo.goes_well_with }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "PdpGoesWell", PdpGoesWell, { "client:visible": true, "locale": locale, "labels": journeyLabels(locale), "currency": currency, "self": model.id, "paired": pairedProducts2, "errorText": text2.addError, "client:component-hydration": "visible", "client:component-path": "C:/Users/palha/plusmark/apps/storefront/src/persuasion/PdpGoesWell", "client:component-export": "default" })} ` })}`} ${related.length >= 2 && renderTemplate`<section class="pm-rail" aria-labelledby="pdp-rail"> <h2 id="pdp-rail">${text2.railTitle}</h2> <ul class="pm-grid pm-rail__grid"> ${related.map((c2) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "card": c2, "locale": locale, "labels": labels })}`)} </ul> </section>`} </div> ` })} <dialog class="pm-zoom" id="pdp-zoom"${addAttribute(text2.open, "aria-label")} data-zoom> <div class="pm-zoom__bar"> <button type="button" class="pm-button pm-button--secondary" data-zoom-out${addAttribute(text2.zoomOut, "aria-label")}>−</button> <button type="button" class="pm-button pm-button--secondary" data-zoom-in${addAttribute(text2.zoomIn, "aria-label")}>+</button> <button type="button" class="pm-button pm-button--primary" data-zoom-close>${text2.close}</button> </div> <div class="pm-zoom__stage" data-zoom-stage tabindex="0"><img class="pm-zoom__img" data-zoom-img alt="" src="data:,"></div> </dialog> ${renderScript($$result, "C:/Users/palha/plusmark/apps/storefront/src/components/pdp/PdpPage.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/pdp/PdpPage.astro", void 0);
const $$ProductPage = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ProductPage;
  const { locale, handle, record, categoriesData } = Astro2.props;
  const data = loadPdpData();
  const product = record ?? data.products.find((p2) => p2.handle === handle);
  if (!product) throw new Error(`No product with handle "${handle}" in the build data`);
  const reviews2 = record ? { enabled: false, reviews: [] } : await loadReviews(String(product.id));
  const categoriesSource = categoriesData ?? categoriesJson;
  const shell = loadShellData();
  const title = `${String(product.title ?? "")} | ${shell.brand.name}`;
  const description2 = plainText(String(product.description ?? "") || String(product.subtitle ?? ""));
  const bottomBar = componentSwitches(data.settings).sticky_buy_bar !== false;
  const layout = resolveLayout(data.settings);
  const path = localizePath(locale, `/product/${encodeURIComponent(handle)}`);
  const model = parsePdpProduct(product, data.currency);
  const rows = parseCategories(categoriesSource);
  const site = Astro2.site ? String(Astro2.site) : "";
  const pageUrl = Astro2.site ? new URL(path, Astro2.site).href : path;
  const firstCat = model?.categories[0];
  const crumbs = [
    { label: t(locale, "plp.home"), href: localizePath(locale, "/") },
    ...firstCat ? categoryChain(rows, firstCat.id).map((c2) => ({ label: c2.name, href: localizePath(locale, `/shop/${categoryPath(rows, c2.id)}`) })) : [],
    { label: model?.title ?? "", href: "" }
  ];
  const ld = model ? [productJsonLd({ model, url: pageUrl, brand: shell.brand.name, reviews: reviews2.enabled ? parsePdpReviews(reviews2.reviews) : [], raw: product }), breadcrumbJsonLd(crumbs, pageUrl, site)] : [];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": title, "locale": locale, "description": metaDescription(description2, title), "image": model?.images[0]?.url, "ogType": "product", "jsonLd": ld, "path": path, "bottomBar": bottomBar, "shell": shell }, { "default": async ($$result2) => renderTemplate` ${renderComponent($$result2, "PdpPage", $$PdpPage, { "locale": locale, "product": product, "catalog": data.products, "categories": rows, "settings": data.settings, "offers": data.offers, "rules": data.rules, "currency": data.currency, "regionId": data.regionId, "reviews": reviews2, "badgePriority": layout.badgePriority, "requireUnitPrice": layout.requireUnitPrice, "pdpBlocks": layout.pdpBlocks })} ` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/pdp/ProductPage.astro", void 0);
const $$Button = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Button;
  const { variant = "primary", type = "button", href, block = false, disabled = false, class: cls = "", ...rest } = Astro2.props;
  const classes = ["pm-button", variant !== "primary" && `pm-button--${variant}`, block && "pm-button--block", cls].filter(Boolean).join(" ");
  return renderTemplate`${href && !disabled ? renderTemplate`${maybeRenderHead()}<a${addAttribute(href, "href")}${addAttribute(classes, "class")}${spreadAttributes(rest)}>${renderSlot($$result, $$slots["default"])}</a>` : renderTemplate`<button${addAttribute(type, "type")}${addAttribute(classes, "class")}${addAttribute(disabled, "disabled")}${spreadAttributes(rest)}>${renderSlot($$result, $$slots["default"])}</button>`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/ui/Button.astro", void 0);
const $$FilterForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$FilterForm;
  const { idPrefix, locale, facets, state, hide = [] } = Astro2.props;
  const arr2 = (k2) => Array.isArray(facets[k2]) ? facets[k2] : [];
  const rows = (k2, labelKey) => arr2(k2).map((f2) => ({ id: String(f2.id), label: String(f2[labelKey] ?? ""), count: Number(f2.count) || 0 })).filter((r2) => r2.id && r2.label);
  const groups = [
    { key: "categories", name: "cat", title: t(locale, "plp.categories"), rows: rows("categories", "name"), on: state.categories },
    { key: "collections", name: "col", title: t(locale, "plp.collections"), rows: rows("collections", "title"), on: state.collections },
    { key: "types", name: "type", title: t(locale, "plp.types"), rows: rows("types", "value"), on: state.types },
    { key: "tags", name: "tag", title: t(locale, "plp.tags"), rows: rows("tags", "value"), on: state.tags }
  ].filter((g2) => g2.rows.length > 0 && !hide.includes(g2.key));
  const options2 = arr2("options").map((o2) => ({ name: String(o2.name), values: Array.isArray(o2.values) ? o2.values : [] })).filter((o2) => o2.name && o2.values.length > 0 && !hide.includes("options"));
  const price2 = facets.price ?? {};
  const showPrice = !hide.includes("price") && price2.min != null && price2.max != null && price2.max > price2.min;
  return renderTemplate`${maybeRenderHead()}<form class="pm-filters" data-plp-form method="get" action=""${addAttribute(`${idPrefix}-form`, "id")}> ${groups.map((g2) => renderTemplate`<fieldset class="pm-filters__group"> <legend>${g2.title}</legend> <ul> ${g2.rows.map((r2, i2) => renderTemplate`<li class="pm-checkbox"> <input type="checkbox"${addAttribute(`${idPrefix}-${g2.name}-${i2}`, "id")}${addAttribute(g2.name, "name")}${addAttribute(r2.id, "value")}${addAttribute(g2.on.includes(r2.id), "checked")}${addAttribute(r2.label, "data-label")}> <label${addAttribute(`${idPrefix}-${g2.name}-${i2}`, "for")}>${r2.label} <span class="pm-filters__count">(${r2.count})</span></label> </li>`)} </ul> </fieldset>`)} ${options2.map((o2, n) => renderTemplate`<fieldset class="pm-filters__group"> <legend>${o2.name}</legend> <ul> ${o2.values.map((v2, i2) => renderTemplate`<li class="pm-checkbox"> <input type="checkbox"${addAttribute(`${idPrefix}-o${n}-${i2}`, "id")}${addAttribute(`o.${o2.name}`, "name")}${addAttribute(v2.value, "value")}${addAttribute((state.options[o2.name] ?? []).includes(v2.value), "checked")}${addAttribute(`${o2.name}: ${v2.value}`, "data-label")}> <label${addAttribute(`${idPrefix}-o${n}-${i2}`, "for")}>${v2.value} <span class="pm-filters__count">(${v2.count})</span></label> </li>`)} </ul> </fieldset>`)} ${showPrice && renderTemplate`<fieldset class="pm-filters__group pm-filters__price"> <legend>${t(locale, "plp.price")}</legend> <div class="pm-field"> <label class="pm-label"${addAttribute(`${idPrefix}-min`, "for")}>${t(locale, "plp.priceMin")}</label> <input class="pm-input" type="number" inputmode="decimal" min="0" step="any"${addAttribute(`${idPrefix}-min`, "id")} name="min"${addAttribute(state.priceMin ?? "", "value")}${addAttribute(String(price2.min), "placeholder")}> </div> <div class="pm-field"> <label class="pm-label"${addAttribute(`${idPrefix}-max`, "for")}>${t(locale, "plp.priceMax")}</label> <input class="pm-input" type="number" inputmode="decimal" min="0" step="any"${addAttribute(`${idPrefix}-max`, "id")} name="max"${addAttribute(state.priceMax ?? "", "value")}${addAttribute(String(price2.max), "placeholder")}> </div> </fieldset>`} </form>`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/FilterForm.astro", void 0);
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$PlpPage = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PlpPage;
  const {
    locale,
    title,
    items,
    total,
    facets,
    scope,
    description: description2,
    breadcrumbs: breadcrumbs2 = [],
    badgePriority,
    freeDeliveryThreshold = null,
    bestSellerIds = [],
    images = {},
    hideFilters = [],
    query = "",
    deferEmpty = false
  } = Astro2.props;
  const state = emptyState(query);
  const labels = cardLabels(locale);
  const ui = plpUiLabels(locale);
  const best = new Set(bestSellerIds);
  const cards = items.map((p2) => cardOf(p2, { badgePriority, now: Date.now(), freeDeliveryThreshold, bestSellerIds: best })).filter((c2) => c2 !== null);
  const sortLabel = (s2) => t(locale, `plp.sort${s2 === "price_asc" ? "PriceAsc" : s2 === "price_desc" ? "PriceDesc" : s2 === "title_asc" ? "TitleAsc" : s2[0].toUpperCase() + s2.slice(1)}`);
  const sorts = SORTS.filter((s2) => s2 !== "relevance" || query || deferEmpty);
  const config = {
    locale,
    scope,
    badgePriority,
    freeDeliveryThreshold,
    bestSellerIds,
    hideFilters,
    query,
    labels,
    ui,
    total,
    pageSize: PAGE_SIZE
  };
  const configJson = JSON.stringify(config).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");
  const rankingHref = localizePath(locale, "/ranking-disclosure");
  const remaining = Math.min(PAGE_SIZE, Math.max(0, total - cards.length));
  return renderTemplate(_a || (_a = __template(["", " ", ' <script type="application/json" id="plp-config">', "<\/script> ", ""])), renderComponent($$result, "Container", $$Container, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="pm-plp" data-plp> ${breadcrumbs2.length > 0 && renderTemplate`<nav${addAttribute(t(locale, "plp.breadcrumbs"), "aria-label")} class="pm-breadcrumbs"> <ol> ${breadcrumbs2.map((b, i2) => renderTemplate`<li>${i2 < breadcrumbs2.length - 1 ? renderTemplate`<a${addAttribute(b.href, "href")}>${b.label}</a>` : renderTemplate`<span aria-current="page">${b.label}</span>`}</li>`)} </ol> </nav>`} <header class="pm-plp__head"> <h1 data-plp-title>${title}</h1> <p class="pm-plp__count" data-plp-count>${t(locale, total === 1 ? "plp.productCount.one" : "plp.productCount.other", { count: total })}</p> </header> <div class="pm-plp__bar" data-plp-bar> <button type="button" class="pm-button pm-button--secondary pm-plp__filter-button" data-pm-open="plp-filters" data-plp-filter-button> <span data-plp-filter-label>${t(locale, "plp.filters")}</span> </button> <div class="pm-plp__sort"> <label class="pm-label" for="plp-sort">${t(locale, "plp.sort")}</label> <select class="pm-input" id="plp-sort" data-plp-sort> ${sorts.map((s2) => renderTemplate`<option${addAttribute(s2, "value")}${addAttribute(s2 === state.sort, "selected")}>${sortLabel(s2)}</option>`)} </select> <a class="pm-link"${addAttribute(rankingHref, "href")}>${t(locale, "plp.rankingLink")}</a> </div> </div> <div class="pm-plp__chips" data-plp-chips hidden> <ul${addAttribute(t(locale, "plp.appliedFilters"), "aria-label")} data-plp-chip-list></ul> <button type="button" class="pm-button pm-button--ghost" data-plp-clear>${t(locale, "plp.clearAll")}</button> </div> <div class="pm-plp__body"> <aside class="pm-plp__column"${addAttribute(t(locale, "plp.filters"), "aria-label")}> ${renderComponent($$result2, "FilterForm", $$FilterForm, { "idPrefix": "plp-col", "locale": locale, "facets": facets, "state": state, "hide": hideFilters })} </aside> <div class="pm-plp__results"> <ul class="pm-grid pm-plp__grid" data-plp-grid> ${cards.map((c2, i2) => renderTemplate`${renderComponent($$result2, "ProductCard", $$ProductCard, { "card": c2, "locale": locale, "labels": labels, "image": c2.imageId ? images[c2.imageId] : void 0, "priority": i2 === 0 })}`)} </ul> <div class="pm-plp__empty" data-plp-empty${addAttribute(total > 0 || deferEmpty || void 0, "hidden")}> ${Astro2.slots.has("empty") ? renderTemplate`${renderSlot($$result2, $$slots["empty"])}` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <p><strong>${t(locale, "plp.empty")}</strong></p> <p>${t(locale, "plp.emptyHint")}</p> ` })}`} ${renderComponent($$result2, "Button", $$Button, { "variant": "secondary", "data-plp-clear": true }, { "default": ($$result3) => renderTemplate`${t(locale, "plp.clearAll")}` })} </div> <div class="pm-plp__more" data-plp-more${addAttribute(remaining === 0 || void 0, "hidden")}> <p data-plp-status>${t(locale, "plp.showing", { shown: cards.length, total })}</p> ${renderComponent($$result2, "Button", $$Button, { "variant": "secondary", "data-plp-load-more": true }, { "default": ($$result3) => renderTemplate`${t(locale, "plp.loadMore", { count: remaining })}` })} </div> <p class="pm-error" role="alert" data-plp-error hidden> ${t(locale, "plp.error")} <button type="button" class="pm-link" data-plp-retry>${t(locale, "plp.retry")}</button> </p> </div> </div> ${description2 && renderTemplate`<section class="pm-plp__description">${unescapeHTML(sanitizeHtml(description2))}</section>`} </div> ` }), renderComponent($$result, "Dialog", $$Dialog, { "id": "plp-filters", "title": t(locale, "plp.filters"), "closeLabel": t(locale, "plp.closeFilters"), "variant": "sheet" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "FilterForm", $$FilterForm, { "idPrefix": "plp-sheet", "locale": locale, "facets": facets, "state": state, "hide": hideFilters })} <div class="pm-plp__apply"> ${renderComponent($$result2, "Button", $$Button, { "block": true, "data-plp-apply": true }, { "default": ($$result3) => renderTemplate`${t(locale, "plp.showResults.other", { count: total })}` })} </div> ` }), unescapeHTML(configJson), renderScript($$result, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/PlpPage.astro?astro&type=script&index=0&lang.ts"));
}, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/PlpPage.astro", void 0);
const isObj$1 = (x) => !!x && typeof x === "object" && !Array.isArray(x);
const str = (x) => typeof x === "string" ? x : "";
const arr = (x) => Array.isArray(x) ? x : [];
function categoryIdsBelow(rows, id) {
  const out = /* @__PURE__ */ new Set([id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const r2 of rows) if (r2.parent && out.has(r2.parent) && !out.has(r2.id)) {
      out.add(r2.id);
      grew = true;
    }
  }
  return out;
}
function productsIn(catalog, match) {
  return catalog.filter((p2) => {
    if (match.categoryIds) return arr(p2.categories).some((c2) => isObj$1(c2) && match.categoryIds?.has(str(c2.id)));
    if (match.collectionId) return isObj$1(p2.collection) && p2.collection.id === match.collectionId;
    return true;
  });
}
function listingOf(products2) {
  const counts = (pick) => {
    const m2 = /* @__PURE__ */ new Map();
    for (const p2 of products2) for (const {
      id,
      label
    } of pick(p2)) {
      if (!id || !label) continue;
      const cur = m2.get(id) ?? {
        id,
        label,
        count: 0
      };
      cur.count++;
      m2.set(id, cur);
    }
    return [...m2.values()].sort((a2, b) => a2.label.localeCompare(b.label));
  };
  const cats = counts((p2) => arr(p2.categories).filter(isObj$1).map((c2) => ({
    id: str(c2.id),
    label: str(c2.name)
  })));
  const cols = counts((p2) => isObj$1(p2.collection) ? [{
    id: str(p2.collection.id),
    label: str(p2.collection.title)
  }] : []);
  const types = counts((p2) => isObj$1(p2.type) ? [{
    id: str(p2.type.id),
    label: str(p2.type.value)
  }] : []);
  const tags = counts((p2) => arr(p2.tags).filter(isObj$1).map((t2) => ({
    id: str(t2.id),
    label: str(t2.value)
  })));
  const optionMap = /* @__PURE__ */ new Map();
  for (const p2 of products2) {
    const seen = /* @__PURE__ */ new Set();
    for (const o2 of arr(p2.options).filter(isObj$1)) {
      const name2 = str(o2.title);
      const used = new Set(arr(p2.variants).filter(isObj$1).flatMap((v2) => arr(v2.options).filter(isObj$1).filter((x) => x.option_id === o2.id).map((x) => str(x.value))));
      for (const v2 of arr(o2.values).filter(isObj$1).map((x) => str(x.value)).filter((v22) => v22 && used.has(v22))) {
        const key2 = `${name2}\0${v2}`;
        if (seen.has(key2)) continue;
        seen.add(key2);
        const m2 = optionMap.get(name2) ?? /* @__PURE__ */ new Map();
        m2.set(v2, (m2.get(v2) ?? 0) + 1);
        optionMap.set(name2, m2);
      }
    }
  }
  const prices = products2.flatMap((p2) => arr(p2.variants).filter(isObj$1).map((v2) => isObj$1(v2.price) ? Number(v2.price.calculated_amount) : NaN)).filter((n) => Number.isFinite(n));
  return {
    items: products2.slice(0, PAGE_SIZE),
    total: products2.length,
    facets: {
      categories: cats.map((c2) => ({
        id: c2.id,
        name: c2.label,
        count: c2.count
      })),
      collections: cols.map((c2) => ({
        id: c2.id,
        title: c2.label,
        count: c2.count
      })),
      types: types.map((c2) => ({
        id: c2.id,
        value: c2.label,
        count: c2.count
      })),
      tags: tags.map((c2) => ({
        id: c2.id,
        value: c2.label,
        count: c2.count
      })),
      options: [...optionMap.entries()].map(([name2, vals]) => ({
        name: name2,
        values: [...vals.entries()].map(([value, count2]) => ({
          value,
          count: count2
        }))
      })),
      price: {
        min: prices.length ? Math.min(...prices) : null,
        max: prices.length ? Math.max(...prices) : null
      }
    }
  };
}
const collections = [{ "id": "pcol_01M7WWS7SQFBQ8VCXD7P8N58MK", "title": "Deluxe Standard", "handle": "deluxe-standard" }, { "id": "pcol_01M7WWS7SK93BNHESYSS7FEX6G", "title": "Eco Premium", "handle": "eco-premium" }, { "id": "pcol_01M7WWS7SV0Y85VGQXZKVVV188", "title": "Eco Regular", "handle": "eco-regular" }, { "id": "pcol_01M7WWS7SCTP9MK3FX2HAC9BK2", "title": "Metallic Premium", "handle": "metallic-premium" }];
const collectionsJson = {
  collections
};
const $$PlpRoute = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PlpRoute;
  const { locale, categoryId, collectionId, onDemand } = Astro2.props;
  const data = loadPdpData();
  const categoriesSource = onDemand?.categories ?? categoriesJson;
  const collectionsSource = onDemand?.collections ?? collectionsJson;
  const rows = parseCategories(categoriesSource);
  const raw = (categoryId ? categoriesSource.categories : collectionsSource.collections) ?? [];
  const record = raw.find((r2) => r2.id === (categoryId ?? collectionId));
  const shell = loadShellData();
  const allProducts = !categoryId && !collectionId;
  const title = allProducts ? t(locale, "nav.shopAll") : String((categoryId ? record?.name : record?.title) ?? "");
  const listing = onDemand?.listing ?? listingOf(productsIn(data.products, categoryId ? { categoryIds: categoryIdsBelow(rows, categoryId) } : { collectionId }));
  const layout = resolveLayout(data.settings);
  const hidden = [.../* @__PURE__ */ new Set([...categoryId ? ["categories"] : collectionId ? ["collections"] : [], ...hiddenFilterGroups(layout.plpFilters)])];
  const crumbs = [
    { label: t(locale, "plp.home"), href: localizePath(locale, "/") },
    ...categoryId ? categoryChain(rows, categoryId).map((c2) => ({ label: c2.name, href: localizePath(locale, `/shop/${categoryPath(rows, c2.id)}`) })) : [{ label: title, href: "" }]
  ];
  const path = localizePath(locale, allProducts ? "/shop" : categoryId ? `/shop/${categoryPath(rows, categoryId)}` : `/collections/${String(record?.handle ?? "")}`);
  const pageUrl = Astro2.site ? new URL(path, Astro2.site).href : path;
  const site = Astro2.site ? String(Astro2.site) : "";
  const description2 = metaDescription(typeof record?.description === "string" ? record.description : "", `${title} | ${shell.brand.name}`);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${title} | ${shell.brand.name}`, "description": description2, "locale": locale, "path": path, "shell": shell, "jsonLd": [breadcrumbJsonLd(crumbs, pageUrl, site)] }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PlpPage", $$PlpPage, { "locale": locale, "title": title, "items": listing.items, "total": listing.total, "facets": listing.facets, "scope": { categoryId: categoryId ?? null, collectionId: collectionId ?? null, regionId: data.regionId, currency: data.currency.toLowerCase() }, "description": typeof record?.description === "string" ? record.description : null, "breadcrumbs": crumbs, "badgePriority": layout.badgePriority, "freeDeliveryThreshold": typeof data.rules.free_delivery_threshold === "number" ? data.rules.free_delivery_threshold : null, "hideFilters": hidden })} ` })}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/components/plp/PlpRoute.astro", void 0);
const isObj = (x) => !!x && typeof x === "object" && !Array.isArray(x);
async function rpc(env2, name2, params, doFetch) {
  const base = (env2.SUPABASE_URL ?? "").replace(/\/+$/, "");
  if (!base) throw new Error("SUPABASE_URL is not configured");
  const headers = {
    Accept: "application/json",
    "Accept-Profile": "api"
  };
  if (env2.SUPABASE_ANON_KEY) {
    headers.apikey = env2.SUPABASE_ANON_KEY;
    headers.Authorization = `Bearer ${env2.SUPABASE_ANON_KEY}`;
  }
  const q2 = new URLSearchParams(params).toString();
  const res = await doFetch(`${base}/rest/v1/rpc/${name2}${q2 ? `?${q2}` : ""}`, {
    method: "GET",
    headers
  });
  if (!res.ok) throw new Error(`${name2} answered ${res.status}`);
  return res.json();
}
const scopeParams = (s2) => ({
  ...s2.regionId ? {
    p_region_id: s2.regionId
  } : {},
  ...s2.currency ? {
    p_currency_code: s2.currency.toLowerCase()
  } : {}
});
async function loadProduct(env2, handle, scope, doFetch = fetch) {
  const body = await rpc(env2, "store_get_product", {
    p_handle: handle,
    ...scopeParams(scope)
  }, doFetch);
  return isObj(body) && typeof body.id === "string" && !isObj(body.error) ? body : null;
}
async function loadTaxonomy(env2, kind, doFetch = fetch) {
  const body = await rpc(env2, kind === "categories" ? "store_list_categories" : "store_list_collections", {}, doFetch);
  return isObj(body) && Array.isArray(body[kind]) ? body : {
    [kind]: []
  };
}
async function loadListing(env2, scope, match, doFetch = fetch) {
  const params = {
    ...scopeParams(scope),
    p_page: "1",
    p_page_size: "24",
    p_sort: "newest"
  };
  if (match.categoryIds?.length) params.p_category_ids = `{${match.categoryIds.map((i2) => `"${i2}"`).join(",")}}`;
  if (match.collectionId) params.p_collection_ids = `{"${match.collectionId}"}`;
  const body = await rpc(env2, "store_list_products", params, doFetch);
  if (!isObj(body) || !Array.isArray(body.items)) return {
    items: [],
    total: 0,
    facets: {}
  };
  return {
    items: body.items.filter(isObj),
    total: typeof body.total === "number" ? body.total : body.items.length,
    facets: isObj(body.facets) ? body.facets : {}
  };
}
function parseOnDemandPath(rest) {
  let parts = rest.split("/").filter(Boolean);
  let locale = "en";
  if (parts[0] === "hi") {
    locale = "hi";
    parts = parts.slice(1);
  }
  if (parts.length < 2) return null;
  const segments = parts.slice(1).map((s2) => {
    try {
      return decodeURIComponent(s2);
    } catch {
      return s2;
    }
  });
  if (parts[0] === "product" && segments.length === 1) return {
    locale,
    kind: "product",
    segments
  };
  if (parts[0] === "collections" && segments.length === 1) return {
    locale,
    kind: "collection",
    segments
  };
  if (parts[0] === "shop") return {
    locale,
    kind: "category",
    segments
  };
  return null;
}
const prerender = false;
const $$Route = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Route;
  const parsed = parseOnDemandPath(String(Astro2.params.rest ?? ""));
  const bindings = env;
  const e2 = {
    SUPABASE_URL: bindings.SUPABASE_URL || "https://lkjxumiyesvufcxyaqcg.supabase.co",
    SUPABASE_ANON_KEY: bindings.SUPABASE_ANON_KEY || "sb_publishable_xlFRp85aCvi8vfvOW_mGrg_1f1Q6x68"
  };
  const build = loadPdpData();
  const scope = { regionId: build.regionId, currency: build.currency };
  let missing = !parsed;
  let page2 = null;
  if (parsed) {
    try {
      if (parsed.kind === "product") {
        const [record, categories2] = await Promise.all([loadProduct(e2, parsed.segments[0], scope), loadTaxonomy(e2, "categories")]);
        if (record) page2 = { kind: "product", record, categories: categories2 };
      } else {
        const [categories2, collections2] = await Promise.all([loadTaxonomy(e2, "categories"), loadTaxonomy(e2, "collections")]);
        let id;
        if (parsed.kind === "category") {
          const rows = parseCategories(categories2);
          id = rows.find((c2) => categoryPath(rows, c2.id) === parsed.segments.join("/"))?.id;
          if (id) {
            const listing = await loadListing(e2, scope, { categoryIds: [...categoryIdsBelow(rows, id)] });
            page2 = { kind: "category", id, categories: categories2, collections: collections2, listing };
          }
        } else {
          const list = collections2.collections ?? [];
          id = list.find((c2) => c2.handle === parsed.segments[0])?.id;
          if (id) page2 = { kind: "collection", id, categories: categories2, collections: collections2, listing: await loadListing(e2, scope, { collectionId: id }) };
        }
      }
    } catch {
      return new Response("Service unavailable", { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "30" } });
    }
    missing = page2 === null;
  }
  if (missing || !parsed || !page2) return new Response(null, { status: 404 });
  return renderTemplate`${page2.kind === "product" && renderTemplate`${renderComponent($$result, "ProductPage", $$ProductPage, { "locale": parsed.locale, "handle": parsed.segments[0], "record": page2.record, "categoriesData": page2.categories })}`}${page2.kind === "category" && renderTemplate`${renderComponent($$result, "PlpRoute", $$PlpRoute, { "locale": parsed.locale, "categoryId": page2.id, "onDemand": { categories: page2.categories, collections: page2.collections, listing: page2.listing } })}`}${page2.kind === "collection" && renderTemplate`${renderComponent($$result, "PlpRoute", $$PlpRoute, { "locale": parsed.locale, "collectionId": page2.id, "onDemand": { categories: page2.categories, collections: page2.collections, listing: page2.listing } })}`}`;
}, "C:/Users/palha/plusmark/apps/storefront/src/ondemand/route.astro", void 0);
const $$file = "C:/Users/palha/plusmark/apps/storefront/src/ondemand/route.astro";
const $$url = void 0;
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Route,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
const route___astro = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  page
}, Symbol.toStringTag, { value: "Module" }));
export {
  getJson as a,
  catalogMeta as b,
  clearCart as c,
  getItem as d,
  deliveryRules$2 as e,
  getCart as g,
  notifyCartChanged as n,
  route___astro as r,
  setCart as s
};
//# sourceMappingURL=route_Bqhf63D-.mjs.map
