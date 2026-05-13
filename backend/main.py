import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import formula, medicamento, doenca, historia, historico
from database.database import inicializar_banco

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await inicializar_banco()
    yield

app = FastAPI(
    title="MedBase API",
    description="API do site enciclopédico médico MedBase",
    version="3.0.0",
    lifespan=lifespan,
)

# Lê CORS_ORIGEM do ambiente — no Render vem da variável de ambiente
# Em desenvolvimento usa * para aceitar localhost
cors_origem = os.getenv("CORS_ORIGEM", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origem, "http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(formula.router)
app.include_router(medicamento.router)
app.include_router(doenca.router)
app.include_router(historia.router)
app.include_router(historico.router)

@app.get("/")
def inicio():
    return {"mensagem": "MedBase API v3 funcionando ✓"}
