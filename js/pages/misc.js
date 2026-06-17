// ============================================================
// Wahh Kids — Misc pages (about, contact, faq, policies, track, compare, blog, lookbook, 404)
// ============================================================
import { store } from '../store.js';
import { byId, BLOG, FAQS, CATEGORIES, COLLECTIONS, formatINR, discountPct } from '../data.js';
import { garmentSVG } from '../svg.js';
import { el, qs, qsa, toast, starRow } from '../ui.js';
import { navigate } from '../router.js';

const wrap = (inner) => el(`<div class="page-pad"><div class="container">${inner}</div></div>`);

// ---------------- ABOUT ----------------
export function AboutPage() {
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>About</strong></div>
    <div class="head"><span class="eyebrow">🌟 Our story</span><h1>We make childhood <span class="gtext">magical</span></h1><p>Wahh Kids began with a simple wish: clothing that's as joyful, soft and durable as childhood deserves.</p></div>
    <div class="card glass" style="padding:2rem;margin-bottom:1.5rem">
      <p class="muted" style="font-size:1.05rem">Founded by parents, for parents, Wahh Kids blends premium organic fabrics with playful, imaginative design. Every stitch is crafted to survive puddle-jumps, paint days and a thousand cuddles — while keeping little ones comfy and looking adorable.</p>
    </div>
    <div class="stat-row" style="margin:1.5rem 0">
      ${[['50k+','Happy families','var(--grad-grape)'],['100%','Organic cotton','var(--grad-sea)'],['4.9★','Average rating','var(--grad-candy)'],['24h','Dispatch time','linear-gradient(135deg,#ffcf3f,#ff7a59)']].map(s=>`<div class="stat" style="background:${s[2]}"><div class="v">${s[0]}</div><div class="l">${s[1]}</div></div>`).join('')}
    </div>
    <div class="feat-grid">
      ${[['🌱','Sustainable','OEKO-TEX certified, low-impact dyes and recyclable packaging.'],['🤝','Ethically made','Fair wages and safe conditions across our partner workshops.'],['💜','Made with love','Designed in-house by parents who obsess over every detail.']].map(f=>`<div class="card feat"><div class="ic">${f[0]}</div><h3 style="font-size:1.1rem">${f[1]}</h3><p class="muted" style="font-size:.92rem">${f[2]}</p></div>`).join('')}
    </div>
    <div class="news" style="margin-top:2rem"><h2>Join our magical journey</h2><p style="opacity:.95">Thousands of families already trust Wahh Kids. Come be part of the sparkle.</p><a class="btn btn--sun btn--lg" href="#/shop" style="margin-top:1rem">Shop the collection</a></div>`);
  return { node, title: 'About' };
}

// ---------------- CONTACT ----------------
export function ContactPage() {
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Contact</strong></div>
    <div class="head"><span class="eyebrow">💬 We're here to help</span><h1>Get in <span class="gtext--candy">touch</span></h1></div>
    <div style="display:grid;grid-template-columns:1fr 1.3fr;gap:30px" class="row2">
      <div style="display:flex;flex-direction:column;gap:1rem">
        ${[['📧','Email','hello@wahhkids.example'],['📞','Phone','+91 98765 43210'],['💬','Live chat','Tap the bubble, bottom-left'],['📍','Studio','Bandra West, Mumbai, India']].map(c=>`<div class="card" style="padding:1.2rem;display:flex;gap:1rem;align-items:center"><div style="font-size:1.6rem">${c[0]}</div><div><strong>${c[1]}</strong><div class="muted" style="font-size:.9rem">${c[2]}</div></div></div>`).join('')}
      </div>
      <form class="card" style="padding:1.6rem" id="contactForm">
        <h3 style="margin-top:0">Send us a message</h3>
        <div class="row2"><div class="field"><label>Name</label><input id="cn" required/></div><div class="field"><label>Email</label><input id="ce" type="email" required/></div></div>
        <div class="field"><label>Subject</label><input id="cs"/></div>
        <div class="field"><label>Message</label><textarea id="cm" rows="5" required></textarea></div>
        <button class="btn btn--block" type="submit">Send message ✨</button>
      </form>
    </div>`);
  qs('#contactForm', node).addEventListener('submit', (e) => { e.preventDefault(); toast('Thanks! We\'ll reply within a few hours 💌','ok'); e.target.reset(); });
  return { node, title: 'Contact' };
}

