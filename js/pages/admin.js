// ============================================================
// Wahh Kids — Admin dashboard
// ============================================================
import { store } from '../store.js';
import { PRODUCTS, CATEGORIES, COUPONS, formatINR, discountPct, productImage, setProductImageLocal, LOCAL_IMG_KEY, LOCAL_INV_KEY } from '../data.js';
import { garmentSVG } from '../svg.js';
import { el, qs, qsa, toast, modal, compressImage } from '../ui.js';
import { firebaseEnabled, authReady, currentAdmin, adminLogin, adminLogout, setStock, seedInventory, setProductImage, removeProductImage } from '../firebase.js';

// Persist an uploaded photo in the right place for the current mode
function saveLocalImage(id, dataUrl) {
  let map = {};
  try { map = JSON.parse(localStorage.getItem(LOCAL_IMG_KEY) || '{}'); } catch {}
  if (dataUrl) map[id] = dataUrl; else delete map[id];
  try { localStorage.setItem(LOCAL_IMG_KEY, JSON.stringify(map)); }
  catch (e) { toast('Image too large for local storage — connect Firebase', 'err'); }
}
async function savePhoto(id, dataUrl) {
  setProductImageLocal(id, dataUrl);
  if (firebaseEnabled) {
    if (dataUrl) await setProductImage(id, dataUrl); else await removeProductImage(id);
  } else {
    saveLocalImage(id, dataUrl);
  }
}

const AKEY = 'wahh_admin_v1';
function adminState() {
  try {
    const raw = localStorage.getItem(AKEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const init = {
    products: PRODUCTS.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock, sold: p.sold, type: p.type })),
    categories: CATEGORIES.map(c => ({ slug: c.slug, name: c.name, emoji: c.emoji })),
    coupons: COUPONS.map(c => ({ ...c })),
    banners: ['✨ Welcome to Wahh Kids', '🚚 Free shipping over ₹999'],
  };
  localStorage.setItem(AKEY, JSON.stringify(init));
  return init;
}
function saveAdmin(a) { localStorage.setItem(AKEY, JSON.stringify(a)); }

export default async function AdminPage(ctx) {
  const tab = ctx.params.tab || 'dashboard';
  // Real backend connected → require admin login
  if (firebaseEnabled) {
    let user = null;
    try { await authReady(); user = await currentAdmin(); } catch (e) { console.warn(e); }
    if (!user) return { node: adminLoginView(), title: 'Admin login' };
    return { node: dashboardShell(tab, user), title: 'Admin' };
  }
  // No backend yet → local demo console
  return { node: dashboardShell(tab, null), title: 'Admin' };
}

