# RESEARCH — MedBase: Enciclopédia Médica Web

**Data:** 2026-05-06
**Tipo:** Nova feature (projeto do zero)
**Descrição:** Site enciclopédico sobre doenças, medicamentos, fórmulas químicas e história da medicina, alimentado por APIs públicas gratuitas.

---

## 1. Pergunta central

> Como construir um site funcional de consulta médica para portfólio, usando apenas APIs públicas gratuitas, com um iniciante em programação?

---

## 2. Contexto

**Por que está sendo construído?**
Portfólio técnico com tema médico. O site precisa impressionar visualmente e demonstrar habilidade de integração com APIs reais — não precisa ser um produto médico certificado.

**Decisão crítica de arquitetura:**
Para um iniciante com Python, a stack mais natural é:
- Frontend: HTML + CSS + JavaScript puro
- Backend: Python + FastAPI (já familiar)
- Banco: SQLite (zero configuração, perfeito para portfólio)

**Por que não usar React/Vue/etc?**
Frameworks JS adicionam complexidade sem benefício real para este estágio. JS puro é suficiente e mais fácil de aprender e depurar.

---

## 3. APIs públicas disponíveis e gratuitas

### 🔬 PubChem API (NIH) — PRINCIPAL para fórmulas
- **URL:** https://pubchem.ncbi.nlm.nih.gov/rest/pug/
- **O que tem:** Estrutura química, fórmula molecular, peso molecular, nomes de compostos, uso clínico, segurança
- **Exemplo real:** Pesquisar "C2H5OH" → retorna álcool etílico com todas as propriedades
- **Limite:** Sem chave de API, sem limite oficial (uso razoável)
- **Formato:** JSON

### 💊 OpenFDA API — PRINCIPAL para medicamentos
- **URL:** https://api.fda.gov/
- **O que tem:** Bula de remédios, efeitos adversos, recalls, interações, histórico de aprovação
- **Exemplo real:** Pesquisar "dipirona" → retorna composição, dosagem, contraindicações
- **Limite:** 1000 requisições/dia sem chave; 120.000/dia com chave gratuita
- **Formato:** JSON

### 🦠 Open Disease API — PRINCIPAL para doenças
- **URL:** https://disease.sh/
- **O que tem:** Dados epidemiológicos atualizados (COVID, gripe, etc.), estatísticas por país
- **Limite:** Sem limite
- **Formato:** JSON

### 📚 Wikipedia / Wikidata API — PRINCIPAL para história
- **URL:** https://en.wikipedia.org/api/rest_v1/
- **O que tem:** Artigos completos sobre doenças históricas, médicos famosos, descobertas
- **Exemplo real:** "Bubonic plague" → retorna artigo completo formatado
- **Limite:** Sem limite (uso razoável)
- **Formato:** JSON/HTML

### 💉 RxNorm API (NIH) — COMPLEMENTAR para medicamentos
- **URL:** https://rxnav.nlm.nih.gov/REST/
- **O que tem:** Nomes de medicamentos, relacionamentos, equivalências genéricas
- **Limite:** Sem limite
- **Formato:** JSON

### 🧬 OMIM (Online Mendelian Inheritance in Man) — COMPLEMENTAR
- **URL:** https://api.omim.org/
- **O que tem:** Doenças genéticas, genes relacionados
- **Limite:** Chave gratuita necessária (aprovação manual)
- **Recomendação:** Deixar para uma fase futura

---

## 4. O que o site vai ter (escopo validado)

### Módulos principais
| Módulo | API usada | Complexidade |
|---|---|---|
| 🔬 Pesquisa por fórmula química | PubChem | Média |
| 💊 Pesquisa de medicamentos | OpenFDA + RxNorm | Média |
| 🦠 Enciclopédia de doenças | Wikipedia + Open Disease | Baixa |
| 📜 História da medicina | Wikipedia | Baixa |
| 🔍 Busca global (tudo junto) | Todas as APIs | Alta |

