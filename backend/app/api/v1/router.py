# API v1 router configuration

from fastapi import APIRouter

from app.api.v1.endpoints import health, version, inventory, auth

# Create API v1 router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(
    version.router,
    prefix="/version",
    tags=["version"]
)

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"]
)

api_router.include_router(
    inventory.router,
    prefix="/inventory",
    tags=["inventory"]
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"]
)