function adminLoginView() {
  const node = el(`<div class="page-pad"><div class="container">
    <div class="card glass auth-card">
      <div class="center" style="margin-bottom:1rem"><div style="font-size:2.6rem">🛠️</div><h2 style="margin:.2rem 0">Admin Login</h2><p class="muted">Sign in with your store admin account to manage products &amp; live stock.</p></div>
      <div class="field"><label>Admin email</label><input id="ae" type="email" placeholder="admin@email.com" autocomplete="username"/></div>
      <div class="field"><label>Password</label><input id="ap" type="password" placeholder="••••••••" autocomplete="current-password"/></div>
      <button class="btn btn--block" id="adminLoginBtn">Sign in 🔑</button>
      <p class="muted center" style="font-size:.8rem;margin-top:.9rem">Create this account in Firebase → Authentication → Users.</p>
      <p class="center" style="margin-top:.6rem"><a href="#/" style="color:var(--grape-deep);text-decoration:underline;font-size:.9rem">← Back to store</a></p>
    </div>
  </div></div>`);
  const btn = qs('#adminLoginBtn', node);
  const submit = async () => {
    const email = qs('#ae', node).value.trim(), pass = qs('#ap', node).value;
    if (!email || !pass) { toast('Enter your email and password', 'err'); return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    const r = await adminLogin(email, pass);
    btn.disabled = false; btn.textContent = 'Sign in 🔑';
    if (r.ok) { toast('Welcome, admin! 🛠️', 'ok'); location.hash = '/admin'; window.dispatchEvent(new HashChangeEvent('hashchange')); }
    else toast(r.msg || 'Login failed', 'err');
  };
  btn.addEventListener('click', submit);
  qs('#ap', node).addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  return node;
}

function dashboardShell(tab, user) {
  const a = adminState();
  const NAV = [
    ['dashboard','📊 Dashboard'],['products','👕 Products'],['categories','🗂️ Categories'],
    ['orders','📦 Orders'],['users','👥 Customers'],['coupons','🎟️ Coupons'],['banners','📢 Banners'],
  ];
  const statusPill = firebaseEnabled
    ? `<span class="pill" style="background:rgba(63,224,176,.18);color:#0a8a64">🟢 Connected · live</span>`
    : `<span class="pill">Demo · stored locally</span>`;
  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Admin</strong></div>
    <div class="section__head"><h1 style="margin:0">Admin Console 🛠️</h1>${statusPill}</div>
    ${firebaseEnabled ? '' : `<div class="card" style="padding:1rem 1.2rem;margin:1rem 0;border-left:5px solid var(--sun);background:#fffaf0">
      <strong>You're in demo mode.</strong> <span class="muted">Changes here stay on this device only. To make stock update live for all visitors, connect Firebase (ask the builder or see README).</span></div>`}
    <div class="admin-layout" style="margin-top:1.2rem">
      <aside class="card admin-sidebar">
        ${NAV.map(([t,l])=>`<button data-go="${t}" class="${t===tab?'active':''}">${l}</button>`).join('')}
        ${user ? `<div style="padding:.6rem 1rem;border-top:1px solid rgba(108,76,241,.12);margin-top:.4rem"><div class="muted" style="font-size:.75rem">Signed in</div><div style="font-size:.82rem;font-weight:700;word-break:break-all">${user.email}</div></div><button id="adminLogout">🚪 Log out</button>` : ''}
      </aside>
      <div id="adminMain"></div>
    </div>
  </div></div>`);
  qsa('[data-go]', node).forEach(b => b.addEventListener('click', () => location.hash = '/admin/' + b.dataset.go));
  const lo = qs('#adminLogout', node);
  if (lo) lo.addEventListener('click', async () => { await adminLogout(); toast('Logged out', 'info'); location.hash = '/admin'; window.dispatchEvent(new HashChangeEvent('hashchange')); });

  const main = qs('#adminMain', node);
  ({ dashboard: dash, products: prods, categories: cats, orders: ords, users: usrs, coupons: cps, banners: bnr }[tab] || dash)(main, a);
  return node;
}

function dash(main, a) {
  const s = store.get();
  const revenue = s.orders.reduce((x,o)=>x+(o.totals?.total||0),0) + 184500; // demo baseline
  const orders = s.orders.length + 326;
  const lowStock = a.products.filter(p=>p.stock<10).length;
  // sales by category from sold
  const byCat = {};
  PRODUCTS.forEach(p => byCat[p.category] = (byCat[p.category]||0) + p.sold);
  const max = Math.max(...Object.values(byCat));
  main.innerHTML = `
    <div class="stat-row">
      <div class="stat" style="background:var(--grad-grape)"><span class="ic">💰</span><div class="v">${formatINR(revenue)}</div><div class="l">Total revenue</div></div>
      <div class="stat" style="background:var(--grad-candy)"><span class="ic">📦</span><div class="v">${orders}</div><div class="l">Orders</div></div>
      <div class="stat" style="background:var(--grad-sea)"><span class="ic">👥</span><div class="v">${s.users.length + 1240}</div><div class="l">Customers</div></div>
      <div class="stat" style="background:linear-gradient(135deg,#ffcf3f,#ff7a59)"><span class="ic">⚠️</span><div class="v">${lowStock}</div><div class="l">Low stock items</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:20px;margin-top:1.4rem" class="row2">
      <div class="card" style="padding:1.4rem">
        <h3 style="margin-top:0">Sales by category</h3>
        <div class="bar-chart">
          ${Object.entries(byCat).map(([c,v])=>`<div class="bar" style="height:${Math.round(v/max*100)}%"><b>${v}</b><span>${c}</span></div>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:1.4rem">
        <h3 style="margin-top:0">Top products</h3>
        ${PRODUCTS.slice().sort((x,y)=>y.sold-x.sold).slice(0,5).map((p,i)=>`<div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(108,76,241,.08)"><span>${i+1}. ${p.name}</span><strong>${p.sold} sold</strong></div>`).join('')}
      </div>
    </div>
    <div class="card" style="padding:1.4rem;margin-top:1.4rem">
      <h3 style="margin-top:0">Recent orders</h3>
      ${s.orders.length ? `<table class="tbl"><thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
        ${s.orders.slice(0,6).map(o=>`<tr><td><strong>${o.id}</strong></td><td>${new Date(o.date).toLocaleDateString()}</td><td>${o.items.length}</td><td>${formatINR(o.totals.total)}</td><td><span class="chip-status" style="background:rgba(63,224,176,.18);color:#0a8a64">${o.status}</span></td></tr>`).join('')}
      </tbody></table>` : '<p class="muted">No live orders yet — place one from the storefront to see it here.</p>'}
    </div>`;
  // animate bars
  requestAnimationFrame(() => qsa('.bar', main).forEach(b => { const h = b.style.height; b.style.height='0'; requestAnimationFrame(()=>b.style.height=h); }));
}

function prods(main) {
  const persistLocalStock = (id, qty) => {
    let map = {}; try { map = JSON.parse(localStorage.getItem(LOCAL_INV_KEY) || '{}'); } catch {}
    map[id] = qty; try { localStorage.setItem(LOCAL_INV_KEY, JSON.stringify(map)); } catch {}
  };
  const writeStock = async (p, qty) => {
    qty = Math.max(0, qty | 0);
    p.stock = qty; draw();
    try {
      if (firebaseEnabled) await setStock(p.id, qty);
      else persistLocalStock(p.id, qty);
      toast(`${p.name}: stock set to ${qty}${firebaseEnabled ? ' · live' : ''}`, 'ok');
    } catch (e) { toast('Could not save stock', 'err'); }
  };
  const doUpload = async (p, file) => {
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      await savePhoto(p.id, dataUrl);
      toast(`${p.name}: photo updated${firebaseEnabled ? ' · live' : ''} 📷`, 'ok'); draw();
    } catch (e) { toast(e.message || 'Upload failed', 'err'); }
  };
  const removePhoto = async (p) => {
    try { await savePhoto(p.id, null); toast('Photo removed', 'info'); draw(); }
    catch (e) { toast('Could not remove photo', 'err'); }
  };
  const draw = () => {
    const list = PRODUCTS;
    const modeNote = firebaseEnabled
      ? 'Changes update <strong>instantly for every visitor</strong>.'
      : 'Demo mode: changes show on <strong>this device</strong> only. Connect Firebase to go live for everyone.';
    main.innerHTML = `<div class="section__head"><h2 style="margin:0">Products &amp; stock (${list.length})</h2>
        ${firebaseEnabled ? '<button class="btn btn--ghost btn--sm" id="seedBtn">⬆️ Sync catalog to database</button>' : ''}</div>
      <p class="muted" style="margin:.4rem 0 0">${modeNote} Set stock to <strong>0</strong> to mark a product out of stock. Upload a photo to replace the illustration.</p>
      <div class="card" style="padding:0;overflow:auto;margin-top:1rem"><table class="tbl">
        <thead><tr><th>Photo</th><th>Product</th><th>Price</th><th>Stock</th></tr></thead>
        <tbody>${list.map((p) => `<tr data-id="${p.id}">
          <td>
            <div class="cart-line__media" style="width:56px;height:66px;margin-bottom:.35rem">${productImage(p.id) ? `<img src="${productImage(p.id)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/>` : garmentSVG(p.type, p.colors[0].hex)}</div>
            <input type="file" accept="image/*" data-file hidden/>
            <button class="btn btn--ghost btn--sm" data-upload>${productImage(p.id) ? '📷 Change' : '📷 Upload'}</button>
            ${productImage(p.id) ? '<button data-rmphoto class="muted" style="display:block;font-size:.74rem;text-decoration:underline;margin-top:.25rem">Remove</button>' : ''}
          </td>
          <td><strong>${p.name}</strong><div class="muted" style="font-size:.78rem">${p.category}</div></td>
          <td>${formatINR(p.price)}</td>
          <td><div style="display:flex;align-items:center;gap:.45rem;flex-wrap:wrap">
            <div class="qty"><button data-dec>−</button><span>${p.stock}</span><button data-inc>+</button></div>
            <input data-stockinput type="number" min="0" value="${p.stock}" style="width:70px;padding:.4rem;border-radius:8px;border:1px solid rgba(108,76,241,.2)"/>
            <button class="btn btn--sm" data-save>Set</button>
            ${p.stock <= 0 ? '<span class="chip-status" style="background:rgba(255,122,89,.15);color:#c9482b">Out</span>' : p.stock < 10 ? '<span class="chip-status" style="background:rgba(255,207,63,.2);color:#9a6b00">Low</span>' : ''}
          </div></td>
        </tr>`).join('')}</tbody>
      </table></div>`;

    qsa('tr[data-id]', main).forEach(row => {
      const p = PRODUCTS.find(x => x.id === row.dataset.id); if (!p) return;
      row.querySelector('[data-inc]').addEventListener('click', () => writeStock(p, p.stock + 1));
      row.querySelector('[data-dec]').addEventListener('click', () => writeStock(p, p.stock - 1));
      row.querySelector('[data-save]').addEventListener('click', () => writeStock(p, +row.querySelector('[data-stockinput]').value));
      const fileInput = row.querySelector('[data-file]');
      row.querySelector('[data-upload]').addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', () => doUpload(p, fileInput.files[0]));
      const rm = row.querySelector('[data-rmphoto]'); if (rm) rm.addEventListener('click', () => removePhoto(p));
    });
    const seed = qs('#seedBtn', main);
    if (seed) seed.addEventListener('click', async () => {
      seed.disabled = true; seed.textContent = 'Syncing…';
      const map = Object.fromEntries(PRODUCTS.map(p => [p.id, p.stock]));
      try { await seedInventory(map); toast('Catalog synced to database ✅', 'ok'); }
      catch (e) { toast('Sync failed — check your setup', 'err'); }
      seed.disabled = false; seed.textContent = '⬆️ Sync catalog to database';
    });
  };
  draw();
}

function cats(main, a) {
  const draw = () => {
    main.innerHTML = `<div class="section__head"><h2 style="margin:0">Categories</h2><button class="btn btn--sm" id="addC">+ Add</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem;margin-top:1rem">
        ${a.categories.map((c,i)=>`<div class="card" style="padding:1.2rem;text-align:center"><div style="font-size:2rem">${c.emoji}</div><strong>${c.name}</strong><div class="muted" style="font-size:.8rem">${PRODUCTS.filter(p=>p.category===c.slug).length} products</div><button class="btn btn--ghost btn--sm" data-delc="${i}" style="margin-top:.6rem">Remove</button></div>`).join('')}
      </div>`;
    qs('#addC', main).addEventListener('click', () => {
      const { overlay, close } = modal(`<h3>Add category</h3><div class="field"><label>Name</label><input id="cn"/></div><div class="field"><label>Emoji</label><input id="ce" value="🧸"/></div><button class="btn btn--block" id="sc">Save</button>`);
      overlay.querySelector('#sc').addEventListener('click',()=>{ const n=overlay.querySelector('#cn').value.trim(); if(!n){toast('Name required','err');return;} a.categories.push({slug:n.toLowerCase().replace(/\s+/g,'-'),name:n,emoji:overlay.querySelector('#ce').value||'🧸'}); saveAdmin(a); close(); draw(); });
    });
    qsa('[data-delc]', main).forEach(b=>b.addEventListener('click',()=>{ a.categories.splice(+b.dataset.delc,1); saveAdmin(a); draw(); }));
  };
  draw();
}

function ords(main) {
  const draw = () => {
    const s = store.get();
    if (!s.orders.length) { main.innerHTML = `<h2>Orders</h2><div class="empty-state"><div class="emoji">📦</div><p class="muted">No orders yet. Place one from the storefront.</p></div>`; return; }
    main.innerHTML = `<h2>Orders (${s.orders.length})</h2>
      <div class="card" style="padding:0;overflow:auto;margin-top:1rem"><table class="tbl">
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>${s.orders.map(o=>`<tr>
          <td><strong>${o.id}</strong><div class="muted" style="font-size:.78rem">${new Date(o.date).toLocaleDateString()}</div></td>
          <td>${o.email||o.address?.name||'Guest'}</td>
          <td>${formatINR(o.totals.total)}</td>
          <td>${({upi:'UPI',qr:'QR',cod:'COD'})[o.payment]||o.payment}</td>
          <td><select data-status="${o.id}" class="field" style="margin:0;padding:.4rem .6rem;border-radius:10px">
            ${['Confirmed','Packed','Shipped','Out for delivery','Delivered','Cancelled'].map(st=>`<option ${o.status===st?'selected':''}>${st}</option>`).join('')}
          </select></td>
        </tr>`).join('')}</tbody>
      </table></div>`;
    qsa('[data-status]', main).forEach(sel => sel.addEventListener('change', () => {
      const o = store.get().orders.find(o=>o.id===sel.dataset.status);
      if (o) { o.status = sel.value; store.set({ orders: store.get().orders }); toast('Status updated','ok'); }
    }));
  };
  draw();
}

function usrs(main) {
  const s = store.get();
  const demo = [{name:'Aanya Sharma',email:'aanya@example.com'},{name:'Rahul Verma',email:'rahul@example.com'},{name:'Priya Nair',email:'priya@example.com'}];
  const all = [...s.users, ...demo];
  main.innerHTML = `<h2>Customers (${all.length})</h2>
    <div class="card" style="padding:0;overflow:auto;margin-top:1rem"><table class="tbl">
      <thead><tr><th>Name</th><th>Email</th><th>Type</th></tr></thead>
      <tbody>${all.map((u,i)=>`<tr><td><strong>${u.name}</strong></td><td>${u.email}</td><td>${i<s.users.length?'<span class="chip-status" style="background:rgba(63,224,176,.18);color:#0a8a64">Registered</span>':'<span class="chip-status" style="background:rgba(108,76,241,.1);color:var(--grape-deep)">Demo</span>'}</td></tr>`).join('')}</tbody>
    </table></div>`;
}

function cps(main, a) {
  const draw = () => {
    main.innerHTML = `<div class="section__head"><h2 style="margin:0">Coupons</h2><button class="btn btn--sm" id="addCp">+ Add coupon</button></div>
      <div class="card" style="padding:0;overflow:auto;margin-top:1rem"><table class="tbl">
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Min spend</th><th></th></tr></thead>
        <tbody>${a.coupons.map((c,i)=>`<tr><td><strong>${c.code}</strong></td><td>${c.type}</td><td>${c.type==='percent'?c.value+'%':c.type==='flat'?formatINR(c.value):'Free ship'}</td><td>${formatINR(c.min)}</td><td style="text-align:right"><button class="btn btn--ghost btn--sm" data-delcp="${i}">🗑️</button></td></tr>`).join('')}</tbody>
      </table></div>`;
    qs('#addCp', main).addEventListener('click', () => {
      const { overlay, close } = modal(`<h3>Add coupon</h3>
        <div class="field"><label>Code</label><input id="cc" style="text-transform:uppercase"/></div>
        <div class="row2"><div class="field"><label>Type</label><select id="ct"><option value="percent">Percent</option><option value="flat">Flat ₹</option><option value="ship">Free shipping</option></select></div>
        <div class="field"><label>Value</label><input id="cv" type="number" value="10"/></div></div>
        <div class="field"><label>Min spend (₹)</label><input id="cm" type="number" value="0"/></div>
        <button class="btn btn--block" id="scp">Save</button>`);
      overlay.querySelector('#scp').addEventListener('click',()=>{ const code=overlay.querySelector('#cc').value.trim().toUpperCase(); if(!code){toast('Code required','err');return;} a.coupons.push({code,type:overlay.querySelector('#ct').value,value:+overlay.querySelector('#cv').value,min:+overlay.querySelector('#cm').value,desc:'Custom coupon'}); saveAdmin(a); close(); draw(); });
    });
    qsa('[data-delcp]', main).forEach(b=>b.addEventListener('click',()=>{ a.coupons.splice(+b.dataset.delcp,1); saveAdmin(a); draw(); }));
  };
  draw();
}

function bnr(main, a) {
  const draw = () => {
    main.innerHTML = `<div class="section__head"><h2 style="margin:0">Announcement banners</h2><button class="btn btn--sm" id="addB">+ Add</button></div>
      <p class="muted">These are the rotating messages in the top bar.</p>
      <div style="display:flex;flex-direction:column;gap:.6rem;margin-top:1rem">
        ${a.banners.map((b,i)=>`<div class="card" style="padding:1rem 1.2rem;display:flex;justify-content:space-between;align-items:center"><span>${b}</span><button class="btn btn--ghost btn--sm" data-delb="${i}">Remove</button></div>`).join('')}
      </div>`;
    qs('#addB', main).addEventListener('click', () => {
      const { overlay, close } = modal(`<h3>Add banner</h3><div class="field"><label>Message</label><input id="bm" placeholder="🎉 New offer…"/></div><button class="btn btn--block" id="sb">Save</button>`);
      overlay.querySelector('#sb').addEventListener('click',()=>{ const m=overlay.querySelector('#bm').value.trim(); if(!m){toast('Message required','err');return;} a.banners.push(m); saveAdmin(a); close(); draw(); toast('Banner added (refresh to see in rotation)','info'); });
    });
    qsa('[data-delb]', main).forEach(b=>b.addEventListener('click',()=>{ a.banners.splice(+b.dataset.delb,1); saveAdmin(a); draw(); }));
  };
  draw();
}
