import type { Notebook, Page } from '../types/notebook';

export const SEED_NOTEBOOKS: Omit<Notebook, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'nb-remote-job',
    title: 'Remote Job + Portfolio',
    emoji: '💼',
    color: '#BFDDF5', // sky
    order: 0,
    layout: 'vertical',
  },
  {
    id: 'nb-ai-instagram',
    title: 'AI/Tech Instagram',
    emoji: '🤖',
    color: '#D9CCF2', // lilac
    order: 1,
    layout: 'vertical',
  },
  {
    id: 'nb-gaming-instagram',
    title: 'Gaming Instagram',
    emoji: '🎮',
    color: '#BFE6D3', // mint
    order: 2,
    layout: 'vertical',
  },
  {
    id: 'nb-ai-study',
    title: 'AI Engineering Study',
    emoji: '🧠',
    color: '#FFD3C2', // peach
    order: 3,
    layout: 'vertical',
  },
  {
    id: 'nb-quick-notes',
    title: 'Quick Notes',
    emoji: '⚡',
    color: '#FFF0B8', // butter
    order: 4,
    layout: 'vertical',
  },
];

export function getSeedPages(): Page[] {
  const now = Date.now();

  return [
    {
      id: 'page-remote-job-welcome',
      notebookId: 'nb-remote-job',
      title: 'Remote Engineering Career Blueprint',
      paper: { style: 'lined', tint: '#BFDDF5' },
      height: 1200,
      order: 0,
      pinned: true,
      strokes: [],
      objects: [],
      createdAt: now,
      updatedAt: now,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '🎯 Remote Frontend & Full-Stack Blueprint' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'highlight', attrs: { color: '#FFF0B8' } }, { type: 'bold' }],
                text: 'Goal: Secure a high-impact global remote role with an outstanding local-first portfolio.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '📦 Portfolio Highlights' }],
          },
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: true },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Local-first Canvas Notebook (Dexie, Tiptap, Perfect-Freehand, PWA)' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'High-performance interactive data dashboard & WebGL visualizations' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Case study write-up highlighting offline sync & sub-second latency' }] }],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '📋 Weekly Target Routine' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Send 5 tailored applications with personalized loom demo walkthroughs' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Engage with 3 engineering leads on LinkedIn and X/Twitter' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Solve 3 medium Leetcode problems + review system design patterns' }] }],
              },
            ],
          },
          {
            type: 'horizontalRule',
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'italic' }, { type: 'textStyle', attrs: { color: '#8A87A0' } }],
                text: 'Tip: You can draw handwritten annotations, checklist highlights, and sticky notes right here on this page!',
              },
            ],
          },
        ],
      },
    },
    {
      id: 'page-ai-instagram-welcome',
      notebookId: 'nb-ai-instagram',
      title: 'Faceless AI Channel Roadmap',
      paper: { style: 'dotted', tint: '#D9CCF2' },
      height: 1200,
      order: 0,
      pinned: true,
      strokes: [],
      objects: [],
      createdAt: now,
      updatedAt: now,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '🤖 Faceless AI/Tech Growth Engine' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Curate high-signal AI developments, open source tools, and practical productivity workflows with cinematic visual hooks.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '🌟 Content Pillars' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pillar 1: "AI tools you will actually use" (30-second rapid demos)' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pillar 2: "Before & After" automation case studies' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pillar 3: High-value carousel cheat sheets (Prompts & Architectures)' }] }],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '📅 Production Pipeline' }],
          },
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: true },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Research top trending repositories on GitHub and HuggingFace' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Draft 7 hook scripts using pattern interruption' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Batch render screen captures with smooth cursor zooming' }] }],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'page-gaming-instagram-welcome',
      notebookId: 'nb-gaming-instagram',
      title: 'Faceless Gaming Channel Masterplan',
      paper: { style: 'grid', tint: '#BFE6D3' },
      height: 1200,
      order: 0,
      pinned: true,
      strokes: [],
      objects: [],
      createdAt: now,
      updatedAt: now,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '🎮 Faceless Gaming Aesthetic & Growth' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Captivating short-form gaming moments, hidden secrets, cozy indie games, and cinematic transitions without showing face.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '🎬 High-Retention Reel Formats' }],
          },
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '"Games that feel like a warm hug on a rainy evening"' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: '"Secrets in [Popular Game] 99% of players never found"' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Satisfying sound design & 4K cinematic camera pans' }] }],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'page-ai-study-welcome',
      notebookId: 'nb-ai-study',
      title: 'AI Engineering Curriculum & Notes',
      paper: { style: 'lined', tint: '#FFD3C2' },
      height: 1200,
      order: 0,
      pinned: true,
      strokes: [],
      objects: [],
      createdAt: now,
      updatedAt: now,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '🧠 Self-Study AI Engineering Curriculum' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [{ type: 'bold' }],
                text: 'Core Objective: Master modern LLM deployment, fine-tuning, RAG, and agentic reasoning architectures.',
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '🧭 Mastery Roadmap' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Foundations: Vector embeddings, tokenizers, cosine similarity & semantic search' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'RAG Architecture: Hybrid search (BM25 + Dense), rerankers, contextual retrieval' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Fine-Tuning: LoRA, QLoRA, DPO/RLHF datasets on custom tasks' }] }],
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Agents & Tool-Calling: Multi-step planning, memory layers, self-correction loops' }] }],
              },
            ],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: '📚 Reading List & Papers' }],
          },
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: true },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Attention Is All You Need (Vaswani et al.)' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'LoRA: Low-Rank Adaptation of Large Language Models' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Direct Preference Optimization (Rafailov et al.)' }] }],
              },
            ],
          },
        ],
      },
    },
    {
      id: 'page-quick-notes-welcome',
      notebookId: 'nb-quick-notes',
      title: 'Daily Scratchpad & Quick Captures',
      paper: { style: 'lined', tint: '#FFF0B8' },
      height: 1200,
      order: 0,
      pinned: true,
      strokes: [],
      objects: [],
      createdAt: now,
      updatedAt: now,
      doc: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '⚡ Quick Scratchpad' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Capture spontaneous thoughts, daily wins, quick todos, or code snippets before filing them into project notebooks.',
              },
            ],
          },
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Try changing the paper style from lined to dotted or grid in the top bar' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test rich text shortcuts: Cmd/Ctrl+B, Cmd/Ctrl+I, lists, highlights' }] }],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Switch notebook layout between Vertical and Horizontal' }] }],
              },
            ],
          },
        ],
      },
    },
  ];
}
