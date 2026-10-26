import React, { useRef, useState, useEffect } from 'react';
import type { Page } from '../../types/notebook';
import type { Editor } from '@tiptap/react';
import { useNotebookStore } from '../../store/useNotebookStore';
import { TextEditor } from './TextEditor';
import { DrawingCanvas } from './DrawingCanvas';
import { ImageObjectsLayer } from './ImageObjectsLayer';
import { Icon } from '../common/Icon';

interface VerticalSheetProps {
  page: Page;
  onTitleChange: (title: string) => void;
  onDocChange: (doc: Record<string, unknown>) => void;
  onFlushSave: () => void;
  onEditorReady: (editor: Editor) => void;
}

export const VerticalSheet: React.FC<VerticalSheetProps> = ({
  page,
  onTitleChange,
  onDocChange,
  onFlushSave,
  onEditorReady,
}) => {
  const {
    editorMode,
    drawingTool,
    strokeColor,
    strokeSize,
    extendPageHeight,
    addObject,
    updateObject,
    deleteObject,
  } = useNotebookStore();

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [sheetWidth, setSheetWidth] = useState<number>(1000);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const paperStyleClass = `style-${page.paper.style}`;
  const sheetHeight = page.height || 1100;

  // Track dynamic width of the sheet as it scales to screen size
  useEffect(() => {
    if (!sheetRef.current) return;
    const updateWidth = () => {
      if (sheetRef.current) {
        setSheetWidth(sheetRef.current.clientWidth);
      }
    };
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(sheetRef.current);
    return () => observer.disconnect();
  }, []);

  // Drag and Drop files onto sheet
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const rect = sheetRef.current?.getBoundingClientRect();
      const dropX = rect ? e.clientX - rect.left : 80;
      const dropY = rect ? e.clientY - rect.top : 120;

      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          addObject(files[i], dropX + i * 20, dropY + i * 20);
        }
      }
    }
  };

  return (
    <div
      ref={sheetRef}
      className={`paper-sheet ${paperStyleClass}`}
      style={{
        backgroundColor: page.paper.tint,
        minHeight: `${sheetHeight}px`,
        height: `${sheetHeight}px`,
        position: 'relative',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: 'min(100%, 1400px)',
        outline: isDragOver ? '3px dashed var(--pen-indigo)' : 'none',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Paper Header */}
      <div className="paper-header" style={{ position: 'relative', zIndex: 2 }}>
        <input
          type="text"
          className="paper-title-input"
          value={page.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Page..."
          aria-label="Page Title"
        />
        <div className="paper-meta">
          <span>Created {new Date(page.createdAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{page.paper.style.toUpperCase()} PAPER</span>
          {page.objects && page.objects.length > 0 && (
            <>
              <span>•</span>
              <span>📷 {page.objects.length} Image{page.objects.length > 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Image Attachments Layer (Movable/Resizable) */}
      <ImageObjectsLayer
        objects={page.objects || []}
        editorMode={editorMode}
        onUpdateObject={updateObject}
        onDeleteObject={deleteObject}
      />

      {/* Text Editor Layer */}
      <div className="paper-content" style={{ position: 'relative', zIndex: 3 }}>
        <TextEditor
          key={page.id}
          pageId={page.id}
          initialContent={page.doc}
          onChange={onDocChange}
          onFlushSave={onFlushSave}
          onEditorReady={onEditorReady}
        />
      </div>

      {/* Drawing Canvas Layer (Vector perfect-freehand strokes) */}
      <DrawingCanvas
        width={sheetWidth}
        height={sheetHeight}
        strokes={page.strokes || []}
        editorMode={editorMode}
        drawingTool={drawingTool}
        strokeColor={strokeColor}
        strokeSize={strokeSize}
        isVertical={true}
      />

      {/* Add More Space Button at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          className="btn-icon-subtle"
          onClick={() => extendPageHeight(400)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 18px',
            boxShadow: 'var(--shadow-sm)',
            fontSize: '0.82rem',
            color: 'var(--ink)',
            cursor: 'pointer',
          }}
        >
          <Icon name="plus" size={14} /> Add more space
        </button>
      </div>
    </div>
  );
};
