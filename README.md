# MedBase — Enciclopédia Médica Interativa

> Pesquise fórmulas químicas, medicamentos, doenças e história da medicina em uma única plataforma.

🔗 **[Acessar o site](https://Adrian9742.github.io/medbase)** | 🔗 **[API](https://medbase-bbct.onrender.com)**

---

## Sobre o projeto

O MedBase é uma enciclopédia médica web construída como projeto de portfólio fullstack. Integra quatro APIs científicas públicas para entregar informações sobre compostos químicos, medicamentos, doenças e história da medicina — tudo em uma interface moderna e responsiva.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3 + FastAPI + Uvicorn |
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Banco de dados | SQLite (via aiosqlite) |
| Deploy Backend | Render (free tier) |
| Deploy Frontend | GitHub Pages |

---

## APIs integradas

| API | O que fornece | Autenticação |
|---|---|---|
| **PubChem (NIH)** | Fórmulas químicas, estrutura molecular, peso | Sem chave |
| **OpenFDA** | Bulas, indicações, efeitos adversos, dosagem | Sem chave |
| **Wikipedia PT-BR** | Artigos sobre doenças e história da medicina | Sem chave |
| **MyMemory** | Tradução EN→PT de campos curtos | Sem chave |

---

## Funcionalidades

- 🔬 **Fórmulas Químicas** — busca por fórmula molecular (ex: `C6H12O6`) com estrutura 2D, peso molecular e sinônimos
- 💊 **Medicamentos** — bula completa com indicações, dosagem, avisos e efeitos adversos via FDA
- 🦠 **Doenças** — artigos em PT-BR com fallback para inglês quando necessário
- 📜 **História da Medicina** — personagens e eventos históricos com filtro anti-conteúdo não médico
- 🕐 **Histórico** — últimas 10 pesquisas salvas localmente com data/hora
- 🌙 **Modo escuro/claro** — toggle com persistência entre sessões

---

## Arquitetura

```
[Usuário]
    ↓
[GitHub Pages — frontend/]
    ↓ fetch via api.js
[Render — FastAPI backend]
    ├── /api/formula/{formula}    → PubChem API
    ├── /api/medicamento/{nome}   → OpenFDA API + MyMemory
    ├── /api/doenca/{nome}        → Wikipedia PT-BR (wikipedia-api)
    ├── /api/historia/{termo}     → Wikipedia EN (wikipedia-api)
    └── /api/historico            → SQLite local
```

**Decisão de arquitetura:** o frontend nunca chama APIs externas diretamente. Tudo passa pelo backend, o que centraliza tratamento de erros, cache e tradução.

---

## Como rodar localmente

### Pré-requisitos
- Python 3.10+
- Git

### Backend
```bash
git clone https://github.com/Adrian9742/medbase.git
cd medbase/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend disponível em `http://localhost:8000`
Documentação automática em `http://localhost:8000/docs`

### Frontend
Abra `frontend/index.html` no navegador — não precisa de servidor.

---

## Deploy

| Serviço | URL |
|---|---|
| Frontend | https://Adrian9742.github.io/medbase |
| Backend | https://medbase-bbct.onrender.com |

> ⚠️ O backend usa o plano gratuito do Render. A primeira requisição após 15 minutos de inatividade pode demorar até 60 segundos (cold start). Requisições seguintes são normais.

---

## Processo de desenvolvimento

O projeto foi desenvolvido em 3 fases com documentação completa:

- **Fase 1** — Backend (PubChem + OpenFDA) + Frontend base
- **Fase 2** — Wikipedia + SQLite + 4 módulos de busca
- **Fase 3** — Lucide Icons + modo claro/escuro + tradução + deploy

Cada fase seguiu um pipeline estruturado: `RESEARCH → PRD → TECHSPEC → TASKBREAK → EXEC → QUALITY GATE → REVIEW`.

---

## Principais desafios e aprendizados

**Wikipedia bloqueando httpx (403):** A REST API da Wikipedia bloqueia chamadas diretas. Solução: usar a biblioteca `wikipedia-api` que gerencia autenticação internamente.

**Resultados irrelevantes (filmes, constelações):** "Black Death" retornava filme, "Cancer" retornava constelação. Solução: filtrar pela primeira frase do resumo + buscar em inglês primeiro para história.

**wikipedia-api bloqueando o event loop:** Biblioteca síncrona rodando em servidor async FastAPI travava múltiplas requisições simultâneas. Solução: `asyncio.to_thread()`.

**Deploy com dependências faltando:** `requirements.txt` não estava atualizado. Solução: atualizar a cada nova biblioteca instalada.

**Cold start do Render:** Plano gratuito dorme após inatividade. Documentado e tratado com mensagem amigável.

---

## Estrutura do projeto

```
medbase/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/          # formula, medicamento, doenca, historia, historico
│   ├── services/         # pubchem, openfda, wikipedia, traducao
│   └── database/         # SQLite models
├── frontend/
│   ├── index.html
│   ├── resultado.html
│   ├── doenca.html
│   ├── historia.html
│   ├── historico.html
│   ├── 404.html
│   ├── css/              # main.css, componentes.css
│   └── js/               # config.js, api.js, busca.js, resultado.js...
└── docs/                 # PRD, TECHSPEC, TASKBREAK, LOG-BUGS, CONTEXTO
```

---

## Documentação técnica

A pasta `docs/` contém toda a documentação de planejamento:
- Pesquisa inicial e decisões de produto (PRD)
- Especificações técnicas (TECHSPEC)
- Breakdown de tarefas (TASKBREAK)
- Log completo de bugs e resoluções

---

*Projeto desenvolvido como portfólio fullstack — Python + FastAPI + JavaScript + APIs públicas + Deploy.*
