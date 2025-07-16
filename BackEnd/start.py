# BackEnd/start.py

# ─── Entry Point for Running the API ────────────────────────────────────────────

import os
import uvicorn

from BackEnd.main import app

# ────────────────────────────────────────────────────────────────────────────────
# ── Main Execution Block ────────────────────────────────────────────────────────

if __name__ == "__main__":
    """
    Starts the FastAPI application using Uvicorn ASGI server.

    - Default port: 8080 (can be overridden via environment variable PORT).
    - Host: 0.0.0.0 (listens on all network interfaces).
    - reload: False (no auto-reload; set to True for development if needed).
    - workers: 3 (parallel worker processes to handle load).

    Usage:
        python start.py
    """
    port = int(os.environ.get("PORT", 8080))

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        reload=False,
        workers=3
    )
