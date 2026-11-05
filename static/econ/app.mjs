import { advice, advance, approvalExtremes, events, forecast, initial, lengths, policies,
  scenarios, settings } from './model.mjs';

const root = document.querySelector('#app');
const sessionLabel = document.querySelector('#session-label');
const params = new URLSearchParams(location.search);
const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const fmt = (value, unit = '') => value == null ? '—' : `${number.format(value)}${unit}`;
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const safeCode = value => /^[A-Z2-9]{6}$/.test(value ?? '') ? value : '';
const validKey = value => typeof value === 'string' && /^[A-Za-z0-9_-]{32}$/.test(value);
const key = suffix => `ekonomi:${location.pathname}:${suffix}`;

function load(suffix, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key(suffix))) ?? fallback; } catch { return fallback; }
}

function store(suffix, value) {
  localStorage.setItem(key(suffix), JSON.stringify(value));
}

async function api(path, { method = 'GET', token, data, raw = false } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (data) headers['Content-Type'] = 'application/json';
  const response = await fetch(`./api/${path}`, { method, headers, body: data ? JSON.stringify(data) : undefined });
  if (raw && response.ok) return response.blob();
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error), { status: response.status });
  return result;
}

function explain(error) {
  if (error instanceof TypeError) return 'Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.';
  if (error instanceof DOMException) return 'Tarayıcı oturumu kaydedemedi. Site depolamasını etkinleştir.';
  return error.message;
}

function bindForm(form, work) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.submitter ?? form.querySelector('button[type=submit]');
    if (form.dataset.busy) return;
    form.dataset.busy = 'true';
    const errorBox = form.querySelector('.error');
    errorBox.textContent = '';
    if (button) button.disabled = true;
    try { await work(new FormData(form), button); }
    catch (error) { errorBox.textContent = explain(error); }
    finally {
      delete form.dataset.busy;
      if (button) button.disabled = false;
    }
  });
}

const error = '<p class="error" role="alert"></p>';
const button = (label, classes = '') => `<button class="button ${classes}" type="submit">${label}</button>`;
const heroMark = `<svg viewBox="0 0 320 175" fill="none" aria-hidden="true"><path d="M5 145H315M5 105H315M5 65H315M5 25H315" stroke="#55736a"/><path d="M12 131l45-25 41 9 49-56 46 26 48-37 64-29" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 131l45-25 41 9 49-56 46 26 48-37 64-29v126H12z" fill="currentColor" opacity=".12"/><circle cx="147" cy="59" r="6" fill="currentColor"/><circle cx="305" cy="19" r="7" fill="currentColor"/><text x="6" y="167" fill="#d4e1d4" font-family="system-ui" font-size="10" letter-spacing="2">KARAR → EKONOMİ → SONUÇ</text></svg>`;

