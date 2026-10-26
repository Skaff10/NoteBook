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
 * Check whether the app has been seeded before, using both a localStorage
 * flag and a Dexie settings record.  Either one being present means "already
 * seeded" — this way seeds never re-appear even if one storage layer is
 * cleared independently.
 */
const SEEDED_LS_KEY = 'notebook_seeded';

function hasBeenSeeded(): boolean {
  try {
    return localStorage.getItem(SEEDED_LS_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeeded(): void {
  try {
    localStorage.setItem(SEEDED_LS_KEY, '1');
  } catch {
    /* localStorage unavailable — Dexie flag will cover us */
  }
}

/**
 * Initialize database and populate seeds on first run if empty.
 * Seeds are only inserted when BOTH:
 *   1. The notebooks table is empty (no records at all, including soft-deleted), AND
 *   2. No "already seeded" flag exists in localStorage or Dexie settings.
 */
export async function initDatabase(): Promise<void> {
  await requestStoragePersistence();

  // If localStorage already says we seeded, skip entirely.
  if (hasBeenSeeded()) return;

  // Check Dexie-level flag as a secondary guard.
  const seededSetting = await db.settings.get('seededAt');
  if (seededSetting) {
    // Dexie knows we seeded before — sync the LS flag and return.
    markSeeded();
    return;
  }

  // Neither flag found — only seed if the table is truly empty.
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

  // Whether we seeded or not, mark that we've passed through init
  // so future runs (even after DB wipe) won't re-seed.
  markSeeded();
}
