"""Version endpoint returning application version information"""

from fastapi import APIRouter

from app.config import settings
from app.schemas.version import VersionResponse

router = APIRouter()


@router.get(
    "",
    response_model=VersionResponse,
    summary="Get application version",
    description="Returns application version information including semantic version, git commit, and build date"
)
async def get_version() -> VersionResponse:
    """
    Get application version information.
    
    Returns version metadata from environment variables set during build:
    - version: Semantic version (e.g., 1.0.0)
    - commit: Git commit hash
    - build_date: ISO 8601 timestamp of build
    
    Returns:
        VersionResponse with version information
        
    Example response:
        {
            "version": "0.1.0",
            "commit": "dev",
            "build_date": "2025-11-19T21:50:07.698425"
        }
    """
    return VersionResponse(
        version=settings.APP_VERSION,
        commit=settings.GIT_COMMIT,
        build_date=settings.BUILD_DATE
    )
