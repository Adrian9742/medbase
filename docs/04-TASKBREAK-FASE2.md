# TASKBREAK — MedBase Fase 2

**Data:** 2026-05-07
**Total de tarefas:** 14

---

## Dependências

```
T-01 → T-02 → T-03 (banco completo)
T-04 → T-05 → T-06 → T-07 (backend completo)
T-08 → T-09 → T-10 (frontend doenças)
T-11 → T-12 (frontend história)
T-03 + T-07 → T-13 (frontend histórico)
T-10 + T-12 + T-13 → T-14 (testes)
```

---

## Tarefas

### 🗄️ Banco de dados

- [ ] **T-01** — Instalar aiosqlite e criar pasta database
  - O que fazer: adicionar `aiosqlite` ao requirements.txt, rodar `pip install aiosqlite`, criar pasta `backend/database/` com `__init__.py` vazio
  - Critério: `import aiosqlite` no terminal sem erro

- [ ] **T-02** — Criar conexão e tabela (`backend/database/database.py`)
  - O que fazer: função `inicializar_banco()` que cria o arquivo `medbase.db` e a tabela `historico` se não existir
  - Critério: rodar o arquivo direto (`python database.py`) e ver `medbase.db` criado na pasta

- [ ] **T-03** — Criar funções do banco (`backend/database/models.py`)
  - O que fazer: `salvar_historico(termo, tipo)` e `buscar_historico()` com limite de 10
  - Critério: testar no terminal — salvar 3 itens e buscar retorna os 3 em ordem

---

### ⚙️ Backend — novos serviços e rotas

- [ ] **T-04** — Criar serviço Wikipedia (`backend/services/wikipedia.py`)
  - O que fazer: função `buscar_artigo(termo)` que chama a Wikipedia REST API e retorna título, resumo, imagem e link. Tratar desambiguação com busca de fallback.
  - Critério: testar com "diabetes" e "Hippocrates" no terminal

- [ ] **T-05** — Criar rotas doença e história
  - Arquivos: `backend/routers/doenca.py` e `backend/routers/historia.py`
  - O que fazer: GET /api/doenca/{nome} e GET /api/historia/{termo} chamando wikipedia.py
  - Critério: testar no browser `http://localhost:8000/api/doenca/diabetes`

- [ ] **T-06** — Criar rota de histórico (`backend/routers/historico.py`)
  - O que fazer: GET /api/historico (lista) e POST /api/historico (salva)
  - Critério: POST um item e GET retorna ele

- [ ] **T-07** — Atualizar main.py
  - O que fazer: registrar 3 novos routers, chamar `inicializar_banco()` no startup
  - Critério: `/docs` mostra as 5 rotas (formula, medicamento, doenca, historia, historico)

---

### 🎨 Frontend — novas páginas

- [ ] **T-08** — Criar `frontend/doenca.html`
  - Estrutura: header, imagem de capa, resumo, seções (causas, sintomas, tratamento), link Wikipedia
  - Critério: página abre sem erros

- [ ] **T-09** — Criar `frontend/js/doenca.js`
  - O que fazer: buscar dados via api.js, preencher a página, accordion nas seções
  - Critério: pesquisar "diabetes" e ver resultado completo

- [ ] **T-10** — Criar `frontend/historia.html` e `frontend/js/historia.js`
  - Estrutura: mais simples — título grande, imagem, texto corrido, link Wikipedia
  - Critério: pesquisar "Hippocrates" e ver resultado

- [ ] **T-11** — Criar `frontend/historico.html` e `frontend/js/historico.js`
  - O que fazer: lista das últimas pesquisas com tipo, termo e data. Clicar repete a busca.
  - Critério: após 3 buscas, histórico mostra as 3

---

### 🔗 Atualizar páginas existentes

- [ ] **T-12** — Atualizar `frontend/index.html`
  - O que fazer: adicionar tipos "Doença" e "História" no seletor, ativar cards, adicionar seção de pesquisas recentes
  - Critério: seletor mostra 4 opções, cards clicáveis

- [ ] **T-13** — Atualizar `frontend/js/api.js` e `frontend/js/busca.js`
  - O que fazer: adicionar métodos buscarDoenca, buscarHistoria, buscarHistorico. Atualizar busca.js para suportar 4 tipos e salvar histórico após cada busca.
  - Critério: busca de doença redireciona para doenca.html corretamente

---

### 🔗 Testes

- [ ] **T-14** — Teste end-to-end de todos os CAs da Fase 2
  - [ ] CA-01: "diabetes" → descrição e causas
  - [ ] CA-02: "malaria" → sintomas e tratamentos
  - [ ] CA-03: "Hippocrates" → resumo histórico
  - [ ] CA-04: "Black Death" → artigo histórico
  - [ ] CA-05: busca salva no histórico
  - [ ] CA-06: histórico máximo 10 itens
  - [ ] CA-07: doença inválida → erro amigável
  - [ ] CA-08: cards doenças e história clicáveis na index

---

## Log de execução

| Tarefa | Iniciada | Concluída | Observações |
|---|---|---|---|
| T-01 | | | |
| T-02 | | | |
| T-03 | | | |
| T-04 | | | |
| T-05 | | | |
| T-06 | | | |
| T-07 | | | |
| T-08 | | | |
| T-09 | | | |
| T-10 | | | |
| T-11 | | | |
| T-12 | | | |
| T-13 | | | |
| T-14 | | | |
