/* ============================================================
   MedBase — Page controllers
   ============================================================ */

/* ---------- helpers ---------- */
function qs(name) {
  return new URLSearchParams(location.search).get(name) || '';
}
function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
function badgeFor(type) {
  return `<span class="badge badge--${type}"><i data-lucide="${TYPE_ICON[type]}"></i>${TYPE_LABEL[type]}</span>`;
}

/* ============================================================
   API ADAPTERS — converte resposta do backend para o formato dos renders
   ============================================================ */

function toSubscript(s) {
  return (s || '').replace(/\d+/g, n => [...n].map(d => '₀₁₂₃₄₅₆₇₈₉'[d]).join(''));
}

function adaptarFormula(api, q) {
  return {
    id:           (api.formula || q).toLowerCase(),
    type:         'formula',
    query:        q,
    name:         api.nome || api.formula || q,
    formulaPretty: toSubscript(api.formula || q),
    structureSvg: null,
    imagem_url:   api.imagem_url || null,
    structTag:    'Estrutura 2D (PubChem)',
    props: [
      { label: 'Fórmula molecular', value: toSubscript(api.formula || q), mono: true },
      { label: 'Nome IUPAC',        value: api.nome || '—',                mono: true },
      { label: 'Massa molar',       value: `${api.peso_molecular || '—'} g/mol`, mono: true },
      { label: 'CID PubChem',       value: String(api.cid || '—'),          mono: true },
    ],
    synonyms:    api.sinonimos || [],
    link_pubchem: api.link_pubchem || '',
  };
}

function adaptarMedicamento(api, q) {
  const nome  = api.nome_generico_pt || api.nome_generico || q;
  const marca = api.nome_marca_pt    || api.nome_marca    || '';
  const fab   = api.fabricante_pt    || api.fabricante    || '—';

  const sections = [];
  function addSec(campo, titulo, icon, tone) {
    const val = api[campo];
    if (!val || val === 'Informação não disponível') return;
    sections.push({
      id: campo, title: titulo, icon, tone,
      html: '<p>' + val.split('\n').filter(Boolean).join('</p><p>') + '</p>',
    });
  }
  addSec('indicacoes',       'Indicações',       'clipboard-list', 'ok');
  addSec('dosagem',          'Posologia',        'pill',           'ok');
  addSec('avisos',           'Advertências',     'triangle-alert', 'warn');
  addSec('contraindicacoes', 'Contraindicações', 'ban',            'danger');
  addSec('efeitos_adversos', 'Reações adversas', 'activity',       'danger');

  return {
    id:       nome.toLowerCase().replace(/[^a-z0-9]/g, ''),
    type:     'medication',
    query:    q,
    name:     nome,
    brand:    marca,
    meta:     [{ label: 'Nome genérico', value: nome }, { label: 'Fabricante', value: fab }],
    sections,
  };
}

function adaptarArtigo(api, q, type) {
  const body = [];
  (api.resumo || '').split('\n\n').filter(p => p.trim()).forEach((p, i) => {
    body.push({ type: i === 0 ? 'lead' : 'p', html: p.trim() });
  });

  const more = [];
  (api.secoes || []).forEach(s => {
    more.push({ type: 'h2', html: s.titulo });
    more.push({ type: 'p',  html: s.texto  });
  });

  const meta = ['Fonte: Wikipédia'];
  if (api.idioma === 'en') meta.push('Conteúdo em inglês');

  return {
    id:          (api.titulo || q).toLowerCase().replace(/[^a-z0-9]/g, ''),
    type,
    query:       q,
    title:       api.titulo || q,
    badge:       type === 'disease' ? 'Doença' : 'História da Medicina',
    meta,
    figureCaption: api.titulo || q,
    imageSlotId: `${type}-hero`,
    imagem_url:  api.imagem_url || null,
    wikiUrl:     api.link_wikipedia || '#',
    body,
    more,
  };
}

/* ============================================================
   HOME
   ============================================================ */
