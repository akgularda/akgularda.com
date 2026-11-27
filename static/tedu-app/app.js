/* ==========================================================================
   SummitTED Pocket Super-App (/tedu-app) — Slush'D × COP31 Controller
   Stories, Thematic Day Switcher, Physics Touch/Mouse Swipe Deck,
   Compatibility Score, 3D MP Arena Focus, Dynamic Island, 3D Flipping Pass!
   ========================================================================== */

(function () {
  'use strict';

  const Core = window.SummitTEDCore;
  if (!Core) return;

  // Map legacy tab names cleanly
  const TAB_ALIASES = { discover: 'synergy', badge: 'pass', schedule: 'meetings' };
  let activeTab = 'home';
  let roleFilter = 'all';
  let searchQuery = '';
  let deckIndex = 0;
  let cameraStream = null;
  let scanInterval = null;

  const ROLE_LABELS = {
    student: '🎓 ÖĞRENCİ PASS',
    company: '💼 ŞİRKET / İK PASS',
    startup: '🚀 STARTUP & VC PASS',
    community: '🎙️ TOPLULUK PASS',
    speaker: '⭐ VIP KONUŞMACI'
  };

  const ALL_TAG_OPTIONS = [
    'Yapay Zeka', 'Savunma', 'FinTech', 'Strateji', 'Staj',
    'Veri Bilimi', 'Gömülü Yazılım', 'Ürün Yönetimi', 'Yatırım', 'Enerji'
  ];

  const STORIES = [
    { id: 'st-aselsan', ring: 'AS', label: 'ASELSAN', title: 'ASELSAN · Blue Zone B-01 & D Blok', desc: 'Radar, aviyonik ve gömülü yazılım mühendisleriyle E Blok Spor Merkezi standında tanışın; 12:00 D Blok söyleşisini kaçırmayın.', tab: 'synergy', q: 'ASELSAN' },
    { id: 'st-tusas', ring: 'TU', label: 'TUSAŞ', title: 'TUSAŞ · Milli Havacılık Vizyonu', desc: 'Uçuş bilimleri ekibiyle 5 dakikalık hızlı eşleşme slotları açıldı!', tab: 'synergy', q: 'TUSAŞ' },
    { id: 'st-mp', ring: 'MP', label: '24 Masa', title: 'G Blok Slush\'D Eşleşme Arenası', desc: 'Kabul edilen her eşleşmeye MP-01..MP-24 arasında özel numaralı masa otomatik tahsis edilir.', tab: 'meetings', q: '' },
    { id: 'st-istasyon', ring: '🚀', label: 'İstasyon', title: 'İstasyon TEDÜ · 5 Dk Pitch Sahnesi', desc: 'Öğrenci girişimleri tohum yatırımcılar karşısında sahneye çıkıyor.', tab: 'synergy', q: 'GridPulse' },
    { id: 'st-deniz', ring: 'DB', label: 'DenizBank', title: 'DenizBank FinTech & MT Programı', desc: 'Red Zone K Blok Fuaye alanında ürün ve analitik ekipleriyle bire bir tanışma.', tab: 'synergy', q: 'DenizBank' },
    { id: 'st-comm', ring: '⛺', label: 'Çim Amfi', title: 'Öğrenci Toplulukları Köyü', desc: '8 modüler topluluk çadırı ve RadioTEDU canlı yayın stüdyosu İncesu Çim Amfi\'de!', tab: 'synergy', q: 'RadioTEDU' },
    { id: 'st-pass', ring: '🎫', label: 'Wallet Pass', title: 'Çift Yüzlü 3D Giriş Kartınız', desc: 'Kartınızı çevirip ilgi etiketlerinizi seçin; eşleşme uyum puanınız anında hesaplansın.', tab: 'pass', q: '' }
  ];

  const THEMATIC_DAYS = {
    '1': {
      badge: 'TEMATİK GÜN 01 · 20 EKİM SALI',
      title: 'Liderlik Vizyonu, Teacher+ & Açık İnovasyon Sahneleri',
      desc: 'Ahmet Ersan Salonu C-Level açılış panelleri, İstasyon TEDÜ 5 dk girişim sunumları ve Çim Amfi topluluk buluşmaları.',
      img: '../tedu/assets/wanted/wanted-keynote.jpg'
    },
    '2': {
      badge: 'TEMATİK GÜN 02 · 21 EKİM ÇARŞAMBA',
      title: 'Red & Blue Zone Fuarı + Slush\'D 5 Dk Eşleşme Maratonu',
      desc: 'K Blok Fuaye, E Blok Spor Merkezi stantları ve G Blok MP-01..24 numaralı masalarda yüzlerce hızlı eşleşme.',
      img: '../tedu/assets/wanted/wanted-foyer.jpg'
    }
  };

  function showToast(msg) {
    const t = document.getElementById('app-toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast._tm);
    showToast._tm = setTimeout(() => { t.hidden = true; }, 3900);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const bellBtn = document.getElementById('btn-bell-inbox');
  if (bellBtn) bellBtn.addEventListener('click', () => switchTab('meetings'));

  // Stories Strip & Modal
  const storiesHost = document.getElementById('stories-track');
  const storyModal = document.getElementById('story-modal');
  let storyTimer = null;

  if (storiesHost) {
    storiesHost.innerHTML = STORIES.map((st) => `
      <button type="button" class="story-bubble" data-story-id="${st.id}">
        <div class="story-ring"><div class="story-avatar-inner">${st.ring}</div></div>
        <span>${st.label}</span>
      </button>
    `).join('');

    storiesHost.querySelectorAll('[data-story-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const st = STORIES.find((x) => x.id === btn.dataset.storyId);
        if (!st || !storyModal) return;
        const body = document.getElementById('story-body');
        body.innerHTML = `
          <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#FF9F1C;">KAMPÜS HİKAYESİ</span>
          <h3 style="margin:6px 0 8px; font-family:var(--font-display); font-size:22px;">${st.title}</h3>
          <p style="margin:0 0 18px; font-size:14px; color:#DCE6FF; line-height:1.55;">${st.desc}</p>
          <div style="display:flex; justify-content:space-between; gap:10px;">
            <button type="button" class="btn-pill-soft" id="story-close-btn">Kapat</button>
            <button type="button" class="btn-pill-primary" id="story-cta-btn">Keşfet &rarr;</button>
          </div>
        `;
        storyModal.hidden = false;
        clearTimeout(storyTimer);
        storyTimer = setTimeout(() => { storyModal.hidden = true; }, 4500);
        document.getElementById('story-close-btn').onclick = () => { clearTimeout(storyTimer); storyModal.hidden = true; };
        document.getElementById('story-cta-btn').onclick = () => {
          clearTimeout(storyTimer);
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

  // Thematic Day Switcher (COP31 style)
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

  // Compatibility Score Calculator
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

  // Physics Touch/Pointer Swipe Deck + Compact Stream
  function renderSynergy(snap) {
    const list = getFilteredPeers(snap);
    const activeCard = document.getElementById('swipe-active-card');
    const streamHost = document.getElementById('compact-people-stream');

    if (activeCard) {
      if (list.length === 0) {
        activeCard.innerHTML = `<div style="margin:auto; text-align:center;"><strong style="font-size:18px;">Eşleşen kişi bulunamadı</strong><p style="color:#B4C4E6; font-size:13px;">Filtreyi sıfırlayarak tüm katılımcıları görebilirsiniz.</p></div>`;
      } else {
        const peer = list[((deckIndex % list.length) + list.length) % list.length];
        const score = calcMatchScore(peer, snap.badge);
        const zoneName = snap.zonesById[peer.zoneId]?.shortName || peer.zoneId;
        activeCard.style.transform = '';
        activeCard.style.opacity = '1';
        activeCard.dataset.peerId = peer.id;

        activeCard.innerHTML = `
          <div class="swipe-aura-top"></div>
          <span class="swipe-stamp stamp-meet" id="stamp-meet">5 DK EŞLEŞ ⚡</span>
          <span class="swipe-stamp stamp-pass" id="stamp-pass">SONRAKİ ✕</span>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
              <span class="match-score-pill">✨ %${score} Sinerji Uyumu</span>
              <span style="font-size:12px; font-weight:700; color:#B4C4E6;">📍 ${zoneName}</span>
            </div>

            <div class="deck-avatar-lg">${initials(peer.name)}</div>
            <span style="font-size:11px; font-weight:800; letter-spacing:1px; color:#FF9F1C;">${peer.roleBadge}</span>
            <h3 style="margin:4px 0 2px; font-family:var(--font-display); font-size:26px;">${peer.name}</h3>
            <div style="font-size:14.5px; font-weight:700; color:#93C5FD; margin-bottom:12px;">${peer.org} &middot; ${peer.title}</div>

            <p style="margin:0 0 14px; font-size:13.5px; color:#DCE6FF; line-height:1.5;">"${peer.lookingFor}"</p>

            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${peer.tags.map((t) => `<span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:999px; font-size:11.5px; font-weight:700;">${t}</span>`).join('')}
            </div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.12); padding-top:12px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#B4C4E6;">
            <span>Müsait: <strong style="color:#FFF;">${peer.availableSlots.slice(0, 2).join(', ')}</strong></span>
            <span>Kart ${((deckIndex % list.length) + list.length) % list.length + 1} / ${list.length}</span>
          </div>
        `;
      }
    }

    if (streamHost) {
      const existingMap = new Map();
      snap.meetings.forEach((m) => { if (m.status !== 'declined') existingMap.set(m.peerId, m); });

      streamHost.innerHTML = list.map((p, idx) => {
        const ex = existingMap.get(p.id);
        const score = calcMatchScore(p, snap.badge);
        return `
          <div class="person-pill-row" data-pick-peer="${idx}">
            <div style="display:flex; align-items:center; gap:12px; min-width:0;">
              <div style="width:44px; height:44px; border-radius:15px; background:linear-gradient(135deg,#2D62FF,#FF3B38); display:flex; align-items:center; justify-content:center; font-weight:800; flex-shrink:0;">${initials(p.name)}</div>
              <div style="min-width:0;">
                <strong style="display:block; font-size:15px;">${p.name} <small style="color:#6EE7B7; font-weight:800;">%${score}</small></strong>
                <span style="font-size:12.5px; color:#B4C4E6; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.org} &middot; ${p.title}</span>
              </div>
            </div>
            ${ex
              ? `<span style="background:rgba(0,200,150,0.2); color:#6EE7B7; padding:6px 12px; border-radius:999px; font-size:11.5px; font-weight:800; flex-shrink:0;">${ex.tableId || 'İstek Gönderildi'}</span>`
              : `<button type="button" class="btn-pill-primary" data-direct-req="${p.id}" style="padding:8px 14px; font-size:11.5px; flex-shrink:0;">⚡ 5 Dk İstek</button>`}
          </div>
        `;
      }).join('');

      streamHost.querySelectorAll('[data-pick-peer]').forEach((row) => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('[data-direct-req]')) return;
          deckIndex = parseInt(row.dataset.pickPeer, 10) || 0;
          renderSynergy(Core.getSnapshot());
        });
      });
      streamHost.querySelectorAll('[data-direct-req]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openRequestModal(btn.dataset.directReq);
        });
      });
    }
  }

  // Pointer Drag / Swipe Gesture Physics on Active Card
  (function initSwipePhysics() {
    const card = document.getElementById('swipe-active-card');
    if (!card) return;
    let startX = 0;
    let currentX = 0;
    let dragging = false;

    card.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      dragging = true;
      startX = e.clientX;
      currentX = 0;
      card.classList.add('is-dragging');
      card.setPointerCapture?.(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      currentX = e.clientX - startX;
      const rot = currentX * 0.055;
      card.style.transform = `translateX(${currentX.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      const meetStamp = document.getElementById('stamp-meet');
      const passStamp = document.getElementById('stamp-pass');
      if (meetStamp) meetStamp.style.opacity = String(Math.min(1, Math.max(0, currentX / 90)));
      if (passStamp) passStamp.style.opacity = String(Math.min(1, Math.max(0, -currentX / 90)));
    });

    function finishDrag() {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('is-dragging');
      if (currentX > 95) {
        const pid = card.dataset.peerId;
        card.style.transform = 'translateX(420px) rotate(18deg)';
        card.style.opacity = '0';
        setTimeout(() => {
          deckIndex++;
          renderSynergy(Core.getSnapshot());
          if (pid) openRequestModal(pid);
        }, 220);
      } else if (currentX < -95) {
        card.style.transform = 'translateX(-420px) rotate(-18deg)';
        card.style.opacity = '0';
        setTimeout(() => {
          deckIndex++;
          renderSynergy(Core.getSnapshot());
        }, 220);
      } else {
        card.style.transform = '';
        const meetStamp = document.getElementById('stamp-meet');
        const passStamp = document.getElementById('stamp-pass');
        if (meetStamp) meetStamp.style.opacity = '0';
        if (passStamp) passStamp.style.opacity = '0';
      }
    }

    card.addEventListener('pointerup', finishDrag);
    card.addEventListener('pointercancel', finishDrag);
  })();

  document.getElementById('btn-swipe-skip')?.addEventListener('click', () => {
    const card = document.getElementById('swipe-active-card');
    if (card) {
      card.style.transform = 'translateX(-360px) rotate(-14deg)';
      card.style.opacity = '0';
    }
    setTimeout(() => { deckIndex++; renderSynergy(Core.getSnapshot()); }, 210);
  });

  document.getElementById('btn-swipe-prev')?.addEventListener('click', () => {
    deckIndex--;
    renderSynergy(Core.getSnapshot());
  });

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

  // 1-Tap Slot Sheet
  const reqModal = document.getElementById('request-modal');
  function openRequestModal(peerId) {
    const peer = Core.getSnapshot().peers.find((p) => p.id === peerId);
    if (!peer || !reqModal) return;
    document.getElementById('req-peer-id').value = peer.id;
    document.getElementById('req-modal-title').textContent = `${peer.name} (${peer.org})`;
    document.getElementById('req-modal-sub').textContent = `${peer.title} — Onaylandığında G Blok'ta otomatik Meeting Point masası atanır.`;
    document.getElementById('req-slot-select').innerHTML = peer.availableSlots.map((s) => `<option value="${s}">🕒 ${s} (5 Dakika · G Blok MP)</option>`).join('');
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
      showToast(`⚡ ${created.peerName} için ${created.slot} eşleşme isteği gönderildi!`);
      switchTab('meetings');
    }
  });

  // 3D MP Arena & Activity Cards
  function renderMeetings(snap) {
    const incomingHost = document.getElementById('incoming-list');
    const otherHost = document.getElementById('accepted-outgoing-list');
    const pendingCount = snap.pendingIncoming.length;

    const navCnt = document.getElementById('nav-pending-count');
    const mobCnt = document.getElementById('mob-mp-label');
    const bellDot = document.getElementById('bell-dot');
    if (navCnt) navCnt.textContent = String(pendingCount);
    if (mobCnt) mobCnt.textContent = pendingCount > 0 ? `MP (${pendingCount})` : 'MP';
    if (bellDot) bellDot.hidden = pendingCount === 0;

    if (incomingHost) {
      const incoming = snap.meetings.filter((m) => m.direction === 'incoming');
      incomingHost.innerHTML = incoming.map((m) => `
        <div class="activity-card ${m.status === 'accepted' ? 'is-accepted' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <strong style="font-size:16px;">${m.peerName}</strong>
              <div style="font-size:12.5px; color:#FF9F1C; font-weight:700;">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">${m.slot}</span>
          </div>
          <p style="margin:8px 0 12px; font-size:13px; color:#D0DCF5;">"${m.note}"</p>
          ${m.status === 'pending' ? `
            <div style="display:flex; flex-wrap:wrap; gap:8px;">
              <button type="button" class="btn-pill-mint" data-mtg-accept="${m.id}">⚡ Kabul Et &amp; MP Ata</button>
              <button type="button" class="btn-pill-soft" data-mtg-resched="${m.id}">🕒 +5 Dk Kaydır</button>
              <button type="button" class="btn-pill-soft" data-mtg-decline="${m.id}">Geç</button>
            </div>
          ` : m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
              <button type="button" class="btn-pill-soft" data-focus-table="${m.tableId}">📍 3D Masa: <strong>${m.tableId}</strong></button>
              <button type="button" class="btn-pill-primary" data-start-timer="${m.id}">▶ 05:00 Başlat</button>
            </div>
          ` : `<span style="font-size:12px; color:#94A3B8;">Reddedildi</span>`}
        </div>
      `).join('') || `<p style="font-size:13.5px; color:#94A3B8;">Bekleyen istek bulunmuyor.</p>`;
    }

    if (otherHost) {
      const seen = new Set();
      const items = [];
      snap.meetings.filter((m) => m.direction === 'outgoing' || m.status === 'accepted').forEach((m) => {
        if (!seen.has(m.id)) { seen.add(m.id); items.push(m); }
      });

      otherHost.innerHTML = items.map((m) => `
        <div class="activity-card ${m.status === 'accepted' ? 'is-accepted' : ''}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div>
              <strong style="font-size:16px;">${m.peerName}</strong>
              <div style="font-size:12.5px; color:#93C5FD; font-weight:700;">${m.peerOrg} &middot; ${m.peerTitle}</div>
            </div>
            <span style="background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700;">${m.slot}</span>
          </div>
          ${m.status === 'accepted' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:12px;">
              <button type="button" class="btn-pill-soft" data-focus-table="${m.tableId}">📍 G Blok <strong>${m.tableId}</strong></button>
              <button type="button" class="btn-pill-mint" data-start-timer="${m.id}">▶ Masadayım · 05:00</button>
            </div>
          ` : m.status === 'pending' ? `
            <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:12px;">
              <span style="font-size:12px; font-weight:700; color:#FBBF24;">⏳ Yanıt Bekleniyor</span>
              <button type="button" class="btn-pill-soft" data-sim-peer-accept="${m.id}">✨ Demo: Kabul Etsin</button>
            </div>
          ` : ''}
        </div>
      `).join('');
    }

    document.querySelectorAll('[data-focus-table]').forEach((b) => { b.onclick = () => focus3DTable(b.dataset.focusTable); });
    document.querySelectorAll('[data-mtg-accept]').forEach((b) => {
      b.onclick = () => {
        const u = Core.respondToMeeting(b.dataset.mtgAccept, 'accept');
        if (u) { focus3DTable(u.tableId); showToast(`🎉 Eşleşme onaylandı! 3D Arena'da ${u.tableId} masası ayrıldı.`); }
      };
    });
    document.querySelectorAll('[data-mtg-resched]').forEach((b) => {
      b.onclick = () => {
        const s = Core.getSnapshot();
        const cur = s.meetings.find((x) => x.id === b.dataset.mtgResched);
        const idx = Math.max(0, s.slots5Min.indexOf(cur?.slot));
        const u = Core.respondToMeeting(b.dataset.mtgResched, 'reschedule', s.slots5Min[(idx + 1) % s.slots5Min.length]);
        if (u) { focus3DTable(u.tableId); showToast(`🕒 Yeni saat (${u.slot}) ve ${u.tableId} masası onaylandı!`); }
      };
    });
    document.querySelectorAll('[data-mtg-decline]').forEach((b) => {
      b.onclick = () => { Core.respondToMeeting(b.dataset.mtgDecline, 'decline'); showToast('İstek geçildi.'); };
    });
    document.querySelectorAll('[data-sim-peer-accept]').forEach((b) => {
      b.onclick = () => {
        const u = Core.respondToMeeting(b.dataset.simPeerAccept, 'accept');
        if (u) { focus3DTable(u.tableId); showToast(`🎉 ${u.peerName} kabul etti! Masa: ${u.tableId}`); }
      };
    });
    document.querySelectorAll('[data-start-timer]').forEach((b) => {
      b.onclick = () => {
        const t = Core.startMeetingTimer(b.dataset.startTimer);
        if (t) { focus3DTable(t.tableId); showToast(`⚡ ${t.tableId} masasında 5 dakikalık görüşme başladı!`); }
      };
    });
  }

  // Dynamic Island 05:00 Timer
  function updateDynamicIsland() {
    const snap = Core.getSnapshot();
    const dock = document.getElementById('active-timer-dock');
    const digits = document.getElementById('timer-digits');
    const label = document.getElementById('timer-peer-label');
    const arc = document.getElementById('timer-ring-arc');
    if (!dock || !digits) return;
    if (!snap.activeTimer) { dock.hidden = true; return; }
    dock.hidden = false;
    const total = snap.activeTimer.durationSec || 300;
    const rem = Math.max(0, Math.ceil((snap.activeTimer.endsAt - Date.now()) / 1000));
    digits.textContent = `${String(Math.floor(rem / 60)).padStart(2, '0')}:${String(rem % 60).padStart(2, '0')}`;
    if (label) label.textContent = `${snap.activeTimer.peerName} (${snap.activeTimer.peerOrg}) · ${snap.activeTimer.tableId}`;
    if (arc) arc.setAttribute('stroke-dashoffset', ((1 - rem / total) * 100.5).toFixed(1));
    if (rem === 0) { Core.stopMeetingTimer(); showToast('⏰ 5 dakikalık görüşme tamamlandı!'); }
  }
  setInterval(updateDynamicIsland, 1000);

  document.getElementById('btn-share-cv')?.addEventListener('click', () => {
    showToast(`✨ Dijital Wallet Pass'iniz (${Core.loadBadge().email}) paylaşıldı!`);
  });
  document.getElementById('btn-end-timer')?.addEventListener('click', () => {
    Core.stopMeetingTimer();
    showToast('Görüşme sonlandırıldı.');
  });

  // 2-Sided 3D Flipping Wallet Pass
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
    document.getElementById('pass-gate').textContent = `⛺ ${(b.checkedInGate || 'gate-1').toUpperCase()} AKREDİTE`;

    document.getElementById('pass-tags').innerHTML = (b.tags || []).map((t) => `
      <span style="background:rgba(255,255,255,0.12); padding:4px 11px; border-radius:999px; font-size:11.5px; font-weight:700;">${t}</span>
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
        <button type="button" class="tap-tag ${selectedTags.has(tag) ? 'is-on' : ''}" data-tap-tag="${tag}">${tag}</button>
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
      roleLabel: ROLE_LABELS[roleType] || 'KATILIMCI PASS',
      org: document.getElementById('bf-org').value.trim(),
      tags: selectedTags.size ? Array.from(selectedTags) : ['Yapay Zeka', 'Staj']
    });
    renderPassView(Core.getSnapshot());
    flipInner?.classList.remove('is-flipped');
    showToast(`🎫 Wallet Pass güncellendi, ${saved.name}!`);
  });

  // Camera & Quick QR
  const toggleCamBtn = document.getElementById('btn-toggle-camera');
  const videoEl = document.getElementById('qr-video');
  const placeholderEl = document.getElementById('camera-placeholder');

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      showToast('Kamera desteklenmiyor; aşağıdaki saha etiketlerini kullanabilirsiniz.');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoEl.srcObject = cameraStream;
      videoEl.hidden = false;
      if (placeholderEl) placeholderEl.hidden = true;
      await videoEl.play();
      toggleCamBtn.textContent = 'Kamerayı Kapat';
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
      showToast('Kamera izni verilmedi; tek tıkla saha etiketlerini kullanabilirsiniz.');
    }
  }

  function stopCamera() {
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (cameraStream) { cameraStream.getTracks().forEach((t) => t.stop()); cameraStream = null; }
    if (videoEl) { videoEl.hidden = true; videoEl.srcObject = null; }
    if (placeholderEl) placeholderEl.hidden = false;
    if (toggleCamBtn) toggleCamBtn.textContent = 'Kamerayı Aç';
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
      showToast(res.ok ? `✅ ${res.label}` : res.message);
    });
  });

  function renderScanHistory(snap) {
    const host = document.getElementById('scan-history-list');
    if (!host) return;
    host.innerHTML = snap.scanHistory.slice(0, 8).map((item) => {
      const d = new Date(item.ts);
      const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.1); font-size:13px;">
          <div>
            <span style="background:rgba(255,59,56,0.22); color:#FF8E8C; padding:2px 8px; border-radius:999px; font-weight:800; font-size:11.5px; margin-right:6px;">${item.code}</span>
            <span>${item.label}</span>
          </div>
          <small style="color:#94A3B8; font-weight:700;">${hhmm}</small>
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
    updateDynamicIsland();
  }

  renderAll(Core.getSnapshot());
  Core.subscribe(renderAll);
  checkUrlParams();
})();
