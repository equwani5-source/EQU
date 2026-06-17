// ============================================================
// Wahh Kids — Data layer (catalog, categories, collections, etc.)
// ============================================================

export const CATEGORIES = [
  { slug: 'boys',        name: 'Boys',        emoji: '👦', color: '#3fc8ff', blurb: 'Cool & comfy everyday styles' },
  { slug: 'girls',       name: 'Girls',       emoji: '👧', color: '#ff5fa2', blurb: 'Twirl-worthy dresses & sets' },
  { slug: 'newborn',     name: 'Newborn',     emoji: '🍼', color: '#3fe0b0', blurb: 'Softest first wardrobe' },
  { slug: 'toddlers',    name: 'Toddlers',    emoji: '🧸', color: '#ffcf3f', blurb: 'Playful picks for tiny explorers' },
  { slug: 'accessories', name: 'Accessories', emoji: '🎒', color: '#6c4cf1', blurb: 'Caps, bags & finishing touches' },
  { slug: 'shoes',       name: 'Shoes',       emoji: '👟', color: '#ff7a59', blurb: 'Happy feet, every step' },
];

export const COLLECTIONS = [
  { slug: 'summer',   name: 'Summer Splash',   emoji: '🏖️', grad: 'linear-gradient(135deg,#3fc8ff,#3fe0b0)', blurb: 'Breezy fabrics for sunny days' },
  { slug: 'winter',   name: 'Winter Wonder',   emoji: '❄️', grad: 'linear-gradient(135deg,#7b5bff,#3fc8ff)', blurb: 'Snuggly layers & cosy knits' },
  { slug: 'festival', name: 'Festival Magic',  emoji: '🎉', grad: 'linear-gradient(135deg,#ff5fa2,#ffcf3f)', blurb: 'Sparkle for every celebration' },
];

const COLORS = {
  grape:   { name: 'Grape',   hex: '#6c4cf1' },
  pink:    { name: 'Bubblegum', hex: '#ff5fa2' },
  sky:     { name: 'Sky',     hex: '#3fc8ff' },
  sun:     { name: 'Sunshine', hex: '#ffcf3f' },
  mint:    { name: 'Mint',    hex: '#3fe0b0' },
  coral:   { name: 'Coral',   hex: '#ff7a59' },
  cream:   { name: 'Cream',   hex: '#ffe9c7' },
  navy:    { name: 'Navy',    hex: '#2a3a8f' },
  rose:    { name: 'Rose',    hex: '#ff9bbd' },
  lilac:   { name: 'Lilac',   hex: '#c9a8ff' },
};

const SIZE_SETS = {
  apparel: ['0-3M','3-6M','6-12M','1-2Y','2-4Y','4-6Y','6-8Y','8-10Y'],
  shoes:   ['C4','C6','C8','C10','C12','Y1','Y2','Y3'],
  onesize: ['One Size'],
};

let _id = 0;
function P(o) {
  _id += 1;
  const price = o.price;
  const mrp = o.mrp || Math.round(price * (1 + (o.disc || 0) / 100));
  const sizes = o.sizes || (o.type === 'shoes' || o.type === 'sneaker' ? SIZE_SETS.shoes
    : (o.type === 'cap' || o.type === 'accessory') ? SIZE_SETS.onesize : SIZE_SETS.apparel);
  return {
    id: 'wk' + String(_id).padStart(3, '0'),
    sku: 'WK-' + String(_id).padStart(4, '0'),
    name: o.name,
    type: o.type,
    category: o.category,
    gender: o.gender || 'unisex',
    price, mrp,
    colors: (o.colors || ['grape']).map(k => COLORS[k]),
    sizes,
    ages: o.ages || ['1-2Y','2-4Y','4-6Y'],
    collection: o.collection || [],
    rating: o.rating ?? (4 + Math.round(Math.random() * 10) / 10),
    reviewsCount: o.reviews ?? (20 + Math.floor(Math.random() * 320)),
    stock: o.stock ?? (5 + Math.floor(Math.random() * 60)),
    sold: o.sold ?? (50 + Math.floor(Math.random() * 900)),
    badges: o.badges || [],
    tags: o.tags || [],
    description: o.desc || 'Crafted from buttery-soft, OEKO-TEX certified cotton with playful prints kids adore and parents trust. Tag-free comfort, easy snaps and colours that survive a thousand adventures (and washes).',
    material: o.material || '100% organic combed cotton',
    care: o.care || 'Machine wash cold • Tumble dry low • Do not bleach',
  };
}

