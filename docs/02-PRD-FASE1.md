# PRD — MedBase: Fase 1 (Base Funcional)

**Data:** 2026-05-06
**Tipo:** Nova feature (projeto do zero)
**Status:** Aprovado — pronto para TECHSPEC

---

## 1. Resumo

MedBase é uma enciclopédia médica web que permite pesquisar doenças, medicamentos e compostos químicos usando APIs públicas gratuitas. A Fase 1 entrega a fundação: servidor funcionando, busca por fórmula química (PubChem) e busca por medicamento (OpenFDA), com design limpo e profissional.

---

## 2. Problema

Não há problema de negócio — é um projeto de portfólio. O objetivo é demonstrar:
- Capacidade de integrar APIs externas reais
- Arquitetura de projeto organizada (backend separado do frontend)
- Design funcional e responsivo
- Código limpo e bem documentado

---

## 3. Objetivo e escopo da Fase 1

**O que vai existir ao final da Fase 1:**
- Página inicial com campo de busca e seletor de tipo (fórmula / medicamento)
- Resultado de pesquisa por fórmula química (ex: "C6H12O6" → glicose)
- Resultado de pesquisa por medicamento (ex: "paracetamol" → bula, dosagem, efeitos)
- Backend Python rodando localmente
- Design com tema médico/científico (escuro ou claro, profissional)

**Fora do escopo da Fase 1:**
- Doenças e história (Fase 2)
- Favoritos e histórico (Fase 2)
- Busca global combinada (Fase 3)
- Deploy em servidor (Fase 3)

---

## 4. Casos de uso

### UC-01: Pesquisar por fórmula química

**Ator:** Visitante do site
**Pré-condição:** Nenhuma — qualquer pessoa pode pesquisar
**Fluxo principal:**
1. Usuário acessa a página inicial
2. Seleciona o modo "Fórmula Química"
3. Digita uma fórmula (ex: "C2H5OH") e pressiona buscar
4. Site exibe: nome do composto, estrutura, peso molecular, usos clínicos, segurança
5. Usuário pode ver uma imagem 2D da estrutura molecular

**Fluxo alternativo:**
1. Fórmula não encontrada → mensagem clara "Fórmula não encontrada no PubChem"
2. API fora do ar → mensagem "Serviço temporariamente indisponível"

**Pós-condição:** Resultado exibido com informações do PubChem

---

### UC-02: Pesquisar por medicamento

**Ator:** Visitante do site
**Pré-condição:** Nenhuma
**Fluxo principal:**
1. Usuário seleciona o modo "Medicamento"
2. Digita um nome (ex: "dipirona" ou "aspirin")
3. Site exibe: nome genérico, fabricante, indicações, contraindicações, efeitos adversos
4. Exibe também o número de aprovação FDA e data

**Fluxo alternativo:**
1. Medicamento não encontrado → sugestão de tentar o nome em inglês
2. Múltiplos resultados → lista com os primeiros 5 para o usuário escolher

**Pós-condição:** Resultado exibido com dados da OpenFDA

---

### UC-03: Ver página inicial

**Ator:** Visitante
**Fluxo principal:**
1. Usuário acessa o site
2. Vê logo, nome do projeto, descrição curta
3. Vê o campo de busca central com seletor de tipo
4. Vê exemplos clicáveis ("Tente: C6H12O6 · Paracetamol · Aspirina")
5. Vê cards com as seções disponíveis (Fórmulas, Medicamentos, Em breve: Doenças, História)

---

## 5. Critérios de aceite — Fase 1

- [ ] **CA-01:** Pesquisar "C6H12O6" retorna "Glucose" com peso molecular e descrição
- [ ] **CA-02:** Pesquisar "C2H5OH" retorna "Ethanol" com informações de segurança
- [ ] **CA-03:** Pesquisar "aspirin" retorna nome genérico, indicações e efeitos adversos
- [ ] **CA-04:** Pesquisar "paracetamol" retorna resultados (pode vir como "acetaminophen")
- [ ] **CA-05:** Fórmula inválida exibe mensagem de erro amigável (não trava o site)
- [ ] **CA-06:** Medicamento não encontrado exibe mensagem de erro amigável
- [ ] **CA-07:** Página inicial carrega em menos de 3 segundos
- [ ] **CA-08:** Site funciona no celular (layout responsivo)
- [ ] **CA-09:** Backend retorna erro 400 com mensagem clara para inputs vazios

---

## 6. UX

**Loading:** Spinner animado enquanto a API responde. Botão de busca desabilitado durante a chamada.

**Erro:** Card vermelho com ícone ⚠️ e mensagem em português. Nunca mostrar erro técnico cru.

**Sucesso:** Card com resultado bem estruturado. Campos com labels claros. Nenhum JSON bruto visível.

**Vazio:** Se um campo não tiver informação na API, mostrar "Informação não disponível" — nunca deixar espaço vazio sem explicação.

---

## 7. Design

**Paleta:** Tema escuro científico — fundo #0D1117, cards #161B22, azul acento #58A6FF (inspirado em painéis de laboratório e GitHub dark)

**Tipografia:** Inter ou Roboto (Google Fonts — gratuita)

**Componentes principais:**
- Card de resultado com seções colapsáveis
- Badge colorido por tipo (fórmula = verde, medicamento = azul)
- Imagem da estrutura molecular (quando disponível via PubChem)
- Tabela de propriedades (peso molecular, fórmula, CID)

---

## 8. Dependências técnicas

| Dependência | Versão | Por quê |
|---|---|---|
| Python | 3.10+ | Backend |
| FastAPI | última | Servidor web |
| httpx | última | Chamadas HTTP assíncronas às APIs |
| uvicorn | última | Rodar o FastAPI |
| sqlite3 | builtin | Banco de dados (vem com Python) |

**APIs externas:**
- PubChem REST API (sem chave)
- OpenFDA API (sem chave para volume de portfólio)
