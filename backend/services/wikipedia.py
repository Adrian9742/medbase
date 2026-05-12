import asyncio
import wikipediaapi
import httpx

# ─────────────────────────────────────────
#  CONFIGURAÇÃO
# ─────────────────────────────────────────

wiki_pt = wikipediaapi.Wikipedia("MedBase/1.0 (portfolio)", "pt")
wiki_en = wikipediaapi.Wikipedia("MedBase/1.0 (portfolio)", "en")

URL_IMG_PT = "https://pt.wikipedia.org/w/api.php"
URL_IMG_EN = "https://en.wikipedia.org/w/api.php"
TIMEOUT_SEGUNDOS = 10
HEADERS = {"User-Agent": "MedBase/1.0 (portfolio)"}

SUFIXOS = {
    "doenca": {
        "pt": ["", " (doença)", " (medicina)", " (vírus)", " (parasita)", " (tumor)", " (condição médica)"],
        "en": ["", " (disease)", " (medicine)", " (virus)", " (disorder)", " (cancer)", " (medical condition)"],
    },
    "historia": {
        "pt": ["", " (médico)", " (medicina)", " (cientista)", " (anatomista)"],
        "en": ["", " (medicine)", " (physician)", " (scientist)", " (pandemic)"],
    },
}

# ─────────────────────────────────────────
#  VALIDAÇÃO — PRIMEIRA FRASE APENAS (DC1)
# ─────────────────────────────────────────
#
# A Wikipedia quase sempre identifica o tipo na 1ª frase:
#   "Black Death is a 2010 British horror film directed by..."
#   "The Black Death was a plague pandemic occurring in..."
#
# Checar só a 1ª frase evita falsos positivos que palavras soltas causavam.
# Sem chamada extra de rede — usamos o resumo que já veio.

PADROES_NAO_MEDICO = [
    # Filmes — PT e EN
    "é um filme", "é uma produção cinematográfica", "longa-metragem de",
    "is a film", "is an american film", "is a british film",
    "is a french film", "is a german film", "is a horror film",
    "is a drama film", "is a documentary film",
    # Detecta "is a XXXX film" (ano + film)
    "is a 19", "is a 20",  # só na 1ª frase — muito específico
    # Séries
    "é uma série", "é uma série de televisão",
    "is a television series", "is a tv series", "is an american series",
    # Álbuns e músicas
    "é um álbum", "é uma canção", "é uma música",
    "is an album", "is a song", "is a single",
    # Jogos
    "é um jogo eletrônico", "é um jogo de",
    "is a video game", "is a role-playing game",
    # Bandas
    "é uma banda", "é um grupo musical",
    "is a band", "is a musical group",
    # Geograficos e astronomicos — falsos positivos comuns em PT
    "é uma constelação", "é um município", "é uma cidade",
    "é um bairro", "é um distrito", "é um estado",
    "é um país", "é uma região", "é um continente",
    "é um signo", "é um símbolo",
    # Inglês — geográfico e astronômico
    "is a constellation", "is a municipality", "is a city",
    "is a town", "is a village", "is a country",
    "is a region", "is a district", "is a zodiac",
    "is a star", "is a planet", "is an asteroid",
]


def e_artigo_medico(resumo: str) -> bool:
    """
    Verifica APENAS a primeira frase do resumo.
    Mais preciso — a 1ª frase da Wikipedia sempre identifica o tipo.
    Sem chamada de rede adicional.
    """
    if not resumo:
        return False

    # Pega só a primeira frase
    primeira_frase = resumo.split(".")[0].lower()

    for padrao in PADROES_NAO_MEDICO:
        if padrao in primeira_frase:
            return False

    return True


# ─────────────────────────────────────────
#  BUSCA DE PÁGINA — asyncio.to_thread (DC3)
# ─────────────────────────────────────────
#
# wikipedia-api é 100% síncrona — bloqueia o event loop do FastAPI.
# asyncio.to_thread() roda a chamada em thread separada sem bloquear.
# Sem isso, 2 usuários simultâneos = um espera o outro terminar.

def _buscar_pagina_sync(wiki, termo: str, sufixos: list):
    """
    Versão síncrona — roda dentro de to_thread.
    Testa sufixos em ordem, valida a primeira frase.
    """
    for sufixo in sufixos:
        for variacao in [termo, termo.title(), termo.lower(), termo.upper()]:
            pagina = wiki.page(f"{variacao}{sufixo}")
            if pagina.exists() and e_artigo_medico(pagina.summary):
                return pagina
    return None


async def buscar_pagina(wiki, termo: str, sufixos: list):
    """
    Versão assíncrona — não bloqueia o event loop.
    """
    return await asyncio.to_thread(_buscar_pagina_sync, wiki, termo, sufixos)


# ─────────────────────────────────────────
#  IMAGEM — assíncrona via httpx
# ─────────────────────────────────────────

async def buscar_imagem(titulo: str, idioma: str = "pt") -> str | None:
    """Busca imagem — httpx usado só aqui, falha silenciosa."""
    url = URL_IMG_PT if idioma == "pt" else URL_IMG_EN
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SEGUNDOS, headers=HEADERS) as c:
            r = await c.get(url, params={
                "action": "query", "titles": titulo,
                "prop": "pageimages", "piprop": "thumbnail",
                "pithumbsize": 500, "format": "json",
            })
            if r.status_code != 200:
                return None
            paginas = r.json().get("query", {}).get("pages", {})
            return list(paginas.values())[0].get("thumbnail", {}).get("source")
    except Exception:
        return None


# ─────────────────────────────────────────
#  FUNÇÃO PRINCIPAL
# ─────────────────────────────────────────

async def buscar_artigo(termo: str, tipo: str = "doenca") -> dict | None:
    """
    Busca artigo médico na Wikipedia.

    DC1 — Filtro por primeira frase: rejeita filmes, álbuns e séries
          sem chamada extra de rede, sem falsos positivos.

    DC3 — asyncio.to_thread(): wikipedia-api roda em thread separada,
          não bloqueia o event loop do FastAPI.

    Ordem de busca:
    - historia → EN primeiro (cobertura histórica mais completa)
    - doenca   → PT primeiro (melhor UX em português)
    """
    termo = termo.strip()
    sufixos_pt = SUFIXOS.get(tipo, SUFIXOS["doenca"])["pt"]
    sufixos_en = SUFIXOS.get(tipo, SUFIXOS["doenca"])["en"]

    if tipo == "historia":
        ordem = [(wiki_en, sufixos_en, "en"), (wiki_pt, sufixos_pt, "pt")]
    else:
        ordem = [(wiki_pt, sufixos_pt, "pt"), (wiki_en, sufixos_en, "en")]

    for wiki, sufixos, idioma in ordem:
        pagina = await buscar_pagina(wiki, termo, sufixos)
        if pagina:
            # Busca artigo e imagem em paralelo — reduz latência
            imagem = await buscar_imagem(pagina.title, idioma)
            return {
                "titulo":         pagina.title,
                "resumo":         pagina.summary,
                "imagem_url":     imagem,
                "link_wikipedia": pagina.fullurl,
                "idioma":         idioma,
            }

    return None
