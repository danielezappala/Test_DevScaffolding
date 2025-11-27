"""API dependencies for dependency injection"""

from typing import AsyncGenerator, Optional

from fastapi import Depends, HTTPException, Header, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.session import session_store
from app.database import get_db


async def get_current_session(
    authorization: Optional[str] = Header(None)
) -> dict:
    """
    Dependency for getting current session from Authorization header.
    
    Args:
        authorization: Authorization header value (Bearer token)
        
    Returns:
        Session data dictionary
        
    Raises:
        HTTPException: If session is invalid or expired
        
    Example:
        @app.get("/protected")
        async def protected_route(session: dict = Depends(get_current_session)):
            user_id = session.get("user_id")
            return {"user_id": user_id}
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from "Bearer <token>" format
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = parts[1]
    
    # Get session from store
    session_data = await session_store.get_session(token)
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return session_data


async def get_optional_session(
    authorization: Optional[str] = Header(None)
) -> Optional[dict]:
    """
    Dependency for getting optional session (doesn't raise if missing).
    
    Args:
        authorization: Authorization header value (Bearer token)
        
    Returns:
        Session data dictionary or None if not authenticated
        
    Example:
        @app.get("/public")
        async def public_route(session: Optional[dict] = Depends(get_optional_session)):
            if session:
                return {"message": "Authenticated", "user_id": session.get("user_id")}
            return {"message": "Anonymous"}
    """
    if not authorization:
        return None
    
    try:
        return await get_current_session(authorization)
    except HTTPException:
        return None


async def get_current_user_from_session(request: Request) -> dict:
    """
    Dependency for getting current user from cookie-based session.
    
    This is used for OAuth-based authentication where the user info
    is stored in the session cookie instead of a Bearer token.
    
    Args:
        request: FastAPI Request object
        
    Returns:
        User data dictionary from session
        
    Raises:
        HTTPException: If user is not authenticated
    """
    user = request.session.get("user")
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    return user

