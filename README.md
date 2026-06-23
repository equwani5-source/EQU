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


---

## 🔌 Connect a real backend (Firebase) — admin login + live stock

The store works out of the box in **demo mode** (changes stay on your device). To get
a **real admin login** and **stock/photos that update live for every visitor**, connect
a free Firebase project. No build step required — Firebase loads from a CDN.

### One-time setup (free)
1. Go to **https://console.firebase.google.com** → **Add project**.
2. Inside the project, click the **Web** icon (`</>`) to register a web app. Firebase shows
   a `firebaseConfig` object — copy those values.
3. Paste them into **`js/firebase-config.js`** (replace the empty `""` values), then commit.
4. **Build → Firestore Database → Create database** (Production mode).
5. **Build → Authentication → Sign-in method →** enable **Email/Password**.
6. **Authentication → Users → Add user**: create your admin email + password.
7. **Firestore → Rules** tab → paste the rules below → **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /store/inventory {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /productImages/{id} {
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Only YOUR admin account may write. Replace the email below.
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == 'YOUR_ADMIN_EMAIL';
    }

    // Live stock: anyone can read; only admin can write a valid map
    match /store/inventory {
      allow read: if true;
      allow write: if isAdmin() && request.resource.data.stock is map;
    }

    // Product photos: anyone can read; admin can write a size-limited image string
    match /productImages/{id} {
      allow read: if true;
      allow create, update: if isAdmin()
        && request.resource.data.dataUrl is string
        && request.resource.data.dataUrl.size() < 1000000;
      allow delete: if isAdmin();
    }

    // Lock everything else by default
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

That's it. Now `#/admin` asks for your admin login, and the **Products** tab lets you set
**live stock** and **upload photos** that instantly update for everyone.

> Product photos are compressed in the browser and stored directly in Firestore (kept well
> under the 1 MB document limit), so you don't need the paid Storage add-on.

### Notes
- The Firebase web config values are **not secret** — they're safe to commit publicly.
  Security is enforced by the Firestore Rules above.
- **Replace `YOUR_ADMIN_EMAIL`** in the rules with the exact email you created in
  Authentication → Users. Only that account can change stock/photos; the public can only read.
- Optional hardening: in Google Cloud Console → APIs & Services → Credentials, restrict the
  browser API key to your domains (e.g. `*.github.io`) to stop other sites using your project.
- Until you fill in the config, everything keeps working in local demo mode.
