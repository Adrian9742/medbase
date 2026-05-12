# TECHSPEC — MedBase Fase 1 (Base Funcional)

**Data:** 2026-05-06
**PRD:** `docs/02-PRD-FASE1.md`
**Status:** Aprovado

---

## 1. Resumo técnico

O backend em FastAPI recebe as pesquisas do frontend, chama as APIs externas (PubChem e OpenFDA), formata os dados e devolve um JSON limpo. O frontend em HTML/JS puro exibe os resultados. Nenhuma chamada externa sai do frontend — tudo passa pelo backend, o que facilita tratar erros e traduzir campos.

---

## 2. Diagrama de fluxo

```
[Usuário digita no navegador]
    ↓ clica em "Buscar"
[frontend/js/api.js]
    ↓ GET /api/formula/{formula}
    ↓ GET /api/medicamento/{nome}
[FastAPI — backend/main.py]
    ↓ chama o service correto
[backend/services/pubchem.py]     [backend/services/openfda.py]
    ↓ GET pubchem.ncbi.nlm...          ↓ GET api.fda.gov/...
[API PubChem]                     [API OpenFDA]
    ↓ retorna JSON bruto               ↓ retorna JSON bruto
[service formata e filtra campos]
    ↓ retorna JSON limpo
[FastAPI — retorna para o frontend]
    ↓ JSON estruturado
[frontend/js — renderiza no HTML]
```

---

## 3. Arquivos a criar

### Backend
| Arquivo | Responsabilidade |
|---|---|
| `backend/main.py` | Inicializa o FastAPI e registra os routers |
| `backend/routers/formula.py` | Rota GET /api/formula/{formula} |
| `backend/routers/medicamento.py` | Rota GET /api/medicamento/{nome} |
| `backend/services/pubchem.py` | Lógica de chamada e formatação PubChem |
| `backend/services/openfda.py` | Lógica de chamada e formatação OpenFDA |
| `backend/requirements.txt` | Dependências Python |

### Frontend
| Arquivo | Responsabilidade |
|---|---|
| `frontend/index.html` | Página inicial com busca central |
| `frontend/resultado.html` | Página de exibição de resultado |
| `frontend/css/main.css` | Estilos globais, variáveis de cor, tipografia |
| `frontend/css/componentes.css` | Cards, badges, tabelas, spinner |
| `frontend/js/api.js` | Todas as chamadas ao backend (único lugar) |
| `frontend/js/busca.js` | Lógica da busca na página inicial |
| `frontend/js/resultado.js` | Lógica de renderização do resultado |

---

## 4. Banco de dados

**Fase 1 não usa banco de dados.** O SQLite entra na Fase 2 (histórico de pesquisas). Manter simples agora.

---

## 5. Contratos de API

### `GET /api/formula/{formula}`

**Exemplo:** `GET /api/formula/C6H12O6`

**O que faz:** Chama a PubChem, pega o primeiro composto encontrado e retorna campos formatados.

**Response 200:**
```json
{
  "tipo": "formula",
  "cid": 5793,
  "nome": "Glucose",
  "formula": "C6H12O6",
  "peso_molecular": "180.16 g/mol",
  "sinonimos": ["Dextrose", "D-Glucose", "Blood sugar"],
  "descricao": "Glucose is a simple sugar and primary source of energy...",
  "imagem_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/5793/PNG",
  "link_pubchem": "https://pubchem.ncbi.nlm.nih.gov/compound/5793",
  "seguranca": {
    "toxicidade": "Low toxicity",
    "ghs_symbols": ["GHS07"]
  }
}
```

**Erros esperados:**
| Status | Mensagem | Quando |
|---|---|---|
| 400 | `FORMULA_VAZIA` | Fórmula não informada |
| 404 | `FORMULA_NAO_ENCONTRADA` | PubChem não retornou resultados |
| 503 | `API_INDISPONIVEL` | PubChem fora do ar ou timeout |

---

### `GET /api/medicamento/{nome}`

**Exemplo:** `GET /api/medicamento/aspirin`

**O que faz:** Chama a OpenFDA, pega o primeiro resultado e retorna campos formatados.

**Response 200:**
```json
{
  "tipo": "medicamento",
  "nome_generico": "Aspirin",
  "nome_marca": "Bayer Aspirin",
  "fabricante": "Bayer HealthCare LLC",
  "indicacoes": "For temporary relief of headache, pain and fever of colds...",
  "contraindicacoes": "Allergy to aspirin or other pain relievers...",
  "efeitos_adversos": "Stomach bleeding, ringing in ears...",
  "dosagem": "Adults and children 12 years and over: take 1-2 tablets...",
  "link_fda": "https://api.fda.gov/drug/label.json?..."
}
```

