/* ==========================================================================
   SummitTED 2026 — Passive Campus Wayfinding TV Controller (/tedu-dashboard)
   ========================================================================== */

(function () {
  'use strict';

  const Core = window.SummitTEDCore;
  if (!Core) return;

  function barColor(pct) {
    if (pct >= 84) return '#E41513';
    if (pct >= 62) return '#38BDF8';
    return '#10B981';
  }

  function renderDashboard(snap) {
    const totalEl = document.getElementById('tv-total-accredited');
    const mpEl = document.getElementById('tv-mp-ratio');
    const clockEl = document.getElementById('tv-clock');
    if (totalEl) totalEl.textContent = `${snap.totalAccredited} KİŞİ`;
    if (mpEl) mpEl.textContent = `${snap.occupiedTablesCount} / ${snap.totalTablesCount} MASA`;
    if (clockEl) clockEl.textContent = `${snap.clock.hhmm}:${snap.clock.ss}`;

    // Column 1: 10 Zones + Gates Summary
    const zonesHost = document.getElementById('tv-zones-list');
    if (zonesHost) {
      const zoneRows = snap.zones.map((z) => `
        <div class="fids-zone-row">
          <div>
            <span class="fz-name"><i class="fz-dot" style="background:${z.accent}"></i>${z.shortName}</span>
            <span class="fz-loc">${z.building}</span>
          </div>
          <div class="fz-meter">
            <div class="fz-pct" style="color:${barColor(z.pct)}">%${z.pct} &middot; ${z.status.label}</div>
            <div class="fz-bar"><div class="fz-bar-fill" style="width:${z.pct}%; background:${barColor(z.pct)};"></div></div>
          </div>
        </div>
      `).join('');

      const gatesSummary = `
        <div class="fids-zone-row" style="background:#060D23;">
          <div>
            <span class="fz-name"><i class="fz-dot" style="background:#E41513"></i>Giriş &amp; Akreditasyon Çadırları (Gate 1-2-3)</span>
            <span class="fz-loc">İncesu: ${snap.gates[0].count} &middot; Aksu: ${snap.gates[1].count} &middot; VIP: ${snap.gates[2].count}</span>
          </div>
          <div class="fz-meter">
            <div class="fz-pct" style="color:#10B981;">AÇIK AKIŞ</div>
          </div>
        </div>
      `;
      zonesHost.innerHTML = zoneRows + gatesSummary;
    }

    // Column 2: Corporate Stands across Red, Blue & Promenade
    const standsHost = document.getElementById('tv-stands-list');
    if (standsHost) {
      const corpStands = [
        ...(snap.zonesById.red?.stands || []),
        ...(snap.zonesById.blue?.stands || []),
        ...(snap.zonesById.promenade?.stands || [])
      ];
      standsHost.innerHTML = corpStands.map((s) => `
        <div class="fids-stand-cell">
          <div class="fids-stand-top">
            <strong>${s.name}</strong>
            <span class="fids-stand-code ${s.zoneId === 'red' ? 'is-red' : ''}">${s.code}</span>
          </div>
          <div>
            <div class="fids-stand-meta">
              <span>${s.count}/${s.capacity} kişi</span>
              <strong style="color:${barColor(s.pct)}">%${s.pct}</strong>
            </div>
            <div class="fz-bar"><div class="fz-bar-fill" style="width:${s.pct}%; background:${barColor(s.pct)};"></div></div>
          </div>
        </div>
      `).join('');
    }

    const mpPill = document.getElementById('tv-mp-pill');
    if (mpPill) mpPill.textContent = `${snap.occupiedTablesCount} / ${snap.totalTablesCount} MASA DOLU`;

    // Column 3: Vertically Stacked Schedule + Flashing Alerts
    const soonText = document.getElementById('tv-soon-text');
    if (soonText) {
      if (snap.upcomingSoonSessions.length > 0) {
        const s = snap.upcomingSoonSessions[0];
        soonText.textContent = `${s.minsUntil} dk içinde → ${s.title} (${s.stageLabel})`;
      } else if (snap.liveSessions.length > 0) {
        const l = snap.liveSessions[0];
        soonText.textContent = `Şu an Sahnede → ${l.title} (${l.stageLabel})`;
      }
    }

    const schedHost = document.getElementById('tv-schedule-stack');
    if (schedHost) {
      schedHost.innerHTML = snap.sessions.slice(0, 8).map((s) => {
        let badgeClass = '';
        let badgeLabel = s.tag;
        if (s.stateTag === 'live') {
          badgeClass = 'is-live soft-flash';
          badgeLabel = 'ŞU AN SAHNEDE';
        } else if (s.stateTag === 'soon') {
          badgeClass = 'is-soon soft-flash';
          badgeLabel = `${s.minsUntil} DK İÇİNDE`;
        } else if (s.stateTag === 'ended') {
          badgeLabel = 'TAMAMLANDI';
        }
        return `
          <div class="fids-ses-row ${s.stateTag === 'live' ? 'is-live' : ''}">
            <div class="fids-ses-time">${s.start}–${s.end}</div>
            <div>
              <span class="fids-ses-title">${s.title}</span>
              <span class="fids-ses-sub">${s.stageLabel}</span>
            </div>
            <span class="fids-ses-badge ${badgeClass}">${badgeLabel}</span>
          </div>
        `;
      }).join('');
    }

    // Bottom Flashing Airport Ticker
    const ticker = document.getElementById('tv-bottom-ticker');
    if (ticker) {
      const livePart = snap.liveSessions.map((l) => `ŞU AN SAHNEDE: ${l.title} → ${l.stageLabel}`).join(' · ');
      const soonPart = snap.upcomingSoonSessions.map((u) => `${u.minsUntil} DK İÇİNDE → ${u.title} (${u.stageLabel})`).join(' · ');
      const mpPart = `FUAYE MEETING POINT: ${snap.occupiedTablesCount}/24 Masa Aktif`;
      ticker.textContent = [livePart, soonPart, mpPart].filter(Boolean).join('   |   ');
    }
  }

  renderDashboard(Core.getSnapshot());
  Core.subscribe(renderDashboard);
  setInterval(() => renderDashboard(Core.getSnapshot()), 1000);
})();
