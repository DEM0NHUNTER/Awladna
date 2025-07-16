# BackEnd/main.py

# ─── Core & Third-Party Dependencies ───────────────────────────────────────────
import os
import json
import logging
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel
from sqlalchemy.orm import Session

# ─── Internal Application Modules ──────────────────────────────────────────────
from BackEnd.middleware.security_headers import security_headers
from BackEnd.Utils.config import settings
from BackEnd.Utils.database import Base, engine, check_database_health, get_db
from BackEnd.Utils.mongo_client import ensure_indexes
from BackEnd.Utils.auth_utils import get_current_user
from BackEnd.Utils.rate_limiter import init_rate_limiter
from BackEnd.Utils.ai_integration import get_ai_response

from BackEnd.Models.user import User, UserRole
from BackEnd.Models.child_profile import ChildProfile

from BackEnd.Routes import (
    auth,
    admin,
    child_profile,
    recommendation,
    analytics,
    settings as Settings,
    chat as ChatRoutes,
)

# ─── Environment & Logging Setup ───────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("app.log")
    ]
)
logger = logging.getLogger(__name__)
logging.info(f"CORS origins loaded: {settings.ALLOWED_ORIGINS}")

# ────────────────────────────────────────────────────────────────────────────────
# ── App Security: Role-Based Dependency ─────────────────────────────────────────
def require_role(role: UserRole):
    """Dependency that restricts access to users with a specific role."""
    def wrapper(user: User = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Permission denied")
        return user
    return wrapper

# ────────────────────────────────────────────────────────────────────────────────
# ── App Lifespan Hooks (startup/shutdown) ───────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handles actions on app startup and shutdown."""
    logger.info("App startup")

    try:
        # Initialize rate limiter
        await init_rate_limiter()

        # Check health of PostgreSQL and MongoDB
        db_health = await check_database_health()
        logger.info(f"Database health: {db_health}")

        if not db_health["postgresql"]["status"]:
            raise Exception(f"PostgreSQL health check failed: {db_health['postgresql']}")

        if not db_health["mongodb"]["status"]:
            logger.warning(f"MongoDB health check failed: {db_health['mongodb'].get('error')}")

        # Create all SQLAlchemy models in PostgreSQL
        Base.metadata.create_all(bind=engine)

        # Ensure MongoDB indexes exist
        await ensure_indexes()

    except Exception as e:
        logger.error("Startup errors", exc_info=e)
        raise e

    yield

    # Cleanup on shutdown
    engine.dispose()
    logger.info("App shutdown")

# ────────────────────────────────────────────────────────────────────────────────
# ── FastAPI App Initialization ─────────────────────────────────────────────────
app = FastAPI(
    title="Awladna Parenting Chatbot API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.ENABLE_DOCS else None,
    redoc_url="/redoc" if settings.ENABLE_REDOC else None,
    redirect_slashes=False,
)

# ────────────────────────────────────────────────────────────────────────────────
# ── Middleware Configuration ────────────────────────────────────────────────────

# 1. Enable CORS for frontend (localhost:3000 during development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
)

# 2. Add custom security headers for enhanced protection
app.add_middleware(BaseHTTPMiddleware, dispatch=security_headers)

# ────────────────────────────────────────────────────────────────────────────────
# ── Router Registration ────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/auth/admin")
app.include_router(ChatRoutes.router, prefix="/api/auth/chat")
app.include_router(child_profile.router, prefix="/api/auth/child")
app.include_router(recommendation.router, prefix="/api/auth/recommendation")
app.include_router(analytics.router, prefix="/api/auth/analytics")
app.include_router(Settings.router, prefix="/api/auth/settings")

# ────────────────────────────────────────────────────────────────────────────────
# ── API Models ─────────────────────────────────────────────────────────────────
class AIRequest(BaseModel):
    user_input: str
    child_id: Optional[int] = None
    child_age: Optional[int] = None
    child_name: Optional[str] = None
    context: Optional[str] = None
    hf_model_name: Optional[str] = None

class HealthCheck(BaseModel):
    status: str = "OK"

# ────────────────────────────────────────────────────────────────────────────────
# ── API Endpoints ──────────────────────────────────────────────────────────────

@app.get("/api")
async def root():
    """Root endpoint for status check."""
    return {
        "status": "Awladna API is running",
        "version": settings.APP_VERSION,
        "docs": "/docs" if settings.ENABLE_DOCS else "disabled",
        "redoc": "/redoc" if settings.ENABLE_REDOC else "disabled"
    }

@app.get("/api/ping")
def ping():
    """Simple ping-pong health check."""
    return {"pong": True}

@app.get("/api/test-db")
async def test_db():
    """Returns health status of database connections."""
    return await check_database_health()

@app.get("/api/cors-debug")
async def cors_debug():
    """Checks if CORS is working properly."""
    return {"message": "CORS is working!"}

@app.get("/api/me")
async def read_current_user(current_user: User = Depends(get_current_user)):
    """Returns the current authenticated user's details."""
    return {
        "email": current_user.email,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat()
    }

@app.post("/api/auth/chat/respond")
async def ai_respond(
    request: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Core endpoint for interacting with the AI chatbot.

    Accepts user input, optionally includes child context, and returns AI-generated response.
    """
    logger.info(f"AI request received: {request.dict()}")
    return await get_ai_response(
        user_input=request.user_input,
        child_age=request.child_age,
        child_name=request.child_name,
        context=request.context,
    )

@app.get("/api/security-info", dependencies=[Depends(require_role(UserRole.ADMIN))])
async def security_info(request: Request):
    """Returns request headers and IP for admin security inspection."""
    return {
        "client_ip": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "headers": dict(request.headers),
        "security_headers": {
            "content_security_policy": "enabled",
            "strict_transport_security": "enabled",
            "x_frame_options": "enabled"
        }
    }

@app.get("/health", summary="Health check", status_code=status.HTTP_200_OK, response_model=HealthCheck)
def health():
    """Public health check endpoint for uptime monitoring."""
    try:
        return HealthCheck(status="OK")
    except Exception as e:
        logger.error("Health check failed", exc_info=e)
        raise HTTPException(status_code=500, detail="Health check failed")

@app.get("/env")
async def get_env_vars():
    """Debug-only: Returns all environment variables (use with caution)."""
    return dict(os.environ.items())

# ────────────────────────────────────────────────────────────────────────────────
# ── Custom Exception Handlers ──────────────────────────────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "code": exc.status_code}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "details": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}")
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error"}
    )
