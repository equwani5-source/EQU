// ============================================================
// Wahh Kids — Layout chrome (announcement, navbar, footer, chat, cart drawer)
// ============================================================
import { store } from '../store.js';
import { PRODUCTS, CATEGORIES, formatINR, byId } from '../data.js';
import { garmentSVG } from '../svg.js';
import { el, qs, qsa, toast, debounce } from '../ui.js';
import { navigate } from '../router.js';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/shop', label: 'Shop' },
  { path: '/shop?collection=summer', label: 'Collections' },
  { path: '/lookbook', label: 'Lookbook' },
  { path: '/blog', label: 'Blog' },
  { path: '/about', label: 'About' },
];

export function mountLayout() {
  renderAnnouncement();
  renderNavbar();
  renderFooter();
  renderChat();
  renderCartDrawer();
  window.addEventListener('open-cart', openCart);
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ---------------- Announcement ----------------
const ANN = [
  '✨ Welcome to Wahh Kids — premium magic for little stars!',
  '🚚 Free shipping on orders over ₹999 with code FREESHIP',
  '🎉 Festival Magic collection is live — sparkle without the fuss',
  '💖 Earn loyalty stars on every order',
];
function renderAnnouncement() {
  const host = document.getElementById('announcement');
  let i = 0;
  const set = () => host.innerHTML = `<div class="ann"><div class="ann__track"><span>${ANN[i]}</span></div></div>`;
  set();
  setInterval(() => { i = (i + 1) % ANN.length; set(); }, 4200);
  document.documentElement.style.setProperty('--ann-h', '38px');
}

// ---------------- Navbar ----------------
function renderNavbar() {
  const host = document.getElementById('navbar');
  host.innerHTML = `
  <nav class="nav" id="navEl">
    <div class="nav__inner">
      <a class="brand" href="#/">
        <span class="brand__mark">🌟</span>
        <span>Wahh<span>Kids</span></span>
      </a>
      <div class="nav__links">
        ${NAV_LINKS.map(l => `<a href="#${l.path}" data-path="${l.path}">${l.label}</a>`).join('')}
      </div>
      <div class="nav__actions">
        <button class="icon-btn" id="searchBtn" title="Search" aria-label="Search">🔍</button>
        <a class="icon-btn" href="#/wishlist" title="Wishlist" aria-label="Wishlist">🤍<span class="count" id="wishCount" hidden>0</span></a>
        <a class="icon-btn" href="#/account" title="Account" aria-label="Account">👤</a>
        <button class="icon-btn" id="cartBtn" title="Cart" aria-label="Cart">🛒<span class="count" id="cartCount" hidden>0</span></button>
        <button class="icon-btn nav__burger" id="burger" title="Menu" aria-label="Menu">☰</button>
      </div>
      <div class="glass search-pop" id="searchPop">
        <div style="display:flex;gap:.5rem;align-items:center">
          <input id="searchInput" type="search" placeholder="Search magical styles…" autocomplete="off" />
          <button class="icon-btn" id="voiceBtn" title="Voice search">🎤</button>
        </div>
        <div class="search-tags">
          <button data-q="dress">Dresses</button><button data-q="hoodie">Hoodies</button>
          <button data-q="shoes">Shoes</button><button data-q="newborn">Newborn</button>
          <button data-q="festival">Festival</button>
        </div>
        <div class="search-sug" id="searchSug"></div>
      </div>
    </div>
  </nav>`;

  qs('#cartBtn').addEventListener('click', openCart);
  qs('#burger').addEventListener('click', openMobileNav);

  // Search
  const pop = qs('#searchPop'), input = qs('#searchInput'), sug = qs('#searchSug');
  qs('#searchBtn').addEventListener('click', () => {
    pop.classList.toggle('open');
    if (pop.classList.contains('open')) { input.focus(); renderSug(''); }
  });
  document.addEventListener('click', (e) => {
    if (!pop.contains(e.target) && e.target.id !== 'searchBtn' && pop.classList.contains('open')) pop.classList.remove('open');
  });
  const renderSug = (q) => {
    const term = q.trim().toLowerCase();
    let list = term
      ? PRODUCTS.filter(p => (p.name + p.category + p.type + p.tags.join(' ') + p.collection.join(' ')).toLowerCase().includes(term))
      : PRODUCTS.slice().sort((a, b) => b.sold - a.sold);
    list = list.slice(0, 6);
    if (!list.length) { sug.innerHTML = `<p class="muted" style="padding:.6rem">No matches for “${q}”. Try “dress” or “shoes”.</p>`; return; }
    sug.innerHTML = list.map(p => `<a href="#/product/${p.id}" data-close>
      <span class="thumb">${garmentSVG(p.type, p.colors[0].hex)}</span>
      <span style="flex:1"><strong>${p.name}</strong><br><span class="muted" style="font-size:.8rem">${p.category} · ${formatINR(p.price)}</span></span>
    </a>`).join('');
    qsa('a[data-close]', sug).forEach(a => a.addEventListener('click', () => pop.classList.remove('open')));
  };
  input.addEventListener('input', debounce((e) => renderSug(e.target.value), 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { pop.classList.remove('open'); navigate('/shop?q=' + encodeURIComponent(input.value)); }
  });
  qsa('.search-tags button', pop).forEach(b => b.addEventListener('click', () => {
    input.value = b.dataset.q; renderSug(b.dataset.q);
  }));

  // Voice search UI (Web Speech API where available)
  qs('#voiceBtn').addEventListener('click', () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice search is not supported in this browser', 'info', '🎤'); return; }
    const rec = new SR(); rec.lang = 'en-IN'; rec.interimResults = false;
    qs('#voiceBtn').textContent = '🔴';
    rec.onresult = (ev) => { input.value = ev.results[0][0].transcript; renderSug(input.value); };
    rec.onend = () => qs('#voiceBtn').textContent = '🎤';
    rec.onerror = () => { qs('#voiceBtn').textContent = '🎤'; toast('Could not hear that, try again', 'info'); };
    try { rec.start(); } catch {}
  });
}

