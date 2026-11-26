---
name: design-ecommerce-ui
description: Design, implement, or review ecommerce storefront screens and shared UI components. Apply when building product cards, search, filters, product pages, carts, checkout, and order states, or when removing generic AI styling from an existing shop.
---

# Design ecommerce UI

Start by identifying the shopper’s decision on the screen. On a listing it might be “Which desk lamp fits my shelf?” On a product page it might be “Can I get the walnut finish by Friday?” Give the product, the deciding fact, and the next action visual priority.

## Set the visual direction before coding

1. Inspect the existing theme tokens, typography, shared controls, catalogue images, and one representative screen. Reuse working components and change their styles at the appropriate shared level. Scope changes to the storefront when the admin or another surface shares those components.
2. Choose the actual category attribute that helps shoppers choose. Use dimensions for furniture, fit for clothing, capacity or compatibility for electronics, and quantity or unit price for consumables. Put that attribute where products are compared.
3. Pull visual character from the merchandise. For furniture, use room photography for scale, a close crop for grain, and aligned dimensions beneath each image. For apparel, use consistent on-body crops and readable size controls. Both layouts can share the same neutral buttons and inputs.

## Enforce these component rules

| Element | Avoid | Use instead |
| --- | --- | --- |
| Color | Purple, pale violet, lavender, indigo-to-pink gradients, neon cyan, or any other automatic “AI” accent. Avoid swapping every purple surface for another arbitrary hue. | Use the approved brand palette. In its absence, use a warm white canvas, near-black text, neutral dividers, and a solid dark primary action. Introduce a chromatic accent only when the brief gives it a role. An actual violet product or finish keeps its true color. |
| Buttons | Glows at rest or on hover, blurred colored shadows, pulsing halos, gradient fills, shimmer, bouncing arrows, and hover enlargement. | Use a flat solid primary button with a specific verb, such as **Add to bag**. Use a small fill change on hover or press. Keep a crisp, contrasting keyboard focus outline. Give secondary actions less visual weight. |
| Tags and badges | Automatic “Premium”, “Trending”, “Curated”, “Best seller”, or sparkle labels above headings. Avoid turning ordinary specs into rows of pills. | Put facts in plain text. Keep chips when shoppers can act on them, such as removing an applied filter. Use a status label when it changes the buying decision and the data supports it, such as **Sold out** for the selected size. |
| Borders and containers | Multicolor outlines, gradient strokes, violet borders on every input, nested rounded cards, or a shadow under every product. | Group with spacing and alignment first. Use a neutral divider for rows and an identifiable boundary for inputs. Reserve elevation for a genuinely overlapping surface such as a menu. Keep selected, focused, and invalid controls distinguishable. |
| Layout and copy | Giant slogan-only heroes, a bento grid for ordinary lists, decorative numbering, icon tiles for simple facts, or filler above every section. | Give search and categories a visible entry point. Use a product grid for browsing, aligned rows for totals, and headings that name the content. Add copy only when it answers a shopper’s question or guides an action. |
| Imagery and motion | Gradient blobs behind products, fake review stars, perpetual animation, or decorative glass panels over prices. | Use product images with consistent crops and legible prices on a stable surface. Animate a meaningful change such as opening a drawer. Respect reduced-motion preferences. |

Apply an explicitly requested brand treatment narrowly. A brand-approved purple logo, for example, grants no reason to add lavender input borders or glowing purchase buttons. Treat focus outlines, validation errors, stock states, selected swatches, and removable filters as functional UI. Preserve their meaning when simplifying the styling.

## Compose the shopping flow

Apply the rows for the screens in scope. Use the store’s actual products, currency, policies, and fulfilment data.

| Screen | Required decisions and behavior |
| --- | --- |
| Home and search | Expose category routes and search. Distinguish query suggestions, categories, and individual products. Preserve editable search text in empty results and offer a useful recovery action. |
| Category results | Show image, name, price, and the deciding category attribute in a consistent order. Expose active filters as removable controls. Restore filters and scroll position when returning from a product. |
| Product detail | Pair gallery, named variant, price, availability, and purchase action. Update them together when a variant changes. Show scale or measurements where relevant. Surface delivery cost or PIN-code check and a concise returns summary near the buying decision. |
| Bag and checkout | Show selected variants, editable quantities, delivery charges or a clearly labelled estimate, and payable total. Make guest checkout easy to find where supported. Preserve inputs on error. Put the amount on the final payment action and use one payment-method selector when the gateway hosts it. |
| Payment and order detail | Distinguish pending, confirmed, and failed payments using server-confirmed status. For pending payments, offer a status check and order reference. Offer retry after confirmed failure. Show tracking once a shipment exists. |

**Example product tile** — Start with the lamp image, then **Arc table lamp**, **32 cm tall · Metal**, and **₹2,499**. A “Premium lighting” pill, sparkle icon, glowing frame, and “Discover excellence” subtitle add four elements without helping someone choose a lamp. Remove all four. If its clay finish is unavailable, show **Clay sold out** next to that option and keep other finishes selectable.

## Review the rendered UI before handoff

- Inspect a narrow phone layout and a desktop layout with realistic data. Try a long title, a missing image, an unavailable variant, and a large price. Check that buyers can still compare items and reach the primary action.
- Inspect the primary button at rest, hover, press, keyboard focus, and loading. Remove decorative glow from pseudo-elements and hover styles as well as the base button. Preserve visible focus and prevent repeated submission while busy.
- For each badge, ask what a shopper learns or can do and which data supports the claim. Delete decorative labels. Keep meaningful status text and active filters understandable without color alone.
- Check theme tokens and component overrides for accidental violet fills, branded-looking gradients, bright borders, and colored shadows. Review their purpose before changing them. Verify text and control contrast, keyboard navigation, and that sticky actions do not cover fields or errors.
- Walk one realistic shopping task through the changed screens. Verify price and variant continuity, total visibility, and recovery from errors. Report what you actually checked and identify any state or viewport you could not inspect.
