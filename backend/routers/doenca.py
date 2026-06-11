from fastapi import APIRouter, HTTPException, Request
from services.wikipedia import buscar_artigo
from services.traducao import traduzir_resumo
from services import cache
from limiter import limiter

router = APIRouter(prefix="/api", tags=["Doenças"])


@router.get("/doenca/{nome}")
@limiter.limit("10/minute")
async def rota_doenca(request: Request, nome: str):

    if not nome or not nome.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Nome da doença não informado.", "code": "NOME_VAZIO"}
        )

    chave = f"doenca:{nome.lower().strip()}"
    cached = cache.get(chave)
    if cached:
        return cached

    try:
        resultado = await buscar_artigo(nome, tipo="doenca")
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={"mensagem": "Serviço temporariamente indisponível.", "code": "API_INDISPONIVEL"}
        )

    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail={"mensagem": f"Doença '{nome}' não encontrada.", "code": "NAO_ENCONTRADO"}
        )

    if resultado.get("idioma") == "en" and resultado.get("resumo"):
        resultado["resumo"] = await traduzir_resumo(resultado["resumo"])

    resultado["tipo"] = "doenca"
    cache.set(chave, resultado)
    return resultado
