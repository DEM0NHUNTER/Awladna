# BackEnd/middleware/security_headers.py

# ─── Middleware: Security Headers ──────────────────────────────────────────────

from fastapi import Request, Response

# ────────────────────────────────────────────────────────────────────────────────
# ── Security Headers Middleware ────────────────────────────────────────────────

async def security_headers(request: Request, call_next):
    """
    Middleware function to apply standard security headers to all HTTP responses.

    Purpose:
    - Strengthens HTTP response security.
    - Protects against common attacks like clickjacking, MIME sniffing, and mixed content.
    - Controls resource loading via CSP.

    Headers Applied:
    - Content-Security-Policy: Limits resources to same origin.
    - X-Content-Type-Options: Prevents MIME type sniffing.
    - Strict-Transport-Security: Enforces HTTPS usage.
    - X-Frame-Options: Prevents embedding in iframes (mitigates clickjacking).
    - Permissions-Policy: Disables sensitive browser features.

    Returns:
        Response: Modified HTTP response containing security headers.
    """
    # Process request via next handler/middleware
    response = await call_next(request)

    # Security headers dictionary
    security_headers = {
        "Content-Security-Policy": "default-src 'self'; script-src 'self'",
        "X-Content-Type-Options": "nosniff",
        "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
        "X-Frame-Options": "DENY",
        "Permissions-Policy": "geolocation=(), microphone=()"
    }

    # Apply headers to response
    for header, value in security_headers.items():
        response.headers[header] = value

    return response

# ────────────────────────────────────────────────────────────────────────────────
# ── Example Usage ──────────────────────────────────────────────────────────────
#
# To apply this middleware manually:
#
# from fastapi.middleware import Middleware
# from fastapi import FastAPI
#
# app = FastAPI(middleware=[Middleware(security_headers)])
#
# However, in this project, it’s registered via:
# app.add_middleware(BaseHTTPMiddleware, dispatch=security_headers)
# from within main.py
#
# ────────────────────────────────────────────────────────────────────────────────
