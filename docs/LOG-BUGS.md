# LOG DE BUGS — MedBase
# Registro completo de problemas encontrados e resoluções

---

## BUG-01 — PubChem retornando None para fórmulas complexas
**Fase:** 1 — Serviço PubChem
**Sintoma:** `buscar_por_formula("C6H12O6")` retornava `None`
**Causa:** PubChem não responde imediatamente para fórmulas com muitos compostos. Retorna `{"Waiting": {"ListKey": "..."}}` exigindo polling.
**Como foi encontrado:** Teste direto no terminal retornou `None` sem mensagem de erro.
**Solução:** Implementar polling — detectar `"Waiting"` e reperguntar a cada 2s, máximo 5 tentativas.
**Lição:** APIs externas podem ter respostas assíncronas. Sempre verificar a documentação de polling antes de assumir que `None` = não encontrado.
**Arquivo:** `backend/services/pubchem.py`

---

## BUG-02 — Banco chamado antes de ser criado
**Fase:** 2 — SQLite
**Sintoma:** `sqlite3.OperationalError: no such table: historico`
**Causa:** Comando de teste chamou `salvar_historico()` sem antes chamar `inicializar_banco()`.
**Como foi encontrado:** Erro explícito no terminal.
**Solução:** Comando de teste corrigido para chamar `inicializar_banco()` primeiro. No servidor isso é automático via `lifespan`.
**Lição:** Em testes manuais, sempre replicar a ordem de inicialização do servidor.
**Arquivo:** `backend/database/database.py`

---

## BUG-03 — Wikipedia REST API retornando 403
**Fase:** 2 — Serviço Wikipedia
**Sintoma:** `buscar_artigo("diabetes")` retornava `None`
**Causa:** A Wikipedia REST API v1 bloqueia acesso programático via httpx independente do User-Agent. Código de erro `30224bb` indica bloqueio por política anti-bot.
**Como foi encontrado:** Print do `status_code` revelou 403 com mensagem "Please respect our robot policy".
**Tentativas fracassadas:**
  1. Trocar User-Agent para simular navegador → ainda 403
  2. Usar MediaWiki Action API com httpx → ainda 403
**Solução:** Usar biblioteca `wikipedia-api` que gerencia autenticação internamente do jeito que a Wikimedia aceita.
**Lição:** Nunca usar httpx diretamente para a Wikipedia. Sempre via `wikipedia-api`.
**Arquivo:** `backend/services/wikipedia.py`

---

## BUG-04 — Dupla chamada à API no busca.js
**Fase:** 1 — Frontend
**Sintoma:** Busca demorava o dobro do tempo.
**Causa:** Código chamava a API duas vezes — uma para "validar" e outra para salvar no sessionStorage.
**Como foi encontrado:** Revisão de código.
**Solução:** Unificar em uma única chamada.
**Lição:** Evitar chamadas redundantes. Uma chamada serve tanto para validar quanto para cachear.
**Arquivo:** `frontend/js/busca.js`

---

## BUG-05 — Layout quebrando em mobile
**Fase:** 1 — CSS
**Sintoma:** Layout desaparecia ao recarregar em DevTools mobile.
**Causa:** Elementos com largura fixa não colapsavam em telas pequenas.
**Como foi encontrado:** Teste manual no DevTools (F12 → ícone de celular).
**Solução:** Media query `@media (max-width: 600px)` com regras específicas.
**Arquivo:** `frontend/css/main.css`


---

## BUG-06 — Skeleton não aparecia
**Fase:** 3 — Frontend
**Sintoma:** Skeleton existia no HTML mas não era visível ao usuário.
**Causa:** Dado vindo do sessionStorage era síncrono — o skeleton era ocultado em 0ms antes do browser renderizar.
**Como foi encontrado:** Inspeção do código — fluxo com cache não tinha nenhum `await`.
**Solução:** `Promise.all([buscarDados(), new Promise(resolve => setTimeout(resolve, 400))])` garante mínimo de 400ms de exibição.
**Lição:** Cache síncrono elimina estados visuais de loading. Sempre garantir tempo mínimo de exibição.
**Arquivo:** `frontend/js/doenca.js`, `historia.js`, `resultado.js`

---

## BUG-07 — `lucide is not defined` no resultado.html
**Fase:** 3 — Frontend
**Sintoma:** Erro no console, ícones não apareciam.
**Causa:** `resultado.html` foi criado antes da Fase 3 e nunca recebeu o import do Lucide.
**Como foi encontrado:** Print de tela do usuário mostrando erro no card de resultado.
**Solução:** Adicionar `<script src="https://unpkg.com/lucide@latest/...">` e `<script src="js/config.js">` no head.
**Lição:** Ao adicionar dependências globais, verificar TODOS os HTMLs existentes.
**Arquivo:** `frontend/resultado.html`