// ---------------- FAQ ----------------
export function FaqPage() {
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>FAQ</strong></div>
    <div class="head"><span class="eyebrow">❓ Help centre</span><h1>Frequently asked <span class="gtext">questions</span></h1></div>
    <div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:.7rem">
      ${FAQS.map(f=>`<details class="card" style="padding:1.1rem 1.3rem"><summary style="cursor:pointer;font-weight:700;font-size:1.05rem">${f.q}</summary><p class="muted" style="margin:.7rem 0 0">${f.a}</p></details>`).join('')}
    </div>
    <div class="center" style="margin-top:2rem"><p class="muted">Still need help?</p><a class="btn" href="#/contact">Contact us</a></div>`);
  return { node, title: 'FAQ' };
}

// ---------------- POLICY (privacy/terms/returns) ----------------
const POLICIES = {
  privacy: { title: 'Privacy Policy', emoji: '🔒', body: [
    ['What we collect','We collect only what we need to fulfil your order — name, contact details and shipping address. In this demo, all data stays in your browser\'s local storage and is never sent to a server.'],
    ['How we use it','To process orders, personalise recommendations and (with consent) send you delightful updates. We never sell your data.'],
    ['Cookies & storage','We use local storage to remember your cart, wishlist and preferences. You can clear it anytime from your browser.'],
    ['Your rights','You can request access, correction or deletion of your data at any time by contacting us.'],
  ]},
  terms: { title: 'Terms & Conditions', emoji: '📜', body: [
    ['Demo notice','Wahh Kids is a demonstration storefront. No real transactions occur and no goods are shipped.'],
    ['Use of site','Please use the site lawfully and respectfully. Content and designs are for demonstration purposes.'],
    ['Pricing','All prices are illustrative and shown in Indian Rupees (₹), inclusive of applicable demo taxes.'],
    ['Liability','As a demo, the site is provided "as is" without warranties of any kind.'],
  ]},
  returns: { title: 'Returns & Refunds', emoji: '↩️', body: [
    ['15-day returns','Return unworn items with tags within 15 days for a full refund or exchange.'],
    ['How to return','Go to Account → Orders, select the item and follow the prompts. We\'ll arrange a free pickup.'],
    ['Refund timing','Refunds are processed within 5-7 business days to your original payment method.'],
    ['Exceptions','For hygiene, newborn essentials and innerwear are exchange-only unless faulty.'],
  ]},
};
export function PolicyPage(ctx, kind) {
  const p = POLICIES[kind] || POLICIES.privacy;
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>${p.title}</strong></div>
    <div class="head"><div style="font-size:2.6rem">${p.emoji}</div><h1>${p.title}</h1><p class="muted">Last updated June 2026</p></div>
    <div style="max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:1rem">
      ${p.body.map(s=>`<div class="card" style="padding:1.3rem 1.5rem"><h3 style="margin-top:0">${s[0]}</h3><p class="muted" style="margin:0">${s[1]}</p></div>`).join('')}
    </div>`);
  return { node, title: p.title };
}

// ---------------- TRACK ORDER ----------------
export function TrackPage(ctx) {
  const id = ctx.query.id || '';
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Track Order</strong></div>
    <div class="head"><span class="eyebrow">📦 Where's my order?</span><h1>Track your <span class="gtext--sea">order</span></h1></div>
    <div class="card glass" style="padding:1.4rem;max-width:560px;margin:0 auto 1.5rem;display:flex;gap:.5rem">
      <input id="trackId" placeholder="Enter order ID (e.g. WK12345678)" value="${id}" style="flex:1;padding:.8rem 1rem;border-radius:12px;border:1px solid rgba(108,76,241,.2)"/>
      <button class="btn" id="trackBtn">Track</button>
    </div>
    <div id="trackResult" style="max-width:680px;margin:0 auto"></div>`);

  const result = qs('#trackResult', node);
  const doTrack = (oid) => {
    const o = store.get().orders.find(x => x.id === oid);
    if (!o) { result.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div><h3>Order not found</h3><p class="muted">Place an order to see live tracking, or check the ID.</p></div>`; return; }
    result.innerHTML = `
      <div class="card" style="padding:1.6rem">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem"><div><div class="muted" style="font-size:.8rem">Order</div><strong>${o.id}</strong></div><div><div class="muted" style="font-size:.8rem">Status</div><strong>${o.status}</strong></div><div><div class="muted" style="font-size:.8rem">Total</div><strong>${formatINR(o.totals.total)}</strong></div></div>
        <div class="divider"></div>
        <div class="timeline">
          ${(o.tracking||[]).map(s=>`<div class="step ${s.done?'done':''}"><strong>${s.step}</strong><div class="muted" style="font-size:.8rem">${s.done?new Date(s.at).toLocaleString():'Expected '+new Date(s.at).toLocaleDateString()}</div></div>`).join('')}
        </div>
        <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:.6rem">
          ${o.items.map(it=>`<div class="cart-line__media" style="width:48px;height:58px" title="${it.name}">${garmentSVG(it.type, hexFor(it))}</div>`).join('')}
        </div>
      </div>`;
  };
  qs('#trackBtn', node).addEventListener('click', () => doTrack(qs('#trackId', node).value.trim()));
  if (id) doTrack(id);
  else {
    const recent = store.get().orders[0];
    if (recent) result.innerHTML = `<p class="muted center">Tip: your latest order is <a href="#/track?id=${recent.id}" style="text-decoration:underline">${recent.id}</a></p>`;
  }
  return { node, title: 'Track Order' };
}
function hexFor(it){ const p=byId(it.id); if(!p) return '#6c4cf1'; const c=p.colors.find(c=>c.name===it.color); return c?c.hex:p.colors[0].hex; }

