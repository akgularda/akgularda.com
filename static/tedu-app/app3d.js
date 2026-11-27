/* ==========================================================================
   SummitTED Super-App (/tedu-app) — Three.js Aurora & 3D MP Arena Engine
   Vibrant Slush'D × COP31 Energy: Luminous floating 3D aurora orbs +
   interactive 3D G-Blok Meeting Point Pods (MP-01..MP-24).
   ========================================================================== */

import * as THREE from '../tedu/vendor/three.module.js';
import { OrbitControls } from '../tedu/vendor/OrbitControls.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 1. Vibrant Three.js Floating Energy Orbs & Particles Backdrop
const bgHost = document.getElementById('app-bg-webgl');
if (bgHost) {
  try {
    initVibrantBackdrop(bgHost);
  } catch (err) {
    console.warn('Backdrop WebGL fallback:', err);
  }
}

function initVibrantBackdrop(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  camera.position.set(0, 0, 26);

  const root = new THREE.Group();
  scene.add(root);

  // Floating translucent 3D icosahedron crystals (Slush kinetic vibe)
  const shapes = [];
  const palette = [0xff3b38, 0x3b6eff, 0x00d4b2, 0xff9f1c];
  for (let i = 0; i < 7; i++) {
    const geo = i % 2 === 0 ? new THREE.IcosahedronGeometry(1.5 + (i % 3) * 0.65, 1) : new THREE.OctahedronGeometry(1.4 + (i % 2) * 0.7, 0);
    const mat = new THREE.MeshBasicMaterial({
      color: palette[i % palette.length],
      wireframe: true,
      transparent: true,
      opacity: 0.16
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set((i - 3) * 5.2, Math.sin(i * 1.7) * 6.5, -4 - (i % 3) * 3);
    root.add(m);
    shapes.push({ mesh: m, rx: 0.12 + i * 0.03, ry: 0.16 - i * 0.02, baseY: m.position.y, phase: i * 1.1 });
  }

  // Luminous bokeh sparkles
  const COUNT = 70;
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const c1 = new THREE.Color('#FF524F');
  const c2 = new THREE.Color('#528BFF');
  const c3 = new THREE.Color('#14F1C6');
  let seed = 31;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (rnd() - 0.5) * 46;
    pos[i * 3 + 1] = (rnd() - 0.5) * 28;
    pos[i * 3 + 2] = (rnd() - 0.5) * 14 - 3;
    const c = i % 3 === 0 ? c1 : (i % 3 === 1 ? c2 : c3);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const sparks = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ size: 0.26, vertexColors: true, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending })
  );
  root.add(sparks);

  let tx = 0;
  let ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 1.8;
    ty = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 1.4;
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

  function animate(now) {
    requestAnimationFrame(animate);
    if (document.hidden) return;
    const s = now * 0.001;
    if (!reducedMotion.matches) {
      shapes.forEach((item) => {
        item.mesh.rotation.x = s * item.rx;
        item.mesh.rotation.y = s * item.ry;
        item.mesh.position.y = item.baseY + Math.sin(s * 0.9 + item.phase) * 0.9;
      });
      sparks.rotation.y = s * 0.035;
    }
    root.rotation.y += (tx * 0.12 - root.rotation.y) * 0.05;
    root.rotation.x += (ty * 0.09 - root.rotation.x) * 0.05;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
}

// 2. Interactive 3D G-Blok Slush'D Meeting Point Arena (MP-01 .. MP-24)
const arenaHost = document.getElementById('mp-arena-webgl');
if (arenaHost) {
  try {
    initMPArena3D(arenaHost);
  } catch (err) {
    console.warn('MP Arena WebGL fallback:', err);
  }
}

