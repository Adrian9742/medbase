from fastapi import APIRouter, HTTPException, Request
from services.openfda import buscar_medicamento
from services.traducao import traduzir
from services import cache
from limiter import limiter

router = APIRouter(prefix="/api", tags=["Medicamentos"])


@router.get("/medicamento/{nome}")
@limiter.limit("10/minute")
async def rota_medicamento(request: Request, nome: str):

    if not nome or not nome.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Nome do medicamento não informado.", "code": "NOME_VAZIO"}
        )

    chave = f"medicamento:{nome.lower().strip()}"
    cached = cache.get(chave)
    if cached:
        return cached

    try:
        resultado = await buscar_medicamento(nome)
    except Exception:
        raise HTTPException(
            status_code=503,
            detail={"mensagem": "Serviço OpenFDA temporariamente indisponível.", "code": "API_INDISPONIVEL"}
        )

    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail={
                "mensagem": f"Medicamento '{nome}' não encontrado. Tente o nome em inglês.",
                "code": "MEDICAMENTO_NAO_ENCONTRADO"
            }
        )

    resultado["nome_generico_pt"] = await traduzir(resultado.get("nome_generico", ""))
    resultado["nome_marca_pt"]    = await traduzir(resultado.get("nome_marca", ""))
    resultado["fabricante_pt"]    = await traduzir(resultado.get("fabricante", ""))

    cache.set(chave, resultado)
    return resultado
