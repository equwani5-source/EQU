// ============================================================
// Wahh Kids — Hash router
// ============================================================

const routes = [];

export function route(pattern, handler) {
  // pattern like '/product/:id'
  const keys = [];
  const rx = new RegExp('^' + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$');
  routes.push({ rx, keys, handler, pattern });
}

export function parseHash() {
  let h = location.hash.slice(1) || '/';
  const [path, queryStr] = h.split('?');
  const query = {};
  if (queryStr) for (const pair of queryStr.split('&')) {
    const [k, v] = pair.split('=');
    if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
  }
  return { path: path || '/', query };
}

export function navigate(path) {
  if (('#' + path) === location.hash) { window.dispatchEvent(new HashChangeEvent('hashchange')); }
  else location.hash = path;
}

export function buildQuery(obj) {
  const parts = Object.entries(obj)
    .filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(Array.isArray(v) ? v.join(',') : v)}`);
  return parts.length ? '?' + parts.join('&') : '';
}

let _onRoute;
export function startRouter(onRoute) {
  _onRoute = onRoute;
  window.addEventListener('hashchange', dispatch);
  dispatch();
}

async function dispatch() {
  const { path, query } = parseHash();
  let matched = null, params = {};
  for (const r of routes) {
    const m = path.match(r.rx);
    if (m) { matched = r; r.keys.forEach((k, i) => params[k] = m[i + 1]); break; }
  }
  if (_onRoute) await _onRoute({ path, query, params, handler: matched ? matched.handler : null });
}
