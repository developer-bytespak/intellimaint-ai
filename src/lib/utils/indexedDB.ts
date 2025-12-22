/**
 * IndexedDB utility for storing PDF files persistently
 * Files remain available even after page reload or browser restart
 */

const DB_NAME = 'IntelliMaintDB';
const STORE_NAME = 'pdfFiles';
const DB_VERSION = 1;

// Initialize IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileName' });
      }
    };
  });
}

// Store a file in IndexedDB
export async function storeFileInDB(file: File): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const fileData = {
      fileName: file.name,
      file: file,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(fileData);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Stored file: ${file.name}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to store file: ${file.name}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Store error:', error);
    throw error;
  }
}

// Retrieve a file from IndexedDB
export async function getFileFromDB(fileName: string): Promise<File | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(fileName);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.file) {
          console.log(`[IndexedDB] Retrieved file: ${fileName}`);
          resolve(result.file);
        } else {
          console.log(`[IndexedDB] File not found: ${fileName}`);
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to retrieve file: ${fileName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Retrieve error:', error);
    return null;
  }
}

// Get all files from IndexedDB
export async function getAllFilesFromDB(): Promise<File[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        const files = results.map((item: any) => item.file).filter((f: File) => f != null);
        console.log(`[IndexedDB] Retrieved ${files.length} files`);
        resolve(files);
      };

      request.onerror = () => {
        reject(new Error('Failed to retrieve all files'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Get all error:', error);
    return [];
  }
}

// Delete a file from IndexedDB
export async function deleteFileFromDB(fileName: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(fileName);

      request.onsuccess = () => {
        console.log(`[IndexedDB] Deleted file: ${fileName}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete file: ${fileName}`));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Delete error:', error);
    throw error;
  }
}

// Clear all files from IndexedDB
export async function clearAllFilesFromDB(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[IndexedDB] Cleared all files');
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear all files'));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Clear error:', error);
    throw error;
  }
}

// Check if a file exists in IndexedDB
export async function fileExistsInDB(fileName: string): Promise<boolean> {
  try {
    const file = await getFileFromDB(fileName);
    return file !== null;
  } catch (error) {
    console.error('[IndexedDB] File exists check error:', error);
    return false;
  }
}
