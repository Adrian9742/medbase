# PRD — MedBase Fase 3 (Polimento e Deploy)

**Data:** 2026-05-08
**Status:** Aprovado — pronto para TECHSPEC

---

## 1. Resumo

A Fase 3 transforma o MedBase de projeto funcional em portfólio profissional. Foco em três frentes: visual (ícones Lucide, modo claro/escuro, polimento geral), conteúdo (tradução EN→PT dos resultados) e infraestrutura (deploy público + README).

---

## 2. O que vai ser feito

### Visual
- Substituir todos os emojis por ícones Lucide consistentes
- Implementar toggle modo claro/escuro com persistência (localStorage)
- Melhorar tipografia e espaçamentos das páginas de resultado
- Adicionar página de histórico completo (`historico.html`)

### Tradução
- Traduzir campos dos resultados EN→PT usando a API MyMemory (gratuita, sem chave)
- Campos traduzidos: resumo das doenças/história, indicações e avisos dos medicamentos
- Campos que ficam em inglês: nomes científicos, fórmulas, nomes de compostos

### Deploy
- Subir backend no **Render** (gratuito para portfólio)
- Subir frontend no **GitHub Pages** (gratuito)
- Atualizar `URL_BACKEND` no `api.js` para apontar para o Render

### README
- Descrição do projeto
- Screenshot da interface
- Como rodar localmente
- Tecnologias usadas
- APIs utilizadas

---

## 3. Critérios de aceite

- [ ] **CA-01:** Todos os emojis substituídos por ícones Lucide
- [ ] **CA-02:** Toggle claro/escuro funciona e persiste ao recarregar
- [ ] **CA-03:** Resultado de doença/história aparece em português
- [ ] **CA-04:** Página de histórico completo funciona
- [ ] **CA-05:** Site acessível por URL pública (GitHub Pages)
- [ ] **CA-06:** Backend respondendo em URL pública (Render)
- [ ] **CA-07:** README completo no repositório

---

## 4. API de tradução

**MyMemory API** — gratuita, sem chave para uso moderado
- URL: `https://api.mymemory.translated.net/get?q={texto}&langpair=en|pt-br`
- Limite: 5000 palavras/dia sem chave (suficiente para portfólio)
- Retorna: `{"responseData": {"translatedText": "..."}}`
- Estratégia: traduzir só os campos longos (resumo, indicações) — não os nomes

---

## 5. Fora do escopo da Fase 3

- Login/autenticação (decisão mantida)
- App mobile
- Banco de dados em nuvem (SQLite local é suficiente para portfólio)
