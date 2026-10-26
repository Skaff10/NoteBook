import { Dexie, type Table } from 'dexie';
import type { Notebook, Page, BlobRecord, SettingRecord } from '../types/notebook';
import { SEED_NOTEBOOKS, getSeedPages } from './seeds';

export class NotebookDB extends Dexie {
  notebooks!: Table<Notebook, string>;
  pages!: Table<Page, string>;
  blobs!: Table<BlobRecord, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('NotebookAppDB');
    this.version(1).stores({
      notebooks: 'id, order, createdAt, updatedAt, deletedAt',
      pages: 'id, notebookId, order, pinned, createdAt, updatedAt, deletedAt',
      blobs: 'id, mime, size, createdAt',
      settings: 'key',
    });
  }
}

export const db = new NotebookDB();

/**
 * Request persistent storage from the browser to prevent eviction.
 */
export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Initialize database and populate seeds on first run if empty.
 */
export async function initDatabase(): Promise<void> {
  await requestStoragePersistence();

  const notebookCount = await db.notebooks.count();
  if (notebookCount === 0) {
    const now = Date.now();
    const seededNotebooks: Notebook[] = SEED_NOTEBOOKS.map((nb) => ({
      ...nb,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    }));

    const seededPages: Page[] = getSeedPages();

    await db.transaction('rw', [db.notebooks, db.pages, db.settings], async () => {
      await db.notebooks.bulkAdd(seededNotebooks);
      await db.pages.bulkAdd(seededPages);
      await db.settings.put({ key: 'theme', value: 'light' });
      await db.settings.put({ key: 'seededAt', value: now });
    });
  }
}
