import aiosqlite
import os

# ─────────────────────────────────────────
#  CONFIGURAÇÃO
# ─────────────────────────────────────────

# Caminho do arquivo do banco — fica dentro da pasta database/
CAMINHO_BANCO = os.path.join(os.path.dirname(__file__), "medbase.db")


# ─────────────────────────────────────────
#  INICIALIZAÇÃO
# ─────────────────────────────────────────

async def inicializar_banco():
    """
    Cria o banco e as tabelas se ainda não existirem.
    Chamado uma vez quando o servidor FastAPI inicia.
    """
    async with aiosqlite.connect(CAMINHO_BANCO) as banco:
        await banco.execute("""
            CREATE TABLE IF NOT EXISTS historico (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                termo     TEXT NOT NULL,
                tipo      TEXT NOT NULL,
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await banco.commit()
