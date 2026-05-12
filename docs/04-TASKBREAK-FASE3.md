# TASKBREAK — MedBase Fase 3

**Data:** 2026-05-08
**Total de tarefas:** 13

---

## Dependências

```
T-01 → T-02 → T-03 (base visual)
T-04 → T-05 (tradução)
T-01 + T-04 → T-06 → T-07 → T-08 → T-09 (páginas atualizadas)
T-10 (histórico)
T-11 (404 + favicon)
T-09 + T-10 + T-11 → T-12 (deploy)
T-12 → T-13 (README)
```

---

## Tarefas

### 🎨 Base visual

- [ ] **T-01** — Criar `frontend/js/config.js` e integrar Lucide Icons em todos os HTMLs
  - O que fazer: criar CONFIG com API_URL e tema padrão; adicionar script Lucide em todos os HTML; substituir emojis por `<i data-lucide="..."></i>`; chamar `lucide.createIcons()` em cada página
  - Critério: abrir qualquer página e ver ícones Lucide no lugar dos emojis

- [ ] **T-02** — Implementar modo claro/escuro
  - O que fazer: adicionar variáveis `[data-theme="light"]` no `main.css`; criar toggle no header (ícone sol/lua); salvar preferência em localStorage; carregar tema salvo via config.js
  - Critério: clicar no toggle troca o tema; recarregar mantém o tema escolhido

- [ ] **T-03** — Adicionar skeleton loading
  - O que fazer: criar classes `.skeleton` e `.shimmer` no `componentes.css`; substituir o spinner nas páginas de resultado por skeleton que imita o layout
  - Critério: ao buscar, aparecem blocos animados no lugar do spinner simples

---

### 🌐 Tradução

- [ ] **T-04** — Criar serviço de tradução (`backend/services/traducao.py`)
  - O que fazer: função `traduzir(texto)` que chama MyMemory API; cache em memória; fallback retorna texto original se API falhar
  - Critério: testar no terminal com frase em inglês → retorna português

- [ ] **T-05** — Integrar tradução nas rotas
  - Arquivos: `routers/doenca.py`, `routers/historia.py`, `routers/medicamento.py`
  - O que fazer: adicionar campo `resumo_pt` (ou `indicacoes_pt`) com texto traduzido; manter campo original em inglês também
  - Critério: `GET /api/doenca/diabetes` retorna `resumo_pt` em português

---

### 📄 Páginas atualizadas

- [ ] **T-06** — Atualizar `index.html`
  - O que fazer: Lucide Icons, toggle de tema no header, link para historico.html, favicon

- [ ] **T-07** — Atualizar `resultado.html` e `resultado.js`
  - O que fazer: Lucide Icons, skeleton loading, mostrar texto em PT quando disponível

- [ ] **T-08** — Atualizar `doenca.html` e `historia.html`
  - O que fazer: Lucide Icons, skeleton loading, exibir `resumo_pt` em vez de `resumo`

- [ ] **T-09** — Atualizar `api.js` e `busca.js`
  - O que fazer: usar `CONFIG.API_URL` em vez de string hardcoded; carregar tema do localStorage no início

---

### 📄 Páginas novas

- [ ] **T-10** — Criar `historico.html` e `historico.js`
  - O que fazer: lista paginada das pesquisas recentes; clicar repete a busca; botão limpar histórico
  - Critério: página carrega e mostra histórico corretamente

- [ ] **T-11** — Criar `404.html` e `favicon.svg`
  - O que fazer: página 404 com visual do MedBase e botão voltar; favicon SVG com cruz médica minimalista
  - Critério: favicon aparece na aba do browser; navegar para URL inválida mostra o 404

---

### 🚀 Deploy

- [ ] **T-12** — Configurar variáveis de ambiente e fazer deploy
  - Backend: criar `.env`, instalar `python-dotenv`, atualizar CORS; subir no Render
  - Frontend: atualizar `CONFIG.API_URL` com URL do Render; subir no GitHub Pages
  - Critério: site acessível por URL pública funcionando

- [ ] **T-13** — Escrever README.md
  - O que fazer: descrição, screenshots, stack, APIs, como rodar localmente, como fazer deploy
  - Critério: README renderiza bem no GitHub com imagens e formatação

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
