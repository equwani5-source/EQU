// ============================================================
// Wahh Kids — Cart page
// ============================================================
import { store } from '../store.js';
import { byId, recommend, formatINR } from '../data.js';
import { garmentSVG } from '../svg.js';
import { computeTotals, findCoupon, FREE_SHIP_OVER } from '../cartmath.js';
import { productCardHTML, wireCards } from '../components/card.js';
import { el, qs, qsa, toast } from '../ui.js';
import { navigate } from '../router.js';

function hexOf(p, name) { const c = p.colors.find(c=>c.name===name); return c?c.hex:p.colors[0].hex; }

export default function CartPage() {
  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Cart</strong></div>
    <h1>Your Shopping Bag 🛍️</h1>
    <div id="cartContent"></div>
  </div></div>`);

  function render() {
    const content = qs('#cartContent', node);
    const lines = store.cartDetailed();
    const saved = store.get().saved;

    if (!lines.length && !saved.length) {
      content.innerHTML = `<div class="empty-state"><div class="emoji">🛒</div><h2>Your bag is feeling light</h2><p class="muted">Let's add some magic to it!</p><a class="btn btn--lg" href="#/shop">Start shopping</a></div>`;
      mountRecommend(content);
      return;
    }

    const totals = computeTotals(lines, { couponCode: store.get().coupon });
    content.innerHTML = `
      <div class="checkout-grid" style="display:grid;grid-template-columns:1fr 360px;gap:30px;align-items:start;margin-top:1.5rem">
        <div>
          ${lines.length ? `<div class="card" style="padding:0;overflow:hidden">${lines.map(cartRow).join('')}</div>` :
            `<div class="card" style="padding:2rem;text-align:center" class="muted">Your active bag is empty — check your saved items below.</div>`}
          ${saved.length ? `<h3 style="margin-top:2rem">Saved for later (${saved.length})</h3>
            <div class="card" style="padding:0;overflow:hidden">${saved.map((l,i)=>savedRow(l,i)).join('')}</div>` : ''}
        </div>
        <aside class="card glass" style="padding:1.5rem;position:sticky;top:calc(var(--nav-h) + 60px)">
          <h3 style="margin-top:0">Order Summary</h3>
          ${totals.freeShipEligible ? '<div class="pill" style="background:rgba(63,224,176,.18);color:#0a8a64">🎉 You unlocked free shipping!</div>' :
            `<div class="muted" style="font-size:.85rem">Add <strong>${formatINR(FREE_SHIP_OVER - totals.subtotal)}</strong> more for free shipping</div>
             <div style="height:8px;background:rgba(108,76,241,.12);border-radius:999px;overflow:hidden;margin:.5rem 0"><div style="width:${Math.min(100,totals.subtotal/FREE_SHIP_OVER*100)}%;height:100%;background:var(--grad-sea)"></div></div>`}
          <div class="divider"></div>
          <div class="coupon" style="display:flex;gap:.5rem;margin-bottom:1rem">
            <input id="couponInput" placeholder="Coupon code" value="${store.get().coupon||''}" style="flex:1;padding:.7rem .9rem;border-radius:12px;border:1px solid rgba(108,76,241,.2);text-transform:uppercase" />
            <button class="btn btn--sm" id="applyCoupon">Apply</button>
          </div>
          <div id="couponMsg"></div>
          ${summaryRows(totals)}
          <a class="btn btn--block btn--lg" href="#/checkout" id="checkoutBtn" style="margin-top:1rem;${lines.length?'':'pointer-events:none;opacity:.5'}">Checkout · ${formatINR(totals.total)}</a>
          <a class="btn btn--ghost btn--block btn--sm" href="#/shop" style="margin-top:.6rem">Continue shopping</a>
          <div class="muted center" style="font-size:.78rem;margin-top:.8rem">🔒 Secure checkout · UPI · COD · QR</div>
        </aside>
      </div>`;

    // wire rows
    qsa('[data-line]', content).forEach(row => {
      const idx = +row.dataset.line;
      row.querySelector('[data-inc]')?.addEventListener('click', () => { store.updateQty(idx, 1); render(); });
      row.querySelector('[data-dec]')?.addEventListener('click', () => { store.updateQty(idx, -1); render(); });
      row.querySelector('[data-rm]')?.addEventListener('click', () => { store.removeFromCart(idx); toast('Removed from cart','info'); render(); });
      row.querySelector('[data-save]')?.addEventListener('click', () => { store.saveForLater(idx); toast('Saved for later 💜'); render(); });
    });
    qsa('[data-saved]', content).forEach(row => {
      const idx = +row.dataset.saved;
      row.querySelector('[data-move]')?.addEventListener('click', () => { store.moveToCart(idx); toast('Moved to cart 🛒'); render(); });
      row.querySelector('[data-delsaved]')?.addEventListener('click', () => { store.removeSaved(idx); render(); });
    });

    // coupon
    qs('#applyCoupon', content)?.addEventListener('click', () => {
      const code = qs('#couponInput', content).value.trim().toUpperCase();
      const c = findCoupon(code);
      const msg = qs('#couponMsg', content);
      if (!code) { store.clearCoupon(); render(); return; }
      if (!c) { msg.innerHTML = `<p style="color:var(--coral);font-size:.85rem;font-weight:600">Invalid code. Try WAHH10 or MAGIC20</p>`; return; }
      store.applyCoupon(code); toast(`Coupon ${code} applied! 🎉`, 'ok'); render();
    });

    mountRecommend(content);
  }

  function cartRow(line) {
    return `<div class="cart-row" data-line="${line.idx}" style="display:grid;grid-template-columns:90px 1fr auto;gap:1rem;padding:1.1rem;border-bottom:1px solid rgba(108,76,241,.08)">
      <a href="#/product/${line.id}" class="cart-line__media" style="width:90px;height:108px">${garmentSVG(line.product.type, hexOf(line.product,line.color))}</a>
      <div>
        <a href="#/product/${line.id}"><strong>${line.product.name}</strong></a>
        <div class="muted" style="font-size:.85rem">${line.color} · Size ${line.size}</div>
        <div class="muted" style="font-size:.85rem">${formatINR(line.product.price)} each</div>
        <div style="display:flex;gap:1rem;align-items:center;margin-top:.6rem">
          <div class="qty"><button data-dec>−</button><span>${line.qty}</span><button data-inc>+</button></div>
          <button class="muted" data-save style="font-size:.82rem;text-decoration:underline">Save for later</button>
          <button class="muted" data-rm style="font-size:.82rem;text-decoration:underline">Remove</button>
        </div>
      </div>
      <div style="text-align:right;font-family:var(--font-display);font-weight:800;font-size:1.15rem">${formatINR(line.product.price*line.qty)}</div>
    </div>`;
  }
  function savedRow(l, i) {
    const p = byId(l.id); if (!p) return '';
    return `<div data-saved="${i}" style="display:grid;grid-template-columns:70px 1fr auto;gap:1rem;padding:1rem;border-bottom:1px solid rgba(108,76,241,.08);align-items:center">
      <div class="cart-line__media" style="width:70px;height:84px">${garmentSVG(p.type, hexOf(p,l.color))}</div>
      <div><strong>${p.name}</strong><div class="muted" style="font-size:.82rem">${l.color} · ${l.size} · ${formatINR(p.price)}</div></div>
      <div style="text-align:right"><button class="btn btn--sm" data-move>Move to cart</button><br><button class="muted" data-delsaved style="font-size:.8rem;text-decoration:underline;margin-top:.4rem">Remove</button></div>
    </div>`;
  }

  function mountRecommend(content) {
    const rec = recommend(4);
    const sec = el(`<section class="section section--tight"><div class="head head--left"><span class="eyebrow">✨ Smart picks for you</span><h2 style="font-size:1.6rem">You might also love</h2></div><div class="grid grid--products" id="recGrid"></div></section>`);
    content.appendChild(sec);
    const g = sec.querySelector('#recGrid');
    g.innerHTML = rec.map(p=>productCardHTML(p)).join(''); wireCards(g, rec);
  }

  render();
  return { node, title: 'Cart' };
}

export function summaryRows(t) {
  return `
    <div style="display:flex;justify-content:space-between;margin:.4rem 0"><span class="muted">Subtotal</span><span>${formatINR(t.subtotal)}</span></div>
    ${t.discount?`<div style="display:flex;justify-content:space-between;margin:.4rem 0;color:#0a8a64"><span>Discount${t.coupon?` (${t.coupon.code})`:''}</span><span>−${formatINR(t.discount)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;margin:.4rem 0"><span class="muted">Shipping</span><span>${t.shipping?formatINR(t.shipping):'<span style="color:#0a8a64;font-weight:700">FREE</span>'}</span></div>
    ${t.giftCost?`<div style="display:flex;justify-content:space-between;margin:.4rem 0"><span class="muted">Gift wrap</span><span>${formatINR(t.giftCost)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;margin:.4rem 0"><span class="muted">Tax (5% GST)</span><span>${formatINR(t.tax)}</span></div>
    <div class="divider"></div>
    <div style="display:flex;justify-content:space-between;align-items:center"><strong>Total</strong><strong style="font-family:var(--font-display);font-size:1.4rem">${formatINR(t.total)}</strong></div>`;
}
