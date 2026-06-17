// ============================================================
// Wahh Kids — Procedural SVG garment illustrations
// Self-contained, vibrant, never-broken product imagery.
// ============================================================

function shade(hex, amt) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  let r = (num >> 16) + amt, g = ((num >> 8) & 0xff) + amt, b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function defs(id, color) {
  const light = shade(color, 45), dark = shade(color, -35);
  return `<defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="sh${id}" cx="0.5" cy="0.95" r="0.5">
      <stop offset="0" stop-color="rgba(29,18,64,0.18)"/><stop offset="1" stop-color="rgba(29,18,64,0)"/>
    </radialGradient>
  </defs>`;
}

const SHAPES = {
  tshirt: (id, c) => `
    <ellipse cx="100" cy="182" rx="60" ry="10" fill="url(#sh${id})"/>
    <path d="M64 44 L40 60 L26 92 L46 108 L62 96 L62 170 Q100 182 138 170 L138 96 L154 108 L174 92 L160 60 L136 44 Q118 64 100 64 Q82 64 64 44 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M64 44 Q82 64 100 64 Q118 64 136 44" fill="none" stroke="${shade(c,40)}" stroke-width="3" opacity=".7"/>
    <circle cx="100" cy="92" r="14" fill="#fff" opacity=".85"/><text x="100" y="98" font-size="16" text-anchor="middle">⭐</text>`,
  hoodie: (id, c) => `
    <ellipse cx="100" cy="184" rx="64" ry="10" fill="url(#sh${id})"/>
    <path d="M60 46 L34 64 L22 96 L42 112 L58 100 L58 172 L142 172 L142 100 L158 112 L178 96 L166 64 L140 46 L140 70 Q100 92 60 70 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M70 44 Q100 78 130 44 Q116 30 100 30 Q84 30 70 44 Z" fill="${shade(c,-20)}" stroke="${shade(c,-50)}" stroke-width="2"/>
    <line x1="92" y1="100" x2="92" y2="150" stroke="${shade(c,-40)}" stroke-width="2.5"/><line x1="108" y1="100" x2="108" y2="150" stroke="${shade(c,-40)}" stroke-width="2.5"/>
    <circle cx="92" cy="150" r="3" fill="#fff"/><circle cx="108" cy="150" r="3" fill="#fff"/>`,
  dress: (id, c) => `
    <ellipse cx="100" cy="186" rx="66" ry="10" fill="url(#sh${id})"/>
    <path d="M70 44 L52 58 L40 84 L56 96 L70 86 L46 176 Q100 192 154 176 L130 86 L144 96 L160 84 L148 58 L130 44 Q100 62 70 44 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M70 44 Q100 62 130 44" fill="none" stroke="${shade(c,40)}" stroke-width="3" opacity=".7"/>
    <path d="M62 120 Q100 134 138 120" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
    <circle cx="100" cy="100" r="9" fill="#fff"/><circle cx="78" cy="150" r="4" fill="#fff" opacity=".8"/><circle cx="122" cy="150" r="4" fill="#fff" opacity=".8"/>`,
  frock: (id, c) => `
    <ellipse cx="100" cy="186" rx="70" ry="10" fill="url(#sh${id})"/>
    <path d="M74 46 L56 60 L46 84 L62 94 L74 86 L40 178 Q100 196 160 178 L126 86 L138 94 L154 84 L144 60 L126 46 Q100 64 74 46 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <path d="M50 150 Q70 160 90 150 T130 150 T160 152" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
    <path d="M55 168 Q75 178 95 168 T135 168 T158 170" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>
    <text x="100" y="108" font-size="20" text-anchor="middle">🌸</text>`,
  romper: (id, c) => `
    <ellipse cx="100" cy="180" rx="58" ry="9" fill="url(#sh${id})"/>
    <path d="M66 50 L44 64 L34 90 L50 102 L64 92 L64 130 L60 168 L92 168 L100 138 L108 168 L140 168 L136 130 L136 92 L150 102 L166 90 L156 64 L134 50 Q100 68 66 50 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <circle cx="84" cy="86" r="4" fill="#fff"/><circle cx="116" cy="86" r="4" fill="#fff"/>
    <text x="100" y="120" font-size="18" text-anchor="middle">🐻</text>`,
  shorts: (id, c) => `
    <ellipse cx="100" cy="156" rx="56" ry="9" fill="url(#sh${id})"/>
    <path d="M52 70 L148 70 L150 96 L120 96 L112 146 L80 146 L72 110 L66 146 L34 146 Q40 110 50 96 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <rect x="50" y="64" width="100" height="12" rx="6" fill="${shade(c,-25)}"/>
    <path d="M98 96 L98 146" stroke="${shade(c,-40)}" stroke-width="2"/>`,
  jacket: (id, c) => `
    <ellipse cx="100" cy="184" rx="62" ry="10" fill="url(#sh${id})"/>
    <path d="M62 44 L34 62 L22 96 L42 110 L58 100 L58 172 L98 172 L98 56 Q80 60 62 44 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <path d="M138 44 L166 62 L178 96 L158 110 L142 100 L142 172 L102 172 L102 56 Q120 60 138 44 Z" fill="${shade(c,-12)}" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <line x1="100" y1="56" x2="100" y2="172" stroke="${shade(c,-45)}" stroke-width="3" stroke-dasharray="4 5"/>
    <circle cx="100" cy="80" r="3" fill="#fff"/><circle cx="100" cy="110" r="3" fill="#fff"/><circle cx="100" cy="140" r="3" fill="#fff"/>`,
  shoes: (id, c) => `
    <ellipse cx="100" cy="150" rx="74" ry="10" fill="url(#sh${id})"/>
    <path d="M28 132 Q30 96 70 96 Q92 96 112 112 Q140 120 170 122 Q178 124 178 138 L176 146 Q170 150 150 150 L40 150 Q28 148 28 132 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <path d="M28 142 L178 142 L176 150 L30 150 Z" fill="#fff" opacity=".9"/>
    <path d="M70 100 Q86 104 96 116" stroke="#fff" stroke-width="3" fill="none"/>
    <path d="M84 104 Q98 110 106 122" stroke="#fff" stroke-width="3" fill="none"/>
    <circle cx="150" cy="124" r="4" fill="#fff"/>`,
  sneaker: (id, c) => SHAPES.shoes(id, c),
  cap: (id, c) => `
    <ellipse cx="100" cy="150" rx="60" ry="8" fill="url(#sh${id})"/>
    <path d="M44 116 Q44 64 100 64 Q156 64 156 116 Q128 104 100 104 Q72 104 44 116 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <path d="M44 116 Q30 122 28 134 Q60 138 100 116 Z" fill="${shade(c,-20)}" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <circle cx="100" cy="70" r="6" fill="${shade(c,-30)}"/>
    <text x="100" y="100" font-size="16" text-anchor="middle">⚡</text>`,
  socks: (id, c) => `
    <ellipse cx="100" cy="170" rx="50" ry="8" fill="url(#sh${id})"/>
    <path d="M76 40 L124 40 L124 120 Q124 140 144 150 L150 168 Q120 178 96 162 L96 120 L76 120 Z" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <rect x="74" y="40" width="52" height="14" rx="4" fill="${shade(c,40)}"/>
    <line x1="76" y1="70" x2="124" y2="70" stroke="#fff" stroke-width="4" opacity=".7"/>
    <line x1="76" y1="86" x2="124" y2="86" stroke="#fff" stroke-width="4" opacity=".7"/>`,
  accessory: (id, c) => `
    <ellipse cx="100" cy="160" rx="50" ry="8" fill="url(#sh${id})"/>
    <circle cx="100" cy="100" r="50" fill="url(#g${id})" stroke="${shade(c,-50)}" stroke-width="2.5"/>
    <text x="100" y="116" font-size="44" text-anchor="middle">🎒</text>`,
};

/**
 * Returns an inline SVG string for a garment.
 * @param {string} type  garment type key
 * @param {string} color hex color
 * @param {object} opts  { bg: boolean }
 */
export function garmentSVG(type, color = '#6c4cf1', opts = {}) {
  const id = Math.random().toString(36).slice(2, 7);
  const shape = (SHAPES[type] || SHAPES.tshirt)(id, color);
  const bg = opts.bg
    ? `<rect width="200" height="200" rx="24" fill="${shade(color, 70)}" opacity=".25"/>`
    : '';
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${type}">${defs(id, color)}${bg}${shape}</svg>`;
}

export function emojiFor(type) {
  return ({ tshirt:'👕', hoodie:'🧥', dress:'👗', frock:'👗', romper:'🧸', shorts:'🩳',
    jacket:'🧥', shoes:'👟', sneaker:'👟', cap:'🧢', socks:'🧦', accessory:'🎒' })[type] || '👕';
}

export { shade };
