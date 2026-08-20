# AGENTS.md — MedBase

> **Documento principal do repositório.** Qualquer agente de IA DEVE ler este arquivo antes de tocar em qualquer coisa.

## 1. O que é este projeto

**MedBase — Enciclopédia Médica Interativa.** Pesquise fórmulas químicas, medicamentos, doenças e história da medicina em uma única plataforma. Projeto de portfólio fullstack que integra quatro APIs científicas públicas.

- **Site:** https://Adrian9742.github.io/medbase
- **API:** https://medbase-bbct.onrender.com

## 2. Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3 + FastAPI + Uvicorn |
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Banco | SQLite (via aiosqlite) |
| Deploy Backend | Render (free tier) |
| Deploy Frontend | GitHub Pages |

## 3. APIs integradas

| API | O que fornece | Autenticação |
|---|---|---|
| Wikipedia | História da medicina, doenças | — |
| PubChem | Fórmulas químicas | — |
| OpenFDA | Medicamentos | — |
| (outras) | — | — |

## 4. Estrutura de pastas

```
medbase/
├── backend/
│   ├── main.py               # FastAPI app
│   ├── limiter.py            # Rate limiting
│   ├── routers/              # Rotas da API
│   ├── services/             # Integrações com APIs externas
│   ├── database/             # SQLite + aiosqlite
│   └── requirements.txt
├── frontend/                 # HTML/CSS/JS puro (GitHub Pages)
│   ├── index.html, doenca.html, historia.html, historico.html
│   ├── css/
│   └── 404.html
└── docs/                     # Workflow completo (RESEARCH → PRD → TECHSPEC → TASKBREAK)
```

## 5. Como rodar

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend: abrir os HTMLs diretamente ou servir com qualquer static server
```

## 6. Regras de ouro

- **PT-BR** em tudo.
- **NUNCA fabricar dados** — output literal de comandos.
- **NUNCA encerrar sem resumo** — explicar o que foi feito + tabela resumo.
- **Workflow documentado** — seguir `docs/` (RESEARCH → PRD → TECHSPEC → TASKBREAK) para features novas.
- **Prova antes de correção** — bug só é bug com comando real reproduzindo.
- **Workflow PR** — branch separada, PR para revisão, nunca push na main.
- **Free tier** — lembrar que Render/GitHub Pages são gratuitos (não confundir recomendar com pagar).

## 7. O que NÃO fazer

- ❌ Fabricar dados médicos/farmacológicos — espelhar das APIs públicas
- ❌ Push direto na main
- ❌ Ignorar o workflow documentado em `docs/`

## 8. Documentação relacionada

- `docs/01-RESEARCH.md` … `docs/04-TASKBREAK-*.md` — workflow completo por fase
- `docs/CONTEXTO.md` — contexto do projeto
- `docs/LOG-BUGS.md` — bugs conhecidos
- `docs/IDEIA FUTURA.md` — ideias futuras
- `README.md` — visão geral