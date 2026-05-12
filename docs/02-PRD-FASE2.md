# PRD — MedBase Fase 2 (Conteúdo Completo)

**Data:** 2026-05-07
**Status:** Aprovado — pronto para TECHSPEC

---

## 1. Resumo

A Fase 2 expande o MedBase com dois novos módulos de conteúdo (Doenças e História da Medicina) e adiciona persistência local com histórico de pesquisas via SQLite. Ao final, o site terá 4 módulos funcionais e lembrará as últimas buscas do usuário.

---

## 2. Novos módulos

### Módulo Doenças
Permite pesquisar uma doença pelo nome e ver: descrição, causas, sintomas, tratamentos e dados epidemiológicos quando disponíveis. Fonte: Wikipedia API + Disease.sh.

### Módulo História da Medicina
Permite pesquisar eventos, descobertas ou personagens históricos da medicina. Exibe artigo resumido com link para leitura completa. Fonte: Wikipedia API.

### Histórico de pesquisas
As últimas 10 pesquisas ficam salvas localmente (SQLite) e aparecem na página inicial como atalhos rápidos.

---

## 3. Casos de uso

### UC-01: Pesquisar doença
1. Usuário seleciona modo "Doença" na busca
2. Digita o nome (ex: "diabetes", "malaria")
3. Vê: descrição, causas, sintomas, tratamentos
4. Pode clicar para ler o artigo completo na Wikipedia

### UC-02: Pesquisar história
1. Usuário seleciona modo "História"
2. Digita termo (ex: "Hippocrates", "Black Death", "penicillin discovery")
3. Vê: resumo do artigo, datas relevantes, link completo

### UC-03: Ver histórico de pesquisas
1. Usuário acessa a página inicial
2. Vê seção "Pesquisas recentes" com os últimos 10 termos
3. Clica em qualquer item para repetir a busca

---

## 4. Critérios de aceite — Fase 2

- [ ] **CA-01:** Pesquisar "diabetes" retorna descrição e causas
- [ ] **CA-02:** Pesquisar "malaria" retorna sintomas e tratamentos
- [ ] **CA-03:** Pesquisar "Hippocrates" retorna resumo histórico
- [ ] **CA-04:** Pesquisar "Black Death" retorna artigo histórico
- [ ] **CA-05:** Após qualquer busca, ela aparece no histórico
- [ ] **CA-06:** Histórico mostra no máximo 10 itens (remove o mais antigo)
- [ ] **CA-07:** Doença não encontrada exibe mensagem amigável
- [ ] **CA-08:** Cards "Doenças" e "História" na index agora são clicáveis

---

## 5. Novas dependências

| Dependência | Por quê |
|---|---|
| `aiosqlite` | SQLite assíncrono compatível com FastAPI |

---

## 6. APIs utilizadas na Fase 2

| API | Módulo | Endpoint principal |
|---|---|---|
| Wikipedia REST | Doenças + História | `/api/rest_v1/page/summary/{termo}` |
| Wikipedia Search | Doenças + História | `/w/api.php?action=query&list=search` |
| Disease.sh | Doenças (dados epidemiológicos) | `/v3/covid-19/all` (exemplo) |
