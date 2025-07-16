# BackEnd/Utils/sanitization.py

from fastapi import Request, HTTPException
import html
import re


class SanitizationMiddleware:
    """
    Middleware that inspects incoming HTTP JSON bodies for potentially malicious patterns.
    It raises a 400 error if malicious content is detected.
    """
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Process only HTTP requests (ignore websockets etc.)
        if scope["type"] == "http":
            request = Request(scope, receive)

            # If the request has a JSON body
            if request.headers.get("content-type") == "application/json":
                body = await request.body()
                try:
                    decoded_body = body.decode()
                    # If the body contains malicious content, reject the request
                    if self.is_malicious(decoded_body):
                        raise HTTPException(
                            status_code=400,
                            detail="Potential malicious content detected"
                        )
                except UnicodeDecodeError:
                    # Non-UTF-8 bodies are ignored for sanitization
                    pass

        # Pass control to the next middleware or route handler
        return await self.app(scope, receive, send)

    def is_malicious(self, content: str) -> bool:
        """
        Scans content for common XSS and injection patterns.

        Returns:
            bool: True if malicious patterns found, else False.
        """
        patterns = [
            r"<script.*?>.*?</script>",  # Inline <script> tags
            r"onerror\s*=",              # onerror event handler
            r"javascript:",              # javascript: pseudo-protocol
            r"eval\s*\(",                # eval() function
            r"alert\s*\("                # alert() function
        ]
        # If any pattern matches, content is considered malicious
        return any(re.search(pattern, content, re.IGNORECASE) for pattern in patterns)


def sanitize_input(data: str) -> str:
    """
    Escapes HTML special characters to prevent XSS when rendering content.

    Args:
        data (str): Raw user input.

    Returns:
        str: Escaped string safe for HTML output.
    """
    return html.escape(data)
