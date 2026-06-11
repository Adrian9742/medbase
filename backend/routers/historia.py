from fastapi import APIRouter, HTTPException, Request
from services.wikipedia import buscar_artigo
from services.traducao import traduzir_resumo
from services import cache
from limiter import limiter

router = APIRouter(prefix="/api", tags=["História"])


@router.get("/historia/{termo}")
@limiter.limit("10/minute")
async def rota_historia(request: Request, termo: str):

    if not termo or not termo.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Termo não informado.", "code": "NOME_VAZIO"}
        )

    chave = f"historia:{termo.lower().strip()}"
    cached = cache.get(chave)
    if cached:
        return cached

    try:
        resultado = await buscar_artigo(termo, tipo="historia")
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={"mensagem": "Serviço temporariamente indisponível.", "code": "API_INDISPONIVEL"}
        )

    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail={"mensagem": f"'{termo}' não encontrado.", "code": "NAO_ENCONTRADO"}
        )

    if resultado.get("idioma") == "en" and resultado.get("resumo"):
        resultado["resumo"] = await traduzir_resumo(resultado["resumo"])

    resultado["tipo"] = "historia"
    cache.set(chave, resultado)
    return resultado
