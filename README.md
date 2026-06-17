# 🌟 Wahh Kids — Magical 3D Kids Fashion Store

A world-class, premium, fully interactive **3D e-commerce experience** for a children's
clothing brand. Built as a **zero-build static site** (plain HTML + CSS + native ES modules)
so it deploys anywhere — no bundler, no install step, no server required.

> Note: This is a front-end demo experience. Orders, accounts, payments and inventory are
> simulated and persisted in your browser's `localStorage`. No real money is charged and no
> data leaves your device.

---

## ✨ Highlights

- **Immersive 3D hero** (Three.js): an animated water surface with mouse-driven ripples,
  floating clothes & toys, balloons, drifting clouds, rising bubbles, sparkle particles,
  a mouse-follow light and parallax camera.
- **360° product viewer**: every product renders as a rotatable, zoomable 3D garment with
  live colour switching (drag to rotate, scroll to zoom, auto-rotate).
- **Premium UI/UX**: glassmorphism, soft gradients, 3D tilt cards, scroll reveals, water-splash
  button ripples, animated loader mascot, confetti on order success.
- **Full e-commerce flow**: catalog → filters/search → product → cart → checkout → order
  confirmation → tracking — all working end to end.
- **Graceful fallbacks**: if WebGL or the CDN is unavailable, rich SVG/CSS visuals remain.
- **Fully responsive** with a dedicated mobile navigation.

## 🛍️ Features

| Area | What's included |
|------|-----------------|
| **Home** | 3D hero, trust marquee, categories, new arrivals, flash sale countdown, trending, best sellers, seasonal collections, testimonials, Instagram wall, newsletter |
| **Shop** | Filters (category, collection, gender, price range, age, size, colour), sorting, active-filter chips, URL sync, predictive + voice search (in navbar) |
| **Product** | 3D 360° viewer, colour/size switch, gallery thumbnails, size chart, reviews & ratings, frequently-bought-together bundle, related & recently-viewed, compare |
| **Cart** | Quantity update, remove, save-for-later, coupons, free-shipping progress, live totals |
| **Wishlist** | Add/remove, add-all-to-cart, share link |
| **Checkout** | Guest/user, saved + new addresses, shipping calculator, gift wrap, coupon, tax, payment via **UPI / QR / Cash on Delivery**, order confirmation |
| **Account** | Register / login / password reset, overview, order history, addresses, loyalty stars, recently viewed, profile |
| **Admin** | Dashboard analytics, products, categories, orders (status updates), customers, coupons, banners |
| **Content** | About, Contact (form), FAQ, Privacy, Terms, Returns, Blog + posts, Lookbook, Order tracking, Compare |
| **Extras** | Live chat widget, loyalty/rewards, gift wrap, flash-sale & stock countdowns, announcement bar, toasts |

## 🚀 Run locally

No build step needed. Because it uses ES modules, serve it over HTTP (not `file://`):

```bash
# from the project root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, `php -S localhost:8000`, VS Code Live Server, etc.).

## 🌐 Deploy (free)

**GitHub Pages**
1. Push this repo to GitHub.
2. Settings → Pages → Source: `Deploy from a branch` → branch `main`, folder `/ (root)`.
3. Your store goes live at `https://<user>.github.io/<repo>/`.

It also drops straight onto **Netlify**, **Vercel**, **Cloudflare Pages** or any static host —
just point them at the repo root (no build command, publish directory = `/`).

## 🧱 Tech & structure

- **Three.js** loaded at runtime from a CDN via an [import map](https://developer.mozilla.org/docs/Web/HTML/Element/script/type/importmap) — no `node_modules`.
- Vanilla ES modules, a tiny hash router, and a reactive `localStorage`-backed store.
- Fonts: *Baloo 2* + *Plus Jakarta Sans* (Google Fonts).

```
index.html              # entry + import map
css/                    # styles, animations, responsive
js/
  main.js               # bootstrap + routes
  router.js  store.js  ui.js  data.js  svg.js  cartmath.js
  components/           # layout chrome + product card
  three/scene.js        # hero world + 360° product viewer
  pages/                # home, shop, product, cart, wishlist,
                        # checkout, account, admin, misc
```

## 🎟️ Try these

- Coupons: `WAHH10`, `MAGIC20`, `FREESHIP`, `STAR250`
- Admin console: open **`#/admin`** (or footer → Admin)
- Place an order, then **track** it from your account.

---

Crafted with 💜 for little stars.
