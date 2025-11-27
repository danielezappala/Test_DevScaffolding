from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse, JSONResponse

from app.auth.google import login_via_google, auth_callback

router = APIRouter()

@router.get("/login", name="auth_login")
async def login(request: Request) -> RedirectResponse:
    """Redirect user to Google OAuth login page."""
    return await login_via_google(request)

@router.get("/callback", name="auth_callback")
async def callback(request: Request) -> RedirectResponse:
    """Handle Google OAuth callback and return user info."""
    data = await auth_callback(request)
    user = data.get("user")
    
    # Store user info in session
    request.session["user"] = user
    
    # Redirect to frontend dashboard
    # In development (localhost), frontend is on port 3000, backend on 8000
    # In production (Docker/Traefik), everything is on the same domain
    
    # Check if we're in development by looking at the request host
    host = request.headers.get("host", "")
    
    if "localhost:8000" in host or "127.0.0.1:8000" in host:
        # Development: redirect to frontend on port 3000
        dashboard_url = "http://localhost:3000/dashboard"
    else:
        # Production: use relative path (works with Traefik)
        root_path = request.scope.get("root_path", "")
        dashboard_url = f"{root_path}/dashboard"
    
    return RedirectResponse(url=dashboard_url)

@router.get("/me", name="auth_me")
async def me(request: Request) -> JSONResponse:
    """Get current user info from session."""
    user = request.session.get("user")
    if not user:
        return JSONResponse({"authenticated": False, "session_keys": list(request.session.keys())}, status_code=401)
    return JSONResponse({"authenticated": True, "user": user})
