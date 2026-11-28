/* ==========================================================================
   SummitTED Mobile App (/tedu-app) — Three.js Architectural TED-TEDÜ Engine
   1. Desktop Backdrop (#pc-stage-webgl): Subtle architectural wireframe grid
   2. Embedded Mobile 3D TEDÜ Fuaye Meeting Point (#mp-arena-webgl):
      Grounded directly in TEDU360 Hoşgeldiniz & Fuaye architecture:
      - Honey-oak inlaid central walkway framed by dark veined marble & travertine
      - Glossy black rectangular columns with vertical glowing TEDÜ blue LED strips
      - Suspended chrome TEDÜ entrance emblem ring centerpiece
      - Matte dark-navy ceiling fascia with TED crimson-red cornice accent line
      - 24 numbered Meeting Point tables (MP-01..MP-24) flanking the Fuaye aisle
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
  gridBottom.material.opacity = 0.24;
  root.add(gridBottom);

  const frameMatNavy = new THREE.EdgesGeometry(new THREE.BoxGeometry(11, 11, 11));
  const cubeLeft = new THREE.LineSegments(
    frameMatNavy,
    new THREE.LineBasicMaterial({ color: 0x292e6f, transparent: true, opacity: 0.42 })
  );
  cubeLeft.position.set(-15, 1, -6);
  root.add(cubeLeft);

  const frameMatRed = new THREE.EdgesGeometry(new THREE.BoxGeometry(8.5, 8.5, 8.5));
  const cubeRight = new THREE.LineSegments(
    frameMatRed,
    new THREE.LineBasicMaterial({ color: 0xe41513, transparent: true, opacity: 0.34 })
  );
  cubeRight.position.set(15, -1, -5);
  root.add(cubeRight);

  let mx = 0;
  let my = 0;
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 1.2;
    my = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 0.8;
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
    const s = now * 0.0004;
    if (!reducedMotion.matches) {
      cubeLeft.rotation.x = s;
      cubeLeft.rotation.y = s * 1.25;
      cubeRight.rotation.x = -s * 1.05;
      cubeRight.rotation.y = s * 0.85;
    }
    root.rotation.y += (mx * 0.07 - root.rotation.y) * 0.05;
    root.rotation.x += (my * 0.04 - root.rotation.x) * 0.05;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}

// 2. Embedded Mobile 3D TEDÜ Fuaye Meeting Point Hall (MP-01 .. MP-24)
const arenaHost = document.getElementById('mp-arena-webgl');
if (arenaHost) {
  try {
    initFuayeMeetingHall(arenaHost);
  } catch (e) {
    console.warn('Fuaye 3D WebGL fallback:', e);
  }
}

function initFuayeMeetingHall(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
  renderer.setClearColor(0x0b1224, 1);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b1224, 0.015);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 140);
  camera.position.set(0, 17, 25);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 8.5;
  controls.maxDistance = 38;
  controls.maxPolarAngle = Math.PI / 2.15;

  scene.add(new THREE.AmbientLight(0xf3f5fc, 1.45));
  const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.95);
  keyLight.position.set(10, 22, 12);
  scene.add(keyLight);

  const redLight = new THREE.PointLight(0xe41513, 4.2, 16);
  redLight.position.set(0, 4, 0);
  scene.add(redLight);

  // TEDU360 Fuaye Floor: Warm travertine outer gallery + dark veined marble frame + honey-oak central inlay!
  const outerFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 30),
    new THREE.MeshStandardMaterial({ color: 0xcfc4b2, roughness: 0.72, metalness: 0.05 })
  );
  outerFloor.rotation.x = -Math.PI / 2;
  scene.add(outerFloor);

  const marbleBorder = new THREE.Mesh(
    new THREE.PlaneGeometry(11.6, 22),
    new THREE.MeshStandardMaterial({ color: 0x1e202b, roughness: 0.34, metalness: 0.24 })
  );
  marbleBorder.rotation.x = -Math.PI / 2;
  marbleBorder.position.y = 0.02;
  scene.add(marbleBorder);

  const oakInlay = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 16.5),
    new THREE.MeshStandardMaterial({ color: 0xc28a56, roughness: 0.54, metalness: 0.06 })
  );
  oakInlay.rotation.x = -Math.PI / 2;
  oakInlay.position.y = 0.04;
  scene.add(oakInlay);

  // TEDU360 Signature: 4 Glossy Black Structural Columns with Vertical Glowing TEDÜ Blue LED Strips!
  const blackColMat = new THREE.MeshStandardMaterial({ color: 0x101420, roughness: 0.22, metalness: 0.45 });
  const blueLedMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
  for (const [cx, cz] of [[-4.8, -5.8], [4.8, -5.8], [-4.8, 5.8], [4.8, 5.8]]) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.15, 6.2, 1.15), blackColMat);
    col.position.set(cx, 3.1, cz);
    scene.add(col);
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.14, 6.0, 0.14), blueLedMat);
    led.position.set(cx + (cx < 0 ? 0.56 : -0.56), 3.1, cz + (cz < 0 ? 0.56 : -0.56));
    scene.add(led);
  }

  // TEDU360 Signature: Back Black-Framed Glass Curtain Wall & Crimson Red Cornice Accent Line
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x141a28, roughness: 0.4, metalness: 0.35 });
  const corniceTop = new THREE.Mesh(new THREE.BoxGeometry(44, 0.5, 0.6), frameMat);
  corniceTop.position.set(0, 6.3, -12.6);
  scene.add(corniceTop);

  const redCornice = new THREE.Mesh(new THREE.BoxGeometry(44, 0.16, 0.65), new THREE.MeshBasicMaterial({ color: 0xe41513 }));
  redCornice.position.set(0, 5.95, -12.6);
  scene.add(redCornice);

  for (let gx = -20; gx <= 20; gx += 5) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.0, 0.22), frameMat);
    mullion.position.set(gx, 3.0, -12.6);
    scene.add(mullion);
  }
  const glassWall = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 5.8),
    new THREE.MeshStandardMaterial({ color: 0x5c80a8, transparent: true, opacity: 0.24, roughness: 0.15, metalness: 0.4 })
  );
  glassWall.position.set(0, 3.0, -12.65);
  scene.add(glassWall);

  // Suspended Chrome TEDÜ Gimbal Sphere Emblem Centerpiece (Hoşgeldiniz Atrium signature!)
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdbe3ee, metalness: 0.85, roughness: 0.18 });
  const emblemGroup = new THREE.Group();
  emblemGroup.position.set(0, 3.8, 0);
  emblemGroup.add(new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.08, 12, 36), chromeMat));
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.07, 12, 32), chromeMat);
  innerRing.rotation.y = Math.PI / 2;
  emblemGroup.add(innerRing);
  scene.add(emblemGroup);

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

  // 24 Numbered Meeting Point Tables flanking the central oak walkway (12 West + 12 East)
  const pods = new Map();
  const clickables = [];

  for (let i = 0; i < 24; i++) {
    const code = `MP-${String(i + 1).padStart(2, '0')}`;
    const isEast = i >= 12;
    const localIdx = i % 12;
    const col = localIdx % 3;
    const row = Math.floor(localIdx / 3);
    const x = isEast ? (8.2 + col * 4.4) : (-8.2 - (2 - col) * 4.4);
    const z = (row - 1.5) * 4.6;
    const isCorp = i >= 16;

    const g = new THREE.Group();
    g.position.set(x, 0, z);

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.15, 0.08, 2.15),
      new THREE.MeshBasicMaterial({ color: isCorp ? 0x292e6f : 0x162454 })
    );
    base.position.y = 0.04;
    g.add(base);

    const top = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.14, 1.65),
      new THREE.MeshStandardMaterial({ color: 0x0f1a3e, metalness: 0.3, roughness: 0.38 })
    );
    top.position.y = 1.05;
    top.userData.mpCode = code;
    g.add(top);
    clickables.push(top);

    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.96, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.65, roughness: 0.28 })
    );
    pillar.position.y = 0.52;
    g.add(pillar);

    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: sharpSignTexture(code, isCorp), depthTest: false }));
    sp.position.set(0, 2.15, 0);
    sp.scale.set(2.35, 0.84, 1);
    g.add(sp);

    scene.add(g);
    pods.set(code, { base, top, x, z, isCorp });
  }

  const beacon = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 5.4, 0.32),
    new THREE.MeshBasicMaterial({ color: 0xe41513, transparent: true, opacity: 0.36, blending: THREE.AdditiveBlending })
  );
  beacon.position.set(0, 2.7, 0);
  scene.add(beacon);

  let fly = null;
  function focusTable(code, animateCam = true) {
    const pod = pods.get(code) || pods.get('MP-04');
    if (!pod) return;
    pods.forEach((p, k) => {
      const sel = k === code;
      p.base.material.color.setHex(sel ? 0xe41513 : (p.isCorp ? 0x292e6f : 0x162454));
      p.top.material.color.setHex(sel ? 0xb80d0b : 0x0f1a3e);
    });
    beacon.position.set(pod.x, 2.7, pod.z);
    redLight.position.set(pod.x, 3.4, pod.z);

    const target = new THREE.Vector3(pod.x, 0.8, pod.z);
    const dest = new THREE.Vector3(pod.x + (pod.x < 0 ? 6.0 : -6.0), 8.2, pod.z + 9.4);
    if (animateCam && !reducedMotion.matches) {
      fly = { fromP: camera.position.clone(), toP: dest, fromT: controls.target.clone(), toT: target, start: performance.now() };
    } else {
      camera.position.copy(dest);
      controls.target.copy(target);
      controls.update();
    }
    const lbl = document.getElementById('arena-focused-label');
    if (lbl) lbl.textContent = `FUAYE · ${code}`;
  }
  focusTable('MP-04', false);

  document.addEventListener('summitted-focus-mp', (ev) => {
    if (ev.detail?.tableId) focusTable(ev.detail.tableId, true);
  });

  document.getElementById('btn-arena-overview')?.addEventListener('click', () => {
    fly = {
      fromP: camera.position.clone(),
      toP: new THREE.Vector3(0, 17, 25),
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
    if (!reducedMotion.matches) {
      emblemGroup.rotation.y = now * 0.0005;
      beacon.rotation.y = now * 0.0014;
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
}