function onScroll() {
  const nav = qs('#navEl');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 30);
}

export function setActiveNav(path) {
  qsa('.nav__links a').forEach(a => {
    const p = a.getAttribute('data-path');
    a.classList.toggle('active', p === path || (p === '/' && path === '/'));
  });
}

// ---------------- Mobile nav ----------------
function openMobileNav() {
  let m = document.getElementById('mobileNav');
  if (!m) {
    m = el(`<div class="mobile-nav" id="mobileNav"><div class="mobile-nav__panel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <span class="brand"><span class="brand__mark">🌟</span> Wahh<span style="color:var(--bubblegum)">Kids</span></span>
        <button class="icon-btn" id="mClose">✕</button>
      </div>
      ${NAV_LINKS.concat([{path:'/wishlist',label:'Wishlist'},{path:'/cart',label:'Cart'},{path:'/account',label:'My Account'},{path:'/track',label:'Track Order'},{path:'/admin',label:'Admin'}]).map(l=>`<a href="#${l.path}">${l.label}</a>`).join('')}
    </div></div>`);
    document.body.appendChild(m);
    m.addEventListener('click', (e) => { if (e.target === m || e.target.id === 'mClose' || e.target.tagName === 'A') m.classList.remove('open'); });
  }
  requestAnimationFrame(() => m.classList.add('open'));
}

