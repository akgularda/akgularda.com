const bootMenuToggle = () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;
  document.body.classList.add('js');
  const setOpen = (open, returnFocus = false) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('[data-menu-label]').textContent = open ? 'Close' : 'Menu';
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-rail') && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
  const mobile = window.matchMedia('(max-width: 980px)');
  mobile.addEventListener('change', () => setOpen(false));
};

const normalize = text => text.toLocaleLowerCase('tr').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');
const bootArchives = () => {
  document.querySelectorAll('[data-archive]').forEach(archive => {
    const form = archive.querySelector('[data-controls]');
    if (!form) return;
    const entries = Array.from(archive.querySelectorAll('[data-entry]'));
    const search = form.querySelector('[data-search-input]');
    const filters = Array.from(form.querySelectorAll('[data-filter]'));
    const names = ['q', ...filters.map(field => field.name)];
    const readURL = () => {
      const params = new URLSearchParams(window.location.search);
      search.value = params.get('q') || '';
      filters.forEach(field => { field.value = params.get(field.name) || ''; });
    };
    const update = (writeURL = true) => {
      const terms = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
      let count = 0;
      entries.forEach(entry => {
        const text = normalize(entry.dataset.search || entry.textContent);
        const visible = terms.every(term => text.includes(term)) && filters.every(field => !field.value || entry.dataset[field.dataset.filter] === field.value);
        entry.hidden = !visible;
        if (visible) count++;
      });
      archive.querySelectorAll('[data-project-group]').forEach(group => {
        group.hidden = !Array.from(group.querySelectorAll('[data-entry]')).some(entry => !entry.hidden);
      });
      const jumps = archive.querySelector('[data-project-jumps]');
      if (jumps) jumps.hidden = count !== entries.length;
      archive.querySelector('[data-count]').textContent = count + ' of ' + entries.length + ' ' + (archive.dataset.unit || 'articles');
      archive.querySelector('[data-empty]').hidden = count !== 0;
      if (writeURL) {
        const url = new URL(window.location.href);
        names.forEach(name => url.searchParams.delete(name));
        if (search.value.trim()) url.searchParams.set('q', search.value.trim());
        filters.forEach(field => { if (field.value) url.searchParams.set(field.name, field.value); });
        window.history.replaceState(null, '', url);
      }
    };
    form.hidden = false;
    readURL();
    update(false);
    form.addEventListener('submit', event => { event.preventDefault(); update(); });
    form.addEventListener('input', () => update());
    form.addEventListener('change', () => update());
    const clear = () => { search.value = ''; filters.forEach(field => { field.value = ''; }); update(); search.focus(); };
    form.querySelector('[data-reset]').addEventListener('click', clear);
    archive.querySelector('[data-clear]').addEventListener('click', clear);
    window.addEventListener('popstate', () => { readURL(); update(false); });
  });
};

const bootCopyBio = () => {
  const button = document.querySelector('[data-copy-bio]');
  if (!button || !navigator.clipboard?.writeText) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    const status = document.querySelector('[data-copy-status]');
    try { await navigator.clipboard.writeText(document.querySelector('[data-biography]').textContent.trim()); status.textContent = 'Biography copied.'; }
    catch { status.textContent = 'Select the biography below to copy it.'; }
  });
};
document.addEventListener('DOMContentLoaded', () => { bootMenuToggle(); bootArchives(); bootCopyBio(); });
