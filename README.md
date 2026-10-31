# 📒 Notebook — Lightweight, Local-First Personal Notebook App

A beautiful, offline-first personal notebook app with rich text editing, freehand drawing, image attachments, and geometric shapes — all stored locally in IndexedDB. Zero server, zero cloud — your notes never leave your device.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in a Chromium-based browser (Chrome / Edge recommended for full IndexedDB + Storage Persistence support).

### Build for Production
```bash
npm run build
npm run preview   # preview production build locally
```

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 18 + TypeScript | UI & type safety |
| **Build** | Vite | Dev server & bundling |
| **State** | Zustand | Lightweight global store |
| **Database** | Dexie (IndexedDB) | Local-first persistence |
| **Rich Text** | Tiptap (ProseMirror) | Text editing engine |
| **Drawing** | perfect-freehand | Smooth pressure-sensitive freehand strokes |
| **Fonts** | @fontsource/nunito, @fontsource/caveat | Bundled locally, no CDN |
| **Export** | JSZip | `.zip` export of notebooks (planned) |
| **PWA** | vite-plugin-pwa | Offline installability (dev dependency) |

### Tiptap Extensions in Use
- `@tiptap/starter-kit` — Paragraphs, headings, bold, italic, strike, lists, blockquote, code block, horizontal rule, undo/redo
- `@tiptap/extension-highlight` — Multicolor text highlights
- `@tiptap/extension-text-style` + `Color` — Per-character text coloring
- `@tiptap/extension-list` — `TaskList` + `TaskItem` for interactive checklists

---

## 🎨 Design System

### Typography
| Role | Font | Usage |
|---|---|---|
| **UI / Body** | **Nunito** | All interface text, editor body |
| **Handwritten Accents** | **Caveat** | Page titles, H1 headings |

### Color Themes
| Theme | Background | Surface | Ink |
|---|---|---|---|
| **Light** (default) | `#F5F3FA` | `#FFFFFF` | `#3B3A4A` |
| **Night** | `#1D1824` | `#2B2434` | `#F2EEF8` |

Night mode uses a soft dark plum palette — not pure black — for reduced eye strain. Theme persists across sessions via IndexedDB settings.

### Paper Tints (7 colors)
| Name | Hex | Used for |
|---|---|---|
| Sky | `#BFDDF5` | Notebook covers & paper |
| Lilac | `#D9CCF2` | " |
| Mint | `#BFE6D3` | " |
| Peach | `#FFD3C2` | " |
| Butter | `#FFF0B8` | " |
| Rose | `#F6C6D8` | " |
| White | `#FFFFFF` | " |

### Paper Styles (4 patterns)
| Style | Description |
|---|---|
| **Lined** | Horizontal lines at 32px intervals, matching editor line-height |
| **Dotted** | 24px dot grid |
| **Grid** | 28px square grid |
| **Blank** | Solid tint, no pattern |

### Pen & Palette Colors (10 colors)
Ink, Rose, Coral, Amber, Sage, Teal, Sky, Indigo, Lilac, Brown — plus a native color picker for custom colors.

### Highlight Colors (6 colors)
Butter, Mint, Peach, Sky, Lilac, Rose — semi-transparent pastel markers for text highlighting.

---

## 📦 Features

### Notebook Management
- **Create** new notebooks with custom title, emoji, color swatch, and layout setting
- **Edit** notebook title, emoji, color, layout via modal
- **Delete** notebooks (soft-delete with `deletedAt` timestamp for future Trash recovery)
- **Reorder** notebooks up/down in the sidebar

### Page Management
- **Create** new pages inline from sidebar or from the empty state
- **Inline title editing** with Caveat handwriting font
- **Pin / unpin** pages to top
- **Reorder** pages up/down
- **Soft-delete** pages
- **Paper style switching** (lined / dotted / grid / blank) from the header
- **Paper tint switching** (7 color swatches) from the header
- **Extend page height** — "Add more space" button grows the canvas vertically
- **Auto-extend** when drawing near the bottom edge