// ---------------- Footer ----------------
function renderFooter() {
  const host = document.getElementById('footer');
  host.innerHTML = `
  <div class="footer">
    <div class="footer__wave">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style="width:100%;height:60px"><path fill="#f1ecff" d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,40 L1440,0 L0,0 Z"></path></svg>
    </div>
    <div class="footer__inner">
      <div class="footer__brand">
        <span class="brand" style="color:#fff;font-size:1.5rem"><span class="brand__mark">🌟</span> Wahh<span>Kids</span></span>
        <p>Magical, premium fashion for little stars. Crafted with organic cotton, big imagination and a whole lot of love.</p>
        <div class="footer__social">
          <a href="#/" title="Instagram">📸</a><a href="#/" title="YouTube">▶️</a>
          <a href="#/" title="Facebook">👍</a><a href="#/" title="Pinterest">📌</a>
        </div>
      </div>
      <div>
        <h4>Shop</h4>
        ${CATEGORIES.map(c => `<a href="#/shop?category=${c.slug}">${c.name}</a><br>`).join('')}
      </div>
      <div>
        <h4>Help</h4>
        <a href="#/track">Track Order</a><br><a href="#/faq">FAQ</a><br>
        <a href="#/returns">Returns &amp; Refunds</a><br><a href="#/contact">Contact Us</a><br>
        <a href="#/shop">Size Guide</a>
      </div>
      <div>
        <h4>Join the Magic</h4>
        <p style="color:#b4a8e0;font-size:.9rem">Get 10% off your first order &amp; early access to drops.</p>
        <form id="footNews" style="display:flex;gap:.5rem;margin-top:.6rem">
          <input type="email" required placeholder="Your email" style="flex:1;padding:.7rem .9rem;border-radius:999px;border:none;outline:none" />
          <button class="btn btn--sm" type="submit">Join</button>
        </form>
        <div style="margin-top:1rem"><a href="#/about">About</a> · <a href="#/blog">Blog</a> · <a href="#/admin">Admin</a></div>
      </div>
    </div>
    <div class="footer__bottom">
      <div>© ${new Date().getFullYear()} Wahh Kids. Crafted with 💜 — a demo experience, no real payments are processed.</div>
      <div class="footer__pay"><span>UPI</span><span>QR Pay</span><span>Cash on Delivery</span><span>Privacy</span><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a></div>
    </div>
  </div>`;
  const f = qs('#footNews');
  if (f) f.addEventListener('submit', (e) => { e.preventDefault(); toast('You\'re on the list! Check your inbox 💌', 'ok'); f.reset(); });
}

// ---------------- Chat widget ----------------
const BOT = {
  hi: 'Hi! I\'m Twinkle ✨ your Wahh Kids helper. Ask me about sizing, shipping, returns or payments!',
  reply(text) {
    const t = text.toLowerCase();
    if (/size|fit/.test(t)) return 'Every product page has a size chart. Our sizes run by age + measurement — pick your child\'s age and you\'re golden! 📏';
    if (/ship|deliver/.test(t)) return 'Metro cities get orders in 2–4 days, rest of India 4–7 days. Free shipping over ₹999 with code FREESHIP 🚚';
    if (/return|refund/.test(t)) return 'Easy 15-day returns on unworn items with tags. See Returns & Refunds for details 💫';
    if (/pay|upi|cod|cash/.test(t)) return 'We accept UPI, QR payment and Cash on Delivery. (This demo never charges real money!) 💳';
    if (/track/.test(t)) return 'Head to Track Order or your Account → Orders to follow every step 📦';
    if (/coupon|discount|offer/.test(t)) return 'Try WAHH10 for 10% off, or MAGIC20 for 20% off orders over ₹1500 🎉';
    if (/hi|hello|hey/.test(t)) return 'Hello there! How can I sprinkle some help today? ✨';
    return 'Great question! For anything specific, our team replies within minutes. Meanwhile, explore the Shop — it\'s full of magic 🪄';
  }
};
function renderChat() {
  const host = document.getElementById('chat');
  host.innerHTML = `
    <button class="chat-fab" id="chatFab" title="Chat with us">💬</button>
    <div class="chat-panel glass" id="chatPanel">
      <div class="chat-panel__head"><span style="font-size:1.4rem">✨</span><div><strong>Twinkle</strong><br><span style="font-size:.75rem;opacity:.85">Online · replies instantly</span></div></div>
      <div class="chat-panel__body" id="chatBody"></div>
      <form class="chat-panel__foot" id="chatForm">
        <input id="chatInput" placeholder="Type a message…" autocomplete="off" />
        <button class="btn btn--sm" type="submit">➤</button>
      </form>
    </div>`;
  const panel = qs('#chatPanel'), body = qs('#chatBody');
  const add = (msg, who) => { body.appendChild(el(`<div class="chat-msg ${who}">${msg}</div>`)); body.scrollTop = body.scrollHeight; };
  qs('#chatFab').addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && !body.childElementCount) add(BOT.hi, 'bot');
  });
  qs('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = qs('#chatInput').value.trim(); if (!v) return;
    add(v, 'me'); qs('#chatInput').value = '';
    setTimeout(() => add(BOT.reply(v), 'bot'), 600);
  });
}

