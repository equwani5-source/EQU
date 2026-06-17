// ============================================================
// Wahh Kids — Account (auth + dashboard)
// ============================================================
import { store } from '../store.js';
import { byId, formatINR } from '../data.js';
import { garmentSVG } from '../svg.js';
import { productCardHTML, wireCards } from '../components/card.js';
import { el, qs, qsa, toast } from '../ui.js';
import { navigate } from '../router.js';

export default function AccountPage(ctx) {
  const tab = ctx.params.tab || 'overview';
  const user = store.get().user;
  if (!user) return { node: authView(), title: 'Sign in' };
  return { node: dashboard(tab), title: 'My Account' };
}

// ---------------- AUTH ----------------
function authView() {
  const node = el(`<div class="page-pad"><div class="container">
    <div class="card glass auth-card">
      <div class="center" style="margin-bottom:1rem"><div style="font-size:2.6rem">🌟</div><h2 style="margin:.2rem 0">Welcome to Wahh Kids</h2><p class="muted">Sign in to track orders, save favourites and earn stars.</p></div>
      <div class="auth-tabs"><button data-t="login" class="active">Login</button><button data-t="register">Register</button><button data-t="reset">Reset</button></div>
      <div id="authBody"></div>
    </div>
  </div></div>`);
  const body = qs('#authBody', node);
  const tabs = qsa('.auth-tabs button', node);
  const show = (t) => {
    tabs.forEach(b => b.classList.toggle('active', b.dataset.t === t));
    if (t === 'login') body.innerHTML = `
      <div class="field"><label>Email</label><input id="le" type="email" placeholder="you@email.com"/></div>
      <div class="field"><label>Password</label><input id="lp" type="password" placeholder="••••••••"/></div>
      <button class="btn btn--block" id="loginBtn">Login ✨</button>
      <p class="muted center" style="font-size:.82rem;margin-top:.8rem">Tip: register first, data is stored locally in your browser.</p>`;
    else if (t === 'register') body.innerHTML = `
      <div class="field"><label>Full name</label><input id="rn" placeholder="Your name"/></div>
      <div class="field"><label>Email</label><input id="re" type="email" placeholder="you@email.com"/></div>
      <div class="field"><label>Password</label><input id="rp" type="password" placeholder="Create a password"/></div>
      <button class="btn btn--block" id="regBtn">Create account 🎉</button>`;
    else body.innerHTML = `
      <div class="field"><label>Email</label><input id="xe" type="email" placeholder="you@email.com"/></div>
      <div class="field"><label>New password</label><input id="xp" type="password" placeholder="New password"/></div>
      <button class="btn btn--block" id="resetBtn">Reset password</button>`;
    wire(t);
  };
  const wire = (t) => {
    if (t === 'login') qs('#loginBtn', body).addEventListener('click', () => {
      const r = store.login(qs('#le',body).value.trim(), qs('#lp',body).value);
      if (r.ok) { toast('Welcome back! 💜','ok'); navigate('/account'); } else toast(r.msg,'err');
    });
    else if (t === 'register') qs('#regBtn', body).addEventListener('click', () => {
      const name = qs('#rn',body).value.trim(), email = qs('#re',body).value.trim(), pass = qs('#rp',body).value;
      if (!name || !/.+@.+\..+/.test(email) || pass.length < 4) { toast('Fill all fields (password 4+ chars)','err'); return; }
      const r = store.register({ name, email, password: pass });
      if (r.ok) { toast('Account created! Welcome 🎉','ok'); navigate('/account'); } else toast(r.msg,'err');
    });
    else qs('#resetBtn', body).addEventListener('click', () => {
      const r = store.resetPassword(qs('#xe',body).value.trim(), qs('#xp',body).value);
      if (r.ok) { toast('Password reset! You can log in now','ok'); show('login'); } else toast('No account with that email','err');
    });
  };
  tabs.forEach(b => b.addEventListener('click', () => show(b.dataset.t)));
  show('login');
  return node;
}