function home() {
  const lastTeacher = safeCode(load('lastTeacher'));
  const lastRoom = safeCode(load('lastRoom'));
  const savedSolo = load('solo');
  root.innerHTML = `<section class="hero"><div><p class="kicker">MAKROEKONOMİ SİMÜLASYONU</p><h1>Ekonominin dümeni sende.</h1><p class="lead">Faizi, vergileri ve kamu harcamalarını belirle. Her yıl ekonominin ve halkın kararlarına nasıl tepki verdiğini gör.</p></div><div class="hero-mark">${heroMark}</div></section>
    <div class="launch"><section class="panel stack"><div><p class="kicker">01 / KURULUM</p><h2>Yeni oyun</h2></div>
    <form id="setup" class="setup"><fieldset class="scenarios"><legend>Ekonomik senaryo</legend>${Object.entries(scenarios).map(([id, scenario]) => `<label class="scenario-option"><input type="radio" name="scenario" value="${id}" ${id === 'base' ? 'checked' : ''}><span><b>${scenario.name}</b><small>${scenario.description}</small></span></label>`).join('')}</fieldset>
    <div class="form-grid"><div class="field"><label for="turns">Tur sayısı</label><select id="turns" name="turns">${lengths.map(n => `<option ${n === 7 ? 'selected' : ''} value="${n}">${n} tur</option>`).join('')}</select></div><div class="field"><label for="storyline">Küresel şok</label><select id="storyline" name="storyline"><option value="classic">Klasik · 5. yıl</option><option value="revised">Erken · 3. yıl</option></select></div></div>
    <details><summary>Gelişmiş ayarlar</summary><div class="form-grid"><div class="field"><label for="spendingMultiplier">Harcama çarpanı</label><input id="spendingMultiplier" name="spendingMultiplier" type="number" min="0" max="3" step="0.1" value="1" required></div><div class="field"><label for="taxMultiplier">Vergi çarpanı</label><input id="taxMultiplier" name="taxMultiplier" type="number" min="0" max="3" step="0.1" value="1" required></div></div></details>
    <label class="event-setting"><input type="checkbox" name="eventCards" checked><span><b>Olay kartları</b><small>Üç yılda kararlarından önce bir ekonomik olay duyurulur.</small></span></label>
    <div class="form-grid"><div class="field"><label for="class-name">Sınıf adı</label><input id="class-name" name="className" maxlength="60" placeholder="Örn. Makroekonomi A" autocomplete="off"><small>Sınıf açarken doldur.</small></div>
    <div class="field"><label for="room-mode">Sınıf oyun biçimi</label><select id="room-mode" name="mode"><option value="individual">Bireysel</option><option value="teams">Takım oyunu</option></select></div></div>${error}
    <div class="actions"><button class="button" type="submit" value="solo">Tek başına oyna</button><button class="button secondary" type="submit" value="teacher">Sınıf aç ve QR oluştur</button></div></form></section>
    <div class="stack"><section class="panel stack"><div><p class="kicker">02 / KATILIM</p><h2>Sınıfa katıl</h2><p class="lead">Eğitmenin paylaştığı QR kodu okut veya altı karakterli sınıf kodunu gir.</p></div><form id="lookup" class="stack"><div class="field"><label for="room-code">Sınıf kodu</label><input id="room-code" name="code" maxlength="6" minlength="6" autocapitalize="characters" autocomplete="off" required></div>${error}<div>${button('Sınıfı bul')}</div></form></section>
    ${savedSolo || lastTeacher || lastRoom ? `<section class="panel stack"><h3>Önceki oturumlar</h3><div class="actions">${savedSolo ? '<a class="button secondary small" href="?play=1">Tek kişilik oyuna dön</a>' : ''}${lastTeacher ? `<a class="button secondary small" href="?teacher=${lastTeacher}">Eğitmen paneline dön</a>` : ''}${lastRoom ? `<a class="button secondary small" href="?join=${lastRoom}">Sınıf oyununa dön</a>` : ''}</div></section>` : ''}</div></div>`;

  bindForm(root.querySelector('#setup'), async (form, clicked) => {
    const config = settings({ scenario: form.get('scenario'), turns: Number(form.get('turns')),
      storyline: form.get('storyline'), spendingMultiplier: Number(form.get('spendingMultiplier')),
      taxMultiplier: Number(form.get('taxMultiplier')), eventCards: form.has('eventCards') });
    if (clicked?.value === 'teacher') {
      const session = await api('rooms', { method: 'POST', data: { name: form.get('className'), config, mode: form.get('mode') } });
      store(`teacher:${session.room.code}`, session.token);
      store('lastTeacher', session.room.code);
      location.href = `?teacher=${session.room.code}`;
    } else {
      if (savedSolo?.history.length && savedSolo.history.length < savedSolo.config.turns &&
          !window.confirm('Yarım kalan tek kişilik oyunun yerine yeni bir oyun başlatılsın mı?')) return;
      store('solo', { config, history: [] });
      location.href = '?play=1';
    }
  });
  bindForm(root.querySelector('#lookup'), async form => {
    const code = safeCode(form.get('code').trim().toUpperCase());
    if (!code) throw new Error('Altı karakterli bir sınıf kodu gir.');
    await api(`rooms/${code}`);
    location.href = `?join=${code}`;
  });
}

async function join(code) {
  const session = load(`player:${code}`);
  if (session) {
    try {
      const data = await api(`players/${session.id}`, { token: session.token });
      return game({ config: data.room.config, history: data.player.history, room: data.room,
        player: data.player, team: data.team, session });
    } catch (cause) {
      if (cause.status !== 403) throw cause;
    }
  }
  const { room, teams } = await api(`rooms/${code}`);
  const grouped = room.mode === 'teams';
  const teamSelect = grouped ? `<div class="field"><label for="team-select">Takımın</label>
    <select id="team-select" name="teamId" required><option value="">Takım seç</option>${teams.map(team =>
      `<option value="${escape(team.id)}">${escape(team.name)}</option>`).join('')}</select></div>` : '';
  const entry = `<form class="stack"><div class="field"><label for="student-name">Görünen ad</label>
    <input id="student-name" name="name" minlength="2" maxlength="40" autocomplete="nickname" required>
    <small>Eğitmenin bu adı sınıf sonuçlarında görecek.</small></div>${teamSelect}${error}<div>${button('Oyuna katıl')}</div></form>`;
  const waiting = '<p role="status">Eğitmen henüz takım eklemedi.</p><div><a class="button secondary" href="">Takımları yenile</a></div>';
  root.innerHTML = `<section class="panel stack"><div><p class="kicker">SINIFA KATIL · ${code}</p><h1>${escape(room.name)}</h1><p class="lead">${scenarios[room.config.scenario].name} · ${room.config.turns} tur</p></div>
    ${room.open ? (grouped && !teams.length ? waiting : entry) : '<p role="status">Bu sınıf yeni katılımlara kapalı.</p>'}</section>`;
  const form = root.querySelector('form');
  if (form) bindForm(form, async data => {
    const result = await api(`rooms/${code}/join`, { method: 'POST',
      data: { name: data.get('name'), teamId: data.get('teamId') } });
    store(`player:${code}`, { id: result.player.id, token: result.token });
    store('lastRoom', code);
    await join(code);
  });
}

