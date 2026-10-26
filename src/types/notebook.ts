export type NotebookLayout = 'vertical' | 'horizontal';

export type PaperStyle = 'blank' | 'lined' | 'dotted' | 'grid';

export type EditorMode = 'type' | 'draw' | 'erase' | 'move';

export type StrokeTool = 'pen' | 'highlighter' | 'rectangle' | 'circle' | 'triangle';

export interface Notebook {
  id: string;
  title: string;
  emoji: string;
  color: string;
  order: number;
  layout: NotebookLayout;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface Stroke {
  id: string;
  tool: StrokeTool;
  color: string;
  size: number;
  points: [number, number, number][]; // [x, y, pressure]
}

export type PageObjectType = 'image' | 'file';

export interface PageObject {
  id: string;
  type: PageObjectType;
  blobId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  mime: string;
  size: number;
}

export interface PaperConfig {
  style: PaperStyle;
  tint: string; // color name or hex
}

export interface Page {
  id: string;
  notebookId: string;
  title: string;
  paper: PaperConfig;
  doc: Record<string, unknown>; // Tiptap JSON content
  strokes: Stroke[];
  objects: PageObject[];
  height: number;
  order: number;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number | null;
}

export interface BlobRecord {
  id: string;
  blob: Blob;
  name: string;
  mime: string;
  size: number;
  createdAt?: number;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}
