// ============================================================
// Wahh Kids — Product card component
// ============================================================
import { store } from '../store.js';
import { discountPct, formatINR, productImage } from '../data.js';
import { garmentSVG } from '../svg.js';
import { starRow, toast } from '../ui.js';
import { navigate } from '../router.js';

export function mediaInner(p, hex) {
  const img = productImage(p.id);
  if (img) return `<img class="pcard__photo" src="${img}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/>`;
  return garmentSVG(p.type, hex);
}

export function productCardHTML(p, opts = {}) {
  const disc = discountPct(p);
  const fav = store.inWishlist(p.id);
  const badges = (p.badges || []).map(b => {
    const map = { new: ['New', 'badge--new'], best: ['Bestseller', 'badge--best'], sale: [`-${disc}%`, 'badge--sale'] };
    const [label, cls] = map[b] || [b, ''];
    return `<span class="badge ${cls}">${label}</span>`;
  }).join('');
  const swatches = p.colors.slice(0, 4).map((c, i) =>
    `<span class="swatch ${i === 0 ? 'active' : ''}" data-color="${c.hex}" style="background:${c.hex}" title="${c.name}"></span>`).join('');
  const soldOut = p.stock <= 0;
  const oosBadge = soldOut ? '<span class="badge" style="background:#9aa0b5">Sold out</span>' : '';

  return `<article class="card pcard reveal ${soldOut ? 'is-soldout' : ''}" data-id="${p.id}" data-tilt>
    <div class="pcard__media" data-media>
      <div class="pcard__badges">${oosBadge}${badges}</div>
      <button class="pcard__fav ${fav ? 'active' : ''}" data-fav title="Wishlist">${fav ? '💖' : '🤍'}</button>
      <a class="pcard__link" href="#/product/${p.id}" aria-label="${p.name}">${mediaInner(p, p.colors[0].hex)}</a>
      <div class="pcard__quick">
        ${soldOut ? '<button class="btn btn--block btn--sm" disabled style="background:#c8cad6;box-shadow:none">Sold out</button>'
                  : '<button class="btn btn--block btn--sm" data-add>Add to Cart 🛒</button>'}
      </div>
    </div>
    <div class="pcard__body">
      <span class="pcard__cat">${p.category}</span>
      <a class="pcard__title" href="#/product/${p.id}">${p.name}</a>
      <div class="pcard__rating">${starRow(p.rating)} <span>${p.rating.toFixed(1)} (${p.reviewsCount})</span></div>
      <div class="pcard__price">
        <span class="now">${formatINR(p.price)}</span>
        ${disc ? `<span class="was">${formatINR(p.mrp)}</span>` : ''}
      </div>
      <div class="pcard__swatches">${swatches}</div>
    </div>
  </article>`;
}

// Attach behaviours to a container of product cards
export function wireCards(root, products) {
  const map = {}; products.forEach(p => map[p.id] = p);
  root.querySelectorAll('.pcard').forEach(card => {
    const id = card.dataset.id; const p = map[id]; if (!p) return;
    let chosen = p.colors[0].hex;

    card.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        chosen = sw.dataset.color;
        card.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        const media = card.querySelector('[data-media] .pcard__link');
        if (media && !productImage(p.id)) media.innerHTML = garmentSVG(p.type, chosen);
      });
    });

    const fav = card.querySelector('[data-fav]');
    fav.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const on = store.toggleWishlist(p.id);
      fav.classList.toggle('active', on);
      fav.textContent = on ? '💖' : '🤍';
      toast(on ? `${p.name} added to wishlist` : `${p.name} removed`, on ? 'ok' : 'info');
    });

    const add = card.querySelector('[data-add]');
    if (add) add.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const colorName = (p.colors.find(c => c.hex === chosen) || p.colors[0]).name;
      const size = p.sizes[Math.min(2, p.sizes.length - 1)];
      store.addToCart(p.id, colorName, size, 1);
      toast(`${p.name} added to cart`, 'ok', '🛒');
      window.dispatchEvent(new CustomEvent('open-cart'));
    });
  });
}

export function productGrid(products, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'grid grid--products';
  wrap.innerHTML = products.map(p => productCardHTML(p, opts)).join('');
  wireCards(wrap, products);
  return wrap;
}


// Horizontal product carousel with arrow navigation
export function productCarousel(products) {
  const wrap = document.createElement('div');
  wrap.className = 'carousel';
  wrap.innerHTML = `
    <div class="carousel__track">${products.map(p => productCardHTML(p)).join('')}</div>`;
  const track = wrap.querySelector('.carousel__track');
  wireCards(track, products);
  // attach external nav (rendered by section head) via dataset hook
  wrap._scroll = (dir) => {
    const amt = track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amt, behavior: 'smooth' });
  };
  return wrap;
}
