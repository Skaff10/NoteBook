import { create } from 'zustand';
import type { Notebook, Page, NotebookLayout, PaperStyle, EditorMode, StrokeTool, Stroke, PageObject } from '../types/notebook';
import { db, initDatabase } from '../db/database';
import { processImageFile } from '../utils/imageUtils';

export interface NotebookStore {
  notebooks: Notebook[];
  activeNotebookId: string | null;
  pages: Page[];
  activePageId: string | null;
  activePage: Page | null;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  theme: 'light' | 'night';
  isSidebarOpen: boolean;
  isLoading: boolean;

  // Editor mode & Drawing state
  editorMode: EditorMode;
  drawingTool: StrokeTool;
  strokeColor: string;
  strokeSize: number;
  strokeRedoStack: Stroke[][];

  // Actions
  init: () => Promise<void>;
  selectNotebook: (notebookId: string) => Promise<void>;
  createNotebook: (data: { title: string; emoji: string; color: string; layout?: NotebookLayout }) => Promise<string>;
  updateNotebook: (id: string, updates: Partial<Notebook>) => Promise<void>;
  deleteNotebook: (id: string) => Promise<void>;
  reorderNotebooks: (orderedIds: string[]) => Promise<void>;

  selectPage: (pageId: string) => Promise<void>;
  createPage: (title?: string) => Promise<string>;
  updateActivePage: (updates: Partial<Page>, immediateSave?: boolean) => Promise<void>;
  saveActivePageToDB: () => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  togglePinPage: (id: string) => Promise<void>;
  reorderPages: (orderedIds: string[]) => Promise<void>;
  setPaperStyle: (style: PaperStyle) => Promise<void>;
  setPaperTint: (tint: string) => Promise<void>;
  extendPageHeight: (extraHeight: number) => Promise<void>;

  // Object / Image Attachments Actions
  addObject: (file: File, x?: number, y?: number) => Promise<void>;
  updateObject: (obj: PageObject) => Promise<void>;
  deleteObject: (objId: string, blobId: string) => Promise<void>;

  // Drawing Actions
  setEditorMode: (mode: EditorMode) => void;
  setDrawingTool: (tool: StrokeTool) => void;
  setStrokeColor: (color: string) => void;
  setStrokeSize: (size: number) => void;
  addStroke: (stroke: Stroke) => Promise<void>;
  removeStrokes: (strokeIds: string[]) => Promise<void>;
  clearStrokes: () => Promise<void>;
  undoDrawing: () => Promise<void>;
  redoDrawing: () => Promise<void>;

  // Book Navigation
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTheme: () => Promise<void>;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useNotebookStore = create<NotebookStore>((set, get) => ({
  notebooks: [],
  activeNotebookId: null,
  pages: [],
  activePageId: null,
  activePage: null,
  saveStatus: 'saved',
  theme: 'light',
  isSidebarOpen: true,
  isLoading: true,

  editorMode: 'type',
  drawingTool: 'pen',
  strokeColor: '#3B3A4A',
  strokeSize: 4,
  strokeRedoStack: [],

  init: async () => {
    try {
      await initDatabase();

      // Load theme from settings
      const themeSetting = await db.settings.get('theme');
      const theme = (themeSetting?.value as 'light' | 'night') || 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }

      // Load non-deleted notebooks
      const allNotebooks = await db.notebooks
        .filter((nb) => !nb.deletedAt)
        .sortBy('order');

      const lastNotebookSetting = await db.settings.get('lastActiveNotebookId');
      const lastNotebookId = lastNotebookSetting?.value;

      const activeNotebook =
        allNotebooks.find((nb) => nb.id === lastNotebookId) || allNotebooks[0];

      if (!activeNotebook) {
        set({ notebooks: [], isLoading: false, theme });
        return;
      }

      // Load non-deleted pages for active notebook
      const pages = await db.pages
        .filter((p) => p.notebookId === activeNotebook.id && !p.deletedAt)
        .toArray();

      pages.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.order - b.order;
      });

      const lastPageSetting = await db.settings.get('lastActivePageId');
      const lastPageId = lastPageSetting?.value;
      const activePage = pages.find((p) => p.id === lastPageId) || pages[0] || null;

      set({
        notebooks: allNotebooks,
        activeNotebookId: activeNotebook.id,
        pages,
        activePageId: activePage ? activePage.id : null,
        activePage,
        theme,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to initialize database and store:', err);
      set({ isLoading: false });
    }
  },

  selectNotebook: async (notebookId: string) => {
    const { activeNotebookId, activePage: currentActive, saveActivePageToDB } = get();
    if (activeNotebookId === notebookId) return;

    // Flush any pending save
    if (currentActive) {
      await saveActivePageToDB();
    }

    const pages = await db.pages
      .filter((p) => p.notebookId === notebookId && !p.deletedAt)
      .toArray();

    pages.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.order - b.order;
    });

    const nextActivePage = pages[0] || null;

    set({
      activeNotebookId: notebookId,
      pages,
      activePageId: nextActivePage ? nextActivePage.id : null,
      activePage: nextActivePage,
      saveStatus: 'saved',
    });

    await db.settings.put({ key: 'lastActiveNotebookId', value: notebookId });
    if (nextActivePage) {
      await db.settings.put({ key: 'lastActivePageId', value: nextActivePage.id });
    }
  },

