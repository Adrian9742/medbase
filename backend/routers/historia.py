from fastapi import APIRouter, HTTPException
from services.wikipedia import buscar_artigo

router = APIRouter(prefix="/api", tags=["História"])


@router.get("/historia/{termo}")
async def rota_historia(termo: str):

    if not termo or not termo.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Termo não informado.", "code": "NOME_VAZIO"}
        )

    try:
        # tipo="historia" → busca com contexto "medicina/medicine"
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

    resultado["tipo"] = "historia"
    return resultado
