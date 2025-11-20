"""Health check endpoint"""

from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response schema"""
    status: str
    message: str


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Returns application health status"
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Used by Docker health checks and load balancers to verify
    the application is running and responsive.
    
    Returns:
        HealthResponse indicating service is healthy
    """
    return HealthResponse(
        status="healthy",
        message="Service is running"
    )
