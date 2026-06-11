from fastapi import APIRouter, HTTPException, Request
from services.pubchem import buscar_por_formula
from services import cache
from limiter import limiter

router = APIRouter(prefix="/api", tags=["Fórmulas"])


@router.get("/formula/{formula}")
@limiter.limit("10/minute")
async def rota_formula(request: Request, formula: str):

    if not formula or not formula.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Fórmula não informada.", "code": "FORMULA_VAZIA"}
        )

    chave = f"formula:{formula.upper().replace(' ', '')}"
    cached = cache.get(chave)
    if cached:
        return cached

    try:
        resultado = await buscar_por_formula(formula)
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={"mensagem": "Serviço PubChem temporariamente indisponível.", "code": "API_INDISPONIVEL"}
        )

    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail={"mensagem": f"Fórmula '{formula}' não encontrada.", "code": "FORMULA_NAO_ENCONTRADA"}
        )

    cache.set(chave, resultado)
    return resultado
