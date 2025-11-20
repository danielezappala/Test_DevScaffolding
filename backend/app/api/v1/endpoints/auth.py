from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse, JSONResponse

from app.auth.google import login_via_google, auth_callback

router = APIRouter()

@router.get("/login", name="auth_login")
async def login(request: Request) -> RedirectResponse:
    """Redirect user to Google OAuth login page."""
    return await login_via_google(request)

@router.get("/callback", name="auth_callback")
async def callback(request: Request) -> JSONResponse:
    """Handle Google OAuth callback and return user info."""
    user = await auth_callback(request)
    # In a real app, you would create a session and set a token cookie.
    return JSONResponse(user)
