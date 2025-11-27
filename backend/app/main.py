"""FastAPI application factory and configuration"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from app.api.v1.router import api_router
from app.config import settings
from app.core.logging import setup_logging, log_request_middleware
from app.core.metrics import setup_metrics, metrics_middleware
from app.database import engine
from sqlalchemy import text


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan context manager.
    
    Handles startup and shutdown events for the application.
    """
    # Startup
    setup_logging()
    setup_metrics(app)
    
    # Test database connection
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        print(f"Warning: Database connection failed: {e}")
    
    yield
    
    # Shutdown
    await engine.dispose()


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title="test-devscaffolding API",
        description="Backend API for test-devscaffolding",
        version=settings.APP_VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        root_path=os.getenv("ROOT_PATH", ""),  # Dynamic root_path for Docker/Traefik
        lifespan=lifespan,
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SECRET_KEY,
        same_site="lax",
        https_only=False,
    )
    
    # Custom middleware
    app.middleware("http")(log_request_middleware)
    app.middleware("http")(metrics_middleware)
    
    # Mount API router
    app.include_router(api_router, prefix="/api/v1")
    
    # Root endpoint
    @app.get("/")
    async def root():
        return JSONResponse({
            "message": "test-devscaffolding API",
            "version": settings.APP_VERSION,
            "docs": "/api/docs"
        })
    
    # Health check endpoint
    @app.get("/health")
    async def health():
        return JSONResponse({"status": "healthy"})
    
    return app


# Create application instance
app = create_app()
