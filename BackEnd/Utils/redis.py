# BackEnd/Utils/redis.py

import logging
from redis import asyncio as aioredis  # Async Redis client from redis-py library
from BackEnd.Utils.config import settings

# Set up module-specific logger
logger = logging.getLogger(__name__)


def get_redis_client():
    """
    Create and return an asynchronous Redis client using configuration from settings.

    Returns:
        aioredis.Redis: Asynchronous Redis client instance, or None if connection fails.
    """
    try:
        redis_url_str = str(settings.REDIS_URL)

        # Initialize Redis client with connection pool and timeout configurations
        client = aioredis.from_url(
            redis_url_str,
            decode_responses=True,  # Return strings instead of bytes
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            socket_timeout=5,
            socket_connect_timeout=5,
            health_check_interval=30,  # Periodically check if the connection is healthy
        )

        logger.info("Redis client created successfully")
        return client

    except Exception as e:
        logger.error(f"Redis connection failed: {str(e)}")
        return None  # Return None on failure


# Singleton Redis client for application-wide use
redis_client = get_redis_client()


async def check_redis():
    """
    Asynchronously check Redis connectivity using the PING command.

    Returns:
        dict: Dictionary indicating Redis connection status (True/False) and error details if any.
    """
    try:
        redis = await get_redis_client()  # Get a fresh Redis client
        pong = await redis.ping()  # Send PING command
        return {"status": pong}  # Returns {"status": True} if Redis is healthy
    except Exception as e:
        logger.error(f"Redis ping failed: {str(e)}")
        return {"status": False, "error": str(e)}  # Return failure details
