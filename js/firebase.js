// ============================================================
// Wahh Kids — Firebase integration (auth + live inventory)
// Loaded lazily from CDN. Falls back gracefully when not configured.
// ============================================================
import { FIREBASE_CONFIG, FIREBASE_VERSION } from './firebase-config.js';

// Enabled only when the essential config fields are filled in
export const firebaseEnabled = !!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);

const CDN = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
const INV_PATH = ['store', 'inventory']; // collection, doc

let _app = null, _auth = null, _db = null, _M = null, _initPromise = null;

async function init() {
  if (_app) return;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const [appMod, authMod, fsMod] = await Promise.all([
      import(`${CDN}/firebase-app.js`),
      import(`${CDN}/firebase-auth.js`),
      import(`${CDN}/firebase-firestore.js`),
    ]);
    _app = appMod.initializeApp(FIREBASE_CONFIG);
    _auth = authMod.getAuth(_app);
    _db = fsMod.getFirestore(_app);
    _M = { ...authMod, ...fsMod };
  })();
  return _initPromise;
}

function invRef() { return _M.doc(_db, INV_PATH[0], INV_PATH[1]); }

// ---------------- Auth ----------------
export async function adminLogin(email, password) {
  await init();
  try {
    const cred = await _M.signInWithEmailAndPassword(_auth, email, password);
    return { ok: true, user: { email: cred.user.email, uid: cred.user.uid } };
  } catch (e) {
    return { ok: false, msg: friendlyAuthError(e) };
  }
}

export async function adminLogout() {
  await init();
  try { await _M.signOut(_auth); } catch {}
}

export async function watchAdmin(cb) {
  await init();
  return _M.onAuthStateChanged(_auth, (u) => cb(u ? { email: u.email, uid: u.uid } : null));
}

export async function currentAdmin() {
  await init();
  const u = _auth.currentUser;
  return u ? { email: u.email, uid: u.uid } : null;
}

// Resolves once the initial auth state has been restored (so we don't
// flash the login screen for an already-signed-in admin on refresh).
let _authReady = null;
export async function authReady() {
  await init();
  if (!_authReady) {
    _authReady = new Promise((res) => {
      const unsub = _M.onAuthStateChanged(_auth, (u) => {
        try { unsub(); } catch {}
        res(u ? { email: u.email, uid: u.uid } : null);
      });
    });
  }
  return _authReady;
}

// ---------------- Inventory (live stock) ----------------
// Stored as a single document store/inventory with field `stock` = { [productId]: qty }
export async function getInventory() {
  await init();
  try {
    const snap = await _M.getDoc(invRef());
    return snap.exists() ? (snap.data().stock || {}) : {};
  } catch (e) { console.warn('getInventory failed', e); return {}; }
}

export async function watchInventory(cb) {
  await init();
  return _M.onSnapshot(invRef(), (snap) => {
    cb(snap.exists() ? (snap.data().stock || {}) : {});
  }, (err) => console.warn('watchInventory error', err));
}

export async function setStock(productId, qty) {
  await init();
  await _M.setDoc(invRef(), { stock: { [productId]: Math.max(0, qty | 0) } }, { merge: true });
}

export async function seedInventory(map) {
  await init();
  await _M.setDoc(invRef(), { stock: map, seededAt: Date.now() }, { merge: true });
}

// ---------------- Product images (stored compressed in Firestore) ----------------
function imgCol() { return _M.collection(_db, 'productImages'); }
export async function getImages() {
  await init();
  try {
    const snap = await _M.getDocs(imgCol());
    const m = {}; snap.forEach(d => { m[d.id] = d.data().dataUrl; });
    return m;
  } catch (e) { console.warn('getImages failed', e); return {}; }
}
export async function watchImages(cb) {
  await init();
  return _M.onSnapshot(imgCol(), (snap) => {
    const m = {}; snap.forEach(d => { m[d.id] = d.data().dataUrl; });
    cb(m);
  }, (err) => console.warn('watchImages error', err));
}
export async function setProductImage(id, dataUrl) {
  await init();
  await _M.setDoc(_M.doc(_db, 'productImages', id), { dataUrl, at: Date.now() });
}
export async function removeProductImage(id) {
  await init();
  await _M.deleteDoc(_M.doc(_db, 'productImages', id));
}

function friendlyAuthError(e) {
  const c = (e && e.code) || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found'))
    return 'Wrong email or password.';
  if (c.includes('invalid-email')) return 'That email address looks invalid.';
  if (c.includes('too-many-requests')) return 'Too many attempts — please wait a moment.';
  if (c.includes('network')) return 'Network error — check your connection.';
  return 'Could not sign in. ' + (e && e.message ? e.message : '');
}