### Rich Text Editor (Tiptap)
- **Formatting**: Bold, Italic, Strikethrough
- **Headings**: H1 (Caveat font), H2
- **Lists**: Bullet list, Numbered list, Task checklist (interactive checkboxes)
- **Block elements**: Blockquote, Code block, Horizontal rule
- **Text color**: 10-color pen palette + native color picker
- **Text highlight**: 6-color pastel highlight palette
- **Undo / Redo** for text operations
- **Paste sanitization**: Background colors stripped from pasted HTML to preserve paper tint
- **Image paste**: Pasting images from clipboard auto-creates image attachments

### Freehand Drawing (perfect-freehand)
- **Pen tool**: Pressure-sensitive freehand strokes with smooth outlines
- **Highlighter tool**: Semi-transparent strokes with multiply blending
- **4 stroke sizes**: Fine (3px), Medium (6px), Thick (12px), Bold (20px) for pen; scaled sizes for highlighter
- **10 drawing colors** + custom color picker
- **Undo / Redo / Clear** for drawing strokes
- **Offscreen canvas** optimization: committed strokes cached to avoid full redraws

### Geometric Shapes
- **Rectangle** — Click + drag to draw outlined rectangles
- **Circle / Ellipse** — Click + drag to draw outlined ellipses
- **Triangle** — Click + drag to draw outlined triangles
- All shapes use the active stroke color and size
- Minimum distance threshold (5px) prevents accidental micro-shapes

### Image Attachments
- **Add images** via toolbar button (file picker) or drag-and-drop onto the sheet
- **Paste images** from clipboard
- **Move & resize** images in Move mode (grab + drag, resize handle at bottom-right)
- **Delete** images via × button when selected in Move mode
- **Selection UI**: Blue border + shadow when selected; deselects on click outside
- Images stored as Blobs in IndexedDB `blobs` table
- Images processed/downscaled via canvas to keep storage manageable

### Editor Modes (4 modes)
| Mode | Icon | Behavior |
|---|---|---|
| **Type** | `T` | Text editing active, drawing canvas is non-interactive |
| **Draw** | ✏️ | Freehand / shape drawing active, text editor is non-interactive |
| **Erase** | ╳ | Sweep across strokes/shapes to erase them |
| **Move** | ✋ | Drag and resize image attachments |

### Autosave
- **Debounced** save to IndexedDB (~500ms after last change)
- **Immediate flush** on:
  - Editor blur
  - Tab switch / minimize (`visibilitychange`)
  - Browser close (`beforeunload`)
  - Notebook / page switch
- **Save indicator**: "Saved ✓" / "Saving..." in the header

### Sidebar
- **Collapsible** via hamburger button in the header
- Opens/closes with smooth `margin-left` animation
- Shows "☰ Notebooks" button in header when collapsed for easy re-opening
- **Notebook cards** with color strip, emoji, title, and hover actions (edit, delete, reorder)
- **Page list** with pin indicator, hover actions (pin, delete, reorder)
- **Dark/Light theme toggle** in sidebar header
- **Responsive**: On mobile (≤768px), sidebar becomes a fixed overlay with backdrop

### Accessibility & UX
- All interactive elements have `aria-label` and `title` attributes
- `prefers-reduced-motion` — animations and transitions disabled
- Custom scrollbar styling (thin, subtle)
- Touch-friendly pointer events with `touch-action: none` on drawing canvas

---

## 🗂 Project Structure

