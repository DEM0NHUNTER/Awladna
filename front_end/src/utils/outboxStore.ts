// src/utils/outboxStore.ts

import { openDB } from "idb";

// Database configuration constants
const DB_NAME = "chatApp";
const STORE_NAME = "outbox";

/**
 * Opens or creates the IndexedDB database with an "outbox" object store.
 * This is used for offline message storage.
 */
export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create object store if it doesn't exist
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",         // Auto-incremented unique key
          autoIncrement: true
        });
      }
    },
  });
};

/**
 * Saves a message object into the IndexedDB outbox.
 * Useful for storing unsent messages when offline.
 * @param msg - Message object (should contain at least a text or id)
 */
export const saveMessageToOutbox = async (msg: any) => {
  const db = await getDB();
  await db.add(STORE_NAME, msg);
};

/**
 * Retrieves all messages currently stored in the outbox.
 * Typically used to sync unsent messages when back online.
 * @returns Array of stored message objects
 */
export const getOutboxMessages = async () => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

/**
 * Clears all stored messages from the outbox.
 * Used after successfully syncing offline messages.
 */
export const clearOutbox = async () => {
  const db = await getDB();
  return db.clear(STORE_NAME);
};
