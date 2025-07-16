# BackEnd/MongoModels/user.py

# ─── MongoDB Document Model: User ──────────────────────────────────────────────

class User:
    """
    Simple MongoDB document model representing a user profile.

    Purpose:
    - Used for storing lightweight user data in MongoDB collections
      (separate from SQL-based relational models).

    Fields:
    - name: User's name.
    - email: User's email address.
    - age: User's age.

    Methods:
    - to_dict(): Serializes the user object into a dictionary
                 suitable for MongoDB insertion.
    """

    def __init__(self, name: str, email: str, age: int):
        """
        Initialize a User document instance.

        Args:
            name (str): Full name of the user.
            email (str): Email address of the user.
            age (int): Age of the user.
        """
        self.name = name
        self.email = email
        self.age = age

    def to_dict(self) -> dict:
        """
        Serialize the user instance into a dictionary for MongoDB.

        Returns:
            dict: Dictionary representation of the user.
        """
        return {
            "name": self.name,
            "email": self.email,
            "age": self.age
        }

# ────────────────────────────────────────────────────────────────────────────────
