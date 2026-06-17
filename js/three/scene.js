// ============================================================
// Wahh Kids — Three.js scenes (hero world + 360 product viewer)
// Loaded lazily; fails gracefully (CSS fallback remains visible).
// ============================================================

let THREE = null;
async function loadTHREE() {
  if (THREE) return THREE;
  THREE = await import('three');
  return THREE;
}

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

// Render an emoji onto a canvas texture (for floating toys/clothes)
function emojiTexture(T, emoji, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.font = `${size * 0.72}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, size / 2, size / 2 + size * 0.04);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}

// ============================================================
// HERO SCENE
// ============================================================
export async function initHero(container) {
  if (!container || !webglOK()) return { destroy() {} };
  let T;
  try { T = await loadTHREE(); } catch (e) { console.warn('three load failed', e); return { destroy() {} }; }

  const scene = new T.Scene();
  scene.fog = new T.FogExp2(0xcfd9ff, 0.012);

  const camera = new T.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200);
  camera.position.set(0, 2.5, 18);

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // ---- Lights ----
  scene.add(new T.AmbientLight(0xffffff, 0.7));
  const key = new T.DirectionalLight(0xffffff, 1.1);
  key.position.set(6, 12, 8);
  scene.add(key);
  const rim = new T.PointLight(0xff5fa2, 1.2, 60);
  rim.position.set(-8, 4, 6);
  scene.add(rim);
  const mouseLight = new T.PointLight(0x6c4cf1, 1.6, 50);
  mouseLight.position.set(0, 4, 10);
  scene.add(mouseLight);

  const groups = { float: [], balloons: [], clouds: [], bubbles: [] };

  // ---- Water plane (custom shader) ----
  const waterGeo = new T.PlaneGeometry(120, 90, 80, 60);
  const waterMat = new T.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new T.Vector2(0, 0) },
      uColorA: { value: new T.Color(0x3fc8ff) },
      uColorB: { value: new T.Color(0x6c4cf1) },
      uColorC: { value: new T.Color(0x3fe0b0) },
    },
    vertexShader: `
      uniform float uTime; uniform vec2 uMouse;
      varying vec2 vUv; varying float vH;
      void main(){
        vUv = uv;
        vec3 p = position;
        float d = distance(uv, uMouse*0.5+0.5);
        float w = sin(p.x*0.4 + uTime*1.3)*0.6
                + sin(p.y*0.5 + uTime*1.1)*0.5
                + sin((p.x+p.y)*0.3 + uTime*0.8)*0.4;
        w += sin(d*18.0 - uTime*3.0) * 0.5 * smoothstep(0.5,0.0,d);
        p.z += w;
        vH = w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
      }`,
    fragmentShader: `
      uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC; uniform float uTime;
      varying vec2 vUv; varying float vH;
      void main(){
        vec3 col = mix(uColorB, uColorA, smoothstep(-1.0,1.0,vH));
        col = mix(col, uColorC, smoothstep(0.3,1.0,vUv.y)*0.4);
        float spec = smoothstep(0.6,1.0,vH);
        col += spec*0.5;
        float alpha = 0.78 - vUv.y*0.25;
        gl_FragColor = vec4(col, alpha);
      }`,
  });
  const water = new T.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -6.5, -4);
  scene.add(water);

  // floating rubber duck + boat on water
  ['🦆', '⛵', '🦆'].forEach((e, i) => {
    const s = new T.Sprite(new T.SpriteMaterial({ map: emojiTexture(T, e), transparent: true }));
    s.scale.set(2.4, 2.4, 1);
    s.position.set(-7 + i * 7, -5.2, 1 + i);
    s.userData = { base: s.position.y, ph: i * 1.7, isWater: true };
    scene.add(s); groups.float.push(s);
  });

  // ---- Floating clothes & toys (emoji sprites) ----
  const items = ['👗','👕','👟','🧸','🎈','🧢','🩳','🌟','🎀','🧦','🦄','🍼'];
  items.forEach((e, i) => {
    const mat = new T.SpriteMaterial({ map: emojiTexture(T, e), transparent: true });
    const sp = new T.Sprite(mat);
    const sc = 2 + Math.random() * 1.6;
    sp.scale.set(sc, sc, 1);
    sp.position.set((Math.random() - 0.5) * 26, Math.random() * 9 - 1, (Math.random() - 0.5) * 10 - 2);
    sp.userData = { base: sp.position.y, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.6, rot: (Math.random()-0.5)*0.4 };
    scene.add(sp); groups.float.push(sp);
  });

  // ---- Balloons (spheres + string) ----
  const balloonColors = [0xff5fa2, 0x3fc8ff, 0xffcf3f, 0x3fe0b0, 0xff7a59, 0x6c4cf1];
  balloonColors.forEach((col, i) => {
    const g = new T.Group();
    const balloon = new T.Mesh(new T.SphereGeometry(1, 24, 24), new T.MeshStandardMaterial({ color: col, roughness: 0.25, metalness: 0.05 }));
    balloon.scale.set(1, 1.25, 1);
    const knot = new T.Mesh(new T.ConeGeometry(0.18, 0.4, 8), new T.MeshStandardMaterial({ color: col }));
    knot.position.y = -1.3;
    g.add(balloon); g.add(knot);
    g.position.set((Math.random() - 0.5) * 24, Math.random() * 6 + 2, (Math.random() - 0.5) * 8 - 4);
    g.userData = { base: g.position.y, ph: Math.random() * 6.28, sp: 0.3 + Math.random() * 0.4 };
    scene.add(g); groups.balloons.push(g);
  });

  // ---- Clouds (clusters of spheres) ----
  function makeCloud() {
    const g = new T.Group();
    const mat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 });
    for (let i = 0; i < 5; i++) {
      const s = new T.Mesh(new T.SphereGeometry(1, 16, 16), mat);
      s.position.set((i - 2) * 1.1, Math.random() * 0.5, Math.random() * 0.5);
      s.scale.setScalar(0.9 + Math.random() * 0.8);
      g.add(s);
    }
    return g;
  }
  for (let i = 0; i < 4; i++) {
    const c = makeCloud();
    c.position.set((Math.random() - 0.5) * 40, 6 + Math.random() * 4, -10 - Math.random() * 8);
    c.scale.setScalar(1.3 + Math.random());
    c.userData = { sp: 0.4 + Math.random() * 0.5, x: c.position.x };
    scene.add(c); groups.clouds.push(c);
  }

  // ---- Bubbles + sparkle particles ----
  const bubbleGeo = new T.SphereGeometry(0.3, 12, 12);
  const bubbleMat = new T.MeshStandardMaterial({ color: 0xbfefff, transparent: true, opacity: 0.4, roughness: 0, metalness: 0 });
  for (let i = 0; i < 26; i++) {
    const b = new T.Mesh(bubbleGeo, bubbleMat);
    b.position.set((Math.random() - 0.5) * 30, Math.random() * 16 - 6, (Math.random() - 0.5) * 12);
    b.scale.setScalar(0.4 + Math.random() * 1.6);
    b.userData = { sp: 0.6 + Math.random() * 1.4, x: b.position.x, drift: (Math.random()-0.5) };
    scene.add(b); groups.bubbles.push(b);
  }

  // sparkles (points)
  const N = 350; const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i*3]=(Math.random()-0.5)*60; pos[i*3+1]=(Math.random()-0.5)*30+4; pos[i*3+2]=(Math.random()-0.5)*30-5; }
  const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
  const sparkles = new T.Points(pg, new T.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.8, sizeAttenuation: true }));
  scene.add(sparkles);

  // ---- Interaction ----
  const mouse = new T.Vector2(0, 0);
  const target = new T.Vector2(0, 0);
  function onMove(e) {
    const r = container.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    target.x = (cx / r.width) * 2 - 1;
    target.y = -((cy / r.height) * 2 - 1);
  }
  window.addEventListener('pointermove', onMove);

  // ---- Resize ----
  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  // ---- Loop ----
  const clock = new T.Clock();
  let raf, running = true;
  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    mouse.x += (target.x - mouse.x) * 0.05;
    mouse.y += (target.y - mouse.y) * 0.05;

    waterMat.uniforms.uTime.value = t;
    waterMat.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // parallax camera
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.04;
    camera.position.y += (2.5 + mouse.y * 2 - camera.position.y) * 0.04;
    camera.lookAt(0, 1, 0);

    // mouse-follow light
    mouseLight.position.set(mouse.x * 14, 4 + mouse.y * 6, 10);
    rim.intensity = 1 + Math.sin(t * 2) * 0.4;

    groups.float.forEach((s) => {
      s.position.y = s.userData.base + Math.sin(t * (s.userData.sp || 0.5) + s.userData.ph) * (s.userData.isWater ? 0.4 : 1.0);
      if (s.material && s.material.rotation !== undefined) s.material.rotation = Math.sin(t * 0.4 + s.userData.ph) * (s.userData.rot || 0.2);
    });
    groups.balloons.forEach((g) => {
      g.position.y = g.userData.base + Math.sin(t * g.userData.sp + g.userData.ph) * 1.2;
      g.rotation.z = Math.sin(t * 0.6 + g.userData.ph) * 0.12;
    });
    groups.clouds.forEach((c) => {
      c.position.x += c.userData.sp * 0.01;
      if (c.position.x > 26) c.position.x = -26;
    });
    groups.bubbles.forEach((b) => {
      b.position.y += b.userData.sp * 0.02;
      b.position.x += Math.sin(t + b.userData.x) * 0.003 * b.userData.drift;
      if (b.position.y > 12) { b.position.y = -8; }
    });
    sparkles.rotation.y = t * 0.02;
    sparkles.material.opacity = 0.5 + Math.sin(t * 2) * 0.3;

    renderer.render(scene, camera);
  }
  tick();

  function onVis() { running = !document.hidden; if (running) tick(); }
  document.addEventListener('visibilitychange', onVis);

  return {
    destroy() {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      renderer.dispose();
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ m.map&&m.map.dispose(); m.dispose(); }); } });
      renderer.domElement.remove();
    }
  };
}

// ============================================================
// 360 PRODUCT VIEWER
// ============================================================
function garmentShape(T, type) {
  const s = new T.Shape();
  if (type === 'dress' || type === 'frock') {
    s.moveTo(-0.9, 1.4); s.quadraticCurveTo(-0.4, 1.5, 0, 1.5);
    s.quadraticCurveTo(0.4, 1.5, 0.9, 1.4); s.lineTo(0.6, 1.0);
    s.quadraticCurveTo(0.5, 0.7, 0.6, 0.4); s.lineTo(1.3, -1.5);
    s.quadraticCurveTo(0, -1.9, -1.3, -1.5); s.lineTo(-0.6, 0.4);
    s.quadraticCurveTo(-0.5, 0.7, -0.6, 1.0); s.closePath();
  } else if (type === 'shorts') {
    s.moveTo(-1, 0.8); s.lineTo(1, 0.8); s.lineTo(1.05, -0.2);
    s.lineTo(0.15, -0.2); s.lineTo(0.1, -1); s.lineTo(-0.1, -1);
    s.lineTo(-0.15, -0.2); s.lineTo(-1.05, -0.2); s.closePath();
  } else if (type === 'shoes' || type === 'sneaker') {
    s.moveTo(-1.4, -0.6); s.quadraticCurveTo(-1.5, 0.4, -0.6, 0.5);
    s.quadraticCurveTo(0.2, 0.6, 0.8, 0.2); s.quadraticCurveTo(1.5, 0.1, 1.5, -0.3);
    s.lineTo(1.45, -0.6); s.closePath();
  } else {
    // tshirt / hoodie / generic top
    s.moveTo(-0.7, 1.2); s.lineTo(-1.4, 0.7); s.lineTo(-1.0, 0.0);
    s.lineTo(-0.7, 0.2); s.lineTo(-0.7, -1.4); s.lineTo(0.7, -1.4);
    s.lineTo(0.7, 0.2); s.lineTo(1.0, 0.0); s.lineTo(1.4, 0.7);
    s.lineTo(0.7, 1.2); s.quadraticCurveTo(0, 1.5, -0.7, 1.2); s.closePath();
  }
  return s;
}

export async function initProduct360(container, product, opts = {}) {
  if (!container) return null;
  if (!webglOK()) { container.classList.add('no-webgl'); return null; }
  let T, OrbitControls;
  try {
    T = await loadTHREE();
    ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  } catch (e) { console.warn('360 viewer load failed', e); return null; }

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  scene.add(new T.AmbientLight(0xffffff, 0.8));
  const d1 = new T.DirectionalLight(0xffffff, 1.2); d1.position.set(4, 6, 6); scene.add(d1);
  const d2 = new T.DirectionalLight(0xff8fc4, 0.6); d2.position.set(-5, -2, 3); scene.add(d2);

  const shape = garmentShape(T, product.type);
  const geo = new T.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.18, bevelSegments: 6, steps: 1 });
  geo.center();
  let mat = new T.MeshStandardMaterial({ color: new T.Color(product.colors[0].hex), roughness: 0.55, metalness: 0.08 });
  const mesh = new T.Mesh(geo, mat);
  const fit = (product.type === 'shoes' || product.type === 'sneaker') ? 1.5 : 1.7;
  mesh.scale.setScalar(fit);
  scene.add(mesh);

  // floor shadow disc
  const disc = new T.Mesh(new T.CircleGeometry(2.4, 32), new T.MeshBasicMaterial({ color: 0x1d1240, transparent: true, opacity: 0.10 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -2.4; scene.add(disc);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 3.5; controls.maxDistance = 9;
  controls.autoRotate = true; controls.autoRotateSpeed = 2.2;

  let raf, running = true;
  function tick() {
    if (!running) return;
    raf = requestAnimationFrame(tick);
    controls.update();
    mesh.position.y = Math.sin(performance.now() * 0.0015) * 0.12;
    renderer.render(scene, camera);
  }
  tick();

  function onResize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  return {
    setColor(hex) { mesh.material.color.set(hex); },
    toggleAutoRotate() { controls.autoRotate = !controls.autoRotate; return controls.autoRotate; },
    resetView() { controls.reset(); camera.position.set(0, 0, 6); },
    destroy() {
      running = false; cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      controls.dispose(); geo.dispose(); mat.dispose(); renderer.dispose();
      renderer.domElement.remove();
    }
  };
}
