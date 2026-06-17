// ============================================================
// Wahh Kids — Wishlist page
// ============================================================
import { store } from '../store.js';
import { byId, recommend } from '../data.js';
import { productCardHTML, wireCards } from '../components/card.js';
import { el, qs, toast } from '../ui.js';

export default function WishlistPage() {
  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Wishlist</strong></div>
    <div class="section__head">
      <h1 style="margin:0">My Wishlist 💖</h1>
      <div style="display:flex;gap:.6rem"><button class="btn btn--ghost btn--sm" id="shareWish">🔗 Share</button><button class="btn btn--sm" id="addAllWish">Add all to cart 🛒</button></div>
    </div>
    <div id="wishContent" style="margin-top:1.4rem"></div>
  </div></div>`);

  function render() {
    const ids = store.get().wishlist;
    const products = ids.map(byId).filter(Boolean);
    const content = qs('#wishContent', node);
    if (!products.length) {
      content.innerHTML = `<div class="empty-state"><div class="emoji">💝</div><h2>No favourites yet</h2><p class="muted">Tap the heart on any product to save it here.</p><a class="btn btn--lg" href="#/shop">Discover styles</a></div>`;
      const rec = recommend(4);
      const sec = el(`<section class="section section--tight"><div class="head head--left"><h2 style="font-size:1.5rem">Trending now</h2></div><div class="grid grid--products" id="rg"></div></section>`);
      content.appendChild(sec); const g = sec.querySelector('#rg'); g.innerHTML = rec.map(p=>productCardHTML(p)).join(''); wireCards(g, rec);
      qs('#addAllWish', node).style.display = 'none'; qs('#shareWish', node).style.display = 'none';
      return;
    }
    qs('#addAllWish', node).style.display = ''; qs('#shareWish', node).style.display = '';
    const grid = document.createElement('div');
    grid.className = 'grid grid--products';
    grid.innerHTML = products.map(p=>productCardHTML(p)).join('');
    wireCards(grid, products);
    content.innerHTML = ''; content.appendChild(grid);
    // re-render on wishlist change (e.g., removing via heart)
  }

  qs('#addAllWish', node).addEventListener('click', () => {
    const products = store.get().wishlist.map(byId).filter(Boolean);
    products.forEach(p => store.addToCart(p.id, p.colors[0].name, p.sizes[Math.min(2,p.sizes.length-1)], 1));
    toast('All wishlist items added to cart! 🎉', 'ok'); window.dispatchEvent(new CustomEvent('open-cart'));
  });
  qs('#shareWish', node).addEventListener('click', async () => {
    const url = location.origin + location.pathname + '#/wishlist?shared=' + store.get().wishlist.join(',');
    try { await navigator.clipboard.writeText(url); toast('Wishlist link copied! 🔗', 'ok'); }
    catch { toast('Copy this link: ' + url, 'info'); }
  });

  // keep in sync if hearts toggled elsewhere
  const unsub = store.subscribe(() => render());
  node._cleanup = () => unsub();

  render();
  return { node, title: 'Wishlist' };
}