// ---------------- COMPARE ----------------
export function ComparePage() {
  const node = wrap(`<div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Compare</strong></div>
    <div class="section__head"><h1 style="margin:0">Compare products ⚖️</h1><button class="btn btn--ghost btn--sm" id="clearCmp">Clear all</button></div>
    <div id="cmpBody" style="margin-top:1.2rem"></div>`);
  const body = qs('#cmpBody', node);
  function draw() {
    const items = store.get().compare.map(byId).filter(Boolean);
    if (!items.length) { body.innerHTML = `<div class="empty-state"><div class="emoji">⚖️</div><h2>Nothing to compare yet</h2><p class="muted">Add up to 4 products using the ⚖️ button on product pages.</p><a class="btn" href="#/shop">Browse products</a></div>`; return; }
    const rows = [
      ['Price', p=>`<strong>${formatINR(p.price)}</strong> ${discountPct(p)?`<span class="was" style="text-decoration:line-through;color:#a79fc7;font-size:.85rem">${formatINR(p.mrp)}</span>`:''}`],
      ['Rating', p=>`${starRow(p.rating)} ${p.rating.toFixed(1)}`],
      ['Category', p=>p.category],
      ['Material', p=>p.material],
      ['Colours', p=>p.colors.map(c=>`<span class="swatch" style="display:inline-block;width:16px;height:16px;background:${c.hex}"></span>`).join(' ')],
      ['Sizes', p=>p.sizes.join(', ')],
      ['Stock', p=>p.stock+' left'],
    ];
    body.innerHTML = `<div class="card" style="padding:0;overflow:auto"><table class="tbl">
      <thead><tr><th></th>${items.map(p=>`<th style="min-width:160px"><div class="cart-line__media" style="width:80px;height:96px;margin-bottom:.5rem">${garmentSVG(p.type,p.colors[0].hex)}</div><a href="#/product/${p.id}">${p.name}</a></th>`).join('')}</tr></thead>
      <tbody>${rows.map(r=>`<tr><td><strong>${r[0]}</strong></td>${items.map(p=>`<td>${r[1](p)}</td>`).join('')}</tr>`).join('')}
      <tr><td></td>${items.map(p=>`<td><button class="btn btn--sm" data-add="${p.id}">Add to cart</button><br><button class="muted" data-rm="${p.id}" style="font-size:.8rem;text-decoration:underline;margin-top:.4rem">Remove</button></td>`).join('')}</tr>
      </tbody></table></div>`;
    qsa('[data-add]', body).forEach(b=>b.addEventListener('click',()=>{ const p=byId(b.dataset.add); store.addToCart(p.id,p.colors[0].name,p.sizes[Math.min(2,p.sizes.length-1)],1); toast('Added to cart 🛒'); window.dispatchEvent(new CustomEvent('open-cart')); }));
    qsa('[data-rm]', body).forEach(b=>b.addEventListener('click',()=>{ store.toggleCompare(b.dataset.rm); draw(); }));
  }
  qs('#clearCmp', node).addEventListener('click', () => { store.clearCompare(); draw(); });
  draw();
  return { node, title: 'Compare' };
}

