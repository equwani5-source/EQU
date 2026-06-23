// ============================================================
// Wahh Kids — Shared UI helpers
// ============================================================

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function qs(sel, root = document) { return root.querySelector(sel); }
export function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

export function debounce(fn, ms = 200) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ---------- Toasts ----------
export function toast(msg, type = 'ok', icon) {
  const icons = { ok: '✨', err: '⚠️', info: '💬' };
  const node = el(`<div class="toast ${type === 'ok' ? '' : type}">
    <span class="toast__icon">${icon || icons[type] || '✨'}</span>
    <span class="toast__msg">${msg}</span>
  </div>`);
  document.getElementById('toasts').appendChild(node);
  setTimeout(() => {
    node.style.transition = 'opacity .3s, transform .3s';
    node.style.opacity = '0'; node.style.transform = 'translateX(40px)';
    setTimeout(() => node.remove(), 320);
  }, 2600);
}

// ---------- Stars ----------
export function starRow(rating, size = '') {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let s = '';
  for (let i = 0; i < 5; i++) s += i < full ? '★' : (i === full && half ? '⯨' : '☆');
  return `<span class="stars ${size}">${s.replace(/⯨/g, '★')}</span>`;
}

// ---------- Reveal on scroll ----------
let _io;
export function observeReveals(root = document) {
  if (!_io) {
    _io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); _io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  qsa('.reveal', root).forEach(n => _io.observe(n));
}

// ---------- Button ripple (water splash) ----------
export function attachRipples(root = document) {
  qsa('.btn', root).forEach(btn => {
    if (btn._ripple) return; btn._ripple = true;
    btn.addEventListener('click', (e) => {
      const r = btn.getBoundingClientRect();
      const s = el(`<span class="ripple"></span>`);
      s.style.left = (e.clientX - r.left) + 'px';
      s.style.top = (e.clientY - r.top) + 'px';
      s.style.width = s.style.height = Math.max(r.width, r.height) + 'px';
      btn.appendChild(s);
      setTimeout(() => s.remove(), 650);
    });
  });
}

// ---------- 3D tilt on cards ----------
export function attachTilt(root = document) {
  qsa('[data-tilt]', root).forEach(card => {
    if (card._tilt) return; card._tilt = true;
    const strength = card.classList.contains('coll-card') || card.classList.contains('cat-card') ? 8 : 13;
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

// ---------- Confetti (order success) ----------
export function confetti() {
  const colors = ['#6c4cf1', '#ff5fa2', '#3fc8ff', '#ffcf3f', '#3fe0b0', '#ff7a59'];
  const layer = el(`<div style="position:fixed;inset:0;pointer-events:none;z-index:300;overflow:hidden"></div>`);
  document.body.appendChild(layer);
  for (let i = 0; i < 120; i++) {
    const p = el(`<span></span>`);
    const c = colors[i % colors.length];
    Object.assign(p.style, {
      position: 'absolute', left: Math.random() * 100 + '%', top: '-20px',
      width: 8 + Math.random() * 8 + 'px', height: 8 + Math.random() * 12 + 'px',
      background: c, borderRadius: Math.random() > .5 ? '50%' : '2px',
      transform: `rotate(${Math.random() * 360}deg)`,
      animation: `confFall ${2 + Math.random() * 2}s ${Math.random()}s ease-in forwards`,
    });
    layer.appendChild(p);
  }
  if (!document.getElementById('confKF')) {
    const st = el(`<style id="confKF">@keyframes confFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}</style>`);
    document.head.appendChild(st);
  }
  setTimeout(() => layer.remove(), 4500);
}

// ---------- Modal ----------
export function modal(contentHTML, opts = {}) {
  const overlay = el(`<div class="drawer-overlay open" style="display:grid;place-items:center;padding:1rem;z-index:160">
    <div class="glass" style="max-width:${opts.width || 520}px;width:100%;max-height:88vh;overflow:auto;padding:1.6rem;animation:popIn .3s ease">
      ${opts.closable === false ? '' : '<button class="modal-x icon-btn" style="position:absolute;top:14px;right:14px">✕</button>'}
      ${contentHTML}
    </div>
  </div>`);
  document.body.appendChild(overlay);
  const close = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 250); };
  overlay.addEventListener('click', (e) => { if (e.target === overlay && opts.closable !== false) close(); });
  const x = overlay.querySelector('.modal-x'); if (x) x.addEventListener('click', close);
  return { overlay, close };
}

// ---------- Countdown ----------
export function countdown(targetMs, onTick) {
  const tick = () => {
    let d = Math.max(0, targetMs - Date.now());
    const h = Math.floor(d / 36e5); d -= h * 36e5;
    const m = Math.floor(d / 6e4); d -= m * 6e4;
    const s = Math.floor(d / 1e3);
    onTick({ h, m, s, done: targetMs - Date.now() <= 0 });
  };
  tick();
  return setInterval(tick, 1000);
}

export const pad2 = (n) => String(n).padStart(2, '0');

// ---------- Client-side image compression (for admin photo upload) ----------
// Resizes + compresses to keep it well under Firestore's 1MB doc limit.
export function compressImage(file, maxDim = 760, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject(new Error('Please choose an image file')); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That image could not be loaded'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        // step down quality if still large (~700KB cap to stay safe)
        let q = quality;
        while (dataUrl.length > 700000 && q > 0.4) { q -= 0.1; dataUrl = canvas.toDataURL('image/jpeg', q); }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