function initMPArena3D(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x091332, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x091332, 0.016);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
  camera.position.set(0, 17, 24);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 8;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI / 2.15;

  scene.add(new THREE.AmbientLight(0xeef4ff, 1.6));
  const dir = new THREE.DirectionalLight(0xffffff, 2.2);
  dir.position.set(10, 22, 14);
  scene.add(dir);

  const spotGlow = new THREE.PointLight(0xff3b38, 5, 20);
  spotGlow.position.set(0, 4, 0);
  scene.add(spotGlow);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 28),
    new THREE.MeshStandardMaterial({ color: 0x0c1940, roughness: 0.65, metalness: 0.2 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(44, 22, 0x00d4b2, 0x233b7c);
  grid.position.y = 0.02;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  scene.add(grid);

  function pillBadgeTexture(code, isCorp) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const ctx = c.getContext('2d');
    ctx.fillStyle = isCorp ? '#2454FF' : '#E41513';
    ctx.beginPath();
    ctx.roundRect(8, 12, 240, 72, 36);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(code, 128, 63);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const pods = new Map();
  const clickables = [];

  for (let i = 0; i < 24; i++) {
    const code = `MP-${String(i + 1).padStart(2, '0')}`;
    const col = i % 6;
    const row = Math.floor(i / 6);
    const x = (col - 2.5) * 5.5 + (col >= 4 ? 1.3 : 0);
    const z = (row - 1.5) * 4.5;
    const isCorp = i >= 16;

    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.12, 1.38, 36),
      new THREE.MeshBasicMaterial({ color: isCorp ? 0x3b82f6 : 0x00d4b2, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    g.add(ring);

    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 0.95, 0.16, 28),
      new THREE.MeshStandardMaterial({ color: 0x1a2d66, metalness: 0.35, roughness: 0.3 })
    );
    top.position.y = 1.05;
    top.userData.mpCode = code;
    g.add(top);
    clickables.push(top);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 1.0, 12),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.25 })
    );
    stem.position.y = 0.52;
    g.add(stem);

    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: pillBadgeTexture(code, isCorp), depthTest: false }));
    sp.position.set(0, 2.15, 0);
    sp.scale.set(2.25, 0.84, 1);
    g.add(sp);

    scene.add(g);
    pods.set(code, { ring, top, x, z, isCorp });
  }

  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.9, 6.2, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff3b38, transparent: true, opacity: 0.32, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  beacon.position.set(0, 3.1, 0);
  scene.add(beacon);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(1.42, 1.9, 48),
    new THREE.MeshBasicMaterial({ color: 0xff524f, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.06;
  scene.add(halo);

  let fly = null;
  function focusTable(code, animateCam = true) {
    const pod = pods.get(code) || pods.get('MP-04');
    if (!pod) return;
    pods.forEach((p, k) => {
      const sel = k === code;
      p.ring.material.color.setHex(sel ? 0xff3b38 : (p.isCorp ? 0x3b82f6 : 0x00d4b2));
      p.top.material.color.setHex(sel ? 0xe41513 : 0x1a2d66);
    });
    beacon.position.set(pod.x, 3.1, pod.z);
    halo.position.set(pod.x, 0.06, pod.z);
    spotGlow.position.set(pod.x, 3.5, pod.z);

    const target = new THREE.Vector3(pod.x, 0.8, pod.z);
    const dest = new THREE.Vector3(pod.x + 5.2, 7.8, pod.z + 9.2);
    if (animateCam && !reducedMotion.matches) {
      fly = { fromP: camera.position.clone(), toP: dest, fromT: controls.target.clone(), toT: target, start: performance.now() };
    } else {
      camera.position.copy(dest);
      controls.target.copy(target);
      controls.update();
    }
    const lbl = document.getElementById('arena-focused-label');
    if (lbl) lbl.textContent = `📍 ${code} Seçili`;
  }
  focusTable('MP-04', false);

  document.addEventListener('summitted-focus-mp', (ev) => {
    if (ev.detail?.tableId) focusTable(ev.detail.tableId, true);
  });

  const resetBtn = document.getElementById('btn-arena-overview');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      fly = {
        fromP: camera.position.clone(),
        toP: new THREE.Vector3(0, 17, 24),
        fromT: controls.target.clone(),
        toT: new THREE.Vector3(0, 0, 0),
        start: performance.now()
      };
    });
  }

  const raycaster = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(down.x - e.clientX, down.y - e.clientY) > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ptr, camera);
    const hit = raycaster.intersectObjects(clickables, false)[0];
    if (hit?.object?.userData?.mpCode) focusTable(hit.object.userData.mpCode, true);
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

  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || host.offsetParent === null) return;
    if (fly) {
      const p = Math.min(1, (now - fly.start) / 680);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(fly.fromP, fly.toP, ease);
      controls.target.lerpVectors(fly.fromT, fly.toT, ease);
      if (p >= 1) fly = null;
    }
    controls.update();
    const s = now * 0.0035;
    const sc = 1 + Math.sin(s) * 0.14;
    halo.scale.set(sc, sc, 1);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}
