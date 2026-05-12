import httpx

# ─────────────────────────────────────────
#  CONFIGURAÇÃO
# ─────────────────────────────────────────

URL_BASE_OPENFDA = "https://api.fda.gov/drug/label.json"
TIMEOUT_SEGUNDOS = 10


# ─────────────────────────────────────────
#  FUNÇÕES AUXILIARES
# ─────────────────────────────────────────

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


def extrair_texto(campo) -> str:
    """
    A OpenFDA retorna vários campos como lista de strings (ex: ["Texto aqui..."]).
    Essa função pega o primeiro item da lista, ou retorna 'Informação não disponível'.
    """
    if isinstance(campo, list) and len(campo) > 0:
        return campo[0]
    if isinstance(campo, str):
        return campo
    return "Informação não disponível"


# ─────────────────────────────────────────
#  FUNÇÃO PRINCIPAL
# ─────────────────────────────────────────

async def buscar_medicamento(nome: str) -> dict | None:
    """
    Recebe o nome de um medicamento (ex: 'aspirin') e retorna um dicionário
    com as informações vindas da OpenFDA.

    Retorna None se o medicamento não for encontrado.
    Lança uma exceção se a API estiver fora do ar.
    """

    nome = nome.strip()

    async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:

        # ── Passo 1: buscar pelo nome genérico ──
        resposta = await cliente.get(
            URL_BASE_OPENFDA,
            params={
                "search": f'openfda.generic_name:"{nome}"',
                "limit": 1,
            }
        )

        # ── Passo 2: se não achou pelo nome genérico, tenta pelo nome de marca ──
        if resposta.status_code == 404:
            resposta = await cliente.get(
                URL_BASE_OPENFDA,
                params={
                    "search": f'openfda.brand_name:"{nome}"',
                    "limit": 1,
                }
            )

        # ── Passo 3: se ainda não achou, tenta busca livre ──
        if resposta.status_code == 404:
            resposta = await cliente.get(
                URL_BASE_OPENFDA,
                params={
                    "search": nome,
                    "limit": 1,
                }
            )

        if resposta.status_code == 404:
            return None  # medicamento realmente não encontrado

        resposta.raise_for_status()
        dados = resposta.json()

        resultados = pegar_campo(dados, "results")
        if not isinstance(resultados, list) or len(resultados) == 0:
            return None

        remedio = resultados[0]
        openfda = pegar_campo(remedio, "openfda")

        # ── Passo 4: extrair campos da bula ──
        nome_generico = extrair_texto(pegar_campo(openfda, "generic_name"))
        nome_marca    = extrair_texto(pegar_campo(openfda, "brand_name"))
        fabricante    = extrair_texto(pegar_campo(openfda, "manufacturer_name"))

        indicacoes        = extrair_texto(pegar_campo(remedio, "indications_and_usage"))
        contraindicacoes  = extrair_texto(pegar_campo(remedio, "contraindications"))
        efeitos_adversos  = extrair_texto(pegar_campo(remedio, "adverse_reactions"))
        dosagem           = extrair_texto(pegar_campo(remedio, "dosage_and_administration"))
        avisos            = extrair_texto(pegar_campo(remedio, "warnings"))

        # ── Passo 5: montar e retornar o resultado final ──
        return {
            "tipo": "medicamento",
            "nome_generico": nome_generico,
            "nome_marca": nome_marca,
            "fabricante": fabricante,
            "indicacoes": indicacoes,
            "contraindicacoes": contraindicacoes,
            "efeitos_adversos": efeitos_adversos,
            "dosagem": dosagem,
            "avisos": avisos,
        }
