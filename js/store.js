// ============================================================
// Wahh Kids — Reactive store (localStorage-backed, pub/sub)
// ============================================================
import { byId } from './data.js';

const KEY = 'wahhkids_v1';

const DEFAULT = {
  cart: [],            // { id, color, size, qty }
  wishlist: [],        // [id]
  saved: [],           // save for later: { id, color, size, qty }
  compare: [],         // [id]
  recent: [],          // [id]
  user: null,          // { name, email }
  users: [],           // [{ name, email, password }]
  addresses: [],       // [{ id, name, phone, line1, city, state, pin, default }]
  orders: [],          // [{ id, items, totals, address, payment, status, date, tracking }]
  loyalty: 0,          // stars
  coupon: null,        // applied coupon code
  notif: true,
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    return { ...structuredClone(DEFAULT), ...JSON.parse(raw) };
  } catch { return structuredClone(DEFAULT); }
}

let state = load();
const subs = new Set();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}
function emit() { persist(); subs.forEach(fn => fn(state)); }

export const store = {
  get: () => state,
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  set(patch) { state = { ...state, ...patch }; emit(); },

  // ---------- Cart ----------
  cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); },
  addToCart(id, color, size, qty = 1) {
    const c = [...state.cart];
    const found = c.find(i => i.id === id && i.color === color && i.size === size);
    if (found) found.qty += qty; else c.push({ id, color, size, qty });
    state = { ...state, cart: c }; emit();
  },
  updateQty(idx, delta) {
    const c = [...state.cart];
    if (!c[idx]) return;
    c[idx].qty = Math.max(1, c[idx].qty + delta);
    state = { ...state, cart: c }; emit();
  },
  setQty(idx, qty) {
    const c = [...state.cart]; if (!c[idx]) return;
    c[idx].qty = Math.max(1, qty); state = { ...state, cart: c }; emit();
  },
  removeFromCart(idx) {
    const c = state.cart.filter((_, i) => i !== idx);
    state = { ...state, cart: c }; emit();
  },
  saveForLater(idx) {
    const c = [...state.cart]; const item = c.splice(idx, 1)[0];
    if (!item) return;
    state = { ...state, cart: c, saved: [...state.saved, item] }; emit();
  },
  moveToCart(idx) {
    const s = [...state.saved]; const item = s.splice(idx, 1)[0];
    if (!item) return;
    this.addToCart(item.id, item.color, item.size, item.qty);
    state = { ...state, saved: s }; emit();
  },
  removeSaved(idx) {
    state = { ...state, saved: state.saved.filter((_, i) => i !== idx) }; emit();
  },
  clearCart() { state = { ...state, cart: [], coupon: null }; emit(); },

  // ---------- Wishlist ----------
  inWishlist(id) { return state.wishlist.includes(id); },
  toggleWishlist(id) {
    const w = state.wishlist.includes(id)
      ? state.wishlist.filter(x => x !== id)
      : [...state.wishlist, id];
    state = { ...state, wishlist: w }; emit();
    return w.includes(id);
  },

  // ---------- Compare ----------
  inCompare(id) { return state.compare.includes(id); },
  toggleCompare(id) {
    let comp = state.compare;
    if (comp.includes(id)) comp = comp.filter(x => x !== id);
    else comp = [...comp, id].slice(-4);
    state = { ...state, compare: comp }; emit();
    return comp.includes(id);
  },
  clearCompare() { state = { ...state, compare: [] }; emit(); },

  // ---------- Recently viewed ----------
  pushRecent(id) {
    const r = [id, ...state.recent.filter(x => x !== id)].slice(0, 12);
    state = { ...state, recent: r }; emit();
  },

  // ---------- Coupon ----------
  applyCoupon(code) { state = { ...state, coupon: code }; emit(); },
  clearCoupon() { state = { ...state, coupon: null }; emit(); },

  // ---------- Auth ----------
  register({ name, email, password }) {
    if (state.users.some(u => u.email === email)) return { ok: false, msg: 'Email already registered' };
    const users = [...state.users, { name, email, password }];
    state = { ...state, users, user: { name, email } }; emit();
    return { ok: true };
  },
  login(email, password) {
    const u = state.users.find(x => x.email === email && x.password === password);
    if (!u) return { ok: false, msg: 'Invalid email or password' };
    state = { ...state, user: { name: u.name, email: u.email } }; emit();
    return { ok: true };
  },
  logout() { state = { ...state, user: null }; emit(); },
  resetPassword(email, password) {
    const users = state.users.map(u => u.email === email ? { ...u, password } : u);
    state = { ...state, users }; emit();
    return { ok: state.users.some(u => u.email === email) };
  },

  // ---------- Addresses ----------
  addAddress(addr) {
    const id = 'addr' + Date.now();
    const list = [...state.addresses, { ...addr, id, default: state.addresses.length === 0 }];
    state = { ...state, addresses: list }; emit();
    return id;
  },
  removeAddress(id) { state = { ...state, addresses: state.addresses.filter(a => a.id !== id) }; emit(); },
  setDefaultAddress(id) {
    state = { ...state, addresses: state.addresses.map(a => ({ ...a, default: a.id === id })) }; emit();
  },

  // ---------- Orders ----------
  placeOrder(order) {
    const id = 'WK' + Date.now().toString().slice(-8);
    const o = { ...order, id, date: new Date().toISOString(), status: 'Confirmed',
      tracking: buildTracking() };
    const earned = Math.floor(order.totals.total / 10);
    state = { ...state, orders: [o, ...state.orders], cart: [], coupon: null, loyalty: state.loyalty + earned };
    emit();
    return { id, earned };
  },
  cancelOrder(id) {
    state = { ...state, orders: state.orders.map(o => o.id === id ? { ...o, status: 'Cancelled' } : o) }; emit();
  },

  // ---------- helpers ----------
  cartDetailed() {
    return state.cart.map((line, idx) => ({ ...line, idx, product: byId(line.id) })).filter(x => x.product);
  },
};

function buildTracking() {
  const now = Date.now();
  return [
    { step: 'Order Confirmed', done: true, at: now },
    { step: 'Packed with care', done: true, at: now + 36e5 },
    { step: 'Shipped', done: false, at: now + 864e5 },
    { step: 'Out for delivery', done: false, at: now + 3 * 864e5 },
    { step: 'Delivered', done: false, at: now + 4 * 864e5 },
  ];
}

// Expose for quick debugging
window.__wahh = store;
