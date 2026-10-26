import React, { useState } from 'react';
import { useNotebookStore } from '../../store/useNotebookStore';
import type { Notebook, NotebookLayout } from '../../types/notebook';
import { Icon } from '../common/Icon';
import { NotebookModal } from './NotebookModal';

export const NotebookList: React.FC = () => {
  const {
    notebooks,
    activeNotebookId,
    selectNotebook,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    reorderNotebooks,
  } = useNotebookStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);

  const handleOpenCreate = () => {
    setEditingNotebook(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, nb: Notebook) => {
    e.stopPropagation();
    setEditingNotebook(nb);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, nb: Notebook) => {
    e.stopPropagation();
    if (window.confirm(`Delete notebook "${nb.title}"?`)) {
      deleteNotebook(nb.id);
    }
  };

  const handleMove = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= notebooks.length) return;

    const ids = notebooks.map((nb) => nb.id);
    const temp = ids[index];
    ids[index] = ids[newIndex];
    ids[newIndex] = temp;

    reorderNotebooks(ids);
  };

  const handleSaveModal = (data: { title: string; emoji: string; color: string; layout: NotebookLayout }) => {
    if (editingNotebook) {
      updateNotebook(editingNotebook.id, data);
    } else {
      createNotebook(data);
    }
  };

  return (
    <div>
      <div className="sidebar-section-header">
        <span className="sidebar-section-title">Notebooks</span>
        <button
          type="button"
          className="btn-icon-subtle"
          onClick={handleOpenCreate}
          aria-label="Add new notebook"
        >
          <Icon name="plus" size={14} /> New
        </button>
      </div>

      <div className="notebooks-list">
        {notebooks.map((nb, index) => {
          const isActive = nb.id === activeNotebookId;
          return (
            <div
              key={nb.id}
              className={`notebook-card ${isActive ? 'active' : ''}`}
              onClick={() => selectNotebook(nb.id)}
            >
              <div className="notebook-color-strip" style={{ backgroundColor: nb.color }} />
              <div className="notebook-emoji">{nb.emoji}</div>
              <div className="notebook-info">
                <div className="notebook-title">{nb.title}</div>
                <div className="notebook-meta">
                  <span>Notebook</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {index > 0 && (
                  <button
                    type="button"
                    className="notebook-actions-btn"
                    onClick={(e) => handleMove(e, index, 'up')}
                    aria-label="Move notebook up"
                    title="Move up"
                  >
                    <Icon name="arrow-up" size={13} />
                  </button>
                )}
                {index < notebooks.length - 1 && (
                  <button
                    type="button"
                    className="notebook-actions-btn"
                    onClick={(e) => handleMove(e, index, 'down')}
                    aria-label="Move notebook down"
                    title="Move down"
                  >
                    <Icon name="arrow-down" size={13} />
                  </button>
                )}
                <button
                  type="button"
                  className="notebook-actions-btn"
                  onClick={(e) => handleOpenEdit(e, nb)}
                  aria-label="Edit notebook"
                  title="Edit"
                >
                  <Icon name="edit" size={13} />
                </button>
                <button
                  type="button"
                  className="notebook-actions-btn"
                  onClick={(e) => handleDelete(e, nb)}
                  aria-label="Delete notebook"
                  title="Delete"
                >
                  <Icon name="trash" size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <NotebookModal
        key={editingNotebook?.id || 'new'}
        isOpen={isModalOpen}
        initialData={editingNotebook}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};
