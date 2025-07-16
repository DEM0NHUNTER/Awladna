# BackEnd/Utils/oauth_utils.py

import requests
from fastapi import HTTPException, status


def google_oauth_login(google_token: str) -> dict:
    """
    Validates a Google ID token by querying Google's token info endpoint.
    Extracts and returns basic user information if the token is valid.

    Args:
        google_token (str): Google OAuth ID token obtained from the client.

    Returns:
        dict: Dictionary containing user's Google ID, email, name, and profile picture.

    Raises:
        HTTPException:
            - 401 Unauthorized: If token verification fails.
            - 403 Forbidden: If user's email is not verified by Google.
    """
    url = "https://oauth2.googleapis.com/tokeninfo"
    params = {'id_token': google_token}

    # Validate token by querying Google's token verification endpoint
    response = requests.get(url, params=params)

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google OAuth token validation failed"
        )

    # Parse returned user information
    user_info = response.json()

    # Ensure that the email linked to the Google account is verified
    if not user_info.get("email_verified", "false") == "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email is not verified by Google"
        )

    # Return essential user details for application use
    return {
        "google_id": user_info["sub"],             # Unique Google user ID
        "email": user_info["email"],                # User's verified email
        "name": user_info.get("name"),              # Full name (optional)
        "picture": user_info.get("picture"),        # Profile picture URL (optional)
    }