const metrics = [
  ['Reel büyüme', 'growth', '%'], ['İşsizlik', 'unemployment', '%'],
  ['Enflasyon', 'inflation', '%'], ['Bütçe / GSYH', 'balance', '%'], ['Tüketici güveni', 'cci', ''],
];

const reports = [
  ['GSYH ve bileşenleri', [['Tüketim', 'consumption'], ['Kamu harcaması', 'spending'], ['Yatırım', 'investment'],
    ['İhracat', 'exports'], ['İthalat', 'imports'], ['Nominal GSYH', 'nominal'], ['Reel GSYH', 'real']]],
  ['Diğer makro göstergeler', [['Sermaye stoku', 'capital'], ['Verimlilik artışı', 'productivity', '%'],
    ['Tüketici fiyat endeksi', 'cpi'], ['Döviz kuru endeksi', 'exchange'], ['Ticaret dengesi', 'trade'],
    ['Gelir vergisi geliri', 'incomeRevenue'], ['Kurumlar vergisi geliri', 'corporateRevenue'],
    ['Faiz dışı bütçe dengesi', 'primaryBudget'], ['Borç faiz gideri', 'interestCost'],
    ['Bütçe dengesi', 'budget'], ['Kamu borcu', 'debt'], ['Borç / GSYH', 'debtRatio', '%'],
    ['Kamu nakit rezervi', 'reserves'], ['Reel politika faizi', 'realRate', '%']]],
  ['Ortam, kararlar ve sonuçlar', [['Dünya büyümesi', 'world', '%'], ['CCI', 'cci'], ['Olay kartı', 'event'],
    ...Object.entries(policies).map(([id, policy]) => [policy.label, id, policy.unit === '%' ? '%' : '']),
    ...metrics.slice(0, 4), ['Borç faiz gideri', 'interestCost'], ['Borç / GSYH', 'debtRatio', '%'],
    ['Halk onayı', 'approval'], ['Ortalama onay', 'average'], ['Kararı gönderen', 'submittedByName']]],
];

