# TECHSPEC — MedBase Fase 3

**Data:** 2026-05-08
**PRD:** `docs/02-PRD-FASE3.md`
**Status:** Aprovado

---

## 1. Resumo técnico

Fase de polimento e deploy. Nenhuma nova funcionalidade de dados — foco em UX, visual e infraestrutura. Todas as mudanças são aditivas ou substituições visuais, sem risco de regressão no backend.

---

## 2. Arquivos novos e modificados

### Criados
| Arquivo | Responsabilidade |
|---|---|
| `backend/services/traducao.py` | Tradução EN→PT via MyMemory com cache em memória |
| `frontend/js/config.js` | Configurações centralizadas (URL backend, tema padrão) |
| `frontend/historico.html` | Página de histórico completo |
| `frontend/js/historico.js` | Lógica da página de histórico |
| `frontend/404.html` | Página de erro personalizada |
| `frontend/favicon.svg` | Favicon SVG minimalista |
| `backend/.env` | Variáveis de ambiente |
| `README.md` | Documentação do projeto |

### Modificados
| Arquivo | O que muda |
|---|---|
| Todos os `.html` | Emojis → Lucide Icons + favicon + config.js |
| `frontend/css/main.css` | Adicionar variáveis do tema claro + `[data-theme="light"]` |
| `frontend/css/componentes.css` | Skeleton loading + ajustes visuais |
| `frontend/js/api.js` | URL vem do CONFIG, não hardcoded |
| `backend/routers/doenca.py` | Campo `resumo_pt` com tradução |
| `backend/routers/historia.py` | Campo `resumo_pt` com tradução |
| `backend/routers/medicamento.py` | Campos traduzidos quando disponível |
| `backend/main.py` | CORS atualizado para aceitar GitHub Pages |

---

## 3. Tema claro/escuro

### Abordagem: atributo `data-theme` no `<html>`

```css
/* Já existente — tema escuro é o padrão */
:root { --cor-fundo: #080C10; ... }

/* Tema claro — sobrescreve só as variáveis */
[data-theme="light"] {
  --cor-fundo:       #F5F7FA;
  --cor-superficie:  #FFFFFF;
  --cor-card:        #FFFFFF;
  --cor-borda:       #E1E8F0;
  --cor-texto:       #1A2332;
  --cor-texto-suave: #4A5568;
  --cor-texto-fraco: #A0AEC0;
}
```

### Toggle JS
```javascript
function alternarTema() {
  const atual = document.documentElement.getAttribute("data-theme")
  const novo  = atual === "light" ? "dark" : "light"
  document.documentElement.setAttribute("data-theme", novo)
  localStorage.setItem("medbase_tema", novo)
}
```

### Persistência
- Salvo em `localStorage` — persiste entre sessões
- Lido no carregamento de cada página via `config.js`

---

## 4. Tradução com cache

```python
# cache simples em memória — dicionário Python
_cache_traducao: dict[str, str] = {}

async def traduzir(texto: str) -> str:
    if texto in _cache_traducao:
        return _cache_traducao[texto]
    # chama MyMemory API
    resultado = await _chamar_mymemory(texto)
    _cache_traducao[texto] = resultado
    return resultado
```

- Cache dura enquanto o servidor estiver rodando
- Evita chamar a API para o mesmo texto duas vezes
- Campos traduzidos: `resumo`, `indicacoes`, `avisos`
- Campos que ficam em inglês: nomes científicos, fórmulas

---

## 5. Skeleton loading

Substituir spinner por blocos animados que imitam o layout real:

```html
<div class="skeleton skeleton--titulo"></div>
<div class="skeleton skeleton--texto"></div>
<div class="skeleton skeleton--texto skeleton--curto"></div>
```

```css
.skeleton {
  background: linear-gradient(90deg, var(--cor-borda) 25%, var(--cor-superficie) 50%, var(--cor-borda) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--raio);
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 6. CONFIG.js

```javascript
const CONFIG = {
  API_URL:      "http://localhost:8000",  // trocar para URL do Render no deploy
  TEMA_PADRAO:  "dark",
  MAX_HISTORICO: 10,
}
```

Todos os arquivos JS importam daqui — nenhum valor hardcoded espalhado.

---

## 7. Lucide Icons — mapeamento

| Onde | Emoji atual | Ícone Lucide |
|---|---|---|
| Fórmula Química | 🔬 | `flask-conical` |
| Medicamento | 💊 | `pill` |
| Doença | 🦠 | `microscope` |
| História | 📜 | `book-open` |
| Buscar | → | `search` |
| Link externo | 🔗 | `external-link` |
| Nova busca | ← | `arrow-left` |
| Erro | ⚠️ | `triangle-alert` |
| Favorito | — | `bookmark` |
| Histórico | — | `clock` |
| Toggle tema | — | `sun` / `moon` |

---

## 8. Variáveis de ambiente — backend

```bash
# backend/.env
AMBIENTE=desenvolvimento   # ou "producao"
CORS_ORIGEM=*              # trocar para URL do GitHub Pages no deploy
```

```python
# main.py lê via python-dotenv
from dotenv import load_dotenv
load_dotenv()
cors_origem = os.getenv("CORS_ORIGEM", "*")
```

---

## 9. Deploy

| Serviço | O que sobe | URL |
|---|---|---|
| Render | Backend FastAPI | `https://medbase-api.onrender.com` |
| GitHub Pages | Frontend HTML/CSS/JS | `https://seuusuario.github.io/medbase` |

**Ordem:** backend primeiro → copiar URL → atualizar `CONFIG.API_URL` → subir frontend.

---

## 10. Edge cases

| Situação | Comportamento |
|---|---|
| MyMemory fora do ar | Retorna texto original em inglês sem quebrar |
| localStorage indisponível | Usa tema padrão sem crash |
| Lucide não carregou (offline) | Ícones somem mas layout não quebra |
| Render no plano gratuito (cold start) | Primeiro request demora ~30s — tratar com loading |

---

## 11. Checklist de aprovação

- [x] Nenhuma funcionalidade de dados nova — zero risco de regressão
- [x] Tradução com fallback seguro
- [x] Tema com CSS variables — sem troca de arquivo
- [x] CONFIG.js centralizado
- [x] CORS preparado para deploy
- [x] Pronto para TASKBREAK
