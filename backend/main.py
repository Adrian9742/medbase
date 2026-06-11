import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from routers import formula, medicamento, doenca, historia, historico, busca
from database.database import inicializar_banco
from limiter import limiter

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await inicializar_banco()
    yield

app = FastAPI(
    title="MedBase API",
    description="API do site enciclopédico médico MedBase",
    version="4.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://adrian9742.github.io",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(busca.router)
app.include_router(formula.router)
app.include_router(medicamento.router)
app.include_router(doenca.router)
app.include_router(historia.router)
app.include_router(historico.router)

@app.get("/")
def inicio():
    return {"mensagem": "MedBase API v4 funcionando ✓"}

@app.get("/health")
def health():
    return {"status": "ok"}
