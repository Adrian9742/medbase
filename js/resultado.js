// ─────────────────────────────────────────
//  MEDBASE — resultado.js
// ─────────────────────────────────────────

const elLoading              = document.getElementById("loading")
const elErro                 = document.getElementById("erro")
const elErroMensagem         = document.getElementById("erroMensagem")
const elResultadoFormula     = document.getElementById("resultadoFormula")
const elResultadoMedicamento = document.getElementById("resultadoMedicamento")

function mostrar(el) { el.classList.remove("oculto") }
function ocultar(el) { el.classList.add("oculto") }

function mostrarErro(mensagem) {
  ocultar(elLoading)
  elErroMensagem.textContent = mensagem
  mostrar(elErro)
}

function preencherFormula(dados) {
  document.title = `MedBase — ${dados.formula}`
  document.getElementById("f-nome").textContent           = dados.nome
  document.getElementById("f-formula").textContent        = dados.formula
  document.getElementById("f-formula-tabela").textContent = dados.formula
  document.getElementById("f-peso").textContent           = dados.peso_molecular + " g/mol"
  document.getElementById("f-cid").textContent            = dados.cid
  document.getElementById("f-link").href                  = dados.link_pubchem

  const img = document.getElementById("f-imagem")
  img.src = dados.imagem_url
  img.onerror = () => img.style.display = "none"

  const elSinonimos = document.getElementById("f-sinonimos")
  if (dados.sinonimos && dados.sinonimos.length > 0) {
    dados.sinonimos.forEach(sin => {
      const tag = document.createElement("span")
      tag.className = "sinonimo-tag"
      tag.textContent = sin
      elSinonimos.appendChild(tag)
    })
  } else {
    elSinonimos.style.display = "none"
  }

  mostrar(elResultadoFormula)
}

function preencherMedicamento(dados) {
  document.title = `MedBase — ${dados.nome_generico_pt || dados.nome_generico}`

  // Usa nome traduzido se disponível, senão usa original
  document.getElementById("m-nome").textContent =
    dados.nome_generico_pt || dados.nome_generico

  document.getElementById("m-fabricante").textContent =
    dados.fabricante_pt || dados.fabricante

  // Preenche e oculta acordeons com campos vazios
  const camposMedicamento = [
    { id: "m-indicacoes",     valor: dados.indicacoes,       accId: "acc-indicacoes"      },
    { id: "m-dosagem",        valor: dados.dosagem,           accId: "acc-dosagem"         },
    { id: "m-avisos",         valor: dados.avisos,            accId: "acc-avisos"          },
    { id: "m-contraindicacoes", valor: dados.contraindicacoes, accId: "acc-contraindicacoes" },
    { id: "m-efeitos",        valor: dados.efeitos_adversos,  accId: "acc-efeitos"         },
  ]

  let primeiroAberto = false
  camposMedicamento.forEach(({ id, valor, accId }) => {
    const elCampo = document.getElementById(id)
    const elAcc   = document.getElementById(accId)
    const vazio   = !valor || valor === "Informação não disponível"

    if (vazio && elAcc) {
      elAcc.style.display = "none"  // oculta acordeon vazio
    } else {
      if (elCampo) elCampo.textContent = valor
      // Abre o primeiro acordeon com conteúdo
      if (!primeiroAberto && elAcc) {
        elAcc.classList.add("aberto")
        primeiroAberto = true
      }
    }
  })

  mostrar(elResultadoMedicamento)
}

document.querySelectorAll(".accordion__cabecalho").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".accordion").classList.toggle("aberto")
  })
})

async function buscarDados(tipo, termo) {
  const cache      = sessionStorage.getItem("medbase_resultado")
  const cacheTipo  = sessionStorage.getItem("medbase_tipo")
  const cacheTermo = sessionStorage.getItem("medbase_termo")

  if (cache && cacheTipo === tipo && cacheTermo === termo) {
    sessionStorage.removeItem("medbase_resultado")
    return JSON.parse(cache)
  }

  return tipo === "formula"
    ? await Api.buscarFormula(termo)
    : await Api.buscarMedicamento(termo)
}

async function iniciar() {
  const params = new URLSearchParams(window.location.search)
  const tipo   = params.get("tipo")
  const termo  = params.get("q")

  if (!tipo || !termo) { mostrarErro("Parâmetros inválidos."); return }

  try {
    // Skeleton visível por pelo menos 700ms
    const [dados] = await Promise.all([
      buscarDados(tipo, termo),
      new Promise(resolve => setTimeout(resolve, 400))
    ])

    ocultar(elLoading)

    if (tipo === "formula")     preencherFormula(dados)
    else                        preencherMedicamento(dados)

    lucide.createIcons()

  } catch (erro) {
    mostrarErro(erro.message || "Não foi possível obter o resultado.")
  }
}

iniciar()
