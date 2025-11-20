"""Application configuration using Pydantic Settings for 12-factor config"""

from typing import List, Union

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Follows 12-factor app methodology for configuration management.
    """
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        # Disable JSON parsing for complex types from env vars
        env_parse_none_str="null"
    )
    
    # Application metadata
    APP_VERSION: str = Field(default="0.1.0", description="Application version")
    GIT_COMMIT: str = Field(default="dev", description="Git commit hash")
    BUILD_DATE: str = Field(default="2025-11-19T21:50:07.698425", description="Build timestamp")
    
    # Database configuration
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://test-devscaffolding:8HoPI12Zxw_IolNCtC30mcdBaqidheIc@pgbouncer:6432/test-devscaffolding",
        description="PostgreSQL connection URL via PgBouncer"
    )
    
    # Redis configuration
    REDIS_URL: str = Field(
        default="redis://redis:6379/0",
        description="Redis connection URL for session storage"
    )
    
    # Security
    SECRET_KEY: str = Field(
        default="SL3jL_5pf7HDpIBIWy1MCLhIVobI-_WuxtR71_NLN2Y",
        description="Secret key for session signing"
    )
    
    # Session configuration
    SESSION_EXPIRE_SECONDS: int = Field(
        default=86400,  # 24 hours
        description="Session expiration time in seconds"
    )
    
    # CORS configuration - comma-separated string from env
    cors_origins_str: str = Field(
        default="https://test.example.com,http://localhost:3000",
        alias="CORS_ORIGINS",
        description="Allowed CORS origins (comma-separated string)"
    )
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Parse CORS_ORIGINS from comma-separated string to list"""
        return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]
    
    # Logging
    LOG_LEVEL: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)"
    )
    
    # API configuration
    API_PREFIX: str = Field(
        default="/api/v1",
        description="API route prefix"
    )


# Global settings instance
settings = Settings()