### Funcionalidades de suporte
- Página de resultado detalhada para cada pesquisa
- Histórico de pesquisas recentes (banco local SQLite)
- Favoritos (salvar resultados)
- Modo escuro
- Design responsivo (funciona no celular)

---

## 5. Estrutura de pastas do projeto

```
medbase/
├── backend/
│   ├── main.py               ← servidor FastAPI
│   ├── routers/
│   │   ├── formulas.py       ← rotas para PubChem
│   │   ├── medicamentos.py   ← rotas para OpenFDA
│   │   ├── doencas.py        ← rotas para Wikipedia + Disease.sh
│   │   └── historico.py      ← rotas para histórico/favoritos
│   ├── services/
│   │   ├── pubchem.py        ← lógica de chamada à API PubChem
│   │   ├── openfda.py        ← lógica de chamada à OpenFDA
│   │   ├── wikipedia.py      ← lógica de chamada à Wikipedia
│   │   └── disease.py        ← lógica de chamada à Disease.sh
│   ├── database/
│   │   ├── database.py       ← conexão SQLite
│   │   └── models.py         ← tabelas (historico, favoritos)
│   └── requirements.txt
│
├── frontend/
│   ├── index.html            ← página inicial / busca global
│   ├── formula.html          ← resultado de fórmula química
│   ├── medicamento.html      ← resultado de medicamento
│   ├── doenca.html           ← resultado de doença
│   ├── historia.html         ← linha do tempo histórica
│   ├── favoritos.html        ← itens salvos
│   ├── css/
│   │   ├── main.css          ← estilos globais
│   │   └── componentes.css   ← cards, badges, tabelas
│   └── js/
│       ├── api.js            ← todas as chamadas ao backend
│       ├── busca.js          ← lógica da busca global
│       ├── formula.js        ← lógica da página de fórmula
│       ├── medicamento.js    ← lógica da página de medicamento
│       ├── doenca.js         ← lógica da página de doença
│       └── utils.js          ← funções utilitárias compartilhadas
│
└── README.md
```

---

## 6. Fases de desenvolvimento

### 🟢 FASE 1 — Base funcional (2–3 semanas)
Objetivo: site no ar, busca de fórmulas e medicamentos funcionando

- Setup do projeto (FastAPI + SQLite + HTML base)
- Integração PubChem (pesquisa por fórmula)
- Integração OpenFDA (pesquisa por medicamento)
- Página inicial com campo de busca
- Design básico funcional

### 🟡 FASE 2 — Conteúdo completo (2–3 semanas)
Objetivo: todas as seções de conteúdo funcionando

- Integração Wikipedia (doenças + história)
- Integração Disease.sh (dados epidemiológicos)
- Páginas de resultado para cada módulo
- Histórico de pesquisas (SQLite)

### 🔵 FASE 3 — Polimento e portfólio (1–2 semanas)
Objetivo: impressionar visualmente e funcionar perfeitamente

- Favoritos
- Modo escuro
- Design responsivo
- Busca global (pesquisa em todas as APIs ao mesmo tempo)
- README bem escrito para o GitHub

---

## 7. Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| API fora do ar | Baixa | Mostrar mensagem de erro amigável |
| Dados em inglês (OpenFDA/PubChem) | Alta | Traduzir campos principais no backend |
| Resultado sem informação suficiente | Média | Combinar múltiplas APIs para enriquecer |
| Projeto crescer demais | Média | Seguir as fases — não pular etapas |

---

## 8. Conclusão

**Recomendação:** Prosseguir. A stack (FastAPI + JS puro + SQLite) é adequada para o nível atual e impressiona em portfólio. As APIs escolhidas são estáveis, gratuitas e suficientes para o escopo.

**Próximo passo:** PRD — definir os casos de uso e critérios de aceite da Fase 1.
