// ─────────────────────────────────────────
//  MEDBASE — busca.js (Fase 2)
// ─────────────────────────────────────────

const campoBusca      = document.getElementById("campoBusca")
const btnBuscar       = document.getElementById("btnBuscar")
const exemplos        = document.getElementById("exemplos")
const mensagemErro    = document.getElementById("mensagemErro")
const botooesTipo     = document.querySelectorAll(".busca__tipo")
const cardFormula     = document.getElementById("cardFormula")
const cardMedicamento = document.getElementById("cardMedicamento")
const cardDoenca      = document.getElementById("cardDoenca")
const cardHistoria    = document.getElementById("cardHistoria")
const secaoHistorico  = document.getElementById("secaoHistorico")
const listaHistorico  = document.getElementById("listaHistorico")

let tipoAtual = "formula"

const EXEMPLOS = {
  formula:     ["C6H12O6", "C2H5OH", "H2O", "C8H10N4O2"],
  medicamento: ["Aspirin", "Ibuprofen", "Acetaminophen", "Amoxicillin"],
  doenca:      ["Diabetes", "Malaria", "Tuberculosis", "Influenza"],
  historia:    ["Hippocrates", "Black Death", "Penicillin", "Galen"]
}

const PLACEHOLDER = {
  formula:     "Ex: C6H12O6",
  medicamento: "Ex: Aspirin",
  doenca:      "Ex: Diabetes",
  historia:    "Ex: Hippocrates"
}

const PAGINA_DESTINO = {
  formula:     "resultado.html",
  medicamento: "resultado.html",
  doenca:      "doenca.html",
  historia:    "historia.html"
}

const CARDS = {
  formula:     cardFormula,
  medicamento: cardMedicamento,
  doenca:      cardDoenca,
  historia:    cardHistoria
}

// ── Funções ──────────────────────────────

function atualizarExemplos() {
  exemplos.querySelectorAll(".exemplo-tag").forEach(el => el.remove())
  EXEMPLOS[tipoAtual].forEach(termo => {
    const tag = document.createElement("button")
    tag.className = "exemplo-tag"
    tag.textContent = termo
    tag.addEventListener("click", () => { campoBusca.value = termo; campoBusca.focus() })
    exemplos.appendChild(tag)
  })
  campoBusca.placeholder = PLACEHOLDER[tipoAtual]
}

function atualizarCards() {
  Object.entries(CARDS).forEach(([tipo, card]) => {
    if (card) card.style.borderColor = tipo === tipoAtual ? "var(--cor-azul)" : ""
  })
}

function mostrarErro(msg) {
  mensagemErro.textContent = msg
  mensagemErro.classList.remove("oculto")
  setTimeout(() => mensagemErro.classList.add("oculto"), 5000)
}

function resetarBotao() {
  btnBuscar.disabled = false
  btnBuscar.textContent = "Buscar →"
}

// ── Histórico ────────────────────────────

const ICONE_TIPO = { formula:"formula", medicamento:"med", doenca:"doença", historia:"hist" }

async function carregarHistorico() {
  try {
    const dados = await Api.buscarHistorico()
    if (!dados.historico || dados.historico.length === 0) return

    secaoHistorico.classList.remove("oculto")
    listaHistorico.innerHTML = ""

    dados.historico.forEach(item => {
      const btn = document.createElement("button")
      btn.className = "exemplo-tag"
      btn.style.padding = "6px 14px"
      btn.innerHTML = `${ICONE_TIPO[item.tipo] || "🔍"} ${item.termo}`
      btn.addEventListener("click", () => {
        // Seleciona o tipo correto e preenche o campo
        botooesTipo.forEach(b => b.classList.remove("ativo"))
        const btnTipo = document.querySelector(`[data-tipo="${item.tipo}"]`)
        if (btnTipo) btnTipo.classList.add("ativo")
        tipoAtual = item.tipo
        campoBusca.value = item.termo
        atualizarExemplos()
        atualizarCards()
        executarBusca()
      })
      listaHistorico.appendChild(btn)
    })
  } catch (e) {
    // Histórico é opcional — falha silenciosa
  }
}

// ── Busca ────────────────────────────────

async function executarBusca() {
  const termo = campoBusca.value.trim()

  if (!termo) {
    campoBusca.focus()
    campoBusca.style.borderColor = "var(--cor-vermelho)"
    setTimeout(() => campoBusca.style.borderColor = "", 1500)
    return
  }

  // Valida tamanho máximo — evita abusos e queries inválidas
  if (termo.length > 100) {
    mostrarErro("Termo muito longo. Máximo de 100 caracteres.")
    return
  }

  btnBuscar.disabled = true
  btnBuscar.textContent = "Buscando..."
  mensagemErro.classList.add("oculto")

  try {
    let dados
    if (tipoAtual === "formula")     dados = await Api.buscarFormula(termo)
    if (tipoAtual === "medicamento") dados = await Api.buscarMedicamento(termo)
    if (tipoAtual === "doenca")      dados = await Api.buscarDoenca(termo)
    if (tipoAtual === "historia")    dados = await Api.buscarHistoria(termo)

    // Salva no histórico
    await Api.salvarHistorico(termo, tipoAtual).catch(() => {})

    // Salva no sessionStorage para a página de destino usar
    sessionStorage.setItem("medbase_resultado", JSON.stringify(dados))
    sessionStorage.setItem("medbase_termo", termo)
    sessionStorage.setItem("medbase_tipo", tipoAtual)

    window.location.href = `${PAGINA_DESTINO[tipoAtual]}?tipo=${tipoAtual}&q=${encodeURIComponent(termo)}`

  } catch (erro) {
    resetarBotao()
    if (erro.message === "Failed to fetch") {
      mostrarErro("Não foi possível conectar ao servidor. Verifique se o backend está rodando.")
    } else {
      mostrarErro(erro.message || "Erro ao buscar. Tente novamente.")
    }
  }
}

// ── Eventos ──────────────────────────────

botooesTipo.forEach(btn => {
  btn.addEventListener("click", () => {
    botooesTipo.forEach(b => b.classList.remove("ativo"))
    btn.classList.add("ativo")
    tipoAtual = btn.dataset.tipo
    campoBusca.value = ""
    atualizarExemplos()
    atualizarCards()
  })
})

btnBuscar.addEventListener("click", executarBusca)
campoBusca.addEventListener("keydown", e => { if (e.key === "Enter") executarBusca() })

// Clique nos cards — seleciona o tipo automaticamente
Object.entries(CARDS).forEach(([tipo, card]) => {
  if (!card) return
  card.addEventListener("click", e => {
    e.preventDefault()
    botooesTipo.forEach(b => b.classList.remove("ativo"))
    const btnTipo = document.querySelector(`[data-tipo="${tipo}"]`)
    if (btnTipo) btnTipo.classList.add("ativo")
    tipoAtual = tipo
    atualizarExemplos()
    atualizarCards()
    campoBusca.focus()
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
})

// ── Inicialização ────────────────────────

atualizarExemplos()
atualizarCards()
carregarHistorico()
