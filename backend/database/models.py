import aiosqlite
from database.database import CAMINHO_BANCO

# ─────────────────────────────────────────
#  LIMITE DO HISTÓRICO
# ─────────────────────────────────────────

LIMITE_HISTORICO = 10


# ─────────────────────────────────────────
#  FUNÇÕES
# ─────────────────────────────────────────

async def salvar_historico(termo: str, tipo: str):
    """
    Salva uma pesquisa no histórico.
    Se já existir o limite máximo, apaga o registro mais antigo antes de inserir.
    """
    async with aiosqlite.connect(CAMINHO_BANCO) as banco:

        # Conta quantos registros existem
        cursor = await banco.execute("SELECT COUNT(*) FROM historico")
        total = (await cursor.fetchone())[0]

        # Se atingiu o limite, remove o mais antigo
        if total >= LIMITE_HISTORICO:
            await banco.execute("""
                DELETE FROM historico
                WHERE id = (SELECT id FROM historico ORDER BY criado_em ASC LIMIT 1)
            """)

        # Insere o novo registro
        await banco.execute(
            "INSERT INTO historico (termo, tipo) VALUES (?, ?)",
            (termo, tipo)
        )
        await banco.commit()


async def buscar_historico() -> list[dict]:
    """
    Retorna os últimos registros do histórico, do mais recente ao mais antigo.
    """
    async with aiosqlite.connect(CAMINHO_BANCO) as banco:
        banco.row_factory = aiosqlite.Row  # retorna como dicionário
        cursor = await banco.execute("""
            SELECT id, termo, tipo, criado_em
            FROM historico
            ORDER BY criado_em DESC
            LIMIT ?
        """, (LIMITE_HISTORICO,))

        linhas = await cursor.fetchall()
        return [dict(linha) for linha in linhas]


async def limpar_historico():
    """Apaga todos os registros do histórico."""
    async with aiosqlite.connect(CAMINHO_BANCO) as banco:
        await banco.execute("DELETE FROM historico")
        await banco.commit()