// ---------------- DASHBOARD ----------------
function dashboard(tab) {
  const s = store.get();
  const user = s.user;
  const NAV = [
    ['overview','🏠 Overview'],['orders','📦 Orders'],['wishlist','💖 Wishlist'],
    ['recent','👀 Recently viewed'],['addresses','📍 Addresses'],['loyalty','⭐ Loyalty'],
    ['profile','👤 Profile'],
  ];
  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Account</strong></div>
    <div class="acct-layout">
      <aside class="card acct-side">
        <div style="padding:.8rem 1rem"><div style="font-size:1.8rem">👤</div><strong>${user.name}</strong><div class="muted" style="font-size:.8rem">${user.email}</div></div>
        ${NAV.map(([t,l])=>`<a href="#/account/${t}" data-tab="${t}" class="${t===tab?'active':''}">${l}</a>`).join('')}
        <button id="logoutBtn">🚪 Log out</button>
      </aside>
      <div id="acctMain"></div>
    </div>
  </div></div>`);

  qs('#logoutBtn', node).addEventListener('click', () => { store.logout(); toast('Logged out','info'); navigate('/account'); });

  const main = qs('#acctMain', node);
  if (tab === 'orders') renderOrders(main, s);
  else if (tab === 'addresses') renderAddresses(main, node);
  else if (tab === 'loyalty') renderLoyalty(main, s);
  else if (tab === 'recent') renderRecent(main, s);
  else if (tab === 'wishlist') renderWish(main, s);
  else if (tab === 'profile') renderProfile(main, user);
  else renderOverview(main, s, user);

  return node;
}

function renderOverview(main, s, user) {
  const spent = s.orders.reduce((a,o)=>a+(o.totals?.total||0),0);
  main.innerHTML = `
    <h2>Hi ${user.name.split(' ')[0]}! 👋</h2>
    <div class="stat-row" style="margin:1rem 0 1.6rem">
      <div class="stat" style="background:var(--grad-grape)"><span class="ic">📦</span><div class="v">${s.orders.length}</div><div class="l">Orders placed</div></div>
      <div class="stat" style="background:var(--grad-candy)"><span class="ic">⭐</span><div class="v">${s.loyalty}</div><div class="l">Loyalty stars</div></div>
      <div class="stat" style="background:var(--grad-sea)"><span class="ic">💖</span><div class="v">${s.wishlist.length}</div><div class="l">Wishlist items</div></div>
      <div class="stat" style="background:linear-gradient(135deg,#ffcf3f,#ff7a59)"><span class="ic">💰</span><div class="v">${formatINR(spent)}</div><div class="l">Total spent</div></div>
    </div>
    <div class="card" style="padding:1.4rem">
      <h3 style="margin-top:0">Recent orders</h3>
      ${s.orders.length ? s.orders.slice(0,3).map(orderMiniRow).join('') : '<p class="muted">No orders yet. <a href="#/shop" style="text-decoration:underline">Start shopping</a></p>'}
    </div>`;
}

function orderMiniRow(o) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:.7rem 0;border-bottom:1px solid rgba(108,76,241,.08)">
    <div><strong>${o.id}</strong><div class="muted" style="font-size:.8rem">${new Date(o.date).toLocaleDateString()} · ${o.items.length} item(s)</div></div>
    <div style="text-align:right"><strong>${formatINR(o.totals.total)}</strong><br><a href="#/track?id=${o.id}" class="pill" style="font-size:.7rem">${o.status}</a></div>
  </div>`;
}

