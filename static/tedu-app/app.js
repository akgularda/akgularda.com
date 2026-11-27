/* ==========================================================================
   SummitTED Mobile App (/tedu-app) — Sharp TED-TEDÜ Mobile Controller
   Zero emojis, strict TEDÜ Navy + TED Red + White hierarchy, touch/mouse
   swipe physics, 3D MP Arena camera sync, and 2-sided 3D flipping pass.
   ========================================================================== */

(function () {
  'use strict';

  const Core = window.SummitTEDCore;
  if (!Core) return;

  const TAB_ALIASES = { discover: 'synergy', badge: 'pass', schedule: 'meetings' };
  let activeTab = 'home';
  let synergyMode = 'deck';
  let mtgSubtab = 'incoming';
  let roleFilter = 'all';
  let searchQuery = '';
  let deckIndex = 0;
  let cameraStream = null;
  let scanInterval = null;

  const ROLE_LABELS = {
    student: 'ÖĞRENCİ / YETENEK',
    company: 'ŞİRKET / İK HEYETİ',
    startup: 'GİRİŞİM / YATIRIMCI',
    community: 'TOPLULUK LİDERİ',
    speaker: 'KONUŞMACI / VIP'
  };

  const ALL_TAG_OPTIONS = [
    'Yapay Zeka', 'Savunma', 'FinTech', 'Strateji', 'Staj',
    'Veri Bilimi', 'Gömülü Yazılım', 'Ürün Yönetimi', 'Yatırım', 'Enerji'
  ];

  const STORIES = [
    { id: 'st-aselsan', code: 'B-01', label: 'ASELSAN', title: 'ASELSAN · Blue Zone & D Blok', desc: 'E Blok Spor Merkezi standında aviyonik ve gömülü sistem mühendisleriyle bire bir görüşme ve 12:00 D Blok söyleşisi.', tab: 'synergy', q: 'ASELSAN' },
    { id: 'st-tusas', code: 'B-02', label: 'TUSAŞ', title: 'TUSAŞ · Havacılık & Uzay', desc: 'Uçuş bilimleri ve yapısal tasarım ekipleriyle 5 dakikalık hızlı eşleşme slotları açık.', tab: 'synergy', q: 'TUSAŞ' },
    { id: 'st-mp', code: 'MP-24', label: 'MP Arena', title: 'G Blok Slush\'D Eşleşme Arenası', desc: 'Kabul edilen her eşleşmeye G Blok\'ta MP-01..MP-24 arasında özel numaralı masa otomatik tahsis edilir.', tab: 'meetings', q: '' },
    { id: 'st-deniz', code: 'R-02', label: 'DenizBank', title: 'DenizBank · FinTech & MT', desc: 'K Blok Fuaye Red Zone alanında ürün yönetimi ve dijital bankacılık ekipleriyle tanışın.', tab: 'synergy', q: 'DenizBank' },
    { id: 'st-istasyon', code: 'I-02', label: 'İstasyon', title: 'İstasyon TEDÜ · 5 Dk Pitch', desc: 'Öğrenci girişimleri ve AR-GE takımları yatırımcı masası karşısında sahneye çıkıyor.', tab: 'synergy', q: 'GridPulse' },
    { id: 'st-comm', code: 'T-01', label: 'Çim Amfi', title: 'Öğrenci Toplulukları Köyü', desc: '8 modüler topluluk çadırı ve RadioTEDU canlı yayın stüdyosu İncesu Çim Amfi alanında.', tab: 'synergy', q: 'RadioTEDU' }
  ];

  const THEMATIC_DAYS = {
    '1': {
      badge: 'GÜN 01 · 20 EKİM SALI',
      title: 'Liderlik Vizyonu, Teacher+ & Açık İnovasyon Sahneleri',
      desc: 'Ahmet Ersan Salonu C-Level panelleri, İstasyon TEDÜ 5 dk girişim sunumları ve Çim Amfi topluluk köyü.',
      img: '../tedu/assets/wanted/wanted-keynote.jpg'
    },
    '2': {
      badge: 'GÜN 02 · 21 EKİM ÇARŞAMBA',
      title: 'Red & Blue Zone Fuarı + Slush\'D Eşleşme Maratonu',
      desc: 'K Blok Fuaye, E Blok Spor Merkezi stantları ve G Blok MP-01..24 masalarında 5 dakikalık eşleşmeler.',
      img: '../tedu/assets/wanted/wanted-foyer.jpg'
    }
  };

  function showToast(msg) {
    const t = document.getElementById('app-toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._tm);
    showToast._tm = setTimeout(() => { t.hidden = true; }, 3600);
  }

  function focus3DTable(tableId) {
    if (tableId) document.dispatchEvent(new CustomEvent('summitted-focus-mp', { detail: { tableId } }));
  }

  function switchTab(rawTab) {
    const tab = TAB_ALIASES[rawTab] || rawTab;
    activeTab = tab;
    document.querySelectorAll('[data-view]').forEach((s) => { s.hidden = s.dataset.view !== tab; });
    document.querySelectorAll('[data-app-tab]').forEach((b) => {
      b.classList.toggle('is-active', b.dataset.appTab === tab);
    });
    if (tab !== 'scan') stopCamera();
    if (tab === 'pass') renderPassView(Core.getSnapshot());
    if (tab === 'meetings') {
      const first = Core.getSnapshot().acceptedMeetings[0];
      if (first?.tableId) setTimeout(() => focus3DTable(first.tableId), 120);
    }
    const scroller = document.getElementById('mob-scroll-body');
    if (scroller) scroller.scrollTop = 0;
  }

  document.querySelectorAll('[data-app-tab]').forEach((b) => {
    b.addEventListener('click', () => switchTab(b.dataset.appTab));
  });

  document.querySelectorAll('[data-goto-tab]').forEach((b) => {
    b.addEventListener('click', () => {
      if (b.dataset.presetRole) {
        roleFilter = b.dataset.presetRole;
        document.querySelectorAll('[data-role-filter]').forEach((chip) => {
          chip.classList.toggle('is-active', chip.dataset.roleFilter === roleFilter);
        });
        deckIndex = 0;
        renderSynergy(Core.getSnapshot());
      }
      switchTab(b.dataset.gotoTab);
    });
  });

  document.getElementById('btn-bell-inbox')?.addEventListener('click', () => switchTab('meetings'));

  // Stories Row
  const storiesHost = document.getElementById('stories-track');
  const storyModal = document.getElementById('story-modal');
  if (storiesHost) {
    storiesHost.innerHTML = STORIES.map((st) => `
      <button type="button" class="story-tile" data-story-id="${st.id}">
        <span class="story-code">${st.code}</span>
        <span class="story-name">${st.label}</span>
      </button>
    `).join('');

    storiesHost.querySelectorAll('[data-story-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const st = STORIES.find((x) => x.id === btn.dataset.storyId);
        if (!st || !storyModal) return;
        document.getElementById('story-body').innerHTML = `
          <span class="sec-kicker" style="color:#FF7B79;">${st.code} &middot; ZİRVE GÜNDEMİ</span>
          <h3 style="margin:6px 0 8px; font-family:var(--font-display); font-size:19px;">${st.title}</h3>
          <p style="margin:0 0 16px; font-size:13px; color:#CBD6EE; line-height:1.5;">${st.desc}</p>
          <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:8px;">
            <button type="button" class="btn-sq-neutral" id="story-close-btn" style="height:38px;">KAPAT</button>
            <button type="button" class="btn-sq-red" id="story-cta-btn" style="height:38px;">KEŞFET &rarr;</button>
          </div>
        `;
        storyModal.hidden = false;
        document.getElementById('story-close-btn').onclick = () => { storyModal.hidden = true; };
        document.getElementById('story-cta-btn').onclick = () => {
          storyModal.hidden = true;
          if (st.q) {
            searchQuery = st.q.toLowerCase();
            const inp = document.getElementById('peer-search');
            if (inp) inp.value = st.q;
            renderSynergy(Core.getSnapshot());
          }
          switchTab(st.tab);
        };
      });
    });
  }

  // Thematic Day Toggle
  document.querySelectorAll('[data-day-switch]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const d = THEMATIC_DAYS[btn.dataset.daySwitch];
      if (!d) return;
      document.querySelectorAll('[data-day-switch]').forEach((b) => b.classList.toggle('is-active', b === btn));
      document.getElementById('thematic-badge').textContent = d.badge;
      document.getElementById('thematic-title').textContent = d.title;
      document.getElementById('thematic-desc').textContent = d.desc;
      document.getElementById('thematic-img').src = d.img;
    });
  });

  // Synergy Mode Switch (Deck vs List)
  document.querySelectorAll('[data-synergy-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      synergyMode = btn.dataset.synergyMode;
      document.querySelectorAll('[data-synergy-mode]').forEach((b) => b.classList.toggle('is-active', b === btn));
      document.getElementById('synergy-deck-wrap').hidden = synergyMode !== 'deck';
      document.getElementById('synergy-list-wrap').hidden = synergyMode !== 'list';
    });
  });

  // Meetings Subtab Switch (Incoming vs Accepted)
  function setMtgSubtab(sub) {
    mtgSubtab = sub;
    document.querySelectorAll('[data-mtg-subtab]').forEach((b) => b.classList.toggle('is-active', b.dataset.mtgSubtab === sub));
    document.getElementById('incoming-list').hidden = sub !== 'incoming';
    document.getElementById('accepted-outgoing-list').hidden = sub !== 'accepted';
  }
  document.querySelectorAll('[data-mtg-subtab]').forEach((btn) => {
    btn.addEventListener('click', () => setMtgSubtab(btn.dataset.mtgSubtab));
  });

  function calcMatchScore(peer, badge) {
    const myTags = new Set((badge.tags || []).map((t) => t.toLowerCase()));
    let hits = 0;
    peer.tags.forEach((t) => { if (myTags.has(t.toLowerCase())) hits++; });
    return Math.min(98, 78 + hits * 7 + (peer.id.charCodeAt(5) % 6));
  }

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  function getFilteredPeers(snap) {
    return snap.peers.filter((p) => {
      if (roleFilter !== 'all' && p.roleType !== roleFilter) return false;
      if (!searchQuery) return true;
      return `${p.name} ${p.org} ${p.title} ${p.tags.join(' ')} ${p.lookingFor}`.toLowerCase().includes(searchQuery);
    });
  }

  function renderSynergy(snap) {
    const list = getFilteredPeers(snap);
    const activeCard = document.getElementById('swipe-active-card');
    const streamHost = document.getElementById('compact-people-stream');

    if (activeCard) {
      if (list.length === 0) {
        activeCard.innerHTML = `<div style="padding:28px; text-align:center; margin:auto;"><strong>Sonuç Bulunamadı</strong><p style="font-size:12.5px; color:#536079;">Filtreyi değiştirerek tüm profilleri inceleyebilirsiniz.</p></div>`;
      } else {
        const idx = ((deckIndex % list.length) + list.length) % list.length;
        const peer = list[idx];
        const score = calcMatchScore(peer, snap.badge);
        const zoneName = snap.zonesById[peer.zoneId]?.shortName || peer.zoneId;
        activeCard.style.transform = '';
        activeCard.style.opacity = '1';
        activeCard.dataset.peerId = peer.id;

        activeCard.innerHTML = `
          <span class="deck-stamp is-meet" id="stamp-meet">EŞLEŞ &rarr;</span>
          <span class="deck-stamp is-skip" id="stamp-pass">GEÇ &times;</span>

          <div class="deck-card-head">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
              <div style="display:flex; gap:12px; align-items:center;">
                <div class="deck-monogram">${initials(peer.name)}</div>
                <div>
                  <span style="font-family:var(--font-condensed); font-size:11px; font-weight:700; letter-spacing:1px; color:#FF8A88;">${peer.roleBadge}</span>
                  <h3 style="margin:2px 0; font-family:var(--font-display); font-size:20px;">${peer.name}</h3>
                  <div style="font-size:12.5px; color:#CBD6EE;">${peer.org} &middot; ${peer.title}</div>
                </div>
              </div>
              <span style="font-family:var(--font-condensed); font-size:12px; font-weight:700; background:var(--tedu-navy); border:1px solid rgba(255,255,255,0.22); padding:2px 7px; white-space:nowrap;">%${score} UYUM</span>
            </div>
          </div>

          <div class="deck-card-body">
            <div>
              <div style="font-size:11px; font-weight:800; letter-spacing:0.6px; color:var(--tedu-navy); text-transform:uppercase; margin-bottom:6px;">
                KONUM: ${zoneName}
              </div>
              <p style="margin:0 0 12px; font-size:13px; color:var(--ink-navy); line-height:1.45; border-left:3px solid var(--ted-red); padding-left:10px;">
                ${peer.lookingFor}
              </p>
              <div style="display:flex; flex-wrap:wrap; gap:5px;">
                ${peer.tags.map((t) => `<span class="tag-outline">${t}</span>`).join('')}
              </div>
            </div>

            <div style="border-top:1px solid var(--line-light); padding-top:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--ink-muted);">
              <span>MÜSAİT: <strong style="color:var(--ink-navy);">${peer.availableSlots.slice(0, 2).join(' / ')}</strong></span>
              <strong style="font-family:var(--font-condensed); font-size:13px; color:var(--ink-navy);">${idx + 1} / ${list.length}</strong>
            </div>
          </div>
        `;
      }
    }

    if (streamHost) {
      const existingMap = new Map();
      snap.meetings.forEach((m) => { if (m.status !== 'declined') existingMap.set(m.peerId, m); });

      streamHost.innerHTML = list.map((p) => {
        const ex = existingMap.get(p.id);
        return `
          <div class="dir-row">
            <div style="min-width:0;">
              <strong style="display:block; font-size:14px; color:var(--ink-navy);">${p.name}</strong>
              <span style="display:block; font-size:11.5px; color:var(--ted-red); font-weight:700;">${p.org}</span>
              <span style="display:block; font-size:11.5px; color:var(--ink-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title}</span>
            </div>
            ${ex
              ? `<span style="font-family:var(--font-condensed); font-size:12px; font-weight:700; background:var(--navy-deep); color:#FFF; padding:4px 8px; flex-shrink:0;">${ex.tableId || 'BEKLİYOR'}</span>`
              : `<button type="button" class="btn-sq-red" data-direct-req="${p.id}" style="height:32px; padding:0 10px; font-size:11px; flex-shrink:0;">5 DK İSTEK</button>`}
          </div>
        `;
      }).join('');

      streamHost.querySelectorAll('[data-direct-req]').forEach((btn) => {
        btn.onclick = () => openRequestModal(btn.dataset.directReq);
      });
    }
  }

  // Swipe Physics
  (function initSwipeGesture() {
    const card = document.getElementById('swipe-active-card');
    if (!card) return;
    let startX = 0;
    let dx = 0;
    let dragging = false;

    card.addEventListener('pointerdown', (e) => {
      dragging = true;
      startX = e.clientX;
      dx = 0;
      card.classList.add('is-dragging');
      card.setPointerCapture?.(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX;
      card.style.transform = `translateX(${dx.toFixed(1)}px) rotate(${(dx * 0.045).toFixed(2)}deg)`;
      const m = document.getElementById('stamp-meet');
      const s = document.getElementById('stamp-pass');
      if (m) m.style.opacity = String(Math.min(1, Math.max(0, dx / 80)));
      if (s) s.style.opacity = String(Math.min(1, Math.max(0, -dx / 80)));
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('is-dragging');
      if (dx > 85) {
        const pid = card.dataset.peerId;
        card.style.transform = 'translateX(380px) rotate(14deg)';
        card.style.opacity = '0';
        setTimeout(() => {
          deckIndex++;
          renderSynergy(Core.getSnapshot());
          if (pid) openRequestModal(pid);
        }, 200);
      } else if (dx < -85) {
        card.style.transform = 'translateX(-380px) rotate(-14deg)';
        card.style.opacity = '0';
        setTimeout(() => { deckIndex++; renderSynergy(Core.getSnapshot()); }, 200);
      } else {
        card.style.transform = '';
        const m = document.getElementById('stamp-meet');
        const s = document.getElementById('stamp-pass');
        if (m) m.style.opacity = '0';
        if (s) s.style.opacity = '0';
      }
    }
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
  })();

  document.getElementById('btn-swipe-skip')?.addEventListener('click', () => {
    const card = document.getElementById('swipe-active-card');
    if (card) { card.style.transform = 'translateX(-340px) rotate(-12deg)'; card.style.opacity = '0'; }
    setTimeout(() => { deckIndex++; renderSynergy(Core.getSnapshot()); }, 190);
  });
  document.getElementById('btn-swipe-prev')?.addEventListener('click', () => { deckIndex--; renderSynergy(Core.getSnapshot()); });
  document.getElementById('btn-swipe-connect')?.addEventListener('click', () => {
    const pid = document.getElementById('swipe-active-card')?.dataset.peerId;
    if (pid) openRequestModal(pid);
  });

  document.querySelectorAll('[data-role-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      roleFilter = btn.dataset.roleFilter;
      deckIndex = 0;
      document.querySelectorAll('[data-role-filter]').forEach((b) => b.classList.toggle('is-active', b === btn));
      renderSynergy(Core.getSnapshot());
    });
  });

  document.getElementById('peer-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    deckIndex = 0;
    renderSynergy(Core.getSnapshot());
  });

  // Request Bottom Sheet
  const reqModal = document.getElementById('request-modal');
  function openRequestModal(peerId) {
    const peer = Core.getSnapshot().peers.find((p) => p.id === peerId);
    if (!peer || !reqModal) return;
    document.getElementById('req-peer-id').value = peer.id;
    document.getElementById('req-modal-title').textContent = `${peer.name} · ${peer.org}`;
    document.getElementById('req-modal-sub').textContent = `${peer.title} — Kabul edildiğinde G Blok'ta otomatik masa atanır.`;
    document.getElementById('req-slot-select').innerHTML = peer.availableSlots.map((s) => `<option value="${s}">${s} (5 Dakika · G Blok MP)</option>`).join('');
    document.getElementById('req-note-input').value = '';
    reqModal.hidden = false;
  }

  document.getElementById('req-cancel-btn')?.addEventListener('click', () => { reqModal.hidden = true; });
  document.getElementById('send-req-form')?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const created = Core.sendMatchRequest({
      peerId: document.getElementById('req-peer-id').value,
      slot: document.getElementById('req-slot-select').value,
      note: document.getElementById('req-note-input').value
    });
    reqModal.hidden = true;
    if (created) {
      showToast(`${created.peerName} (${created.slot}) için eşleşme isteği gönderildi.`);
      setMtgSubtab('accepted');
      switchTab('meetings');
    }
  });

  // Meetings & 3D MP Arena
  function renderMeetings(snap) {
    const incomingHost = document.getElementById('incoming-list');
    const otherHost = document.getElementById('accepted-outgoing-list');
    const pendingCount = snap.pendingIncoming.length;

    const bellCnt = document.getElementById('bell-count');
    const homePill = document.getElementById('home-pending-pill');
    const mobMp = document.getElementById('mob-mp-label');
    const incBtn = document.getElementById('subtab-inc-btn');
    const accBtn = document.getElementById('subtab-acc-btn');

    if (bellCnt) { bellCnt.textContent = String(pendingCount); bellCnt.hidden = pendingCount === 0; }
    if (homePill) homePill.textContent = `${pendingCount} İSTEK`;
    if (mobMp) mobMp.textContent = pendingCount > 0 ? `MP (${pendingCount})` : 'MP Arena';
    if (incBtn) incBtn.textContent = `Gelen İstekler (${pendingCount})`;
    if (accBtn) accBtn.textContent = `Masalarım (${snap.acceptedMeetings.length})`;

    if (incomingHost) {
      const incoming = snap.meetings.filter((m) => m.direction === 'incoming');
      incomingHost.innerHTML = incoming.map((m) => `
        <div class="req-card ${m.status === 'accepted' ? 'is-accepted' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <strong style="font-size:14.5px; color:var(--ink-navy);">${m.peerName}</strong>
              <div style="font-size:11.5px; font-weight:700; color:var(--ted-red);">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span class="tag-outline">${m.slot}</span>
          </div>
          <p style="margin:7px 0 10px; font-size:12px; color:var(--ink-muted); line-height:1.4;">"${m.note}"</p>
          ${m.status === 'pending' ? `
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn-sq-red" data-mtg-accept="${m.id}" style="height:34px; padding:0 12px; font-size:11px;">KABUL ET &amp; MP ATA</button>
              <button type="button" class="btn-sq-neutral" data-mtg-resched="${m.id}" style="height:34px; padding:0 10px; font-size:11px;">+5 DK KAYDIR</button>
              <button type="button" class="btn-sq-neutral" data-mtg-decline="${m.id}" style="height:34px; padding:0 10px; font-size:11px;">REDDET</button>
            </div>
          ` : m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
              <button type="button" class="btn-sq-navy" data-focus-table="${m.tableId}" style="height:32px; font-size:11px;">MASA: ${m.tableId}</button>
              <button type="button" class="btn-sq-red" data-start-timer="${m.id}" style="height:32px; padding:0 12px; font-size:11px;">05:00 BAŞLAT</button>
            </div>
          ` : `<span style="font-size:11px; font-weight:700; color:var(--ink-muted);">REDDEDİLDİ</span>`}
        </div>
      `).join('') || `<p style="font-size:12.5px; color:var(--ink-muted);">Bekleyen gelen istek yok.</p>`;
    }

    if (otherHost) {
      const seen = new Set();
      const items = [];
      snap.meetings.filter((m) => m.direction === 'outgoing' || m.status === 'accepted').forEach((m) => {
        if (!seen.has(m.id)) { seen.add(m.id); items.push(m); }
      });

      otherHost.innerHTML = items.map((m) => `
        <div class="req-card ${m.status === 'accepted' ? 'is-accepted' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <strong style="font-size:14.5px; color:var(--ink-navy);">${m.peerName}</strong>
              <div style="font-size:11.5px; font-weight:700; color:var(--tedu-navy);">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span class="tag-outline">${m.slot}</span>
          </div>
          ${m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:10px;">
              <button type="button" class="btn-sq-navy" data-focus-table="${m.tableId}" style="height:32px; font-size:11px;">G BLOK &middot; ${m.tableId}</button>
              <button type="button" class="btn-sq-red" data-start-timer="${m.id}" style="height:32px; padding:0 12px; font-size:11px;">MASADAYIM &middot; 05:00</button>
            </div>
          ` : m.status === 'pending' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-top:10px;">
              <span style="font-size:11px; font-weight:800; color:var(--ted-red);">YANIT BEKLENİYOR</span>
              <button type="button" class="btn-sq-navy" data-sim-peer-accept="${m.id}" style="height:30px; font-size:10.5px;">DEMO: KABUL ETSİN</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    document.querySelectorAll('[data-focus-table]').forEach((b) => { b.onclick = () => focus3DTable(b.dataset.focusTable); });
    document.querySelectorAll('[data-mtg-accept]').forEach((b) => {
      b.onclick = () => {
        const u = Core.respondToMeeting(b.dataset.mtgAccept, 'accept');
        if (u) { focus3DTable(u.tableId); showToast(`Onaylandı: G Blok ${u.tableId} masası (${u.slot}) tahsis edildi.`); }
      };
    });
    document.querySelectorAll('[data-mtg-resched]').forEach((b) => {
      b.onclick = () => {
        const s = Core.getSnapshot();
        const cur = s.meetings.find((x) => x.id === b.dataset.mtgResched);
        const idx = Math.max(0, s.slots5Min.indexOf(cur?.slot));
        const u = Core.respondToMeeting(b.dataset.mtgResched, 'reschedule', s.slots5Min[(idx + 1) % s.slots5Min.length]);
        if (u) { focus3DTable(u.tableId); showToast(`Saat ${u.slot} olarak güncellendi — Masa: ${u.tableId}`); }
      };
    });
    document.querySelectorAll('[data-mtg-decline]').forEach((b) => {
      b.onclick = () => { Core.respondToMeeting(b.dataset.mtgDecline, 'decline'); showToast('İstek reddedildi.'); };
    });
    document.querySelectorAll('[data-sim-peer-accept]').forEach((b) => {
      b.onclick = () => {
        const u = Core.respondToMeeting(b.dataset.simPeerAccept, 'accept');
        if (u) { focus3DTable(u.tableId); showToast(`${u.peerName} kabul etti — Masa: ${u.tableId}`); }
      };
    });
    document.querySelectorAll('[data-start-timer]').forEach((b) => {
      b.onclick = () => {
        const t = Core.startMeetingTimer(b.dataset.startTimer);
        if (t) { focus3DTable(t.tableId); showToast(`${t.tableId} masasında 05:00 görüşme sayacı başladı.`); }
      };
    });
  }

  // Active 05:00 Timer Bar
  function updateTimerBar() {
    const snap = Core.getSnapshot();
    const dock = document.getElementById('active-timer-dock');
    const digits = document.getElementById('timer-digits');
    const label = document.getElementById('timer-peer-label');
    if (!dock || !digits) return;
    if (!snap.activeTimer) { dock.hidden = true; return; }
    dock.hidden = false;
    const rem = Math.max(0, Math.ceil((snap.activeTimer.endsAt - Date.now()) / 1000));
    digits.textContent = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(rem % 60).padStart(2, '0')}`;
    if (label) label.textContent = `${snap.activeTimer.peerName} · ${snap.activeTimer.tableId}`;
    if (rem === 0) { Core.stopMeetingTimer(); showToast('5 dakikalık görüşme süresi tamamlandı.'); }
  }
  setInterval(updateTimerBar, 1000);

  document.getElementById('btn-share-cv')?.addEventListener('click', () => {
    showToast(`Dijital yaka kartınız (${Core.loadBadge().email}) karşı tarafa iletildi.`);
  });
  document.getElementById('btn-end-timer')?.addEventListener('click', () => {
    Core.stopMeetingTimer();
    showToast('Görüşme tamamlandı.');
  });

  // 2-Sided 3D Pass
  const flipInner = document.getElementById('wallet-flip-inner');
  document.getElementById('btn-flip-to-edit')?.addEventListener('click', () => flipInner?.classList.add('is-flipped'));
  document.getElementById('btn-flip-to-front')?.addEventListener('click', () => flipInner?.classList.remove('is-flipped'));

  let selectedTags = new Set(Core.loadBadge().tags || []);

  function renderPassView(snap) {
    const b = snap.badge;
    selectedTags = new Set(b.tags || []);
    document.getElementById('pass-name').textContent = b.name;
    document.getElementById('pass-org').textContent = b.org;
    document.getElementById('pass-role-ribbon').textContent = ROLE_LABELS[b.roleType] || b.roleLabel;
    document.getElementById('pass-gate').textContent = `AKREDİTE: ${(b.checkedInGate || 'gate-1').toUpperCase()}`;

    document.getElementById('pass-tags').innerHTML = (b.tags || []).map((t) => `
      <span style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); padding:3px 8px; font-size:10.5px; font-weight:700;">${t}</span>
    `).join('');

    const qrBox = document.getElementById('pass-qr-box');
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
    }

    const cloud = document.getElementById('interactive-tag-cloud');
    if (cloud) {
      cloud.innerHTML = ALL_TAG_OPTIONS.map((tag) => `
        <button type="button" class="sel-chip ${selectedTags.has(tag) ? 'is-on' : ''}" data-tap-tag="${tag}">${tag}</button>
      `).join('');
      cloud.querySelectorAll('[data-tap-tag]').forEach((btn) => {
        btn.onclick = () => {
          const t = btn.dataset.tapTag;
          if (selectedTags.has(t)) selectedTags.delete(t);
          else selectedTags.add(t);
          btn.classList.toggle('is-on', selectedTags.has(t));
        };
      });
    }
  }

  document.getElementById('badge-form')?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const roleType = document.getElementById('bf-role').value;
    const saved = Core.saveBadge({
      name: document.getElementById('bf-name').value.trim() || 'TEDÜ Katılımcısı',
      email: document.getElementById('bf-email').value.trim(),
      roleType,
      roleLabel: ROLE_LABELS[roleType] || 'KATILIMCI',
      org: document.getElementById('bf-org').value.trim(),
      tags: selectedTags.size ? Array.from(selectedTags) : ['Yapay Zeka', 'Staj']
    });
    renderPassView(Core.getSnapshot());
    flipInner?.classList.remove('is-flipped');
    showToast(`Yaka kartınız güncellendi, ${saved.name}.`);
  });

  // Camera & Quick QR
  const toggleCamBtn = document.getElementById('btn-toggle-camera');
  const videoEl = document.getElementById('qr-video');
  const placeholderEl = document.getElementById('camera-placeholder');

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Kamera desteklenmiyor; aşağıdaki saha kodlarını kullanabilirsiniz.');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoEl.srcObject = cameraStream;
      videoEl.hidden = false;
      if (placeholderEl) placeholderEl.hidden = true;
      await videoEl.play();
      toggleCamBtn.textContent = 'KAMERAYI KAPAT';
      if ('BarcodeDetector' in window) {
        const det = new window.BarcodeDetector({ formats: ['qr_code'] });
        scanInterval = setInterval(async () => {
          if (!videoEl || videoEl.readyState < 2) return;
          try {
            const codes = await det.detect(videoEl);
            if (codes?.[0]?.rawValue) {
              const res = Core.processQRCode(codes[0].rawValue);
              if (res.ok) { showToast(res.label); stopCamera(); }
            }
          } catch (_) {}
        }, 550);
      }
    } catch (_) {
      showToast('Kamera izni verilmedi; aşağıdaki saha kodlarıyla test edebilirsiniz.');
    }
  }

  function stopCamera() {
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (cameraStream) { cameraStream.getTracks().forEach((t) => t.stop()); cameraStream = null; }
    if (videoEl) { videoEl.hidden = true; videoEl.srcObject = null; }
    if (placeholderEl) placeholderEl.hidden = false;
    if (toggleCamBtn) toggleCamBtn.textContent = 'KAMERAYI AÇ';
  }

  toggleCamBtn?.addEventListener('click', () => (cameraStream ? stopCamera() : startCamera()));

  document.getElementById('manual-qr-form')?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const inp = document.getElementById('manual-qr-input');
    const res = Core.processQRCode(inp.value);
    showToast(res.ok ? res.label : res.message);
    if (res.ok) inp.value = '';
  });

  document.querySelectorAll('[data-quick-qr]').forEach((b) => {
    b.addEventListener('click', () => {
      const res = Core.processQRCode(b.dataset.quickQr);
      showToast(res.ok ? res.label : res.message);
    });
  });

  function renderScanHistory(snap) {
    const host = document.getElementById('scan-history-list');
    if (!host) return;
    host.innerHTML = snap.scanHistory.slice(0, 6).map((item) => {
      const d = new Date(item.ts);
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `
        <div style="background:#FFFFFF; border:1px solid var(--line-light); padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:11.5px;">
          <div>
            <code style="background:var(--navy-deep); color:#FFF; padding:1px 6px; font-family:var(--font-condensed); font-weight:700; margin-right:6px;">${item.code}</code>
            <span style="color:var(--ink-navy); font-weight:600;">${item.label}</span>
          </div>
          <small style="color:var(--ink-muted); font-weight:700;">${hhmm}</small>
        </div>
      `;
    }).join('');
  }

  function checkUrlParams() {
    const p = new URLSearchParams(window.location.search);
    const tab = p.get('tab');
    const qr = p.get('qr');
    const connect = p.get('connect');
    if (connect) {
      const res = Core.processQRCode(window.location.href);
      if (res.ok) { switchTab('meetings'); showToast(res.label); }
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (tab) switchTab(tab);
    if (qr) {
      const res = Core.processQRCode(qr);
      if (res.ok) showToast(res.label);
      window.history.replaceState({}, '', window.location.pathname + (tab ? `?tab=${tab}` : ''));
    }
  }

  function renderAll(snap) {
    renderSynergy(snap);
    renderMeetings(snap);
    renderScanHistory(snap);
    if (activeTab === 'pass') renderPassView(snap);
    updateTimerBar();
  }

  renderAll(Core.getSnapshot());
  Core.subscribe(renderAll);
  checkUrlParams();
})();
