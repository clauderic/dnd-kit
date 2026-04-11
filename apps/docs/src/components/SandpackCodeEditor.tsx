/**
 * Standalone CodeMirror editor wired to Sandpack's useActiveCode.
 * No stitches dependency — all styling is via CSS and CM theme.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useActiveCode } from '@codesandbox/sandpack-react/unstyled';
import { openAssistant } from './Assistant/events';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const monokaiForeground = '#f8f8f2';
const monokaiBackground = '#1e1e1e';

const monokaiTheme = EditorView.theme({
  '&': {
    color: monokaiForeground,
    backgroundColor: monokaiBackground,
    fontSize: '14px',
    fontFamily: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, monospace',
  },
  '.cm-content': {
    padding: '12px 16px',
    caretColor: monokaiForeground,
  },
  '.cm-cursor': {
    borderLeftColor: monokaiForeground,
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(89, 109, 255, 0.2)',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-scroller': {
    overflow: 'auto',
    lineHeight: '20px',
  },
  '&.cm-focused': {
    outline: 'none',
  },
}, { dark: true });

const monokaiHighlighting = HighlightStyle.define([
  { tag: tags.keyword, color: '#f92672' },
  { tag: tags.operator, color: '#f92672' },
  { tag: tags.typeName, color: '#66d9ef', fontStyle: 'italic' },
  { tag: tags.tagName, color: '#f92672' },
  { tag: tags.attributeName, color: '#a6e22e' },
  { tag: tags.attributeValue, color: '#e6db74' },
  { tag: tags.definition(tags.variableName), color: '#a6e22e' },
  { tag: tags.variableName, color: '#f8f8f2' },
  { tag: tags.function(tags.variableName), color: '#a6e22e' },
  { tag: tags.propertyName, color: '#66d9ef' },
  { tag: tags.comment, color: '#75715e' },
  { tag: tags.string, color: '#e6db74' },
  { tag: tags.number, color: '#ae81ff' },
  { tag: tags.bool, color: '#ae81ff' },
  { tag: tags.null, color: '#ae81ff' },
  { tag: tags.regexp, color: '#e6db74' },
  { tag: tags.className, color: '#a6e22e' },
  { tag: tags.punctuation, color: '#f8f8f2' },
  { tag: tags.bracket, color: '#f8f8f2' },
  { tag: tags.angleBracket, color: '#f8f8f2' },
  { tag: tags.meta, color: '#75715e' },
]);

interface SandpackCodeEditorProps {
  height?: number;
}

export function SandpackCodeEditor({ height }: SandpackCodeEditorProps) {
  const { code, updateCode } = useActiveCode();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isExternalUpdate = useRef(false);

  const onUpdate = useCallback(
    (value: string) => {
      if (!isExternalUpdate.current) {
        updateCode(value);
      }
    },
    [updateCode],
  );

  // Create editor on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: code,
        extensions: [
          monokaiTheme,
          syntaxHighlighting(monokaiHighlighting),
          javascript({ jsx: true, typescript: true }),
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onUpdate(update.state.doc.toString());
            }
          }),
          EditorView.lineWrapping,
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Only on mount

  // Sync external code changes (e.g. tab switch) into CodeMirror
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentDoc = view.state.doc.toString();
    if (currentDoc !== code) {
      isExternalUpdate.current = true;
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: code },
      });
      isExternalUpdate.current = false;
    }
  }, [code]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = viewRef.current?.state.doc.toString() || code;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const handleAskAI = useCallback(() => {
    const text = viewRef.current?.state.doc.toString() || code;
    openAssistant({ code: text, language: 'tsx' });
  }, [code]);

  return (
    <div className="relative group/editor" style={height ? { height: `${height}px`, overflow: 'auto' } : undefined}>
      <div
        ref={containerRef}
        className="sp-code-editor"
        style={{ height: '100%' }}
      />
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/editor:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 rounded-md text-white/40 hover:text-white/70 cursor-pointer"
          aria-label="Copy"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
          )}
        </button>
        <button
          type="button"
          onClick={handleAskAI}
          className="p-1.5 rounded-md text-white/40 hover:text-white/70 cursor-pointer"
          aria-label="Ask AI"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></svg>
        </button>
      </div>
    </div>
  );
}
