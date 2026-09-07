# Dhaaba 420 — Single-File Food Ordering Template

This repository contains a single-page, zero-backend food-ordering template built around WhatsApp ordering and UPI payment. The core idea: one HTML file (no server), instant deploy, mobile-first, emotion-driven UI — easy to reskin and sell as a template.

---

## 1. Philosophy

- No server, no DB, no accounts. Orders go through WhatsApp (`wa.me`) and payments via UPI QR sent manually.
- Single `index.html` containing HTML, CSS, and JS for simple deployment.
- Mobile-first UX with a fast ordering flow: browse, fill details, send on WhatsApp.
- Emotion-first design: visuals, type, animations create appetite.
- Bilingual support via `data-en` / `data-mr` attributes.

---

## 2. Tech Stack

- HTML5 (single file)
- Vanilla CSS (in-file) — CSS variables for theming
- Vanilla JavaScript (no build tools)
- Google Fonts (Bebas Neue, Baloo 2, Kalam)
- Hosting: Vercel / GitHub Pages
- Orders: WhatsApp `wa.me` URL
- Payments: Manual UPI QR

---

## 3. Color System

Define a small palette with CSS variables in `:root`:

```css
:root {
	--dark:    #0F0500;
	--saffron: #FF6B00; /* primary */
	--turmeric:#F5C518; /* secondary */
	--cream:   #FFF5E4;
	--green:   #27AE60;
	--wa:      #25D366;
	--deep:    #C0392B;
}
```

To reskin: change `--saffron` and `--turmeric` (or entire palette).

---

## 4. Typography

- `Bebas Neue` — headings, brand
- `Baloo 2` — body, buttons
- `Kalam` — tagline, chips

Load via a single Google Fonts link.

---

## 5. Page Structure (Schema)

- `NAV` — brand, links, language toggle
- `HERO` — big brand, watermark, taglines, CTAs
- `MARQUEE` — scrolling highlights
- `MENU` — JS-rendered grid from `MENU` array
- `HOW IT WORKS` — 4-step cards
- `ABOUT` — founder story
- `FOOTER` — brand, WhatsApp CTA

Everything is mobile-first and scroll-friendly.

---

## 6. MENU Data Schema

Each item is an object in `const MENU = [...]`:

```js
{
	id, name, nameMr, emoji, price, spice,
	badge, badgeMr, badgeGold,
	desc, descMr
}
```

Special-case: `price:0` → "Request on WhatsApp" link.

---

## 7. Cart & Modal Flow

Cart state (in-memory) and helper functions:

- `cart = {}`
- `addOne(id)`, `changeQty(id, delta)`
- `refreshCard(id)` toggles add/qty UI
- `refreshFab()` updates floating cart count
- Modal steps: Cart → Details → Confirm → Success

Validation on details screen (name + SC code).

---

## 8. WhatsApp Order Message

Build a bilingual payload and open via `wa.me`:

- Generate `orderId` (e.g., DH-3647)
- Render item lines (emoji, name, qty, price)
- Include English block, then Marathi block (or chosen language)
- Encode via `encodeURIComponent` and open:

```js
window.open(`https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(msg)}`)
```

Config constants at top of file:

```js
const OWNER_WHATSAPP = "91XXXXXXXXXX"; // no +
const BRAND_UPI      = "brand@upi";
```

---

## 9. Language System

- Use `data-en` / `data-mr` attributes on every visible text node.
- Add `data-html="true"` for elements containing HTML.
- `applyLanguage()` toggles textContent or innerHTML and re-renders dynamic UI.

---

## 10. Animations & UI Details

Common CSS animations used:
- `floatY`, `slamIn`, `fadeUp`, `chipIn`, `scrollL`, `sparkFly`, `bounce`.
- `IntersectionObserver` for scroll reveal.

Design touches:
- Background watermark (large word) with low opacity
- Floating emoji decorations to convey taste
- Hero gradient text via `background-clip: text`

---

## 11. Favicon

Inline SVG favicon works but browsers cache aggressively and emoji rendering varies. Consider adding a `favicon.png` (32×32) for reliability.

```html
<link rel="icon" href="/favicon.png" />
```

---

## 12. Deployment

- Vercel: connect GitHub repo → instant deploy. `vercel.json` may contain a rewrite to `/index.html`.
- GitHub Pages: enable Pages on `main`/root.

---

## 13. Selling as a Template — Checklist

- Replace `OWNER_WHATSAPP` and `BRAND_UPI`
- Update `MENU` with client items and prices
- Swap color variables for brand theme
- Update brand name and favicon
- Localize `data-xx` attributes if needed
- Test full WhatsApp order flow on mobile
- Deploy and verify links

Include documentation (this README) and a small `CHANGELOG` or `CUSTOMIZE.md` for buyers.

---

## 14. How to Customize Quickly

- Brand color: edit `--saffron` + `--turmeric`
- Brand name & title: update `<title>` and `nav-logo` + `ft-logo`
- WhatsApp number: update `OWNER_WHATSAPP` constant
- Fonts: update Google Fonts link and font-family usage
- Menu: edit `MENU` array objects

---

## 15. Licensing & Notes

If you sell this as a template, include a short license (MIT) and a `credits.txt` for original assets (fonts are Google Fonts — free to use). Avoid selling copies that include proprietary images you don't own.

---
