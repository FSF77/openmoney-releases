// OpenMoney IndexedDB & iCloud File Storage Manager
const DB_NAME = 'OpenMoneyStorage';
const DB_VERSION = 1;
const STORE_DATABASES = 'databases';
const STORE_META = 'metadata';

class DatabaseManager {
  constructor() {
    this.db = null;
  }

  async init() {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_DATABASES)) {
          db.createObjectStore(STORE_DATABASES, { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  async getActiveDbName() {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const req = store.get('active_db');
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    });
  }

  async setActiveDbName(name) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_META, 'readwrite');
      const store = tx.objectStore(STORE_META);
      const req = store.put({ key: 'active_db', value: name });
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async listDatabases() {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(STORE_DATABASES, 'readonly');
      const store = tx.objectStore(STORE_DATABASES);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        resolve(items.map(it => ({
          name: it.name,
          updatedAt: it.updatedAt,
          accountsCount: it.data?.accounts?.length || 0,
          txCount: it.data?.txs?.length || 0
        })));
      };
      req.onerror = () => resolve([]);
    });
  }

  async getDatabase(name) {
    await this.init();
    return new Promise((resolve) => {
      const tx = this.db.transaction(STORE_DATABASES, 'readonly');
      const store = tx.objectStore(STORE_DATABASES);
      const req = store.get(name);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  }

  async saveDatabase(name, data) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_DATABASES, 'readwrite');
      const store = tx.objectStore(STORE_DATABASES);
      const entry = {
        name: name,
        data: data,
        updatedAt: new Date().toISOString()
      };
      const req = store.put(entry);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteDatabase(name) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(STORE_DATABASES, 'readwrite');
      const store = tx.objectStore(STORE_DATABASES);
      const req = store.delete(name);
      req.onsuccess = async () => {
        const active = await this.getActiveDbName();
        if (active === name) {
          const all = await this.listDatabases();
          if (all.length > 0) {
            await this.setActiveDbName(all[0].name);
          } else {
            await this.setActiveDbName(null);
          }
        }
        resolve(true);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // Parses a selected JSON File from iCloud or local filesystem
  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target.result);
          // Basic OpenMoney validation
          if (!content.accounts || !Array.isArray(content.accounts)) {
            throw new Error('Arquivo JSON inválido: não contém a chave "accounts".');
          }
          if (!content.txs || !Array.isArray(content.txs)) {
            content.txs = [];
          }
          if (!content.cats || !Array.isArray(content.cats)) {
            content.cats = [];
          }
          if (!content.v) content.v = 6;

          const fileName = file.name || 'openmoney.json';
          await this.saveDatabase(fileName, content);
          await this.setActiveDbName(fileName);
          resolve({ name: fileName, data: content });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
      reader.readAsText(file);
    });
  }

  // Export database to iCloud Drive via Web Share API or download fallback
  async exportToFile(name, data) {
    // Produce compact JSON matching Store.swift JSONEncoder without prettyPrinted
    const jsonStr = JSON.stringify(data);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const filename = name.endsWith('.json') ? name : `${name}.json`;

    // Try Web Share API (native iOS Files / iCloud prompt)
    if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'application/json' })] })) {
      try {
        const file = new File([blob], filename, { type: 'application/json' });
        await navigator.share({
          files: [file],
          title: filename,
          text: 'Base de dados atualizada do OpenMoney'
        });
        return { success: true, method: 'share' };
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, aborted: true };
        }
        // Fallback to direct download
      }
    }

    // Direct download fallback
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, method: 'download' };
  }
}

export const dbManager = new DatabaseManager();
