# CONTEXTO — MedBase (Save Point — Fase 3 em andamento)

**Data:** 2026-05-09
**Status:** Fase 3 🔄 em andamento
**Próximas tarefas:** T-10 (historico.html) → T-11 (favicon + 404) → T-12 (deploy) → T-13 (README)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python + FastAPI + httpx + wikipedia-api |
| Frontend | HTML + CSS + JS puro + Lucide Icons |
| Banco | SQLite via aiosqlite |
| APIs externas | PubChem, OpenFDA, Wikipedia PT-BR (wikipedia-api), MyMemory (tradução nomes) |

---

## Estrutura completa atual

```
medbase/
├── docs/
│   ├── 01-RESEARCH.md
│   ├── 02-PRD-FASE1.md  02-PRD-FASE2.md  02-PRD-FASE3.md
│   ├── 03-TECHSPEC-FASE1.md  03-TECHSPEC-FASE2.md  03-TECHSPEC-FASE3.md
│   ├── 04-TASKBREAK-FASE1.md  04-TASKBREAK-FASE2.md  04-TASKBREAK-FASE3.md
│   ├── LOG-BUGS.md
│   └── CONTEXTO.md
├── backend/
│   ├── main.py               ← v2.0 com 5 routers + lifespan
│   ├── requirements.txt      ← fastapi, uvicorn, httpx, aiosqlite, wikipedia-api
│   ├── .env                  ← variáveis de ambiente (a criar)
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── formula.py
│   │   ├── medicamento.py    ← com tradução de nomes via MyMemory
│   │   ├── doenca.py         ← passa tipo="doenca" para wikipedia
│   │   ├── historia.py       ← passa tipo="historia" para wikipedia
│   │   └── historico.py
│   ├── services/
│   │   ├── pubchem.py
│   │   ├── openfda.py
│   │   ├── wikipedia.py      ← PT-BR + fallback EN + filtro médico por tipo
│   │   └── traducao.py       ← MyMemory com cache, só campos curtos
│   └── database/
│       ├── __init__.py
│       ├── database.py
│       ├── models.py
│       └── medbase.db
└── frontend/
    ├── index.html            ← v3.0 Lucide Icons + toggle tema
    ├── resultado.html        ← skeleton loading + nomes traduzidos
    ├── doenca.html           ← skeleton + aviso idioma EN
    ├── historia.html         ← skeleton + aviso idioma EN
    ├── historico.html        ← A CRIAR (T-10)
    ├── 404.html              ← A CRIAR (T-11)
    ├── favicon.svg           ← A CRIAR (T-11)
    ├── css/
    │   ├── main.css          ← tema claro branco/verde padrão + dark toggle
    │   └── componentes.css   ← skeleton loading + aviso idioma
    └── js/
        ├── config.js         ← CONFIG.API_URL + tema padrão light
        ├── api.js            ← usa CONFIG.API_URL
        ├── busca.js
        ├── resultado.js      ← Promise.all skeleton fix
        ├── doenca.js         ← Promise.all skeleton fix
        ├── historia.js       ← Promise.all skeleton fix
        └── historico.js      ← A CRIAR (T-10)
```

---

## Tarefas Fase 3

- [x] T-01 — config.js + Lucide Icons
- [x] T-02 — modo claro/escuro com toggle
- [x] T-03 — skeleton loading
- [x] T-04 — serviço de tradução (MyMemory + cache)
- [x] T-05 — tradução integrada no router medicamento
- [x] T-06 — index.html atualizado
- [x] T-07 — resultado.html + resultado.js atualizados
- [x] T-08 — doenca.html + historia.html + JS atualizados
- [x] T-09 — api.js usa CONFIG + busca.js atualizado
- [ ] T-10 — historico.html + historico.js
- [ ] T-11 — favicon.svg + 404.html
- [ ] T-12 — deploy (Render + GitHub Pages)
- [ ] T-13 — README.md

---

## Decisões fixas

- Tema padrão: **claro** (branco + verde #059669)
- Dark mode: verde #10B981 em fundo #0A0F0A
- Wikipedia: PT-BR primeiro, EN como fallback silencioso
- Tradução: só campos curtos (nomes) — textos longos ficam em inglês
- Filtro médico: busca Wikipedia com contexto "doença/disease" ou "medicina/medicine"
- Skeleton: mínimo 700ms via Promise.all
- Frontend nunca chama APIs externas diretamente

---

## Como retomar

1. `cd medbase/backend && uvicorn main:app --reload`
2. Abrir `frontend/index.html` no navegador
3. Continuar na T-10 — criar `historico.html`
