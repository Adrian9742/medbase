// ─────────────────────────────────────────
//  MEDBASE — historia.js
// ─────────────────────────────────────────

const elLoading     = document.getElementById("loading")
const elErro        = document.getElementById("erro")
const elResultado   = document.getElementById("resultado")
const elAvisoIdioma = document.getElementById("h-aviso-idioma")

function mostrar(el) { el.classList.remove("oculto") }
function ocultar(el) { el.classList.add("oculto") }

function mostrarErro(msg) {
  ocultar(elLoading)
  document.getElementById("erroMensagem").textContent = msg
  mostrar(elErro)
}

async function buscarDados(termo) {
  const cache      = sessionStorage.getItem("medbase_resultado")
  const cacheTermo = sessionStorage.getItem("medbase_termo")

  if (cache && cacheTermo === termo) {
    sessionStorage.removeItem("medbase_resultado")
    return JSON.parse(cache)
  }

  return await Api.buscarHistoria(termo)
}

async function iniciar() {
  const params = new URLSearchParams(window.location.search)
  const termo  = params.get("q")

  if (!termo) { mostrarErro("Parâmetro de busca inválido."); return }

  try {
    const [dados] = await Promise.all([
      buscarDados(termo),
      new Promise(resolve => setTimeout(resolve, 400))
    ])

    document.title = `MedBase — ${dados.titulo}`
    document.getElementById("h-titulo").textContent = dados.titulo
    document.getElementById("h-resumo").textContent = dados.resumo
    document.getElementById("h-link").href          = dados.link_wikipedia

    if (dados.idioma === "en") mostrar(elAvisoIdioma)

    if (dados.imagem_url) {
      const img = document.getElementById("h-imagem")
      img.src = dados.imagem_url
      img.style.display = "block"
      img.onerror = () => img.style.display = "none"
    }

    ocultar(elLoading)
    mostrar(elResultado)
    lucide.createIcons()

  } catch (erro) {
    mostrarErro(erro.message || "Não foi possível obter o resultado.")
  }
}

iniciar()
