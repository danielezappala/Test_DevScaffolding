import os
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse

# Initialize OAuth client
oauth = OAuth()

oauth.register(
    name='google',
    client_id=os.getenv('GOOGLE_CLIENT_ID'),
    client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

async def login_via_google(request: Request) -> RedirectResponse:
    """Redirect user to Google for authentication."""
    redirect_uri = request.url_for('auth_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

async def auth_callback(request: Request):
    """Handle Google OAuth callback, return user info dict.
    Expected to be used in a FastAPI route.
    """
    token = await oauth.google.authorize_access_token(request)
    user = await oauth.google.parse_id_token(request, token)
    # user contains keys like 'email', 'sub', 'name', etc.
    return user
