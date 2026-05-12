// ─────────────────────────────────────────
//  MEDBASE — historico.js
// ─────────────────────────────────────────

const elLoading       = document.getElementById("loading")
const elVazio         = document.getElementById("vazio")
const elLista         = document.getElementById("listaHistorico")
const btnLimpar       = document.getElementById("btnLimpar")

function mostrar(el) { el.classList.remove("oculto") }
function ocultar(el) { el.classList.add("oculto") }

// Ícone Lucide por tipo de busca
const ICONE = {
  formula:     "flask-conical",
  medicamento: "pill",
  doenca:      "microscope",
  historia:    "book-open",
}

const LABEL = {
  formula:     "Fórmula",
  medicamento: "Medicamento",
  doenca:      "Doença",
  historia:    "História",
}

const PAGINA = {
  formula:     "resultado.html",
  medicamento: "resultado.html",
  doenca:      "doenca.html",
  historia:    "historia.html",
}

// Formata data/hora de forma legível
function formatarData(dataISO) {
  if (!dataISO) return ""
  const d = new Date(dataISO)
  return d.toLocaleDateString("pt-BR", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  })
}

// Cria o card de um item do histórico
function criarCard(item) {
  const card = document.createElement("div")
  card.className = "historico-card"
  card.innerHTML = `
    <div class="historico-card__icone">
      <i data-lucide="${ICONE[item.tipo] || "search"}"></i>
    </div>
    <div class="historico-card__info">
      <span class="historico-card__termo">${item.termo}</span>
      <span class="historico-card__meta">
        <span class="badge badge--${item.tipo === 'formula' || item.tipo === 'doenca' ? 'verde' : 'azul'}" style="font-size:0.7rem; padding:2px 8px;">
          ${LABEL[item.tipo] || item.tipo}
        </span>
        <span class="historico-card__data">${formatarData(item.criado_em)}</span>
      </span>
    </div>
    <button class="historico-card__btn" title="Buscar novamente">
      <i data-lucide="arrow-right"></i>
    </button>
  `

  // Clique no card ou no botão — repete a busca
  card.addEventListener("click", () => {
    const url = `${PAGINA[item.tipo]}?tipo=${item.tipo}&q=${encodeURIComponent(item.termo)}`
    window.location.href = url
  })

  return card
}

// Carrega e renderiza o histórico
async function carregarHistorico() {
  try {
    await new Promise(resolve => setTimeout(resolve, 400)) // skeleton mínimo
    const dados = await Api.buscarHistorico()

    ocultar(elLoading)

    if (!dados.historico || dados.historico.length === 0) {
      mostrar(elVazio)
      lucide.createIcons()
      return
    }

    dados.historico.forEach(item => {
      const card = criarCard(item)
      elLista.appendChild(card)
    })

    mostrar(elLista)
    lucide.createIcons()

  } catch (erro) {
    ocultar(elLoading)
    mostrar(elVazio)
    lucide.createIcons()
  }
}

// Limpar histórico — chama DELETE no backend
btnLimpar.addEventListener("click", async () => {
  if (!confirm("Limpar todo o histórico?")) return

  try {
    await fetch(`${CONFIG.API_URL}/api/historico`, { method: "DELETE" })
    elLista.innerHTML = ""
    ocultar(elLista)
    mostrar(elVazio)
    lucide.createIcons()
  } catch (e) {
    alert("Erro ao limpar histórico.")
  }
})

carregarHistorico()
