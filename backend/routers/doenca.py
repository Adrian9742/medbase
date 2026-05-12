from fastapi import APIRouter, HTTPException
from services.wikipedia import buscar_artigo

router = APIRouter(prefix="/api", tags=["Doenças"])


@router.get("/doenca/{nome}")
async def rota_doenca(nome: str):

    if not nome or not nome.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Nome da doença não informado.", "code": "NOME_VAZIO"}
        )

    try:
        # tipo="doenca" → busca com contexto "doença/disease"
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

    resultado["tipo"] = "doenca"
    return resultado
