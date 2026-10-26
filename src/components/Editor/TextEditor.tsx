import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList, TaskItem } from '@tiptap/extension-list';
import type { Editor } from '@tiptap/react';
import { useNotebookStore } from '../../store/useNotebookStore';

interface TextEditorProps {
  pageId: string;
  initialContent: Record<string, unknown> | null;
  onChange: (doc: Record<string, unknown>) => void;
  onFlushSave: () => void;
  onEditorReady?: (editor: Editor) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  initialContent,
  onChange,
  onFlushSave,
  onEditorReady,
}) => {
  const { addObject } = useNotebookStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
      transformPastedHTML(html) {
        return html
          .replace(/background-color\s*:\s*[^;"]+;?/gi, '')
          .replace(/background\s*:\s*[^;"]+;?/gi, '');
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) {
                addObject(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON());
    },
    onBlur: () => {
      onFlushSave();
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Handle visibilitychange and beforeunload for safety
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onFlushSave();
      }
    };
    const handleBeforeUnload = () => {
      onFlushSave();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onFlushSave]);

  return (
    <div className="tiptap-container">
      <EditorContent editor={editor} />
    </div>
  );
};
