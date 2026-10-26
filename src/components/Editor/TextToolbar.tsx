import React, { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Icon } from '../common/Icon';

interface TextToolbarProps {
  editor: Editor | null;
}

const TEXT_COLORS = [
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

const HIGHLIGHT_COLORS = [
  { name: 'Butter', hex: '#FFF0B8' },
  { name: 'Mint', hex: '#BFE6D3' },
  { name: 'Peach', hex: '#FFD3C2' },
  { name: 'Sky', hex: '#BFDDF5' },
  { name: 'Lilac', hex: '#D9CCF2' },
  { name: 'Rose', hex: '#F6C6D8' },
];

export const TextToolbar: React.FC<TextToolbarProps> = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  if (!editor) return null;

  return (
    <div className="floating-toolbar" role="toolbar" aria-label="Text Formatting">
      {/* Undo / Redo */}
      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo (Ctrl+Z)"
          title="Undo"
        >
          <Icon name="undo" size={16} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo (Ctrl+Y)"
          title="Redo"
        >
          <Icon name="redo" size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Headings */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('paragraph') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().setParagraph().run()}
          aria-label="Paragraph text"
          title="Paragraph"
        >
          <Icon name="paragraph" size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Heading 1"
          title="Heading 1"
        >
          <Icon name="h1" size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Heading 2"
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
          aria-label="Bold (Ctrl+B)"
          title="Bold"
        >
          <Icon name="bold" size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic (Ctrl+I)"
          title="Italic"
        >
          <Icon name="italic" size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Strikethrough"
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
          aria-label="Bullet list"
          title="Bullet list"
        >
          <Icon name="list-bullet" size={16} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
          title="Numbered list"
        >
          <Icon name="list-ordered" size={16} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          aria-label="Checklist"
          title="Task Checklist"
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
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
          }}
          aria-label="Text Color"
          title="Text Color"
        >
          <Icon name="palette" size={16} />
        </button>

        {showColorPicker && (
          <div className="popover-menu" style={{ width: '180px' }}>
            {TEXT_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                className="color-swatch-btn"
                style={{ backgroundColor: c.hex }}
                title={c.name}
                onClick={() => {
                  editor.chain().focus().setColor(c.hex).run();
                  setShowColorPicker(false);
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
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
          }}
          aria-label="Highlight Color"
          title="Highlight Color"
        >
          <Icon name="highlighter" size={16} />
        </button>

        {showHighlightPicker && (
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
                  setShowHighlightPicker(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Blockquote & Code & Divider */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Blockquote"
          title="Quote"
        >
          <Icon name="quote" size={15} />
        </button>
        <button
          type="button"
          className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          aria-label="Code block"
          title="Code block"
        >
          <Icon name="code" size={15} />
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          aria-label="Horizontal rule"
          title="Divider line"
        >
          <Icon name="minus" size={15} />
        </button>
      </div>
    </div>
  );
};
