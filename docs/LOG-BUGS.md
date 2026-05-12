# LOG DE BUGS — MedBase

**Projeto:** MedBase — Enciclopédia Médica
**Período:** Fase 1 e Fase 2

---

## BUG-01 — PubChem retornando None para fórmulas complexas

**Fase:** 1 — T-02
**Sintoma:** `buscar_por_formula("C6H12O6")` retornava `None`
**Causa:** A PubChem não responde imediatamente para fórmulas com muitos compostos correspondentes. Ela retorna `{"Waiting": {"ListKey": "xyz"}}` esperando que o código busque o resultado depois (polling). O código original não tratava esse caso.
**Como foi encontrado:** Teste direto no terminal retornou `None` sem mensagem de erro.
**Solução:** Detectar a chave `"Waiting"` na resposta e implementar polling — o código fica perguntando a cada 2 segundos até o resultado ficar pronto, com limite de 5 tentativas.
**Arquivo:** `backend/services/pubchem.py`

---

## BUG-02 — Teste do banco chamado antes de criar a tabela

**Fase:** 2 — T-01/T-03
**Sintoma:** `sqlite3.OperationalError: no such table: historico`
**Causa:** O comando de teste passado chamou `salvar_historico()` diretamente sem antes chamar `inicializar_banco()`, que é quem cria a tabela.
**Como foi encontrado:** Erro explícito no terminal com nome da tabela que não existia.
**Solução:** Erro de instrução — o comando correto chama `inicializar_banco()` antes de qualquer operação no banco. No servidor FastAPI isso acontece automaticamente via `lifespan`.
**Arquivo:** `backend/database/database.py`

---

## BUG-03 — Wikipedia REST API retornando 403

**Fase:** 2 — T-04
**Sintoma:** `buscar_artigo("diabetes")` retornava `None`
**Causa (hipótese inicial):** User-Agent genérico do HTTPX (`python-httpx/0.xx`) sendo bloqueado pela Wikipedia.
**Causa real:** A Wikipedia REST API v1 (`/api/rest_v1/`) bloqueia qualquer acesso programático da faixa de IP, independente do User-Agent. O erro `30224bb` na resposta indica bloqueio por política de robôs.
**Como foi encontrado:** Adicionando prints para ver o status code — retornou `403` com mensagem "Please respect our robot policy".
**Tentativas:**
1. Trocar User-Agent para simular navegador → ainda 403
2. Trocar para MediaWiki Action API (`/w/api.php`) com User-Agent descritivo → ainda 403
3. Usar biblioteca `wikipedia-api` → ✅ funcionou
**Solução:** Substituir httpx pela biblioteca `wikipedia-api` que gerencia autenticação e headers internamente do jeito que a Wikimedia aceita. Para imagens, ainda usamos a MediaWiki API mas com a biblioteca como intermediária.
**Arquivo:** `backend/services/wikipedia.py`

---

## BUG-04 — Dupla chamada à API no busca.js

**Fase:** 1 — T-09
**Sintoma:** Busca demorava o dobro do tempo e às vezes falhava na segunda chamada
**Causa:** O código chamava a API duas vezes — uma para "validar" e outra para salvar no sessionStorage.
**Como foi encontrado:** Revisão do código antes de subir a Fase 2.
**Solução:** Unificar em uma única chamada — o resultado já serve tanto para validar quanto para salvar.
**Arquivo:** `frontend/js/busca.js`

---

## BUG-05 — Layout quebrando em mobile

**Fase:** 1 — T-12
**Sintoma:** Ao redimensionar para mobile no DevTools, o layout desaparecia ao recarregar
**Causa:** Elementos como o campo de busca e o botão tinham largura fixa que não colapsava em telas pequenas.
**Como foi encontrado:** Teste manual no DevTools (F12 → ícone de celular).
**Solução:** Adicionar media query `@media (max-width: 600px)` com regras específicas: seletor de tipo ocupa largura total, input e botão empilham verticalmente, cards em grade 2x2.
**Arquivo:** `frontend/css/main.css`

---

## BUG-06 — Texto dos botões invisível na calculadora (projeto anterior)

**Fase:** N/A — projeto calculadora
**Sintoma:** Botões apareciam mas sem texto visível (só o "0" aparecia)
**Causa:** `ctk.set_default_color_theme("dark-blue")` sobrescrevia a cor do texto definida manualmente nos botões.
**Como foi encontrado:** Print da tela enviado pelo usuário mostrando botões sem texto.
**Solução:** Remover o `set_default_color_theme` e passar `text_color` como tupla `(cor, cor)` para garantir que seja respeitado nos dois modos (claro e escuro).
**Arquivo:** `calculadora_bonita.py`
