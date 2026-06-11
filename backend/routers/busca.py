import re
import asyncio
from fastapi import APIRouter, HTTPException, Request
from services.pubchem import buscar_por_formula
from services.openfda import buscar_medicamento
from services.wikipedia import buscar_artigo, e_pessoa_historica
from services.traducao import traduzir, traduzir_resumo
from services import cache
from limiter import limiter

router = APIRouter(prefix="/api", tags=["Busca"])

# Padrão de fórmula química: C6H12O6, H2O, NaCl, etc.
_FORMULA_RE = re.compile(r'^([A-Z][a-z]?\d*)+$')


async def _tentar_medicamento(termo: str):
    try:
        return await buscar_medicamento(termo)
    except Exception:
        return None


async def _tentar_doenca(termo: str):
    try:
        return await buscar_artigo(termo, tipo="doenca")
    except Exception:
        return None


async def _tentar_historia(termo: str):
    try:
        return await buscar_artigo(termo, tipo="historia")
    except Exception:
        return None


@router.get("/busca/{termo}")
@limiter.limit("15/minute")
async def busca_inteligente(request: Request, termo: str):

    if not termo or not termo.strip():
        raise HTTPException(
            status_code=400,
            detail={"mensagem": "Termo não informado.", "code": "NOME_VAZIO"}
        )

    termo = termo.strip()

    chave = f"busca:{termo.lower()}"
    cached = cache.get(chave)
    if cached:
        return cached

    # 1. Fórmula química — detectada por regex, sem chamada de rede desnecessária
    if _FORMULA_RE.match(termo):
        try:
            resultado = await buscar_por_formula(termo)
            if resultado:
                cache.set(chave, resultado)
                return resultado
        except Exception:
            pass

    # 2. Medicamento, doença e história em paralelo — reduz latência
    # Prioridade: doença > medicamento > história
    # (termos como "Diabetes" são doenças — não devem cair em medicamento primeiro)
    medicamento, doenca, historia = await asyncio.gather(
        _tentar_medicamento(termo),
        _tentar_doenca(termo),
        _tentar_historia(termo),
    )

    # Medicamento com nome diretamente relacionado ao termo → prioridade alta
    # Ex: buscar "Aspirina" acha "ASPIRIN" — match direto → preferir medicamento
    # Ex: buscar "Diabetes" acha "DayQuil for Diabetes" — match tangencial → preferir doença
    if medicamento and doenca:
        t = termo.lower()
        nome_gen = medicamento.get("nome_generico", "").lower()
        nome_marca = medicamento.get("nome_marca", "").lower()
        match_direto = t in nome_gen or nome_gen[:len(t)] in t or t in nome_marca
        if not match_direto:
            medicamento = None  # descarta medicamento tangencial

    # Se doença encontrou artigo mas é sobre uma pessoa → preferir historia
    if doenca and historia and e_pessoa_historica(doenca.get("resumo", "")):
        doenca = None

    if doenca:
        if doenca.get("idioma") == "en" and doenca.get("resumo"):
            doenca["resumo"] = await traduzir_resumo(doenca["resumo"])
        doenca["tipo"] = "doenca"
        cache.set(chave, doenca)
        return doenca

    if medicamento:
        medicamento["nome_generico_pt"] = await traduzir(medicamento.get("nome_generico", ""))
        medicamento["nome_marca_pt"]    = await traduzir(medicamento.get("nome_marca", ""))
        medicamento["fabricante_pt"]    = await traduzir(medicamento.get("fabricante", ""))
        cache.set(chave, medicamento)
        return medicamento

    if historia:
        if historia.get("idioma") == "en" and historia.get("resumo"):
            historia["resumo"] = await traduzir_resumo(historia["resumo"])
        historia["tipo"] = "historia"
        cache.set(chave, historia)
        return historia

    raise HTTPException(
        status_code=404,
        detail={"mensagem": f"Nenhum resultado encontrado para '{termo}'.", "code": "NAO_ENCONTRADO"}
    )
