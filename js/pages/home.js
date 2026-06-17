// ============================================================
// Wahh Kids — Home page
// ============================================================
import { CATEGORIES, COLLECTIONS, TESTIMONIALS, INSTAGRAM, newArrivals, bestSellers, trending, onSale, byCollection, formatINR } from '../data.js';
import { productCardHTML, wireCards, productCarousel } from '../components/card.js';
import { el, qs, qsa, toast, countdown, pad2, starRow } from '../ui.js';
import { initHero } from '../three/scene.js';

export default function HomePage() {
  const node = el(`<div class="home"></div>`);

  // ---------------- HERO ----------------
  node.appendChild(el(`
  <section class="hero">
    <div class="hero__canvas" id="heroCanvas"></div>
    <div class="bubbles" id="heroBubbles"></div>
    <div class="hero__content">
      <div class="hero__inner">
        <span class="pill hero__badge">✨ New Festival Magic collection is live</span>
        <h1 class="hero__title">Magical fashion<br>for <span class="gtext">little stars</span></h1>
        <p class="hero__sub">Step into a colourful 3D world of buttery-soft, organic-cotton clothing that kids adore and parents trust. Premium quality, playful design, delivered with love.</p>
        <div class="hero__cta">
          <a class="btn btn--lg" href="#/shop">Shop the Magic 🪄</a>
          <a class="btn btn--ghost btn--lg" href="#/lookbook">Explore Lookbook</a>
        </div>
        <div class="hero__stats">
          <div><div class="num gtext">50k+</div><div class="lbl">Happy families</div></div>
          <div><div class="num gtext--candy">4.9★</div><div class="lbl">Average rating</div></div>
          <div><div class="num gtext--sea">100%</div><div class="lbl">Organic cotton</div></div>
        </div>
      </div>
    </div>
    <a class="hero__scroll" href="#new">Scroll for magic ↓</a>
  </section>`));

  // ---------------- TRUST MARQUEE ----------------
  node.appendChild(el(`
  <div class="trust">
    <div class="trust__row">
      <span>🚚 Free shipping over ₹999</span>
      <span>🌱 100% organic &amp; OEKO-TEX</span>
      <span>↩️ Easy 15-day returns</span>
      <span>⭐ Loyalty stars on every order</span>
      <span>🔒 Secure checkout</span>
    </div>
  </div>`));

  // ---------------- FEATURED CATEGORIES ----------------
  const cats = el(`<section class="section" id="new"><div class="container">
    <div class="head reveal"><span class="eyebrow">🧸 Shop by age</span><h2>Featured <span class="gtext">Categories</span></h2><p>From first cuddles to playground adventures — find the perfect fit.</p></div>
    <div class="cat-grid"></div>
  </div></section>`);
  const catGrid = cats.querySelector('.cat-grid');
  CATEGORIES.forEach((c, i) => {
    catGrid.appendChild(el(`<a class="cat-card reveal d${(i%4)+1}" href="#/shop?category=${c.slug}" style="background:linear-gradient(160deg, ${c.color}, ${shadeMix(c.color)})">
      <span class="emoji">${c.emoji}</span>
      <h3>${c.name}</h3><p>${c.blurb}</p>
    </a>`));
  });
  node.appendChild(cats);

  // ---------------- NEW ARRIVALS (carousel) ----------------
  node.appendChild(buildCarouselSection({
    eyebrow: '🆕 Fresh drops', title: 'New <span class="gtext--candy">Arrivals</span>',
    sub: 'Just landed and ready to twirl, run and play.', products: newArrivals(), link: '#/shop?sort=new', linkLabel: 'View all new'
  }));

  // ---------------- FLASH SALE ----------------
  const flash = el(`<section class="section section--tight"><div class="container">
    <div class="flash reveal">
      <div class="bubbles"></div>
      <div style="position:relative;display:flex;flex-wrap:wrap;gap:2rem;align-items:center;justify-content:space-between">
        <div>
          <span class="pill" style="background:rgba(255,255,255,.16);color:#fff">⚡ Flash Sale</span>
          <h2 style="font-size:clamp(1.8rem,4vw,2.8rem);margin:.6rem 0">Up to <span style="color:#ffd84d">40% off</span> festive picks</h2>
          <p style="opacity:.85;max-width:42ch">Sparkle for less — limited stock, limited time. When the timer hits zero, the magic ends!</p>
          <div class="flash__timer" id="flashTimer"></div>
          <a class="btn btn--sun btn--lg" href="#/shop?sort=sale">Grab the deals 🎉</a>
        </div>
        <div style="font-size:clamp(5rem,16vw,11rem);line-height:1;filter:drop-shadow(0 14px 30px rgba(0,0,0,.3))" class="float-2">🎁</div>
      </div>
    </div>
  </div></section>`);
  node.appendChild(flash);

  // ---------------- TRENDING ----------------
  node.appendChild(buildCarouselSection({
    eyebrow: '🔥 Hot right now', title: 'Trending <span class="gtext">Products</span>',
    sub: 'Loved by thousands of little trendsetters.', products: trending(), link: '#/shop?sort=trending', linkLabel: 'See trending'
  }));

  // ---------------- BEST SELLERS (grid) ----------------
  const best = el(`<section class="section"><div class="container">
    <div class="head reveal"><span class="eyebrow">🏆 Crowd favourites</span><h2>Best <span class="gtext--candy">Sellers</span></h2><p>The pieces families come back for, again and again.</p></div>
    <div class="best-grid"></div>
    <div class="center" style="margin-top:2rem"><a class="btn btn--ghost btn--lg reveal" href="#/shop?sort=best">Shop all bestsellers</a></div>
  </div></section>`);
  const bestGrid = best.querySelector('.best-grid');
  bestGrid.className = 'grid grid--products';
  const bestProducts = bestSellers().slice(0, 8);
  bestGrid.innerHTML = bestProducts.map(p => productCardHTML(p)).join('');
  wireCards(bestGrid, bestProducts);
  node.appendChild(best);

  // ---------------- SEASONAL COLLECTIONS ----------------
  const coll = el(`<section class="section"><div class="container">
    <div class="head reveal"><span class="eyebrow">🗓️ Seasonal edits</span><h2>Collections for <span class="gtext--sea">every season</span></h2><p>Curated capsules that make getting dressed an adventure.</p></div>
    <div class="coll-grid"></div>
  </div></section>`);
  const collGrid = coll.querySelector('.coll-grid');
  COLLECTIONS.forEach((c, i) => {
    const count = byCollection(c.slug).length;
    collGrid.appendChild(el(`<a class="coll-card reveal d${i+1}" href="#/shop?collection=${c.slug}" style="background:${c.grad}">
      <span class="emoji">${c.emoji}</span>
      <div class="coll-card__body">
        <span class="pill" style="background:rgba(255,255,255,.2);color:#fff">${count} styles</span>
        <h3>${c.name}</h3><p style="opacity:.95">${c.blurb}</p>
        <span style="font-weight:800;text-decoration:underline">Shop now →</span>
      </div>
    </a>`));
  });
  node.appendChild(coll);

  // ---------------- WHY WAHH (features) ----------------
  node.appendChild(el(`<section class="section section--tight"><div class="container">
    <div class="feat-grid">
      ${[['🌱','Organic & Safe','OEKO-TEX certified cotton, non-toxic dyes, tag-free comfort.'],
         ['🎨','Playful Design','Colours and prints that spark imagination and survive adventures.'],
         ['🚀','Fast & Free Delivery','Quick dispatch with free shipping over ₹999, tracked all the way.'],
         ['💜','Loved by Parents','4.9★ from 50,000+ families across India.']].map((f,i)=>`
        <div class="card feat reveal d${i+1}"><div class="ic">${f[0]}</div><h3 style="font-size:1.15rem">${f[1]}</h3><p class="muted" style="font-size:.92rem">${f[2]}</p></div>`).join('')}
    </div>
  </div></section>`));

  // ---------------- TESTIMONIALS ----------------
  const test = el(`<section class="section"><div class="container">
    <div class="head reveal"><span class="eyebrow">💬 Parent love</span><h2>Wahh-worthy <span class="gtext">reviews</span></h2><p>Real words from real families in our magical community.</p></div>
    <div class="carousel"><div class="carousel__track" id="testTrack"></div></div>
  </div></section>`);
  const tt = test.querySelector('#testTrack');
  TESTIMONIALS.forEach(t => {
    tt.appendChild(el(`<div class="card glass tcard reveal">
      <div class="tcard__top"><div class="tcard__avatar">${t.avatar}</div><div><strong>${t.name}</strong><div class="muted" style="font-size:.82rem">${t.loc}</div></div></div>
      ${starRow(t.rating)}
      <p class="tcard__text">“${t.text}”</p>
    </div>`));
  });
  node.appendChild(test);

  // ---------------- INSTAGRAM ----------------
  const ig = el(`<section class="section section--tight"><div class="container">
    <div class="head reveal"><span class="eyebrow">📸 @wahhkids</span><h2>Join the <span class="gtext--candy">#WahhMoments</span></h2><p>Tag us for a chance to be featured in our magical gallery.</p></div>
    <div class="ig-grid"></div>
  </div></section>`);
  const igGrid = ig.querySelector('.ig-grid');
  INSTAGRAM.forEach((t, i) => igGrid.appendChild(el(`<div class="ig-tile reveal d${(i%6)+1}" style="background:linear-gradient(160deg, ${t.color}, ${shadeMix(t.color)})">${t.emoji}</div>`)));
  node.appendChild(ig);

  // ---------------- NEWSLETTER ----------------
  const news = el(`<section class="section"><div class="container">
    <div class="news reveal">
      <div class="bubbles"></div>
      <div style="position:relative">
        <div style="font-size:3rem">💌</div>
        <h2>Get 10% off your first order</h2>
        <p style="opacity:.95;max-width:46ch;margin-inline:auto">Subscribe for magical drops, parenting tips and members-only treats. No spam, just sparkle.</p>
        <form id="homeNews"><input type="email" required placeholder="Enter your email" /><button class="btn btn--sun" type="submit">Subscribe ✨</button></form>
      </div>
    </div>
  </div></section>`);
  node.appendChild(news);

  // ---- onMount: 3D + dynamic behaviours ----
  let hero, timer;
  function onMount() {
    // bubbles
    spawnBubbles(qs('#heroBubbles', node), 18);
    qsa('.flash .bubbles, .news .bubbles', node).forEach(b => spawnBubbles(b, 10));

    // 3D hero
    initHero(qs('#heroCanvas', node)).then(h => { hero = h; }).catch(()=>{});

    // flash timer (ends ~6h from now)
    const target = Date.now() + 6 * 3600 * 1000 + 23 * 60 * 1000;
    const tEl = qs('#flashTimer', node);
    timer = countdown(target, ({ h, m, s }) => {
      tEl.innerHTML = [['Hours', h], ['Min', m], ['Sec', s]].map(([l, v]) =>
        `<div class="flash__unit"><div class="n">${pad2(v)}</div><div class="l">${l}</div></div>`).join('');
    });

    // carousel arrows
    qsa('[data-carousel]', node).forEach(sec => {
      const track = sec.querySelector('.carousel__track');
      sec.querySelector('[data-prev]')?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }));
      sec.querySelector('[data-next]')?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
    });

    qs('#homeNews', node)?.addEventListener('submit', (e) => { e.preventDefault(); toast('Welcome to the magic! Your 10% code is WAHH10 🎉', 'ok'); e.target.reset(); });
  }

  node._cleanup = () => { hero?.destroy?.(); clearInterval(timer); };
  return { node, onMount, title: 'Magical Fashion for Little Stars' };
}

