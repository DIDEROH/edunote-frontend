/**
 * Mini-couche IndexedDB (sans dépendance) pour le mode hors ligne :
 * - "responses" : dernières réponses de l'API consultées (lecture hors ligne)
 * - "outbox"    : enregistrements faits hors ligne, envoyés au retour du réseau
 */
const DB_NAME = "edunote-offline";
const DB_VERSION = 1;

export const RESPONSES = "responses";
export const OUTBOX = "outbox";

let dbPromise = null;

function openDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponible"));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(RESPONSES)) {
          const store = db.createObjectStore(RESPONSES, { keyPath: "key" });
          store.createIndex("savedAt", "savedAt");
        }

        if (!db.objectStoreNames.contains(OUTBOX)) {
          db.createObjectStore(OUTBOX, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

// Exécute une opération dans une transaction et renvoie son résultat une fois validée
async function run(storeName, mode, operation) {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = operation(tx.objectStore(storeName));

    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const idbGet = (storeName, key) => run(storeName, "readonly", (s) => s.get(key));
export const idbPut = (storeName, value) => run(storeName, "readwrite", (s) => s.put(value));
export const idbDelete = (storeName, key) => run(storeName, "readwrite", (s) => s.delete(key));
export const idbGetAll = (storeName) => run(storeName, "readonly", (s) => s.getAll());
export const idbCount = (storeName) => run(storeName, "readonly", (s) => s.count());
export const idbClear = (storeName) => run(storeName, "readwrite", (s) => s.clear());

/**
 * Supprime les plus anciennes entrées d'un store indexé par "savedAt"
 * pour n'en garder que `max` (sans charger leur contenu en mémoire).
 */
export async function idbTrimOldest(storeName, max) {
  const total = await idbCount(storeName);
  let toDelete = total - max;
  if (toDelete <= 0) return;

  const db = await openDb();

  await new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const cursorRequest = store.index("savedAt").openKeyCursor();

    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor || toDelete <= 0) return;
      store.delete(cursor.primaryKey);
      toDelete--;
      cursor.continue();
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
