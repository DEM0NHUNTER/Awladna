# BackEnd/Utils/database.py

import os
import logging
from pathlib import Path
from typing import Generator
from tenacity import AsyncRetrying, stop_after_attempt, wait_exponential
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, scoped_session, Session as SyncSession
from BackEnd.Utils.config import settings
from BackEnd.Utils.mongo_client import mongo_client
import redis
from alembic.config import Config
from alembic import command
from contextlib import contextmanager

# --------------------- Logging Setup ---------------------
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# --------------------- SQLAlchemy ORM Setup ---------------------
Base = declarative_base()

# Retry strategy for asynchronous DB operations (MongoDB health check)
db_retry = AsyncRetrying(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, max=10)
)


# --------------------- PostgreSQL Engine Factory ---------------------
def create_db_engine():
    """
    Create SQLAlchemy engine using Postgres connection pooling.
    Configured via environment variables loaded in settings.py.
    """
    db_url = str(settings.DATABASE_URL)
    engine = create_engine(
        db_url,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_timeout=30,
        connect_args={
            "connect_timeout": 5,
            "application_name": settings.APP_NAME
        },
        echo=settings.DATABASE_ECHO
    )
    return engine


# --------------------- SQLAlchemy Session Setup ---------------------
engine = create_db_engine()
SessionFactory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Session = scoped_session(SessionFactory)
Base.query = Session.query_property()


# --------------------- Redis Client Setup ---------------------
def get_redis_client():
    """
    Initialize Redis connection (synchronous).
    Used for rate limiting, caching, and health checks.
    """
    try:
        redis_client = redis.Redis.from_url(str(settings.REDIS_URL), decode_responses=True)
        if redis_client.ping():
            logger.info("Redis connected successfully")
            return redis_client
        logger.warning("Redis ping failed")
        return None
    except redis.RedisError as e:
        logger.error(f"Redis connection error: {e}")
        return None


redis_client = get_redis_client()


# --------------------- PostgreSQL Session Generator ---------------------
def get_db() -> Generator[SyncSession, None, None]:
    """
    Dependency-injected generator for FastAPI route handlers.
    Provides a SQLAlchemy session.
    """
    db = Session()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
        Session.remove()


# --------------------- Multi-Database Health Check ---------------------
async def check_database_health():
    """
    Checks health of PostgreSQL, MongoDB, and Redis.
    Allows MongoDB to fail without crashing the service.
    """
    results = {
        "postgresql": {"status": True},
        "mongodb": {"status": True},
        "redis": {"status": True}
    }

    # PostgreSQL check
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        results["postgresql"] = {"status": False, "error": str(e)}
        logger.error(f"PostgreSQL health check failed: {e}")

    # MongoDB check
    try:
        result = await mongo_client.ping()
        results["mongodb"] = result
    except Exception as e:
        results["mongodb"] = {"status": False, "error": str(e)}
        logger.warning(f"MongoDB health check failed: {e}")

    # Redis check
    try:
        if not redis_client or not redis_client.ping():
            raise redis.RedisError("Redis ping failed")
    except redis.RedisError as e:
        results["redis"] = {"status": False, "error": str(e)}
        logger.warning(f"Redis health check failed: {e}")

    return results


# --------------------- Alembic Migrations ---------------------
def run_migrations():
    """
    Run database migrations using Alembic.
    Requires alembic.ini to be present.
    """
    if not Path("alembic.ini").exists():
        raise FileNotFoundError("alembic.ini not found")

    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

    logger.info("Running database migrations...")
    command.upgrade(alembic_cfg, "head")
    logger.info("Migrations completed.")


# --------------------- Connection Cleanup ---------------------
def close_connections():
    """
    Close SQLAlchemy, Redis, and PostgreSQL connections.
    Useful during shutdown events.
    """
    try:
        Session.remove()
        engine.dispose()
        if redis_client:
            redis_client.close()
        logger.info("All connections closed")
    except Exception as e:
        logger.error(f"Error closing connections: {e}")
        raise


# --------------------- Local Testing Block ---------------------
if __name__ == "__main__":
    import asyncio

    try:
        health = asyncio.run(check_database_health())
        print(f"DB Health: {health}")
    finally:
        close_connections()
