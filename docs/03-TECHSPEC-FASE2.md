# TECHSPEC — MedBase Fase 2

**Data:** 2026-05-07
**PRD:** `docs/02-PRD-FASE2.md`
**Status:** Aprovado

---

## 1. Resumo técnico

Dois novos serviços (wikipedia.py) alimentam as rotas de doenças e história. O banco SQLite entra para persistir o histórico de pesquisas. No frontend, duas novas páginas são criadas e a index é atualizada para mostrar histórico e aceitar os dois novos tipos de busca.

---

## 2. Diagrama de fluxo — novos módulos

```
[Frontend busca.js]
    ↓ tipo: "doenca" ou "historia"
[GET /api/doenca/{nome}]       [GET /api/historia/{termo}]
    ↓                               ↓
[services/wikipedia.py]        [services/wikipedia.py]
    ↓                               ↓
[Wikipedia REST API]           [Wikipedia REST API]
    ↓                               ↓
[Resultado formatado]          [Resultado formatado]
    ↓
[POST /api/historico] ← salva no SQLite
```

---

## 3. Arquivos novos e modificados

### Criados
| Arquivo | Responsabilidade |
|---|---|
| `backend/services/wikipedia.py` | Busca e formata artigos da Wikipedia |
| `backend/routers/doenca.py` | GET /api/doenca/{nome} |
| `backend/routers/historia.py` | GET /api/historia/{termo} |
| `backend/routers/historico.py` | GET e POST /api/historico |
| `backend/database/database.py` | Conexão e setup do SQLite |
| `backend/database/models.py` | Tabela de histórico |
| `frontend/doenca.html` | Página de resultado de doença |
| `frontend/historia.html` | Página de resultado histórico |
| `frontend/historico.html` | Página do histórico completo |
| `frontend/js/doenca.js` | Lógica da página de doença |
| `frontend/js/historia.js` | Lógica da página histórica |
| `frontend/js/historico.js` | Lógica da página de histórico |

### Modificados
| Arquivo | O que muda |
|---|---|
| `backend/main.py` | Incluir 3 novos routers + inicializar banco |
| `backend/requirements.txt` | Adicionar aiosqlite |
| `frontend/index.html` | Adicionar tipos doença/história + seção histórico |
| `frontend/js/api.js` | Adicionar buscarDoenca, buscarHistoria, buscarHistorico |
| `frontend/js/busca.js` | Suportar 4 tipos de busca |
| `frontend/css/componentes.css` | Estilos do histórico e cards de doença |

---

## 4. Banco de dados

### Nova tabela
```sql
CREATE TABLE IF NOT EXISTS historico (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    termo     TEXT NOT NULL,
    tipo      TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Regras
- Máximo 10 registros — ao inserir o 11º, apaga o mais antigo
- Sem autenticação — histórico é global (portfólio, sem usuários)
- Arquivo SQLite: `backend/database/medbase.db`

---

## 5. Contratos de API

### `GET /api/doenca/{nome}`
**Exemplo:** `GET /api/doenca/diabetes`

**Response 200:**
```json
{
  "tipo": "doenca",
  "nome": "Diabetes mellitus",
  "resumo": "Diabetes mellitus is a group of metabolic disorders...",
  "imagem_url": "https://upload.wikimedia.org/...",
  "link_wikipedia": "https://en.wikipedia.org/wiki/Diabetes_mellitus",
  "extract_html": "<p>...</p>"
}
```

### `GET /api/historia/{termo}`
**Exemplo:** `GET /api/historia/Hippocrates`

**Response 200:**
```json
{
  "tipo": "historia",
  "titulo": "Hippocrates",
  "resumo": "Hippocrates of Cos was a Greek physician...",
  "imagem_url": "https://upload.wikimedia.org/...",
  "link_wikipedia": "https://en.wikipedia.org/wiki/Hippocrates"
}
```

### `GET /api/historico`
**Response 200:**
```json
{
  "historico": [
    { "id": 1, "termo": "C6H12O6", "tipo": "formula", "criado_em": "2026-05-07T..." },
    { "id": 2, "termo": "aspirin", "tipo": "medicamento", "criado_em": "2026-05-07T..." }
  ]
}
```

### `POST /api/historico`
**Body:** `{ "termo": "diabetes", "tipo": "doenca" }`
**Response 200:** `{ "ok": true }`

---

## 6. Edge cases

| Situação | Comportamento |
|---|---|
| Doença não encontrada na Wikipedia | 404 com mensagem amigável |
| Wikipedia retorna desambiguação | Pega o primeiro resultado da busca |
| Histórico vazio | Seção não aparece na index |
| Termo com caracteres especiais | `encodeURIComponent` antes de chamar |
| Disease.sh fora do ar | Exibe resultado sem dados epidemiológicos |

---

## 7. Checklist de aprovação

- [x] Arquivos novos e modificados listados
- [x] Banco definido com regra de limite de 10
- [x] Contratos de API com erros esperados
- [x] Edge cases cobertos
- [x] TECH RESEARCH necessário? Não
- [x] Pronto para TASKBREAK
