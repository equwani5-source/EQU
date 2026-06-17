// ============================================================
// Wahh Kids — Product detail page (3D 360 viewer + everything)
// ============================================================
import { byId, related, recommend, discountPct, formatINR, productImage } from '../data.js';
import { store } from '../store.js';
import { garmentSVG } from '../svg.js';
import { productCardHTML, wireCards } from '../components/card.js';
import { el, qs, qsa, toast, starRow, modal } from '../ui.js';
import { navigate } from '../router.js';
import { initProduct360 } from '../three/scene.js';

const REVIEW_NAMES = ['Aarav\'s Mom','Diya P.','Kabir S.','Anika R.','Vivaan\'s Dad','Saanvi M.','Reyansh K.'];
const REVIEW_TEXT = [
  'Super soft and the colour is even prettier in person. Washed great!',
  'Perfect fit and my little one loves the design. Buying more.',
  'Premium quality, fast delivery. Worth every rupee.',
  'The 3D preview helped me pick the right colour. Lovely!',
  'Held up beautifully after many washes. Highly recommend.',
];

export default function ProductPage(ctx) {
  const p = byId(ctx.params.id);
  if (!p) {
    return el(`<div class="page-pad"><div class="container empty-state"><div class="emoji">🫥</div><h2>Product not found</h2><a class="btn" href="#/shop">Back to shop</a></div></div>`);
  }
  store.pushRecent(p.id);
  const disc = discountPct(p);
  const photo = productImage(p.id);
  const soldOut = p.stock <= 0;
  let selColor = p.colors[0];
  let selSize = p.sizes[Math.min(2, p.sizes.length - 1)];
  let qty = 1;

  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <a href="#/shop?category=${p.category}">${p.category}</a> <span>/</span> <strong>${p.name}</strong></div>

    <div class="product-grid" style="display:grid;grid-template-columns:1.05fr 1fr;gap:40px;align-items:start">
      <!-- 3D / gallery -->
      <div>
        <div class="card" style="position:relative;aspect-ratio:1;background:var(--grad-soft);overflow:hidden" id="viewerWrap">
          <div id="viewer3d" style="position:absolute;inset:0"></div>
          <div id="viewerFallback" style="position:absolute;inset:0;display:grid;place-items:center;padding:${photo ? '0' : '10%'}">${photo ? `<img src="${photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/>` : garmentSVG(p.type, selColor.hex)}</div>
          <div style="position:absolute;top:14px;left:14px" class="pill">${photo ? '📷 Product photo' : '🌀 Drag to rotate · Scroll to zoom'}</div>
          <div style="position:absolute;bottom:14px;right:14px;display:flex;gap:.4rem">
            <button class="carousel__btn" id="btnRotate" title="Toggle auto-rotate">⏯️</button>
            <button class="carousel__btn" id="btnReset" title="Reset view">🎯</button>
            <button class="carousel__btn" id="btnZoom" title="Fullscreen">🔍</button>
          </div>
        </div>
        <div id="thumbs" style="display:flex;gap:10px;margin-top:12px"></div>
      </div>

      <!-- info -->
      <div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem">
          ${p.badges.map(b=>`<span class="badge ${b==='new'?'badge--new':b==='best'?'badge--best':'badge--sale'}">${b==='sale'?('-'+disc+'%'):b}</span>`).join('')}
          <span class="pill">${p.category}</span>
        </div>
        <h1 style="font-size:clamp(1.8rem,3.5vw,2.6rem)">${p.name}</h1>
        <div style="display:flex;align-items:center;gap:.6rem;margin:.4rem 0 1rem">
          ${starRow(p.rating)} <strong>${p.rating.toFixed(1)}</strong>
          <a href="#reviews" class="muted">(${p.reviewsCount} reviews)</a>
          <span class="muted">· ${p.sold}+ sold</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:.8rem;margin-bottom:1.2rem">
          <span style="font-family:var(--font-display);font-weight:800;font-size:2rem">${formatINR(p.price)}</span>
          ${disc?`<span class="was" style="font-size:1.1rem;color:#a79fc7;text-decoration:line-through">${formatINR(p.mrp)}</span><span class="badge badge--sale">Save ${disc}%</span>`:''}
        </div>
        <p class="muted">${p.description}</p>

        <div style="margin:1.2rem 0">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>Colour: <span id="colorName">${selColor.name}</span></strong>
          </div>
          <div style="display:flex;gap:10px;margin-top:.6rem" id="colorRow">
            ${p.colors.map((c,i)=>`<button class="swatch ${i===0?'active':''}" data-hex="${c.hex}" data-name="${c.name}" title="${c.name}" style="width:34px;height:34px;background:${c.hex}"></button>`).join('')}
          </div>
        </div>

        <div style="margin:1.2rem 0">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>Size: <span id="sizeName">${selSize}</span></strong>
            <button class="muted" id="sizeChart" style="text-decoration:underline;font-size:.9rem">📏 Size chart</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:.6rem" id="sizeRow">
            ${p.sizes.map(s=>`<button class="size-btn ${s===selSize?'active':''}" data-size="${s}">${s}</button>`).join('')}
          </div>
        </div>

        <div style="display:flex;gap:.8rem;align-items:center;margin:1.4rem 0">
          <div class="qty"><button id="qDec">−</button><span id="qVal">1</span><button id="qInc">+</button></div>
          <div class="pill" id="stockPill" style="background:${soldOut?'rgba(154,160,181,.2)':p.stock<10?'rgba(255,122,89,.15)':'rgba(63,224,176,.18)'};color:${soldOut?'#5b6072':p.stock<10?'#c9482b':'#0a8a64'}">
            ${soldOut?'🚫 Out of stock':p.stock<10?`⚠️ Only ${p.stock} left!`:'✅ In stock'}
          </div>
        </div>

        <div style="display:flex;gap:.8rem;flex-wrap:wrap" class="btn-row-mobile">
          ${soldOut
            ? '<button class="btn btn--lg" id="addCart" style="flex:1;background:#c8cad6;box-shadow:none" disabled>Out of stock</button>'
            : '<button class="btn btn--lg" id="addCart" style="flex:1">Add to Cart 🛒</button><button class="btn btn--candy btn--lg" id="buyNow">Buy Now ⚡</button>'}
          <button class="icon-btn" id="favBtn" style="width:54px;height:54px;font-size:1.4rem">${store.inWishlist(p.id)?'💖':'🤍'}</button>
          <button class="icon-btn" id="cmpBtn" style="width:54px;height:54px;font-size:1.2rem" title="Compare">⚖️</button>
        </div>

        <div class="glass" style="padding:1rem 1.2rem;margin-top:1.4rem;display:grid;grid-template-columns:1fr 1fr;gap:.8rem;font-size:.9rem">
          <div>🚚 <strong>Free shipping</strong> over ₹999</div>
          <div>↩️ <strong>15-day</strong> easy returns</div>
          <div>🌱 <strong>${p.material}</strong></div>
          <div>⭐ Earn <strong>${Math.floor(p.price/10)} stars</strong></div>
        </div>

        <details style="margin-top:1rem"><summary style="cursor:pointer;font-weight:700;padding:.6rem 0">Care instructions</summary><p class="muted">${p.care}</p></details>
        <details style="margin-top:.2rem"><summary style="cursor:pointer;font-weight:700;padding:.6rem 0">Delivery & returns</summary><p class="muted">Dispatched in 24h. Metro 2-4 days, rest of India 4-7 days. Free 15-day returns on unworn items with tags.</p></details>
      </div>
    </div>

    <!-- Frequently bought together -->
    <section class="section section--tight" id="fbt"></section>

    <!-- Reviews -->
    <section class="section section--tight" id="reviews"></section>

    <!-- Related -->
    <section class="section section--tight" id="related"></section>

    <!-- Recently viewed -->
    <section class="section section--tight" id="recent"></section>
  </div></div>`);

  // ---- size button styles (inject once) ----
  if (!document.getElementById('sizeBtnCSS')) {
    document.head.appendChild(el(`<style id="sizeBtnCSS">
      .size-btn{min-width:54px;padding:.55rem .8rem;border-radius:12px;border:1.5px solid rgba(108,76,241,.25);background:#fff;font-weight:700;color:var(--ink);transition:all .2s}
      .size-btn:hover{border-color:var(--grape)}
      .size-btn.active{background:var(--grape);color:#fff;border-color:var(--grape)}
    </style>`));
  }

  // ---- thumbnails (color variants as gallery) ----
  const thumbs = qs('#thumbs', node);
  p.colors.forEach((c,i) => {
    const t = el(`<button class="cart-line__media" style="width:72px;height:72px;${i===0?'outline:2px solid var(--grape)':''}" data-hex="${c.hex}">${garmentSVG(p.type, c.hex)}</button>`);
    t.addEventListener('click', () => selectColor(c, t));
    thumbs.appendChild(t);
  });

  function selectColor(c, thumbEl) {
    selColor = c;
    qs('#colorName', node).textContent = c.name;
    qsa('#colorRow .swatch', node).forEach(s => s.classList.toggle('active', s.dataset.hex === c.hex));
    qsa('#thumbs button', node).forEach(b => b.style.outline = b.dataset.hex === c.hex ? '2px solid var(--grape)' : 'none');
    if (!photo) qs('#viewerFallback', node).innerHTML = garmentSVG(p.type, c.hex);
    if (viewer && viewer.setColor) viewer.setColor(c.hex);
  }

  qsa('#colorRow .swatch', node).forEach(sw => sw.addEventListener('click', () => {
    const c = p.colors.find(x => x.hex === sw.dataset.hex);
    selectColor(c);
  }));
  qsa('#sizeRow .size-btn', node).forEach(b => b.addEventListener('click', () => {
    selSize = b.dataset.size;
    qsa('#sizeRow .size-btn', node).forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    qs('#sizeName', node).textContent = selSize;
  }));
  qs('#qInc', node).addEventListener('click', () => { qty++; qs('#qVal', node).textContent = qty; });
  qs('#qDec', node).addEventListener('click', () => { qty = Math.max(1, qty-1); qs('#qVal', node).textContent = qty; });

  const doAdd = () => { store.addToCart(p.id, selColor.name, selSize, qty); toast(`${p.name} added to cart`, 'ok', '🛒'); };
  const addBtn = qs('#addCart', node);
  if (addBtn && !soldOut) addBtn.addEventListener('click', () => { doAdd(); window.dispatchEvent(new CustomEvent('open-cart')); });
  const buyBtn = qs('#buyNow', node);
  if (buyBtn) buyBtn.addEventListener('click', () => { doAdd(); navigate('/checkout'); });
  qs('#favBtn', node).addEventListener('click', (e) => {
    const on = store.toggleWishlist(p.id); e.currentTarget.textContent = on?'💖':'🤍';
    toast(on?'Added to wishlist 💖':'Removed from wishlist', on?'ok':'info');
  });
  qs('#cmpBtn', node).addEventListener('click', () => {
    const on = store.toggleCompare(p.id);
    toast(on?'Added to compare ⚖️':'Removed from compare', on?'ok':'info');
  });
  qs('#sizeChart', node).addEventListener('click', () => showSizeChart(p));

  // ---- Frequently bought together ----
  const fbtItems = related(p, 2);
  const fbtTotal = p.price + fbtItems.reduce((s,x)=>s+x.price,0);
  qs('#fbt', node).innerHTML = `
    <div class="head head--left"><span class="eyebrow">🧩 Complete the look</span><h2 style="font-size:1.6rem">Frequently bought together</h2></div>
    <div class="card glass" style="padding:1.4rem;display:flex;flex-wrap:wrap;gap:1.2rem;align-items:center">
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        ${[p,...fbtItems].map((x,i)=>`${i?'<span style="font-size:1.6rem;color:var(--grape)">+</span>':''}
          <a href="#/product/${x.id}" style="text-align:center;width:96px"><div class="cart-line__media" style="width:96px;height:110px;margin:0 auto">${garmentSVG(x.type,x.colors[0].hex)}</div><div style="font-size:.78rem;font-weight:700;margin-top:.3rem">${formatINR(x.price)}</div></a>`).join('')}
      </div>
      <div style="margin-left:auto;text-align:right">
        <div class="muted">Bundle total</div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:1.6rem">${formatINR(fbtTotal)}</div>
        <button class="btn" id="addBundle" style="margin-top:.5rem">Add all 3 to cart</button>
      </div>
    </div>`;
  qs('#addBundle', node).addEventListener('click', () => {
    [p,...fbtItems].forEach(x => store.addToCart(x.id, x.colors[0].name, x.sizes[Math.min(2,x.sizes.length-1)], 1));
    toast('Bundle added to cart! 🎉', 'ok'); window.dispatchEvent(new CustomEvent('open-cart'));
  });

  // ---- Reviews ----
  renderReviews(qs('#reviews', node), p);

  // ---- Related ----
  const rel = related(p, 4);
  const relSec = qs('#related', node);
  relSec.innerHTML = `<div class="head head--left"><span class="eyebrow">💜 You may also love</span><h2 style="font-size:1.6rem">Related products</h2></div><div class="grid grid--products" id="relGrid"></div>`;
  const relGrid = qs('#relGrid', relSec);
  relGrid.innerHTML = rel.map(x=>productCardHTML(x)).join(''); wireCards(relGrid, rel);

  // ---- Recently viewed ----
  const recentIds = store.get().recent.filter(id => id !== p.id).slice(0, 4);
  if (recentIds.length) {
    const recentProducts = recentIds.map(byId).filter(Boolean);
    const recSec = qs('#recent', node);
    recSec.innerHTML = `<div class="head head--left"><span class="eyebrow">👀 Recently viewed</span><h2 style="font-size:1.6rem">Pick up where you left off</h2></div><div class="grid grid--products" id="recGrid"></div>`;
    const recGrid = qs('#recGrid', recSec);
    recGrid.innerHTML = recentProducts.map(x=>productCardHTML(x)).join(''); wireCards(recGrid, recentProducts);
  }

  // ---- 3D viewer mount ----
  let viewer = null;
  function onMount() {
    if (photo) {
      // Real photo present → keep it, skip 3D, hide rotate/reset controls
      const rb = qs('#btnRotate', node), rs = qs('#btnReset', node);
      if (rb) rb.style.display = 'none';
      if (rs) rs.style.display = 'none';
    } else {
      initProduct360(qs('#viewer3d', node), p).then(v => {
        viewer = v;
        if (v) {
          qs('#viewerFallback', node).style.display = 'none';
          qs('#btnRotate', node).addEventListener('click', () => v.toggleAutoRotate());
          qs('#btnReset', node).addEventListener('click', () => v.resetView());
        }
      }).catch(()=>{});
    }
    qs('#btnZoom', node).addEventListener('click', () => {
      const big = photo ? `<img src="${photo}" alt="${p.name}" style="width:100%;border-radius:18px"/>`
        : `<div style="aspect-ratio:1;background:var(--grad-soft);border-radius:18px;display:grid;place-items:center;padding:8%">${garmentSVG(p.type, selColor.hex)}</div>`;
      modal(`<h3>${p.name}</h3>${big}<p class="muted center" style="margin-top:.6rem">${photo ? 'Product photo' : 'High-detail preview · ' + selColor.name}</p>`, { width: 560 });
    });
  }
  node._cleanup = () => { viewer?.destroy?.(); };

  return { node, onMount, title: p.name };
}

function renderReviews(host, p) {
  const dist = [5,4,3,2,1].map(star => ({ star, pct: star===5?68:star===4?22:star===3?7:star===2?2:1 }));
  const list = Array.from({length:5}).map((_,i)=>({
    name: REVIEW_NAMES[i%REVIEW_NAMES.length],
    rating: i<3?5:4,
    text: REVIEW_TEXT[i%REVIEW_TEXT.length],
    date: ['2 days ago','1 week ago','3 weeks ago','1 month ago','2 months ago'][i],
    verified: true,
  }));
  host.innerHTML = `
    <div class="head head--left"><span class="eyebrow">⭐ ${p.reviewsCount} reviews</span><h2 style="font-size:1.6rem">What parents are saying</h2></div>
    <div style="display:grid;grid-template-columns:280px 1fr;gap:30px;align-items:start" class="rev-grid">
      <div class="card glass" style="padding:1.4rem;text-align:center">
        <div style="font-family:var(--font-display);font-size:3.4rem;font-weight:800">${p.rating.toFixed(1)}</div>
        ${starRow(p.rating)}
        <div class="muted" style="margin:.4rem 0 1rem">Based on ${p.reviewsCount} reviews</div>
        ${dist.map(d=>`<div style="display:flex;align-items:center;gap:.5rem;margin:.3rem 0;font-size:.85rem"><span>${d.star}★</span><div style="flex:1;height:8px;background:rgba(108,76,241,.12);border-radius:999px;overflow:hidden"><div style="width:${d.pct}%;height:100%;background:var(--grad-candy)"></div></div><span class="muted">${d.pct}%</span></div>`).join('')}
        <button class="btn btn--ghost btn--block btn--sm" id="writeReview" style="margin-top:1rem">Write a review</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem" id="revList">
        ${list.map(r=>`<div class="card" style="padding:1.2rem">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${r.name}</strong><span class="muted" style="font-size:.82rem">${r.date}</span>
          </div>
          <div style="margin:.3rem 0">${starRow(r.rating)} ${r.verified?'<span class="pill" style="font-size:.7rem;padding:.2rem .6rem">✓ Verified</span>':''}</div>
          <p class="muted" style="margin:0">${r.text}</p>
        </div>`).join('')}
      </div>
    </div>`;
  host.querySelector('#writeReview').addEventListener('click', () => {
    const { overlay, close } = modal(`
      <h3>Write a review</h3>
      <div class="field"><label>Your rating</label><div id="starPick" style="font-size:1.8rem;cursor:pointer;color:#f6a609">☆☆☆☆☆</div></div>
      <div class="field"><label>Your review</label><textarea rows="4" id="revText" placeholder="Tell other parents what you loved…"></textarea></div>
      <button class="btn btn--block" id="submitRev">Submit review</button>`);
    let rating = 0;
    const sp = overlay.querySelector('#starPick');
    sp.addEventListener('click', (e) => {
      const r = sp.getBoundingClientRect();
      rating = Math.ceil(((e.clientX - r.left) / r.width) * 5);
      sp.textContent = '★★★★★☆☆☆☆☆'.slice(5 - rating, 10 - rating);
    });
    overlay.querySelector('#submitRev').addEventListener('click', () => {
      close(); toast('Thanks for your review! ⭐', 'ok');
    });
  });
}

function showSizeChart(p) {
  const shoe = p.type === 'shoes' || p.type === 'sneaker';
  const rows = shoe
    ? [['C4','EU 19','11.5 cm'],['C6','EU 22','13 cm'],['C8','EU 25','15 cm'],['C10','EU 27','16.5 cm'],['Y1','EU 32','19.5 cm']]
    : [['0-3M','Up to 60cm','5-6 kg'],['3-6M','60-67cm','6-8 kg'],['6-12M','67-76cm','8-10 kg'],['1-2Y','76-88cm','10-13 kg'],['2-4Y','88-104cm','13-17 kg'],['4-6Y','104-116cm','17-21 kg']];
  const headers = shoe ? ['Size','EU','Foot length'] : ['Size','Height','Weight'];
  modal(`<h3>📏 Size guide</h3>
    <p class="muted">Sizes run true to age. When in doubt, size up — kids grow fast!</p>
    <table style="width:100%;border-collapse:collapse;margin-top:1rem">
      <thead><tr>${headers.map(h=>`<th style="text-align:left;padding:.6rem;border-bottom:2px solid rgba(108,76,241,.2)">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td style="padding:.6rem;border-bottom:1px solid rgba(108,76,241,.1)">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`, { width: 480 });
}