// ---------------- Cart drawer ----------------
function renderCartDrawer() {
  const host = document.getElementById('cartDrawer');
  host.innerHTML = `
    <div class="drawer-overlay" id="cartOverlay"></div>
    <aside class="drawer" id="cartDrawerEl" aria-label="Cart">
      <div class="drawer__head">
        <h3 style="margin:0">Your Bag 🛍️</h3>
        <button class="icon-btn" id="cartClose">✕</button>
      </div>
      <div class="drawer__body" id="cartBody"></div>
        <div class="drawer__foot" id="cartFoot"></div>
    </aside>`;
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
}

function openCart() { drawCart(); document.getElementById('cartOverlay').classList.add('open'); document.getElementById('cartDrawerEl').classList.add('open'); }
function closeCart() { document.getElementById('cartOverlay').classList.remove('open'); document.getElementById('cartDrawerEl').classList.remove('open'); }

function drawCart() {
  const body = qs('#cartBody') || document.querySelector('#cartDrawerEl .drawer__body');
  const foot = qs('#cartFoot');
  const lines = store.cartDetailed();
  if (!lines.length) {
    body.innerHTML = `<div class="empty-state"><div class="emoji">🛒</div><h3>Your bag is empty</h3><p class="muted">Let's fill it with magic!</p><a class="btn" href="#/shop" id="goShop">Start Shopping</a></div>`;
    foot.innerHTML = '';
    const g = body.querySelector('#goShop'); if (g) g.addEventListener('click', closeCart);
    return;
  }
  body.innerHTML = lines.map(line => `
    <div class="cart-line" data-idx="${line.idx}">
      <div class="cart-line__media">${garmentSVG(line.product.type, swatchHex(line.product, line.color))}</div>
      <div>
        <strong style="font-size:.95rem">${line.product.name}</strong>
        <div class="muted" style="font-size:.8rem">${line.color} · ${line.size}</div>
        <div class="qty" style="margin-top:.4rem">
          <button data-dec>−</button><span>${line.qty}</span><button data-inc>+</button>
        </div>
      </div>
      <div style="text-align:right">
        <strong>${formatINR(line.product.price * line.qty)}</strong><br>
        <button class="muted" data-rm style="font-size:.78rem;text-decoration:underline">Remove</button>
      </div>
    </div>`).join('');

  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  foot.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:.4rem"><span class="muted">Subtotal</span><strong>${formatINR(subtotal)}</strong></div>
    <p class="muted" style="font-size:.8rem;margin:.2rem 0 .8rem">Shipping &amp; taxes calculated at checkout.</p>
    <a class="btn btn--block" href="#/checkout" id="goCheckout">Checkout · ${formatINR(subtotal)}</a>
    <a class="btn btn--ghost btn--block" href="#/cart" id="goCart" style="margin-top:.5rem">View full cart</a>`;

  body.querySelectorAll('.cart-line').forEach(row => {
    const idx = +row.dataset.idx;
    row.querySelector('[data-inc]').addEventListener('click', () => { store.updateQty(idx, 1); drawCart(); });
    row.querySelector('[data-dec]').addEventListener('click', () => { store.updateQty(idx, -1); drawCart(); });
    row.querySelector('[data-rm]').addEventListener('click', () => { store.removeFromCart(idx); drawCart(); });
  });
  foot.querySelector('#goCheckout').addEventListener('click', closeCart);
  foot.querySelector('#goCart').addEventListener('click', closeCart);
}

function swatchHex(p, colorName) {
  const c = p.colors.find(c => c.name === colorName); return c ? c.hex : p.colors[0].hex;
}

// ---------------- Chrome refresh ----------------
export function refreshChrome() {
  const s = store.get();
  const cc = store.cartCount();
  const cce = document.getElementById('cartCount');
  if (cce) { cce.textContent = cc; cce.hidden = cc === 0; }
  const wc = s.wishlist.length;
  const wce = document.getElementById('wishCount');
  if (wce) { wce.textContent = wc; wce.hidden = wc === 0; }
  // redraw cart drawer if open
  if (document.getElementById('cartDrawerEl')?.classList.contains('open')) drawCart();
}