```
src/
├── main.tsx                  # Entry point, renders <App>
├── App.tsx                   # Root: Sidebar + Main area with lazy-loaded editor
├── index.css                 # Global resets, font imports, scrollbar styles
│
├── types/
│   └── notebook.ts           # All domain types (Notebook, Page, Stroke, PageObject, etc.)
│
├── db/
│   ├── database.ts           # Dexie schema, DB init, storage persistence
│   └── seeds.ts              # 5 seeded notebooks + rich welcome page content
│
├── store/
│   └── useNotebookStore.ts   # Zustand store: all state + actions
│
├── utils/
│   └── imageUtils.ts         # Image processing (downscale via canvas)
│
├── styles/
│   ├── tokens.css            # CSS custom properties (colors, shadows, radii, etc.)
│   ├── layout.css            # App layout, sidebar, header, toolbar, modals
│   ├── paper.css             # Paper sheet styles, patterns, book mode CSS
│   └── tiptap.css            # Tiptap editor styles, lists, task items, highlights
│
└── components/
    ├── common/
    │   └── Icon.tsx           # Inline SVG icon component (30+ icons)
    │
    ├── Sidebar/
    │   ├── Sidebar.tsx        # Sidebar shell: brand, theme toggle, collapse button
    │   ├── NotebookList.tsx   # Notebook cards with CRUD + reorder actions
    │   ├── NotebookModal.tsx  # Create/Edit notebook modal (title, emoji, color, layout)
    │   └── PageList.tsx       # Page list with pin, delete, reorder actions
    │
    ├── Header/
    │   └── Header.tsx         # Top header: breadcrumb, paper style/tint pickers, save status
    │
    └── Editor/
        ├── PageEditor.tsx     # Orchestrator: VerticalSheet + UnifiedToolbar (lazy-loaded)
        ├── VerticalSheet.tsx   # Paper sheet: title, text editor, drawing canvas, images, drag-drop
        ├── TextEditor.tsx     # Tiptap useEditor setup with all extensions + paste handling
        ├── TextToolbar.tsx    # (Legacy) Standalone text formatting toolbar
        ├── UnifiedToolbar.tsx # Floating bottom toolbar: mode switcher + context-aware controls
        ├── DrawingCanvas.tsx  # HTML Canvas for freehand strokes + shapes (perfect-freehand)
        └── ImageObjectsLayer.tsx # Positioned image overlays with drag/resize/delete
```

---

## 💾 Database Schema (Dexie / IndexedDB)

```
NotebookDB v1
├── notebooks:  id, order, deletedAt
├── pages:      id, notebookId, order, pinned, deletedAt
├── blobs:      id                    (stores image Blob objects)
└── settings:   key                   (key-value pairs: theme, lastActiveNotebookId, etc.)
```

- **Soft-delete** pattern: `deletedAt` field allows future Trash/recovery features
- **Storage Persistence**: `navigator.storage.persist()` called on first run to prevent browser eviction of IndexedDB data

---

## 📝 Design Decisions & Assumptions

1. **Vertical Scroll Layout**: The sheet renders as a full-width (up to 1400px) vertically-scrolling page. The `layout` field is stored per notebook for a future horizontal/book mode.
2. **Text ↔ Paper Alignment**: Editor text `line-height` is 32px, matching the lined paper background grid spacing so text sits naturally on ruled lines.
3. **Lazy-Loaded Editor**: The entire rich-text editor (`PageEditor.tsx`) is dynamically loaded via `React.lazy` + `Suspense` to ensure sub-1s initial load.
4. **No External API Calls**: Everything is 100% local — IndexedDB storage, bundled fonts, inline SVG icons. The app works fully offline.
5. **Image Processing**: Uploaded/pasted images are downscaled via an offscreen `<canvas>` element to keep IndexedDB storage reasonable.
6. **Drawing Architecture**: Uses a dual-canvas approach — committed strokes are cached on an offscreen canvas, and only the active in-progress stroke is redrawn per frame for smooth 60fps performance.
7. **Paste Sanitization**: Pasted HTML has `background-color` and `background` CSS properties stripped to prevent obscuring paper tints/patterns.

---

## 🔮 Future Phases (Planned)

- **Phase 2**: Drag-and-drop page/notebook reordering, full-text search across notebooks
- **Phase 3**: Horizontal book mode with CSS 3D page flip animation, fixed-size sheets
- **Phase 4**: `.zip` export/import with JSZip, PDF export
- **Phase 5**: Trash recovery UI (leveraging existing `deletedAt` soft-delete), notebook archiving
- **Phase 6**: PWA installation with offline caching (vite-plugin-pwa manifest)

---

## 📄 License

Personal project — private use only.
