import React, { useState } from 'react';
import type { Notebook, NotebookLayout } from '../../types/notebook';
import { Icon } from '../common/Icon';

interface NotebookModalProps {
  initialData?: Notebook | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; emoji: string; color: string; layout: NotebookLayout }) => void;
}

const EMOJI_OPTIONS = ['💼', '🤖', '🎮', '🧠', '⚡', '📓', '🎨', '🌿', '☕', '🚀', '💡', '📝', '🎯', '📚'];

const COLOR_OPTIONS = [
  { name: 'Sky', hex: '#BFDDF5' },
  { name: 'Lilac', hex: '#D9CCF2' },
  { name: 'Mint', hex: '#BFE6D3' },
  { name: 'Peach', hex: '#FFD3C2' },
  { name: 'Butter', hex: '#FFF0B8' },
  { name: 'Rose', hex: '#F6C6D8' },
];

export const NotebookModal: React.FC<NotebookModalProps> = ({
  initialData,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [emoji, setEmoji] = useState(initialData?.emoji || '📓');
  const [color, setColor] = useState(initialData?.color || '#BFDDF5');
  const layout: NotebookLayout = initialData?.layout || 'vertical';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), emoji, color, layout });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{initialData ? 'Edit Notebook' : 'Create New Notebook'}</h2>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Notebook Title</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Remote Job + Portfolio"
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Icon / Emoji</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  onClick={() => setEmoji(e)}
                  style={{
                    background: emoji === e ? 'var(--surface-alt)' : 'transparent',
                    border: emoji === e ? '2px solid var(--ink)' : '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '1.25rem',
                    width: '38px',
                    height: '38px',
                    cursor: 'pointer',
                    display: 'grid',
                    placeContent: 'center',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cover Tint</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  title={c.name}
                  onClick={() => setColor(c.hex)}
                  className={`color-swatch-btn ${color === c.hex ? 'active' : ''}`}
                  style={{
                    backgroundColor: c.hex,
                    width: '32px',
                    height: '32px',
                  }}
                />
              ))}
            </div>
          </div>


          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              {initialData ? 'Save Changes' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
