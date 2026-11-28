/* ==========================================================================
   SummitTED Kariyer ve İnovasyon Zirvesi 2026 — Architectural 3D Campus (v6)
   Minimalist Architectural Scale Model (TEDU360-Grounded, Zero Visual Clutter):
   - Calm studio palette: off-white & warm stone architecture so TED Red
     (Fuaye Meeting Point, Red Zone, Gates) and TEDÜ Navy (Blue Zone, Çim Amfi)
     read with effortless spatial clarity.
   - Zero giant floating 3D sprite billboards; crisp rooftop block letters +
     screen-space collision-free LOD hotspot pills that never overlap.
   - Real TEDU360 landmarks: Orta Bahçe striped stone & raised lawn + curved wood
     stage, A/B Blok limestone colonnade, Hoşgeldiniz & K Blok Fuaye Meeting Point
     under transparent glass skylight, Yeni Kısım travertine wood-bench planters,
     7-tier stepped Çim Amfi, pitched-roof F/G Blok, louvered E Blok + pergola.
   ========================================================================== */

import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { mergeGeometries } from './vendor/BufferGeometryUtils.js';

const ready = document.readyState === 'loading'
  ? new Promise((resolve) => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
  : Promise.resolve();
await ready;

const shell = document.getElementById('submitted-world');
const host = document.getElementById('world-canvas');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (shell && host) {
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('aria-label', '3D TEDÜ SummitTED Kampüs Haritası');
    initCampus3D(renderer);
  } catch (err) {
    console.warn('3D fallback to 2D blueprint:', err);
    document.dispatchEvent(new CustomEvent('summitted-force-2d'));
  }
}

