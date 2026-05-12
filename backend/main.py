from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import formula, medicamento, doenca, historia, historico
from database.database import inicializar_banco


@asynccontextmanager
async def lifespan(app: FastAPI):
    await inicializar_banco()
    yield


app = FastAPI(
    title="MedBase API",
    description="API do site enciclopédico médico MedBase",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    return {"mensagem": "MedBase API v2 funcionando ✓"}
