import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.models import salvar_historico, buscar_historico, limpar_historico

router = APIRouter(prefix="/api", tags=["Histórico"])

TIPOS_VALIDOS = {"formula", "medicamento", "doenca", "historia"}


def _sanitizar(texto: str) -> str:
    return re.sub(r'[<>"\';&]', '', texto).strip()[:100]


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
    termo = _sanitizar(item.termo)
    tipo  = _sanitizar(item.tipo)

    if not termo or tipo not in TIPOS_VALIDOS:
        raise HTTPException(status_code=400, detail={"mensagem": "Dados inválidos.", "code": "DADOS_INVALIDOS"})

    try:
        await salvar_historico(termo, tipo)
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