function initHome() {
  const form = document.querySelector('[data-home-form]');
  const input = form.querySelector('input');

  form.addEventListener('submit', e => {
    e.preventDefault();
    doSearch(input.value);
  });

  document.querySelectorAll('[data-example]').forEach(chip => {
    chip.addEventListener('click', () => doSearch(chip.dataset.q));
  });

  renderHomeRecent();
  renderHomeFavorites();
}

function renderHomeRecent() {
  const host = document.querySelector('[data-home-recent]');
  if (!host) return;
  const list = getHistory().slice(0, 5);
  if (!list.length) {
    host.innerHTML = `
      <div class="empty reveal">
        <i data-lucide="telescope"></i>
        <p>Suas buscas recentes aparecerão aqui. Comece pesquisando um termo acima.</p>
      </div>`;
    refreshIcons();
    return;
  }
  host.innerHTML = `
    <div class="recent__head">
      <h3>Buscas recentes</h3>
      <button class="recent__clear" type="button" data-clear-recent>Limpar</button>
    </div>
    <div class="chips">
      ${list.map(it => `<a class="chip" href="${PAGE_FOR_TYPE[it.type](it.q)}">
        <i data-lucide="${TYPE_ICON[it.type]}"></i>${it.title}</a>`).join('')}
    </div>`;
  host.querySelector('[data-clear-recent]')?.addEventListener('click', () => {
    clearHistory();
    renderHomeRecent();
  });
  refreshIcons();
}

function renderHomeFavorites() {
  const host = document.querySelector('[data-home-favorites]');
  if (!host) return;
  const list = getFavorites().slice(0, 6);
  let inner = `<div class="recent__head"><h3>Favoritos</h3></div>`;
  if (!list.length) {
    inner += `<p class="fav-empty">Nenhum favorito ainda. Toque na estrela em um resultado para salvá-lo aqui.</p>`;
  } else {
    inner += `<div class="chips">${list.map(it => `<a class="chip chip--fav" href="${PAGE_FOR_TYPE[it.type](it.q)}">
      <i data-lucide="star"></i>${it.title}</a>`).join('')}</div>`;
  }
  host.innerHTML = inner;
  refreshIcons();
}

/* ---------- Result actions: share + favorite ---------- */
function actionsBar(entry) {
  const fav = isFavorite(entry.id);
  return `
  <div class="result-actions reveal" data-d="1">
    <div class="action-wrap">
      <button class="icon-btn action-btn" type="button" data-share aria-label="Copiar link">
        <i data-lucide="link"></i>
      </button>
      <span class="tooltip" data-share-tip>Copiado!</span>
    </div>
    <button class="icon-btn action-btn ${fav ? 'is-fav' : ''}" type="button" data-fav
            aria-label="Favoritar" aria-pressed="${fav}" title="Favoritar">
      <i data-lucide="star"></i>
    </button>
  </div>`;
}

function wireResultActions(scope, entry, query) {
  const share = scope.querySelector('[data-share]');
  if (share) {
    share.addEventListener('click', () => {
      copyText(location.href).then(() => {
        const tip = scope.querySelector('[data-share-tip]');
        if (!tip) return;
        tip.classList.add('show');
        clearTimeout(tip._t);
        tip._t = setTimeout(() => tip.classList.remove('show'), 1600);
      });
    });
  }
  const fav = scope.querySelector('[data-fav]');
  if (fav) {
    fav.addEventListener('click', () => {
      const now = toggleFavorite(entry, query);
      fav.classList.toggle('is-fav', now);
      fav.setAttribute('aria-pressed', String(now));
      fav.classList.add('pop');
      setTimeout(() => fav.classList.remove('pop'), 180);
    });
  }
}

/* ============================================================
   RESULT (formula | medication)  with skeleton
   ============================================================ */
