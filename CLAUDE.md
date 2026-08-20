# CLAUDE.md — MedBase

> **LEIA PRIMEIRO:** [`AGENTS.md`](./AGENTS.md) — documento principal. Este arquivo é o complemento específico para o Claude.

## Comportamento obrigatório

- **PT-BR** em tudo.
- **Explique cada ação** depois de executar.
- **Termine TODA resposta com tabela resumo** (O que / Status).
- **NUNCA encerre sem resumo.**
- **NUNCA fabrique dados** — espelhar das APIs públicas (Wikipedia, PubChem, OpenFDA).
- **Seja direto, sem bajulação.**
- **Pergunte antes de alterar algo relevante.**

## Contexto do projeto

Enciclopédia médica interativa (portfólio fullstack). FastAPI + SQLite + HTML/CSS/JS puro.
Deploy: Render (backend) + GitHub Pages (frontend). Workflow documentado em `docs/`.

## Comandos

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Documentação

- `AGENTS.md` — documento principal (obrigatório)
- `docs/` — workflow completo (RESEARCH → PRD → TECHSPEC → TASKBREAK)
- `docs/LOG-BUGS.md` — bugs conhecidos