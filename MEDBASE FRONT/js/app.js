/* ============================================================
   MedBase — Core app logic (shared)
   ============================================================ */

/* ---------- Theme ---------- */
const THEME_KEY = 'medbase:theme';

function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark' || theme === 'light') {
    root.setAttribute('data-theme', theme);
  } else {
    root.removeAttribute('data-theme');
  }
}
function currentTheme() {
  const stored = getStoredTheme();
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function toggleTheme() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(THEME_KEY, next); } catch {}
  applyTheme(next);
  refreshIcons();
}

/* run ASAP (also inlined in <head> to prevent flash) */
applyTheme(getStoredTheme());

/* ---------- Icons ---------- */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/* ---------- Search history store ---------- */
const HISTORY_KEY = 'medbase:history';
const SEED_KEY = 'medbase:seeded';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(list) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 10))); } catch {}
}
function recordSearch(entry, query) {
  if (!entry) return;
  const list = getHistory().filter(it => it.id !== entry.id);
  list.unshift({
    id: entry.id,
    type: entry.type,
    title: entry.name || entry.title || entry.query,
    q: query || entry.query,
    ts: Date.now()
  });
  saveHistory(list);
}
function clearHistory() { saveHistory([]); }

/* ---------- Favorites store ---------- */
const FAV_KEY = 'medbase:favorites';

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}
function isFavorite(id) { return getFavorites().some(f => f.id === id); }
function toggleFavorite(entry, query) {
  if (!entry) return false;
  const list = getFavorites();
  const i = list.findIndex(f => f.id === entry.id);
  let nowFav;
  if (i >= 0) { list.splice(i, 1); nowFav = false; }
  else {
    list.unshift({
      id: entry.id, type: entry.type,
      title: entry.name || entry.title || entry.query,
      q: query || entry.query, ts: Date.now()
    });
    nowFav = true;
  }
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch {}
  return nowFav;
}

/* ---------- Clipboard (with iframe-safe fallback) ---------- */
function copyText(text) {
  return new Promise(resolve => {
    const fallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { /* noop */ }
      resolve();
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(resolve).catch(fallback);
    } else {
      fallback();
    }
  });
}

/* seed sample searches once so the portfolio demo isn't empty */
function seedHistoryOnce() {
  let seeded;
  try { seeded = localStorage.getItem(SEED_KEY); } catch {}
  if (seeded) return;
  const now = Date.now();
  const M = 60 * 1000, H = 60 * M, D = 24 * H;
  const seeds = [
    { e: DATA.medication, off: 4 * M },
    { e: DATA.formula, off: 38 * M },
    { e: DATA.disease, off: 5 * H },
    { e: DATA.history, off: 2 * D }
  ];
  const list = seeds.map(s => ({
    id: s.e.id, type: s.e.type,
    title: s.e.name || s.e.title || s.e.query,
    q: s.e.query, ts: now - s.off
  }));
  saveHistory(list);
  try { localStorage.setItem(SEED_KEY, '1'); } catch {}
}

/* ---------- Time formatting (pt-BR) ---------- */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'agora mesmo';
  if (m < 60) return `há ${m} min`;
  if (h < 24) return `há ${h} h`;
  if (d === 1) return 'ontem';
  if (d < 7) return `há ${d} dias`;
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ---------- Routing ---------- */
async function doSearch(query) {
  const q = (query || '').trim();
  if (!q) return;

  const submitBtns = document.querySelectorAll('.search__submit');
  const primaryBtn = document.querySelector('[data-home-form] .search__submit');
  submitBtns.forEach(b => { b.disabled = true; });
  if (primaryBtn) primaryBtn.textContent = 'Buscando…';

  const hint = document.querySelector('.search__hint');
  const hintOriginal = hint ? hint.textContent : '';
  const coldTimer = hint ? setTimeout(() => {
    hint.textContent = 'O servidor está acordando, aguarde alguns segundos…';
  }, 5000) : null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(
      `${CONFIG.API_URL}/api/busca/${encodeURIComponent(q)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (coldTimer) clearTimeout(coldTimer);

    if (!res.ok) {
      window.location.href = `404.html?q=${encodeURIComponent(q)}`;
      return;
    }

    const data = await res.json();
    sessionStorage.setItem('medbase:result', JSON.stringify(data));
    sessionStorage.setItem('medbase:query', q);

    const type = TIPO_PARA_TYPE[data.tipo] || 'formula';
    window.location.href = PAGE_FOR_TYPE[type](q);

  } catch (e) {
    if (coldTimer) clearTimeout(coldTimer);
    submitBtns.forEach(b => { b.disabled = false; });
    if (primaryBtn) primaryBtn.textContent = 'Buscar';
    if (hint) {
      hint.textContent = e.name === 'AbortError'
        ? 'O servidor demorou demais. Tente novamente.'
        : 'Não foi possível conectar ao servidor.';
      setTimeout(() => { hint.textContent = hintOriginal; }, 5000);
    }
  }
}

/* ---------- Nav: build + wire ---------- */
function navMarkup(active, withSearch) {
  return `
  <nav class="nav">
    <div class="nav__inner container">
      <a class="brand" href="index.html" aria-label="MedBase — início">
        <span class="brand__mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v18M3 12h18"/>
            <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>
          </svg>
        </span>
        Med<b>Base</b>
      </a>
      <div class="nav__links">
        <a class="nav__link ${active==='home'?'is-active':''}" href="index.html" data-lucide-wrap><i data-lucide="search"></i> Buscar</a>
        <a class="nav__link ${active==='historico'?'is-active':''}" href="historico.html"><i data-lucide="history"></i> Histórico</a>
      </div>
      <div class="nav__spacer"></div>
      ${withSearch ? `
      <form class="nav__search" role="search" data-nav-search>
        <svg class="lead" data-lucide="search"></svg>
        <input type="text" name="q" placeholder="Buscar no MedBase…" aria-label="Buscar" autocomplete="off" spellcheck="false" />
        <span class="kbd">/</span>
      </form>` : ''}
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Alternar tema claro/escuro" title="Alternar tema">
        <i class="sun" data-lucide="sun"></i>
        <i class="moon" data-lucide="moon"></i>
      </button>
    </div>
  </nav>`;
}

function footerMarkup() {
  return `
  <footer class="footer">
    <div class="footer__inner container">
      <a class="brand" href="index.html">
        <span class="brand__mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none"/>
          </svg>
        </span>
        Med<b>Base</b>
      </a>
      <p class="footer__note">Enciclopédia médica — projeto de portfólio. Conteúdo meramente ilustrativo; não constitui aconselhamento médico.</p>
    </div>
  </footer>`;
}

function mountChrome(opts = {}) {
  const { active = '', navSearch = true } = opts;
  const navHost = document.querySelector('[data-nav]');
  if (navHost) navHost.innerHTML = navMarkup(active, navSearch);
  const footHost = document.querySelector('[data-footer]');
  if (footHost) footHost.innerHTML = footerMarkup();

  // theme toggle
  document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleTheme);
  });
  // nav search
  const navForm = document.querySelector('[data-nav-search]');
  if (navForm) {
    navForm.addEventListener('submit', e => {
      e.preventDefault();
      doSearch(navForm.querySelector('input').value);
    });
  }
  refreshIcons();
}

/* "/" focuses the most relevant search field */
function wireSlashShortcut() {
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    const field = document.querySelector('[data-primary-search]') ||
                  document.querySelector('[data-nav-search] input');
    if (field) { e.preventDefault(); field.focus(); }
  });
}

/* react to system theme changes when no explicit choice */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (!getStoredTheme()) refreshIcons();
});
