"""Pytest configuration and fixtures"""

from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_current_session
from app.database import Base, get_db
from app.main import app

# Import models to register them with Base.metadata
from app.models.inventory import Lot, StockMovement, Supplier, Wine  # noqa: F401

# Test database URL (use in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="function")
async def test_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a test database session.

    Creates a fresh database for each test function and tears it down after.

    Yields:
        AsyncSession for database operations
    """
    # Create async engine for test database
    engine = create_async_engine(
        TEST_DATABASE_URL,
        poolclass=StaticPool,
        echo=False,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create session factory
    async_session = sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Create session
    async with async_session() as session:
        yield session

    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture(scope="function")
async def client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create an async test client with database dependency override.

    Args:
        test_db: Test database session

    Yields:
        AsyncClient for making API requests
    """

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield test_db

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


# Mock session dependencies for different roles
def override_get_current_session_admin():
    return {"user_id": 1, "role": "admin", "email": "admin@example.com"}

def override_get_current_session_magazziniere():
    return {"user_id": 2, "role": "magazziniere", "email": "magazziniere@example.com"}

def override_get_current_session_consultatore():
    return {"user_id": 3, "role": "consultatore", "email": "consultatore@example.com"}


@pytest.fixture(scope="function")
async def admin_client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Client authenticated as admin"""
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_session] = override_get_current_session_admin

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def magazziniere_client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Client authenticated as magazziniere"""
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_session] = override_get_current_session_magazziniere

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
async def consultatore_client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Client authenticated as consultatore"""
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_session] = override_get_current_session_consultatore

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def mock_redis(mocker):
    """
    Mock Redis client for testing.

    Args:
        mocker: pytest-mock fixture

    Returns:
        Mock Redis client
    """
    mock = mocker.AsyncMock()
    return mock
