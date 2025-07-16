# BackEnd/Utils/oauth2_email_form.py
from fastapi import Form
from fastapi.security import OAuth2PasswordRequestForm


class OAuth2EmailPasswordForm(OAuth2PasswordRequestForm):
    """
    Extends FastAPI's OAuth2PasswordRequestForm to treat 'email' as 'username' for login.

    This allows clients to submit the user's email instead of a traditional username,
    while remaining compatible with OAuth2 authentication workflows.

    Example usage in route:
        form_data: OAuth2EmailPasswordForm = Depends()
    """

    def __init__(
            self,
            grant_type: str = Form(default="password"),
            email: str = Form(...),  # Required email field (instead of username)
            password: str = Form(...),  # Required password field
            scope: str = Form(default=""),  # Optional OAuth2 scope
            client_id: str = Form(default=None),  # Optional OAuth2 client_id
            client_secret: str = Form(default=None),  # Optional OAuth2 client_secret
    ):
        """
        Initializes the form by forwarding 'email' as 'username' to the parent class.
        OAuth2PasswordRequestForm expects a 'username' field; we map 'email' to it internally.
        """
        super().__init__(
            grant_type=grant_type,
            username=email,  # Email submitted by client is treated as 'username'
            password=password,
            scope=scope,
            client_id=client_id,
            client_secret=client_secret
        )
