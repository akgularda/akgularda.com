/* ==========================================================================
   SummitTED Mobile App (/tedu-app) — Three.js Architectural TED-TEDÜ Engine
   Strictly TEDÜ Pantone 280 Navy (#0B1330 / #292E6F), TED Red (#E41513),
   and Crisp White (#FFFFFF). Zero rainbow gradients.
   1. Desktop Backdrop (#pc-stage-webgl): Subtle architectural wireframe grid
   2. Embedded Mobile 3D MP Arena (#mp-arena-webgl): 24 numbered tables
   ========================================================================== */

import * as THREE from '../tedu/vendor/three.module.js';
import { OrbitControls } from '../tedu/vendor/OrbitControls.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// 1. Subtle Architectural Backdrop visible around the mobile frame on PC
const pcBg = document.getElementById('pc-stage-webgl');
if (pcBg && window.innerWidth > 520) {
  try {
    initPCArchitecturalBackdrop(pcBg);
  } catch (e) {
    console.warn('PC stage WebGL skipped:', e);
  }
}

function initPCArchitecturalBackdrop(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 160);
  camera.position.set(0, 4, 30);

  const root = new THREE.Group();
  scene.add(root);

  const gridBottom = new THREE.GridHelper(70, 35, 0xe41513, 0x182554);
  gridBottom.position.y = -9;
  gridBottom.material.transparent = true;
  gridBottom.material.opacity = 0.28;
  root.add(gridBottom);

  // Sharp architectural wireframe cubes (Navy & Red, angular, zero organic blobs)
  const frameMatNavy = new THREE.EdgesGeometry(new THREE.BoxGeometry(11, 11, 11));
  const cubeLeft = new THREE.LineSegments(
    frameMatNavy,
    new THREE.LineBasicMaterial({ color: 0x292e6f, transparent: true, opacity: 0.45 })
  );
  cubeLeft.position.set(-15, 1, -6);
  root.add(cubeLeft);

  const frameMatRed = new THREE.EdgesGeometry(new THREE.BoxGeometry(8.5, 8.5, 8.5));
  const cubeRight = new THREE.LineSegments(
    frameMatRed,
    new THREE.LineBasicMaterial({ color: 0xe41513, transparent: true, opacity: 0.36 })
  );
  cubeRight.position.set(15, -1, -5);
  root.add(cubeRight);

  let mx = 0;
  let my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 1.4;
    my = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 0.9;
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

  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || window.innerWidth <= 520) return;
    const s = now * 0.00045;
    if (!reducedMotion.matches) {
      cubeLeft.rotation.x = s;
      cubeLeft.rotation.y = s * 1.3;
      cubeRight.rotation.x = -s * 1.1;
      cubeRight.rotation.y = s * 0.9;
    }
    root.rotation.y += (mx * 0.08 - root.rotation.y) * 0.05;
    root.rotation.x += (my * 0.05 - root.rotation.x) * 0.05;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}

// 2. Embedded Mobile 3D Slush'D Meeting Point Arena (MP-01 .. MP-24)
const arenaHost = document.getElementById('mp-arena-webgl');
if (arenaHost) {
  try {
    initMobileMPArena(arenaHost);
  } catch (e) {
    console.warn('MP Arena WebGL fallback:', e);
  }
}

