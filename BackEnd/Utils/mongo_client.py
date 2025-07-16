# BackEnd/Utils/mongo_client.py

import os
import certifi
import logging
from datetime import datetime
from typing import Dict
from motor.motor_asyncio import AsyncIOMotorClient  # Asynchronous MongoDB client
from pymongo import ASCENDING  # For creating indexes
from BackEnd.Utils.config import settings  # Load app configuration


# Initialize asynchronous MongoDB client with TLS for secure connection
client = AsyncIOMotorClient(
    str(settings.MONGO_URL),        # MongoDB URI from environment
    tls=True,                       # Enable TLS encryption
    tlsCAFile=certifi.where(),      # CA bundle for certificate verification
    serverSelectionTimeoutMS=5000   # Timeout for server selection in milliseconds
)

# Select main application database and collections
mongo_db = client[settings.MONGO_DB_NAME]
chat_sessions_collection = mongo_db["chat_sessions"]
recommendations_collection = mongo_db["recommendations"]


async def ensure_indexes():
    """
    Ensure required indexes exist on the chat_sessions collection.
    Improves query performance for common fields like user_id and child_id.
    This function should be called at startup.
    """
    try:
        await chat_sessions_collection.create_index([("user_id", ASCENDING)])
        await chat_sessions_collection.create_index([("child_id", ASCENDING)])
        await chat_sessions_collection.create_index([("timestamp", ASCENDING)])
        await chat_sessions_collection.create_index(
            [("user_id", ASCENDING), ("child_id", ASCENDING)],
            name="user_child_composite"
        )
        logging.info("MongoDB indexes ensured successfully.")
    except Exception as e:
        logging.warning(f"Could not create MongoDB indexes: {e}")


class MongoDBClient:
    """
    MongoDB Client wrapper for easier collection and database handling.
    Provides basic methods to interact with MongoDB asynchronously.
    """

    def __init__(self):
        self.client = client  # Shared global MongoDB client
        self.db = mongo_db    # Default to app's primary database

    def connect(self, db_name: str):
        """
        Switch the active database.

        Args:
            db_name (str): Name of the database to connect to.

        Returns:
            AsyncIOMotorDatabase: Connected database instance.
        """
        self.db = self.client[db_name]
        logging.info(f"Connected to MongoDB database: {db_name}")
        return self.db

    def get_collection(self, collection_name: str):
        """
        Retrieve a collection from the current database.

        Args:
            collection_name (str): Target collection name.

        Returns:
            AsyncIOMotorCollection: MongoDB collection instance.

        Raises:
            Exception: If connect() was not called to select a database.
        """
        if not self.db:
            raise Exception("Database not selected. Call connect() first.")
        return self.db[collection_name]

    async def insert_session(self, data: Dict):
        """
        Insert a chat session document into chat_sessions collection.

        Args:
            data (Dict): Chat session data. Automatically adds current UTC timestamp.
        """
        data = data.copy()
        data["timestamp"] = datetime.utcnow()
        await chat_sessions_collection.insert_one(data)

    async def ping(self) -> Dict[str, str]:
        """
        Perform a MongoDB ping to check connection health.

        Returns:
            Dict[str, str]: {"status": "ok"} if healthy, or error details.
        """
        try:
            result = await self.client.admin.command("ping")
            if result.get("ok") == 1:
                return {"status": "ok"}
            return {"status": "error", "details": result}
        except Exception as e:
            logging.error(f"MongoDB ping error: {e}")
            return {"status": "error", "details": str(e)}


# Create a singleton MongoDBClient instance for application-wide reuse
mongo_client = MongoDBClient()
