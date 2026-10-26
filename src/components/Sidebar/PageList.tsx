import React from 'react';
import { useNotebookStore } from '../../store/useNotebookStore';
import { Icon } from '../common/Icon';

export const PageList: React.FC = () => {
  const {
    pages,
    activePageId,
    selectPage,
    createPage,
    deletePage,
    togglePinPage,
    reorderPages,
  } = useNotebookStore();

  const handleAddPage = () => {
    createPage();
  };

  const handleDelete = (e: React.MouseEvent, pageId: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete page "${title}"?`)) {
      deletePage(pageId);
    }
  };

  const handleTogglePin = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    togglePinPage(pageId);
  };

  const handleMove = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const ids = pages.map((p) => p.id);
    const temp = ids[index];
    ids[index] = ids[newIndex];
    ids[newIndex] = temp;

    reorderPages(ids);
  };

  return (
    <div>
      <div className="sidebar-section-header">
        <span className="sidebar-section-title">Pages ({pages.length})</span>
        <button
          type="button"
          className="btn-icon-subtle"
          onClick={handleAddPage}
          aria-label="Add new page"
        >
          <Icon name="plus" size={14} /> Add Page
        </button>
      </div>

      <div className="pages-list">
        {pages.length === 0 ? (
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '12px 6px', fontStyle: 'italic' }}>
            No pages in this notebook yet. Click "+ Add Page" to start.
          </div>
        ) : (
          pages.map((p, index) => {
            const isActive = p.id === activePageId;
            return (
              <div
                key={p.id}
                className={`page-item ${isActive ? 'active' : ''}`}
                onClick={() => selectPage(p.id)}
              >
                <div className="page-item-title">
                  {p.pinned && (
                    <span className="page-item-pin" title="Pinned page">
                      <Icon name="pin-filled" size={13} />
                    </span>
                  )}
                  <span>{p.title || 'Untitled Page'}</span>
                </div>

                <div className="page-item-actions">
                  {index > 0 && (
                    <button
                      type="button"
                      className="btn-icon-subtle"
                      onClick={(e) => handleMove(e, index, 'up')}
                      aria-label="Move page up"
                      title="Move up"
                    >
                      <Icon name="arrow-up" size={12} />
                    </button>
                  )}
                  {index < pages.length - 1 && (
                    <button
                      type="button"
                      className="btn-icon-subtle"
                      onClick={(e) => handleMove(e, index, 'down')}
                      aria-label="Move page down"
                      title="Move down"
                    >
                      <Icon name="arrow-down" size={12} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={(e) => handleTogglePin(e, p.id)}
                    aria-label={p.pinned ? 'Unpin page' : 'Pin page'}
                    title={p.pinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Icon name={p.pinned ? 'pin-filled' : 'pin'} size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon-subtle"
                    onClick={(e) => handleDelete(e, p.id, p.title)}
                    aria-label="Delete page"
                    title="Delete"
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