export const PRODUCTS = [
  P({ name:'Rainbow Star Tee', type:'tshirt', category:'boys', gender:'boys', price:799, disc:25, colors:['sky','grape','mint'], collection:['summer'], badges:['new','sale'], rating:4.8, reviews:214, tags:['cotton','print','everyday'] }),
  P({ name:'Dino Adventure Hoodie', type:'hoodie', category:'boys', gender:'boys', price:1499, disc:20, colors:['mint','navy','grape'], collection:['winter'], badges:['best'], rating:4.9, reviews:301, tags:['fleece','warm'] }),
  P({ name:'Sunny Day Shorts', type:'shorts', category:'boys', gender:'boys', price:649, disc:15, colors:['sun','coral','sky'], collection:['summer'], badges:['new'], tags:['summer','play'] }),
  P({ name:'Captain Cool Jacket', type:'jacket', category:'boys', gender:'boys', price:1899, disc:30, colors:['navy','grape','coral'], collection:['winter'], badges:['sale','best'], rating:4.7, tags:['windproof'] }),
  P({ name:'Galaxy Sneakers', type:'sneaker', category:'shoes', gender:'unisex', price:1299, disc:18, colors:['grape','sky','pink'], collection:['festival'], badges:['best'], rating:4.9, reviews:420, tags:['lightweight','grippy'] }),

  P({ name:'Twirl Princess Frock', type:'frock', category:'girls', gender:'girls', price:1699, disc:28, colors:['pink','lilac','rose'], collection:['festival'], badges:['best','sale'], rating:4.9, reviews:512, tags:['party','twirl'] }),
  P({ name:'Blossom Summer Dress', type:'dress', category:'girls', gender:'girls', price:1199, disc:22, colors:['rose','sun','mint'], collection:['summer'], badges:['new'], rating:4.8, tags:['floral','breezy'] }),
  P({ name:'Unicorn Dream Tee', type:'tshirt', category:'girls', gender:'girls', price:749, disc:20, colors:['lilac','pink','sky'], collection:['summer'], badges:['new'], tags:['glitter','print'] }),
  P({ name:'Cosy Cloud Hoodie', type:'hoodie', category:'girls', gender:'girls', price:1399, disc:15, colors:['rose','lilac','cream'], collection:['winter'], badges:['best'], rating:4.7, tags:['soft'] }),
  P({ name:'Ballet Bow Shoes', type:'shoes', category:'shoes', gender:'girls', price:1099, disc:12, colors:['pink','rose','cream'], collection:['festival'], badges:[], rating:4.6, tags:['cute'] }),

  P({ name:'Snuggle Bunny Romper', type:'romper', category:'newborn', gender:'unisex', price:899, disc:18, colors:['cream','mint','rose'], sizes:SIZE_SETS.apparel.slice(0,4), ages:['0-3M','3-6M','6-12M'], collection:['winter'], badges:['new','best'], rating:4.9, reviews:288, tags:['snaps','soft'] }),
  P({ name:'Tiny Toes Socks (3-pack)', type:'socks', category:'newborn', gender:'unisex', price:399, disc:10, colors:['mint','rose','sky'], sizes:SIZE_SETS.apparel.slice(0,3), ages:['0-3M','3-6M'], badges:[], tags:['grip','pack'] }),
  P({ name:'First Steps Booties', type:'shoes', category:'shoes', gender:'unisex', price:699, disc:14, colors:['cream','sky','rose'], sizes:SIZE_SETS.shoes.slice(0,4), ages:['0-3M','3-6M','6-12M'], collection:['winter'], badges:['new'], tags:['soft-sole'] }),
  P({ name:'Cuddle Cloud Onesie', type:'romper', category:'newborn', gender:'unisex', price:949, disc:20, colors:['sky','cream','lilac'], ages:['0-3M','3-6M','6-12M'], collection:['summer'], badges:['best'], rating:4.8, tags:['organic'] }),

  P({ name:'Wobble Explorer Tee', type:'tshirt', category:'toddlers', gender:'unisex', price:699, disc:16, colors:['sun','sky','mint'], collection:['summer'], badges:['new'], tags:['stretch'] }),
  P({ name:'Splash Puddle Jacket', type:'jacket', category:'toddlers', gender:'unisex', price:1599, disc:25, colors:['coral','sky','sun'], collection:['winter'], badges:['best','sale'], rating:4.8, tags:['waterproof'] }),
  P({ name:'Teddy Hug Romper', type:'romper', category:'toddlers', gender:'unisex', price:1049, disc:18, colors:['cream','mint','coral'], collection:['winter'], badges:['new'], tags:['fleece'] }),
  P({ name:'Bounce Play Shorts', type:'shorts', category:'toddlers', gender:'unisex', price:549, disc:12, colors:['mint','grape','sun'], collection:['summer'], badges:[], tags:['elastic'] }),
  P({ name:'Giggle Garden Frock', type:'frock', category:'girls', gender:'girls', price:1299, disc:20, colors:['mint','rose','sun'], collection:['summer'], badges:['new'], rating:4.7, tags:['floral'] }),

  P({ name:'Adventure Backpack', type:'accessory', category:'accessories', gender:'unisex', price:1199, disc:20, colors:['grape','sky','coral'], sizes:SIZE_SETS.onesize, ages:['2-4Y','4-6Y','6-8Y'], badges:['best'], rating:4.8, reviews:190, tags:['bag','padded'] }),
  P({ name:'Lightning Sport Cap', type:'cap', category:'accessories', gender:'unisex', price:499, disc:10, colors:['navy','coral','sky'], sizes:SIZE_SETS.onesize, badges:['new'], tags:['adjustable'] }),
  P({ name:'Star Sparkle Hairband', type:'accessory', category:'accessories', gender:'girls', price:299, disc:0, colors:['pink','lilac','sun'], sizes:SIZE_SETS.onesize, badges:[], tags:['glitter'] }),
  P({ name:'Cozy Knit Beanie', type:'cap', category:'accessories', gender:'unisex', price:599, disc:15, colors:['mint','grape','rose'], sizes:SIZE_SETS.onesize, collection:['winter'], badges:['new'], tags:['knit','warm'] }),

  P({ name:'Festival Glow Sneakers', type:'sneaker', category:'shoes', gender:'unisex', price:1499, disc:22, colors:['pink','grape','sky'], collection:['festival'], badges:['best','sale'], rating:4.9, reviews:355, tags:['light-up'] }),
  P({ name:'Comfy Canvas Slip-ons', type:'shoes', category:'shoes', gender:'unisex', price:899, disc:14, colors:['navy','coral','mint'], badges:['new'], tags:['easy'] }),
  P({ name:'Hero Cape Tee', type:'tshirt', category:'boys', gender:'boys', price:899, disc:24, colors:['coral','navy','grape'], collection:['festival'], badges:['best'], rating:4.8, tags:['print','play'] }),
  P({ name:'Mermaid Shimmer Dress', type:'dress', category:'girls', gender:'girls', price:1799, disc:30, colors:['sky','mint','lilac'], collection:['festival'], badges:['best','sale'], rating:4.9, reviews:401, tags:['shimmer','party'] }),
  P({ name:'Frosty Puffer Jacket', type:'jacket', category:'boys', gender:'boys', price:2199, disc:28, colors:['sky','navy','coral'], collection:['winter'], badges:['best'], rating:4.8, tags:['puffer','warm'] }),
  P({ name:'Sunbeam Sun Hat', type:'cap', category:'accessories', gender:'unisex', price:649, disc:12, colors:['sun','cream','mint'], sizes:SIZE_SETS.onesize, collection:['summer'], badges:['new'], tags:['uv'] }),
  P({ name:'Polka Party Frock', type:'frock', category:'girls', gender:'girls', price:1399, disc:18, colors:['pink','sun','sky'], collection:['festival'], badges:['new'], rating:4.7, tags:['polka'] }),
  P({ name:'Explorer Cargo Shorts', type:'shorts', category:'boys', gender:'boys', price:799, disc:15, colors:['mint','navy','sun'], collection:['summer'], badges:[], tags:['pockets'] }),
  P({ name:'Rainbow Stripe Socks', type:'socks', category:'accessories', gender:'unisex', price:349, disc:0, colors:['pink','sky','sun'], sizes:SIZE_SETS.apparel.slice(2,6), badges:['new'], tags:['stripe'] }),
];

