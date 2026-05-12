# TASKBREAK — MedBase Fase 1

**Data:** 2026-05-06
**TECHSPEC:** `docs/03-TECHSPEC-FASE1.md`
**Total de tarefas:** 12

---

## Regras

- Execute **uma tarefa por vez**
- Só marque `[x]` quando 100% completa e testada
- Não adicione funcionalidades fora do escopo da tarefa
- Se travar em algo → registrar em Bloqueios antes de pedir ajuda

---

## Dependências

```
T-01 → T-02 → T-03 → T-04 (backend completo)
T-05 → T-06              (CSS completo)
T-07 → T-08 → T-09       (frontend index)
T-04 + T-06 → T-10 → T-11 (frontend resultado)
T-04 + T-11 → T-12        (teste end-to-end)
```

---

## Tarefas

---

### ⚙️ Fase A — Setup do projeto

- [ ] **T-01** — Criar estrutura de pastas e instalar dependências
  - O que fazer:
    1. Criar as pastas: `backend/routers/`, `backend/services/`, `frontend/css/`, `frontend/js/`
    2. Criar `backend/requirements.txt` com: `fastapi`, `uvicorn`, `httpx`
    3. Rodar `pip install -r requirements.txt`
    4. Criar `backend/main.py` com FastAPI básico (apenas "hello world")
    5. Testar: rodar `uvicorn main:app --reload` e abrir `http://localhost:8000`
  - Critério de conclusão: `http://localhost:8000` responde sem erro
  - Ref: TECHSPEC seção 3

---

### ⚙️ Fase B — Backend: serviços e rotas

- [ ] **T-02** — Criar serviço PubChem (`backend/services/pubchem.py`)
  - O que fazer:
    1. Função `buscar_por_formula(formula: str)` que chama a PubChem
    2. Converter fórmula para maiúsculas e remover espaços
    3. Extrair e retornar: cid, nome, formula, peso_molecular, sinonimos, descricao, imagem_url
    4. Tratar: fórmula não encontrada (retorna None), timeout (lança exceção)
  - Critério de conclusão: testar a função direto no terminal Python com "C6H12O6" e receber um dict com os campos
  - Depende de: T-01

- [ ] **T-03** — Criar serviço OpenFDA (`backend/services/openfda.py`)
  - O que fazer:
    1. Função `buscar_medicamento(nome: str)` que chama a OpenFDA
    2. Extrair e retornar: nome_generico, nome_marca, fabricante, indicacoes, contraindicacoes, efeitos_adversos, dosagem
    3. Tratar campos ausentes com "Informação não disponível"
    4. Tratar: não encontrado (retorna None), timeout (lança exceção)
  - Critério de conclusão: testar com "aspirin" no terminal Python e receber um dict com os campos
  - Depende de: T-01

- [ ] **T-04** — Criar routers FastAPI (`backend/routers/formula.py` e `backend/routers/medicamento.py`) e registrar no `main.py`
  - O que fazer:
    1. `formula.py`: rota `GET /api/formula/{formula}` — chama serviço, trata erros, retorna JSON
    2. `medicamento.py`: rota `GET /api/medicamento/{nome}` — chama serviço, trata erros, retorna JSON
    3. Registrar os dois routers no `main.py`
    4. Adicionar CORS no `main.py` para o frontend acessar
  - Critério de conclusão: `http://localhost:8000/api/formula/C6H12O6` retorna JSON correto no browser
  - Depende de: T-02, T-03

---

### 🎨 Fase C — Frontend: estilos

- [ ] **T-05** — Criar variáveis e estilos globais (`frontend/css/main.css`)
  - O que fazer:
    1. Definir variáveis CSS: cores, tipografia, espaçamentos
    2. Reset CSS básico
    3. Estilo do body, links, títulos
    4. Importar fonte Inter do Google Fonts
  - Critério de conclusão: abrir qualquer HTML que importe esse CSS e ver a fonte e cor de fundo corretas

- [ ] **T-06** — Criar componentes visuais (`frontend/css/componentes.css`)
  - O que fazer:
    1. Estilo do card de resultado
    2. Estilo do campo de busca e botão
    3. Badge de tipo (verde para fórmula, azul para medicamento)
    4. Spinner de loading
    5. Card de erro
    6. Seção colapsável (accordion)
    7. Tabela de propriedades
  - Critério de conclusão: criar um HTML de teste e ver todos os componentes renderizados corretamente
  - Depende de: T-05

