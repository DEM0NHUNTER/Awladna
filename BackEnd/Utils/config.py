# BackEnd/Utils/config.py

import os
import json
from functools import lru_cache
from typing import List, Optional
from pydantic import BaseModel, field_validator, model_validator, AnyUrl, PostgresDsn, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load environment variables from .env file if available
try:
    from dotenv import load_dotenv

    dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
    load_dotenv(dotenv_path)
except ImportError:
    def load_dotenv(*args, **kwargs):
        # No-op if dotenv is not installed
        return

# Handle ALLOWED_ORIGINS parsing from comma-separated string to JSON list
_origins = os.getenv("ALLOWED_ORIGINS")
if _origins and not _origins.strip().startswith("["):
    os.environ["ALLOWED_ORIGINS"] = json.dumps([o.strip() for o in _origins.split(",")])


# ------------------------ Email Configuration Schema ------------------------
class EmailConfig(BaseModel):
    """
    Email SMTP configuration schema for mail sending functions.
    """
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_SERVER: str
    MAIL_PORT: int
    MAIL_FROM: str
    MAIL_STARTTLS: bool
    MAIL_SSL_TLS: bool
    MAIL_TIMEOUT: int = 15


# ------------------------ Application Settings Schema ------------------------
class Settings(BaseSettings):
    """
    Centralized application configuration loaded from environment variables.
    Supports PostgreSQL, MongoDB, Redis, Email, and CORS settings.
    """

    # App metadata
    APP_ENV: str = "production"
    APP_VERSION: str = "1.0.0"
    APP_NAME: str = "awladna-api"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8080
    APP_RELOAD: bool = False
    APP_WORKERS: int = 1
    APP_SECRET_KEY: str
    APP_ENCRYPTION_KEY: str
    FRONTEND_URL: str = "http://localhost:3000"

    # PostgreSQL configuration
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DATABASE_URL: Optional[PostgresDsn] = None
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_ECHO: bool = False

    # MongoDB configuration
    MONGO_URL: str
    MONGO_DB_NAME: str

    # Redis configuration
    REDIS_URL: Optional[str] = None
    REDIS_MAX_CONNECTIONS: int = 10

    # CORS policy
    ALLOWED_ORIGINS: list = Field(default_factory=lambda: json.loads(os.getenv("ALLOWED_ORIGINS", "[]")))
    CORS_ALLOW_CREDENTIALS: bool = True

    # Authentication tokens configuration
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REFRESH_TOKEN_SECRET: str

    # Google OAuth client (optional)
    GOOGLE_CLIENT_ID: Optional[str] = None

    # API documentation toggles
    ENABLE_DOCS: bool = True
    ENABLE_REDOC: bool = False
    ENABLE_SENTRY: bool = False

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"

    # Testing configuration
    TEST_DATABASE_URL: Optional[PostgresDsn] = None
    TEST_REDIS_URL: Optional[AnyUrl] = None
    TESTING: bool = False

    # Email configuration
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    # Pydantic settings config
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    # Automatically build DATABASE_URL if not directly provided
    @model_validator(mode="before")
    @classmethod
    def build_database_url(cls, data: dict) -> dict:
        if not data.get("DATABASE_URL"):
            user = data.get("POSTGRES_USER")
            pw = data.get("POSTGRES_PASSWORD")
            db = data.get("POSTGRES_DB")
            host = data.get("DB_HOST", "localhost")
            port = data.get("DB_PORT", 5432)
            if user and pw and db:
                data["DATABASE_URL"] = f"postgresql://{user}:{pw}@{host}:{port}/{db}"
        return data

    # Parse ALLOWED_ORIGINS whether from JSON or comma-separated string
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            return [o.strip() for o in v.strip("[]").split(",") if o.strip()]
        return v

    # Ensure email flags are boolean
    @field_validator("MAIL_STARTTLS", "MAIL_SSL_TLS")
    @classmethod
    def validate_email_flags(cls, v):
        if not isinstance(v, bool):
            raise ValueError("Must be a boolean value")
        return v


# ------------------------ Singleton Configuration Loader ------------------------
@lru_cache()
def get_settings() -> Settings:
    """
    Singleton-like pattern to load environment configuration once.
    """
    return Settings()


# Global access point to app configuration
settings = get_settings()


# Debug block to print loaded settings
if __name__ == "__main__":
    import pprint, logging

    logging.basicConfig(level=logging.DEBUG)
    pprint.pprint(settings.model_dump())
    logging.info(f"ALLOWED_ORIGINS loaded: {settings.ALLOWED_ORIGINS}")