// ---- Helpers ----
export const byId = (id) => PRODUCTS.find(p => p.id === id);
export const discountPct = (p) => p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0;
export const newArrivals = () => PRODUCTS.filter(p => p.badges.includes('new'));
export const bestSellers = () => PRODUCTS.slice().sort((a,b)=>b.sold-a.sold).slice(0, 10);
export const trending = () => PRODUCTS.slice().sort((a,b)=>b.rating-a.rating).slice(0, 10);
export const onSale = () => PRODUCTS.filter(p => discountPct(p) >= 20);
export const byCategory = (slug) => PRODUCTS.filter(p => p.category === slug);
export const byCollection = (slug) => PRODUCTS.filter(p => p.collection.includes(slug));
export function related(p, n = 4) {
  return PRODUCTS.filter(x => x.id !== p.id && (x.category === p.category || x.type === p.type))
    .sort((a,b)=>b.rating-a.rating).slice(0, n);
}
export function recommend(n = 8) {
  return PRODUCTS.slice().sort(()=>Math.random()-0.5).slice(0, n);
}

export const TESTIMONIALS = [
  { name:'Aanya\'s Mum', loc:'Mumbai', avatar:'👩🏽', rating:5, text:'The quality is unreal for the price. My daughter refuses to take off her twirl frock — even to sleep!' },
  { name:'Rahul S.', loc:'Bengaluru', avatar:'🧔🏽', rating:5, text:'Ordering was a delight, the 3D preview is so fun, and the hoodie washed beautifully. Buying again.' },
  { name:'Priya & Vir', loc:'Delhi', avatar:'👩🏻', rating:5, text:'Softest newborn rompers we have tried. The snaps make 3am changes so easy. Truly premium.' },
  { name:'Sneha K.', loc:'Pune', avatar:'👩🏾', rating:4, text:'Gorgeous colours that survived a summer of mud and juice. Delivery was quick too.' },
  { name:'Imran F.', loc:'Hyderabad', avatar:'🧔🏻', rating:5, text:'My son calls the light-up sneakers his "rocket shoes". Worth every rupee for that smile.' },
  { name:'Meera J.', loc:'Chennai', avatar:'👩🏽', rating:5, text:'A brand that finally feels magical AND practical. The loyalty stars are a lovely touch.' },
];