---

## BUG-08 — Wikipedia retornando filme em vez de doença/história
**Fase:** 3 — Serviço Wikipedia
**Sintoma:** "Black Death" retornava filme de 2010, "Cancer" retornava constelação.
**Causa:** Wikipedia PT tem artigos de mesmo nome para tópicos diferentes. Busca sem contexto pega o mais popular.
**Como foi encontrado:** Teste manual no site — resultado claramente errado.
**Tentativas:**
  1. Filtro com palavras soltas → falsos positivos ("released" em artigos médicos)
  2. Usar categorias da Wikipedia → extra request por página, dobra latência
**Solução final:** Filtrar apenas a PRIMEIRA FRASE do resumo com padrões específicos (`"is a 2010 film"`, `"é uma constelação"`) + EN primeiro para história.
**Lição:** Checar só a primeira frase é mais preciso E mais rápido que checar o texto completo.
**Arquivo:** `backend/services/wikipedia.py`

---

## BUG-09 — wikipedia-api bloqueando o event loop
**Fase:** 3 — Performance
**Sintoma:** Com múltiplos usuários simultâneos, buscas se travavam mutuamente.
**Causa:** `wikipedia-api` é 100% síncrona — bloqueia o event loop do FastAPI.
**Como foi encontrado:** Análise de código + revisão técnica preventiva.
**Solução:** `asyncio.to_thread()` — roda chamadas síncronas em thread separada sem bloquear.
**Lição:** Toda biblioteca síncrona usada em contexto async precisa de `to_thread()`.
**Arquivo:** `backend/services/wikipedia.py`

---

## BUG-10 — CORS bloqueando frontend em produção
**Fase:** 3 — Deploy
**Sintoma:** Frontend no GitHub Pages não conseguia chamar backend no Render.
**Causa:** `allow_origins=["*"]` funcionava localmente mas em produção o Render precisava da origem explícita.
**Como foi encontrado:** Erro de CORS no console do navegador após deploy.
**Solução:** Ler `CORS_ORIGEM` de variável de ambiente no Render + adicionar origens explícitas no `main.py`.
**Lição:** CORS `"*"` é suficiente para desenvolvimento. Em produção, sempre especificar origens.
**Arquivo:** `backend/main.py`

---

## BUG-11 — requirements.txt desatualizado no deploy
**Fase:** 3 — Deploy
**Sintoma:** Render falhava com `status 1` após build bem-sucedido.
**Causa:** `requirements.txt` só tinha `fastapi`, `uvicorn`, `httpx` da Fase 1. `wikipedia-api` e `aiosqlite` adicionados nas fases seguintes não foram incluídos.
**Como foi encontrado:** Log do Render mostrava pacotes instalados — `wikipedia-api` ausente na lista.
**Solução:** Atualizar `requirements.txt` com todas as dependências: `aiosqlite`, `wikipedia-api`, `python-dotenv`.
**Lição:** Toda vez que instalar uma nova biblioteca localmente (`pip install X`), imediatamente adicionar ao `requirements.txt`.
**Arquivo:** `backend/requirements.txt`

---

## BUG-12 — Cold start do Render causando timeout no frontend
**Fase:** 3 — Deploy
**Sintoma:** Primeira busca após inatividade retornava "Não foi possível conectar ao servidor".
**Causa:** Render plano gratuito "dorme" após 15min sem uso. Primeira requisição demora 30-60s para acordar — tempo suficiente para o frontend dar timeout.
**Como foi encontrado:** Teste em produção após período de inatividade.
**Solução parcial:** Mensagem de erro amigável já existente. Solução completa seria aumentar o timeout do frontend ou usar um serviço de "ping" para manter o servidor ativo.
**Status:** Comportamento esperado no plano gratuito. Documentado no README.
**Arquivo:** `frontend/js/busca.js`

---

## BUG-13 — URL do backend errada no config.js
**Fase:** 3 — Deploy
**Sintoma:** Frontend em produção não conectava ao backend.
**Causa:** `config.js` foi atualizado com `https://medbase-api.onrender.com` (URL genérica) em vez da URL real `https://medbase-bbct.onrender.com`.
**Como foi encontrado:** Erro "não foi possível conectar" no site em produção.
**Solução:** Corrigir para a URL real gerada pelo Render.
**Lição:** A URL do Render é gerada automaticamente com sufixo aleatório. Sempre copiar a URL exata do dashboard.
**Arquivo:** `frontend/js/config.js`
