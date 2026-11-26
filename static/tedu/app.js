/* ==========================================================================
   SummitTED Kariyer ve İnovasyon Zirvesi 2026 — Main Site Controller (/tedu)
   Drives 2D/3D Campus Master Map, Inspector, Live Hero Telemetry, 10 Zones,
   3 Gates, MP Matrix, and Dynamic Schedule.
   ========================================================================== */

(function () {
  'use strict';

  const Core = window.SummitTEDCore;
  if (!Core) return;

  let selectedKey = 'red';
  let currentFilter = 'all';
  let currentMapMode = '3d';

  // Mobile Menu
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

  // 2D Blueprint Layout Coordinates (Gates + 10 Zones)
  const BLUEPRINT_NODES = [
    { key: 'gate-2', cat: 'gates', x: 360, y: 236, w: 62, h: 56, code: 'GATE-2', title: 'Aksu Çadırı', sub: 'Metro & QR', fill: '#292E6F' },
    { key: 'gate-1', cat: 'gates', x: 478, y: 236, w: 62, h: 56, code: 'GATE-1', title: 'Ana Giriş', sub: 'İncesu Çadırı', fill: '#E41513' },
    { key: 'gate-3', cat: 'gates', x: 850, y: 88, w: 74, h: 48, code: 'GATE-3', title: 'VIP Çadırı', sub: 'K Blok Doğu', fill: '#0B1330' },

    { key: 'matchmaking', cat: 'matchmaking', x: 40, y: 92, w: 235, h: 86, code: 'MP-01..24', title: 'G Blok · Slush\'D Arena', sub: '5 Dk Eşleşme & 1:1 Mülakat Masaları', fill: '#E41513' },
    { key: 'tech', cat: 'stage', x: 40, y: 194, w: 102, h: 224, code: 'D BLOK', title: 'Tech&Innovation', sub: 'Konferans Amfisi', fill: '#1D4ED8' },
    { key: 'plaza', cat: 'lounge', x: 154, y: 194, w: 94, h: 130, code: 'AVLU', title: 'Networking Plaza', sub: 'İkram Çadırları', fill: '#475569' },
    { key: 'innovation', cat: 'innovation', x: 260, y: 92, w: 142, h: 126, code: 'İSTASYON', title: 'Innovation Alley', sub: 'Startup & 5 Dk Pitch', fill: '#0284C7' },
    { key: 'blue', cat: 'company', x: 154, y: 336, w: 248, h: 82, code: 'E BLOK', title: 'Blue Zone · Spor Merkezi', sub: 'ASELSAN · TUSAŞ · MİLSOFT · ROKETSAN', fill: '#292E6F' },

    { key: 'promenade', cat: 'company', x: 548, y: 92, w: 205, h: 74, code: 'PROMENADE', title: 'Davos Promenade Çadırları', sub: 'BBVA Tech · Turkcell AI · HAVELSAN', fill: '#B91C1C' },
    { key: 'plenary', cat: 'stage', x: 766, y: 146, w: 158, h: 98, code: 'K BLOK', title: 'Main Plenary', sub: 'Ahmet Ersan Salonu', fill: '#1E293B' },
    { key: 'communities', cat: 'community', x: 548, y: 180, w: 205, h: 148, code: 'ÇİM AMFİ', title: 'Topluluklar Köyü', sub: '8 Topluluk Çadırı & RadioTEDU', fill: '#D92D20' },
    { key: 'red', cat: 'company', x: 766, y: 256, w: 158, h: 162, code: 'K FUAYE', title: 'Red Zone Fuaye', sub: 'Akfen · DenizBank · EY · KPMG', fill: '#E41513' },
    { key: 'teacher-plus', cat: 'stage', x: 492, y: 342, w: 260, h: 76, code: 'A / B BLOK', title: 'Teacher+ Forumu', sub: 'Eğitim & Akademi Konferansları', fill: '#292E6F' }
  ];

  function render2DBlueprint(snap) {
    const layer = document.getElementById('bp-nodes-layer');
    if (!layer) return;
    const ns = 'http://www.w3.org/2000/svg';
    layer.innerHTML = '';

    BLUEPRINT_NODES.forEach((n) => {
      const g = document.createElementNS(ns, 'g');
      const dimmed = currentFilter !== 'all' && n.cat !== currentFilter;
      g.setAttribute('class', `bp-zone-node${n.key === selectedKey ? ' is-selected' : ''}${dimmed ? ' is-dimmed' : ''}`);
      g.dataset.key = n.key;

      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('class', 'bp-zone-fill');
      rect.setAttribute('x', n.x);
      rect.setAttribute('y', n.y);
      rect.setAttribute('width', n.w);
      rect.setAttribute('height', n.h);
      rect.setAttribute('fill', n.fill);
      rect.setAttribute('fill-opacity', '0.86');
      rect.setAttribute('stroke', 'rgba(255,255,255,0.45)');
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      const codeText = document.createElementNS(ns, 'text');
      codeText.setAttribute('x', n.x + 8);
      codeText.setAttribute('y', n.y + 17);
      codeText.setAttribute('fill', '#FFD6D5');
      codeText.setAttribute('font-family', 'Barlow Condensed, sans-serif');
      codeText.setAttribute('font-size', '11.5');
      codeText.setAttribute('font-weight', '700');
      const metric = snap.zonesById[n.key]
        ? `%${snap.zonesById[n.key].pct}`
        : `${(snap.gates.find((x) => x.id === n.key) || {}).count || ''} GİRİŞ`;
      codeText.textContent = `${n.code} · ${metric}`;
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
        updateInspector(Core.getSnapshot());
        render2DBlueprint(Core.getSnapshot());
        document.dispatchEvent(new CustomEvent('summitted-external-select', { detail: { key: n.key, fly: false } }));
      });

      layer.appendChild(g);
    });
  }

  function updateInspector(snap) {
    const kickerEl = document.getElementById('insp-kicker');
    const titleEl = document.getElementById('insp-title');
    const bldgEl = document.getElementById('insp-building');
    const sumEl = document.getElementById('insp-summary');
    const occLabel = document.getElementById('insp-occ-label');
    const occVal = document.getElementById('insp-occ-val');
    const occFill = document.getElementById('insp-occ-fill');
    const sublist = document.getElementById('insp-sublist');
    const qrLink = document.getElementById('insp-qr-link');

    if (!titleEl) return;

    const gate = snap.gates.find((g) => g.id === selectedKey);
    if (gate) {
      kickerEl.textContent = `AKREDİTASYON ÇADIRI · ${gate.code}`;
      titleEl.textContent = gate.name;
      bldgEl.textContent = gate.location;
      sumEl.textContent = gate.role;
      occLabel.textContent = 'Bugün Akredite Geçiş';
      occVal.textContent = `${gate.count} Katılımcı`;
      occFill.style.width = '78%';
      occFill.style.backgroundColor = '#E41513';
      sublist.innerHTML = `
        <li><span>Öğrenci / Mezun Yaka Kartı</span><code>LACİVERT ŞERİT</code></li>
        <li><span>Şirket İK &amp; Mühendislik Heyeti</span><code>KIRMIZI ŞERİT</code></li>
        <li><span>Startup / Yatırımcı / VIP</span><code>BEYAZ ŞERİT</code></li>
        <li><span>Hızlı QR Turnike Kodu</span><code>${gate.code}</code></li>
      `;
      if (qrLink) qrLink.href = `../tedu-app/?tab=scan&qr=${encodeURIComponent(gate.code)}`;
      return;
    }

    const z = snap.zonesById[selectedKey] || snap.zones[0];
    kickerEl.textContent = `${z.categoryLabel.toUpperCase()} · ${z.code}`;
    titleEl.textContent = z.name;
    bldgEl.textContent = z.building;
    sumEl.textContent = z.summary;
    occLabel.textContent = `Canlı Alan Yoğunluğu (${z.status.label})`;
    occVal.textContent = `${z.count} / ${z.capacity} (%${z.pct})`;
    occFill.style.width = `${z.pct}%`;
    occFill.style.backgroundColor = z.pct >= 84 ? '#E41513' : '#292E6F';
    if (qrLink) qrLink.href = `../tedu-app/?tab=scan&qr=${encodeURIComponent(z.code)}`;

    if (z.id === 'matchmaking') {
      sublist.innerHTML = `
        <li><span>Batı Kanadı (5 Dk Hızlı Eşleşme)</span><code>MP-01 .. MP-16</code></li>
        <li><span>Doğu Kanadı (15 Dk 1:1 Mülakat)</span><code>MP-17 .. MP-24</code></li>
        <li><span>Şu An Aktif Görüşme Masası</span><code>${snap.occupiedTablesCount} / 24 MASA</code></li>
        <li><span>Eşleşme Protokolü</span><code>KABUL/RET + QR</code></li>
      `;
    } else if (z.stands && z.stands.length > 0) {
      sublist.innerHTML = z.stands.map((s) => `
        <li>
          <span><strong>${s.name}</strong> <small style="color:#69758C;">· ${s.focus}</small></span>
          <code>${s.code} · %${s.pct}</code>
        </li>
      `).join('');
    } else {
      const zoneSessions = snap.sessions.filter((s) => s.zoneId === z.id);
      sublist.innerHTML = zoneSessions.map((s) => `
        <li>
          <span><strong>${s.start}</strong> · ${s.title}</span>
          <code>${s.stateTag === 'live' ? 'CANLI' : s.tag}</code>
        </li>
      `).join('');
    }
  }

  // Map Mode Switch (3D vs 2D)
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
    if (mode === '2d') render2DBlueprint(Core.getSnapshot());
  }

  modeBtns.forEach((b) => b.addEventListener('click', () => setMapMode(b.dataset.mapMode)));
  document.addEventListener('summitted-force-2d', () => setMapMode('2d'));

  // Filter Chips
  document.querySelectorAll('[data-zone-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      currentFilter = chip.dataset.zoneFilter;
      document.querySelectorAll('[data-zone-filter]').forEach((c) => c.classList.toggle('is-active', c === chip));
      document.dispatchEvent(new CustomEvent('summitted-filter-changed', { detail: { filter: currentFilter } }));
      if (currentFilter !== 'all') {
        const match = BLUEPRINT_NODES.find((n) => n.cat === currentFilter);
        if (match) {
          selectedKey = match.key;
          updateInspector(Core.getSnapshot());
        }
      }
      render2DBlueprint(Core.getSnapshot());
    });
  });

  document.addEventListener('summitted-map-picked', (ev) => {
    if (ev.detail?.key) {
      selectedKey = ev.detail.key;
      updateInspector(Core.getSnapshot());
      render2DBlueprint(Core.getSnapshot());
    }
  });

  function renderDirectory(snap) {
    const gatesGrid = document.getElementById('gates-grid');
    if (gatesGrid) {
      gatesGrid.innerHTML = snap.gates.map((g) => `
        <div class="gate-card">
          <small>${g.code} &middot; CANLI GEÇİŞ: ${g.count} KİŞİ</small>
          <strong>${g.name}</strong>
          <p>${g.location} — ${g.role}</p>
        </div>
      `).join('');
    }

    const zonesGrid = document.getElementById('zones-cards-grid');
    if (zonesGrid) {
      zonesGrid.innerHTML = snap.zones.map((z, idx) => {
        const subItems = z.id === 'matchmaking'
          ? ['MP-01..16 (5 Dk)', 'MP-17..24 (1:1)', 'Kabul / Ret Akışı', 'QR Sayaç']
          : (z.stands && z.stands.length
            ? z.stands.slice(0, 4).map((s) => s.name)
            : snap.sessions.filter((s) => s.zoneId === z.id).map((s) => `${s.start} ${s.speaker.split(' ')[0]}`));
        return `
          <article class="arch-card ${idx % 2 === 0 ? 'is-red' : ''}">
            <div>
              <div class="arch-card-top">
                <span class="arch-code">${z.code} &middot; %${z.pct} DOLU</span>
                <span class="arch-cat">${z.categoryLabel}</span>
              </div>
              <h3>${z.name}</h3>
              <div class="arch-loc">${z.building}</div>
              <p>${z.summary}</p>
            </div>
            <div>
              <div class="arch-tags">
                ${subItems.map((t) => `<span class="arch-tag">${t}</span>`).join('')}
              </div>
            </div>
          </article>
        `;
      }).join('');
    }
  }

  function renderMPMatrix(snap) {
    const matrix = document.getElementById('mp-live-matrix');
    const summaryEl = document.getElementById('mp-summary-count');
    if (summaryEl) summaryEl.textContent = `${snap.occupiedTablesCount} / ${snap.totalTablesCount} MASA AKTİF`;
    if (!matrix) return;
    const bookedIds = new Set(snap.acceptedMeetings.map((m) => m.tableId).filter(Boolean));
    matrix.innerHTML = snap.meetingPoints.map((mp, idx) => {
      const busy = bookedIds.has(mp.id) || (idx < snap.occupiedTablesCount && idx % 2 === 0) || idx < 9;
      return `<div class="mp-cell ${busy ? 'is-busy' : 'is-free'}" title="${mp.wing}">${mp.code}</div>`;
    }).join('');
  }

  function renderSchedule(snap) {
    const container = document.getElementById('schedule-container');
    if (!container) return;
    container.innerHTML = snap.sessions.map((s) => `
      <div class="schedule-row ${s.stateTag === 'live' ? 'is-live' : ''}">
        <div class="schedule-time">${s.start} – ${s.end}</div>
        <div class="schedule-stage">${s.stageLabel}</div>
        <div class="schedule-main">
          <strong>${s.title}</strong>
          <span>${s.speaker}</span>
        </div>
        <div>
          <span class="schedule-tag">${s.stateTag === 'live' ? 'ŞU AN SAHNEDE' : (s.stateTag === 'soon' ? `${s.minsUntil} DK İÇİNDE` : s.tag)}</span>
        </div>
      </div>
    `).join('');
  }

  function renderHeroPulse(snap) {
    const clockEl = document.getElementById('hero-summit-clock');
    const totalEl = document.getElementById('hero-total-accredited');
    const mpEl = document.getElementById('hero-mp-active');
    const routeEl = document.getElementById('hero-live-routing');
    if (clockEl) clockEl.textContent = `ZİRVE SAATİ ${snap.clock.hhmm}`;
    if (totalEl) totalEl.textContent = String(snap.totalAccredited);
    if (mpEl) mpEl.textContent = `${snap.occupiedTablesCount} / ${snap.totalTablesCount}`;
    if (routeEl) {
      if (snap.upcomingSoonSessions.length > 0) {
        const next = snap.upcomingSoonSessions[0];
        routeEl.innerHTML = `<strong>${next.minsUntil} DK İÇİNDE BAŞLIYOR &rarr;</strong> ${next.title} (${next.stageLabel})`;
      } else if (snap.liveSessions.length > 0) {
        const cur = snap.liveSessions[0];
        routeEl.innerHTML = `<strong>ŞU AN SAHNEDE &rarr;</strong> ${cur.title} (${cur.stageLabel})`;
      }
    }
  }

  function renderAll(snap) {
    renderHeroPulse(snap);
    updateInspector(snap);
    renderDirectory(snap);
    renderMPMatrix(snap);
    renderSchedule(snap);
    if (currentMapMode === '2d') render2DBlueprint(snap);
  }

  renderAll(Core.getSnapshot());
  Core.subscribe(renderAll);
})();