// ---- helpers ----
function buildCarouselSection({ eyebrow, title, sub, products, link, linkLabel }) {
  const sec = el(`<section class="section" data-carousel><div class="container">
    <div class="section__head">
      <div class="head head--left reveal" style="margin-bottom:0">
        <span class="eyebrow">${eyebrow}</span><h2>${title}</h2><p>${sub}</p>
      </div>
      <div class="carousel__nav reveal">
        <a class="btn btn--ghost btn--sm" href="${link}">${linkLabel}</a>
        <button class="carousel__btn" data-prev aria-label="Previous">‹</button>
        <button class="carousel__btn" data-next aria-label="Next">›</button>
      </div>
    </div>
    <div class="carousel"><div class="carousel__track"></div></div>
  </div></section>`);
  const track = sec.querySelector('.carousel__track');
  track.innerHTML = products.map(p => productCardHTML(p)).join('');
  wireCards(track, products);
  return sec;
}

function spawnBubbles(host, n) {
  if (!host) return;
  for (let i = 0; i < n; i++) {
    const size = 12 + Math.random() * 60;
    const b = el(`<span class="bubble"></span>`);
    Object.assign(b.style, {
      left: Math.random() * 100 + '%', width: size + 'px', height: size + 'px',
      animationDuration: (8 + Math.random() * 12) + 's', animationDelay: (Math.random() * 8) + 's',
    });
    host.appendChild(b);
  }
}

function shadeMix(hex) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) - 40, g = ((n >> 8) & 255) - 30, b = (n & 255) - 10;
  r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
