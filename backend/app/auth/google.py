import os
import sys
import logging
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse

from app.config import settings

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize OAuth client
oauth = OAuth()

oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

async def login_via_google(request: Request) -> RedirectResponse:
    """Redirect user to Google for authentication."""
    root_path = request.scope.get("root_path", "")
    base_url = str(request.base_url).rstrip("/")
    
    redirect_uri = request.url_for('auth_callback')
    
    if "test-devscaffolding" not in str(redirect_uri):
        pass
        
    if "https" in settings.CORS_ORIGINS[0] and "localhost" not in str(redirect_uri) and "127.0.0.1" not in str(redirect_uri):
         redirect_uri = str(redirect_uri).replace("http://", "https://")
         
    print(f"DEBUG: Generated redirect_uri: {redirect_uri}", file=sys.stderr)
         
    return await oauth.google.authorize_redirect(request, redirect_uri)

async def auth_callback(request: Request):
    """Handle Google OAuth callback, return user info dict."""
    logger.info(f"DEBUG: auth_callback called")
    
    # Retrieve the redirect_uri from the session to handle proxy/subpath mismatches
    state = request.query_params.get('state')
    redirect_uri = None
    if state:
        session_key = f'_state_google_{state}'
        session_data = request.session.get(session_key)
        if session_data and 'data' in session_data:
            redirect_uri = session_data['data'].get('redirect_uri')
            logger.info(f"DEBUG: Using stored redirect_uri: {redirect_uri}")

    try:
        # We rely on Authlib to extract redirect_uri from the session state.
        token = await oauth.google.authorize_access_token(request)
        logger.info(f"DEBUG: Token obtained. Type: {type(token)}")
    except Exception as e:
        logger.error(f"DEBUG: authorize_access_token failed: {e}")
        raise e
        
    try:
        user = await oauth.google.parse_id_token(request, token)
        logger.info("DEBUG: id_token parsed successfully")
    except KeyError:
        logger.warning("DEBUG: id_token missing, falling back to userinfo endpoint")
        user = await oauth.google.userinfo(token=token)
        logger.info("DEBUG: userinfo retrieved successfully")
        
    return {"user": user, "token": token}
