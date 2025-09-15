const DB_NAME = 'project-analyzer-db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Creates and initializes the IndexedDB database and object store.
 * This function handles the initial setup and version upgrades.
 * @returns A promise that resolves with the IDBDatabase instance.
 */
function createDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
        reject('IndexedDB is not supported in this browser.');
        return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      reject('IndexedDB error');
      dbPromise = null; // Reset promise on error
    };
  });

  return dbPromise;
}

/**
 * Retrieves a value from the IndexedDB store by its key.
 * @template T The expected type of the value.
 * @param {string} key The key of the item to retrieve.
 * @returns {Promise<T | undefined>} A promise that resolves with the value, or undefined if not found.
 */
export async function get<T>(key: string): Promise<T | undefined> {
  const db = await createDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result as T);
    };

    request.onerror = () => {
      console.error('Error getting data from IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Stores a value in the IndexedDB store with a given key.
 * @param {string} key The key to store the value under.
 * @param {any} value The value to be stored.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function set(key: string, value: any): Promise<void> {
  const db = await createDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error setting data in IndexedDB:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Clears all key-value pairs from the object store.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
export async function clear(): Promise<void> {
  const db = await createDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error clearing IndexedDB store:', request.error);
      reject(request.error);
    };
  });
}