// ─────────────────────────────────────────
//  MEDBASE — config.js
//  Configurações centralizadas do frontend.
// ─────────────────────────────────────────

const CONFIG = {
  API_URL:       "http://localhost:8000",
  TEMA_PADRAO:   "light",
  MAX_HISTORICO: 10,
}

// Aplica o tema antes de renderizar qualquer elemento
;(function () {
  const temaSalvo = localStorage.getItem("medbase_tema")

  // Se não tiver nada salvo OU tiver valor inválido, força o light
  const temaValido = ["light", "dark"].includes(temaSalvo)
  const temaFinal  = temaValido ? temaSalvo : CONFIG.TEMA_PADRAO

  // Garante que o localStorage está limpo e correto
  localStorage.setItem("medbase_tema", temaFinal)
  document.documentElement.setAttribute("data-theme", temaFinal)
})()
