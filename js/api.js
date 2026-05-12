// ─────────────────────────────────────────
//  MEDBASE — api.js
//  Único arquivo que faz chamadas ao backend.
//  URL vem do CONFIG — não altere aqui.
// ─────────────────────────────────────────

const Api = {

  async _fetch(url) {
    const resposta = await fetch(url)
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({}))
      throw new Error(erro?.detail?.mensagem || "Erro desconhecido.")
    }
    return resposta.json()
  },

  async _post(url, corpo) {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo)
    })
    if (!resposta.ok) throw new Error("Erro ao salvar.")
    return resposta.json()
  },

  async buscarFormula(formula) {
    return this._fetch(`${CONFIG.API_URL}/api/formula/${encodeURIComponent(formula)}`)
  },

  async buscarMedicamento(nome) {
    return this._fetch(`${CONFIG.API_URL}/api/medicamento/${encodeURIComponent(nome)}`)
  },

  async buscarDoenca(nome) {
    return this._fetch(`${CONFIG.API_URL}/api/doenca/${encodeURIComponent(nome)}`)
  },

  async buscarHistoria(termo) {
    return this._fetch(`${CONFIG.API_URL}/api/historia/${encodeURIComponent(termo)}`)
  },

  async buscarHistorico() {
    return this._fetch(`${CONFIG.API_URL}/api/historico`)
  },

  async salvarHistorico(termo, tipo) {
    return this._post(`${CONFIG.API_URL}/api/historico`, { termo, tipo })
  }
}
