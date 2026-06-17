// ============================================================
// Wahh Kids — Shop / product listing with filters
// ============================================================
import { PRODUCTS, CATEGORIES, COLLECTIONS, discountPct, formatINR } from '../data.js';
import { productCardHTML, wireCards } from '../components/card.js';
import { el, qs, qsa, debounce, toast } from '../ui.js';
import { navigate, buildQuery } from '../router.js';

const ALL_SIZES = ['0-3M','3-6M','6-12M','1-2Y','2-4Y','4-6Y','6-8Y','8-10Y'];
const ALL_AGES = ['0-3M','3-6M','6-12M','1-2Y','2-4Y','4-6Y','6-8Y','8-10Y'];
const ALL_COLORS = [
  {name:'Grape',hex:'#6c4cf1'},{name:'Bubblegum',hex:'#ff5fa2'},{name:'Sky',hex:'#3fc8ff'},
  {name:'Sunshine',hex:'#ffcf3f'},{name:'Mint',hex:'#3fe0b0'},{name:'Coral',hex:'#ff7a59'},
  {name:'Cream',hex:'#ffe9c7'},{name:'Navy',hex:'#2a3a8f'},{name:'Rose',hex:'#ff9bbd'},{name:'Lilac',hex:'#c9a8ff'},
];
const MAX_PRICE = 2500;

