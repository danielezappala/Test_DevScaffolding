"""Version endpoint response schemas"""

from pydantic import BaseModel, Field, ConfigDict


class VersionResponse(BaseModel):
    """
    Response schema for version endpoint.
    
    Provides application version information including
    semantic version, git commit, and build timestamp.
    """
    
    version: str = Field(
        ...,
        description="Application semantic version (e.g., 1.0.0)",
        examples=["0.1.0"]
    )
    
    commit: str = Field(
        ...,
        description="Git commit hash",
        examples=["dev"]
    )
    
    build_date: str = Field(
        ...,
        description="Build timestamp in ISO 8601 format",
        examples=["2025-11-19T21:50:07.698425"]
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "version": "0.1.0",
                    "commit": "dev",
                    "build_date": "2025-11-19T21:50:07.698425"
                }
            ]
        }
    )
