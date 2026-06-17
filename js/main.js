// ============================================================
// Wahh Kids — App bootstrap
// ============================================================
import { route, startRouter, navigate } from './router.js';
import { store } from './store.js';
import { observeReveals, attachRipples, attachTilt } from './ui.js';
import { mountLayout, refreshChrome, setActiveNav } from './components/layout.js';

// Pages
import HomePage from './pages/home.js';
import ShopPage from './pages/shop.js';
import ProductPage from './pages/product.js';
import CartPage from './pages/cart.js';
import WishlistPage from './pages/wishlist.js';
import CheckoutPage from './pages/checkout.js';
import AccountPage from './pages/account.js';
import AdminPage from './pages/admin.js';
import { AboutPage, ContactPage, FaqPage, PolicyPage, TrackPage, ComparePage, BlogPage, BlogPostPage, LookbookPage, NotFoundPage } from './pages/misc.js';

// ---- Routes ----
route('/', HomePage);
route('/shop', ShopPage);
route('/product/:id', ProductPage);
route('/cart', CartPage);
route('/wishlist', WishlistPage);
route('/checkout', CheckoutPage);
route('/account', AccountPage);
route('/account/:tab', AccountPage);
route('/admin', AdminPage);
route('/admin/:tab', AdminPage);
route('/track', TrackPage);
route('/compare', ComparePage);
route('/blog', BlogPage);
route('/blog/:slug', BlogPostPage);
route('/lookbook', LookbookPage);
route('/about', AboutPage);
route('/contact', ContactPage);
route('/faq', FaqPage);
route('/privacy', (c) => PolicyPage(c, 'privacy'));
route('/terms', (c) => PolicyPage(c, 'terms'));
route('/returns', (c) => PolicyPage(c, 'returns'));

const app = document.getElementById('app');
let _currentNode = null;

async function onRoute(ctx) {
  const handler = ctx.handler || NotFoundPage;
  // page transition out
  app.classList.add('page-leave');
  let result;
  try {
    result = await handler(ctx);
  } catch (err) {
    console.error('Page render error:', err);
    result = (await NotFoundPage(ctx, err));
  }
  const node = result && result.node ? result.node : result;
  // cleanup previous page (stop 3D loops, timers)
  if (_currentNode && typeof _currentNode._cleanup === 'function') {
    try { _currentNode._cleanup(); } catch (e) { console.warn(e); }
  }
  app.classList.remove('page-leave');
  app.innerHTML = '';
  if (node) app.appendChild(node);
  _currentNode = node;
  window.scrollTo({ top: 0, behavior: 'auto' });

  // post-mount enhancements
  observeReveals(app);
  attachRipples(app);
  attachTilt(app);
  setActiveNav(ctx.path);
  refreshChrome();
  if (result && typeof result.onMount === 'function') {
    requestAnimationFrame(() => result.onMount());
  }
  document.title = (result && result.title ? result.title + ' — ' : '') + 'Wahh Kids';
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 700);
  }
}

// Boot
function boot() {
  mountLayout();
  attachRipples(document);
  startRouter(onRoute);
  // react to store changes (cart/wishlist counts, auth)
  store.subscribe(() => refreshChrome());
  // hide loader after first paint + min delay for the magic
  const start = performance.now();
  const finish = () => {
    const elapsed = performance.now() - start;
    setTimeout(hideLoader, Math.max(0, 1400 - elapsed));
  };
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
  // safety: never trap users behind loader
  setTimeout(hideLoader, 4000);
}

// expose navigate globally for inline handlers
window.navigate = navigate;

boot();
