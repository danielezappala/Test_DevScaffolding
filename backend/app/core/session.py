"""Redis-based session management with opaque tokens"""

import secrets
from typing import Any, Optional

import redis.asyncio as redis
from redis.asyncio import Redis

from app.config import settings


class SessionStore:
    """
    Redis-based session store with opaque token generation.
    
    Provides secure session management using Redis for storage
    and cryptographically secure opaque tokens for session IDs.
    """
    
    def __init__(self):
        """Initialize Redis connection pool"""
        self._redis: Optional[Redis] = None
    
    async def _get_redis(self) -> Redis:
        """
        Get or create Redis connection.
        
        Returns:
            Redis client instance
        """
        if self._redis is None:
            self._redis = await redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
        return self._redis
    
    async def close(self):
        """Close Redis connection"""
        if self._redis:
            await self._redis.close()
            self._redis = None
    
    @staticmethod
    def generate_token() -> str:
        """
        Generate a cryptographically secure opaque session token.
        
        Returns:
            URL-safe token string (43 characters)
        """
        return secrets.token_urlsafe(32)
    
    async def create_session(self, data: dict[str, Any]) -> str:
        """
        Create a new session with the provided data.
        
        Args:
            data: Session data to store
            
        Returns:
            Session token (opaque identifier)
            
        Example:
            token = await session_store.create_session({
                "user_id": 123,
                "email": "user@example.com"
            })
        """
        redis_client = await self._get_redis()
        token = self.generate_token()
        
        # Store session data with expiration
        await redis_client.hset(
            f"session:{token}",
            mapping=data
        )
        await redis_client.expire(
            f"session:{token}",
            settings.SESSION_EXPIRE_SECONDS
        )
        
        return token
    
    async def get_session(self, token: str) -> Optional[dict[str, Any]]:
        """
        Retrieve session data by token.
        
        Args:
            token: Session token
            
        Returns:
            Session data dictionary or None if not found/expired
            
        Example:
            data = await session_store.get_session(token)
            if data:
                user_id = data.get("user_id")
        """
        redis_client = await self._get_redis()
        data = await redis_client.hgetall(f"session:{token}")
        
        if not data:
            return None
        
        # Refresh expiration on access
        await redis_client.expire(
            f"session:{token}",
            settings.SESSION_EXPIRE_SECONDS
        )
        
        return data
    
    async def update_session(self, token: str, data: dict[str, Any]) -> bool:
        """
        Update session data.
        
        Args:
            token: Session token
            data: New session data (replaces existing)
            
        Returns:
            True if session exists and was updated, False otherwise
            
        Example:
            success = await session_store.update_session(token, {
                "user_id": 123,
                "last_activity": "2024-01-01T12:00:00"
            })
        """
        redis_client = await self._get_redis()
        
        # Check if session exists
        exists = await redis_client.exists(f"session:{token}")
        if not exists:
            return False
        
        # Update session data
        await redis_client.delete(f"session:{token}")
        await redis_client.hset(f"session:{token}", mapping=data)
        await redis_client.expire(
            f"session:{token}",
            settings.SESSION_EXPIRE_SECONDS
        )
        
        return True
    
    async def delete_session(self, token: str) -> bool:
        """
        Delete a session.
        
        Args:
            token: Session token
            
        Returns:
            True if session existed and was deleted, False otherwise
            
        Example:
            await session_store.delete_session(token)
        """
        redis_client = await self._get_redis()
        result = await redis_client.delete(f"session:{token}")
        return result > 0
    
    async def refresh_session(self, token: str) -> bool:
        """
        Refresh session expiration time.
        
        Args:
            token: Session token
            
        Returns:
            True if session exists and was refreshed, False otherwise
            
        Example:
            await session_store.refresh_session(token)
        """
        redis_client = await self._get_redis()
        exists = await redis_client.exists(f"session:{token}")
        
        if not exists:
            return False
        
        await redis_client.expire(
            f"session:{token}",
            settings.SESSION_EXPIRE_SECONDS
        )
        return True


# Global session store instance
session_store = SessionStore()