function initResult() {
  const type = qs('type');
  const q    = qs('q');
  if (!type || !q) { location.replace(`404.html?q=${encodeURIComponent(q)}`); return; }

  const host = document.querySelector('[data-result]');
  host.innerHTML = type === 'formula' ? skeletonFormula() : skeletonMedication();
  refreshIcons();

  async function loadData() {
    const cached = sessionStorage.getItem('medbase:result');
    const cachedQ = sessionStorage.getItem('medbase:query');
    if (cached && cachedQ === q) {
      sessionStorage.removeItem('medbase:result');
      sessionStorage.removeItem('medbase:query');
      return JSON.parse(cached);
    }
    const endpoint = type === 'formula'
      ? `/api/formula/${encodeURIComponent(q)}`
      : `/api/medicamento/${encodeURIComponent(q)}`;
    const res = await fetch(CONFIG.API_URL + endpoint);
    if (!res.ok) throw new Error('not found');
    return res.json();
  }

  Promise.all([loadData(), new Promise(r => setTimeout(r, 600))])
    .then(([api]) => {
      const entry = type === 'formula' ? adaptarFormula(api, q) : adaptarMedicamento(api, q);
      recordSearch(entry, q);
      host.innerHTML = type === 'formula' ? buildFormula(entry) : buildMedication(entry);
      if (type === 'medication') wireAccordion(host);
      wireResultActions(host, entry, q);
      refreshIcons();
    })
    .catch(() => location.replace(`404.html?q=${encodeURIComponent(q)}`));
}

function buildFormula(e) {
  return `
  <div class="crumbs reveal"><a href="index.html">Início</a><i data-lucide="chevron-right"></i><span>Fórmula química</span></div>
  <header class="result-head reveal" data-d="1">
    <div class="result-head__main">
      ${badgeFor('formula')}
      <h1>${e.name}</h1>
      <p class="result-head__sub mono">${e.formulaPretty}</p>
    </div>
    ${actionsBar(e)}
  </header>
  <div class="formula-grid">
    <div class="struct reveal" data-d="2">
      <span class="struct__tag">${e.structTag}</span>
      ${e.structureSvg || (e.imagem_url
        ? `<img src="${e.imagem_url}" alt="Estrutura molecular de ${e.name}" style="max-width:100%;max-height:260px;object-fit:contain">`
        : '<span style="opacity:.4;font-size:13px">Estrutura não disponível</span>')}
      <span class="struct__cap mono">${e.formulaPretty}</span>
    </div>
    <dl class="proplist reveal" data-d="3">
      ${e.props.map(p => `
        <div class="prop">
          <dt>${p.label}</dt>
          <dd class="${p.mono ? 'mono' : ''}">${p.value}</dd>
        </div>`).join('')}
      <div class="prop">
        <dt>Sinônimos</dt>
        <dd><div class="syn-list">${e.synonyms.map(s => `<span class="syn">${s}</span>`).join('')}</div></dd>
      </div>
    </dl>
  </div>`;
}

function buildMedication(e) {
  return `
  <div class="crumbs reveal"><a href="index.html">Início</a><i data-lucide="chevron-right"></i><span>Medicamento</span></div>
  <header class="result-head reveal" data-d="1">
    <div class="result-head__main">
      ${badgeFor('medication')}
      <h1>${e.name}</h1>
      <p class="result-head__sub">${e.brand} · ${e.meta.find(m => m.label==='Fabricante').value}</p>
    </div>
    ${actionsBar(e)}
  </header>
  <dl class="card proplist reveal" data-d="2" style="padding:6px 22px;margin-bottom:28px">
    ${e.meta.map(m => `<div class="prop"><dt>${m.label}</dt><dd>${m.value}</dd></div>`).join('')}
  </dl>
  <div class="accordion reveal" data-d="3">
    ${e.sections.map((s, i) => accordionItem(s, i === 0)).join('')}
  </div>`;
}

function accordionItem(s, open) {
  const toneClass = s.tone === 'danger' ? 'danger' : s.tone === 'warn' ? 'warn' : '';
  return `
  <div class="acc ${open ? 'is-open' : ''}">
    <button class="acc__trigger" type="button" aria-expanded="${open}">
      <span class="acc__icon ${toneClass}"><i data-lucide="${s.icon}"></i></span>
      <span class="acc__title">${s.title}</span>
      <span class="acc__chev"><i data-lucide="chevron-down"></i></span>
    </button>
    <div class="acc__panel"><div class="acc__panel-inner"><div class="acc__body">${s.html}</div></div></div>
  </div>`;
}

