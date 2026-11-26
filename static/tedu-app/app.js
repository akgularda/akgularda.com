/* ==========================================================================
   SummitTED Web App (/tedu-app) — Kinetic Matchmaking, 3D MP Focus & Holo Pass
   ========================================================================== */

(function () {
  'use strict';

  const Core = window.SummitTEDCore;
  if (!Core) return;

  let activeTab = 'discover';
  let roleFilter = 'all';
  let searchQuery = '';
  let cameraStream = null;
  let scanInterval = null;

  const ROLE_LABELS = {
    student: 'ÖĞRENCİ / YETENEK PASS',
    company: 'KURUMSAL İK & LİDERLİK PASS',
    startup: 'STARTUP & YATIRIMCI PASS',
    community: 'TOPLULUK LİDERİ PASS',
    speaker: 'VIP KONUŞMACI PASS'
  };

  function bindSpotlights(root = document) {
    root.querySelectorAll('.glass-card').forEach((card) => {
      if (card._spotBound) return;
      card._spotBound = true;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(1)}px`);
        card.style.setProperty('--my', `${(e.clientY - r.top).toFixed(1)}px`);
      }, { passive: true });
    });
  }

  // 3D Holographic Tilt on Personal Pass
  const holoCard = document.getElementById('holo-pass-card');
  if (holoCard) {
    holoCard.addEventListener('pointermove', (e) => {
      const r = holoCard.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rotY = (px - 0.5) * 18;
      const rotX = (0.5 - py) * 14;
      holoCard.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
      holoCard.style.setProperty('--hx', `${(px * 100).toFixed(1)}%`);
      holoCard.style.setProperty('--hy', `${(py * 100).toFixed(1)}%`);
    }, { passive: true });
    holoCard.addEventListener('pointerleave', () => {
      holoCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  function showToast(msg) {
    const t = document.getElementById('app-toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => { t.hidden = true; }, 4300);
  }

  function focus3DTable(tableId) {
    if (!tableId) return;
    document.dispatchEvent(new CustomEvent('summitted-focus-mp', { detail: { tableId } }));
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('[data-view]').forEach((sec) => {
      sec.hidden = sec.dataset.view !== tab;
    });
    document.querySelectorAll('[data-app-tab]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.appTab === tab);
    });
    if (tab !== 'scan') stopCamera();
    if (tab === 'badge') renderBadgeView(Core.getSnapshot());
    if (tab === 'meetings') {
      const snap = Core.getSnapshot();
      const firstAccepted = snap.acceptedMeetings[0];
      if (firstAccepted?.tableId) setTimeout(() => focus3DTable(firstAccepted.tableId), 120);
    }
  }

  document.querySelectorAll('[data-app-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.appTab));
  });
  document.querySelectorAll('[data-jump-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.jumpTab));
  });
  const goDiscoverBtn = document.getElementById('btn-go-discover');
  if (goDiscoverBtn) goDiscoverBtn.addEventListener('click', () => switchTab('discover'));

  function checkInitialUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const qr = params.get('qr');
    const connect = params.get('connect');
    if (connect) {
      const res = Core.processQRCode(window.location.href);
      if (res.ok) {
        switchTab('meetings');
        showToast(res.label);
        if (res.code) setTimeout(() => focus3DTable(res.code), 200);
      }
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (tab && ['discover', 'meetings', 'scan', 'badge', 'schedule'].includes(tab)) {
      switchTab(tab);
    }
    if (qr) {
      const res = Core.processQRCode(qr);
      if (res.ok) showToast(res.label);
      window.history.replaceState({}, '', window.location.pathname + (tab ? `?tab=${tab}` : ''));
    }
  }

  // 1. Discover Feed
  const searchInput = document.getElementById('peer-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderPeers(Core.getSnapshot());
    });
  }

  document.querySelectorAll('[data-role-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      roleFilter = btn.dataset.roleFilter;
      document.querySelectorAll('[data-role-filter]').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderPeers(Core.getSnapshot());
    });
  });

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  function renderPeers(snap) {
    const host = document.getElementById('peers-container');
    if (!host) return;
    const existingByPeer = new Map();
    snap.meetings.forEach((m) => {
      if (m.status !== 'declined') existingByPeer.set(m.peerId, m);
    });

    const filtered = snap.peers.filter((p) => {
      if (roleFilter !== 'all' && p.roleType !== roleFilter) return false;
      if (!searchQuery) return true;
      return `${p.name} ${p.org} ${p.title} ${p.tags.join(' ')} ${p.lookingFor}`.toLowerCase().includes(searchQuery);
    });

    host.innerHTML = filtered.map((p, idx) => {
      const existing = existingByPeer.get(p.id);
      const zoneName = snap.zonesById[p.zoneId]?.shortName || p.zoneId;
      let actionHtml = `<button type="button" class="btn-pulse-red" data-open-req="${p.id}">5 DK EŞLEŞME İSTEĞİ GÖNDER &rarr;</button>`;
      if (existing) {
        if (existing.status === 'accepted') {
          actionHtml = `<button type="button" class="btn-sleek-blue" style="width:100%;" data-jump-mp="${existing.tableId}">3D ARENADA GÖR &middot; ${existing.tableId} (${existing.slot})</button>`;
        } else {
          actionHtml = `<button type="button" class="btn-sleek-ghost" style="width:100%;" data-jump-mp="">İSTEK GÖNDERİLDİ (${existing.slot}) &rarr;</button>`;
        }
      }
      return `
        <article class="glass-card peer-glass-card" style="animation-delay:${Math.min(idx * 0.04, 0.36)}s">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:14px;">
              <div style="display:flex; gap:12px; align-items:center;">
                <div class="peer-orb">${initials(p.name)}</div>
                <div>
                  <h3 class="peer-name">${p.name}</h3>
                  <div class="peer-org-line">${p.org}</div>
                  <div class="peer-role-sub">${p.title}</div>
                </div>
              </div>
              <span class="peer-zone-tag">${zoneName}</span>
            </div>

            <p class="peer-pitch">${p.lookingFor}</p>

            <div class="neon-tags" style="margin-top:12px;">
              ${p.tags.map((t) => `<span class="neon-tag">${t}</span>`).join('')}
            </div>
          </div>

          <div>
            <div class="slot-strip" style="margin-bottom:12px;">
              <small style="font-size:10.5px; font-weight:800; color:#7E90B8;">SLOTS:</small>
              ${p.availableSlots.slice(0, 3).map((s) => `<span class="slot-pill">${s}</span>`).join('')}
            </div>
            ${actionHtml}
          </div>
        </article>
      `;
    }).join('');

    bindSpotlights(host);

    host.querySelectorAll('[data-open-req]').forEach((btn) => {
      btn.addEventListener('click', () => openRequestModal(btn.dataset.openReq));
    });
    host.querySelectorAll('[data-jump-mp]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tbl = btn.dataset.jumpMp;
        switchTab('meetings');
        if (tbl) setTimeout(() => focus3DTable(tbl), 150);
      });
    });
  }

  // Request Modal
  const reqModal = document.getElementById('request-modal');
  const reqForm = document.getElementById('send-req-form');
  const reqCancel = document.getElementById('req-cancel-btn');

  function openRequestModal(peerId) {
    const snap = Core.getSnapshot();
    const peer = snap.peers.find((p) => p.id === peerId);
    if (!peer || !reqModal) return;
    document.getElementById('req-peer-id').value = peer.id;
    document.getElementById('req-modal-title').textContent = `${peer.name} (${peer.org})`;
    document.getElementById('req-modal-sub').textContent = `${peer.title} — Onaylandığında 3D G-Blok Arenası'nda otomatik masa kilitlenir.`;
    document.getElementById('req-slot-select').innerHTML = peer.availableSlots.map((s) => `<option value="${s}">${s} (5 Dakika · G Blok MP)</option>`).join('');
    document.getElementById('req-note-input').value = '';
    reqModal.hidden = false;
  }

  if (reqCancel) reqCancel.addEventListener('click', () => { reqModal.hidden = true; });
  if (reqForm) {
    reqForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const created = Core.sendMatchRequest({
        peerId: document.getElementById('req-peer-id').value,
        slot: document.getElementById('req-slot-select').value,
        note: document.getElementById('req-note-input').value
      });
      reqModal.hidden = true;
      if (created) {
        showToast(`${created.peerName} (${created.peerOrg}) için ${created.slot} eşleşme isteği gönderildi!`);
        switchTab('meetings');
      }
    });
  }

  // 2. 3D Arena & Accept/Decline Inbox
  function renderMeetings(snap) {
    const incomingHost = document.getElementById('incoming-list');
    const otherHost = document.getElementById('accepted-outgoing-list');
    const pendingCount = snap.pendingIncoming.length;

    const railBadge = document.getElementById('rail-pending-badge');
    const incPill = document.getElementById('incoming-count-pill');
    const accPill = document.getElementById('accepted-count-pill');
    const mobLabel = document.getElementById('mob-pending-label');
    if (railBadge) railBadge.textContent = String(pendingCount);
    if (incPill) incPill.textContent = String(pendingCount);
    if (accPill) accPill.textContent = String(snap.acceptedMeetings.length);
    if (mobLabel) mobLabel.textContent = pendingCount > 0 ? `MP (${pendingCount})` : '3D MP';

    if (incomingHost) {
      const incoming = snap.meetings.filter((m) => m.direction === 'incoming');
      incomingHost.innerHTML = incoming.map((m) => `
        <div class="mtg-glass-item status-${m.status}">
          <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
            <div>
              <strong style="font-size:16px;">${m.peerName}</strong>
              <div style="font-size:12.5px; font-weight:700; color:#FF6E6C;">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span class="slot-pill">${m.slot}</span>
          </div>
          <p style="margin:8px 0 12px; font-size:13px; color:#C5D2EE;">"${m.note}"</p>
          ${m.status === 'pending' ? `
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              <button type="button" class="btn-pulse-red" style="width:auto;" data-mtg-accept="${m.id}">KABUL ET &amp; 3D MP ATA</button>
              <button type="button" class="btn-sleek-blue" data-mtg-resched="${m.id}">+5 DK KAYDIR &amp; ONAYLA</button>
              <button type="button" class="btn-sleek-ghost" data-mtg-decline="${m.id}">REDDET</button>
            </div>
          ` : m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <button type="button" class="mp-glow-chip" data-focus-table="${m.tableId}">3D MASA ODAKLA: <strong>${m.tableId}</strong></button>
              <button type="button" class="btn-pulse-red" style="width:auto; padding:8px 14px;" data-start-timer="${m.id}">05:00 SAYACI BAŞLAT</button>
            </div>
          ` : `<div style="font-size:12px; font-weight:700; color:#7E90B8;">REDDEDİLDİ</div>`}
        </div>
      `).join('') || `<p style="font-size:13.5px; color:#7E90B8;">Bekleyen gelen istek yok.</p>`;
    }

    if (otherHost) {
      const seen = new Set();
      const unique = [];
      snap.meetings.filter((m) => m.direction === 'outgoing' || m.status === 'accepted').forEach((m) => {
        if (!seen.has(m.id)) { seen.add(m.id); unique.push(m); }
      });

      otherHost.innerHTML = unique.map((m) => `
        <div class="mtg-glass-item status-${m.status}">
          <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
            <div>
              <strong style="font-size:16px;">${m.peerName}</strong>
              <div style="font-size:12.5px; font-weight:700; color:#93B4FF;">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span class="slot-pill">${m.slot}</span>
          </div>
          <p style="margin:8px 0 12px; font-size:12.5px; color:#C5D2EE;">${m.note}</p>
          ${m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <button type="button" class="mp-glow-chip" data-focus-table="${m.tableId}">G BLOK &middot; <strong>${m.tableId}</strong> (3D GÖSTER)</button>
              <button type="button" class="btn-pulse-red" style="width:auto; padding:8px 14px;" data-start-timer="${m.id}">MASADAYIM &middot; 05:00 BAŞLAT</button>
            </div>
          ` : m.status === 'pending' ? `
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
              <span style="font-size:11.5px; font-weight:800; color:#FBBF24;">ONAY BEKLENİYOR</span>
              <button type="button" class="btn-sleek-blue" data-sim-peer-accept="${m.id}">DEMO: KARŞI TARAF KABUL ETSİN</button>
              <button type="button" class="btn-sleek-ghost" data-mtg-decline="${m.id}">İPTAL</button>
            </div>
          ` : `<div style="font-size:12px; font-weight:700; color:#7E90B8;">İPTAL EDİLDİ</div>`}
        </div>
      `).join('');
    }

    document.querySelectorAll('[data-focus-table]').forEach((b) => {
      b.onclick = () => focus3DTable(b.dataset.focusTable);
    });
    document.querySelectorAll('[data-mtg-accept]').forEach((b) => {
      b.onclick = () => {
        const u = Core.respondToMeeting(b.dataset.mtgAccept, 'accept');
        if (u) {
          focus3DTable(u.tableId);
          showToast(`Eşleşme onaylandı! 3D Arena kamerası ${u.tableId} masasına odaklandı.`);
        }
      };
    });
    document.querySelectorAll('[data-mtg-resched]').forEach((b) => {
      b.onclick = () => {
        const sNow = Core.getSnapshot();
        const cur = sNow.meetings.find((x) => x.id === b.dataset.mtgResched);
        const idx = Math.max(0, sNow.slots5Min.indexOf(cur?.slot));
        const nextSlot = sNow.slots5Min[(idx + 1) % sNow.slots5Min.length];
        const u = Core.respondToMeeting(b.dataset.mtgResched, 'reschedule', nextSlot);
        if (u) {
          focus3DTable(u.tableId);
          showToast(`Saat ${u.slot} olarak güncellendi ve ${u.tableId} masası tahsis edildi!`);
        }
      };
    });
    document.querySelectorAll('[data-mtg-decline]').forEach((b) => {
      b.onclick = () => {
        Core.respondToMeeting(b.dataset.mtgDecline, 'decline');
        showToast('Eşleşme isteği reddedildi / iptal edildi.');
      };
    });
    document.querySelectorAll('[data-sim-peer-accept]').forEach((b) => {
      b.onclick = () => {
        const u = Core.respondToMeeting(b.dataset.simPeerAccept, 'accept');
        if (u) {
          focus3DTable(u.tableId);
          showToast(`${u.peerName} isteğinizi kabul etti! 3D Masa: ${u.tableId}`);
        }
      };
    });
    document.querySelectorAll('[data-start-timer]').forEach((b) => {
      b.onclick = () => {
        const timer = Core.startMeetingTimer(b.dataset.startTimer);
        if (timer) {
          focus3DTable(timer.tableId);
          showToast(`${timer.tableId} masasında ${timer.peerName} ile 05:00 kronometre başladı!`);
        }
      };
    });
  }

  // Radial + Digital 05:00 Countdown
  function updateTimerHUD() {
    const snap = Core.getSnapshot();
    const dock = document.getElementById('active-timer-dock');
    const digits = document.getElementById('timer-digits');
    const label = document.getElementById('timer-peer-label');
    const arc = document.getElementById('timer-ring-arc');
    if (!dock || !digits || !label) return;
    if (!snap.activeTimer) {
      dock.hidden = true;
      return;
    }
    dock.hidden = false;
    const total = snap.activeTimer.durationSec || 300;
    const remSec = Math.max(0, Math.ceil((snap.activeTimer.endsAt - Date.now()) / 1000));
    const mm = String(Math.floor(remSec / 60)).padStart(2, '0');
    const ss = String(remSec % 60).padStart(2, '0');
    digits.textContent = `${mm}:${ss}`;
    label.textContent = `${snap.activeTimer.peerName} (${snap.activeTimer.peerOrg}) · G Blok ${snap.activeTimer.tableId}`;
    if (arc) {
      const circumference = 144.5;
      arc.setAttribute('stroke-dashoffset', ((1 - remSec / total) * circumference).toFixed(1));
    }
    if (remSec === 0) {
      Core.stopMeetingTimer();
      showToast('5 dakikalık görüşme tamamlandı!');
    }
  }
  setInterval(updateTimerHUD, 1000);

  const shareCvBtn = document.getElementById('btn-share-cv');
  if (shareCvBtn) {
    shareCvBtn.addEventListener('click', () => {
      const b = Core.loadBadge();
      showToast(`3D Dijital Yaka Kartınız (${b.email}) karşı tarafa iletildi!`);
    });
  }
  const endTimerBtn = document.getElementById('btn-end-timer');
  if (endTimerBtn) {
    endTimerBtn.addEventListener('click', () => {
      Core.stopMeetingTimer();
      showToast('Görüşme tamamlandı.');
    });
  }

  // 3. 3D Holographic Badge View
  function renderBadgeView(snap) {
    const b = snap.badge;
    const nameEl = document.getElementById('pass-name');
    const orgEl = document.getElementById('pass-org');
    const ribEl = document.getElementById('pass-role-ribbon');
    const tagsEl = document.getElementById('pass-tags');
    const gateEl = document.getElementById('pass-gate');
    const zoneEl = document.getElementById('pass-zone');
    const qrBox = document.getElementById('pass-qr-box');

    if (nameEl) nameEl.textContent = b.name;
    if (orgEl) orgEl.textContent = b.org;
    if (ribEl) ribEl.textContent = ROLE_LABELS[b.roleType] || b.roleLabel;
    if (tagsEl) tagsEl.innerHTML = (b.tags || []).map((t) => `<span class="neon-tag">${t}</span>`).join('');
    if (gateEl) gateEl.textContent = `AKREDİTE: ${(b.checkedInGate || 'gate-1').toUpperCase()}`;
    if (zoneEl) zoneEl.textContent = `AKTİF: ${(snap.zonesById[b.activeZoneId]?.code || 'Z-RED')}`;

    if (qrBox && typeof window.qrcode === 'function') {
      const qr = window.qrcode(0, 'M');
      qr.addData(Core.buildBadgeShareUrl());
      qr.make();
      qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1, scalable: true });
    }

    const fName = document.getElementById('bf-name');
    if (fName && document.activeElement !== fName) {
      fName.value = b.name === 'Katılımcı (Önizleme)' ? '' : b.name;
      document.getElementById('bf-email').value = b.email || '';
      document.getElementById('bf-role').value = b.roleType || 'student';
      document.getElementById('bf-org').value = b.org || '';
      document.getElementById('bf-tags').value = (b.tags || []).join(', ');
      document.getElementById('bf-bio').value = b.bio || '';
    }
  }

  const badgeForm = document.getElementById('badge-form');
  if (badgeForm) {
    badgeForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const roleType = document.getElementById('bf-role').value;
      const tags = document.getElementById('bf-tags').value.split(',').map((s) => s.trim()).filter(Boolean);
      const saved = Core.saveBadge({
        name: document.getElementById('bf-name').value.trim() || 'TEDÜ Katılımcısı',
        email: document.getElementById('bf-email').value.trim(),
        roleType,
        roleLabel: ROLE_LABELS[roleType] || 'KATILIMCI PASS',
        org: document.getElementById('bf-org').value.trim(),
        tags: tags.length ? tags : ['SummitTED 2026'],
        bio: document.getElementById('bf-bio').value.trim()
      });
      renderBadgeView(Core.getSnapshot());
      showToast(`3D Holografik Yaka Kartınız güncellendi, ${saved.name}!`);
    });
  }

  // 4. HUD QR Scanner
  const toggleCamBtn = document.getElementById('btn-toggle-camera');
  const videoEl = document.getElementById('qr-video');
  const placeholderEl = document.getElementById('camera-placeholder');

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Doğrudan kamera desteklenmiyor; aşağıdaki saha QR butonlarını kullanabilirsiniz.');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoEl.srcObject = cameraStream;
      videoEl.hidden = false;
      if (placeholderEl) placeholderEl.hidden = true;
      await videoEl.play();
      toggleCamBtn.textContent = 'KAMERAYI DURDUR';

      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        scanInterval = setInterval(async () => {
          if (!videoEl || videoEl.readyState < 2) return;
          try {
            const codes = await detector.detect(videoEl);
            if (codes && codes.length > 0 && codes[0].rawValue) {
              const res = Core.processQRCode(codes[0].rawValue);
              if (res.ok) {
                showToast(res.label);
                stopCamera();
              }
            }
          } catch (_) {}
        }, 550);
      }
    } catch (_) {
      showToast('Kamera erişimi reddedildi veya bulunamadı; hızlı saha QR butonlarını kullanabilirsiniz.');
    }
  }

  function stopCamera() {
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
    }
    if (videoEl) { videoEl.hidden = true; videoEl.srcObject = null; }
    if (placeholderEl) placeholderEl.hidden = false;
    if (toggleCamBtn) toggleCamBtn.textContent = 'KAMERAYI BAŞLAT';
  }

  if (toggleCamBtn) toggleCamBtn.addEventListener('click', () => (cameraStream ? stopCamera() : startCamera()));

  const manualForm = document.getElementById('manual-qr-form');
  if (manualForm) {
    manualForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const inp = document.getElementById('manual-qr-input');
      const res = Core.processQRCode(inp.value);
      showToast(res.ok ? res.label : res.message);
      if (res.ok) inp.value = '';
    });
  }

  document.querySelectorAll('[data-quick-qr]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = Core.processQRCode(btn.dataset.quickQr);
      showToast(res.ok ? res.label : res.message);
    });
  });

  function renderScanHistory(snap) {
    const host = document.getElementById('scan-history-list');
    if (!host) return;
    host.innerHTML = snap.scanHistory.slice(0, 10).map((item) => {
      const d = new Date(item.ts);
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:11px 0; border-bottom:1px solid rgba(255,255,255,0.08); font-size:13px;">
          <div>
            <code style="background:#E41513; color:#FFF; padding:2px 7px; font-family:var(--font-condensed); font-weight:700; margin-right:8px;">${item.code}</code>
            <span style="color:#DCE6FF;">${item.label}</span>
          </div>
          <small style="color:#7E90B8; font-weight:700;">${hhmm}</small>
        </div>
      `;
    }).join('');
  }

  // 5. Personal Schedule
  function renderScheduleView(snap) {
    const myHost = document.getElementById('my-unified-agenda');
    const allHost = document.getElementById('all-sessions-picker');
    const savedSet = new Set(snap.badge.savedSessions || []);

    const items = [];
    snap.acceptedMeetings.forEach((m) => {
      items.push({
        sortKey: m.slot,
        kind: 'MP',
        time: m.slot,
        title: `5 Dk Eşleşme: ${m.peerName} (${m.peerOrg})`,
        loc: `G Blok Slush'D Arena · Masa ${m.tableId}`,
        tableId: m.tableId
      });
    });
    snap.sessions.filter((s) => savedSet.has(s.id)).forEach((s) => {
      items.push({
        sortKey: s.start,
        kind: 'STAGE',
        time: `${s.start}–${s.end}`,
        title: s.title,
        loc: s.stageLabel
      });
    });
    items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const agendaBadge = document.getElementById('rail-agenda-badge');
    if (agendaBadge) agendaBadge.textContent = String(items.length);

    if (myHost) {
      myHost.innerHTML = items.map((it) => `
        <div class="mtg-glass-item ${it.kind === 'MP' ? 'status-accepted' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span class="slot-pill">${it.time}</span>
            <span class="neon-tag" style="${it.kind === 'MP' ? 'border-color:#10B981; color:#A7F3D0;' : ''}">${it.kind === 'MP' ? 'MEETING POINT' : 'KONFERANS'}</span>
          </div>
          <strong style="display:block; font-size:15.5px; margin-bottom:3px;">${it.title}</strong>
          <span style="font-size:12.5px; color:#B5C4E4;">${it.loc}</span>
        </div>
      `).join('') || `<p style="font-size:13.5px; color:#7E90B8;">Henüz ajandanızda öğe bulunmuyor.</p>`;
    }

    if (allHost) {
      allHost.innerHTML = snap.sessions.map((s) => {
        const isSaved = savedSet.has(s.id);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid rgba(255,255,255,0.08);">
            <div>
              <div style="font-size:12px; font-weight:800; color:#FF6E6C;">${s.start}–${s.end} &middot; ${s.stageLabel}</div>
              <strong style="font-size:14px;">${s.title}</strong>
            </div>
            <button type="button" class="${isSaved ? 'btn-sleek-blue' : 'btn-sleek-ghost'}" data-toggle-ses="${s.id}" style="flex-shrink:0;">
              ${isSaved ? 'AJANDADA ✓' : '+ EKLE'}
            </button>
          </div>
        `;
      }).join('');
      allHost.querySelectorAll('[data-toggle-ses]').forEach((b) => {
        b.onclick = () => Core.toggleSavedSession(b.dataset.toggleSes);
      });
    }
  }

  function renderAll(snap) {
    renderPeers(snap);
    renderMeetings(snap);
    renderScanHistory(snap);
    renderScheduleView(snap);
    if (activeTab === 'badge') renderBadgeView(snap);
    updateTimerHUD();
    bindSpotlights();
  }

  renderAll(Core.getSnapshot());
  Core.subscribe(renderAll);
  checkInitialUrlParams();
})();
