// ─────────────────────────────────────────
//  MEDBASE — api.js
//  Único arquivo que faz chamadas ao backend.
//  URL vem do CONFIG — não altere aqui.
// ─────────────────────────────────────────

const TIMEOUT_MS = 30000

const Api = {

  async _fetch(url) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const resposta = await fetch(url, { signal: controller.signal })
      clearTimeout(id)
      if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}))
        throw new Error(erro?.detail?.mensagem || "Erro desconhecido.")
      }
      return resposta.json()
    } catch (e) {
      clearTimeout(id)
      if (e.name === "AbortError") throw new Error("timeout")
      throw e
    }
  },

  async _post(url, corpo) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
        signal: controller.signal,
      })
      clearTimeout(id)
      if (!resposta.ok) throw new Error("Erro ao salvar.")
      return resposta.json()
    } catch (e) {
      clearTimeout(id)
      if (e.name === "AbortError") throw new Error("timeout")
      throw e
    }
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
