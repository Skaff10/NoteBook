import React from 'react';
import { useNotebookStore } from '../../store/useNotebookStore';
import { Icon } from '../common/Icon';
import { NotebookList } from './NotebookList';
import { PageList } from './PageList';

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen, theme, toggleTheme } = useNotebookStore();

  return (
    <>
      <div
        className={`sidebar-backdrop ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <span className="app-logo">📒</span>
            <span>Notebook</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              className="btn-icon-subtle"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to Night theme' : 'Switch to Light theme'}
              title={theme === 'light' ? 'Night theme' : 'Light theme'}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={18} />
            </button>
            <button
              type="button"
              className="btn-icon-subtle"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </div>

        <div className="sidebar-scrollable">
          <NotebookList />
          <PageList />
        </div>
      </aside>
    </>
  );
};
