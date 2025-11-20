"""Database configuration with SQLAlchemy async engine and session factory"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


# Create async engine
engine_args = {
    "echo": settings.LOG_LEVEL == "DEBUG",
    "pool_pre_ping": True,
}

# Add pool settings only for non-SQLite databases
if "sqlite" not in settings.DATABASE_URL:
    engine_args["pool_size"] = 5
    engine_args["max_overflow"] = 10

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    **engine_args
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models"""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database sessions.
    
    Yields:
        AsyncSession: Database session
        
    Example:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