export const COUPONS = [
  { code:'WAHH10',   type:'percent', value:10, min:0,    desc:'10% off your order' },
  { code:'MAGIC20',  type:'percent', value:20, min:1500, desc:'20% off over ₹1500' },
  { code:'FREESHIP', type:'ship',    value:0,  min:999,  desc:'Free shipping over ₹999' },
  { code:'STAR250',  type:'flat',    value:250,min:1999, desc:'₹250 off over ₹1999' },
];

export const BLOG = [
  { slug:'dressing-for-monsoon', title:'5 Magical Ways to Dress Kids for Monsoon', emoji:'🌧️', color:'#3fc8ff', date:'Jun 2, 2026', read:'4 min', excerpt:'Splash-proof layering tips that keep little explorers dry, comfy and grinning all season.', author:'Team Wahh' },
  { slug:'organic-cotton-101', title:'Organic Cotton 101: Why It Matters for Tiny Skin', emoji:'🌱', color:'#3fe0b0', date:'May 21, 2026', read:'6 min', excerpt:'What "OEKO-TEX certified" really means and how to spot truly gentle fabrics.', author:'Dr. Neha' },
  { slug:'festival-lookbook', title:'Festival Lookbook: Sparkle Without the Fuss', emoji:'🎉', color:'#ff5fa2', date:'May 9, 2026', read:'3 min', excerpt:'Twirl-ready frocks and hero capes styled for every celebration on the calendar.', author:'Style Desk' },
  { slug:'sizing-guide', title:'The Stress-Free Kids Sizing Guide', emoji:'📏', color:'#ffcf3f', date:'Apr 28, 2026', read:'5 min', excerpt:'Measure once, order right. Our simple chart grows with your child.', author:'Team Wahh' },
];

export const FAQS = [
  { q:'How do I find the right size?', a:'Use the size chart on every product page, or chat with us. Our sizes are generous and labelled by age and measurement so you can pick with confidence.' },
  { q:'What payment methods do you accept?', a:'UPI, QR payment, and Cash on Delivery. All transactions are simulated in this demo store — no real charges are made.' },
  { q:'What is your return policy?', a:'Easy 15-day returns on unworn items with tags. Newborn essentials are exchange-only for hygiene. See our Returns & Refunds page for details.' },
  { q:'How long does delivery take?', a:'Metro cities: 2-4 days. Rest of India: 4-7 days. You can track every order from your account or the Track Order page.' },
  { q:'Are the clothes safe for sensitive skin?', a:'Yes! We use OEKO-TEX certified, tag-free organic cotton with non-toxic, child-safe dyes.' },
  { q:'How do loyalty stars work?', a:'Earn 1 star for every ₹10 spent. Collect stars to unlock surprise discounts and early access to drops.' },
];

export const INSTAGRAM = [
  { emoji:'🌈', color:'#ff5fa2' }, { emoji:'🧸', color:'#3fc8ff' }, { emoji:'🎈', color:'#ffcf3f' },
  { emoji:'⭐', color:'#6c4cf1' }, { emoji:'🦄', color:'#3fe0b0' }, { emoji:'🌸', color:'#ff7a59' },
  { emoji:'👟', color:'#3fc8ff' }, { emoji:'🎀', color:'#ff5fa2' },
];

export const formatINR = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
