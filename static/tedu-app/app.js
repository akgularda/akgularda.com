/* ==========================================================================
   SummitTED App (/tedu-app) — Matchmaking, Meeting Points, 5-Min Timer & QR
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
    student: 'ÖĞRENCİ / YETENEK',
    company: 'ŞİRKET / İK HEYETİ',
    startup: 'GİRİŞİM / YATIRIMCI',
    community: 'TOPLULUK LİDERİ',
    speaker: 'KONUŞMACI / VIP'
  };

  function showToast(msg) {
    const t = document.getElementById('app-toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => { t.hidden = true; }, 4200);
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
  }

  document.querySelectorAll('[data-app-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.appTab));
  });

  const goDiscoverBtn = document.getElementById('btn-go-discover');
  if (goDiscoverBtn) goDiscoverBtn.addEventListener('click', () => switchTab('discover'));

  // Handle URL parameters (?tab=... & ?qr=... & ?connect=...)
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

  // 1. Discover & 5-Min Matchmaking Feed
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
      const hay = `${p.name} ${p.org} ${p.title} ${p.tags.join(' ')} ${p.lookingFor}`.toLowerCase();
      return hay.includes(searchQuery);
    });

    host.innerHTML = filtered.map((p) => {
      const existing = existingByPeer.get(p.id);
      const zoneName = snap.zonesById[p.zoneId]?.shortName || p.zoneId;
      let actionHtml = `<button type="button" class="btn-action-red" data-open-req="${p.id}">5 DK EŞLEŞME İSTEĞİ GÖNDER &rarr;</button>`;
      if (existing) {
        if (existing.status === 'accepted') {
          actionHtml = `<button type="button" class="btn-action-navy" data-jump-meetings="1">ONAYLANDI &middot; ${existing.tableId} (${existing.slot})</button>`;
        } else {
          actionHtml = `<button type="button" class="btn-action-ghost" data-jump-meetings="1">İSTEK BEKLİYOR (${existing.slot}) &rarr;</button>`;
        }
      }
      return `
        <article class="peer-card role-${p.roleType}">
          <div>
            <div class="peer-card-head">
              <div style="display:flex; gap:12px; align-items:center;">
                <div class="peer-avatar">${initials(p.name)}</div>
                <div>
                  <h3 class="peer-name">${p.name}</h3>
                  <div class="peer-org">${p.org} &middot; <span style="color:#292E6F;">${zoneName}</span></div>
                  <div class="peer-title">${p.title}</div>
                </div>
              </div>
              <span class="peer-role-badge">${p.roleBadge}</span>
            </div>

            <p class="peer-looking" style="margin-top:12px;">${p.lookingFor}</p>

            <div class="tag-row" style="margin-top:10px;">
              ${p.tags.map((t) => `<span class="sharp-tag">${t}</span>`).join('')}
            </div>
          </div>

          <div>
            <div class="slot-preview-row" style="margin-bottom:10px;">
              <small style="font-size:11px; font-weight:700; color:#6C7891;">MÜSAİT 5 DK:</small>
              ${p.availableSlots.slice(0, 3).map((s) => `<span class="slot-chip">${s}</span>`).join('')}
            </div>
            ${actionHtml}
          </div>
        </article>
      `;
    }).join('');

    host.querySelectorAll('[data-open-req]').forEach((btn) => {
      btn.addEventListener('click', () => openRequestModal(btn.dataset.openReq));
    });
    host.querySelectorAll('[data-jump-meetings]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab('meetings'));
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
    document.getElementById('req-modal-sub').textContent = `${peer.title} — Kabul edildiğinde G Blok Slush'D Arenası'nda otomatik masa atanır.`;
    const select = document.getElementById('req-slot-select');
    select.innerHTML = peer.availableSlots.map((s) => `<option value="${s}">${s} (5 Dakika · G Blok MP)</option>`).join('');
    document.getElementById('req-note-input').value = '';
    reqModal.hidden = false;
  }

  if (reqCancel) reqCancel.addEventListener('click', () => { reqModal.hidden = true; });
  if (reqForm) {
    reqForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const peerId = document.getElementById('req-peer-id').value;
      const slot = document.getElementById('req-slot-select').value;
      const note = document.getElementById('req-note-input').value;
      const created = Core.sendMatchRequest({ peerId, slot, note });
      reqModal.hidden = true;
      if (created) {
        showToast(`${created.peerName} (${created.peerOrg}) için ${created.slot} eşleşme isteği gönderildi!`);
        switchTab('meetings');
      }
    });
  }

  // 2. Meetings Inbox (Incoming Accept/Decline + Accepted MP + Outgoing)
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
    if (mobLabel) mobLabel.textContent = pendingCount > 0 ? `İstek (${pendingCount})` : 'İstekler';

    if (incomingHost) {
      const incoming = snap.meetings.filter((m) => m.direction === 'incoming');
      if (incoming.length === 0) {
        incomingHost.innerHTML = `<p style="font-size:13.5px; color:#6C7891;">Bekleyen gelen istek bulunmuyor.</p>`;
      } else {
        incomingHost.innerHTML = incoming.map((m) => `
          <div class="mtg-card status-${m.status}">
            <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
              <div>
                <strong style="font-size:16px;">${m.peerName}</strong>
                <div style="font-size:12.5px; font-weight:700; color:#E41513;">${m.peerOrg} &middot; ${m.peerTitle}</div>
              </div>
              <span class="slot-chip">${m.slot}</span>
            </div>
            <p style="margin:8px 0; font-size:13px; color:#47536B;">"${m.note}"</p>
            ${m.status === 'pending' ? `
              <div class="mtg-btn-row">
                <button type="button" class="btn-action-red" data-mtg-accept="${m.id}">KABUL ET &amp; MP ATA</button>
                <button type="button" class="btn-action-navy" data-mtg-resched="${m.id}">SAAT +5 DK KAYDIR &amp; ONAYLA</button>
                <button type="button" class="btn-action-ghost" data-mtg-decline="${m.id}">REDDET</button>
              </div>
            ` : m.status === 'accepted' ? `
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:8px;">
                <span class="mp-assign-badge">ONAYLANDI &middot; MASA <strong>${m.tableId}</strong></span>
                <button type="button" class="btn-action-red" data-start-timer="${m.id}" style="padding:8px 12px;">05:00 SAYACI BAŞLAT</button>
              </div>
            ` : `<div style="font-size:12px; font-weight:700; color:#64748B;">İSTEK REDDEDİLDİ</div>`}
          </div>
        `).join('');
      }
    }

    if (otherHost) {
      const list = snap.meetings.filter((m) => m.direction === 'outgoing' || m.status === 'accepted');
      const unique = [];
      const seen = new Set();
      list.forEach((m) => { if (!seen.has(m.id)) { seen.add(m.id); unique.push(m); } });

      otherHost.innerHTML = unique.map((m) => `
        <div class="mtg-card status-${m.status}">
          <div style="display:flex; justify-content:space-between; gap:8px; align-items:flex-start;">
            <div>
              <strong style="font-size:16px;">${m.peerName}</strong>
              <div style="font-size:12.5px; font-weight:700; color:#292E6F;">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span class="slot-chip">${m.slot}</span>
          </div>
          <p style="margin:8px 0; font-size:12.5px; color:#47536B;">${m.note}</p>
          ${m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px;">
              <span class="mp-assign-badge">G BLOK &middot; MASA <strong>${m.tableId}</strong></span>
              <button type="button" class="btn-action-red" data-start-timer="${m.id}" style="padding:8px 12px;">MASADAYIM &middot; 05:00 BAŞLAT</button>
            </div>
          ` : m.status === 'pending' ? `
            <div class="mtg-btn-row">
              <span style="font-size:12px; font-weight:700; color:#D97706; align-self:center;">YANIT BEKLENİYOR</span>
              <button type="button" class="btn-action-navy" data-sim-peer-accept="${m.id}" style="padding:7px 11px; font-size:11px;">DEMO: KARŞI TARAF KABUL ETSİN</button>
              <button type="button" class="btn-action-ghost" data-mtg-decline="${m.id}" style="padding:7px 11px; font-size:11px;">İPTAL ET</button>
            </div>
          ` : `<div style="font-size:12px; font-weight:700; color:#64748B;">İPTAL EDİLDİ / REDDEDİLDİ</div>`}
        </div>
      `).join('');
    }

    document.querySelectorAll('[data-mtg-accept]').forEach((b) => {
      b.onclick = () => {
        const updated = Core.respondToMeeting(b.dataset.mtgAccept, 'accept');
        if (updated) showToast(`Eşleşme onaylandı! G Blok ${updated.tableId} masası (${updated.slot}) tahsis edildi.`);
      };
    });
    document.querySelectorAll('[data-mtg-resched]').forEach((b) => {
      b.onclick = () => {
        const snapNow = Core.getSnapshot();
        const cur = snapNow.meetings.find((x) => x.id === b.dataset.mtgResched);
        const idx = Math.max(0, snapNow.slots5Min.indexOf(cur?.slot));
        const nextSlot = snapNow.slots5Min[(idx + 1) % snapNow.slots5Min.length];
        const updated = Core.respondToMeeting(b.dataset.mtgResched, 'reschedule', nextSlot);
        if (updated) showToast(`Yeni saat (${updated.slot}) ile onaylandı! Masa: ${updated.tableId}`);
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
        const updated = Core.respondToMeeting(b.dataset.simPeerAccept, 'accept');
        if (updated) showToast(`${updated.peerName} eşleşme isteğinizi KABUL ETTİ! Masa: ${updated.tableId} (${updated.slot})`);
      };
    });
    document.querySelectorAll('[data-start-timer]').forEach((b) => {
      b.onclick = () => {
        const timer = Core.startMeetingTimer(b.dataset.startTimer);
        if (timer) showToast(`${timer.tableId} masasında ${timer.peerName} ile 5 dakikalık görüşme başladı!`);
      };
    });
  }

  // Live 5-Minute Countdown Ticker
  function updateTimerDock() {
    const snap = Core.getSnapshot();
    const dock = document.getElementById('active-timer-dock');
    const digits = document.getElementById('timer-digits');
    const label = document.getElementById('timer-peer-label');
    if (!dock || !digits || !label) return;
    if (!snap.activeTimer) {
      dock.hidden = true;
      return;
    }
    dock.hidden = false;
    const remSec = Math.max(0, Math.ceil((snap.activeTimer.endsAt - Date.now()) / 1000));
    const mm = String(Math.floor(remSec / 60)).padStart(2, '0');
    const ss = String(remSec % 60).padStart(2, '0');
    digits.textContent = `${mm}:${ss}`;
    digits.classList.toggle('is-urgent', remSec <= 60);
    label.textContent = `${snap.activeTimer.peerName} (${snap.activeTimer.peerOrg}) · G Blok ${snap.activeTimer.tableId}`;
    if (remSec === 0) {
      Core.stopMeetingTimer();
      showToast('5 dakikalık görüşme süresi tamamlandı! Sonraki eşleşmeye geçebilirsiniz.');
    }
  }
  setInterval(updateTimerDock, 1000);

  const shareCvBtn = document.getElementById('btn-share-cv');
  if (shareCvBtn) {
    shareCvBtn.addEventListener('click', () => {
      const b = Core.loadBadge();
      showToast(`Dijital Yaka Kartınız ve iletişim profiliniz (${b.email}) karşı tarafa iletildi!`);
    });
  }
  const endTimerBtn = document.getElementById('btn-end-timer');
  if (endTimerBtn) {
    endTimerBtn.addEventListener('click', () => {
      Core.stopMeetingTimer();
      showToast('Görüşme tamamlandı olarak işaretlendi.');
    });
  }

  // 3. Universal QR Scanner (Camera + Manual + Quick Presets)
  const toggleCamBtn = document.getElementById('btn-toggle-camera');
  const videoEl = document.getElementById('qr-video');
  const placeholderEl = document.getElementById('camera-placeholder');

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Bu tarayıcıda doğrudan kamera erişimi desteklenmiyor; aşağıdaki hızlı QR kodlarını kullanabilirsiniz.');
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
      showToast('Kamera izni verilmedi veya cihazda kamera bulunamadı. Manuel / Hızlı QR butonlarını kullanabilirsiniz.');
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

  if (toggleCamBtn) {
    toggleCamBtn.addEventListener('click', () => {
      if (cameraStream) stopCamera();
      else startCamera();
    });
  }

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
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #E6ECF5; font-size:13px;">
          <div>
            <code style="background:#0B1330; color:#FFF; padding:2px 6px; font-family:var(--font-condensed); font-weight:700; margin-right:6px;">${item.code}</code>
            <span>${item.label}</span>
          </div>
          <small style="color:#6C7891; font-weight:700;">${hhmm}</small>
        </div>
      `;
    }).join('');
  }

  // 4. Davos Badge & Registration Form
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
    if (tagsEl) tagsEl.innerHTML = (b.tags || []).map((t) => `<span class="sharp-tag">${t}</span>`).join('');
    if (gateEl) gateEl.textContent = `AKREDİTE: ${(b.checkedInGate || 'gate-1').toUpperCase()}`;
    if (zoneEl) zoneEl.textContent = `KONUM: ${(snap.zonesById[b.activeZoneId]?.code || 'Z-RED')}`;

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
        roleLabel: ROLE_LABELS[roleType] || 'KATILIMCI',
        org: document.getElementById('bf-org').value.trim(),
        tags: tags.length ? tags : ['SummitTED 2026'],
        bio: document.getElementById('bf-bio').value.trim()
      });
      renderBadgeView(Core.getSnapshot());
      showToast(`Hoş geldiniz ${saved.name}! Dijital Davos Yaka Kartınız ve eşleşme QR kodunuz güncellendi.`);
    });
  }

  // 5. Personal Schedule (Accepted 5-Min Meetings + Saved Conference Sessions)
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
        id: m.id
      });
    });
    snap.sessions.filter((s) => savedSet.has(s.id)).forEach((s) => {
      items.push({
        sortKey: s.start,
        kind: 'STAGE',
        time: `${s.start}–${s.end}`,
        title: s.title,
        loc: s.stageLabel,
        id: s.id
      });
    });
    items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const agendaBadge = document.getElementById('rail-agenda-badge');
    if (agendaBadge) agendaBadge.textContent = String(items.length);

    if (myHost) {
      myHost.innerHTML = items.map((it) => `
        <div class="mtg-card ${it.kind === 'MP' ? 'status-accepted' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="slot-chip">${it.time}</span>
            <span class="sharp-tag" style="background:${it.kind === 'MP' ? '#E41513' : '#0B1330'}; color:#FFF;">${it.kind === 'MP' ? 'MEETING POINT' : 'KONFERANS'}</span>
          </div>
          <strong style="display:block; font-size:15px; margin-bottom:2px;">${it.title}</strong>
          <span style="font-size:12.5px; color:#47536B;">${it.loc}</span>
        </div>
      `).join('') || `<p style="font-size:13.5px; color:#6C7891;">Henüz ajandanızda öğe yok.</p>`;
    }

    if (allHost) {
      allHost.innerHTML = snap.sessions.map((s) => {
        const isSaved = savedSet.has(s.id);
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #E6ECF5;">
            <div>
              <div style="font-size:12px; font-weight:800; color:#E41513;">${s.start}–${s.end} &middot; ${s.stageLabel}</div>
              <strong style="font-size:14px;">${s.title}</strong>
            </div>
            <button type="button" class="${isSaved ? 'btn-action-navy' : 'btn-action-ghost'}" data-toggle-ses="${s.id}" style="padding:7px 10px; font-size:11px; flex-shrink:0;">
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

  function renderTopAndRail(snap) {
    const mpStatus = document.getElementById('top-mp-status');
    const rName = document.getElementById('rail-user-name');
    const rZone = document.getElementById('rail-user-zone');
    if (mpStatus) mpStatus.textContent = `G BLOK: ${snap.occupiedTablesCount}/${snap.totalTablesCount} MP AKTİF`;
    if (rName) rName.textContent = snap.badge.name;
    if (rZone) rZone.textContent = `Konum: ${snap.zonesById[snap.badge.activeZoneId]?.shortName || 'Red Zone'}`;
  }

  function renderAll(snap) {
    renderTopAndRail(snap);
    renderPeers(snap);
    renderMeetings(snap);
    renderScanHistory(snap);
    renderScheduleView(snap);
    if (activeTab === 'badge') renderBadgeView(snap);
    updateTimerDock();
  }

  renderAll(Core.getSnapshot());
  Core.subscribe(renderAll);
  checkInitialUrlParams();
})();