// ---------------- BLOG ----------------
export function BlogPage() {
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Blog</strong></div>
    <div class="head"><span class="eyebrow">📖 The Wahh Journal</span><h1>Stories, tips &amp; <span class="gtext--candy">style</span></h1></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
      ${BLOG.map(b=>`<a class="card reveal" href="#/blog/${b.slug}" data-tilt>
        <div style="aspect-ratio:16/10;background:linear-gradient(160deg,${b.color},#fff);display:grid;place-items:center;font-size:3.4rem">${b.emoji}</div>
        <div style="padding:1.2rem"><div class="muted" style="font-size:.8rem">${b.date} · ${b.read} read</div><h3 style="font-size:1.15rem;margin:.3rem 0">${b.title}</h3><p class="muted" style="font-size:.9rem">${b.excerpt}</p></div>
      </a>`).join('')}
    </div>`);
  return { node, title: 'Blog' };
}
export function BlogPostPage(ctx) {
  const post = BLOG.find(b => b.slug === ctx.params.slug);
  if (!post) return { node: NotFoundNode(), title: 'Not found' };
  const node = wrap(`
    <div class="breadcrumb"><a href="#/blog">Blog</a> <span>/</span> <strong>${post.title}</strong></div>
    <div style="aspect-ratio:21/9;background:linear-gradient(160deg,${post.color},#fff);display:grid;place-items:center;font-size:5rem;border-radius:var(--r-lg)">${post.emoji}</div>
    <div style="max-width:720px;margin:2rem auto">
      <div class="muted">${post.date} · ${post.read} read · by ${post.author}</div>
      <h1>${post.title}</h1>
      <p style="font-size:1.1rem;color:var(--ink-soft)">${post.excerpt}</p>
      <p class="muted">${['Every parent knows the morning scramble. The right wardrobe turns chaos into joy — and that is exactly what this guide is about.','We spoke to our design team and a panel of paediatric-friendly fabric experts to bring you practical, tested advice.','From layering tricks to fabric care, these tips are simple to follow and make a real difference for active little ones.'].join('</p><p class="muted">')}</p>
      <blockquote class="card glass" style="padding:1.2rem 1.5rem;border-left:5px solid var(--grape);font-style:italic">"Comfort and confidence go hand in hand. When kids feel good in what they wear, they play, learn and shine brighter."</blockquote>
      <p class="muted">Ready to put it into practice? Explore our latest arrivals and find pieces designed exactly for these moments.</p>
      <a class="btn" href="#/shop">Shop the looks</a>
    </div>`);
  return { node, title: post.title };
}

// ---------------- LOOKBOOK ----------------
export function LookbookPage() {
  const looks = [
    { title:'Sunny Splash', sub:'Summer playdates', emoji:'🏖️', color:'#3fc8ff', link:'#/shop?collection=summer', span:'grid-column:span 2' },
    { title:'Festival Sparkle', sub:'Celebration ready', emoji:'🎉', color:'#ff5fa2', link:'#/shop?collection=festival' },
    { title:'Cosy Wonder', sub:'Winter snuggles', emoji:'❄️', color:'#7b5bff', link:'#/shop?collection=winter' },
    { title:'Little Explorers', sub:'Boys everyday', emoji:'🧭', color:'#3fe0b0', link:'#/shop?category=boys' },
    { title:'Twirl & Shine', sub:'Girls favourites', emoji:'🌸', color:'#ff7a59', link:'#/shop?category=girls', span:'grid-column:span 2' },
    { title:'First Cuddles', sub:'Newborn essentials', emoji:'🍼', color:'#ffcf3f', link:'#/shop?category=newborn' },
  ];
  const node = wrap(`
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Lookbook</strong></div>
    <div class="head"><span class="eyebrow">📸 Editorial</span><h1>The Wahh <span class="gtext">Lookbook</span></h1><p>Styled stories to inspire every adventure.</p></div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;grid-auto-rows:240px">
      ${looks.map((l,i)=>`<a class="coll-card reveal d${(i%4)+1}" href="${l.link}" style="${l.span||''};background:linear-gradient(160deg,${l.color},#fff);min-height:0">
        <span class="emoji">${l.emoji}</span>
        <div class="coll-card__body"><h3 style="font-size:1.5rem">${l.title}</h3><p style="opacity:.95">${l.sub}</p><span style="font-weight:800;text-decoration:underline">Shop the look →</span></div>
      </a>`).join('')}
    </div>`);
  return { node, title: 'Lookbook' };
}

// ---------------- 404 ----------------
function NotFoundNode() {
  return wrap(`<div class="empty-state" style="padding:6rem 1rem"><div class="emoji" style="font-size:6rem">🧦</div><h1>Oops! Page lost in the laundry</h1><p class="muted">We couldn't find that page. Let's get you back to the magic.</p><div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:1rem"><a class="btn btn--lg" href="#/">Back home</a><a class="btn btn--ghost btn--lg" href="#/shop">Go shopping</a></div></div>`);
}
export function NotFoundPage() { return { node: NotFoundNode(), title: 'Not found' }; }
