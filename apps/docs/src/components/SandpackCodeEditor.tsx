/**
 * Standalone CodeMirror editor wired to Sandpack's useActiveCode.
 * No stitches dependency — all styling is via CSS and CM theme.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useActiveCode } from '@codesandbox/sandpack-react/unstyled';
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

  return (
    <div
      ref={containerRef}
      className="sp-code-editor"
      style={height ? { height: `${height}px`, overflow: 'auto' } : undefined}
    />
  );
}