function renderOrders(main, s) {
  if (!s.orders.length) { main.innerHTML = `<div class="empty-state"><div class="emoji">📦</div><h2>No orders yet</h2><a class="btn" href="#/shop">Shop now</a></div>`; return; }
  main.innerHTML = `<h2>My Orders</h2>` + s.orders.map(o=>`
    <div class="card" style="padding:1.3rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;align-items:center">
        <div><strong>${o.id}</strong> <span class="chip-status" style="background:${o.status==='Cancelled'?'rgba(255,122,89,.15);color:#c9482b':'rgba(63,224,176,.18);color:#0a8a64'}">${o.status}</span><div class="muted" style="font-size:.82rem">${new Date(o.date).toLocaleString()}</div></div>
        <div style="display:flex;gap:.5rem"><a class="btn btn--ghost btn--sm" href="#/track?id=${o.id}">Track</a>${o.status!=='Cancelled'&&o.status!=='Delivered'?`<button class="btn btn--ghost btn--sm" data-cancel="${o.id}">Cancel</button>`:''}</div>
      </div>
      <div style="display:flex;gap:.7rem;flex-wrap:wrap;margin:.9rem 0">
        ${o.items.map(it=>`<div class="cart-line__media" style="width:54px;height:64px" title="${it.name} ×${it.qty}">${garmentSVG(it.type, hexByName(it))}</div>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between"><span class="muted">Total</span><strong>${formatINR(o.totals.total)}</strong></div>
    </div>`).join('');
  qsa('[data-cancel]', main).forEach(b => b.addEventListener('click', () => { store.cancelOrder(b.dataset.cancel); toast('Order cancelled','info'); renderOrders(main, store.get()); }));
}
function hexByName(it){ const p = byId(it.id); if(!p) return '#6c4cf1'; const c=p.colors.find(c=>c.name===it.color); return c?c.hex:p.colors[0].hex; }

function renderAddresses(main, node) {
  const draw = () => {
    const list = store.get().addresses;
    main.innerHTML = `<div class="section__head"><h2 style="margin:0">Addresses</h2><button class="btn btn--sm" id="addAddr">+ Add address</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem;margin-top:1rem">
        ${list.length?list.map(a=>`<div class="card" style="padding:1.2rem">
          ${a.default?'<span class="pill" style="font-size:.7rem">Default</span>':''}
          <strong>${a.name}</strong><p class="muted" style="font-size:.88rem;margin:.4rem 0">${a.line1}<br>${a.city}, ${a.state} ${a.pin}<br>📞 ${a.phone}</p>
          <div style="display:flex;gap:.5rem">${a.default?'':`<button class="btn btn--ghost btn--sm" data-def="${a.id}">Set default</button>`}<button class="btn btn--ghost btn--sm" data-del="${a.id}">Delete</button></div>
        </div>`).join('') : '<p class="muted">No saved addresses yet.</p>'}
      </div>`;
    qs('#addAddr', main).addEventListener('click', addForm);
    qsa('[data-del]', main).forEach(b=>b.addEventListener('click',()=>{ store.removeAddress(b.dataset.del); draw(); }));
    qsa('[data-def]', main).forEach(b=>b.addEventListener('click',()=>{ store.setDefaultAddress(b.dataset.def); draw(); }));
  };
  const addForm = () => {
    main.innerHTML = `<h2>Add address</h2><div class="card" style="padding:1.4rem;max-width:520px">
      <div class="field"><label>Full name</label><input id="n"/></div>
      <div class="field"><label>Address</label><input id="l"/></div>
      <div class="row2"><div class="field"><label>City</label><input id="c"/></div><div class="field"><label>State</label><input id="st"/></div></div>
      <div class="row2"><div class="field"><label>PIN</label><input id="p"/></div><div class="field"><label>Phone</label><input id="ph"/></div></div>
      <div style="display:flex;gap:.6rem"><button class="btn" id="save">Save</button><button class="btn btn--ghost" id="cancel">Cancel</button></div>
    </div>`;
    qs('#save', main).addEventListener('click', () => {
      const a = { name:qs('#n',main).value.trim(), line1:qs('#l',main).value.trim(), city:qs('#c',main).value.trim(), state:qs('#st',main).value.trim(), pin:qs('#p',main).value.trim(), phone:qs('#ph',main).value.trim() };
      if (!a.name||!a.line1||!a.city||a.pin.length<6) { toast('Please complete the form','err'); return; }
      store.addAddress(a); toast('Address saved 📍','ok'); draw();
    });
    qs('#cancel', main).addEventListener('click', draw);
  };
  draw();
}

function renderLoyalty(main, s) {
  const next = Math.ceil((s.loyalty+1)/500)*500;
  main.innerHTML = `<h2>Loyalty Stars ⭐</h2>
    <div class="card glass" style="padding:1.8rem;text-align:center;margin:1rem 0">
      <div style="font-family:var(--font-display);font-size:3.4rem;font-weight:800" class="gtext--candy">${s.loyalty}</div>
      <p class="muted">stars collected</p>
      <div style="height:12px;background:rgba(108,76,241,.12);border-radius:999px;overflow:hidden;max-width:380px;margin:1rem auto"><div style="width:${Math.min(100,(s.loyalty%500)/500*100)}%;height:100%;background:var(--grad-candy)"></div></div>
      <p class="muted" style="font-size:.9rem">${next - s.loyalty} stars to your next reward at ${next} ⭐</p>
    </div>
    <div class="stat-row">
      ${[['500 ⭐','₹100 off voucher'],['1000 ⭐','Free express shipping'],['2000 ⭐','Mystery gift box 🎁']].map((r,i)=>`<div class="card" style="padding:1.2rem;text-align:center"><div style="font-size:1.6rem">${['🎟️','🚀','🎁'][i]}</div><strong>${r[0]}</strong><p class="muted" style="font-size:.85rem;margin:.3rem 0 0">${r[1]}</p></div>`).join('')}
    </div>
    <div class="card" style="padding:1.4rem;margin-top:1rem"><h3 style="margin-top:0">Earn more stars</h3><ul class="muted" style="line-height:2"><li>🛍️ 1 star per ₹10 spent</li><li>✍️ +50 stars for a product review</li><li>👯 +200 stars per friend referral</li><li>🎂 Bonus stars on your child's birthday</li></ul></div>`;
}

function renderRecent(main, s) {
  const products = s.recent.map(byId).filter(Boolean);
  if (!products.length) { main.innerHTML = `<div class="empty-state"><div class="emoji">👀</div><h2>Nothing viewed yet</h2><a class="btn" href="#/shop">Explore</a></div>`; return; }
  main.innerHTML = `<h2>Recently viewed</h2><div class="grid grid--products" id="rg" style="margin-top:1rem"></div>`;
  const g = qs('#rg', main); g.innerHTML = products.map(p=>productCardHTML(p)).join(''); wireCards(g, products);
}

function renderWish(main, s) {
  const products = s.wishlist.map(byId).filter(Boolean);
  if (!products.length) { main.innerHTML = `<div class="empty-state"><div class="emoji">💖</div><h2>Your wishlist is empty</h2><a class="btn" href="#/shop">Find favourites</a></div>`; return; }
  main.innerHTML = `<div class="section__head"><h2 style="margin:0">Wishlist</h2><a class="btn btn--ghost btn--sm" href="#/wishlist">Open full wishlist</a></div><div class="grid grid--products" id="wg" style="margin-top:1rem"></div>`;
  const g = qs('#wg', main); g.innerHTML = products.map(p=>productCardHTML(p)).join(''); wireCards(g, products);
}

function renderProfile(main, user) {
  main.innerHTML = `<h2>Profile</h2><div class="card" style="padding:1.4rem;max-width:520px">
    <div class="field"><label>Full name</label><input id="pn" value="${user.name}"/></div>
    <div class="field"><label>Email</label><input id="pe" value="${user.email}" disabled/></div>
    <div class="field"><label>Notifications</label><label style="display:flex;gap:.5rem;align-items:center;font-weight:600"><input type="checkbox" id="pnotif" ${store.get().notif?'checked':''}/> Email me about drops &amp; offers</label></div>
    <button class="btn" id="saveProfile">Save changes</button>
  </div>`;
  qs('#saveProfile', main).addEventListener('click', () => {
    const name = qs('#pn', main).value.trim();
    store.set({ user: { ...user, name }, notif: qs('#pnotif', main).checked });
    toast('Profile updated ✨','ok');
  });
}
