// public/service-worker.js
self.addEventListener("online", async () => {
  const db = await indexedDB.open("chatApp");
  const tx = db.transaction("outbox", "readonly");
  const store = tx.objectStore("outbox");
  const messages = await store.getAll();

  for (const msg of messages) {
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg),
    });
  }

  const clearTx = db.transaction("outbox", "readwrite");
  clearTx.objectStore("outbox").clear();
});
