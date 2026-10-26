import React, { useState, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { useNotebookStore } from '../../store/useNotebookStore';
import { Icon } from '../common/Icon';

interface UnifiedToolbarProps {
  editor: Editor | null;
}

const DRAWING_COLORS = [
  { name: 'Ink', hex: '#3B3A4A' },
  { name: 'Rose', hex: '#E07A9B' },
  { name: 'Coral', hex: '#F0907A' },
  { name: 'Amber', hex: '#E9B44C' },
  { name: 'Sage', hex: '#6FB38F' },
  { name: 'Teal', hex: '#4FA6A6' },
  { name: 'Sky', hex: '#5B9BD5' },
  { name: 'Indigo', hex: '#7B7FD6' },
  { name: 'Lilac', hex: '#A98BD9' },
  { name: 'Brown', hex: '#9B7B65' },
];

const PEN_SIZES = [
  { label: 'Fine', value: 3 },
  { label: 'Med', value: 6 },
  { label: 'Thick', value: 12 },
  { label: 'Bold', value: 20 },
];

const HIGHLIGHTER_SIZES = [
  { label: 'Fine', value: 12 },
  { label: 'Med', value: 20 },
  { label: 'Thick', value: 32 },
  { label: 'Bold', value: 48 },
];

const HIGHLIGHT_COLORS = [
  { name: 'Butter', hex: '#FFF0B8' },
  { name: 'Mint', hex: '#BFE6D3' },
  { name: 'Peach', hex: '#FFD3C2' },
  { name: 'Sky', hex: '#BFDDF5' },
  { name: 'Lilac', hex: '#D9CCF2' },
  { name: 'Rose', hex: '#F6C6D8' },
];

export const UnifiedToolbar: React.FC<UnifiedToolbarProps> = ({ editor }) => {
  const {
    editorMode,
    setEditorMode,
    drawingTool,
    setDrawingTool,
    strokeColor,
    setStrokeColor,
    strokeSize,
    setStrokeSize,
    undoDrawing,
    redoDrawing,
    clearStrokes,
    activePage,
    addObject,
  } = useNotebookStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showTextHighlightPicker, setShowTextHighlightPicker] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addObject(file);
      setEditorMode('move');
      e.target.value = '';
    }
  };

  const handleClearDrawing = () => {
    if (!activePage || !activePage.strokes?.length) return;
    if (window.confirm('Clear all handwritten drawings on this page?')) {
      clearStrokes();
    }
  };

  const currentSizes = drawingTool === 'highlighter' ? HIGHLIGHTER_SIZES : PEN_SIZES;

  return (
    <div className="floating-toolbar" role="toolbar" aria-label="Editor controls">
      {/* Mode Switcher Pill */}
      <div className="control-pill" style={{ marginRight: '4px' }}>
        <button
          type="button"
          className={`control-pill-btn ${editorMode === 'type' ? 'active' : ''}`}
          onClick={() => setEditorMode('type')}
          title="Type text notes"
        >
          <span style={{ fontWeight: 700 }}>T</span> Type
        </button>
        <button
          type="button"
          className={`control-pill-btn ${editorMode === 'draw' ? 'active' : ''}`}
          onClick={() => setEditorMode('draw')}
          title="Handwrite & draw"
        >
          <Icon name="edit" size={14} /> Draw
        </button>
        <button
          type="button"
          className={`control-pill-btn ${editorMode === 'erase' ? 'active' : ''}`}
          onClick={() => setEditorMode('erase')}
          title="Erase strokes"
        >
          <Icon name="strike" size={14} /> Erase
        </button>
        <button
          type="button"
          className={`control-pill-btn ${editorMode === 'move' ? 'active' : ''}`}
          onClick={() => setEditorMode('move')}
          title="Move and resize items"
        >
          <span>✋</span> Move
        </button>
      </div>

      {/* Add Picture Button */}
      <button
        type="button"
        className="toolbar-btn"
        onClick={() => fileInputRef.current?.click()}
        title="Add Picture / Screenshot"
        aria-label="Add Picture"
        style={{ width: 'auto', padding: '0 10px', gap: '5px', display: 'flex', alignItems: 'center' }}
      >
        <span>📷</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Image</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFileChange}
      />

      <div className="toolbar-divider" />

      {/* DRAW MODE CONTROLS */}
      {editorMode === 'draw' && (
        <>
          {/* Tool toggle: Pen, Marker, Rectangle, Circle, Triangle */}
          <div className="control-pill">
            <button
              type="button"
              className={`control-pill-btn ${drawingTool === 'pen' ? 'active' : ''}`}
              onClick={() => {
                setDrawingTool('pen');
                setStrokeSize(6);
              }}
              title="Freehand Pen"
            >
              ✏️ Pen
            </button>
            <button
              type="button"
              className={`control-pill-btn ${drawingTool === 'highlighter' ? 'active' : ''}`}
              onClick={() => {
                setDrawingTool('highlighter');
                setStrokeSize(20);
              }}
              title="Highlighter (Semi-transparent)"
            >
              <Icon name="highlighter" size={13} /> Marker
            </button>
            <button
              type="button"
              className={`control-pill-btn ${drawingTool === 'rectangle' ? 'active' : ''}`}
              onClick={() => {
                setDrawingTool('rectangle');
                setStrokeSize(4);
              }}
              title="Rectangle"
            >
              <Icon name="rectangle" size={13} /> Rect
            </button>
            <button
              type="button"
              className={`control-pill-btn ${drawingTool === 'circle' ? 'active' : ''}`}
              onClick={() => {
                setDrawingTool('circle');
                setStrokeSize(4);
              }}
              title="Circle / Ellipse"
            >
              <Icon name="circle" size={13} /> Circle
            </button>
            <button
              type="button"
              className={`control-pill-btn ${drawingTool === 'triangle' ? 'active' : ''}`}
              onClick={() => {
                setDrawingTool('triangle');
                setStrokeSize(4);
              }}
              title="Triangle"
            >
              <Icon name="triangle" size={13} /> Triangle
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* 4 Stroke Sizes */}
          <div className="toolbar-group">
            {currentSizes.map((s) => (
              <button
                key={s.label}
                type="button"
                className={`toolbar-btn ${strokeSize === s.value ? 'active' : ''}`}
                onClick={() => setStrokeSize(s.value)}
                style={{ fontSize: '0.75rem', fontWeight: 600, width: 'auto', padding: '0 8px' }}
                title={`${s.label} (${s.value}px)`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Color Swatches */}
          <div className="toolbar-group" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {DRAWING_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className={`color-swatch-btn ${strokeColor === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex, width: '22px', height: '22px' }}
                title={c.name}
                onClick={() => setStrokeColor(c.hex)}
              />
            ))}
            {/* Native custom color picker */}
            <label
              title="Custom Color"
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '1px dashed var(--border)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                style={{
                  position: 'absolute',
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                }}
              />
              <Icon name="palette" size={13} />
            </label>
          </div>

          <div className="toolbar-divider" />

          {/* Drawing Undo / Redo & Clear */}
          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-btn"
              onClick={undoDrawing}
              title="Undo stroke"
              aria-label="Undo stroke"
            >
              <Icon name="undo" size={15} />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={redoDrawing}
              title="Redo stroke"
              aria-label="Redo stroke"
            >
              <Icon name="redo" size={15} />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={handleClearDrawing}
              title="Clear all strokes"
              aria-label="Clear drawing"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>
        </>
      )}

      {/* ERASE MODE CONTROLS */}
      {editorMode === 'erase' && (
        <div className="toolbar-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Sweep across strokes to erase them
          </span>
          <button
            type="button"
            className="toolbar-btn"
            onClick={undoDrawing}
            title="Undo"
          >
            <Icon name="undo" size={15} />
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={redoDrawing}
            title="Redo"
          >
            <Icon name="redo" size={15} />
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClearDrawing}
            style={{ fontSize: '0.78rem', padding: '4px 10px' }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* MOVE MODE CONTROLS */}
      {editorMode === 'move' && (
        <div className="toolbar-group">
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            Drag or resize pictures & file cards on the sheet
          </span>
        </div>
      )}

      {/* TYPE MODE CONTROLS */}
      {editorMode === 'type' && editor && (
        <>
          {/* Undo / Redo */}
          <div className="toolbar-group">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Icon name="undo" size={15} />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Icon name="redo" size={15} />
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Headings */}
          <div className="toolbar-group">
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('paragraph') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().setParagraph().run()}
              title="Paragraph"
            >
              <Icon name="paragraph" size={15} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              title="Heading 1"
            >
              <Icon name="h1" size={15} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              title="Heading 2"
            >
              <Icon name="h2" size={15} />
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Basic Marks */}
          <div className="toolbar-group">
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
            >
              <Icon name="bold" size={15} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
            >
              <Icon name="italic" size={15} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
            >
              <Icon name="strike" size={15} />
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Lists */}
          <div className="toolbar-group">
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <Icon name="list-bullet" size={16} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <Icon name="list-ordered" size={16} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              title="Task checklist"
            >
              <Icon name="list-check" size={16} />
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* Text Color Picker */}
          <div className="toolbar-group" style={{ position: 'relative' }}>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => {
                setShowTextColorPicker(!showTextColorPicker);
                setShowTextHighlightPicker(false);
              }}
              title="Text Color"
            >
              <Icon name="palette" size={16} />
            </button>
            {showTextColorPicker && (
              <div className="popover-menu" style={{ width: '180px' }}>
                {DRAWING_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    className="color-swatch-btn"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    onClick={() => {
                      editor.chain().focus().setColor(c.hex).run();
                      setShowTextColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color Picker */}
          <div className="toolbar-group" style={{ position: 'relative' }}>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('highlight') ? 'active' : ''}`}
              onClick={() => {
                setShowTextHighlightPicker(!showTextHighlightPicker);
                setShowTextColorPicker(false);
              }}
              title="Highlight Color"
            >
              <Icon name="highlighter" size={16} />
            </button>
            {showTextHighlightPicker && (
              <div className="popover-menu" style={{ width: '140px' }}>
                {HIGHLIGHT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    className="color-swatch-btn"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: c.hex }).run();
                      setShowTextHighlightPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="toolbar-divider" />

          {/* Quotes & Code & HR */}
          <div className="toolbar-group">
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              title="Quote"
            >
              <Icon name="quote" size={15} />
            </button>
            <button
              type="button"
              className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              title="Code block"
            >
              <Icon name="code" size={15} />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Divider line"
            >
              <Icon name="minus" size={15} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
