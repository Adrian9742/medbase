from fastapi import APIRouter, HTTPException
from services.pubchem import buscar_por_formula

router = APIRouter(prefix="/api", tags=["Fórmulas"])


@router.get("/formula/{formula}")
async def rota_formula(formula: str):

    # Validação: fórmula não pode ser vazia ou só espaços
    if not formula or not formula.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Fórmula não informada.", "code": "FORMULA_VAZIA"}
        )

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

    return resultado