export default function ShopPage(ctx) {
  const q = ctx.query || {};
  // filter state from query
  const state = {
    q: q.q || '',
    category: q.category ? q.category.split(',') : [],
    collection: q.collection ? q.collection.split(',') : [],
    gender: q.gender ? q.gender.split(',') : [],
    sizes: q.size ? q.size.split(',') : [],
    colors: q.color ? q.color.split(',') : [],
    ages: q.age ? q.age.split(',') : [],
    max: q.max ? +q.max : MAX_PRICE,
    sort: q.sort || 'featured',
    badge: q.badge || '',
  };

  const node = el(`<div class="page-pad"><div class="container">
    <div class="breadcrumb"><a href="#/">Home</a> <span>/</span> <strong>Shop</strong></div>
    <div class="section__head" style="margin-bottom:1.4rem">
      <div class="head head--left" style="margin-bottom:0"><span class="eyebrow">🛍️ The collection</span><h2 id="shopTitle">All Products</h2></div>
      <div style="display:flex;gap:.6rem;align-items:center;flex-wrap:wrap">
        <button class="btn btn--ghost btn--sm" id="filterToggle">☰ Filters</button>
        <select id="sortSel" class="field" style="margin:0;padding:.6rem 1rem;border-radius:999px">
          <option value="featured">Featured</option>
          <option value="new">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
          <option value="best">Best Selling</option>
          <option value="sale">Biggest Discount</option>
        </select>
      </div>
    </div>

    <div class="shop-layout" style="display:grid;grid-template-columns:262px 1fr;gap:28px;align-items:start">
      <aside class="shop-filters glass" id="filters" style="padding:1.3rem;position:sticky;top:calc(var(--nav-h) + var(--ann-h,38px) + 16px)"></aside>
      <div>
        <div id="activeChips" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem"></div>
        <div id="resultCount" class="muted" style="margin-bottom:1rem"></div>
        <div id="shopGrid" class="grid grid--products"></div>
        <div id="shopEmpty"></div>
      </div>
    </div>
  </div></div>`);

  const filters = qs('#filters', node);
  const grid = qs('#shopGrid', node);
  const sortSel = qs('#sortSel', node);
  sortSel.value = state.sort;

  // ---- filters UI ----
  function renderFilters() {
    filters.innerHTML = `
      <div class="field" style="margin-bottom:1rem">
        <label>Search</label>
        <input id="fQ" type="search" placeholder="Search styles…" value="${state.q}" />
      </div>
      ${group('Category', CATEGORIES.map(c => checkbox('category', c.slug, c.name, state.category.includes(c.slug))))}
      ${group('Collection', COLLECTIONS.map(c => checkbox('collection', c.slug, c.name, state.collection.includes(c.slug))))}
      ${group('Gender', [['boys','Boys'],['girls','Girls'],['unisex','Unisex']].map(([v,l]) => checkbox('gender', v, l, state.gender.includes(v))))}
      <div class="filter-group"><h4 style="font-size:.95rem;margin:.2rem 0 .6rem">Price: up to <span id="priceVal">${formatINR(state.max)}</span></h4>
        <input id="fPrice" type="range" min="300" max="${MAX_PRICE}" step="50" value="${state.max}" style="width:100%" />
      </div>
      ${group('Age', ALL_AGES.map(a => chip('age', a, a, state.ages.includes(a))), true)}
      ${group('Size', ALL_SIZES.map(s => chip('size', s, s, state.sizes.includes(s))), true)}
      <div class="filter-group"><h4 style="font-size:.95rem;margin:.6rem 0">Colour</h4>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${ALL_COLORS.map(c => `<button class="swatch ${state.colors.includes(c.name)?'active':''}" data-color="${c.name}" title="${c.name}" style="width:26px;height:26px;background:${c.hex}"></button>`).join('')}
        </div>
      </div>
      <button class="btn btn--ghost btn--block btn--sm" id="clearFilters" style="margin-top:1rem">Clear all filters</button>`;

    qs('#fQ', filters).addEventListener('input', debounce(e => { state.q = e.target.value; apply(); }, 200));
    qs('#fPrice', filters).addEventListener('input', e => { state.max = +e.target.value; qs('#priceVal', filters).textContent = formatINR(state.max); });
    qs('#fPrice', filters).addEventListener('change', apply);
    qsa('input[data-filter]', filters).forEach(inp => inp.addEventListener('change', () => {
      const { filter, value } = inp.dataset;
      const arr = state[filterKey(filter)];
      if (inp.checked) arr.push(value); else arr.splice(arr.indexOf(value), 1);
      const lbl = inp.closest('.tag-chip');
      if (lbl) lbl.style.cssText = inp.checked ? 'cursor:pointer;background:var(--grape);color:#fff' : 'cursor:pointer';
      apply();
    }));
    qsa('.swatch[data-color]', filters).forEach(sw => sw.addEventListener('click', () => {
      const name = sw.dataset.color; const i = state.colors.indexOf(name);
      if (i >= 0) state.colors.splice(i, 1); else state.colors.push(name);
      sw.classList.toggle('active'); apply();
    }));
    qs('#clearFilters', filters).addEventListener('click', () => {
      Object.assign(state, { q:'', category:[], collection:[], gender:[], sizes:[], colors:[], ages:[], max:MAX_PRICE, badge:'' });
      renderFilters(); apply();
    });
  }

  function filterKey(f) { return ({ category:'category', collection:'collection', gender:'gender', size:'sizes', age:'ages' })[f]; }
  function checkbox(filter, value, label, checked) {
    return `<label style="display:flex;align-items:center;gap:.5rem;padding:.3rem 0;cursor:pointer;font-size:.92rem">
      <input type="checkbox" data-filter="${filter}" data-value="${value}" ${checked?'checked':''}/> ${label}</label>`;
  }
  function chip(filter, value, label, checked) {
    return `<label class="tag-chip" style="cursor:pointer;${checked?'background:var(--grape);color:#fff':''}">
      <input type="checkbox" data-filter="${filter}" data-value="${value}" ${checked?'checked':''} hidden/> ${label}</label>`;
  }
  function group(title, items, flex) {
    return `<div class="filter-group"><h4 style="font-size:.95rem;margin:.6rem 0">${title}</h4>
      <div style="${flex?'display:flex;flex-wrap:wrap;gap:6px':''}">${items.join('')}</div></div>`;
  }

  // ---- filtering logic ----
  function compute() {
    let list = PRODUCTS.slice();
    const term = state.q.trim().toLowerCase();
    if (term) list = list.filter(p => (p.name+p.category+p.type+p.tags.join(' ')+p.collection.join(' ')).toLowerCase().includes(term));
    if (state.category.length) list = list.filter(p => state.category.includes(p.category));
    if (state.collection.length) list = list.filter(p => p.collection.some(c => state.collection.includes(c)));
    if (state.gender.length) list = list.filter(p => state.gender.includes(p.gender));
    if (state.sizes.length) list = list.filter(p => p.sizes.some(s => state.sizes.includes(s)));
    if (state.ages.length) list = list.filter(p => p.ages.some(a => state.ages.includes(a)));
    if (state.colors.length) list = list.filter(p => p.colors.some(c => state.colors.includes(c.name)));
    if (state.badge) list = list.filter(p => p.badges.includes(state.badge));
    list = list.filter(p => p.price <= state.max);
    switch (state.sort) {
      case 'new': list.sort((a,b)=> (b.badges.includes('new')?1:0)-(a.badges.includes('new')?1:0)); break;
      case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
      case 'rating': list.sort((a,b)=>b.rating-a.rating); break;
      case 'best': list.sort((a,b)=>b.sold-a.sold); break;
      case 'sale': list.sort((a,b)=>discountPct(b)-discountPct(a)); break;
    }
    return list;
  }

  function syncURL() {
    const qobj = {};
    if (state.q) qobj.q = state.q;
    if (state.category.length) qobj.category = state.category;
    if (state.collection.length) qobj.collection = state.collection;
    if (state.gender.length) qobj.gender = state.gender;
    if (state.sizes.length) qobj.size = state.sizes;
    if (state.ages.length) qobj.age = state.ages;
    if (state.colors.length) qobj.color = state.colors;
    if (state.max < MAX_PRICE) qobj.max = state.max;
    if (state.sort !== 'featured') qobj.sort = state.sort;
    if (state.badge) qobj.badge = state.badge;
    history.replaceState(null, '', '#/shop' + buildQuery(qobj));
  }

  function renderChips() {
    const chips = [];
    const push = (label, clear) => chips.push(`<span class="tag-chip" data-clear="${clear}" style="cursor:pointer">${label} ✕</span>`);
    state.category.forEach(c => push('Category: ' + c, 'category:' + c));
    state.collection.forEach(c => push('Collection: ' + c, 'collection:' + c));
    state.gender.forEach(c => push(c, 'gender:' + c));
    state.colors.forEach(c => push(c, 'colors:' + c));
    state.sizes.forEach(c => push('Size ' + c, 'sizes:' + c));
    state.ages.forEach(c => push('Age ' + c, 'ages:' + c));
    if (state.max < MAX_PRICE) push('Under ' + formatINR(state.max), 'max');
    if (state.q) push('“' + state.q + '”', 'q');
    const host = qs('#activeChips', node);
    host.innerHTML = chips.join('');
    qsa('[data-clear]', host).forEach(ch => ch.addEventListener('click', () => {
      const [key, val] = ch.dataset.clear.split(':');
      if (key === 'max') state.max = MAX_PRICE;
      else if (key === 'q') state.q = '';
      else { const arr = state[key]; const i = arr.indexOf(val); if (i>=0) arr.splice(i,1); }
      renderFilters(); apply();
    }));
  }

  function apply() {
    const list = compute();
    qs('#resultCount', node).textContent = `${list.length} magical ${list.length === 1 ? 'style' : 'styles'} found`;
    if (!list.length) {
      grid.innerHTML = '';
      qs('#shopEmpty', node).innerHTML = `<div class="empty-state"><div class="emoji">🔍</div><h3>No matches yet</h3><p class="muted">Try removing a filter or two — the magic is out there!</p></div>`;
    } else {
      qs('#shopEmpty', node).innerHTML = '';
      grid.innerHTML = list.map(p => productCardHTML(p)).join('');
      wireCards(grid, list);
    }
    // title
    let title = 'All Products';
    if (state.category.length === 1) { const c = CATEGORIES.find(x=>x.slug===state.category[0]); if (c) title = c.name; }
    else if (state.collection.length === 1) { const c = COLLECTIONS.find(x=>x.slug===state.collection[0]); if (c) title = c.name; }
    qs('#shopTitle', node).textContent = title;
    renderChips();
    syncURL();
    requestAnimationFrame(() => { import('../ui.js').then(m => { m.observeReveals(grid); m.attachTilt(grid); }); });
  }

  sortSel.addEventListener('change', () => { state.sort = sortSel.value; apply(); });
  qs('#filterToggle', node).addEventListener('click', () => {
    filters.classList.toggle('open-mobile');
    filters.style.display = filters.style.display === 'block' ? 'none' : 'block';
  });

  renderFilters();
  apply();

  return { node, title: 'Shop' };
}
