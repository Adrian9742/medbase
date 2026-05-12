from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.models import salvar_historico, buscar_historico, limpar_historico

router = APIRouter(prefix="/api", tags=["Histórico"])


class ItemHistorico(BaseModel):
    termo: str
    tipo:  str


@router.get("/historico")
async def rota_buscar_historico():
    try:
        return {"historico": await buscar_historico()}
    except Exception:
        raise HTTPException(status_code=503, detail={"mensagem": "Erro ao buscar histórico.", "code": "ERRO_INTERNO"})


@router.post("/historico")
async def rota_salvar_historico(item: ItemHistorico):
    if not item.termo or not item.tipo:
        raise HTTPException(status_code=400, detail={"mensagem": "Dados inválidos.", "code": "DADOS_INVALIDOS"})
    try:
        await salvar_historico(item.termo, item.tipo)
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=503, detail={"mensagem": "Erro ao salvar histórico.", "code": "ERRO_INTERNO"})


@router.delete("/historico")
async def rota_limpar_historico():
    try:
        await limpar_historico()
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=503, detail={"mensagem": "Erro ao limpar histórico.", "code": "ERRO_INTERNO"})
