# BackEnd/Utils/secret_manager.py

import os
from cryptography.fernet import Fernet


class SecretManager:
    """
    Utility class responsible for managing encryption key rotation.
    Keys are used with Fernet symmetric encryption.
    """

    @staticmethod
    def rotate_keys():
        """
        Rotate the encryption keys. Intended to be run periodically (e.g., monthly via cron job).

        Workflow:
        1. Generate a new Fernet encryption key.
        2. Retrieve the current encryption key from the APP_ENCRYPTION_KEY environment variable.
        3. Replace the environment variable with the new key (in-memory).
        4. Return both the new key and old key for optional auditing or re-encryption purposes.

        Note:
        - The function assumes existing encrypted data may require re-encryption using the new key.
        - Persistent storage of the new key (outside environment variables) should be handled externally.
        - os.environ only modifies the current process's environment variables.

        Returns:
            tuple: (new_key_bytes, old_key_str)
        """
        new_key = Fernet.generate_key()  # Generate new secure Fernet key
        old_key = os.getenv("APP_ENCRYPTION_KEY")  # Retrieve current encryption key (if exists)

        # NOTE: At this point, re-encryption of existing data should occur using old_key before switching.
        # However, this logic is not implemented in this method.

        # Update the environment variable with the new key
        os.environ["APP_ENCRYPTION_KEY"] = new_key.decode()

        return new_key, old_key  # Return keys for logging/auditing or re-encryption
