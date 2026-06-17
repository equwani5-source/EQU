// ============================================================
// Wahh Kids — Checkout
// ============================================================
import { store } from '../store.js';
import { formatINR } from '../data.js';
import { garmentSVG } from '../svg.js';
import { computeTotals, findCoupon, SHIPPING } from '../cartmath.js';
import { summaryRows } from './cart.js';
import { el, qs, qsa, toast, confetti } from '../ui.js';
import { navigate } from '../router.js';

function hexOf(p, name){ const c=p.colors.find(c=>c.name===name); return c?c.hex:p.colors[0].hex; }

export default function CheckoutPage() {
  const lines = store.cartDetailed();
  if (!lines.length) {
    return el(`<div class="page-pad"><div class="container empty-state"><div class="emoji">🛒</div><h2>Your bag is empty</h2><p class="muted">Add something magical before checking out.</p><a class="btn btn--lg" href="#/shop">Go shopping</a></div></div>`);
  }

  const user = store.get().user;
  const cfg = { couponCode: store.get().coupon, shipping: 'standard', giftWrap: false, payment: 'upi' };

  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/cart">Cart</a> <span>/</span> <strong>Checkout</strong></div>
    <h1>Secure Checkout 🔒</h1>
    <div class="checkout-grid" style="display:grid;grid-template-columns:1fr 380px;gap:30px;align-items:start;margin-top:1.4rem">
      <div id="coLeft"></div>
      <aside class="card glass" style="padding:1.5rem;position:sticky;top:calc(var(--nav-h) + 60px)" id="coSummary"></aside>
    </div>
  </div></div>`);

  const left = qs('#coLeft', node);
  left.innerHTML = `
    <!-- Contact -->
    <section class="card" style="padding:1.4rem;margin-bottom:1.2rem">
      <h3 style="margin-top:0">1 · Contact</h3>
      ${user ? `<p>Logged in as <strong>${user.email}</strong> · <a href="#/account" style="color:var(--grape-deep);text-decoration:underline">Account</a></p>`
        : `<div style="display:flex;gap:.5rem;align-items:center;margin-bottom:1rem"><span class="pill">Guest checkout</span><a href="#/account" style="color:var(--grape-deep);text-decoration:underline;font-size:.9rem">or log in for faster checkout</a></div>`}
      <div class="row2">
        <div class="field"><label>Email *</label><input id="email" type="email" value="${user?user.email:''}" placeholder="you@email.com" required/></div>
        <div class="field"><label>Phone *</label><input id="phone" type="tel" placeholder="10-digit mobile" required/></div>
      </div>
    </section>

    <!-- Address -->
    <section class="card" style="padding:1.4rem;margin-bottom:1.2rem">
      <h3 style="margin-top:0">2 · Shipping address</h3>
      <div id="savedAddr"></div>
      <div id="addrForm">
        <div class="field"><label>Full name *</label><input id="aName" placeholder="Recipient name" required/></div>
        <div class="field"><label>Address line *</label><input id="aLine" placeholder="House no, street, area" required/></div>
        <div class="row2">
          <div class="field"><label>City *</label><input id="aCity" placeholder="City" required/></div>
          <div class="field"><label>State *</label><input id="aState" placeholder="State" required/></div>
        </div>
        <div class="row2">
          <div class="field"><label>PIN code *</label><input id="aPin" placeholder="6-digit PIN" inputmode="numeric" required/></div>
          <div class="field" style="display:flex;justify-content:flex-end;align-items:flex-end"><label style="display:flex;gap:.5rem;align-items:center;font-weight:600"><input type="checkbox" id="aSave" checked/> Save this address</label></div>
        </div>
      </div>
    </section>

    <!-- Shipping method -->
    <section class="card" style="padding:1.4rem;margin-bottom:1.2rem">
      <h3 style="margin-top:0">3 · Delivery method</h3>
      <div id="shipOpts" style="display:flex;flex-direction:column;gap:.6rem"></div>
    </section>

    <!-- Extras -->
    <section class="card" style="padding:1.4rem;margin-bottom:1.2rem">
      <h3 style="margin-top:0">4 · Gift &amp; coupon</h3>
      <label style="display:flex;gap:.6rem;align-items:center;font-weight:600;margin-bottom:1rem"><input type="checkbox" id="giftWrap"/> 🎁 Add gift wrap (+₹49) with a handwritten note</label>
      <div style="display:flex;gap:.5rem"><input id="coCoupon" placeholder="Coupon code" value="${cfg.couponCode||''}" style="flex:1;padding:.7rem .9rem;border-radius:12px;border:1px solid rgba(108,76,241,.2);text-transform:uppercase"/><button class="btn btn--sm" id="coApply">Apply</button></div>
      <div id="coCouponMsg"></div>
    </section>

    <!-- Payment -->
    <section class="card" style="padding:1.4rem">
      <h3 style="margin-top:0">5 · Payment</h3>
      <div id="payOpts" style="display:flex;flex-direction:column;gap:.6rem"></div>
      <div id="payDetail" style="margin-top:1rem"></div>
      <p class="muted" style="font-size:.8rem;margin-top:1rem">🔒 This is a demo store — no real payment is processed and no card details are collected.</p>
    </section>`;

  // saved addresses
  function renderSaved() {
    const host = qs('#savedAddr', node);
    const list = store.get().addresses;
    if (!list.length) { host.innerHTML = ''; return; }
    host.innerHTML = `<div style="display:flex;flex-direction:column;gap:.5rem;margin-bottom:1rem">
      ${list.map(a=>`<label class="card" style="padding:.8rem 1rem;display:flex;gap:.6rem;align-items:flex-start;cursor:pointer">
        <input type="radio" name="savedAddr" value="${a.id}" ${a.default?'checked':''} style="margin-top:.2rem"/>
        <span><strong>${a.name}</strong> ${a.default?'<span class="pill" style="font-size:.65rem;padding:.15rem .5rem">Default</span>':''}<br><span class="muted" style="font-size:.85rem">${a.line1}, ${a.city}, ${a.state} ${a.pin} · ${a.phone}</span></span>
      </label>`).join('')}
      <label style="display:flex;gap:.5rem;align-items:center;font-weight:600;cursor:pointer"><input type="radio" name="savedAddr" value="new"/> + Use a new address</label>
    </div>`;
    const toggleForm = () => {
      const useNew = qs('input[name="savedAddr"]:checked', host)?.value === 'new';
      qs('#addrForm', node).style.display = useNew ? 'block' : 'none';
    };
    qsa('input[name="savedAddr"]', host).forEach(r => r.addEventListener('change', toggleForm));
    toggleForm();
  }
  renderSaved();

  // shipping options
  qs('#shipOpts', node).innerHTML = Object.entries(SHIPPING).map(([k,v],i)=>`
    <label class="card" style="padding:.9rem 1rem;display:flex;justify-content:space-between;align-items:center;cursor:pointer">
      <span style="display:flex;gap:.6rem;align-items:center"><input type="radio" name="ship" value="${k}" ${i===0?'checked':''}/> ${v.label}</span>
      <strong>${v.cost?formatINR(v.cost):'FREE'}</strong>
    </label>`).join('');
  qsa('input[name="ship"]', node).forEach(r => r.addEventListener('change', () => { cfg.shipping = r.value; renderSummary(); }));

  // payment options
  const PAYS = [['upi','UPI','📲'],['qr','QR Payment','🔳'],['cod','Cash on Delivery','💵']];
  qs('#payOpts', node).innerHTML = PAYS.map(([k,l,e],i)=>`
    <label class="card" style="padding:.9rem 1rem;display:flex;gap:.6rem;align-items:center;cursor:pointer">
      <input type="radio" name="pay" value="${k}" ${i===0?'checked':''}/> <span style="font-size:1.3rem">${e}</span> <strong>${l}</strong>
    </label>`).join('');
  qsa('input[name="pay"]', node).forEach(r => r.addEventListener('change', () => { cfg.payment = r.value; renderPayDetail(); }));

  function renderPayDetail() {
    const host = qs('#payDetail', node);
    if (cfg.payment === 'upi') {
      host.innerHTML = `<div class="field"><label>Enter your UPI ID</label><input id="upiId" placeholder="name@bank" /></div><p class="muted" style="font-size:.85rem">You'll receive a collect request (simulated).</p>`;
    } else if (cfg.payment === 'qr') {
      host.innerHTML = `<div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <div style="background:#fff;padding:10px;border-radius:14px;box-shadow:var(--shadow-soft)">${qrSVG()}</div>
        <div><strong>Scan to pay</strong><p class="muted" style="font-size:.85rem;margin:.3rem 0">Open any UPI app and scan the QR.<br>Payee: <strong>Wahh Kids</strong></p></div>
      </div>`;
    } else {
      host.innerHTML = `<p class="muted">💵 Pay in cash when your order is delivered. A nominal handling fee may apply in some regions (waived in this demo).</p>`;
    }
  }
  renderPayDetail();

  // gift wrap + coupon
  qs('#giftWrap', node).addEventListener('change', e => { cfg.giftWrap = e.target.checked; renderSummary(); });
  qs('#coApply', node).addEventListener('click', () => {
    const code = qs('#coCoupon', node).value.trim().toUpperCase();
    const msg = qs('#coCouponMsg', node);
    if (!code) { cfg.couponCode = null; store.clearCoupon(); msg.innerHTML=''; renderSummary(); return; }
    const c = findCoupon(code);
    if (!c) { msg.innerHTML = `<p style="color:var(--coral);font-size:.85rem;font-weight:600">Invalid code</p>`; return; }
    cfg.couponCode = code; store.applyCoupon(code); msg.innerHTML = `<p style="color:#0a8a64;font-size:.85rem;font-weight:600">✓ ${c.desc}</p>`; toast('Coupon applied! 🎉','ok'); renderSummary();
  });

  // summary
  function renderSummary() {
    const t = computeTotals(lines, cfg);
    qs('#coSummary', node).innerHTML = `
      <h3 style="margin-top:0">Order Summary</h3>
      <div style="display:flex;flex-direction:column;gap:.7rem;max-height:240px;overflow:auto;margin-bottom:1rem">
        ${lines.map(l=>`<div style="display:flex;gap:.7rem;align-items:center">
          <div class="cart-line__media" style="width:48px;height:58px">${garmentSVG(l.product.type, hexOf(l.product,l.color))}</div>
          <div style="flex:1;font-size:.85rem"><strong>${l.product.name}</strong><br><span class="muted">${l.color} · ${l.size} · ×${l.qty}</span></div>
          <strong style="font-size:.9rem">${formatINR(l.product.price*l.qty)}</strong>
        </div>`).join('')}
      </div>
      ${t.couponError?`<p style="color:var(--coral);font-size:.82rem">${t.couponError}</p>`:''}
      ${summaryRows(t)}
      <button class="btn btn--block btn--lg" id="placeOrder" style="margin-top:1.2rem">Place Order · ${formatINR(t.total)}</button>
      <div class="muted center" style="font-size:.78rem;margin-top:.7rem">By placing this order you agree to our <a href="#/terms" style="text-decoration:underline">Terms</a></div>`;
    qs('#placeOrder', node).addEventListener('click', placeOrder);
  }
  renderSummary();

  function gatherAddress() {
    const sel = qs('input[name="savedAddr"]:checked', node);
    if (sel && sel.value !== 'new') {
      return store.get().addresses.find(a => a.id === sel.value);
    }
    const a = {
      name: qs('#aName',node).value.trim(), line1: qs('#aLine',node).value.trim(),
      city: qs('#aCity',node).value.trim(), state: qs('#aState',node).value.trim(),
      pin: qs('#aPin',node).value.trim(), phone: qs('#phone',node).value.trim(),
    };
    if (!a.name || !a.line1 || !a.city || !a.state || a.pin.length < 6) return null;
    if (qs('#aSave',node).checked) store.addAddress(a);
    return a;
  }

  function placeOrder() {
    const email = qs('#email',node).value.trim();
    const phone = qs('#phone',node).value.trim();
    if (!email || !/.+@.+\..+/.test(email)) { toast('Please enter a valid email','err'); qs('#email',node).focus(); return; }
    if (phone.replace(/\D/g,'').length < 10) { toast('Please enter a valid phone number','err'); qs('#phone',node).focus(); return; }
    const address = gatherAddress();
    if (!address) { toast('Please complete the shipping address','err'); return; }
    if (cfg.payment === 'upi') { const u = qs('#upiId',node)?.value.trim(); if (!u || !u.includes('@')) { toast('Enter a valid UPI ID','err'); return; } }

    const t = computeTotals(lines, cfg);
    const order = {
      email, items: lines.map(l=>({ id:l.id, name:l.product.name, type:l.product.type, color:l.color, size:l.size, qty:l.qty, price:l.product.price })),
      totals: t, address, payment: cfg.payment, giftWrap: cfg.giftWrap,
    };
    const { id, earned } = store.placeOrder(order);
    confetti();
    showConfirmation(id, earned, order);
  }

  function showConfirmation(id, earned, order) {
    node.querySelector('.container').innerHTML = `
      <div class="center" style="max-width:640px;margin:2rem auto;padding-bottom:3rem">
        <div style="font-size:5rem" class="float-2">🎉</div>
        <h1>Order confirmed!</h1>
        <p class="muted">Thank you ${order.address.name.split(' ')[0]}! Your magical order is on its way.</p>
        <div class="card glass" style="padding:1.6rem;margin:1.4rem 0;text-align:left">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem">
            <div><div class="muted" style="font-size:.8rem">Order ID</div><strong style="font-size:1.2rem">${id}</strong></div>
            <div><div class="muted" style="font-size:.8rem">Total paid</div><strong style="font-size:1.2rem">${formatINR(order.totals.total)}</strong></div>
            <div><div class="muted" style="font-size:.8rem">Payment</div><strong>${({upi:'UPI',qr:'QR Pay',cod:'Cash on Delivery'})[order.payment]}</strong></div>
          </div>
          <div class="divider"></div>
          <div class="pill" style="background:rgba(255,207,63,.2);color:#9a6b00">⭐ You earned ${earned} loyalty stars!</div>
          <p class="muted" style="margin-top:1rem">Delivering to: ${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.pin}</p>
        </div>
        <div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap">
          <a class="btn" href="#/track?id=${id}">Track order 📦</a>
          <a class="btn btn--ghost" href="#/account/orders">View orders</a>
          <a class="btn btn--ghost" href="#/shop">Continue shopping</a>
        </div>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { node, title: 'Checkout' };
}

function qrSVG() {
  // deterministic faux-QR
  let cells = '';
  const seed = [1,0,1,1,0,1,0,0,1,1,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0];
  for (let y=0;y<11;y++) for (let x=0;x<11;x++) {
    const on = (x*7 + y*5 + seed[(x+y)%seed.length]) % 3 === 0 || (x<3&&y<3)||(x>7&&y<3)||(x<3&&y>7);
    if (on) cells += `<rect x="${x*10}" y="${y*10}" width="10" height="10"/>`;
  }
  return `<svg width="120" height="120" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg"><rect width="110" height="110" fill="#fff"/><g fill="#1d1240">${cells}</g></svg>`;
}