  createNotebook: async (data) => {
    const { notebooks } = get();
    const now = Date.now();
    const newNotebook: Notebook = {
      id: 'nb-' + crypto.randomUUID(),
      title: data.title.trim() || 'Untitled Notebook',
      emoji: data.emoji || '📓',
      color: data.color || '#BFDDF5',
      order: notebooks.length,
      layout: data.layout || 'vertical',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // Create an initial page for this notebook
    const firstPage: Page = {
      id: 'page-' + crypto.randomUUID(),
      notebookId: newNotebook.id,
      title: 'Page 1',
      paper: { style: 'lined', tint: newNotebook.color },
      doc: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      },
      strokes: [],
      objects: [],
      height: 1100,
      order: 0,
      pinned: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await db.transaction('rw', [db.notebooks, db.pages, db.settings], async () => {
      await db.notebooks.add(newNotebook);
      await db.pages.add(firstPage);
      await db.settings.put({ key: 'lastActiveNotebookId', value: newNotebook.id });
      await db.settings.put({ key: 'lastActivePageId', value: firstPage.id });
    });

    const updatedNotebooks = [...notebooks, newNotebook];

    set({
      notebooks: updatedNotebooks,
      activeNotebookId: newNotebook.id,
      pages: [firstPage],
      activePageId: firstPage.id,
      activePage: firstPage,
    });

    return newNotebook.id;
  },

  updateNotebook: async (id: string, updates: Partial<Notebook>) => {
    const now = Date.now();
    const updatedData = { ...updates, updatedAt: now };

    await db.notebooks.update(id, updatedData);

    const { notebooks } = get();
    const updatedNotebooks = notebooks.map((nb) =>
      nb.id === id ? { ...nb, ...updatedData } : nb
    );

    set({ notebooks: updatedNotebooks });
  },

  deleteNotebook: async (id: string) => {
    const now = Date.now();
    // Soft delete notebook
    await db.notebooks.update(id, { deletedAt: now, updatedAt: now });

    const { notebooks, activeNotebookId } = get();
    const remaining = notebooks.filter((nb) => nb.id !== id);

    if (activeNotebookId === id) {
      if (remaining.length > 0) {
        await get().selectNotebook(remaining[0].id);
        set({ notebooks: remaining });
      } else {
        set({
          notebooks: [],
          activeNotebookId: null,
          pages: [],
          activePageId: null,
          activePage: null,
        });
      }
    } else {
      set({ notebooks: remaining });
    }
  },

  reorderNotebooks: async (orderedIds: string[]) => {
    const { notebooks } = get();
    const map = new Map(notebooks.map((nb) => [nb.id, nb]));
    const reordered: Notebook[] = [];

    await db.transaction('rw', db.notebooks, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const nb = map.get(orderedIds[i]);
        if (nb) {
          const updated = { ...nb, order: i, updatedAt: Date.now() };
          reordered.push(updated);
          await db.notebooks.update(nb.id, { order: i, updatedAt: Date.now() });
        }
      }
    });