function initCampus3D(renderer) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xedf2f8, 175, 340);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 560);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 24;
  controls.maxDistance = 235;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI / 2.28;
  controls.rotateSpeed = 0.52;
  controls.enableZoom = false;

  // Soft studio architectural lighting
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9aa6b8, 1.95));

  const sun = new THREE.DirectionalLight(0xfff6eb, 2.55);
  sun.position.set(-48, 86, -54);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -110;
  sun.shadow.camera.right = 75;
  sun.shadow.camera.top = 75;
  sun.shadow.camera.bottom = -75;
  sun.shadow.camera.far = 250;
  sun.shadow.normalBias = 0.04;
  sun.shadow.bias = -0.00025;
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0xdce8fa, 1.15);
  rim.position.set(42, 32, 28);
  scene.add(rim);

  const materials = new Map();
  function mat(color, metalness = 0, roughness = 0.72, extra = null) {
    const k = `${color}|${metalness}|${roughness}|${extra ? JSON.stringify(extra) : ''}`;
    if (!materials.has(k)) {
      materials.set(k, new THREE.MeshStandardMaterial(Object.assign({ color, metalness, roughness }, extra || {})));
    }
    return materials.get(k);
  }

  // Restrained architectural maquette palette
  const m = {
    contextGround: mat('#e6ecf4', 0, 0.94),
    plinth: mat('#d6dde8', 0, 0.85),
    pavingLight: mat('#eef2f7', 0, 0.84),
    pavingBand: mat('#c3ccd9', 0, 0.84),
    road: mat('#4f5a6e', 0.04, 0.82),
    sidewalk: mat('#d5dce7', 0, 0.84),
    lawn: mat('#77a667', 0, 0.9),
    travertine: mat('#e3d9c8', 0, 0.78),
    limestone: mat('#ebe6dc', 0.02, 0.76),
    archWhite: mat('#f7f9fc', 0.02, 0.7),
    coolGrey: mat('#dfe5ee', 0.04, 0.72),
    slateRoof: mat('#4a5568', 0.1, 0.65),
    glassRibbon: mat('#5b7999', 0.35, 0.22),
    glassSkylight: mat('#8db6db', 0.25, 0.12, { transparent: true, opacity: 0.32 }),
    oak: mat('#c28d5b', 0.05, 0.62),
    darkMarble: mat('#1f2330', 0.2, 0.38),
    darkFrame: mat('#1b2336', 0.3, 0.45),
    colonnade: mat('#cfd5df', 0, 0.78),
    silver: mat('#cfd6e0', 0.62, 0.34),
    tedNavy: mat('#162147', 0.16, 0.48),
    tedBlue: mat('#292E6F', 0.16, 0.48),
    tedRed: mat('#E41513', 0.12, 0.42),
    skyAccent: mat('#0284C7', 0.12, 0.45),
    ledBlue: new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
    foliage: mat('#6d9c64', 0, 0.88),
    foliageSoft: mat('#84ad78', 0, 0.88)
  };

  const edgeLineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.34 });

  const zoneKeys = [
    'environment', 'glassLayer',
    'gate-1', 'gate-2', 'gate-3',
    'red', 'blue', 'promenade', 'communities',
    'innovation', 'matchmaking', 'plenary', 'tech', 'teacher-plus', 'plaza'
  ];
  const groups = {};
  for (const key of zoneKeys) {
    groups[key] = new THREE.Group();
    groups[key].userData.zone = (key === 'environment') ? null : (key === 'glassLayer' ? 'matchmaking' : key);
    scene.add(groups[key]);
  }

  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  function mesh(geo, material, x, y, z, parent = groups.environment) {
    const o = new THREE.Mesh(geo, material);
    o.position.set(x, y, z);
    o.castShadow = !material.transparent;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }

  function box(w, h, d, x, y, z, material, parent = groups.environment, withEdge = false) {
    const o = mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, parent);
    if (withEdge) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry), edgeLineMat);
      edges.position.set(x, y, z);
      scene.add(edges);
    }
    return o;
  }

  function cyl(r1, r2, h, x, y, z, material, parent = groups.environment, seg = 16) {
    return mesh(new THREE.CylinderGeometry(r1, r2, h, seg), material, x, y, z, parent);
  }

  function roofBadge(letter, x, y, z, bg = '#0B1330', accent = '#E41513', size = 4.2) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, 256, 26);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 128, 144);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })
    );
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, y + 0.08, z);
    scene.add(p);
  }

  function crispSign(text, x, y, z, w, h, parent, bg = '#0B1330', stripe = '#E41513') {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = stripe;
    ctx.fillRect(0, 0, 512, 14);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 44px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 72);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), x, y, z, parent);
  }

  // Clean minimalist pagoda tent (no cluttered micro-text)
  function cleanTent(x, z, size, accentMat, zoneKey, baseY = 0) {
    const g = new THREE.Group();
    const h = size * 0.44;
    box(size, 0.12, size, 0, 0.08, 0, m.pavingLight, g);
    for (const dx of [-h, h]) {
      for (const dz of [-h, h]) {
        box(0.08, 2.3, 0.08, dx, 1.25, dz, m.silver, g);
      }
    }
    box(size + 0.1, 0.24, size + 0.1, 0, 2.45, 0, accentMat, g);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(size * 0.74, 1.05, 4), m.archWhite);
    roof.position.set(0, 3.08, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);
    g.position.set(x, baseY, z);
    groups[zoneKey].add(g);
  }

  // Clean minimalist pavilion booth (corporate zones)
  function cleanPavilion(x, z, w, d, accentMat, zoneKey) {
    const g = new THREE.Group();
    box(w, 0.14, d, 0, 0.1, 0, m.pavingLight, g);
    box(w - 0.3, 2.4, 0.2, 0, 1.35, -d / 2 + 0.2, m.archWhite, g);
    box(w, 0.28, d, 0, 2.68, 0, accentMat, g);
    box(0.1, 2.5, 0.1, -w / 2 + 0.15, 1.35, d / 2 - 0.15, m.silver, g);
    box(0.1, 2.5, 0.1, w / 2 - 0.15, 1.35, d / 2 - 0.15, m.silver, g);
    g.position.set(x, 0, z);
    groups[zoneKey].add(g);
  }

  // Clean minimalist Entrance Archway + Accreditation Canopy
  function cleanGate(x, z, codeLabel, zoneKey, rotY = 0) {
    const g = new THREE.Group();
    box(0.65, 4.4, 0.65, -3.2, 2.25, 0, m.tedNavy, g);
    box(0.65, 4.4, 0.65, 3.2, 2.25, 0, m.tedNavy, g);
    box(7.2, 0.9, 0.85, 0, 4.65, 0, m.tedNavy, g);
    box(7.3, 0.18, 0.9, 0, 5.18, 0, m.tedRed, g);
    crispSign(codeLabel, 0, 4.65, 0.45, 6.2, 0.74, g, '#0B1330', '#E41513');
    const back = crispSign(codeLabel, 0, 4.65, -0.45, 6.2, 0.74, g, '#0B1330', '#E41513');
    back.rotation.y = Math.PI;
    cleanTent(0, -3.1, 3.2, m.tedRed, zoneKey, 0);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // Clean architectural tree (minimalist spheres)
  function cleanTree(x, z, s = 1, parent = groups.environment) {
    cyl(0.12, 0.16, 1.6 * s, x, 0.9 * s, z, m.oak, parent, 8);
    mesh(new THREE.SphereGeometry(1.15 * s, 14, 10), (x + z) % 2 === 0 ? m.foliage : m.foliageSoft, x, 2.4 * s, z, parent);
  }

  // Clean travertine planter with cantilevered oak bench (TEDU360 Yeni Kısım signature)
  function benchPlanter(x, z) {
    box(2.1, 0.85, 2.1, x, 0.5, z, m.travertine, groups.plaza);
    box(3.3, 0.12, 3.3, x, 0.45, z, m.oak, groups.plaza);
    cleanTree(x, z, 0.85, groups.plaza);
  }

  // =========================================================================
  // 1. STUDIO BASE PLANE & TWO ELEVATED CAMPUS PLINTHS
  // =========================================================================
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(520, 520), m.contextGround);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.35;
  ground.receiveShadow = true;
  scene.add(ground);

  // Subtle architectural grid lines on outer studio plane
  const studioGrid = new THREE.GridHelper(320, 64, 0xcbd5e1, 0xdbe3ee);
  studioGrid.position.y = -0.32;
  studioGrid.material.transparent = true;
  studioGrid.material.opacity = 0.55;
  scene.add(studioGrid);

  // East Plinth: İncesu & Orta Bahçe Campus
  box(70, 0.45, 58, 2, -0.1, 0, m.plinth);
  box(68.4, 0.14, 56.4, 2, 0.18, 0, m.pavingLight);

  // Subtle Orta Bahçe stone bands (TEDU360 signature — calm contrast)
  for (let s = -20; s <= 16; s += 5.2) {
    box(44, 0.02, 1.2, 0, 0.26, s, m.pavingBand);
  }

  // Orta Bahçe Elevated Rectangular Green Lawn + 5 Steps + Circular Oak Deck
  box(25, 0.72, 18, 1, 0.56, 2, m.plinth);
  box(23.8, 0.14, 16.8, 1, 0.96, 2, m.lawn);
  for (let st = 0; st < 5; st++) {
    box(0.85, 0.14 + st * 0.14, 10, -11.9 - (4 - st) * 0.52, 0.26 + st * 0.07, 2, m.pavingLight);
  }
  cyl(4.0, 4.0, 0.18, 6.2, 1.1, 2, m.oak, groups.plaza, 28);

  // Ziya Gökalp Caddesi (Clean central urban axis)
  box(11.6, 0.08, 86, -39, 0.02, 0, m.road);
  box(1.5, 0.16, 86, -32.6, 0.1, 0, m.sidewalk);
  box(1.5, 0.16, 86, -45.4, 0.1, 0, m.sidewalk);
  // Crisp dashed centerline & summit pedestrian crosswalk
  for (let z = -34; z <= 34; z += 5.5) {
    if (z > 3 && z < 13) continue;
    box(0.24, 0.02, 2.4, -39, 0.08, z, m.archWhite);
  }
  for (let x = -43.5; x < -34.2; x += 1.2) {
    box(0.65, 0.02, 4.4, x, 0.08, 8, m.archWhite);
  }
  box(9.8, 0.02, 0.35, -39, 0.09, 5.4, m.tedRed);
  box(9.8, 0.02, 0.35, -39, 0.09, 10.6, m.tedRed);

  // West Plinth: Yeni Kısım Bahçe & Aksu Wing
  box(54, 0.45, 58, -73, -0.1, 0, m.plinth);
  box(52.4, 0.14, 56.4, -73, 0.18, 0, m.pavingLight);

  // Yeni Kısım Square Travertine Tree Planters with Cantilevered Oak Benches
  benchPlanter(-64, -4.5);
  benchPlanter(-74, -4.5);
  benchPlanter(-69, 3.8);

  // =========================================================================
  // 2. TEDU360 HERO LANDMARK 1: FUAYE · MEETING POINT (MP-01..24)
  // Open-skylight glass atrium right at Gate 1 & Orta Bahçe north edge
  // =========================================================================
  const fX = -11.5;
  const fZ = -17.5;
  const fW = 24;
  const fD = 10.6;
  // Dark marble border + honey-oak central inlay aisle
  box(fW, 0.2, fD, fX, 0.32, fZ, m.darkMarble, groups.matchmaking);
  box(fW - 5.2, 0.24, 4.0, fX, 0.34, fZ, m.oak, groups.matchmaking);
  // 4 Glossy black architectural pillars with crisp TEDÜ blue vertical LED strips
  for (const px of [fX - 7.4, fX - 2.4, fX + 2.4, fX + 7.4]) {
    for (const pz of [fZ - 3.5, fZ + 3.5]) {
      box(0.7, 4.5, 0.7, px, 2.65, pz, m.darkFrame, groups.matchmaking);
      box(0.11, 4.3, 0.11, px, 2.65, pz + (pz < fZ ? 0.36 : -0.36), m.ledBlue, groups.matchmaking);
    }
  }
  // Open perimeter skylight beam + razor-thin TED Red edge trim (zero solid roof!)
  const bT = 1.1;
  box(fW + 0.3, 0.36, bT, fX, 5.0, fZ - fD / 2 + bT / 2, m.darkFrame, groups.matchmaking);
  box(fW + 0.3, 0.36, bT, fX, 5.0, fZ + fD / 2 - bT / 2, m.darkFrame, groups.matchmaking);
  box(bT, 0.36, fD, fX - fW / 2 + bT / 2, 5.0, fZ, m.darkFrame, groups.matchmaking);
  box(bT, 0.36, fD, fX + fW / 2 - bT / 2, 5.0, fZ, m.darkFrame, groups.matchmaking);
  box(fW + 0.4, 0.14, 0.28, fX, 5.24, fZ - fD / 2 + 0.08, m.tedRed, groups.matchmaking);
  box(fW + 0.4, 0.14, 0.28, fX, 5.24, fZ + fD / 2 - 0.08, m.tedRed, groups.matchmaking);
  box(0.28, 0.14, fD + 0.4, fX - fW / 2 + 0.08, 5.24, fZ, m.tedRed, groups.matchmaking);
  box(0.28, 0.14, fD + 0.4, fX + fW / 2 - 0.08, 5.24, fZ, m.tedRed, groups.matchmaking);
  // Transparent glass walls & overhead skylight
  box(fW, 4.4, 0.08, fX, 2.65, fZ + fD / 2, m.glassSkylight, groups.glassLayer);
  box(fW, 4.4, 0.08, fX, 2.65, fZ - fD / 2, m.glassSkylight, groups.glassLayer);
  box(fW - bT * 2, 0.06, fD - bT * 2, fX, 5.02, fZ, m.glassSkylight, groups.glassLayer);
  // Chrome gimbal ring centerpiece
  mesh(new THREE.TorusGeometry(1.1, 0.075, 10, 28), m.silver, fX, 3.1, fZ, groups.matchmaking);
  // 16 Crisp Meeting Point Tables visible through the skylight
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const mx = fX - 9.2 + c * 2.62;
      const mz = fZ + (r === 0 ? -2.25 : 2.25);
      box(0.92, 0.08, 0.92, mx, 1.08, mz, m.tedNavy, groups.matchmaking);
      box(0.1, 0.72, 0.1, mx, 0.68, mz, m.silver, groups.matchmaking);
      box(0.32, 0.24, 0.06, mx, 1.25, mz, c >= 6 ? m.tedBlue : m.tedRed, groups.matchmaking);
    }
  }

  // =========================================================================
  // 3. TEDU360 HERO LANDMARK 2: STEPPED ÇİM AMFİ (7 TRAVERTINE & GRASS TIERS)
  // =========================================================================
  const amfiX = -70;
  const amfiZ = 10.5;
  for (let t = 0; t < 7; t++) {
    const y = 0.36 + t * 0.46;
    const z = amfiZ + t * 1.15;
    const w = 22 - t * 0.35;
    box(w, 0.44, 0.4, amfiX, y, z, m.travertine, groups.communities);
    box(w, 0.4, 0.76, amfiX, y - 0.02, z + 0.56, m.lawn, groups.communities);
    box(1.8, 0.46, 1.15, amfiX - w / 2 - 1.05, y, z + 0.36, m.slateRoof, groups.communities);
    box(1.8, 0.46, 1.15, amfiX + w / 2 + 1.05, y, z + 0.36, m.slateRoof, groups.communities);
  }
  // Upper dark glass pavilion & warm-oak pergola crowning Çim Amfi
  box(13.5, 3.0, 4.0, amfiX, 4.9, amfiZ + 10.2, m.darkFrame, groups.communities);
  box(12.2, 2.2, 0.1, amfiX, 4.8, amfiZ + 8.15, m.glassRibbon, groups.communities);
  box(7.8, 0.18, 3.0, amfiX + 4.4, 6.0, amfiZ + 8.5, m.oak, groups.communities);

  // =========================================================================
  // 4. CLEAN ARCHITECTURAL BUILDINGS (RIBBON GLAZING + CRISP EDGE LINES)
  // =========================================================================
  function archBlock(x, z, w, d, h, facadeMat, trimMat, zoneKey, letter, hasColonnade = false) {
    const parent = groups[zoneKey] || groups.environment;
    if (hasColonnade) {
      box(w - 1.4, 2.6, d - 1.4, x, 1.5, z, m.darkFrame, parent);
      const nx = Math.max(2, Math.round(w / 5.5));
      for (let i = 0; i <= nx; i++) {
        const px = x - w / 2 + 0.5 + (i / nx) * (w - 1);
        box(0.55, 2.7, 0.55, px, 1.55, z - d / 2 + 0.35, m.colonnade, parent);
        box(0.55, 2.7, 0.55, px, 1.55, z + d / 2 - 0.35, m.colonnade, parent);
      }
      box(w, h - 2.7, d, x, 2.7 + (h - 2.7) / 2, z, facadeMat, parent, true);
    } else {
      box(w, h, d, x, h / 2 + 0.25, z, facadeMat, parent, true);
    }
    // Clean horizontal continuous window ribbon bands (zero visual chatter!)
    for (let y = (hasColonnade ? 4.2 : 2.3); y < h - 0.8; y += 2.35) {
      box(w + 0.08, 1.05, d - 1.2, x, y, z, m.glassRibbon, parent);
      box(w - 1.2, 1.05, d + 0.08, x, y, z, m.glassRibbon, parent);
    }
    // Crisp architectural roof parapet trim
    box(w + 0.28, 0.28, d + 0.28, x, h + 0.36, z, trimMat, parent);
    if (letter) roofBadge(letter, x, h + 0.5, z, '#0B1330', trimMat === m.tedRed ? '#E41513' : '#292E6F', 3.8);
  }

  // İncesu & Orta Bahçe Wing (A, B, K)
  archBlock(-26, -5.5, 6.8, 22, 10.6, m.limestone, m.tedBlue, 'teacher-plus', 'A', true);
  archBlock(1, 21.5, 50, 7.0, 10.6, m.limestone, m.tedBlue, 'teacher-plus', 'B', true);
  archBlock(30, 0, 8.6, 36, 8.2, m.archWhite, m.tedRed, 'red', 'K', false);

  // Yeni Kısım & Aksu Wing (E, D, F/G)
  archBlock(-51, -6.5, 8.4, 24, 8.0, m.archWhite, m.tedBlue, 'blue', 'E', false);
  // Warm-oak pergola along E Blok west terrace (TEDU360 signature)
  box(3.2, 0.16, 21, -56.8, 3.0, -6.5, m.oak, groups.blue);
  for (let zz = -15.5; zz <= 3.5; zz += 4.5) {
    box(0.2, 2.8, 0.2, -58.2, 1.6, zz, m.darkFrame, groups.blue);
  }

  archBlock(-91, 1, 7.0, 34, 9.6, m.coolGrey, m.tedBlue, 'tech', 'D', false);

  // F/G Blok: 4-story cool grey with recessed central loggia & crisp pitched slate hip roof
  archBlock(-71, -21, 32, 7.2, 9.2, m.coolGrey, m.slateRoof, 'environment', null, false);
  box(13, 5.6, 1.2, -71, 4.5, -17.5, m.darkFrame, groups.environment);
  const hipRoof = new THREE.ConeGeometry(15.2, 2.4, 4);
  hipRoof.scale(1.5, 1, 0.35);
  const hipMesh = mesh(hipRoof, m.slateRoof, -71, 10.6, -21, groups.environment);
  hipMesh.rotation.y = Math.PI / 4;
  roofBadge('F/G', -71, 11.8, -21, '#334155', '#64748B', 3.6);

  // Chillin Cafe sleek dark-glass pavilion
  box(5.6, 2.9, 9.6, -81.5, 1.7, -8.5, m.darkFrame, groups.plaza);
  box(0.08, 2.1, 8.2, -78.65, 1.6, -8.5, m.glassRibbon, groups.plaza);

  // =========================================================================
  // 5. DISCIPLINED ZIRVE PAVILIONS, GATES & COMMUNITY TENTS
  // =========================================================================
  cleanGate(-32.2, 8, 'GATE 1 · ANA GİRİŞ', 'gate-1', Math.PI / 2);
  cleanGate(-45.8, 8, 'GATE 2 · YENİ KISIM', 'gate-2', -Math.PI / 2);
  cleanGate(20, -22, 'GATE 3 · VIP', 'gate-3', 0);

  // İncesu Bulvarı Corporate Pavilions (4 neat clean units)
  cleanPavilion(5.5, -17.5, 4.2, 3.0, m.tedNavy, 'promenade');
  cleanPavilion(11.2, -17.5, 4.2, 3.0, m.tedBlue, 'promenade');
  cleanPavilion(16.9, -17.5, 4.2, 3.0, m.tedNavy, 'promenade');
  cleanPavilion(22.6, -17.5, 4.2, 3.0, m.tedRed, 'promenade');

  // Red Zone Stands along K Blok Foyer
  cleanPavilion(21.5, -6.5, 3.2, 4.6, m.tedRed, 'red');
  cleanPavilion(21.5, 0, 3.2, 4.6, m.tedRed, 'red');
  cleanPavilion(21.5, 6.5, 3.2, 4.6, m.tedRed, 'red');

  // Ahmet Ersan Main Stage outdoor canopy (SE K Blok)
  box(6.0, 0.55, 10.5, 20.5, 0.55, 14.0, m.tedNavy, groups.plenary);
  box(6.2, 0.24, 10.8, 20.5, 5.6, 14.0, m.tedNavy, groups.plenary);
  box(6.3, 0.12, 10.9, 20.5, 5.78, 14.0, m.tedRed, groups.plenary);

  // Blue Zone Stands & İstasyon TEDÜ Innovation Pavilions (E Blok terrace)
  cleanPavilion(-60.5, -12.8, 4.6, 3.2, m.tedBlue, 'blue');
  cleanPavilion(-66.5, -12.8, 4.6, 3.2, m.tedBlue, 'blue');
  cleanTent(-58.0, 2.2, 3.4, m.skyAccent, 'innovation');
  cleanTent(-58.0, 6.8, 3.4, m.tedNavy, 'innovation');

  // Student Communities Village (6 clean uniform pagoda tents framing Çim Amfi)
  for (const [tx, tz, isRed] of [
    [-82.5, 11.0, false], [-82.5, 15.6, true], [-82.5, 20.2, false],
    [-57.5, 12.2, false], [-57.5, 16.8, false], [-57.5, 21.4, false]
  ]) {
    cleanTent(tx, tz, 3.1, isRed ? m.tedRed : m.tedBlue, 'communities');
  }

  // Perimeter minimalist architectural trees (calm framing, zero visual clutter)
  for (const [tx, tz] of [
    [-25, -24], [8, -24], [27, -23], [27, 23], [-16, 14],
    [-95, -22], [-95, 22], [-80, -17], [-50, 22]
  ]) {
    cleanTree(tx, tz, 0.95);
  }

  // Merge static opaque geometry per zone for smooth 60fps rendering
  function optimize(group) {
    group.updateMatrixWorld(true);
    const batches = new Map();
    const toRemove = [];
    group.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      const key = o.material.uuid;
      const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
      if (!batches.has(key)) batches.set(key, { material: o.material, list: [] });
      batches.get(key).list.push(g);
      toRemove.push(o);
    });
    toRemove.forEach((o) => { o.parent.remove(o); o.geometry.dispose(); });
    for (const { material, list } of batches.values()) {
      const merged = mergeGeometries(list, false);
      if (merged) {
        const msh = new THREE.Mesh(merged, material);
        msh.castShadow = !material.transparent;
        msh.receiveShadow = true;
        msh.userData.zone = group.userData.zone;
        group.add(msh);
      }
      list.forEach((g) => g.dispose());
    }
  }

  Object.entries(groups).forEach(([k, g]) => {
    if (k !== 'glassLayer') optimize(g);
  });

  // =========================================================================
  // 6. SMART COLLISION-FREE LOD HOTSPOTS (PRIMARY AT OVERVIEW, ALL ON ZOOM)
  // =========================================================================
  const locations = {
    matchmaking: { target: [-11.5, 2, -17.5], pin: [-11.5, 7.6, -17.5], color: '#E41513', label: 'Fuaye · Meeting Point', badge: 'MP-01..24', category: 'matchmaking', camera: 'matchmaking', primary: true },
    red: { target: [23, 2, 0], pin: [26, 10.6, 0], color: '#E41513', label: 'Red Zone · K Blok', badge: '6 Şirket', category: 'company', camera: 'incesu', primary: true },
    blue: { target: [-54, 2, -7], pin: [-53, 10.6, -7], color: '#292E6F', label: 'Blue Zone · E Blok', badge: '6 Şirket', category: 'company', camera: 'aksu', primary: true },
    communities: { target: [-70, 3, 14], pin: [-70, 8.2, 14], color: '#D92D20', label: 'Çim Amfi · Topluluklar', badge: '8 Çadır', category: 'community', camera: 'aksu', primary: true },
    'gate-1': { target: [-32.2, 2, 8], pin: [-32.2, 7.2, 8], color: '#E41513', label: 'Gate 1 · Ana Giriş', badge: 'Akreditasyon', category: 'gates', camera: 'gates', primary: true },
    tech: { target: [-90, 2, 1], pin: [-90, 12.0, 1], color: '#1D4ED8', label: 'D Blok · Tech Amfi', badge: 'Sahne', category: 'stage', camera: 'aksu', primary: true },

    'gate-2': { target: [-45.8, 2, 8], pin: [-45.8, 7.2, 8], color: '#292E6F', label: 'Gate 2 · Yeni Kısım', badge: 'Metro', category: 'gates', camera: 'gates', primary: false },
    'gate-3': { target: [20, 2, -22], pin: [20, 7.0, -22], color: '#0B1330', label: 'Gate 3 · VIP', badge: 'Protokol', category: 'gates', camera: 'incesu', primary: false },
    promenade: { target: [14, 2, -17.5], pin: [14, 5.6, -17.5], color: '#B91C1C', label: 'Kurumsal Çadırlar', badge: '4 Pavilyon', category: 'company', camera: 'incesu', primary: false },
    innovation: { target: [-58, 2, 4.5], pin: [-58, 5.8, 4.5], color: '#0284C7', label: 'İstasyon TEDÜ', badge: '5 Dk Pitch', category: 'innovation', camera: 'aksu', primary: false },
    plenary: { target: [20.5, 2, 14], pin: [20.5, 8.0, 14], color: '#0B1330', label: 'Ahmet Ersan Salonu', badge: 'Ana Sahne', category: 'stage', camera: 'incesu', primary: false },
    'teacher-plus': { target: [0, 2, 21.5], pin: [0, 12.6, 21.5], color: '#292E6F', label: 'Teacher+ · A/B Blok', badge: 'Forum', category: 'stage', camera: 'incesu', primary: false },
    plaza: { target: [1, 1.5, 2], pin: [1, 4.4, 2], color: '#475569', label: 'Orta Bahçe', badge: 'Sosyal Avlu', category: 'lounge', camera: 'incesu', primary: false }
  };

  const pinsHost = document.getElementById('world-hotspots');
  let activeKey = 'matchmaking';
  let activeFilter = 'all';
  let activeCameraName = 'campus';

  for (const [key, loc] of Object.entries(locations)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'world-hotspot';
    btn.dataset.zone = key;
    btn.dataset.category = loc.category;
    btn.setAttribute('aria-pressed', String(key === activeKey));
    btn.style.setProperty('--pin-color', loc.color);
    btn.innerHTML = `<i></i><span>${loc.label}</span><em>${loc.badge}</em>`;
    btn.addEventListener('click', () => selectItem(key, true));
    if (pinsHost) pinsHost.appendChild(btn);
    loc.element = btn;
    loc.vector = V(...loc.pin);
  }

  // Clean pulsing selection ring on active zone
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.1, 2.55, 48),
    new THREE.MeshBasicMaterial({ color: '#E41513', side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-11.5, 0.45, -17.5);
  scene.add(ring);

  const views = {
    campus: { position: [-84, 88, -104], target: [-32, 0, 0] },
    matchmaking: { position: [-18, 26, -44], target: [-11.5, 1.6, -17.5] },
    incesu: { position: [-18, 54, -68], target: [6, 0, 0] },
    aksu: { position: [-108, 56, -54], target: [-68, 0, 2] },
    gates: { position: [-39, 36, -34], target: [-39, 1, 8] },
    aerial: { position: [-34, 152, -0.1], target: [-34, 0, 0] }
  };

  let transition = null;
  function setView(name, immediate = false) {
    const v = views[name];
    if (!v) return;
    activeCameraName = name;
    const target = V(...v.target);
    const scale = Math.max(1, 1.18 / Math.max(host.clientWidth / Math.max(host.clientHeight, 1), 0.48));
    const destination = V(...v.position).sub(target).multiplyScalar(scale).add(target);
    if (immediate || reducedMotion.matches) {
      camera.position.copy(destination);
      controls.target.copy(target);
      controls.update();
      transition = null;
    } else {
      transition = { from: camera.position.clone(), to: destination, startTarget: controls.target.clone(), target, start: performance.now() };
    }
    document.querySelectorAll('[data-camera]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.camera === name));
    });
  }

  function selectItem(key, fly = true) {
    if (!locations[key]) return;
    activeKey = key;
    const loc = locations[key];
    ring.position.set(loc.target[0], 0.45, loc.target[2]);
    ring.material.color.set(loc.color);
    for (const [k, l] of Object.entries(locations)) {
      if (l.element) l.element.setAttribute('aria-pressed', String(k === key));
    }
    if (fly) setView(loc.camera);
    document.dispatchEvent(new CustomEvent('summitted-map-picked', { detail: { key } }));
  }

  document.addEventListener('summitted-external-select', (ev) => {
    const { key, fly } = ev.detail || {};
    if (locations[key]) selectItem(key, Boolean(fly));
  });

  document.addEventListener('summitted-filter-changed', (ev) => {
    activeFilter = ev.detail?.filter || 'all';
    if (activeFilter !== 'all') {
      const firstMatch = Object.entries(locations).find(([, l]) => l.category === activeFilter);
      if (firstMatch) selectItem(firstMatch[0], true);
    } else {
      setView('campus');
    }
  });

  document.querySelectorAll('[data-camera]').forEach((b) => {
    b.addEventListener('click', () => setView(b.dataset.camera));
  });

  const zoomIn = document.getElementById('world-zoom-in');
  const zoomOut = document.getElementById('world-zoom-out');
  const resetBtn = document.getElementById('world-reset');
  function zoomBy(factor) {
    transition = null;
    const off = camera.position.clone().sub(controls.target);
    off.setLength(THREE.MathUtils.clamp(off.length() * factor, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(off);
    controls.update();
  }
  if (zoomIn) zoomIn.addEventListener('click', () => zoomBy(0.82));
  if (zoomOut) zoomOut.addEventListener('click', () => zoomBy(1.22));
  if (resetBtn) resetBtn.addEventListener('click', () => setView('campus'));

  // Raycast click on 3D buildings/zones
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downPos = null;
  const clickableGroups = Object.entries(groups).filter(([k]) => k !== 'environment').map(([, g]) => g);

  renderer.domElement.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downPos || Math.hypot(downPos.x - e.clientX, downPos.y - e.clientY) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(clickableGroups, true).find((h) => h.object.userData.zone || h.object.parent?.userData.zone);
    if (hit) selectItem(hit.object.userData.zone || hit.object.parent.userData.zone, true);
  });

  function resize() {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  new ResizeObserver(resize).observe(host);
  resize();
  setView('campus', true);

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { rootMargin: '200px' }).observe(host);

  const projected = new THREE.Vector3();
  function animate(time) {
    requestAnimationFrame(animate);
    if (!visible || document.hidden) return;
    if (transition) {
      const p = THREE.MathUtils.clamp((time - transition.start) / 760, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(transition.from, transition.to, ease);
      controls.target.lerpVectors(transition.startTarget, transition.target, ease);
      if (p === 1) transition = null;
    }
    controls.update();

    // Gentle pulse on active selection ring
    if (!reducedMotion.matches) {
      const s = 1 + Math.sin(time * 0.004) * 0.07;
      ring.scale.set(s, s, 1);
    }

    const camDist = camera.position.distanceTo(controls.target);
    const isOverview = activeFilter === 'all' && (camDist > 110 || activeCameraName === 'campus' || activeCameraName === 'aerial');
    const compact = host.clientWidth < 560;

    // Sort active pin first, then primaries, so higher-priority pins win collision avoidance
    const entries = Object.entries(locations).sort(([ka, a], [kb, b]) => {
      if (ka === activeKey) return -1;
      if (kb === activeKey) return 1;
      if (a.primary !== b.primary) return a.primary ? -1 : 1;
      return 0;
    });

    const placed = [];
    for (const [key, loc] of entries) {
      if (!loc.element) continue;
      const matchesFilter = activeFilter === 'all' || loc.category === activeFilter;
      const matchesLOD = key === activeKey || activeFilter !== 'all' || !isOverview || loc.primary;
      const matchesCompact = !compact || key === activeKey || activeFilter !== 'all' || loc.primary;

      projected.copy(loc.vector).project(camera);
      const x = (projected.x * 0.5 + 0.5) * host.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * host.clientHeight;
      const inBounds = projected.z < 1 && x > 24 && x < host.clientWidth - 24 && y > 54 && y < host.clientHeight - 54;

      if (!(matchesFilter && matchesLOD && matchesCompact && inBounds)) {
        loc.element.hidden = true;
        continue;
      }

      const halfW = Math.max(66, (loc.element.offsetWidth || 132) / 2);
      const px = THREE.MathUtils.clamp(x, halfW + 8, host.clientWidth - halfW - 8);
      const collides = key !== activeKey && placed.some((p) => Math.abs(px - p.x) < (halfW + p.hw - 8) && Math.abs(y - p.y) < 30);

      if (collides) {
        loc.element.hidden = true;
      } else {
        loc.element.hidden = false;
        loc.element.style.transform = `translate(-50%,-50%) translate(${px.toFixed(1)}px,${y.toFixed(1)}px)`;
        placed.push({ x: px, y, hw: halfW });
      }
    }

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
