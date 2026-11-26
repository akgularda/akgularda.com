/* ==========================================================================
   SummitTED Kariyer ve İnovasyon Zirvesi 2026 — Flagship Showcase Controller
   Scroll choreography, cursor spotlight, 1:1 interactive App preview,
   clean 3D/2D master plan (architectural capacities, zero fake live telemetry),
   and dual Early-Access / Corporate registration.
   ========================================================================== */

(function () {
  'use strict';

  const Core = window.SummitTEDCore;
  if (!Core) return;

  let selectedKey = 'red';
  let currentFilter = 'all';
  let currentMapMode = '3d';

  // 1. Mobile Navigation Drawer
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const open = !mobileDrawer.hidden;
      mobileDrawer.hidden = open;
      mobileToggle.setAttribute('aria-expanded', String(!open));
    });
    mobileDrawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileDrawer.hidden = true;
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 2. Scroll Reveal Choreography & Cursor Spotlight Surfaces
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // Smooth Number Counter Animation on Hero Stats
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    if (!target) return;
    const start = performance.now();
    const dur = 1100;
    function stepCount(now) {
      const p = Math.min(1, (now - start) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(stepCount);
    }
    requestAnimationFrame(stepCount);
  });

  document.querySelectorAll('.spotlight-surface').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(1)}px`);
      card.style.setProperty('--my', `${(e.clientY - r.top).toFixed(1)}px`);
    }, { passive: true });
  });

  // 3. Interactive 1:1 App Live Showcase Mirror
  const MIRROR_VIEWS = {
    match: `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#FF6E6C;">SLUSH'D YETENEK &amp; ŞİRKET KEŞFİ</span>
          <span style="font-size:11.5px; color:#9FB0D4;">5 Dk Hızlı Eşleşme Modu</span>
        </div>
        <div class="mirror-card-mock">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:8px;">
            <div>
              <strong style="font-size:16px; display:block;">Dr. Burak Özdemir</strong>
              <span style="font-size:12.5px; color:#FF6E6C; font-weight:700;">ASELSAN &middot; Aviyonik Sistemler Takım Lideri</span>
            </div>
            <span class="glass-pill">BLUE ZONE</span>
          </div>
          <p style="margin:0 0 10px; font-size:12.5px; color:#B9C7E6;">Gömülü yazılım, C++ ve savunma elektroniği alanında 3–4. sınıf mühendislik adayları.</p>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <span class="glass-pill">13:55–14:00</span>
            <span class="glass-pill">14:05–14:10</span>
            <span class="glass-pill" style="border-color:#E41513; background:rgba(228,21,19,0.2);">5 DK İSTEK GÖNDER &rarr;</span>
          </div>
        </div>
        <div class="mirror-card-mock" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
            <div>
              <strong style="font-size:15.5px; display:block;">Ece Demirtaş</strong>
              <span style="font-size:12.5px; color:#93B4FF; font-weight:700;">DenizBank &middot; Dijital Bankacılık &amp; FinTech Müdürü</span>
            </div>
            <span class="glass-pill">RED ZONE</span>
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#9FB0D4;">
        <span>Rol, sektör ve yetkinlik etiketlerine göre filtreleme</span>
        <a href="../tedu-app/" style="color:#FFFFFF; font-weight:700; text-decoration:none;">Canlı Dene &rarr;</a>
      </div>
    `,
    mp: `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#34D399;">OTOMATİK MASA TAHSİS MOTORU</span>
          <span style="font-size:11.5px; color:#9FB0D4;">G Blok Slush'D Arena</span>
        </div>
        <div class="mirror-card-mock" style="border-left:3px solid #10B981;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <strong style="font-size:16px;">Kaan Arslan &middot; MİLSOFT</strong>
            <span class="glass-pill" style="background:rgba(16,185,129,0.2); border-color:#10B981;">KABUL EDİLDİ</span>
          </div>
          <p style="margin:0 0 12px; font-size:12.5px; color:#B9C7E6;">Yapay zeka ve veri füzyonu mimarisi üzerine 5 dakikalık tanışma oturumu.</p>
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.35); padding:10px 12px;">
            <span style="font-family:var(--font-condensed); font-size:15px; font-weight:700; letter-spacing:0.8px;">ATANAN MASA: <strong style="color:#FF6E6C;">MP-07 (G BLOK BATI)</strong></span>
            <span style="font-family:var(--font-condensed); font-size:18px; font-weight:700; background:#E41513; padding:2px 9px;">05:00</span>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:6px;">
          ${['MP-01','MP-02','MP-03','MP-04','MP-05','MP-06','MP-07','MP-08','MP-09','MP-10','MP-11','MP-12'].map((c) => `
            <div style="padding:6px 4px; text-align:center; font-family:var(--font-condensed); font-size:12px; font-weight:700; border:1px solid ${c === 'MP-07' ? '#E41513' : 'rgba(255,255,255,0.14)'}; background:${c === 'MP-07' ? 'rgba(228,21,19,0.32)' : 'rgba(255,255,255,0.04)'};">${c}</div>
          `).join('')}
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#9FB0D4;">
        <span>3D Arena kamerası onaylanan masanıza odaklanır</span>
        <a href="../tedu-app/?tab=meetings" style="color:#FFFFFF; font-weight:700; text-decoration:none;">3D Arenayı Aç &rarr;</a>
      </div>
    `,
    badge: `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#93B4FF;">DAVOS AKREDİTASYON PROTOKOLÜ</span>
          <span style="font-size:11.5px; color:#9FB0D4;">4 Seviyeli Dijital Yaka Kartı</span>
        </div>
        <div class="mirror-card-mock" style="display:flex; justify-content:space-between; align-items:center; gap:16px; border-top:3px solid #E41513;">
          <div>
            <span style="font-family:var(--font-condensed); font-size:11.5px; letter-spacing:1.2px; background:#E41513; padding:2px 8px; font-weight:700;">ÖĞRENCİ / YETENEK PASS</span>
            <h4 style="margin:8px 0 4px; font-family:var(--font-display); font-size:20px;">Dijital Holografik QR Kart</h4>
            <p style="margin:0; font-size:12.5px; color:#B9C7E6;">Kapı çadırlarında hızlı geçiş, şirket stantlarına tek okutmayla CV bırakma ve akranlarla anlık Meeting Point eşleşmesi.</p>
          </div>
          <div style="width:88px; height:88px; background:#FFFFFF; color:#0B1330; display:flex; align-items:center; justify-content:center; font-family:var(--font-condensed); font-weight:800; font-size:13px; flex-shrink:0; text-align:center; padding:6px;">
            SUMMITTED<br>QR PASS
          </div>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#9FB0D4;">
        <span>Web kamerası ile gerçek QR tarama desteği</span>
        <a href="../tedu-app/?tab=badge" style="color:#FFFFFF; font-weight:700; text-decoration:none;">Kartını Oluştur &rarr;</a>
      </div>
    `
  };

  const mirrorBody = document.getElementById('app-mirror-body');
  if (mirrorBody) {
    mirrorBody.innerHTML = MIRROR_VIEWS.match;
    document.querySelectorAll('[data-preview-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-preview-step]').forEach((b) => b.classList.toggle('is-active', b === btn));
        mirrorBody.innerHTML = MIRROR_VIEWS[btn.dataset.previewStep] || MIRROR_VIEWS.match;
      });
    });
  }

  // 4. Clean Master Plan Blueprint & Inspector (Architectural Capacities — Zero Fake Live %)
  const BLUEPRINT_NODES = [
    { key: 'gate-2', cat: 'gates', x: 360, y: 236, w: 62, h: 56, code: 'GATE-2', title: 'Aksu Çadırı', sub: 'Metro Girişi', fill: '#292E6F' },
    { key: 'gate-1', cat: 'gates', x: 478, y: 236, w: 62, h: 56, code: 'GATE-1', title: 'Ana Giriş', sub: 'İncesu Çadırı', fill: '#E41513' },
    { key: 'gate-3', cat: 'gates', x: 850, y: 88, w: 74, h: 48, code: 'GATE-3', title: 'VIP Çadırı', sub: 'K Blok Doğu', fill: '#0B1330' },

    { key: 'matchmaking', cat: 'matchmaking', x: 40, y: 92, w: 212, h: 86, code: 'MP-01..24', title: 'G Blok · Slush\'D Arena', sub: '5 Dk Eşleşme & 1:1 Mülakat', fill: '#E41513' },
    { key: 'tech', cat: 'stage', x: 40, y: 194, w: 102, h: 224, code: 'D BLOK', title: 'Tech&Innovation', sub: 'Konferans Amfisi', fill: '#1D4ED8' },
    { key: 'plaza', cat: 'lounge', x: 154, y: 194, w: 98, h: 130, code: 'AVLU', title: 'Networking Plaza', sub: 'İkram Çadırları', fill: '#475569' },
    { key: 'innovation', cat: 'innovation', x: 264, y: 92, w: 138, h: 126, code: 'İSTASYON', title: 'Innovation Alley', sub: 'Startup & 5 Dk Pitch', fill: '#0284C7' },
    { key: 'blue', cat: 'company', x: 154, y: 336, w: 248, h: 82, code: 'E BLOK', title: 'Blue Zone · Spor Merkezi', sub: 'ASELSAN · TUSAŞ · MİLSOFT · ROKETSAN', fill: '#292E6F' },

    { key: 'promenade', cat: 'company', x: 548, y: 92, w: 205, h: 74, code: 'PROMENADE', title: 'Davos Promenade Çadırları', sub: 'BBVA Tech · Turkcell AI · HAVELSAN', fill: '#B91C1C' },
    { key: 'plenary', cat: 'stage', x: 766, y: 146, w: 158, h: 98, code: 'K BLOK', title: 'Main Plenary', sub: 'Ahmet Ersan Salonu', fill: '#1E293B' },
    { key: 'communities', cat: 'community', x: 548, y: 180, w: 205, h: 148, code: 'ÇİM AMFİ', title: 'Topluluklar Köyü', sub: '8 Topluluk Çadırı & RadioTEDU', fill: '#D92D20' },
    { key: 'red', cat: 'company', x: 766, y: 256, w: 158, h: 162, code: 'K FUAYE', title: 'Red Zone Fuaye', sub: 'Akfen · DenizBank · EY · KPMG', fill: '#E41513' },
    { key: 'teacher-plus', cat: 'stage', x: 492, y: 342, w: 260, h: 76, code: 'A / B BLOK', title: 'Teacher+ Forumu', sub: 'Eğitim & Akademi Konferansları', fill: '#292E6F' }
  ];

  function render2DBlueprint() {
    const layer = document.getElementById('bp-nodes-layer');
    if (!layer) return;
    const ns = 'http://www.w3.org/2000/svg';
    layer.innerHTML = '';

    BLUEPRINT_NODES.forEach((n) => {
      const g = document.createElementNS(ns, 'g');
      const dimmed = currentFilter !== 'all' && n.cat !== currentFilter;
      g.setAttribute('class', `bp-zone-node${n.key === selectedKey ? ' is-selected' : ''}${dimmed ? ' is-dimmed' : ''}`);

      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('class', 'bp-zone-fill');
      rect.setAttribute('x', n.x);
      rect.setAttribute('y', n.y);
      rect.setAttribute('width', n.w);
      rect.setAttribute('height', n.h);
      rect.setAttribute('fill', n.fill);
      rect.setAttribute('fill-opacity', '0.88');
      rect.setAttribute('stroke', 'rgba(255,255,255,0.42)');
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      const codeText = document.createElementNS(ns, 'text');
      codeText.setAttribute('x', n.x + 8);
      codeText.setAttribute('y', n.y + 17);
      codeText.setAttribute('fill', '#FFD6D5');
      codeText.setAttribute('font-family', 'Barlow Condensed, sans-serif');
      codeText.setAttribute('font-size', '11.5');
      codeText.setAttribute('font-weight', '700');
      codeText.textContent = n.code;
      g.appendChild(codeText);

      const titleText = document.createElementNS(ns, 'text');
      titleText.setAttribute('x', n.x + 8);
      titleText.setAttribute('y', n.y + 35);
      titleText.setAttribute('fill', '#FFFFFF');
      titleText.setAttribute('font-family', 'Outfit, sans-serif');
      titleText.setAttribute('font-size', n.w < 95 ? '11.5' : '13.5');
      titleText.setAttribute('font-weight', '700');
      titleText.textContent = n.title;
      g.appendChild(titleText);

      if (n.h >= 66 && n.w >= 90) {
        const subText = document.createElementNS(ns, 'text');
        subText.setAttribute('x', n.x + 8);
        subText.setAttribute('y', n.y + 52);
        subText.setAttribute('fill', '#DCE4F7');
        subText.setAttribute('font-family', 'Inter Tight, sans-serif');
        subText.setAttribute('font-size', '10.5');
        subText.textContent = n.sub;
        g.appendChild(subText);
      }

      g.addEventListener('click', () => {
        selectedKey = n.key;
        updateInspector();
        render2DBlueprint();
        document.dispatchEvent(new CustomEvent('summitted-external-select', { detail: { key: n.key, fly: false } }));
      });
      layer.appendChild(g);
    });
  }

  function updateInspector() {
    const snap = Core.getSnapshot();
    const kickerEl = document.getElementById('insp-kicker');
    const titleEl = document.getElementById('insp-title');
    const bldgEl = document.getElementById('insp-building');
    const sumEl = document.getElementById('insp-summary');
    const capVal = document.getElementById('insp-cap-val');
    const sublist = document.getElementById('insp-sublist');
    if (!titleEl) return;

    const gate = Core.GATES.find((g) => g.id === selectedKey);
    if (gate) {
      kickerEl.textContent = `AKREDİTASYON & KARŞILAMA ÇADIRI · ${gate.code}`;
      titleEl.textContent = gate.name;
      bldgEl.textContent = gate.location;
      sumEl.textContent = gate.role;
      capVal.textContent = 'Davos 4-Seviye Yaka Kartı & Hızlı QR Geçiş';
      sublist.innerHTML = `
        <li><span>Öğrenci &amp; Mezun Akreditasyonu</span><code>LACİVERT PASS</code></li>
        <li><span>Kurumsal İK &amp; Şirket Heyeti</span><code>KIRMIZI PASS</code></li>
        <li><span>Startup, Yatırımcı &amp; Konuşmacı</span><code>VIP PASS</code></li>
      `;
      return;
    }

    const z = snap.zonesById[selectedKey] || snap.zones[0];
    kickerEl.textContent = `${z.categoryLabel.toUpperCase()} · ${z.code}`;
    titleEl.textContent = z.name;
    bldgEl.textContent = z.building;
    sumEl.textContent = z.summary;
    capVal.textContent = z.stands && z.stands.length
      ? `${z.capacity} Kişi Kapasite · ${z.stands.length} Kurumsal/Topluluk Noktası`
      : `${z.capacity} Kişi Mimari Kapasite`;

    if (z.id === 'matchmaking') {
      sublist.innerHTML = `
        <li><span>Batı Kanadı (5 Dk Speed Networking)</span><code>MP-01 .. MP-16</code></li>
        <li><span>Doğu Kanadı (15 Dk 1:1 Kurumsal Mülakat)</span><code>MP-17 .. MP-24</code></li>
        <li><span>Eşleşme Yönetimi</span><code>SUMMITTED WEB APP</code></li>
      `;
    } else if (z.stands && z.stands.length > 0) {
      sublist.innerHTML = z.stands.map((s) => `
        <li>
          <span><strong>${s.name}</strong> <small style="color:#69758C;">· ${s.focus}</small></span>
          <code>${s.code}</code>
        </li>
      `).join('');
    } else {
      sublist.innerHTML = Core.SESSIONS.filter((s) => s.zoneId === z.id).map((s) => `
        <li>
          <span><strong>${s.start}</strong> · ${s.title}</span>
          <code>${s.tag}</code>
        </li>
      `).join('');
    }
  }

  const modeBtns = document.querySelectorAll('[data-map-mode]');
  const world3D = document.getElementById('submitted-world');
  const world2D = document.getElementById('blueprint-2d');

  function setMapMode(mode) {
    currentMapMode = mode;
    modeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mapMode === mode));
    if (world3D && world2D) {
      world3D.hidden = mode !== '3d';
      world2D.hidden = mode !== '2d';
    }
    if (mode === '2d') render2DBlueprint();
  }
  modeBtns.forEach((b) => b.addEventListener('click', () => setMapMode(b.dataset.mapMode)));
  document.addEventListener('summitted-force-2d', () => setMapMode('2d'));

  document.querySelectorAll('[data-zone-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.zoneFilter;
      document.querySelectorAll('[data-zone-filter]').forEach((c) => c.classList.toggle('is-active', c === chip));
      document.dispatchEvent(new CustomEvent('summitted-filter-changed', { detail: { filter: currentFilter } }));
      if (currentFilter !== 'all') {
        const match = BLUEPRINT_NODES.find((n) => n.cat === currentFilter);
        if (match) {
          selectedKey = match.key;
          updateInspector();
        }
      }
      render2DBlueprint();
    });
  });

  document.addEventListener('summitted-map-picked', (ev) => {
    if (ev.detail?.key) {
      selectedKey = ev.detail.key;
      updateInspector();
      render2DBlueprint();
    }
  });

  // 5. Render Flowing Editorial Zone Stream
  const streamHost = document.getElementById('zones-stream-grid');
  if (streamHost) {
    const gateItems = Core.GATES.map((g) => ({
      code: g.code,
      title: g.name,
      sub: `${g.location} — ${g.role}`,
      cap: 'AKREDİTASYON ÇADIRI',
      isRed: true
    }));
    const zoneItems = Core.ZONES.map((z, i) => ({
      code: z.code,
      title: z.name,
      sub: `${z.building} — ${z.summary}`,
      cap: `${z.capacity} KİŞİ`,
      isRed: i % 2 === 0
    }));
    streamHost.innerHTML = [...gateItems, ...zoneItems].map((item) => `
      <div class="zone-stream-item ${item.isRed ? 'is-red' : ''}">
        <div>
          <span style="font-family:var(--font-condensed); font-size:12px; font-weight:700; letter-spacing:1px; color:#E41513;">${item.code}</span>
          <h3>${item.title}</h3>
          <p>${item.sub}</p>
        </div>
        <span class="zone-cap-pill">${item.cap}</span>
      </div>
    `).join('');
  }

  // 6. Dual Early-Access Registration & Corporate Request Forms
  const regTabs = document.querySelectorAll('[data-reg-mode]');
  const talentForm = document.getElementById('talent-reg-form');
  const corpForm = document.getElementById('corp-reg-form');
  const regFeedback = document.getElementById('reg-feedback');

  regTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isTalent = btn.dataset.regMode === 'talent';
      regTabs.forEach((b) => b.classList.toggle('is-active', b === btn));
      if (talentForm) talentForm.hidden = !isTalent;
      if (corpForm) corpForm.hidden = isTalent;
      if (regFeedback) regFeedback.hidden = true;
    });
  });

  if (talentForm) {
    talentForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = document.getElementById('tr-name').value.trim();
      const email = document.getElementById('tr-email').value.trim();
      const roleType = document.getElementById('tr-role').value;
      const org = document.getElementById('tr-dept').value.trim();
      const tags = document.getElementById('tr-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
      Core.saveBadge({
        name,
        email,
        roleType,
        org: `TEDÜ · ${org}`,
        tags: tags.length ? tags : ['SummitTED 2026']
      });
      if (regFeedback) {
        regFeedback.hidden = false;
        regFeedback.innerHTML = `<strong>Ön kaydınız alındı, ${name}!</strong> Dijital SummitTED Yaka Kartınız hazırlandı — <a href="../tedu-app/?tab=badge" style="color:#FFFFFF; font-weight:800;">3D Yaka Kartınızı Görüntülemek İçin Tıklayın &rarr;</a>`;
      }
      talentForm.reset();
    });
  }

  if (corpForm) {
    corpForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const company = document.getElementById('cr-company').value.trim();
      const person = document.getElementById('cr-person').value.trim();
      if (regFeedback) {
        regFeedback.hidden = false;
        regFeedback.innerHTML = `<strong>Teşekkürler ${person} (${company})!</strong> Kurumsal sponsorluk ve pavilyon portfolyo talebiniz TED Üniversitesi Kariyer Merkezi ekibine iletildi.`;
      }
      corpForm.reset();
    });
  }

  updateInspector();
})();
