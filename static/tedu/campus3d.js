/* ==========================================================================
   SummitTED Kariyer ve İnovasyon Zirvesi 2026 — TEDU360-Grounded 3D Campus (v5)
   Architectural landmarks verified from TED University's official 360 tour:
   - Orta Bahçe (South/East): Striped grey/charcoal stone pavers, 5 stone steps
     rising to the elevated rectangular green lawn & curved wood deck stage.
   - A & B Blok (L-shaped, 4-5 stories): Warm beige/cream ribbed facades with
     grey-stone ground-floor colonnade arcade & Ahmet Ersan Konferans Salonu.
   - Hoşgeldiniz Ana Giriş Atriyumu & Fuaye (K / A-B Bağlantı Fuayesi):
     Black-framed glass curtain walls, oak-inlay floor, glossy black columns
     with vertical TEDÜ blue LED strips, and Meeting Point (MP-01..24) tables!
   - Yeni Kısım Bahçe & Çim Amfi (North/West): Light-grey stone courtyard,
     square travertine tree planters wrapped in cantilevered wood benches,
     8-tier stepped travertine & grass Çim Amfi with dark-stone flanking stairs,
     Chillin Cafe dark-glass pavilion, 4-story cool-grey F/G Blok with recessed
     loggia & pitched roof, and white/glass vertical-louvered E Blok (Spor Mrk.
     & İstasyon TEDÜ) with warm-wood pergola colonnade.
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
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
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
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 560);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 20;
  controls.maxDistance = 260;
  controls.minPolarAngle = 0.16;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.rotateSpeed = 0.55;
  controls.enableZoom = false;

  scene.add(new THREE.HemisphereLight(0xf6f8fc, 0x8a95a6, 2.05));

  const sun = new THREE.DirectionalLight(0xfff4e6, 3.15);
  sun.position.set(-42, 72, -48);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -105;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 70;
  sun.shadow.camera.bottom = -70;
  sun.shadow.camera.far = 230;
  sun.shadow.normalBias = 0.04;
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xd5e3f7, 1.75);
  fill.position.set(34, 24, -22);
  scene.add(fill);

  const materials = new Map();
  function mat(color, metalness = 0, roughness = 0.62, extra = null) {
    const k = `${color}|${metalness}|${roughness}|${extra ? JSON.stringify(extra) : ''}`;
    if (!materials.has(k)) {
      materials.set(k, new THREE.MeshStandardMaterial(Object.assign({ color, metalness, roughness }, extra || {})));
    }
    return materials.get(k);
  }

  const m = {
    white: mat('#f9fafc'),
    tedNavy: mat('#0B1330', 0.22, 0.42),
    tedBlue: mat('#292E6F', 0.2, 0.4),
    tedRed: mat('#E41513', 0.15, 0.36),
    ledBlue: new THREE.MeshBasicMaterial({ color: 0x3b82f6 }),
    silver: mat('#cfd6e0', 0.68, 0.32),
    darkFrame: mat('#161c2a', 0.35, 0.42),
    stoneLight: mat('#d7dce4', 0.02, 0.78),
    stoneDark: mat('#5c6576', 0.04, 0.72),
    travertine: mat('#dfd3c0', 0.03, 0.72),
    beigeFacade: mat('#e6e0d4', 0.02, 0.74),
    coolGreyFacade: mat('#dde3eb', 0.04, 0.68),
    roofDark: mat('#3a4252', 0.15, 0.58),
    glass: mat('#6c8eab', 0.42, 0.18),
    glassAtrium: mat('#88b2d6', 0.28, 0.12, { transparent: true, opacity: 0.42 }),
    oakWood: mat('#bc8654', 0.06, 0.56),
    darkMarble: mat('#20222d', 0.22, 0.32),
    lawn: mat('#6f9b59', 0, 0.88),
    colonnadeStone: mat('#c3c7cf', 0.02, 0.75)
  };

  const zoneKeys = [
    'environment', 'screen', 'fuayeGlass',
    'gate-1', 'gate-2', 'gate-3',
    'red', 'blue', 'promenade', 'communities',
    'innovation', 'matchmaking', 'plenary', 'tech', 'teacher-plus', 'plaza'
  ];
  const groups = {};
  for (const key of zoneKeys) {
    groups[key] = new THREE.Group();
    groups[key].userData.zone = (key === 'environment')
      ? null
      : (key === 'screen' ? 'plenary' : (key === 'fuayeGlass' ? 'matchmaking' : key));
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
  function box(w, h, d, x, y, z, material, parent) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z, parent);
  }
  function cyl(r1, r2, h, x, y, z, material, parent, seg = 12) {
    return mesh(new THREE.CylinderGeometry(r1, r2, h, seg), material, x, y, z, parent);
  }
  function cone(r, h, x, y, z, material, parent, seg = 4) {
    const o = mesh(new THREE.ConeGeometry(r, h, seg), material, x, y, z, parent);
    o.rotation.y = Math.PI / 4;
    return o;
  }
  function beam(a, b, r, material, parent) {
    const delta = b.clone().sub(a);
    const o = mesh(new THREE.CylinderGeometry(r, r, delta.length(), 8), material, 0, 0, 0, parent);
    o.position.copy(a).add(b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(V(0, 1, 0), delta.normalize());
    return o;
  }

  function canvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    draw(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    return { canvas, ctx, texture };
  }

  function signTexture(text, bg = '#0B1330', fg = '#ffffff', sub = '', topStripe = '#E41513') {
    return canvasTexture(1024, 256, (c, w, h) => {
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);
      c.fillStyle = topStripe;
      c.fillRect(0, 0, w, 18);
      c.textAlign = 'center';
      c.fillStyle = fg;
      c.font = '800 62px Arial';
      c.fillText(text, w / 2, sub ? 124 : 152);
      if (sub) {
        c.fillStyle = '#CFD8EC';
        c.font = '700 30px Arial';
        c.fillText(sub, w / 2, 194);
      }
    }).texture;
  }

  function sign(text, x, y, z, w, h, parent, bg, fg, sub) {
    const material = new THREE.MeshBasicMaterial({ map: signTexture(text, bg, fg, sub), toneMapped: false });
    return mesh(new THREE.PlaneGeometry(w, h), material, x, y, z, parent);
  }

  function buildingLabel(name, sub, x, y, z, accent) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: signTexture(name, '#0B1330', '#ffffff', sub, accent),
      depthTest: false,
      toneMapped: false
    }));
    sp.position.set(x, y, z);
    sp.scale.set(11.2, 2.45, 1);
    sp.renderOrder = 6;
    scene.add(sp);
  }

  // Helper: Pagoda Tent
  function pagodaTent(x, z, size, roofColor, fasciaText, zoneKey, rotY = 0, baseY = 0) {
    const g = new THREE.Group();
    const half = size * 0.46;
    box(size, 0.14, size, 0, 0.18, 0, mat('#dfe4ee'), g);
    for (const dx of [-half, half]) {
      for (const dz of [-half, half]) {
        beam(V(dx, 0.22, dz), V(dx, 2.7, dz), 0.045, m.silver, g);
      }
    }
    box(size + 0.14, 0.34, size + 0.14, 0, 2.8, 0, mat(roofColor), g);
    cone(size * 0.76, 1.3, 0, 3.62, 0, m.white, g, 4);
    box(size * 0.6, 0.82, 0.52, 0, 0.66, half * 0.55, m.white, g);
    box(size * 0.64, 0.08, 0.6, 0, 1.1, half * 0.55, mat(roofColor), g);
    if (fasciaText) {
      const s = sign(fasciaText, 0, 2.82, size * 0.5 + 0.09, size * 0.92, 0.32, g, roofColor, '#ffffff');
      s.renderOrder = 2;
    }
    g.position.set(x, baseY, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // Helper: Entrance Gate Arch + Accreditation Canopy
  function accreditationGate(x, z, labelText, subText, zoneKey, rotY = 0) {
    const g = new THREE.Group();
    box(0.8, 5.0, 0.8, -3.6, 2.6, 0, m.tedNavy, g);
    box(0.8, 5.0, 0.8, 3.6, 2.6, 0, m.tedNavy, g);
    box(8.2, 1.05, 1.0, 0, 5.25, 0, m.tedNavy, g);
    box(8.3, 0.2, 1.06, 0, 5.86, 0, m.tedRed, g);
    sign(labelText, 0, 5.25, 0.54, 7.2, 0.84, g, '#0B1330', '#ffffff', subText);
    const back = sign(labelText, 0, 5.25, -0.54, 7.2, 0.84, g, '#0B1330', '#ffffff', subText);
    back.rotation.y = Math.PI;
    pagodaTent(0, -3.2, 3.6, '#E41513', 'AKREDİTASYON & QR', zoneKey, 0);
    for (const tx of [-1.5, 0, 1.5]) {
      box(0.2, 0.92, 0.86, tx, 0.58, 0, m.silver, g);
      box(0.22, 0.08, 0.88, tx, 1.06, 0, m.tedRed, g);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // Helper: Corporate Stand Booth
  function booth(x, z, color, label, zoneKey, rotY = 0) {
    const g = new THREE.Group();
    box(4.1, 0.16, 3.0, 0, 0.24, 0, mat('#e4e8f0'), g);
    box(3.85, 2.6, 0.14, 0, 1.65, -1.25, m.white, g);
    for (const dx of [-1.85, 1.85]) {
      for (const dz of [-1.25, 1.25]) {
        beam(V(dx, 0.35, dz), V(dx, 3.25, dz), 0.042, m.silver, g);
      }
    }
    box(4.1, 0.32, 3.0, 0, 3.3, 0, mat(color), g);
    sign(label, 0, 3.3, 1.54, 3.7, 0.36, g, color, '#ffffff');
    box(3.0, 0.86, 0.62, 0, 0.78, 0.85, m.white, g);
    box(3.15, 0.08, 0.74, 0, 1.24, 0.85, mat(color), g);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // Helper: Square Travertine Planter with Cantilevered Warm-Wood Bench (TEDU360 Yeni Kısım signature!)
  function travertineBenchPlanter(x, z, parent = groups.plaza) {
    box(2.3, 1.05, 2.3, x, 0.65, z, m.travertine, parent);
    box(3.55, 0.14, 3.55, x, 0.56, z, m.oakWood, parent);
    cyl(0.14, 0.18, 2.2, x, 2.1, z, m.oakWood, parent, 8);
    mesh(new THREE.IcosahedronGeometry(1.15, 1), mat('#628f55'), x, 3.5, z, parent);
  }

  // =========================================================================
  // 1. İNCESU / ORTA BAHÇE CAMPUS (EAST OF ZİYA GÖKALP CADDESİ)
  // =========================================================================
  box(70, 1.1, 56, 0, -0.5, 0, mat('#c5cdd9'));
  box(68, 0.16, 54, 0, 0.08, 0, m.stoneLight);

  // TEDU360 Orta Bahçe Signature: Striped light-grey & charcoal rectangular stone pavers!
  for (let s = -22; s <= 18; s += 4.6) {
    box(48, 0.03, 1.5, -2, 0.18, s, m.stoneDark, groups.environment);
  }

  // TEDU360 Orta Bahçe Signature: 5 wide stone steps rising to elevated rectangular green lawn + curved wood deck!
  const lawnCenterX = 0;
  const lawnCenterZ = 1.5;
  box(26, 0.9, 19, lawnCenterX, 0.52, lawnCenterZ, m.stoneLight, groups.environment); // Retaining wall
  box(24.6, 0.18, 17.6, lawnCenterX, 1.02, lawnCenterZ, m.lawn, groups.environment);   // Elevated green grass
  for (let step = 0; step < 5; step++) {
    box(1.1, 0.18 + step * 0.16, 12, lawnCenterX - 13.4 - (4 - step) * 0.55, 0.18 + step * 0.08, lawnCenterZ, m.stoneLight, groups.environment);
  }
  // Curved warm-wood stage deck on Orta Bahçe elevated lawn
  cyl(4.4, 4.4, 0.24, lawnCenterX + 5.5, 1.16, lawnCenterZ, m.oakWood, groups.plaza, 24);
  // Low bollard lights around elevated lawn
  for (const [bx, bz] of [[-12, -7.5], [-12, 10.5], [12, -7.5], [12, 10.5]]) {
    box(0.28, 1.15, 0.28, bx, 1.5, bz, m.darkFrame, groups.environment);
  }

  // =========================================================================
  // 2. ZİYA GÖKALP CADDESİ (DIVIDING İNCESU & YENİ KISIM / AKSU)
  // =========================================================================
  box(11.6, 0.09, 82, -39, 0.03, 2, mat('#636d7f'));
  box(1.5, 0.18, 82, -32.6, 0.13, 2, m.stoneLight);
  box(1.5, 0.18, 82, -45.4, 0.13, 2, m.stoneLight);
  // Black wrought-iron perimeter fence posts along Ziya Gökalp Cad. (TEDU360 detail)
  for (let z = -25; z <= 25; z += 4) {
    if (z > 2 && z < 14) continue; // Gate 1 opening
    box(0.22, 1.6, 0.22, -33.2, 0.9, z, m.darkFrame, groups.environment);
    box(0.12, 0.1, 4.0, -33.2, 1.55, z, m.darkFrame, groups.environment);
  }
  // Pedestrian crosswalk
  for (let x = -43.8; x < -34; x += 1.15) {
    box(0.68, 0.025, 4.6, x, 0.1, 8, m.white);
  }
  box(10, 0.03, 0.45, -39, 0.11, 5.3, m.tedRed);
  box(10, 0.03, 0.45, -39, 0.11, 10.7, m.tedRed);
  const roadSign = sign('ZİYA GÖKALP CADDESİ · YAYA GEÇİŞ AKSI', -39, 0.14, -7, 24, 2.0, groups.environment, '#0B1330', '#ffffff');
  roadSign.rotation.x = -Math.PI / 2;
  roadSign.rotation.z = Math.PI / 2;

  // =========================================================================
  // 3. YENİ KISIM BAHÇE & AKSU WING (WEST OF ZİYA GÖKALP CADDESİ)
  // =========================================================================
  box(52, 1.1, 56, -72, -0.5, 0, mat('#c5cdd9'));
  box(50, 0.15, 54, -72, 0.08, 0, m.stoneLight);

  // TEDU360 Yeni Kısım Signature: Square travertine tree planters wrapped by cantilevered wood benches
  travertineBenchPlanter(-64, -4.5);
  travertineBenchPlanter(-73, -4.5);
  travertineBenchPlanter(-68.5, 4.2);

  // TEDU360 REAL ÇİM AMFİ: Wide stepped amphitheater of alternating travertine stone & grass terraces!
  const amfiBaseX = -69;
  const amfiBaseZ = 10.5;
  for (let t = 0; t < 7; t++) {
    const y = 0.24 + t * 0.48;
    const z = amfiBaseZ + t * 1.15;
    const w = 22 - t * 0.4;
    // Travertine stone seating riser
    box(w, 0.46, 0.42, amfiBaseX, y, z, m.travertine, groups.communities);
    // Alternating green grass terrace behind riser
    box(w, 0.42, 0.76, amfiBaseX, y - 0.02, z + 0.56, m.lawn, groups.communities);
    // Dark-stone flanking stairs on both sides
    box(1.9, 0.48, 1.16, amfiBaseX - w / 2 - 1.1, y, z + 0.36, m.stoneDark, groups.communities);
    box(1.9, 0.48, 1.16, amfiBaseX + w / 2 + 1.1, y, z + 0.36, m.stoneDark, groups.communities);
  }
  // Upper dark-glass pavilion & warm-wood pergola crowning Çim Amfi (seen directly in TEDU360 step_27!)
  box(14, 3.2, 4.2, amfiBaseX, 5.0, amfiBaseZ + 10.2, m.darkFrame, groups.communities);
  box(12.6, 2.3, 0.14, amfiBaseX, 4.9, amfiBaseZ + 8.05, m.glass, groups.communities);
  box(8.5, 0.22, 3.2, amfiBaseX + 4.8, 6.2, amfiBaseZ + 8.4, m.oakWood, groups.communities);

  // =========================================================================
  // 4. REAL TEDÜ BUILDINGS (GROUNDED IN TEDU360 FACADES & MATERIALS)
  // =========================================================================
  function tedBeigeColonnadeBuilding(name, sub, x, z, w, d, h, accent, zoneKey) {
    const parent = groups[zoneKey] || groups.environment;
    // Ground-floor grey stone colonnade arcade (h=2.8)
    box(w - 1.2, 2.8, d - 1.2, x, 1.5, z, m.darkFrame, parent);
    const colsX = Math.max(2, Math.round(w / 4.5));
    const colsZ = Math.max(2, Math.round(d / 4.5));
    for (let i = 0; i <= colsX; i++) {
      const px = x - w / 2 + 0.5 + (i / colsX) * (w - 1);
      box(0.68, 2.9, 0.68, px, 1.55, z - d / 2 + 0.4, m.colonnadeStone, parent);
      box(0.68, 2.9, 0.68, px, 1.55, z + d / 2 - 0.4, m.colonnadeStone, parent);
    }
    for (let j = 1; j < colsZ; j++) {
      const pz = z - d / 2 + 0.5 + (j / colsZ) * (d - 1);
      box(0.68, 2.9, 0.68, x - w / 2 + 0.4, 1.55, pz, m.colonnadeStone, parent);
      box(0.68, 2.9, 0.68, x + w / 2 - 0.4, 1.55, pz, m.colonnadeStone, parent);
    }
    // Upper 4 stories: Warm beige/cream ribbed facade
    const upperH = h - 2.9;
    box(w, upperH, d, x, 2.9 + upperH / 2, z, m.beigeFacade, parent);
    box(w + 0.3, 0.34, d + 0.3, x, h + 0.25, z, mat(accent), parent);
    // Horizontal ribbed spandrel bands + tall multi-pane windows
    for (let y = 4.2; y < h - 0.5; y += 2.2) {
      box(w + 0.16, 0.22, d + 0.16, x, y - 0.9, z, m.travertine, parent);
      for (let xx = x - w / 2 + 1.4; xx < x + w / 2 - 1.0; xx += 2.6) {
        for (const side of [-1, 1]) {
          box(1.55, 1.35, 0.08, xx, y, z + side * (d / 2 + 0.05), m.glass, parent);
        }
      }
      for (let zz = z - d / 2 + 1.4; zz < z + d / 2 - 1.0; zz += 2.6) {
        for (const side of [-1, 1]) {
          box(0.08, 1.35, 1.55, x + side * (w / 2 + 0.05), y, zz, m.glass, parent);
        }
      }
    }
    buildingLabel(name, sub, x, h + 2.8, z, accent);
  }

  // A Blok & B Blok (Warm beige L-wing with ground colonnade around Orta Bahçe)
  tedBeigeColonnadeBuilding('A BLOK · TEACHER+', 'EĞİTİM KONFERANSLARI & AMFİLER', -26.5, -5.5, 7.2, 24, 11.4, '#292E6F', 'teacher-plus');
  tedBeigeColonnadeBuilding('B BLOK · COFFEE BREAK & TEACHER+', 'REVAKLI AKADEMİK KANAT', 0, 21.5, 52, 7.4, 11.4, '#292E6F', 'teacher-plus');

  // K Blok Kültür Merkezi & Ahmet Ersan Konferans Salonu (East wing of İncesu)
  box(9.2, 8.2, 34, 29, 4.2, 1, m.white, groups.red);
  box(9.6, 0.36, 34.4, 29, 8.45, 1, m.tedRed, groups.red);
  // Modern vertical architectural fins on K Blok facade
  for (let zz = -14; zz <= 16; zz += 2.1) {
    box(0.28, 7.6, 0.18, 24.3, 4.1, zz, m.silver, groups.red);
    box(0.08, 5.6, 1.5, 24.45, 4.2, zz + 0.9, m.glass, groups.red);
  }
  buildingLabel('K BLOK · RED ZONE & AHMET ERSAN', 'KURUMSAL FUAYE & ANA KONFERANS SALONU', 29, 11.2, 1, '#E41513');

  // =========================================================================
  // 5. HOŞGELDİNİZ ANA GİRİŞ ATRİYUMU & FUAYE MEETING POINT (MP-01..24!)
  // Directly inspired by TEDU360 final_step_168.png (black-framed glass hall,
  // warm oak wood-inlay center floor, dark marble border, glossy black pillars
  // with vertical blue LED strips, and numbered Meeting Point tables!)
  // =========================================================================
  const fX = -12.5;
  const fZ = -17.5;
  const fW = 24;
  const fD = 10.8;
  // Dark veined marble perimeter floor + central honey-oak wood-inlay aisle
  box(fW, 0.22, fD, fX, 0.22, fZ, m.darkMarble, groups.matchmaking);
  box(fW - 5.0, 0.26, 4.2, fX, 0.25, fZ, m.oakWood, groups.matchmaking);
  // Glossy black structural pillars with vertical glowing TEDÜ blue LED strips
  for (const px of [fX - 7.5, fX - 2.5, fX + 2.5, fX + 7.5]) {
    for (const pz of [fZ - 3.6, fZ + 3.6]) {
      box(0.75, 4.8, 0.75, px, 2.6, pz, m.darkFrame, groups.matchmaking);
      box(0.12, 4.6, 0.12, px, 2.6, pz + (pz < fZ ? 0.39 : -0.39), m.ledBlue, groups.matchmaking);
    }
  }
  // Architectural perimeter roof frame + central glass skylight (so Fuaye oak floor, blue-LED columns & MP tables stay visible from above!)
  const beamT = 1.25;
  box(fW + 0.4, 0.42, beamT, fX, 5.1, fZ - fD / 2 + beamT / 2, m.darkFrame, groups.matchmaking);
  box(fW + 0.4, 0.42, beamT, fX, 5.1, fZ + fD / 2 - beamT / 2, m.darkFrame, groups.matchmaking);
  box(beamT, 0.42, fD, fX - fW / 2 + beamT / 2, 5.1, fZ, m.darkFrame, groups.matchmaking);
  box(beamT, 0.42, fD, fX + fW / 2 - beamT / 2, 5.1, fZ, m.darkFrame, groups.matchmaking);
  // Crisp TED Red perimeter cornice trim around roof edge (not a solid red slab!)
  box(fW + 0.5, 0.16, 0.34, fX, 5.38, fZ - fD / 2 + 0.1, m.tedRed, groups.matchmaking);
  box(fW + 0.5, 0.16, 0.34, fX, 5.38, fZ + fD / 2 - 0.1, m.tedRed, groups.matchmaking);
  box(0.34, 0.16, fD + 0.5, fX - fW / 2 + 0.1, 5.38, fZ, m.tedRed, groups.matchmaking);
  box(0.34, 0.16, fD + 0.5, fX + fW / 2 - 0.1, 5.38, fZ, m.tedRed, groups.matchmaking);
  // Transparent black-framed glass curtain walls & skylight canopy
  box(fW, 4.6, 0.1, fX, 2.6, fZ + fD / 2, m.glassAtrium, groups.fuayeGlass);
  box(fW, 4.6, 0.1, fX, 2.6, fZ - fD / 2, m.glassAtrium, groups.fuayeGlass);
  box(fW - beamT * 2, 0.08, fD - beamT * 2, fX, 5.12, fZ, m.glassAtrium, groups.fuayeGlass);
  // Suspended chrome TEDÜ Torch emblem sphere at Fuaye center
  mesh(new THREE.TorusGeometry(1.15, 0.08, 10, 28), m.silver, fX, 3.2, fZ, groups.matchmaking);
  // Fuaye Meeting Point Sign
  sign('FUAYE · MEETING POINT (MP-01 .. MP-24 · 5 DK EŞLEŞME)', fX, 5.95, fZ + fD / 2 + 0.12, 18, 1.28, groups.matchmaking, '#0B1330', '#ffffff');
  // 16 visible architectural Meeting Point tables arranged neatly inside the Fuaye gallery
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 8; col++) {
      const mx = fX - 9.4 + col * 2.68;
      const mz = fZ + (row === 0 ? -2.2 : 2.2);
      box(0.95, 0.09, 0.95, mx, 1.05, mz, m.tedNavy, groups.matchmaking);
      box(0.12, 0.85, 0.12, mx, 0.62, mz, m.silver, groups.matchmaking);
      box(0.38, 0.3, 0.07, mx, 1.28, mz, col >= 6 ? m.tedBlue : m.tedRed, groups.matchmaking);
    }
  }

  // =========================================================================
  // 6. YENİ KISIM BUILDINGS (GROUNDED IN TEDU360 step_25.png)
  // =========================================================================
  // F / G Blok (North-West): Symmetrical 4-story cool pale-grey building with recessed loggia & pitched dark roof
  box(34, 9.6, 7.6, -71, 5.0, -21, m.coolGreyFacade, groups.environment);
  // Recessed central 3-story loggia balconies
  box(14, 6.2, 1.4, -71, 4.6, -17.3, m.stoneDark, groups.environment);
  for (let ly = 2.6; ly <= 7.0; ly += 2.1) {
    box(14.2, 0.35, 1.5, -71, ly, -17.1, m.white, groups.environment);
  }
  // Pitched dark-grey hip roof
  const roofGeo = new THREE.ConeGeometry(16, 2.8, 4);
  roofGeo.scale(1.55, 1, 0.36);
  const roofMesh = mesh(roofGeo, m.roofDark, -71, 11.2, -21, groups.environment);
  roofMesh.rotation.y = Math.PI / 4;
  buildingLabel('F / G BLOK · VAKA & DERSLİKLER', 'U DÜZEN MÜLAKAT & DEĞERLENDİRME ODALARI', -71, 14.0, -21, '#64748B');

  // E Blok (East of Yeni Kısım): Contemporary white & dark-glass facade with vertical metal louvers + wood pergola
  box(8.8, 8.2, 24, -50.5, 4.3, -6, m.white, groups.blue);
  box(9.2, 0.34, 24.4, -50.5, 8.55, -6, m.tedBlue, groups.blue);
  // Vertical metal louver fins + dark glass curtain wall
  for (let zz = -16.5; zz <= 4.5; zz += 1.6) {
    box(0.32, 7.2, 0.14, -55.0, 4.3, zz, m.darkFrame, groups.blue);
    box(0.08, 6.4, 1.2, -54.85, 4.3, zz + 0.75, m.glass, groups.blue);
  }
  // Warm-wood ground-floor pergola colonnade (seen in TEDU360 step_25!)
  box(3.4, 0.2, 22, -56.6, 3.1, -6, m.oakWood, groups.blue);
  for (let zz = -16; zz <= 4; zz += 4) {
    box(0.24, 3.0, 0.24, -58.1, 1.6, zz, m.darkFrame, groups.blue);
  }
  buildingLabel('E BLOK · BLUE ZONE & İSTASYON TEDÜ', 'SPOR MERKEZİ STANTLARI & STARTUP ALLEY', -50.5, 11.4, -6, '#292E6F');

  // D Blok (West flank of Yeni Kısım: Tech & Innovation Amfi + Çok Amaçlı Salon)
  box(7.2, 10.0, 34, -90, 5.2, 1, m.coolGreyFacade, groups.tech);
  box(7.6, 0.36, 34.4, -90, 10.35, 1, mat('#1D4ED8'), groups.tech);
  for (let y = 2.4; y < 9.5; y += 2.3) {
    for (let zz = -14; zz <= 16; zz += 2.8) {
      box(0.08, 1.4, 1.8, -86.3, y, zz, m.glass, groups.tech);
    }
  }
  buildingLabel('D BLOK · TECH & INNOVATION', 'KONFERANS AMFİSİ & ÇOK AMAÇLI SALON', -90, 13.0, 1, '#1D4ED8');

  // Chillin Cafe & TEDÜ Dükkan dark charcoal glass pavilion (TEDU360 step_25 left edge!)
  box(6.4, 3.1, 10.5, -81.5, 1.7, -8.5, m.darkFrame, groups.plaza);
  box(0.1, 2.3, 8.8, -78.25, 1.6, -8.5, m.glass, groups.plaza);
  sign('CHILLIN CAFE & TEDÜ DÜKKAN', -78.2, 3.0, -8.5, 6.2, 0.42, groups.plaza, '#161c2a', '#ffffff').rotation.y = Math.PI / 2;

  // =========================================================================
  // 7. THREE ENTRANCE & ACCREDITATION GATES (TENTS + ARCHWAYS)
  // =========================================================================
  accreditationGate(-32.2, 8, 'GATE 1 · ANA GİRİŞ & FUAYE', 'AKREDİTASYON & MEETING POINT ERİŞİMİ', 'gate-1', Math.PI / 2);
  accreditationGate(-45.8, 8, 'GATE 2 · YENİ KISIM / METRO', 'HIZLI QR GEÇİŞ & ÇİM AMFİ', 'gate-2', -Math.PI / 2);
  accreditationGate(20, -21, 'GATE 3 · VIP & KURUMSAL', 'KONUŞMACI & İK HEYETİ GİRİŞİ', 'gate-3', 0);

  // =========================================================================
  // 8. CORPORATE STANDS, PAVILIONS, COMMUNITIES & PLENARY SCREEN
  // =========================================================================
  // İncesu Bulvarı Corporate Pavilions (East of Fuaye along north walk)
  booth(4.5, -17.5, '#0B1330', 'GARANTİ BBVA TECH', 'promenade');
  booth(10.0, -17.5, '#292E6F', 'TURKCELL AI HOUSE', 'promenade');
  booth(15.5, -17.5, '#0B1330', 'HAVELSAN SİBER', 'promenade');
  booth(21.0, -12.5, '#E41513', 'MİGROS UP LOUNGE', 'promenade', -Math.PI / 2);

  // Red Zone Stands (K Blok Foyer Front)
  booth(20.5, -6.5, '#E41513', 'AKFEN · DENİZBANK', 'red', -Math.PI / 2);
  booth(20.5, -0.5, '#E41513', 'EY · COCA-COLA', 'red', -Math.PI / 2);
  booth(20.5, 5.5, '#E41513', 'KPMG · ANADOLU EFES', 'red', -Math.PI / 2);

  // Ahmet Ersan Plenary Stage Outdoor Canopy & LED Display
  box(6.6, 0.85, 11.5, 18.5, 0.58, 13.5, m.tedNavy, groups.plenary);
  box(7.0, 0.3, 12.2, 18.5, 6.8, 13.5, m.tedNavy, groups.plenary);
  box(7.1, 0.14, 12.3, 18.5, 7.0, 13.5, m.tedRed, groups.plenary);

  const screen = canvasTexture(1024, 512, () => {});
  const ledPlane = mesh(new THREE.PlaneGeometry(10.2, 4.6), new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false }), 21.6, 4.0, 13.5, groups.screen);
  ledPlane.rotation.y = -Math.PI / 2;

  const logoImg = new Image();
  logoImg.src = './assets/submitted-logo-ted-white.svg';
  let logoReady = false;
  logoImg.onload = () => { logoReady = true; drawLED(); };

  function drawLED() {
    const c = screen.ctx;
    c.fillStyle = '#0B1330';
    c.fillRect(0, 0, 1024, 512);
    c.fillStyle = '#E41513';
    c.fillRect(0, 0, 1024, 16);
    c.fillRect(0, 496, 1024, 16);
    if (logoReady) {
      c.drawImage(logoImg, 212, 86, 600, 146);
    } else {
      c.fillStyle = '#ffffff';
      c.textAlign = 'center';
      c.font = '800 66px Arial';
      c.fillText('SummitTED 2026', 512, 185);
    }
    c.textAlign = 'center';
    c.fillStyle = '#FFFFFF';
    c.font = '700 28px Arial';
    c.fillText('KARİYER VE İNOVASYON ZİRVESİ · 20–21 EKİM 2026', 512, 308);
    c.fillStyle = '#FF8A88';
    c.font = '700 23px Arial';
    c.fillText('FUAYE MEETING POINT (MP-01..24) · 10 ZONE · 3 GİRİŞ ÇADIRI', 512, 372);
    screen.texture.needsUpdate = true;
  }
  drawLED();

  // Blue Zone Stands & İstasyon TEDÜ Pitch Tents (near E Blok)
  booth(-59.5, -13.0, '#292E6F', 'ASELSAN · TUSAŞ', 'blue', 0);
  booth(-65.5, -13.0, '#292E6F', 'MİLSOFT · ROKETSAN', 'blue', 0);
  pagodaTent(-57.0, 2.5, 3.6, '#0284C7', 'İSTASYON TEDÜ PITCH', 'innovation', 0);
  pagodaTent(-57.0, 7.2, 3.3, '#0B1330', 'STARTUP & VC ALLEY', 'innovation', 0);

  // Student Communities Village framing Çim Amfi & Orta Bahçe
  const commTents = [
    ['KARİYER ÖNCÜLERİ', -81.0, 10.5],
    ['RADIOTEDU LIVE', -81.0, 15.2],
    ['IEEE TEDÜ', -81.0, 19.8],
    ['TEDU ERU', -57.0, 14.5],
    ['GİRİŞİMCİLİK', -57.0, 19.2],
    ['VERİ BİLİMİ & AI', -17.5, -5.0],
    ['MİMARLIK & TASARIM', -17.5, 1.5],
    ['ENDÜSTRİ & VAKA', -17.5, 8.0]
  ];
  for (const [lbl, tx, tz] of commTents) {
    pagodaTent(tx, tz, 3.2, lbl.includes('RADIOTEDU') ? '#E41513' : '#292E6F', lbl, 'communities', 0);
  }

  // Orta Bahçe Hospitality Coffee Tents
  pagodaTent(-9.0, 14.5, 3.4, '#0B1330', 'COFFEE BREAK LOUNGE', 'plaza', 0);
  pagodaTent(-4.0, 14.5, 3.4, '#475569', 'NETWORKING İKRAM', 'plaza', 0);

  // Trees
  function tree(x, z, s = 1) {
    cyl(0.15, 0.21, 2.0 * s, x, 1.2 * s, z, m.oakWood, groups.environment);
    mesh(new THREE.IcosahedronGeometry(1.25 * s, 1), mat('#64925c'), x, 2.8 * s, z, groups.environment);
  }
  for (const [tx, tz] of [[-25, -24], [10, -24], [25, -22], [25, 22], [-92, -22], [-92, 22], [-77, -16]]) {
    tree(tx, tz, 0.9);
  }

  // Instanced Summit Crowd
  let seed = 41;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const crowd = [];
  for (let i = 0; i < 180; i++) {
    const inNew = i >= 95;
    crowd.push({
      x: inNew ? (-84 + rnd() * 28) : (-22 + rnd() * 40),
      z: inNew ? (-14 + rnd() * 22) : (-16 + rnd() * 28),
      h: 0.8 + rnd() * 0.2,
      c: i % 4
    });
  }
  const outfitColors = ['#0B1330', '#292E6F', '#E41513', '#475569'];
  const dummy = new THREE.Object3D();
  outfitColors.forEach((hex, idx) => {
    const sub = crowd.filter((p) => p.c === idx);
    const inst = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.14, 0.35, 3, 6), mat(hex), sub.length);
    sub.forEach((p, i) => {
      dummy.position.set(p.x, 0.82 * p.h + 0.2, p.z);
      dummy.scale.set(1, p.h, 1);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    });
    scene.add(inst);
  });

  // Optimize static zone meshes
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
    if (k !== 'screen' && k !== 'fuayeGlass') optimize(g);
  });

  const locations = {
    'gate-1': { target: [-32, 2, 8], pin: [-32, 8.0, 8], color: '#E41513', label: 'Gate 1 · Ana Giriş', category: 'gates', camera: 'gates' },
    'gate-2': { target: [-46, 2, 8], pin: [-46, 8.0, 8], color: '#292E6F', label: 'Gate 2 · Yeni Kısım', category: 'gates', camera: 'gates' },
    'gate-3': { target: [20, 2, -21], pin: [20, 7.8, -21], color: '#0B1330', label: 'Gate 3 · VIP Giriş', category: 'gates', camera: 'incesu' },
    matchmaking: { target: [-12.5, 2, -17.5], pin: [-12.5, 8.8, -17.5], color: '#E41513', label: 'Fuaye · Meeting Point', category: 'matchmaking', camera: 'matchmaking' },
    red: { target: [21, 2, 0], pin: [25, 10.6, 0], color: '#E41513', label: 'Red Zone · K Blok Fuaye', category: 'company', camera: 'incesu' },
    promenade: { target: [10, 2, -17], pin: [10, 6.8, -17], color: '#B91C1C', label: 'Kurumsal Çadırlar', category: 'company', camera: 'incesu' },
    plenary: { target: [19, 2, 13], pin: [19, 9.6, 13], color: '#0B1330', label: 'Ana Sahne · Ahmet Ersan', category: 'stage', camera: 'incesu' },
    'teacher-plus': { target: [-12, 2, 20], pin: [-8, 12.6, 21], color: '#292E6F', label: 'Teacher+ · A/B Blok', category: 'stage', camera: 'incesu' },
    plaza: { target: [0, 1.5, 2], pin: [0, 5.2, 2], color: '#475569', label: 'Orta Bahçe & Avlu', category: 'lounge', camera: 'incesu' },
    blue: { target: [-53, 2, -8], pin: [-51, 11.2, -8], color: '#292E6F', label: 'Blue Zone · E Blok', category: 'company', camera: 'aksu' },
    innovation: { target: [-57, 2, 5], pin: [-57, 6.6, 5], color: '#0284C7', label: 'Innovation Alley · İstasyon', category: 'innovation', camera: 'aksu' },
    communities: { target: [-69, 3, 14], pin: [-69, 8.6, 14], color: '#D92D20', label: 'Topluluklar Köyü · Çim Amfi', category: 'community', camera: 'aksu' },
    tech: { target: [-88, 2, 1], pin: [-88, 12.6, 1], color: '#1D4ED8', label: 'Tech & Innovation · D Blok', category: 'stage', camera: 'aksu' }
  };

  const pinsHost = document.getElementById('world-hotspots');
  let activeKey = 'matchmaking';
  let activeFilter = 'all';

  for (const [key, loc] of Object.entries(locations)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'world-hotspot';
    btn.dataset.zone = key;
    btn.dataset.category = loc.category;
    btn.setAttribute('aria-pressed', String(key === activeKey));
    btn.style.setProperty('--pin-color', loc.color);
    btn.innerHTML = `<i></i><span>${loc.label}</span><em data-pin-pct="${key}"></em>`;
    btn.addEventListener('click', () => selectItem(key, true));
    if (pinsHost) pinsHost.appendChild(btn);
    loc.element = btn;
    loc.vector = V(...loc.pin);
  }

  const PIN_BADGES = {
    'gate-1': 'ANA KAPI',
    'gate-2': 'METRO',
    'gate-3': 'VIP',
    matchmaking: 'MP-01..24',
    red: '6 ŞİRKET',
    blue: '6 ŞİRKET',
    promenade: '4 ÇADIR',
    communities: 'ÇİM AMFİ',
    innovation: '5 DK PITCH',
    plenary: 'ANA SAHNE',
    tech: 'AMFİ',
    'teacher-plus': 'A/B BLOK',
    plaza: 'ORTA BAHÇE'
  };

  for (const [key, loc] of Object.entries(locations)) {
    const pctEl = loc.element?.querySelector('[data-pin-pct]');
    if (pctEl) pctEl.textContent = PIN_BADGES[key] || '';
  }

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.9, 2.3, 48),
    new THREE.MeshBasicMaterial({ color: '#E41513', side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-12.5, 0.45, -17.5);
  scene.add(ring);

  const views = {
    campus: { position: [-84, 96, -100], target: [-30, 0, 0] },
    incesu: { position: [-18, 58, -68], target: [4, 0, 0] },
    aksu: { position: [-108, 60, -56], target: [-68, 0, 2] },
    gates: { position: [-39, 40, -36], target: [-39, 1, 8] },
    matchmaking: { position: [-16, 26, -42], target: [-12.5, 1.5, -17.5] },
    aerial: { position: [-32, 152, -0.1], target: [-32, 0, 0] }
  };

  let transition = null;
  function setView(name, immediate = false) {
    const v = views[name];
    if (!v) return;
    const target = V(...v.target);
    const scale = Math.max(1, 1.2 / Math.max(host.clientWidth / Math.max(host.clientHeight, 1), 0.45));
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
      const p = THREE.MathUtils.clamp((time - transition.start) / 780, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(transition.from, transition.to, ease);
      controls.target.lerpVectors(transition.startTarget, transition.target, ease);
      if (p === 1) transition = null;
    }
    controls.update();

    const compact = host.clientWidth < 560;
    for (const [key, loc] of Object.entries(locations)) {
      if (!loc.element) continue;
      const matchesFilter = activeFilter === 'all' || loc.category === activeFilter;
      projected.copy(loc.vector).project(camera);
      const x = (projected.x * 0.5 + 0.5) * host.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * host.clientHeight;
      const inBounds = projected.z < 1 && x > 12 && x < host.clientWidth - 12 && y > 46 && y < host.clientHeight - 46;
      const showCompact = !compact || key === activeKey || activeFilter !== 'all' || ['gate-1', 'matchmaking', 'red', 'blue', 'communities'].includes(key);
      loc.element.hidden = !(matchesFilter && inBounds && showCompact);
      if (!loc.element.hidden) {
        const px = THREE.MathUtils.clamp(x, loc.element.offsetWidth / 2 + 8, host.clientWidth - loc.element.offsetWidth / 2 - 8);
        loc.element.style.transform = `translate(-50%,-50%) translate(${px.toFixed(1)}px,${y.toFixed(1)}px)`;
      }
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}