    set({ notebooks: reordered });
  },

  selectPage: async (pageId: string) => {
    const { activePageId, activePage, saveActivePageToDB, pages } = get();
    if (activePageId === pageId) return;

    if (activePage) {
      await saveActivePageToDB();
    }

    const targetPage = pages.find((p) => p.id === pageId) || null;
    set({
      activePageId: pageId,
      activePage: targetPage,
      saveStatus: 'saved',
    });

    if (targetPage) {
      await db.settings.put({ key: 'lastActivePageId', value: targetPage.id });
    }
  },

  createPage: async (title?: string) => {
    const { activeNotebookId, notebooks, pages, saveActivePageToDB, activePage } = get();
    if (!activeNotebookId) throw new Error('No active notebook');

    if (activePage) {
      await saveActivePageToDB();
    }

    const currentNotebook = notebooks.find((nb) => nb.id === activeNotebookId);
    const now = Date.now();
    const newPageTitle = title?.trim() || `Page ${pages.length + 1}`;

    const newPage: Page = {
      id: 'page-' + crypto.randomUUID(),
      notebookId: activeNotebookId,
      title: newPageTitle,
      paper: {
        style: 'lined',
        tint: currentNotebook?.color || '#BFDDF5',
      },
      doc: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [],
          },
        ],
      },
      strokes: [],
      objects: [],
      height: 1100,
      order: pages.length,
      pinned: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    await db.pages.add(newPage);
    await db.settings.put({ key: 'lastActivePageId', value: newPage.id });

    const updatedPages = [...pages, newPage];

    set({
      pages: updatedPages,
      activePageId: newPage.id,
      activePage: newPage,
      saveStatus: 'saved',
    });

    return newPage.id;
  },

  updateActivePage: async (updates: Partial<Page>, immediateSave = false) => {
    const { activePage, pages } = get();
    if (!activePage) return;

    const updated: Page = {
      ...activePage,
      ...updates,
      updatedAt: Date.now(),
    };

    const updatedPages = pages.map((p) => (p.id === updated.id ? updated : p));

    set({
      activePage: updated,
      pages: updatedPages,
      saveStatus: immediateSave ? 'saved' : 'saving',
    });

    if (immediateSave) {
      if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
      }
      await db.pages.put(updated);
      set({ saveStatus: 'saved' });
    } else {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        const current = get().activePage;
        if (current && current.id === updated.id) {
          await db.pages.put(current);
          set({ saveStatus: 'saved' });
        }
      }, 500);
    }
  },

  saveActivePageToDB: async () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    const { activePage } = get();
    if (activePage) {
      await db.pages.put(activePage);
      set({ saveStatus: 'saved' });
    }
  },

  deletePage: async (id: string) => {
    const now = Date.now();
    await db.pages.update(id, { deletedAt: now, updatedAt: now });

    const { pages, activePageId } = get();
    const remaining = pages.filter((p) => p.id !== id);

    if (activePageId === id) {
      const nextActive = remaining[0] || null;
      set({
        pages: remaining,
        activePageId: nextActive ? nextActive.id : null,
        activePage: nextActive,
      });
      if (nextActive) {
        await db.settings.put({ key: 'lastActivePageId', value: nextActive.id });
      }
    } else {
      set({ pages: remaining });
    }
  },

  togglePinPage: async (id: string) => {
    const { pages, activePage } = get();
    const page = pages.find((p) => p.id === id);
    if (!page) return;

    const newPinned = !page.pinned;
    const updatedAt = Date.now();
    await db.pages.update(id, { pinned: newPinned, updatedAt });

    const updatedPages = pages.map((p) =>
      p.id === id ? { ...p, pinned: newPinned, updatedAt } : p
    );

    updatedPages.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.order - b.order;
    });

    set({
      pages: updatedPages,
      activePage: activePage?.id === id ? { ...activePage, pinned: newPinned } : activePage,
    });
  },

  reorderPages: async (orderedIds: string[]) => {
    const { pages } = get();
    const map = new Map(pages.map((p) => [p.id, p]));
    const reordered: Page[] = [];

    await db.transaction('rw', db.pages, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const page = map.get(orderedIds[i]);
        if (page) {
          const updated = { ...page, order: i, updatedAt: Date.now() };
          reordered.push(updated);
          await db.pages.update(page.id, { order: i, updatedAt: Date.now() });
        }
      }
    });

    set({ pages: reordered });
  },

  setPaperStyle: async (style: PaperStyle) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    await updateActivePage(
      {
        paper: {
          ...activePage.paper,
          style,
        },
      },
      true
    );
  },

  setPaperTint: async (tint: string) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    await updateActivePage(
      {
        paper: {
          ...activePage.paper,
          tint,
        },
      },
      true
    );
  },

  extendPageHeight: async (extraHeight: number) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    const newHeight = (activePage.height || 1100) + extraHeight;
    await updateActivePage({ height: newHeight }, true);
  },

  addObject: async (file: File, x?: number, y?: number) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Notice: File size is greater than 25 MB.');
    }

    try {
      const { blob, width, height } = await processImageFile(file);
      const blobId = 'blob-' + crypto.randomUUID();

      await db.blobs.put({
        id: blobId,
        blob,
        name: file.name,
        mime: blob.type,
        size: blob.size,
        createdAt: Date.now(),
      });

      const displayWidth = Math.min(380, width);
      const displayHeight = Math.round((height * displayWidth) / width);

      const newObject: PageObject = {
        id: 'obj-' + crypto.randomUUID(),
        type: 'image',
        blobId,
        x: x ?? 80,
        y: y ?? 120,
        w: displayWidth,
        h: displayHeight,
        name: file.name,
        mime: blob.type,
        size: blob.size,
      };

      const currentObjects = activePage.objects || [];
      await updateActivePage({ objects: [...currentObjects, newObject] }, true);
    } catch (err) {
      console.error('Failed to process and add image attachment:', err);
    }
  },

  updateObject: async (obj: PageObject) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    const currentObjects = activePage.objects || [];
    const updated = currentObjects.map((o) => (o.id === obj.id ? obj : o));
    await updateActivePage({ objects: updated }, false);
  },

  deleteObject: async (objId: string, blobId: string) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    const currentObjects = activePage.objects || [];
    const filtered = currentObjects.filter((o) => o.id !== objId);
    await db.blobs.delete(blobId);
    await updateActivePage({ objects: filtered }, true);
  },

  setEditorMode: (mode: EditorMode) => set({ editorMode: mode }),
  setDrawingTool: (tool: StrokeTool) => set({ drawingTool: tool }),
  setStrokeColor: (color: string) => set({ strokeColor: color }),
  setStrokeSize: (size: number) => set({ strokeSize: size }),

  addStroke: async (stroke: Stroke) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    const currentStrokes = activePage.strokes || [];
    const newStrokes = [...currentStrokes, stroke];
    set({ strokeRedoStack: [] });
    await updateActivePage({ strokes: newStrokes }, false);
  },

  removeStrokes: async (strokeIds: string[]) => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    const currentStrokes = activePage.strokes || [];
    const filtered = currentStrokes.filter((s) => !strokeIds.includes(s.id));
    if (filtered.length !== currentStrokes.length) {
      await updateActivePage({ strokes: filtered }, false);
    }
  },

  clearStrokes: async () => {
    const { activePage, updateActivePage } = get();
    if (!activePage) return;
    set({ strokeRedoStack: [activePage.strokes || []] });
    await updateActivePage({ strokes: [] }, true);
  },

  undoDrawing: async () => {
    const { activePage, strokeRedoStack, updateActivePage } = get();
    if (!activePage) return;
    const currentStrokes = activePage.strokes || [];
    if (currentStrokes.length === 0) return;
    const lastStroke = currentStrokes[currentStrokes.length - 1];
    const newStrokes = currentStrokes.slice(0, -1);
    set({ strokeRedoStack: [...strokeRedoStack, [lastStroke]] });
    await updateActivePage({ strokes: newStrokes }, false);
  },

  redoDrawing: async () => {
    const { activePage, strokeRedoStack, updateActivePage } = get();
    if (!activePage || strokeRedoStack.length === 0) return;
    const nextStrokesToAdd = strokeRedoStack[strokeRedoStack.length - 1];
    const newRedoStack = strokeRedoStack.slice(0, -1);
    const newStrokes = [...(activePage.strokes || []), ...nextStrokesToAdd];
    set({ strokeRedoStack: newRedoStack });
    await updateActivePage({ strokes: newStrokes }, false);
  },

  nextPage: async () => {
    const { pages, activePageId, selectPage, createPage } = get();
    const currentIndex = pages.findIndex((p) => p.id === activePageId);
    if (currentIndex >= 0 && currentIndex < pages.length - 1) {
      await selectPage(pages[currentIndex + 1].id);
    } else if (currentIndex === pages.length - 1) {
      await createPage();
    }
  },

  prevPage: async () => {
    const { pages, activePageId, selectPage } = get();
    const currentIndex = pages.findIndex((p) => p.id === activePageId);
    if (currentIndex > 0) {
      await selectPage(pages[currentIndex - 1].id);
    }
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open });
  },

  toggleTheme: async () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'light' ? 'night' : 'light';
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
    await db.settings.put({ key: 'theme', value: nextTheme });
    set({ theme: nextTheme });
  },

  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved') => {
    set({ saveStatus: status });
  },
}));