function reportTable(rows, columns) {
  const visible = rows.filter(([, field]) => field !== 'submittedByName' || columns.some(row => row.submittedByName));
  const cell = (row, field, unit) => {
    if (field === 'event') return events[row.event]?.name ?? '—';
    if (field === 'submittedByName') return escape(row.submittedByName ?? '—');
    return fmt(row[field] ?? row.policy[field], unit);
  };
  return `<div class="report-scroll" tabindex="0" role="region" aria-label="Yatay kaydırılabilir sonuç tablosu"><table class="report"><thead><tr><th scope="col">Gösterge</th>${columns.map(row => `<th scope="col">Yıl ${row.year}</th>`).join('')}</tr></thead><tbody>${visible.map(([label, field, unit]) => `<tr><th scope="row">${label}</th>${columns.map(row => `<td>${cell(row, field, unit)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function chart(history, [label, field, unit]) {
  const values = history.map(row => row[field]);
  const bars = field !== 'approval' && field !== 'cci';
  const lowest = field === 'approval' ? 0 : Math.floor(Math.min(...values, ...(bars ? [0] : [])));
  const highest = field === 'approval' ? 100 : Math.max(lowest + 1, Math.ceil(Math.max(...values, ...(bars ? [0] : []))));
  const yAt = value => 86 - 70 * (value - lowest) / (highest - lowest);
  const barWidth = Math.min(24, 136 / values.length);
  const points = values.map((value, index) => [
    55 + index * 193 / Math.max(1, values.length - 1), yAt(value),
  ]);
  const accessible = history.map((row, index) => `Yıl ${row.year} ${fmt(values[index], unit)}`).join(', ');
  const score = history.at(-1).points?.[field];
  const status = score === 25 ? 'İyi' : score === 10 ? 'Orta' : 'Zayıf';
  const marks = bars ? points.map(([x, y]) => `<rect class="chart-dot" x="${x - barWidth / 2}"
    y="${Math.min(yAt(0), y)}" width="${barWidth}" height="${Math.abs(yAt(0) - y)}"/>`).join('') :
    `<polyline class="chart-line" points="${points.map(point => point.join(',')).join(' ')}"/>
    ${points.map(([x, y]) => `<circle class="chart-dot" cx="${x}" cy="${y}" r="3"/>`).join('')}`;
  return `<figure class="trend"><figcaption>${label}</figcaption>
    <div class="trend-value"><strong>${fmt(values.at(-1), unit)}</strong>
    ${score == null ? '' : `<span class="score-marker score-${score}">${status} · ${score}/25</span>`}</div>
    <svg class="mini-chart" viewBox="0 0 275 108" role="img" aria-label="${label}. ${accessible}">
    <path class="chart-grid" d="M43 16h217M43 51h217M43 86h217"/>
    <text class="chart-label" x="40" y="19" text-anchor="end">${fmt(highest, unit)}</text>
    <text class="chart-label" x="40" y="89" text-anchor="end">${fmt(lowest, unit)}</text>
    <text class="chart-label" x="43" y="103">Yıl ${history[0].year}</text>
    ${history.length > 1 ? `<text class="chart-label" x="260" y="103" text-anchor="end">Yıl ${history.at(-1).year}</text>` : ''}
    ${marks}</svg></figure>`;
}

function eventCard(id) {
  const event = events[id];
  if (!event) return '';
  return `<aside class="event-card"><p class="kicker">OLAY KARTI</p>
    <h3>${event.name}</h3><p>${event.detail}</p></aside>`;
}

function endSummary(history) {
  const { highest, lowest, bestYears, hardestYears } = approvalExtremes(history);
  const list = new Intl.ListFormat('tr', { type: 'conjunction' });
  const yearList = years => `${list.format(years.map(year => `${year}.`))} ${years.length > 1 ? 'yıllar' : 'yıl'}`;
  const rank = (label, years, score) => `<div><dt>${label}</dt>
    <dd>${yearList(years)} <span>· ${score}/100</span></dd></div>`;
  return `<section class="end-summary" aria-labelledby="end-summary-title">
    <p class="kicker">HALK ONAYINA GÖRE</p><h2 id="end-summary-title">Oyun sonu özeti</h2>
    ${highest === lowest ? `<p>Bütün yıllar aynı halk onayını aldı (${highest}/100).</p>` :
      `<dl>${rank('En iyi', bestYears, highest)}${rank('En zor', hardestYears, lowest)}</dl>`}
    <p><strong>Tartışma sorusu</strong></p><p>Büyümeyi artırırken hangi bedeli ödedin?</p></section>`;
}

function dashboard(start, last, history, complete) {
  const [growth, employment, inflation, budget, confidence] = metrics;
  const approval = ['Halk onayı', 'approval', ''];
  const charts = [growth, employment, approval, inflation, budget, confidence];
  return `<div class="stack"><div class="section-heading"><h2>Ekonomi göstergeleri</h2>
    <span>${last.year ? `Yıl ${last.year} sonuçları` : 'Başlangıç durumu'}</span></div>
    ${complete ? endSummary(history) : ''}
    ${last.year ? `<div class="dashboard-grid"><div class="trends">${charts.map(metric =>
      chart(metric === approval ? history : [start, ...history], metric)).join('')}</div>
    <aside class="stack"><div class="advisor"><h3>Politika danışmanı</h3><ul>${advice(last).map(message => `<li>${message}</li>`).join('')}</ul></div>
    <div class="average-rating"><h3>Ortalama halk onayı</h3><strong>${fmt(last.average)}</strong><span>/ 100 puan</span></div>
    ${eventCard(last.event)}</aside></div>` : startingMetrics(last)}</div>`;
}

function startingMetrics(start) {
  return `<div class="metrics">${metrics.map(([label, field, unit]) => `<div class="metric">
    <span>${label}</span><strong>${fmt(start[field], unit)}</strong></div>`).join('')}</div>`;
}

function preparation(config, start, next) {
  const scenario = scenarios[config.scenario];
  return `<section class="preparation stack"><div class="section-heading"><h2>Oyuna hazırlık</h2>
    <span>${scenario.name} · ${config.turns} tur</span></div>
    <div class="game-grid"><div class="stack"><h3>Görevin</h3><p>${scenario.description} Her yıl para ve maliye politikası kararları alarak halkın ortalama onayını yükseltmeye çalış.</p></div>
    <div class="stack"><h3>Her tur nasıl ilerler?</h3><ol class="prepare-steps"><li>Ekonomik görünümü incele.</li><li>Faiz, vergiler ve kamu harcamasını belirle.</li><li>Sonuçları ve danışman yorumunu değerlendir.</li></ol></div></div>
    <h3>Başlangıç göstergeleri</h3>${startingMetrics(start)}
    ${next ? '<div><button class="button" type="button" id="next">Kararlara geç →</button></div>' : ''}</section>`;
}

function outlookIcon(world) {
  const sun = '<circle cx="25" cy="25" r="9" fill="#ffce58"/><path d="M25 11v-4m0 36v-4M11 25H7m36 0h-4M15 15l-3-3m26 26-3-3m0-20 3-3M12 38l3-3" stroke="#ffce58" stroke-width="2.5" stroke-linecap="round"/>';
  const cloud = '<path d="M16 39a7 7 0 0 1 7-7 10 10 0 0 1 19 0 6 6 0 0 1-1 12H23a7 7 0 0 1-7-5z" fill="#fff"/>';
  const rain = '<path d="m23 48-2 4m10-4-2 4m10-4-2 4" stroke="#bde1ff" stroke-width="2.5" stroke-linecap="round"/>';
  return `<svg class="outlook-icon" viewBox="0 0 56 56" aria-hidden="true"><path d="M28 1 52 14v28L28 55 4 42V14z" fill="#2673a9"/>${world >= 1.5 ? sun : ''}${world < 2.6 ? cloud : ''}${world < 1.5 ? rain : ''}</svg>`;
}

function decisionForm(last, next, draft) {
  const fields = Object.entries(policies).map(([id, policy]) => {
    const { label, min, max, step, unit, help } = policy;
    const attrs = `min="${min}" max="${max}" step="${step}"`;
    const value = escape(draft?.[id] ?? last.policy[id]);
    const slider = unit === '%' ? `<div class="slider"><input type="range" data-policy="${id}" ${attrs}
      value="${value}" aria-label="${label} kaydırıcısı"><div class="range-labels"><span>${min}%</span><span>${max}%</span></div></div>` : '';
    return `<div class="field"><label for="${id}">${label}</label>
      <div class="decision-control${slider ? ' with-slider' : ''}">${slider}<div class="number-control">
      <input id="${id}" name="${id}" type="number" ${attrs} value="${value}" required aria-describedby="${id}-help">
      <span aria-hidden="true">${unit}</span></div></div>
      <small id="${id}-help">Önceki yıl ${fmt(last.policy[id])} ${unit}. ${help}</small></div>`;
  }).join('');
  return `<form id="decisions" class="decision-form"><div class="game-grid"><section class="forecast stack">
    <h2>Yıl ${next.year} ekonomik görünümü</h2><p>${next.outlook}</p>
    <p>Önceki yıl reel büyüme ${fmt(last.growth, '%')}, işsizlik ${fmt(last.unemployment, '%')} ve enflasyon ${fmt(last.inflation, '%')} oldu. Kamu borcu GSYH’nin ${fmt(last.debtRatio, '%')} düzeyinde.</p>
    <div class="forecast-values"><div><span>Dünya büyümesi tahmini</span><strong>${fmt(next.world, '%')}</strong></div>
    <div><span>Tüketici güven endeksi</span><strong>${fmt(next.cci)}</strong></div>${outlookIcon(next.world)}</div>
    ${eventCard(next.event)}</section>
    <section class="stack"><h2>Yıl ${next.year} kararları</h2><div class="policy-fields">${fields}</div></section></div>
    ${error}<div class="decision-submit">${button(`Yıl ${next.year} kararlarını uygula`)}</div></form>`;
}

function game(state, tab = state.history.length ? 'decision' : 'prepare', afterTurn = false) {
  const { config, history, room, player, team, session } = state;
  const scenario = scenarios[config.scenario];
  sessionLabel.textContent = scenario.name;
  sessionLabel.hidden = false;
  const start = initial(config);
  const last = history.at(-1) ?? start;
  const next = forecast(config, history);
  if (!next && tab === 'decision') tab = 'dashboard';
  const replayKey = room ? `replays:${room.code}` : 'replays:solo';
  const archive = load(replayKey, []);
  const tabs = [['Hazırlık', 'prepare'], ...(next ? [['Karar', 'decision']] : []),
    ['Sonuçlar', 'dashboard'], ['Raporlar', 'reports']];
  root.innerHTML = `<div class="stack game-shell"><nav class="tabs" aria-label="Oyun bölümleri">${tabs.map(([label, id]) =>
    `<button type="button" data-tab="${id}" aria-pressed="${tab === id}">${label}</button>`).join('')}</nav>
    <div class="page-title game-title"><div><p class="kicker">${room ? `${escape(room.name)} · ${escape(player.name)}` : 'TEK KİŞİLİK OYUN'}</p><h1>${scenario.name}</h1></div><span class="chip">${next ? `Yıl ${next.year} / ${config.turns}` : `${config.turns} tur tamamlandı`}</span></div>
    <ol class="turns" aria-label="Tur ilerlemesi">${Array.from({ length: config.turns }, (_, i) => `<li ${i < history.length ? 'class="done"' : i === history.length ? 'aria-current="step"' : ''}>${i + 1}</li>`).join('')}</ol>
    ${team ? `<div class="team-strip"><div><strong>Takım · ${escape(team.name)}</strong><p class="small-print">Takım adına her yıl tek karar kaydedilir.</p></div>
      <button class="button secondary small" id="refresh-team" type="button">Takım durumunu yenile</button>
      <p class="small-print team-status" id="team-status" role="status">${escape(state.teamNotice ?? '')}</p></div>` : ''}
    <div id="game-content" tabindex="-1">${tab === 'prepare' ? preparation(config, start, next) : tab === 'decision' ? decisionForm(last, next, state.draft) : tab === 'dashboard' ? `<section class="stack">${dashboard(start, last, history, !next)}<div class="actions">${next ? '<button class="button" id="next" type="button">Sonraki yılın kararları →</button>' : `${team || (room && !room.open) ? '' : '<button class="button secondary" id="replay" type="button">Aynı ayarlarla yeniden oyna</button>'}<a class="quiet" href="./">Ana sayfaya dön</a>`}</div>${error}</section>` : `<section class="stack">${reports.map(([label, rows]) => `<section class="panel stack"><h2>${label}</h2>${reportTable(rows, [start, ...history])}</section>`).join('')}${archive.length ? `<details class="panel report-details"><summary>Bu tarayıcıdaki önceki oyunlar (${archive.length})</summary>${archive.map((attempt, index) => `<details class="report-details"><summary>Oyun ${index + 1} · Ortalama ${fmt(attempt.at(-1)?.average)}</summary>${reportTable(reports[2][1], attempt)}</details>`).join('')}</details>` : ''}</section>`}</div></div>`;

  root.querySelectorAll('[data-tab]').forEach(control => control.addEventListener('click', () => {
    game(state, control.dataset.tab);
    root.querySelector(`[data-tab="${control.dataset.tab}"]`).focus();
  }));
  if (afterTurn) root.querySelector('#game-content').focus();
  root.querySelector('#next')?.addEventListener('click', () => game(state, 'decision', true));
  const refreshTeam = root.querySelector('#refresh-team');
  async function syncTeam() {
    const result = await api(`players/${session.id}`, { token: session.token });
    if (result.player.history.length > history.length) {
      game({ ...state, history: result.player.history, room: result.room, draft: null,
        teamNotice: 'Takımın son kararı yüklendi.' }, 'dashboard', true);
    } else root.querySelector('#team-status').textContent = 'Takım durumu güncel.';
  }
  refreshTeam?.addEventListener('click', async () => {
    refreshTeam.disabled = true;
    try { await syncTeam(); }
    catch (cause) { root.querySelector('#team-status').textContent = explain(cause); }
    finally { refreshTeam.disabled = false; }
  });
  const form = root.querySelector('#decisions');
  form?.querySelectorAll('input[type=range]').forEach(slider => {
    const field = form.elements[slider.dataset.policy];
    const paint = () => slider.style.setProperty('--fill', `${100 * (slider.value - slider.min) / (slider.max - slider.min)}%`);
    slider.addEventListener('input', () => { field.value = slider.value; paint(); });
    field.addEventListener('input', () => {
      if (field.value !== '' && field.validity.valid) { slider.value = field.value; paint(); }
    });
    paint();
  });
  form?.addEventListener('input', () => { state.draft = Object.fromEntries(new FormData(form)); });
  if (form) bindForm(form, async data => {
    const policy = Object.fromEntries(Object.keys(policies).map(id => [id, Number(data.get(id))]));
    if (session) {
      try {
        const result = await api(`players/${session.id}/turns`, { method: 'POST', token: session.token,
          data: { year: next.year, policy } });
        game({ ...state, history: result.player.history, room: result.room, draft: null,
          teamNotice: team ? 'Takımın kararı kaydedildi.' : '' }, 'dashboard', true);
      } catch (cause) {
        if (!team || cause.status !== 409) throw cause;
        await syncTeam();
      }
    } else {
      const updated = [...history, advance(config, history, policy)];
      store('solo', { config, history: updated });
      game({ ...state, history: updated, draft: null }, 'dashboard', true);
    }
  });
  root.querySelector('#replay')?.addEventListener('click', async event => {
    event.currentTarget.disabled = true;
    try {
      if (session) {
        const result = await api(`rooms/${room.code}/join`, { method: 'POST', data: { name: player.name } });
        store(`player:${room.code}`, { id: result.player.id, token: result.token });
      } else store('solo', { config, history: [] });
      store(replayKey, [...archive, history].slice(-10));
      location.reload();
    } catch (cause) {
      root.querySelector('.error').textContent = explain(cause);
      root.querySelector('#replay').disabled = false;
    }
  });
}

function adminLogin(prefill = '') {
  const recent = safeCode(load('lastTeacher'));
  root.innerHTML = `<section class="panel stack admin-entry"><div><p class="kicker">EĞİTMEN ERİŞİMİ</p>
    <h1>Yönetim paneli</h1><p class="lead">Bir sınıfı açarken verilen yönetim anahtarıyla giriş yap.</p></div>
    ${recent && validKey(load(`teacher:${recent}`)) ? `<div><a class="button secondary" href="?teacher=${recent}">Son açılan sınıfa dön</a></div>` : ''}
    <form class="stack"><div class="field"><label for="admin-code">Sınıf kodu</label>
    <input id="admin-code" name="code" value="${prefill}" maxlength="6" minlength="6" required autocapitalize="characters"></div>
    <div class="field"><label for="admin-key">Yönetim anahtarı</label>
    <input id="admin-key" name="token" type="password" maxlength="32" minlength="32" required autocomplete="off"></div>
    ${error}<div>${button('Yönetim paneline gir')}</div></form></section>`;
  bindForm(root.querySelector('form'), async form => {
    const code = safeCode(form.get('code').trim().toUpperCase());
    const token = form.get('token').trim();
    if (!code || !validKey(token)) throw new Error('Sınıf kodunu ve yönetim anahtarını kontrol edin.');
    await api(`rooms/${code}/teacher`, { token });
    store(`teacher:${code}`, token);
    store('lastTeacher', code);
    location.href = `?teacher=${code}`;
  });
}

async function teacherPanel(code) {
  const token = load(`teacher:${code}`);
  if (!validKey(token)) return adminLogin(code);
  let data;
  try { data = await api(`rooms/${code}/teacher`, { token }); }
  catch (cause) {
    if (cause.status === 403) return adminLogin(code);
    throw cause;
  }
  const { room, joinUrl } = data;
  const grouped = room.mode === 'teams';
  const teamForm = `<form id="create-team" class="stack team-form"><div class="field"><label for="team-name">Takım adı</label>
    <input id="team-name" name="name" minlength="2" maxlength="40" required autocomplete="off"></div>
    <div>${button('Takım oluştur', 'small')}</div>${error}</form>`;
  root.innerHTML = `<div class="stack"><div class="page-title"><div><p class="kicker">EĞİTMEN YÖNETİM PANELİ</p><h1>${escape(room.name)}</h1><p class="lead">${scenarios[room.config.scenario].name} · ${room.config.turns} tur · ${grouped ? 'Takım oyunu' : 'Bireysel oyun'}</p></div><span class="chip gold" id="open-status"></span></div>
    <div class="class-grid"><section class="panel stack"><div><p class="kicker">KATILIM</p><h2>Sınıf QR kodu</h2></div><img class="qr" src="./api/rooms/${code}/qr" alt="${code} sınıfına katılım QR kodu" width="240" height="240"><p class="class-code">${code}</p><a class="join-link" href="${escape(joinUrl)}" target="_blank" rel="noopener">${escape(joinUrl)}</a><button class="button secondary" type="button" id="copy">Bağlantıyı kopyala</button><p id="copy-status" class="small-print" role="status"></p>${new URL(joinUrl).hostname === 'localhost' || new URL(joinUrl).hostname === '127.0.0.1' ? '<p class="small-print">Telefonla katılım için sınıfı erişilebilir ağ adresinden aç.</p>' : ''}</section>
    <section class="panel stack"><div class="panel-head"><div><p class="kicker">TAKİP</p><h2>${grouped ? 'Takımlar ve sonuçlar' : 'Sınıf sonuçları'}</h2><p class="lead" id="class-summary"></p></div><div class="actions table-actions"><button class="button secondary small" type="button" id="refresh">Yenile</button><button class="button secondary small" type="button" id="download">CSV indir</button><button class="button secondary small" type="button" id="toggle"></button></div></div>
    ${grouped ? teamForm : ''}<p id="class-error" class="error" role="alert"></p><div id="player-list"></div></section></div>
    <details class="panel report-details"><summary>Başka cihazdan yönet</summary><div class="stack">
    <p class="small-print">Yönetim ekranında sınıf kodu ve bu anahtarla giriş yap. Anahtarı yalnızca eğitmenlerle paylaş.</p>
    <div class="field"><label for="class-admin-key">Yönetim anahtarı</label><input id="class-admin-key" type="text" value="${token}" readonly></div>
    </div></details></div>`;
  const list = root.querySelector('#player-list');
  const controls = root.querySelector('#toggle');
  let current = data;
  let refreshing = false;

  function update(result) {
    const openRows = new Set(Array.from(list.querySelectorAll('details[open]'), item => item.dataset.player));
    current = result;
    const open = result.room.open;
    controls.textContent = open ? 'Katılımı kapat' : 'Katılımı aç';
    root.querySelector('#open-status').textContent = open ? 'Katılım açık' : 'Katılım kapalı';
    const runs = grouped ? result.teams : result.players;
    root.querySelector('#class-summary').textContent = `${runs.length} ${grouped ? 'takım' : 'oyun'} · ${runs.filter(row => row.complete).length} tamamlandı`;
    const rows = runs.map(row => `<tr><th scope="row">${escape(row.name)}</th>${grouped ? `<td>${row.members.length}</td>` : ''}
      <td>${row.history.length}/${room.config.turns}</td><td>${fmt(row.average)}</td><td>${fmt(row.history.at(-1)?.cci)}</td></tr>`).join('');
    const details = runs.filter(row => grouped || row.history.length).map(row => `
      <details class="teacher-detail" data-player="${row.id}" ${openRows.has(row.id) ? 'open' : ''}>
      <summary>${escape(row.name)} · ${grouped ? 'Takım raporu' : 'Tur raporu'}</summary>
      ${grouped ? `<p class="small-print">${row.members.length ? `Üyeler · ${row.members.map(escape).join(', ')}` : 'Henüz üye yok.'}</p>` : ''}
      ${row.history.length ? reportTable(reports[2][1], row.history) : '<p class="small-print">Henüz tur tamamlanmadı.</p>'}
      </details>`).join('');
    const empty = grouped ? 'Öğrencilerin katılabilmesi için bir takım oluştur.' :
      'Henüz öğrenci katılmadı. Katılım bağlantısını veya QR kodunu paylaş.';
    list.innerHTML = runs.length ? `<div class="report-scroll" tabindex="0" role="region" aria-label="${grouped ? 'Takım' : 'Öğrenci'} sonuçları">
      <table class="report class-table"><thead><tr><th scope="col">${grouped ? 'Takım' : 'Öğrenci'}</th>
      ${grouped ? '<th scope="col">Üye</th>' : ''}<th scope="col">Tur</th><th scope="col">Ort. onay</th>
      <th scope="col">Son CCI</th></tr></thead><tbody>${rows}</tbody></table></div>${details}` : `<p class="lead">${empty}</p>`;
  }

  async function refresh(patch = false) {
    if (refreshing) return;
    refreshing = true;
    const message = root.querySelector('#class-error');
    try {
      const result = await api(`rooms/${code}/teacher`, patch ? { token, method: 'PATCH', data: { open: !current.room.open } } : { token });
      if (JSON.stringify(result) !== JSON.stringify(current)) update(result);
      message.textContent = '';
    } catch (cause) { message.textContent = explain(cause); }
    finally { refreshing = false; }
  }

  root.querySelector('#refresh').addEventListener('click', () => refresh());
  controls.addEventListener('click', () => refresh(true));
  const createTeam = root.querySelector('#create-team');
  if (createTeam) bindForm(createTeam, async form => {
    const result = await api(`rooms/${code}/teams`, { method: 'POST', token, data: { name: form.get('name') } });
    update(result);
    createTeam.reset();
  });
  root.querySelector('#copy').addEventListener('click', async () => {
    const status = root.querySelector('#copy-status');
    try { await navigator.clipboard.writeText(joinUrl); status.textContent = 'Bağlantı kopyalandı.'; }
    catch { status.textContent = 'Yukarıdaki bağlantıyı seçip kopyalayabilirsin.'; }
  });
  root.querySelector('#download').addEventListener('click', async () => {
    try {
      const blob = await api(`rooms/${code}/csv`, { token, raw: true });
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: `sinif-${code}.csv` });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) { root.querySelector('#class-error').textContent = explain(cause); }
  });
  update(data);
  setInterval(() => {
    if (!document.hidden && !list.contains(document.activeElement) && !createTeam?.dataset.busy) refresh();
  }, 8000);
}

function guide() {
  root.innerHTML = `<article class="panel stack guide"><div><p class="kicker">KAYNAKLAR</p><h1>Oyun rehberi</h1></div><p>Amacın, seçilen dönem boyunca ortalama halk onayını yükseltmek. Her tur bir ekonomik yılı temsil eder.</p><ol><li>Dünya büyüme tahminini ve tüketici güvenini incele.</li><li>Faizi, gelir ve kurumlar vergisini, kamu harcamasını belirle.</li><li>Sonuçlarda büyüme, işsizlik, enflasyon, bütçe dengesi, CCI ve halk onayını kontrol et.</li><li>Raporlarda milli gelir bileşenlerini, borcu ve tüm kararların geçmişini karşılaştır.</li></ol><h2>Göstergeler ve puanlama</h2><p>CCI 100 civarında referans güveni gösterir. Bu öğretim modelinde senaryo CCI tabanını belirler ve kararların büyümeye etkisi iki tur gecikmeyle güvene yansır. Dört puanlanan gösterge yılda ayrı ayrı 0, 10 veya 25 puan verir. CCI, onay puanına dolaylı olarak etki eder.</p><ul><li>Reel büyüme %2,5 ve üzerinde, işsizlik %5 ve altında en yüksek puanı alır.</li><li>Enflasyon %0–3 arasında, bütçe açığı GSYH’nin %3’ü veya altında en yüksek puanı alır.</li><li>Bütçe tablosunda negatif değer açığı, pozitif değer fazlayı gösterir.</li></ul><h2>Sınıf kullanımı</h2><p>Eğitmen sınıfı açar ve QR kodunu paylaşır. Her öğrenci aynı senaryoda kendi hızında oynar. Eğitmen paneli tur ilerlemesini ve sonuçları gösterir.</p><p class="small-print">Bu bağımsız eğitim simülasyonu yaklaşık bir ekonomik model kullanır. <a href="https://downloads.journalofeconomicsteaching.org/2/2/2-3.pdf">Tasarım referansı: Tim Rogmans’ın Econland makalesi</a>.</p></article>`;
}

try {
  if (params.has('guide')) guide();
  else if (params.has('admin')) adminLogin();
  else if (params.has('join')) {
    const code = safeCode(params.get('join')?.toUpperCase());
    if (!code) throw new Error('Katılım bağlantısındaki sınıf kodu geçersiz.');
    await join(code);
  } else if (params.has('teacher')) {
    const code = safeCode(params.get('teacher'));
    if (!code) throw new Error('Sınıf kodu geçersiz.');
    await teacherPanel(code);
  } else if (params.has('play') && load('solo')) game(load('solo'));
  else home();
} catch (cause) {
  root.innerHTML = `<section class="panel stack"><h1>Oturum açılamadı</h1><p role="alert">${escape(explain(cause))}</p><div class="actions"><a class="button secondary" href="./">Ana sayfaya dön</a></div></section>`;
}
