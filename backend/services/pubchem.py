import httpx
import asyncio

# ─────────────────────────────────────────
#  CONFIGURAÇÃO
# ─────────────────────────────────────────

URL_BASE_PUBCHEM = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
TIMEOUT_SEGUNDOS = 15
TENTATIVAS_POLLING = 5       # quantas vezes tenta buscar o resultado
ESPERA_POLLING    = 2        # segundos entre cada tentativa


# ─────────────────────────────────────────
#  FUNÇÕES AUXILIARES
# ─────────────────────────────────────────

def limpar_formula(formula: str) -> str:
    """Remove espaços e converte para maiúsculas. Ex: 'c6 h12 o6' → 'C6H12O6'"""
    return formula.replace(" ", "").upper()


def pegar_campo(dados, *chaves):
    """
    Tenta pegar um campo dentro de um dicionário aninhado com segurança.
    Se qualquer chave não existir, retorna 'Informação não disponível'.
    """
    atual = dados
    for chave in chaves:
        try:
            atual = atual[chave]
        except (KeyError, IndexError, TypeError):
            return "Informação não disponível"
    return atual


async def buscar_cid_com_polling(cliente: httpx.AsyncClient, formula: str) -> int | None:
    """
    A PubChem pode não responder na hora para fórmulas com muitos compostos.
    Nesse caso ela retorna {"Waiting": {"ListKey": "..."}} e precisamos
    ficar perguntando até o resultado ficar pronto.

    Essa função cuida disso automaticamente.
    """

    # Primeira tentativa
    resposta = await cliente.get(
        f"{URL_BASE_PUBCHEM}/compound/formula/{formula}/cids/JSON"
    )

    if resposta.status_code == 404:
        return None

    resposta.raise_for_status()
    dados = resposta.json()

    # Caso 1: resposta veio na hora
    if "IdentifierList" in dados:
        return pegar_campo(dados, "IdentifierList", "CID", 0)

    # Caso 2: PubChem está processando — precisamos fazer polling
    if "Waiting" in dados:
        list_key = pegar_campo(dados, "Waiting", "ListKey")

        for tentativa in range(TENTATIVAS_POLLING):
            await asyncio.sleep(ESPERA_POLLING)  # espera antes de tentar de novo

            resposta_poll = await cliente.get(
                f"{URL_BASE_PUBCHEM}/compound/listkey/{list_key}/cids/JSON"
            )

            if resposta_poll.status_code == 404:
                return None

            dados_poll = resposta_poll.json()

            if "IdentifierList" in dados_poll:
                return pegar_campo(dados_poll, "IdentifierList", "CID", 0)

            # Se ainda está "Waiting", continua tentando
            if "Waiting" not in dados_poll:
                break  # resposta inesperada — para

    return None  # não conseguiu obter o CID


# ─────────────────────────────────────────
#  FUNÇÃO PRINCIPAL
# ─────────────────────────────────────────

async def buscar_por_formula(formula: str) -> dict | None:
    """
    Recebe uma fórmula química (ex: 'C6H12O6') e retorna um dicionário
    com as informações do composto vindas da PubChem.

    Retorna None se a fórmula não for encontrada.
    Lança uma exceção se a API estiver fora do ar.
    """

    formula = limpar_formula(formula)

    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:

        # ── Passo 1: buscar o CID (identificador do composto na PubChem) ──
        cid = await buscar_cid_com_polling(cliente, formula)

        if cid is None or cid == "Informação não disponível":
            return None

        # ── Passo 2: buscar propriedades do composto usando o CID ──
        resposta_props = await cliente.get(
            f"{URL_BASE_PUBCHEM}/compound/cid/{cid}/property/"
            "MolecularFormula,MolecularWeight,IUPACName/JSON"
        )
        resposta_props.raise_for_status()
        dados_props = resposta_props.json()
        props = pegar_campo(dados_props, "PropertyTable", "Properties", 0)

        # ── Passo 3: buscar sinônimos (nomes alternativos do composto) ──
        resposta_sinonimos = await cliente.get(
            f"{URL_BASE_PUBCHEM}/compound/cid/{cid}/synonyms/JSON"
        )
        sinonimos = []
        if resposta_sinonimos.status_code == 200:
            dados_sin = resposta_sinonimos.json()
            lista = pegar_campo(dados_sin, "InformationList", "Information", 0, "Synonym")
            if isinstance(lista, list):
                sinonimos = lista[:5]

        # ── Passo 4: montar e retornar o resultado final ──
        return {
            "tipo": "formula",
            "cid": cid,
            "nome": pegar_campo(props, "IUPACName") if isinstance(props, dict) else "Informação não disponível",
            "formula": pegar_campo(props, "MolecularFormula") if isinstance(props, dict) else formula,
            "peso_molecular": pegar_campo(props, "MolecularWeight") if isinstance(props, dict) else "Informação não disponível",
            "sinonimos": sinonimos,
            "imagem_url": f"{URL_BASE_PUBCHEM}/compound/cid/{cid}/PNG",
            "link_pubchem": f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}",
        }
