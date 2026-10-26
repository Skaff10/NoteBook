import React, { useEffect, Suspense, lazy } from 'react';
import { useNotebookStore } from './store/useNotebookStore';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';

// Lazy-load the editor as required by the spec
const PageEditor = lazy(() => import('./components/Editor/PageEditor'));

export const App: React.FC = () => {
  const { init, isLoading } = useNotebookStore();

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'grid',
          placeContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📒</div>
          <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--ink-secondary)' }}>
            Opening your notebook...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="app-main">
        <Header />
        <Suspense
          fallback={
            <div
              style={{
                flex: 1,
                display: 'grid',
                placeContent: 'center',
                color: 'var(--muted)',
                fontSize: '0.9rem',
              }}
            >
              Loading page...
            </div>
          }
        >
          <PageEditor />
        </Suspense>
      </main>
    </div>
  );
};

export default App;