---

### 🎨 Fase D — Frontend: página inicial

- [ ] **T-07** — Criar estrutura HTML da página inicial (`frontend/index.html`)
  - O que fazer:
    1. Header com logo e nome "MedBase"
    2. Seção hero com campo de busca, seletor de tipo e botão
    3. Linha de exemplos clicáveis
    4. Grid de cards das seções (Fórmulas, Medicamentos, Em breve...)
    5. Footer
  - Critério de conclusão: página abre no browser com layout visível (sem CSS final ainda)
  - Depende de: T-05, T-06

- [ ] **T-08** — Criar `frontend/js/api.js`
  - O que fazer:
    1. Objeto `Api` com dois métodos: `buscarFormula(formula)` e `buscarMedicamento(nome)`
    2. Cada método faz fetch para o backend e retorna o JSON
    3. Tratar erros de rede (API fora do ar)
  - Critério de conclusão: abrir o console do browser, chamar `Api.buscarFormula("C6H12O6")` e ver o resultado
  - Depende de: T-04

- [ ] **T-09** — Criar `frontend/js/busca.js`
  - O que fazer:
    1. Capturar o formulário de busca
    2. Validar: campo não pode estar vazio
    3. Ao submeter: desabilitar botão, mostrar loading
    4. Chamar `Api.buscarFormula` ou `Api.buscarMedicamento` dependendo do tipo selecionado
    5. Redirecionar para `resultado.html?tipo=X&q=Y` com o resultado em sessionStorage
  - Critério de conclusão: digitar "C6H12O6", clicar buscar e ser redirecionado para resultado.html
  - Depende de: T-07, T-08

---

### 🎨 Fase E — Frontend: página de resultado

- [ ] **T-10** — Criar estrutura HTML da página de resultado (`frontend/resultado.html`)
  - O que fazer:
    1. Header com logo e botão "Nova busca"
    2. Área de loading (spinner)
    3. Área de erro (oculta por padrão)
    4. Área de resultado fórmula (oculta por padrão): imagem, tabela, sinônimos, descrição, segurança
    5. Área de resultado medicamento (oculta por padrão): badges, seções colapsáveis
  - Critério de conclusão: página abre sem erros de console
  - Depende de: T-05, T-06

- [ ] **T-11** — Criar `frontend/js/resultado.js`
  - O que fazer:
    1. Ler tipo e termo da URL (`?tipo=formula&q=C6H12O6`)
    2. Mostrar spinner enquanto carrega
    3. Chamar a API correta via `api.js`
    4. Se sucesso: ocultar spinner, mostrar seção correta preenchida com os dados
    5. Se erro: ocultar spinner, mostrar card de erro com mensagem amigável
    6. Implementar accordion (seções colapsáveis) nas seções do medicamento
  - Critério de conclusão: pesquisar "C6H12O6" na index e ver resultado completo na resultado.html
  - Depende de: T-09, T-10

---

### 🔗 Fase F — Integração e testes

- [ ] **T-12** — Teste end-to-end de todos os critérios de aceite
  - O que fazer: testar manualmente cada CA do PRD
    - [ ] CA-01: C6H12O6 → Glucose com peso molecular
    - [ ] CA-02: C2H5OH → Ethanol com segurança
    - [ ] CA-03: aspirin → indicações e efeitos adversos
    - [ ] CA-04: paracetamol → resultado (acetaminophen)
    - [ ] CA-05: fórmula inválida → mensagem de erro amigável
    - [ ] CA-06: medicamento inexistente → mensagem de erro amigável
    - [ ] CA-07: index carrega em menos de 3 segundos
    - [ ] CA-08: testar no celular (ou DevTools modo mobile)
    - [ ] CA-09: busca vazia → erro sem chamar a API
  - Critério de conclusão: todos os CAs marcados ✅
  - Depende de: T-11

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

---

## Bloqueios

| Tarefa | Motivo | Resolução |
|---|---|---|
| | | |

---

## Mudanças de escopo

| Data | O que mudou | Motivo |
|---|---|---|
| | | |
