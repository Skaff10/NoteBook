import React, { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { useNotebookStore } from '../../store/useNotebookStore';
import { VerticalSheet } from './VerticalSheet';
import { UnifiedToolbar } from './UnifiedToolbar';
import { Icon } from '../common/Icon';

export const PageEditor: React.FC = () => {
  const {
    activePage,
    updateActivePage,
    saveActivePageToDB,
    createPage,
  } = useNotebookStore();

  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      updateActivePage({ title: newTitle }, false);
    },
    [updateActivePage]
  );

  const handleDocChange = useCallback(
    (newDoc: Record<string, unknown>) => {
      updateActivePage({ doc: newDoc }, false);
    },
    [updateActivePage]
  );

  const handleFlushSave = useCallback(() => {
    saveActivePageToDB();
  }, [saveActivePageToDB]);

  const handleEditorReady = useCallback((editor: Editor) => {
    setEditorInstance(editor);
  }, []);

  if (!activePage) {
    return (
      <div
        className="editor-viewport"
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '360px',
            padding: '32px',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📖</div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--ink)' }}>
            No Page Selected
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '20px' }}>
            Choose a page from the left sidebar or create a new blank page to start writing.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => createPage()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon name="plus" size={16} /> Create Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="editor-viewport"
      style={{
        padding: '24px 32px 140px 32px',
        overflow: 'auto',
      }}
    >
      <VerticalSheet
        key={activePage.id}
        page={activePage}
        onTitleChange={handleTitleChange}
        onDocChange={handleDocChange}
        onFlushSave={handleFlushSave}
        onEditorReady={handleEditorReady}
      />

      <UnifiedToolbar editor={editorInstance} />
    </div>
  );
};

export default PageEditor;
