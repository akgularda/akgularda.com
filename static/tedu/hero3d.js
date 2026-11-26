/* ==========================================================================
   SummitTED 2026 — Three.js Kinetic Hero Constellation & Architectural Field
   Smooth 60fps interactive WebGL scene: mouse parallax, synergy filaments,
   and luminous TED Red (#E41513) + TEDÜ Sapphire (#3B63F6) orbital geometry.
   ========================================================================== */

import * as THREE from './vendor/three.module.js';

const canvasHost = document.getElementById('hero-webgl');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (canvasHost) {
  try {
    initHeroWebGL(canvasHost);
  } catch (err) {
    console.warn('Hero WebGL fallback:', err);
  }
}

function initHeroWebGL(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 180);
  camera.position.set(0, 1.5, 28);

  const root = new THREE.Group();
  scene.add(root);

  // 1. Wireframe Architectural Rings (Davos × Slush'D Orbital Precision)
  const ringGroup = new THREE.Group();
  ringGroup.position.set(7.5, 0.4, -4);
  root.add(ringGroup);

  const ringMatRed = new THREE.MeshBasicMaterial({ color: 0xe41513, wireframe: true, transparent: true, opacity: 0.26 });
  const ringMatBlue = new THREE.MeshBasicMaterial({ color: 0x4b73ff, wireframe: true, transparent: true, opacity: 0.22 });

  const torusOuter = new THREE.Mesh(new THREE.TorusGeometry(8.8, 0.06, 8, 96), ringMatBlue);
  torusOuter.rotation.x = 1.12;
  torusOuter.rotation.y = -0.35;
  ringGroup.add(torusOuter);

  const torusMid = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.05, 8, 84), ringMatRed);
  torusMid.rotation.x = -0.85;
  torusMid.rotation.y = 0.52;
  ringGroup.add(torusMid);

  const icosa = new THREE.Mesh(
    new THREE.IcosahedronGeometry(4.1, 1),
    new THREE.MeshBasicMaterial({ color: 0x6f92ff, wireframe: true, transparent: true, opacity: 0.16 })
  );
  ringGroup.add(icosa);

  // 2. Dynamic Synergy Nodes & Connecting Filaments
  const NODE_COUNT = 68;
  const nodes = [];
  const positions = new Float32Array(NODE_COUNT * 3);
  const colors = new Float32Array(NODE_COUNT * 3);

  const cRed = new THREE.Color('#FF3B38');
  const cBlue = new THREE.Color('#668CFF');
  const cWhite = new THREE.Color('#E8EEFF');

  let seed = 109;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = (rnd() - 0.38) * 36;
    const y = (rnd() - 0.5) * 18;
    const z = (rnd() - 0.5) * 14 - 2;
    nodes.push({
      x, y, z,
      vx: (rnd() - 0.5) * 0.016,
      vy: (rnd() - 0.5) * 0.014,
      vz: (rnd() - 0.5) * 0.012
    });
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const pick = i % 5 === 0 ? cRed : (i % 2 === 0 ? cBlue : cWhite);
    colors[i * 3] = pick.r;
    colors[i * 3 + 1] = pick.g;
    colors[i * 3 + 2] = pick.b;
  }

  const ptsGeo = new THREE.BufferGeometry();
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  ptsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const ptsMat = new THREE.PointsMaterial({
    size: 0.24,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending
  });
  const pointsMesh = new THREE.Points(ptsGeo, ptsMat);
  root.add(pointsMesh);

  // Pre-allocated line segments buffer for nearby nodes
  const MAX_LINES = NODE_COUNT * 6;
  const linePositions = new Float32Array(MAX_LINES * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x5c7cfa,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
  root.add(linesMesh);

  // Subtle architectural ground grid
  const grid = new THREE.GridHelper(64, 32, 0xe41513, 0x1d2d63);
  grid.position.y = -8.5;
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  root.add(grid);

  let targetX = 0;
  let targetY = 0;
  window.addEventListener('pointermove', (e) => {
    targetX = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2.4;
    targetY = -(e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 1.6;
  }, { passive: true });

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

  let inView = true;
  new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }).observe(host);

  function updateLines() {
    let ptr = 0;
    const maxDistSq = 46;
    for (let i = 0; i < NODE_COUNT; i++) {
      let links = 0;
      for (let j = i + 1; j < NODE_COUNT && links < 4; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        if (dx * dx + dy * dy + dz * dz < maxDistSq && ptr < MAX_LINES * 6 - 6) {
          linePositions[ptr++] = nodes[i].x;
          linePositions[ptr++] = nodes[i].y;
          linePositions[ptr++] = nodes[i].z;
          linePositions[ptr++] = nodes[j].x;
          linePositions[ptr++] = nodes[j].y;
          linePositions[ptr++] = nodes[j].z;
          links++;
        }
      }
    }
    lineGeo.setDrawRange(0, ptr / 3);
    lineGeo.attributes.position.needsUpdate = true;
  }
  updateLines();

  function tick(t) {
    requestAnimationFrame(tick);
    if (!inView || document.hidden) return;

    const sec = t * 0.001;
    if (!reducedMotion.matches) {
      torusOuter.rotation.z = sec * 0.14;
      torusMid.rotation.z = -sec * 0.19;
      icosa.rotation.y = sec * 0.22;
      icosa.rotation.x = sec * 0.11;

      const posAttr = ptsGeo.attributes.position;
      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;
        if (n.x > 22 || n.x < -20) n.vx *= -1;
        if (n.y > 10 || n.y < -10) n.vy *= -1;
        if (n.z > 6 || n.z < -10) n.vz *= -1;
        posAttr.setXYZ(i, n.x, n.y, n.z);
      }
      posAttr.needsUpdate = true;
      updateLines();
    }

    root.rotation.y += (targetX * 0.12 - root.rotation.y) * 0.05;
    root.rotation.x += (targetY * 0.08 - root.rotation.x) * 0.05;

    renderer.render(scene, camera);
  }
  requestAnimationFrame(tick);
}