function wireAccordion(scope) {
  scope.querySelectorAll('.acc__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const acc = btn.closest('.acc');
      const open = acc.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
}

/* ============================================================
   ARTICLE (disease | history)
   ============================================================ */
function initArticle(type) {
  const q = qs('q');
  if (!q) { location.replace('404.html'); return; }

  const host = document.querySelector('[data-article]');
  host.innerHTML = skeletonArticle();
  refreshIcons();

  async function loadData() {
    const cached = sessionStorage.getItem('medbase:result');
    const cachedQ = sessionStorage.getItem('medbase:query');
    if (cached && cachedQ === q) {
      sessionStorage.removeItem('medbase:result');
      sessionStorage.removeItem('medbase:query');
      return JSON.parse(cached);
    }
    const apiType = type === 'disease' ? 'doenca' : 'historia';
    const res = await fetch(`${CONFIG.API_URL}/api/${apiType}/${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('not found');
    return res.json();
  }

  Promise.all([loadData(), new Promise(r => setTimeout(r, 600))])
    .then(([api]) => {
      const entry = adaptarArtigo(api, q, type);
      recordSearch(entry, q);
      host.innerHTML = buildArticle(entry);
      wireResultActions(host, entry, q);
      wireReadmore(host);
      refreshIcons();
    })
    .catch(() => location.replace(`404.html?q=${encodeURIComponent(q)}`));
}

function articleBlock(b) {
  if (b.type === 'lead') return `<p class="lead">${b.html}</p>`;
  if (b.type === 'h2') return `<h2>${b.html}</h2>`;
  return `<p>${b.html}</p>`;
}

function buildArticle(e) {
  const crumbLabel = e.type === 'disease' ? 'Doenças' : 'História da Medicina';
  return `
  <div class="crumbs reveal"><a href="index.html">Início</a><i data-lucide="chevron-right"></i><span>${crumbLabel}</span></div>
  <article class="article">
    <div class="article__top reveal" data-d="1" style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:6px">
      ${badgeFor(e.type)}
      ${actionsBar(e)}
    </div>
    <h1 class="article__title reveal" data-d="1">${e.title}</h1>
    <div class="article__meta reveal" data-d="2">
      ${e.meta.map((m, i) => `${i ? '<span aria-hidden="true">·</span>' : ''}<span>${m}</span>`).join('')}
    </div>
    <figure class="article__figure reveal" data-d="2">
      <image-slot id="${e.imageSlotId}" shape="rect" src="${e.imagem_url || ''}" placeholder="${e.title}"></image-slot>
      <figcaption>${e.figureCaption}</figcaption>
    </figure>
    <div class="prose reveal" data-d="3">
      ${e.body.map(articleBlock).join('')}
    </div>
    ${e.more && e.more.length ? `
    <div class="readmore reveal" data-d="3" data-readmore>
      <button class="readmore__toggle" type="button" aria-expanded="false">
        <span class="rm-more">Ler mais</span><span class="rm-less">Ler menos</span>
        <i data-lucide="chevron-down"></i>
      </button>
      <div class="readmore__panel"><div class="readmore__inner">
        <div class="prose">${e.more.map(articleBlock).join('')}</div>
      </div></div>
    </div>` : ''}
    <a class="wiki-link reveal" data-d="4" href="${e.wikiUrl}" target="_blank" rel="noopener">
      <i data-lucide="book-open-text"></i>
      Ler o artigo completo na Wikipédia
      <i class="ext" data-lucide="external-link"></i>
    </a>
  </article>`;
}

function wireReadmore(scope) {
  const rm = scope.querySelector('[data-readmore]');
  if (!rm) return;
  const btn = rm.querySelector('.readmore__toggle');
  btn.addEventListener('click', () => {
    const open = !rm.classList.contains('is-open');
    rm.classList.remove('rm-settled');
    rm.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    clearTimeout(rm._t);
    // Failsafe: lock the panel fully open even if the transition timeline
    // is frozen (timer fires off the event loop, independent of rAF).
    if (open) rm._t = setTimeout(() => rm.classList.add('rm-settled'), 380);
  });
}

/* ============================================================
   HISTORICO
   ============================================================ */
function initHistorico() {
  const host = document.querySelector('[data-hist]');
  renderFavoritesSection();
  render();

  function render() {
    const list = getHistory();
    const clearBtn = document.querySelector('[data-clear-all]');
    if (!list.length) {
      if (clearBtn) clearBtn.hidden = true;
      host.innerHTML = `
        <div class="empty reveal">
          <i data-lucide="telescope"></i>
          <p>Nenhuma busca ainda. Comece a explorar o MedBase.</p>
        </div>`;
      refreshIcons();
      return;
    }
    if (clearBtn) clearBtn.hidden = false;
    host.innerHTML = list.map((it, i) => `
      <a class="hist-item reveal" data-d="${Math.min(i+1,5)}" href="${PAGE_FOR_TYPE[it.type](it.q)}">
        <span class="hist-item__icon"><i data-lucide="${TYPE_ICON[it.type]}"></i></span>
        <span class="hist-item__body">
          <span class="hist-item__q">${it.title}</span>
          <span class="hist-item__time">${timeAgo(it.ts)} · busca por “${it.q}”</span>
        </span>
        ${badgeFor(it.type)}
        <span class="hist-item__go"><i data-lucide="arrow-right"></i></span>
      </a>`).join('');
    refreshIcons();
  }

  document.querySelector('[data-clear-all]')?.addEventListener('click', () => {
    clearHistory();
    render();
  });
}

function renderFavoritesSection() {
  const host = document.querySelector('[data-fav-list]');
  if (!host) return;
  const list = getFavorites();
  if (!list.length) {
    host.innerHTML = `<p class="fav-empty">Nenhum favorito ainda. Toque na estrela em um resultado para salvá-lo aqui.</p>`;
    return;
  }
  host.innerHTML = `<div class="chips">${list.map(it => `<a class="chip chip--fav" href="${PAGE_FOR_TYPE[it.type](it.q)}">
    <i data-lucide="star"></i>${it.title}</a>`).join('')}</div>`;
  refreshIcons();
}

/* ============================================================
   404
   ============================================================ */
function init404() {
  const term = qs('q');
  const host = document.querySelector('[data-404-term]');
  if (host && term) {
    host.textContent = `Não encontramos resultados para “${term}”.`;
  }
}

/* ============================================================
   BOOT
   ============================================================ */
(function boot() {
  // Entrance animations: opt in only when the animation timeline is live
  // (2-frame rAF probe), and ALWAYS guarantee visibility via a timer-based
  // failsafe that fires independently of rAF / the animation timeline.
  const root = document.documentElement;
  requestAnimationFrame((t1) => requestAnimationFrame((t2) => {
    if (t2 - t1 > 0) root.classList.add('reveal-on');
  }));
  setTimeout(() => root.classList.add('reveal-done'), 1000);

  seedHistoryOnce();
  const page = document.body.dataset.page;
  const navConfig = {
    home:      { active: 'home', navSearch: false },
    result:    { active: 'home', navSearch: true },
    disease:   { active: 'home', navSearch: true },
    history:   { active: 'home', navSearch: true },
    historico: { active: 'historico', navSearch: true },
    notfound:  { active: '', navSearch: true }
  };
  mountChrome(navConfig[page] || {});
  wireSlashShortcut();

  switch (page) {
    case 'home': initHome(); break;
    case 'result': initResult(); break;
    case 'disease': initArticle('disease'); break;
    case 'history': initArticle('history'); break;
    case 'historico': initHistorico(); break;
    case 'notfound': init404(); break;
  }
})();