**Erros esperados:**
| Status | Mensagem | Quando |
|---|---|---|
| 400 | `NOME_VAZIO` | Nome não informado |
| 404 | `MEDICAMENTO_NAO_ENCONTRADO` | OpenFDA não retornou resultados |
| 503 | `API_INDISPONIVEL` | OpenFDA fora do ar ou timeout |

---

## 6. Como o frontend se comunica com o backend

O arquivo `api.js` é o **único lugar** onde o frontend faz chamadas. Os outros arquivos JS importam funções daqui.

```javascript
// Estrutura do api.js
const Api = {
    async buscarFormula(formula) { ... },
    async buscarMedicamento(nome) { ... }
}
```

---

## 7. Componentes do frontend

### `index.html` — Página inicial
- Header com logo + nome "MedBase"
- Campo de busca central grande
- Seletor de tipo: [ Fórmula Química ] [ Medicamento ]
- Exemplos clicáveis: "Tente: C6H12O6 · Aspirin · C2H5OH"
- Cards de navegação (Fórmulas, Medicamentos, *Em breve: Doenças, História*)
- Footer simples

### `resultado.html` — Página de resultado
Recebe o tipo e o termo via URL: `resultado.html?tipo=formula&q=C6H12O6`

**Seção de fórmula:**
- Badge verde "Fórmula Química"
- Nome do composto (grande)
- Imagem da estrutura molecular
- Tabela de propriedades (fórmula, peso molecular, CID)
- Seção de sinônimos (tags/badges)
- Descrição em parágrafo
- Seção de segurança colapsável
- Botão "Ver no PubChem"

**Seção de medicamento:**
- Badge azul "Medicamento"
- Nome genérico + nome de marca
- Fabricante
- Seções colapsáveis: Indicações / Contraindicações / Efeitos adversos / Dosagem
- Botão "Ver na FDA"

**Estado de loading:**
- Spinner centralizado
- Texto "Buscando informações..."

**Estado de erro:**
- Ícone ⚠️
- Mensagem amigável em português
- Botão "Tentar novamente"

---

## 8. Edge cases

| Situação | Comportamento esperado |
|---|---|
| Fórmula com letras minúsculas ("c6h12o6") | Backend converte para maiúsculas antes de chamar a API |
| Nome de medicamento em português ("paracetamol") | Tenta direto; se 404, sugere tentar em inglês ("acetaminophen") |
| PubChem retorna múltiplos compostos | Pega sempre o primeiro (maior relevância) |
| OpenFDA retorna múltiplos resultados | Pega o primeiro; futuramente lista todos |
| Campo ausente na resposta da API | Substitui por "Informação não disponível" — nunca deixa campo vazio |
| Usuário aperta buscar sem digitar nada | Frontend valida antes de chamar — não chama a API |
| Timeout da API externa (>10 segundos) | Backend retorna 503 com mensagem clara |
| Fórmula com espaços ("C6 H12 O6") | Backend remove espaços antes de chamar a API |

---

## 9. Decisões de arquitetura

**Decisão 1: Por que o frontend não chama a API diretamente?**
- Centralizar no backend permite: tratar erros de forma consistente, traduzir campos, e futuramente adicionar cache. Se a PubChem mudar, você muda só o backend.

**Decisão 2: Por que uma única página de resultado (resultado.html)?**
- Mais simples de manter. O tipo de conteúdo é determinado pelo parâmetro `?tipo=` na URL. Evita duplicação de HTML.

**Decisão 3: Por que não usar banco agora?**
- YAGNI (You Ain't Gonna Need It). A Fase 1 não tem nenhuma funcionalidade que precise persistir dados. Adicionar SQLite agora só adiciona complexidade sem benefício.

---

## 10. Checklist de aprovação

- [x] Todos os arquivos listados na seção 3
- [x] Sem banco de dados na Fase 1 (decisão registrada)
- [x] Contratos de API com todos os erros esperados (seção 5)
- [x] Edge cases cobertos (seção 8)
- [x] Nenhuma chave de API necessária para começar
- [x] Alinhado com os casos de uso do PRD (UC-01, UC-02, UC-03)
- [x] TECH RESEARCH necessário? Não — as APIs são bem documentadas
- [x] Pronto para TASKBREAK
