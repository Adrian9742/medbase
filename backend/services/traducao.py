import os
import httpx

# ─────────────────────────────────────────
#  CONFIGURAÇÃO
# ─────────────────────────────────────────

# Chave lida do ambiente — nunca hardcoded no código
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY", "")

# Chaves terminando em :fx usam o endpoint gratuito
# Chaves sem :fx usam o endpoint Pro
URL_DEEPL = (
    "https://api-free.deepl.com/v2/translate"
    if DEEPL_API_KEY.endswith(":fx")
    else "https://api.deepl.com/v2/translate"
)

URL_MYMEMORY  = "https://api.mymemory.translated.net/get"
TIMEOUT       = 8
MAX_CHARS     = 150  # só traduz campos curtos — nomes e títulos

# Cache em memória — evita repetir chamadas para o mesmo texto
_cache: dict[str, str] = {}


# ─────────────────────────────────────────
#  DEEPL
# ─────────────────────────────────────────

async def _traduzir_deepl(texto: str) -> str | None:
    """
    Chama a API do DeepL.
    Retorna o texto traduzido ou None se falhar.
    """
    if not DEEPL_API_KEY:
        return None  # chave não configurada — cai para fallback

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as c:
            r = await c.post(
                URL_DEEPL,
                headers={"Authorization": f"DeepL-Auth-Key {DEEPL_API_KEY}"},
                json={
                    "text":        [texto],
                    "target_lang": "PT-BR",
                    "source_lang": "EN",
                }
            )
            if r.status_code != 200:
                return None
            dados = r.json()
            return dados["translations"][0]["text"]
    except Exception:
        return None


# ─────────────────────────────────────────
#  MYMEMORY — fallback
# ─────────────────────────────────────────

async def _traduzir_mymemory(texto: str) -> str | None:
    """Fallback gratuito sem chave."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as c:
            r = await c.get(URL_MYMEMORY, params={
                "q": texto, "langpair": "en|pt-br"
            })
            if r.status_code != 200:
                return None
            traducao = r.json().get("responseData", {}).get("translatedText", "")
            if not traducao or "PLEASE SELECT" in traducao.upper():
                return None
            return traducao
    except Exception:
        return None


# ─────────────────────────────────────────
#  FUNÇÃO PRINCIPAL
# ─────────────────────────────────────────

async def traduzir(texto: str) -> str:
    """
    Traduz texto curto EN → PT-BR.

    Ordem de prioridade:
    1. Cache (sem chamada de rede)
    2. DeepL (se DEEPL_API_KEY estiver configurada)
    3. MyMemory (fallback gratuito)
    4. Texto original (se tudo falhar — nunca quebra)

    Só traduz textos até MAX_CHARS caracteres.
    """
    if not texto or not texto.strip():
        return texto

    if len(texto) > MAX_CHARS:
        return texto  # textos longos não são traduzidos aqui

    # Retorna do cache se já traduzido
    if texto in _cache:
        return _cache[texto]

    # Tenta DeepL primeiro
    resultado = await _traduzir_deepl(texto)

    # Fallback para MyMemory se DeepL falhou
    if not resultado:
        resultado = await _traduzir_mymemory(texto)

    # Se tudo falhou, retorna o original
    if not resultado:
        return texto

    _cache[texto] = resultado
    return resultado


async def traduzir_resumo(texto: str) -> str:
    """
    Traduz resumos longos EN → PT-BR via DeepL.
    Só usa DeepL — MyMemory tem limite de caracteres por requisição.
    Se DeepL não estiver configurado ou falhar, retorna o original.
    Sem limite de caracteres — DeepL suporta textos longos.
    """
    if not texto or not texto.strip():
        return texto

    if not DEEPL_API_KEY:
        return texto  # sem chave, retorna original

    # Cache para resumos também
    chave_cache = f"resumo:{hash(texto)}"
    if chave_cache in _cache:
        return _cache[chave_cache]

    resultado = await _traduzir_deepl(texto)

    if resultado:
        _cache[chave_cache] = resultado
        return resultado

    return texto  # fallback seguro
