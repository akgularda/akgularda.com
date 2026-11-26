/* ==========================================================================
   SummitTED Web App (/tedu-app) — Three.js Dual WebGL Engine
   1. Ambient Synergy Field (#app-bg-webgl): Floating 60fps crimson/cobalt nodes
   2. Interactive 3D G-Blok Slush'D Meeting Point Arena (#mp-arena-webgl):
      24 numbered 3D meeting pods (MP-01..MP-24), OrbitControls, smooth camera
      fly-to on match acceptance, and pulsing 3D beacon + energy arc!
   ========================================================================== */

import * as THREE from '../tedu/vendor/three.module.js';
import { OrbitControls } from '../tedu/vendor/OrbitControls.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// ---------------------------------------------------------------------------
// 1. Full-Screen Ambient Synergy Backdrop
// ---------------------------------------------------------------------------
const bgHost = document.getElementById('app-bg-webgl');
if (bgHost) {
  try {
    initAmbientWebGL(bgHost);
  } catch (e) {
    console.warn('Ambient WebGL fallback:', e);
  }
}

function initAmbientWebGL(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 160);
  camera.position.set(0, 0, 30);

  const group = new THREE.Group();
  scene.add(group);

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(13, 0.035, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xe41513, wireframe: true, transparent: true, opacity: 0.09 })
  );
  ring1.rotation.set(1.1, 0.3, 0);
  group.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(9.5, 0.035, 8, 84),
    new THREE.MeshBasicMaterial({ color: 0x4870ff, wireframe: true, transparent: true, opacity: 0.08 })
  );
  ring2.rotation.set(-0.9, -0.4, 0);
  group.add(ring2);

  const COUNT = 85;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const cR = new THREE.Color('#FF4B48');
  const cB = new THREE.Color('#5E85FF');
  let seed = 73;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (rnd() - 0.5) * 52;
    pos[i * 3 + 1] = (rnd() - 0.5) * 30;
    pos[i * 3 + 2] = (rnd() - 0.5) * 18 - 4;
    const c = i % 4 === 0 ? cR : cB;
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending })
  );
  group.add(pts);

  let mx = 0;
  let my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 1.8;
    my = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 1.2;
  }, { passive: true });

  function resize() {
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', resize);
  resize();

  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const s = t * 0.001;
    if (!reducedMotion.matches) {
      ring1.rotation.z = s * 0.09;
      ring2.rotation.z = -s * 0.12;
      pts.rotation.y = s * 0.03;
    }
    group.rotation.y += (mx * 0.1 - group.rotation.y) * 0.04;
    group.rotation.x += (my * 0.08 - group.rotation.x) * 0.04;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// 2. Interactive 3D Slush'D Meeting Point Arena (MP-01 .. MP-24)
// ---------------------------------------------------------------------------
const arenaHost = document.getElementById('mp-arena-webgl');
if (arenaHost) {
  try {
    initMPArena3D(arenaHost);
  } catch (e) {
    console.warn('3D MP Arena fallback:', e);
  }
}

function initMPArena3D(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x050917, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050917, 0.018);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);
  camera.position.set(0, 18, 25);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 9;
  controls.maxDistance = 42;
  controls.maxPolarAngle = Math.PI / 2.15;

  scene.add(new THREE.AmbientLight(0xdce6ff, 1.4));
  const dir = new THREE.DirectionalLight(0xffffff, 2.2);
  dir.position.set(12, 24, 14);
  scene.add(dir);

  const redPoint = new THREE.PointLight(0xe41513, 4.5, 22);
  redPoint.position.set(0, 4, 0);
  scene.add(redPoint);

  // Architectural Grid Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 28),
    new THREE.MeshStandardMaterial({ color: 0x09122c, roughness: 0.7, metalness: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(44, 22, 0xe41513, 0x1c2f66);
  grid.position.y = 0.02;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);

  function labelTexture(code, isCorp) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const ctx = c.getContext('2d');
    ctx.fillStyle = isCorp ? '#1D3587' : '#0B1330';
    ctx.fillRect(0, 0, 256, 96);
    ctx.fillStyle = isCorp ? '#4870FF' : '#E41513';
    ctx.fillRect(0, 0, 256, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 44px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(code, 128, 66);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const pods = new Map();
  const clickTargets = [];

  // Build 24 Numbered Meeting Point Pods (4 rows x 6 cols)
  for (let i = 0; i < 24; i++) {
    const code = `MP-${String(i + 1).padStart(2, '0')}`;
    const col = i % 6;
    const row = Math.floor(i / 6);
    const x = (col - 2.5) * 5.6 + (col >= 4 ? 1.4 : 0);
    const z = (row - 1.5) * 4.6;
    const isCorp = i >= 16;

    const podGroup = new THREE.Group();
    podGroup.position.set(x, 0, z);
    podGroup.userData.mpCode = code;

    const baseRing = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.38, 32),
      new THREE.MeshBasicMaterial({ color: isCorp ? 0x4870ff : 0x2a3f7a, side: THREE.DoubleSide })
    );
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = 0.04;
    podGroup.add(baseRing);

    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.14, 24),
      new THREE.MeshStandardMaterial({ color: 0x162454, metalness: 0.4, roughness: 0.35 })
    );
    tableTop.position.y = 1.05;
    tableTop.userData.mpCode = code;
    podGroup.add(tableTop);
    clickTargets.push(tableTop);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: 0x9fb0d4, metalness: 0.7, roughness: 0.3 })
    );
    stem.position.y = 0.52;
    podGroup.add(stem);

    // Two sleek chairs/stools facing each other across the table
    for (const side of [-1.25, 1.25]) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.65, 0.52),
        new THREE.MeshStandardMaterial({ color: 0x1e2e63, roughness: 0.5 })
      );
      seat.position.set(side, 0.34, 0);
      podGroup.add(seat);
    }

    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: labelTexture(code, isCorp), depthTest: false })
    );
    sprite.position.set(0, 2.15, 0);
    sprite.scale.set(2.3, 0.86, 1);
    podGroup.add(sprite);

    scene.add(podGroup);
    pods.set(code, { group: podGroup, baseRing, tableTop, x, z });
  }

  // Pulsing Vertical Crimson Beacon + Energy Arc for Focused MP Table
  const beaconBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.85, 6.5, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xe41513, transparent: true, opacity: 0.28, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  beaconBeam.position.set(0, 3.25, 0);
  scene.add(beaconBeam);

  const pulseHalo = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.85, 48),
    new THREE.MeshBasicMaterial({ color: 0xff4b48, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  pulseHalo.rotation.x = -Math.PI / 2;
  pulseHalo.position.y = 0.06;
  scene.add(pulseHalo);

  let flyTransition = null;
  let focusedCode = 'MP-04';

  function focusTable(code, animateCam = true) {
    const pod = pods.get(code) || pods.get('MP-04');
    if (!pod) return;
    focusedCode = code;

    pods.forEach((p, k) => {
      const isSelected = k === code;
      p.baseRing.material.color.setHex(isSelected ? 0xe41513 : (parseInt(k.slice(3), 10) > 16 ? 0x4870ff : 0x2a3f7a));
      p.tableTop.material.color.setHex(isSelected ? 0xb80d0b : 0x162454);
    });

    beaconBeam.position.set(pod.x, 3.25, pod.z);
    pulseHalo.position.set(pod.x, 0.06, pod.z);
    redPoint.position.set(pod.x, 3.5, pod.z);

    const target = new THREE.Vector3(pod.x, 0.8, pod.z);
    const dest = new THREE.Vector3(pod.x + 5.5, 8.2, pod.z + 9.5);
    if (animateCam && !reducedMotion.matches) {
      flyTransition = {
        fromPos: camera.position.clone(),
        toPos: dest,
        fromTarget: controls.target.clone(),
        toTarget: target,
        start: performance.now()
      };
    } else {
      camera.position.copy(dest);
      controls.target.copy(target);
      controls.update();
    }

    const badgeEl = document.getElementById('arena-focused-label');
    if (badgeEl) badgeEl.textContent = `ODAKLANAN MASA: ${code}`;
  }

  focusTable('MP-04', false);

  document.addEventListener('summitted-focus-mp', (ev) => {
    const mp = ev.detail?.tableId;
    if (mp) focusTable(mp, true);
  });

  const resetArenaBtn = document.getElementById('btn-arena-overview');
  if (resetArenaBtn) {
    resetArenaBtn.addEventListener('click', () => {
      flyTransition = {
        fromPos: camera.position.clone(),
        toPos: new THREE.Vector3(0, 18, 25),
        fromTarget: controls.target.clone(),
        toTarget: new THREE.Vector3(0, 0, 0),
        start: performance.now()
      };
    });
  }

  // Click any 3D table pod directly
  const raycaster = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(downAt.x - e.clientX, downAt.y - e.clientY) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ptr, camera);
    const hit = raycaster.intersectObjects(clickTargets, false)[0];
    if (hit?.object?.userData?.mpCode) {
      focusTable(hit.object.userData.mpCode, true);
    }
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

  function renderLoop(now) {
    requestAnimationFrame(renderLoop);
    if (document.hidden || host.offsetParent === null) return;

    if (flyTransition) {
      const p = Math.min(1, (now - flyTransition.start) / 720);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(flyTransition.fromPos, flyTransition.toPos, ease);
      controls.target.lerpVectors(flyTransition.fromTarget, flyTransition.toTarget, ease);
      if (p >= 1) flyTransition = null;
    }
    controls.update();

    const s = now * 0.003;
    const scale = 1 + Math.sin(s) * 0.14;
    pulseHalo.scale.set(scale, scale, 1);
    pulseHalo.material.opacity = 0.65 + Math.sin(s) * 0.25;
    beaconBeam.rotation.y = s * 0.25;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(renderLoop);
}
