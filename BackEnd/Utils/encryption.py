# BackEnd/Utils/encryption.py

import os
from cryptography.fernet import Fernet, InvalidToken

# In-memory variable to store test key during testing mode
_test_key = None


def _get_fernet() -> Fernet:
    """
    Creates and returns a Fernet instance used for encryption/decryption.

    Behavior:
    - If the application is running in TESTING mode (based on environment variable),
      it generates and reuses a single test key to ensure consistent encrypted results
      during automated tests.
    - Otherwise, retrieves the encryption key from the APP_ENCRYPTION_KEY
      environment variable (this key must be securely set in production).

    Raises:
        RuntimeError: If APP_ENCRYPTION_KEY is not set in production mode.

    Returns:
        Fernet: Configured Fernet instance for encryption/decryption.
    """
    if os.getenv("TESTING", "").lower() in ("1", "true"):
        global _test_key
        if _test_key is None:
            _test_key = Fernet.generate_key()  # Generate a persistent test key
        return Fernet(_test_key)

    key = os.getenv("APP_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("APP_ENCRYPTION_KEY environment variable is not set!")
    return Fernet(key)


def encrypt_data(data: str) -> str:
    """
    Encrypts plaintext data using Fernet symmetric encryption.

    Args:
        data (str): Plaintext string to encrypt.

    Returns:
        str: Encrypted string (UTF-8 decoded).
    """
    return _get_fernet().encrypt(data.encode()).decode()


def decrypt_data(token: str) -> str:
    """
    Decrypts previously encrypted token back into plaintext.

    Args:
        token (str): Encrypted string to decrypt.

    Raises:
        InvalidToken: If the token is corrupted, expired, or incorrect.

    Returns:
        str: Decrypted plaintext string.
    """
    return _get_fernet().decrypt(token.encode()).decode()


def safe_decrypt(token: str, default: str = "") -> str:
    """
    Safely attempts to decrypt an encrypted token.

    If decryption fails (e.g., due to corruption or invalid format),
    returns the provided default value (empty string by default)
    instead of raising an exception.

    Args:
        token (str): Encrypted string to decrypt.
        default (str): Value to return if decryption fails.

    Returns:
        str: Decrypted plaintext, or default value if decryption fails.
    """
    try:
        return decrypt_data(token)
    except InvalidToken:
        return default