function initMobileMPArena(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x081029, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x081029, 0.018);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 140);
  camera.position.set(0, 18, 24);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 9;
  controls.maxDistance = 38;
  controls.maxPolarAngle = Math.PI / 2.15;

  scene.add(new THREE.AmbientLight(0xeef2ff, 1.55));
  const dir = new THREE.DirectionalLight(0xffffff, 2.1);
  dir.position.set(10, 22, 12);
  scene.add(dir);

  const redLight = new THREE.PointLight(0xe41513, 4.5, 18);
  redLight.position.set(0, 4, 0);
  scene.add(redLight);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 28),
    new THREE.MeshStandardMaterial({ color: 0x0b1536, roughness: 0.7, metalness: 0.2 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(44, 22, 0xe41513, 0x1f316b);
  grid.position.y = 0.02;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);

  function sharpSignTexture(code, isCorp) {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 92;
    const ctx = c.getContext('2d');
    ctx.fillStyle = isCorp ? '#292E6F' : '#0B1330';
    ctx.fillRect(0, 0, 256, 92);
    ctx.fillStyle = '#E41513';
    ctx.fillRect(0, 0, 256, 14);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 88);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 44px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(code, 128, 64);
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
    const x = (col - 2.5) * 5.4 + (col >= 4 ? 1.2 : 0);
    const z = (row - 1.5) * 4.4;
    const isCorp = i >= 16;

    const g = new THREE.Group();
    g.position.set(x, 0, z);

    // Angular square table base & top (matches sharp architectural aesthetic)
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.08, 2.1),
      new THREE.MeshBasicMaterial({ color: isCorp ? 0x3b52b8 : 0x292e6f })
    );
    base.position.y = 0.04;
    g.add(base);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.16, 1.65),
      new THREE.MeshStandardMaterial({ color: 0x162454, metalness: 0.35, roughness: 0.35 })
    );
    top.position.y = 1.05;
    top.userData.mpCode = code;
    g.add(top);
    clickables.push(top);

    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.96, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.3 })
    );
    pillar.position.y = 0.52;
    g.add(pillar);

    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sharpSignTexture(code, isCorp), depthTest: false }));
    sp.position.set(0, 2.15, 0);
    sp.scale.set(2.3, 0.82, 1);
    g.add(sp);

    scene.add(g);
    pods.set(code, { base, top, x, z, isCorp });
  }

  const beacon = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 6.2, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xe41513, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending })
  );
  beacon.position.set(0, 3.1, 0);
  scene.add(beacon);

  let fly = null;
  function focusTable(code, animateCam = true) {
    const pod = pods.get(code) || pods.get('MP-04');
    if (!pod) return;
    pods.forEach((p, k) => {
      const sel = k === code;
      p.base.material.color.setHex(sel ? 0xe41513 : (p.isCorp ? 0x3b52b8 : 0x292e6f));
      p.top.material.color.setHex(sel ? 0xb80d0b : 0x162454);
    });
    beacon.position.set(pod.x, 3.1, pod.z);
    redLight.position.set(pod.x, 3.5, pod.z);

    const target = new THREE.Vector3(pod.x, 0.8, pod.z);
    const dest = new THREE.Vector3(pod.x + 5.2, 8.2, pod.z + 9.2);
    if (animateCam && !reducedMotion.matches) {
      fly = { fromP: camera.position.clone(), toP: dest, fromT: controls.target.clone(), toT: target, start: performance.now() };
    } else {
      camera.position.copy(dest);
      controls.target.copy(target);
      controls.update();
    }
    const lbl = document.getElementById('arena-focused-label');
    if (lbl) lbl.textContent = `MASA: ${code}`;
  }
  focusTable('MP-04', false);

  document.addEventListener('summitted-focus-mp', (ev) => {
    if (ev.detail?.tableId) focusTable(ev.detail.tableId, true);
  });

  document.getElementById('btn-arena-overview')?.addEventListener('click', () => {
    fly = {
      fromP: camera.position.clone(),
      toP: new THREE.Vector3(0, 18, 24),
      fromT: controls.target.clone(),
      toT: new THREE.Vector3(0, 0, 0),
      start: performance.now()
    };
  });

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

  function loop(now) {
    requestAnimationFrame(loop);
    if (document.hidden || host.offsetParent === null) return;
    if (fly) {
      const p = Math.min(1, (now - fly.start) / 650);
      const ease = 1 - Math.pow(1 - p, 3);
      camera.position.lerpVectors(fly.fromP, fly.toP, ease);
      controls.target.lerpVectors(fly.fromT, fly.toT, ease);
      if (p >= 1) fly = null;
    }
    controls.update();
    beacon.rotation.y = now * 0.0015;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
}
