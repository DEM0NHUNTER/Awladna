# BackEnd/monitoring/health.py

# ─── System Health Monitoring Routes ───────────────────────────────────────────

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from BackEnd.Utils.database import get_db
from BackEnd.Utils.redis import get_redis_client
from BackEnd.Utils.mongo_client import MongoDBClient

import shutil

# ────────────────────────────────────────────────────────────────────────────────
# ── Router Initialization ──────────────────────────────────────────────────────

router = APIRouter()

# ────────────────────────────────────────────────────────────────────────────────
# ── Health Check Utilities ─────────────────────────────────────────────────────

def check_database(db: Session = Depends(get_db)) -> str:
    """
    Perform a basic SELECT 1 to verify database connectivity.

    Returns:
        str: "OK" if successful, otherwise "DOWN: <error>"
    """
    try:
        db.execute("SELECT 1")
        return "OK"
    except Exception as e:
        return f"DOWN: {str(e)}"


def check_redis() -> str:
    """
    Verify connectivity to the Redis cache.

    Returns:
        str: "OK" if Redis responds to ping, otherwise "DOWN: <error>"
    """
    try:
        redis_cli = get_redis_client()
        return "OK" if redis_cli.ping() else "DOWN"
    except Exception as e:
        return f"DOWN: {str(e)}"


def check_mongodb() -> str:
    """
    Verify MongoDB connectivity using the 'ping' command.

    Returns:
        str: "OK" if MongoDB responds successfully, otherwise "DOWN: <error>"
    """
    try:
        mongo = MongoDBClient()
        result = mongo.client.admin.command('ping')
        return "OK" if result.get('ok') == 1 else "DOWN"
    except Exception as e:
        return f"DOWN: {str(e)}"


def check_storage() -> str:
    """
    Check available disk space.

    Returns:
        str: "OK" if more than 1GB is free, otherwise "LOW_SPACE" or "DOWN: <error>"
    """
    try:
        total, used, free = shutil.disk_usage("/")
        return "OK" if free > 1024 ** 3 else "LOW_SPACE"
    except Exception as e:
        return f"DOWN: {str(e)}"

# ────────────────────────────────────────────────────────────────────────────────
# ── API Endpoint: Full System Health Report ────────────────────────────────────

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Consolidated health check endpoint.

    Returns:
        dict: Statuses of database, Redis, MongoDB, storage, and overall system.
    """
    return {
        "database": check_database(db),
        "redis": check_redis(),
        "mongodb": check_mongodb(),
        "storage": check_storage(),
        "status": "OK"
    }

# ────────────────────────────────────────────────────────────────────────────────
