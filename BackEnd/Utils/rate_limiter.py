# BackEnd/Utils/rate_limiter.py
import redis.asyncio as redis
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer

from BackEnd.Utils.config import settings  # Adjust import path as needed

# OAuth2 bearer token scheme for identifying users (using token)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Global Redis client (asynchronous)
redis_client = None


async def init_rate_limiter():
    """
    Initializes the Redis client for rate limiting.
    Should be called at application startup.

    If Redis is unavailable, rate limiting will gracefully degrade (no blocking).
    """
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL)  # Connect using URL from config
        await redis_client.ping()  # Ensure Redis is reachable
        print("Redis rate limiter connected successfully.")
    except Exception as e:
        print(f"Redis connection failed: {e}")
        redis_client = None  # Disable rate limiting if Redis is unavailable


async def api_rate_limit(token: str = Depends(oauth2_scheme)):
    """
    Main rate limiter dependency to apply to protected API endpoints.

    - Limits each user (based on token) to 5 requests per 10 seconds.
    - Uses Redis INCR and EXPIRE for sliding window counter.

    If Redis is unavailable, the request proceeds without limitation.
    """
    if redis_client is None:
        return  # Redis down: bypass rate limiting

    user_id = token  # Treat the token as user_id (adjust if using actual user ID)

    key = f"rate_limit:{user_id}"  # Redis key unique per user/token

    try:
        current = await redis_client.get(key)  # Check current request count
        if current and int(current) >= 5:  # Threshold: 5 requests
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests, slow down!"
            )

        # Use Redis pipeline for atomic operations:
        pipe = redis_client.pipeline()
        pipe.incr(key, amount=1)  # Increment request count
        pipe.expire(key, 10)  # Set/reset TTL to 10 seconds
        await pipe.execute()

    except Exception:
        # Fail silently if Redis errors occur (do not block the request)
        pass


def rate_limit_dep(name: str):
    """
    Optional: Create custom rate limiter dependency keyed by 'name'.

    Example:
        @app.get("/some-route", dependencies=[Depends(rate_limit_dep("some-key"))])
    """
    async def dependency():
        return await api_rate_limit(name)

    return dependency
