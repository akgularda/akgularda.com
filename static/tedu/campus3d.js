/* ==========================================================================
   SummitTED Kariyer ve İnovasyon Zirvesi 2026 — Real-Scale 3D TEDÜ Campus v3
   Includes:
   - 3 Accreditation & Entrance Tents (Gate 1 İncesu, Gate 2 Aksu, Gate 3 VIP)
   - Student Communities Village on İncesu Çim Amfi (Modular Pagoda Tents + RadioTEDU)
   - İncesu Corporate Pavilions (İncesu North Walk)
   - Red Zone (K Blok Fuaye) & Main Stage (Ahmet Ersan Salonu)
   - Blue Zone (E Blok Spor Merkezi) & Startup/Innovation Alley (İstasyon TEDÜ)
   - G Blok Matchmaking Area (G Blok MP-01..MP-24 Numbered Tables)
   - Tech&Innovation (D Blok), Teacher+ (A/B Blok), Networking Plaza (Aksu Courtyard)
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
    renderer.toneMappingExposure = 1.08;
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
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 520);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 24;
  controls.maxDistance = 260;
  controls.minPolarAngle = 0.16;
  controls.maxPolarAngle = Math.PI / 2.22;
  controls.rotateSpeed = 0.55;
  controls.enableZoom = false;

  scene.add(new THREE.HemisphereLight(0xf5f7fb, 0x8d97a5, 2.1));

  const sun = new THREE.DirectionalLight(0xfff5e8, 3.25);
  sun.position.set(-36, 68, -44);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -95;
  sun.shadow.camera.right = 65;
  sun.shadow.camera.top = 65;
  sun.shadow.camera.bottom = -65;
  sun.shadow.camera.far = 210;
  sun.shadow.normalBias = 0.04;
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xd6e2f5, 1.85);
  fill.position.set(28, 20, -24);
  scene.add(fill);

  const materials = new Map();
  function mat(color, metalness = 0, roughness = 0.62) {
    const k = `${color}|${metalness}|${roughness}`;
    if (!materials.has(k)) materials.set(k, new THREE.MeshStandardMaterial({ color, metalness, roughness }));
    return materials.get(k);
  }

  const m = {
    white: mat('#fbfcfe'),
    tedNavy: mat('#0B1330', 0.22, 0.42),
    tedBlue: mat('#292E6F', 0.2, 0.4),
    tedRed: mat('#E41513', 0.15, 0.38),
    silver: mat('#cfd6e0', 0.68, 0.32),
    dark: mat('#141b2d', 0.35, 0.48),
    stone: mat('#e5e7ec'),
    facade: mat('#f3f4f7'),
    glass: mat('#7ea0bd', 0.35, 0.22),
    wood: mat('#c49367')
  };

  const zoneKeys = [
    'environment', 'screen',
    'gate-1', 'gate-2', 'gate-3',
    'red', 'blue', 'promenade', 'communities',
    'innovation', 'matchmaking', 'plenary', 'tech', 'teacher-plus', 'plaza'
  ];
  const groups = {};
  for (const key of zoneKeys) {
    groups[key] = new THREE.Group();
    groups[key].userData.zone = (key === 'environment') ? null : (key === 'screen' ? 'plenary' : key);
    scene.add(groups[key]);
  }

  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function mesh(geo, material, x, y, z, parent = groups.environment) {
    const o = new THREE.Mesh(geo, material);
    o.position.set(x, y, z);
    o.castShadow = true;
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
      c.font = '800 68px Arial';
      c.fillText(text, w / 2, sub ? 128 : 156);
      if (sub) {
        c.fillStyle = '#CFD8EC';
        c.font = '700 32px Arial';
        c.fillText(sub, w / 2, 198);
      }
    }).texture;
  }

  function sign(text, x, y, z, w, h, parent, bg, fg, sub) {
    const material = new THREE.MeshBasicMaterial({ map: signTexture(text, bg, fg, sub), toneMapped: false });
    return mesh(new THREE.PlaneGeometry(w, h), material, x, y, z, parent);
  }

  // Helper: Pagoda / Canopy Tent (for Gates, Student Communities, Promenade & Plaza)
  function pagodaTent(x, z, size, roofColor, fasciaText, zoneKey, rotY = 0) {
    const g = new THREE.Group();
    const half = size * 0.46;
    box(size, 0.14, size, 0, 0.24, 0, mat('#dfe4ee'), g);
    for (const dx of [-half, half]) {
      for (const dz of [-half, half]) {
        beam(V(dx, 0.3, dz), V(dx, 2.75, dz), 0.05, m.silver, g);
      }
    }
    box(size + 0.16, 0.36, size + 0.16, 0, 2.85, 0, mat(roofColor), g);
    cone(size * 0.76, 1.35, 0, 3.7, 0, m.white, g, 4);
    // Reception desk inside tent
    box(size * 0.62, 0.85, 0.55, 0, 0.72, half * 0.55, m.white, g);
    box(size * 0.66, 0.08, 0.65, 0, 1.18, half * 0.55, mat(roofColor), g);
    if (fasciaText) {
      const s = sign(fasciaText, 0, 2.86, size * 0.5 + 0.1, size * 0.92, 0.34, g, roofColor, '#ffffff');
      s.renderOrder = 2;
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // Helper: Entrance Accreditation Gate Arch + Canopy Tent
  function accreditationGate(x, z, labelText, subText, zoneKey, rotY = 0) {
    const g = new THREE.Group();
    // Red-Navy Entrance Archway
    box(0.85, 5.2, 0.85, -3.8, 2.7, 0, m.tedNavy, g);
    box(0.85, 5.2, 0.85, 3.8, 2.7, 0, m.tedNavy, g);
    box(8.6, 1.1, 1.05, 0, 5.45, 0, m.tedNavy, g);
    box(8.7, 0.22, 1.12, 0, 6.08, 0, m.tedRed, g);
    sign(labelText, 0, 5.45, 0.56, 7.6, 0.88, g, '#0B1330', '#ffffff', subText);
    const backSign = sign(labelText, 0, 5.45, -0.56, 7.6, 0.88, g, '#0B1330', '#ffffff', subText);
    backSign.rotation.y = Math.PI;
    // Accreditation Tent next to arch
    pagodaTent(0, -3.4, 3.8, '#E41513', 'QR BADGE & CHECK-IN', zoneKey, 0);
    // Turnstiles
    for (const tx of [-1.6, 0, 1.6]) {
      box(0.22, 0.95, 0.9, tx, 0.62, 0, m.silver, g);
      box(0.24, 0.08, 0.92, tx, 1.12, 0, m.tedRed, g);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // Helper: Corporate Stand Booth
  function booth(x, z, color, label, zoneKey, rotY = 0) {
    const g = new THREE.Group();
    box(4.2, 0.18, 3.1, 0, 0.32, 0, mat('#e4e8f0'), g);
    box(3.95, 2.65, 0.14, 0, 1.75, -1.3, m.white, g);
    for (const dx of [-1.92, 1.92]) {
      for (const dz of [-1.3, 1.3]) {
        beam(V(dx, 0.45, dz), V(dx, 3.35, dz), 0.045, m.silver, g);
      }
    }
    box(4.2, 0.34, 3.1, 0, 3.4, 0, mat(color), g);
    sign(label, 0, 3.4, 1.58, 3.8, 0.38, g, color, '#ffffff');
    box(3.1, 0.9, 0.65, 0, 0.88, 0.9, m.white, g);
    box(3.25, 0.09, 0.78, 0, 1.36, 0.9, mat(color), g);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    groups[zoneKey].add(g);
  }

  // 1. İncesu Courtyard Ground & Semicircular Çim Amfi
  box(68, 1.15, 54, -1, -0.52, 0, mat('#cfd6e2'));
  box(66, 0.15, 52, -1, 0.09, 0, m.stone);

  function gardenOutline(inset = 0) {
    const r = 15.2 - inset;
    const cx = -8.8;
    const right = 23.2 - inset;
    const shape = new THREE.Shape();
    shape.moveTo(cx, -r);
    shape.lineTo(right, -r);
    shape.lineTo(right, r);
    shape.lineTo(cx, r);
    shape.absarc(cx, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    shape.closePath();
    return shape;
  }

  const lawnGeo = new THREE.ExtrudeGeometry(gardenOutline(0.3), { depth: 0.18, bevelEnabled: false, curveSegments: 48 });
  const lawnMesh = mesh(lawnGeo, mat('#7ea968'), 0, 0.36, 0);
  lawnMesh.rotation.x = -Math.PI / 2;

  // 2. Ziya Gökalp Caddesi (Dividing İncesu & Aksu with Summit Crosswalk)
  box(11.4, 0.09, 78, -38, 0.03, 2, mat('#697386'));
  box(1.4, 0.18, 78, -31.7, 0.13, 2, m.stone);
  box(1.4, 0.18, 78, -44.3, 0.13, 2, m.stone);
  for (let x = -42.8; x < -33; x += 1.15) {
    box(0.68, 0.025, 4.6, x, 0.1, 8, mat('#ffffff'));
  }
  box(10, 0.03, 0.45, -38, 0.11, 5.3, m.tedRed);
  box(10, 0.03, 0.45, -38, 0.11, 10.7, m.tedRed);
  const roadSign = sign('ZİYA GÖKALP CADDESİ · YAYA GEÇİŞ AKSI', -38, 0.14, -6, 24, 2.1, groups.environment, '#0B1330', '#ffffff');
  roadSign.rotation.x = -Math.PI / 2;
  roadSign.rotation.z = Math.PI / 2;

  // 3. Aksu Courtyard Ground
  box(48, 1.1, 53, -69, -0.52, 0, mat('#cfd6e2'));
  box(46, 0.14, 51, -69, 0.1, 0, m.stone);
  box(20, 0.1, 20, -69, 0.2, 0, mat('#8ab074'));

  // 4. Real TEDÜ Buildings (A, B, K on İncesu; C, D, E, F, G, H on Aksu)
  function building(name, sub, x, z, w, d, h, accent, zoneKey = 'environment') {
    const parent = groups[zoneKey] || groups.environment;
    box(w, h, d, x, h / 2 + 0.2, z, m.facade, parent);
    box(w + 0.32, 0.34, d + 0.32, x, h + 0.38, z, mat(accent), parent);
    for (let y = 1.7; y < h - 0.5; y += 2.4) {
      for (let xx = x - w / 2 + 1.2; xx < x + w / 2 - 0.8; xx += 2.6) {
        for (const side of [-1, 1]) {
          box(1.6, 1.35, 0.07, xx, y, z + side * (d / 2 + 0.04), m.glass, parent);
        }
      }
      for (let zz = z - d / 2 + 1.2; zz < z + d / 2 - 0.8; zz += 2.6) {
        for (const side of [-1, 1]) {
          box(0.07, 1.35, 1.6, x + side * (w / 2 + 0.04), y, zz, m.glass, parent);
        }
      }
    }
    const spriteMat = new THREE.SpriteMaterial({
      map: signTexture(name, '#0B1330', '#ffffff', sub, accent),
      depthTest: false,
      toneMapped: false
    });
    const sp = new THREE.Sprite(spriteMat);
    sp.position.set(x, h + 2.8, z);
    sp.scale.set(11.5, 2.5, 1);
    sp.renderOrder = 6;
    scene.add(sp);
  }

  building('A BLOK · TEACHER+', 'EĞİTİM KONFERANSLARI', -28, -4, 6.8, 28, 10.5, '#292E6F', 'teacher-plus');
  building('B BLOK · TEACHER+', 'AKADEMİK FORUM', 0, 20.5, 56, 6.8, 10.5, '#292E6F', 'teacher-plus');
  building('K BLOK · KÜLTÜR MERKEZİ', 'RED ZONE FUAYE & AHMET ERSAN PLENARY', 29, 0, 8.2, 35, 7.2, '#E41513', 'red');

  building('D BLOK · TECH & INNOVATION', 'MÜHENDİSLİK & AI SÖYLEŞİ AMFİSİ', -85.5, 0, 7, 38, 10, '#1D4ED8', 'tech');
  building('E BLOK · BLUE ZONE & İSTASYON', 'SPOR MERKEZİ STANTLARI & STARTUP ALLEY', -50, 19, 8.5, 16.5, 7.5, '#292E6F', 'blue');
  building('F BLOK', 'AKSU GÜNEY KANADI', -70, 20.5, 24, 6.8, 8, '#64748B');
  building('C BLOK', 'MERKEZ DERSLİKLER', -60, 8.5, 7.5, 13, 6.2, '#64748B');
  building('G BLOK · EŞLEŞME ALANI', 'MP-01..24 EŞLEŞME & 1:1 MÜLAKAT', -69, -20.5, 34, 7.2, 9.2, '#E41513', 'matchmaking');
  building('H BLOK', 'AKSU KUZEYDOĞU', -50, -10.5, 6.8, 17, 8.8, '#64748B');

  // 5. Three Entrance & Accreditation Gates (Tents + Archways)
  accreditationGate(-31.2, 8, 'GATE 1 · İNCESU ANA GİRİŞ', 'AKREDİTASYON & YAKA KARTI ÇADIRI', 'gate-1', Math.PI / 2);
  accreditationGate(-44.8, 8, 'GATE 2 · AKSU GİRİŞ ÇADIRI', 'HIZLI QR CHECK-IN & METRO GEÇİŞİ', 'gate-2', -Math.PI / 2);
  accreditationGate(22, -20.5, 'GATE 3 · VIP & KURUMSAL', 'ŞİRKET İK & KONUŞMACI KARŞILAMA', 'gate-3', 0);

  // 6. Student Communities Village on İncesu Çim Amfi (Modular Pagoda Tents + RadioTEDU Pod)
  const commLabels = [
    ['KARİYER ÖNCÜLERİ', -18.5, -8.5],
    ['RADIOTEDU LIVE', -20.5, -2.5],
    ['IEEE TEDÜ', -20.5, 3.5],
    ['TEDU ERU', -18.0, 9.0],
    ['GİRİŞİMCİLİK', -11.5, 11.8],
    ['VERİ BİLİMİ & AI', -4.5, 11.8],
    ['MİMARLIK & TASARIM', 2.5, 11.8],
    ['ENDÜSTRİ & VAKA', 9.5, 11.8]
  ];
  for (const [lbl, tx, tz] of commLabels) {
    const color = lbl.includes('RADIOTEDU') ? '#E41513' : '#292E6F';
    pagodaTent(tx, tz, 3.3, color, lbl, 'communities', 0);
  }

  // 7. İncesu Corporate Pavilions along İncesu North Walk
  booth(-16.5, -17.5, '#0B1330', 'GARANTİ BBVA TECH', 'promenade');
  booth(-10.5, -17.5, '#292E6F', 'TURKCELL AI HOUSE', 'promenade');
  booth(-4.5, -17.5, '#0B1330', 'HAVELSAN SİBER', 'promenade');
  booth(1.5, -17.5, '#E41513', 'MİGROS UP LOUNGE', 'promenade');

  // 8. Red Zone Stands (K Blok Foyer Front) & Main Plenary Stage
  booth(19.5, -10.5, '#E41513', 'AKFEN · DENİZBANK', 'red', -Math.PI / 2);
  booth(19.5, -4.5, '#E41513', 'EY · COCA-COLA', 'red', -Math.PI / 2);
  booth(19.5, 1.5, '#E41513', 'KPMG · ANADOLU EFES', 'red', -Math.PI / 2);

  // Plenary Executive Stage Canopy & Dynamic LED Screen
  box(7.2, 0.9, 13.5, 13.5, 0.62, 8.5, m.tedNavy, groups.plenary);
  box(7.6, 0.34, 14.2, 13.5, 7.6, 8.5, m.tedNavy, groups.plenary);
  box(7.7, 0.14, 14.3, 13.5, 7.82, 8.5, m.tedRed, groups.plenary);

  const screen = canvasTexture(1024, 512, () => {});
  const ledMat = new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false });
  const ledPlane = mesh(new THREE.PlaneGeometry(11.4, 5.2), ledMat, 16.8, 4.4, 8.5, groups.screen);
  ledPlane.rotation.y = -Math.PI / 2;

  const logoImg = new Image();
  logoImg.src = './assets/submitted-logo-ted-white.svg';
  let logoReady = false;
  logoImg.onload = () => {
    logoReady = true;
    drawLED();
  };

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
    c.fillText('3 AKREDİTASYON KAPISI · 10 ZONE · 24 MEETING POINT MASASI', 512, 372);
    screen.texture.needsUpdate = true;
  }
  drawLED();

  // 9. Blue Zone Stands (E Blok Spor Merkezi) & Innovation Alley (İstasyon TEDÜ)
  booth(-55.5, 15.2, '#292E6F', 'ASELSAN · TUSAŞ', 'blue', Math.PI);
  booth(-60.5, 15.2, '#292E6F', 'MİLSOFT · ROKETSAN', 'blue', Math.PI);
  pagodaTent(-55.5, 4.5, 3.6, '#0284C7', 'İSTASYON TEDÜ PITCH', 'innovation', 0);
  pagodaTent(-55.5, -0.5, 3.3, '#0B1330', 'STARTUP & VC ALLEY', 'innovation', 0);

  // 10. G Blok Matchmaking Area (Numbered Tables MP-01..MP-24)
  box(24, 0.16, 7.6, -69, 0.22, -13.2, mat('#dce3f0'), groups.matchmaking);
  sign('G BLOK EŞLEŞME ALANI · MP-01 .. MP-24 (5 DK GÖRÜŞME)', -69, 3.8, -16.6, 15, 1.35, groups.matchmaking, '#E41513', '#ffffff');
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 8; col++) {
      const mx = -78.8 + col * 2.8;
      const mz = -14.6 + row * 2.8;
      cyl(0.58, 0.58, 0.1, mx, 1.05, mz, m.tedNavy, groups.matchmaking, 18);
      cyl(0.08, 0.08, 0.85, mx, 0.6, mz, m.silver, groups.matchmaking, 8);
      box(0.42, 0.34, 0.06, mx, 1.28, mz, (col + row) % 2 === 0 ? m.tedRed : m.tedBlue, groups.matchmaking);
    }
  }

  // 11. Aksu Networking Plaza & Hospitality Coffee Tents
  pagodaTent(-73.5, 3.5, 3.5, '#0B1330', 'NETWORKING COFFEE', 'plaza', 0);
  pagodaTent(-68.5, 3.5, 3.5, '#475569', 'İKRAM & BISTRO PLAZA', 'plaza', 0);
  for (const [bx, bz] of [[-75, -2.5], [-71, -2.5], [-67, -2.5], [-73, -6], [-69, -6]]) {
    cyl(0.62, 0.62, 0.09, bx, 1.12, bz, m.wood, groups.plaza, 16);
    cyl(0.07, 0.07, 0.92, bx, 0.62, bz, m.white, groups.plaza, 8);
  }

  // Trees
  function tree(x, z, s = 1) {
    cyl(0.16, 0.22, 2.1 * s, x, 1.3 * s, z, m.wood, groups.environment);
    mesh(new THREE.IcosahedronGeometry(1.3 * s, 1), mat('#6f9c6b'), x, 2.9 * s, z, groups.environment);
  }
  for (const [tx, tz] of [[-24, -22], [-12, -22], [0, -22], [12, -22], [24, 15], [-88, -22], [-88, 22], [-80, 12]]) {
    tree(tx, tz, 0.88);
  }

  // Instanced Summit Crowd across both İncesu & Aksu
  let seed = 41;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const crowd = [];
  for (let i = 0; i < 190; i++) {
    const inAksu = i >= 105;
    crowd.push({
      x: inAksu ? (-80 + rnd() * 26) : (-22 + rnd() * 40),
      z: inAksu ? (-15 + rnd() * 28) : (-15 + rnd() * 26),
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
        msh.castShadow = true;
        msh.receiveShadow = true;
        msh.userData.zone = group.userData.zone;
        group.add(msh);
      }
      list.forEach((g) => g.dispose());
    }
  }

  Object.entries(groups).forEach(([k, g]) => {
    if (k !== 'screen') optimize(g);
  });

  const locations = {
    'gate-1': { target: [-31, 2, 8], pin: [-31, 8.2, 8], color: '#E41513', label: 'Gate 1 · Ana Giriş Çadırı', category: 'gates', camera: 'gates' },
    'gate-2': { target: [-45, 2, 8], pin: [-45, 8.2, 8], color: '#292E6F', label: 'Gate 2 · Aksu Çadırı', category: 'gates', camera: 'gates' },
    'gate-3': { target: [22, 2, -20], pin: [22, 8.0, -20], color: '#0B1330', label: 'Gate 3 · VIP Giriş', category: 'gates', camera: 'incesu' },
    red: { target: [21, 2, -3], pin: [25, 10.2, -3], color: '#E41513', label: 'Red Zone · K Blok Fuaye', category: 'company', camera: 'incesu' },
    blue: { target: [-54, 2, 16], pin: [-52, 10.2, 18], color: '#292E6F', label: 'Blue Zone · Spor Mrk.', category: 'company', camera: 'aksu' },
    promenade: { target: [-8, 2, -17], pin: [-8, 6.8, -17], color: '#B91C1C', label: 'Kurumsal Çadırlar', category: 'company', camera: 'incesu' },
    communities: { target: [-14, 2, 4], pin: [-14, 6.6, 4], color: '#D92D20', label: 'Topluluklar Köyü · Çim Amfi', category: 'community', camera: 'incesu' },
    innovation: { target: [-56, 2, 2], pin: [-56, 6.8, 2], color: '#0284C7', label: 'Innovation Alley · İstasyon', category: 'innovation', camera: 'aksu' },
    matchmaking: { target: [-69, 2, -14], pin: [-69, 7.6, -15], color: '#E41513', label: 'Meeting Points · MP-01..24', category: 'matchmaking', camera: 'matchmaking' },
    plenary: { target: [15, 2, 8], pin: [15, 9.6, 9], color: '#0B1330', label: 'Ana Sahne · Ahmet Ersan', category: 'stage', camera: 'incesu' },
    tech: { target: [-82, 2, 0], pin: [-83, 11.5, 0], color: '#1D4ED8', label: 'Tech&Innovation · D Blok', category: 'stage', camera: 'aksu' },
    'teacher-plus': { target: [-16, 2, 18], pin: [-12, 11.5, 19], color: '#292E6F', label: 'Teacher+ · A/B Blok', category: 'stage', camera: 'incesu' },
    plaza: { target: [-71, 2, 0], pin: [-71, 6.2, 1], color: '#475569', label: 'Networking & İkram Çadırları', category: 'lounge', camera: 'aksu' }
  };

  const pinsHost = document.getElementById('world-hotspots');
  let activeKey = 'red';
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
    red: '6 ŞİRKET',
    blue: '6 ŞİRKET',
    promenade: '4 PAVİLYON',
    communities: '8 ÇADIR',
    innovation: '5 DK PITCH',
    matchmaking: '24 MASA',
    plenary: 'ANA SAHNE',
    tech: 'AMFİ',
    'teacher-plus': 'FORUM',
    plaza: 'LOUNGE'
  };

  function refreshPinMetrics() {
    for (const [key, loc] of Object.entries(locations)) {
      const pctEl = loc.element?.querySelector('[data-pin-pct]');
      if (pctEl) pctEl.textContent = PIN_BADGES[key] || '';
    }
  }
  refreshPinMetrics();

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.7, 2.05, 48),
    new THREE.MeshBasicMaterial({ color: '#E41513', side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(21, 0.45, -3);
  scene.add(ring);

  const views = {
    campus: { position: [-86, 98, -98], target: [-30, 0, 0] },
    incesu: { position: [-30, 62, -68], target: [2, 0, 0] },
    aksu: { position: [-106, 62, -58], target: [-68, 0, 0] },
    gates: { position: [-38, 42, -38], target: [-38, 1, 8] },
    matchmaking: { position: [-52, 34, -46], target: [-69, 1, -14] },
    aerial: { position: [-34, 152, -0.1], target: [-34, 0, 0] }
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

  // Raycasting click on 3D buildings/tents
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
      const showCompact = !compact || key === activeKey || activeFilter !== 'all' || ['gate-1', 'red', 'blue', 'matchmaking', 'communities'].includes(key);
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
