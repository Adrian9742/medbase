import httpx

# ─────────────────────────────────────────
#  CONFIGURAÇÃO
# ─────────────────────────────────────────

URL_MYMEMORY     = "https://api.mymemory.translated.net/get"
TIMEOUT_SEGUNDOS = 8
MAX_CHARS        = 150  # só traduz campos curtos — nomes, títulos

# Cache em memória — evita rechamar a API para o mesmo texto
_cache: dict[str, str] = {}


# ─────────────────────────────────────────
#  FUNÇÃO PRINCIPAL
# ─────────────────────────────────────────

async def traduzir(texto: str) -> str:
    """
    Traduz um texto curto de EN para PT-BR via MyMemory API.

    Regras:
    - Só traduz textos até MAX_CHARS caracteres (nomes, títulos)
    - Usa cache para não repetir chamadas
    - Retorna o texto original em caso de falha (fallback seguro)
    - Nunca quebra o fluxo — erros são silenciosos
    """

    if not texto or not texto.strip():
        return texto

    # Não traduz textos longos — para esses usar Wikipedia PT diretamente
    if len(texto) > MAX_CHARS:
        return texto

    # Retorna do cache se já foi traduzido antes
    if texto in _cache:
        return _cache[texto]

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS) as cliente:
            resposta = await cliente.get(URL_MYMEMORY, params={
                "q":        texto,
                "langpair": "en|pt-br",
            })

            if resposta.status_code != 200:
                return texto  # fallback: retorna original

            dados = resposta.json()
            traducao = dados.get("responseData", {}).get("translatedText", "")

            # MyMemory retorna "PLEASE SELECT TWO DISTINCT LANGUAGES" em caso de erro
            if not traducao or "PLEASE SELECT" in traducao.upper():
                return texto

            _cache[texto] = traducao
            return traducao

    except Exception:
        return texto  # fallback seguro — nunca quebra a página
