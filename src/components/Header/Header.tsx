import React from 'react';
import { useNotebookStore } from '../../store/useNotebookStore';
import type { PaperStyle } from '../../types/notebook';
import { Icon } from '../common/Icon';

const PAPER_STYLES: { id: PaperStyle; label: string }[] = [
  { id: 'lined', label: 'Lined' },
  { id: 'dotted', label: 'Dotted' },
  { id: 'grid', label: 'Grid' },
  { id: 'blank', label: 'Blank' },
];

const TINTS: { label: string; hex: string }[] = [
  { label: 'Sky', hex: '#BFDDF5' },
  { label: 'Lilac', hex: '#D9CCF2' },
  { label: 'Mint', hex: '#BFE6D3' },
  { label: 'Peach', hex: '#FFD3C2' },
  { label: 'Butter', hex: '#FFF0B8' },
  { label: 'Rose', hex: '#F6C6D8' },
  { label: 'White', hex: '#FFFFFF' },
];

export const Header: React.FC = () => {
  const {
    toggleSidebar,
    isSidebarOpen,
    notebooks,
    activeNotebookId,
    activePage,
    saveStatus,
    setPaperStyle,
    setPaperTint,
  } = useNotebookStore();

  const currentNotebook = notebooks.find((nb) => nb.id === activeNotebookId);

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="btn-icon-subtle"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Minimize sidebar' : 'Open sidebar'}
          title={isSidebarOpen ? 'Minimize sidebar' : 'Open sidebar'}
          style={{
            border: !isSidebarOpen ? '1px solid var(--border)' : undefined,
            background: !isSidebarOpen ? 'var(--surface-alt)' : undefined,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Icon name="menu" size={18} />
          {!isSidebarOpen && <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Notebooks</span>}
        </button>

        {currentNotebook && (
          <div className="header-breadcrumb">
            <span>{currentNotebook.emoji}</span>
            <span>{currentNotebook.title}</span>
            <span className="header-breadcrumb-muted">/</span>
            <span style={{ fontWeight: 400 }}>{activePage?.title || 'No page selected'}</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {activePage && (
          <>
            {/* Paper style picker */}
            <div className="control-pill" title="Paper Style">
              {PAPER_STYLES.map((ps) => (
                <button
                  key={ps.id}
                  type="button"
                  className={`control-pill-btn ${activePage.paper.style === ps.id ? 'active' : ''}`}
                  onClick={() => setPaperStyle(ps.id)}
                >
                  {ps.label}
                </button>
              ))}
            </div>

            {/* Paper tint picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title="Paper Tint">
              {TINTS.map((t) => (
                <button
                  key={t.hex}
                  type="button"
                  aria-label={t.label}
                  onClick={() => setPaperTint(t.hex)}
                  className={`color-swatch-btn ${activePage.paper.tint === t.hex ? 'active' : ''}`}
                  style={{
                    backgroundColor: t.hex,
                    width: '20px',
                    height: '20px',
                    border: t.hex === '#FFFFFF' ? '1px solid var(--border)' : undefined,
                  }}
                />
              ))}
            </div>

            {/* Quiet Save Indicator */}
            <div
              className={`save-status-indicator ${saveStatus === 'saving' ? 'saving' : ''}`}
              title={saveStatus === 'saved' ? 'All changes saved locally' : 'Saving changes...'}
            >
              {saveStatus === 'saved' ? (
                <>
                  <Icon name="check" size={14} style={{ color: '#6FB38F' }} />
                  <span>Saved</span>
                </>
              ) : (
                <span>Saving...</span>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};
