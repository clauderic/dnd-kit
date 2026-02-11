import React, {useCallback, useEffect, useState} from 'react';

import {collectFiles} from '../collect-files.ts';
import {createSandbox, openSandbox} from '../define.ts';
import type {CodeSandboxParameters} from '../types.ts';

type ExportState = 'idle' | 'loading' | 'success' | 'error';

function CodeSandboxIcon({size = 14}: {size?: number}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
      <polyline points="7.5 19.79 7.5 14.6 3 12" />
      <polyline points="21 12 16.5 14.6 16.5 19.79" />
      <line x1="3.27" y1="6.96" x2="12" y2="12.01" />
      <line x1="12" y1="12.01" x2="20.73" y2="6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

const themes = {
  light: {
    color: 'rgba(60, 70, 90, 0.5)',
    colorHover: 'rgba(50, 60, 100, 0.75)',
    bg: 'rgba(236, 238, 243, 0.25)',
    bgHover: 'rgba(210, 218, 235, 0.5)',
    border: 'rgba(180, 190, 210, 0.3)',
    borderHover: 'rgba(160, 175, 210, 0.45)',
  },
  dark: {
    color: 'rgba(180, 190, 210, 0.5)',
    colorHover: 'rgba(210, 218, 235, 0.8)',
    bg: 'rgba(255, 255, 255, 0.06)',
    bgHover: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.16)',
  },
};

function useDarkMode() {
  const [dark, setDark] = useState(
    () => document.body.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.body.classList.contains('dark'));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return dark;
}

const baseStyles: React.CSSProperties = {
  position: 'fixed',
  bottom: 12,
  right: 12,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '10px 14px',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'system-ui, sans-serif',
  borderRadius: 6,
  cursor: 'pointer',
  zIndex: 9999,
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  transition:
    'opacity 200ms ease, color 200ms ease, background-color 200ms ease, border-color 200ms ease',
  opacity: 0.85,
};

interface Props {
  params: CodeSandboxParameters;
}

export function CodeSandboxButton({params}: Props) {
  const [state, setState] = useState<ExportState>('idle');
  const isDark = useDarkMode();
  const t = isDark ? themes.dark : themes.light;

  const handleClick = useCallback(async () => {
    if (state === 'loading') return;

    setState('loading');

    try {
      const mainFile = params.mainFile ?? 'src/App.jsx';
      const storySource = params.files?.[mainFile];

      if (!storySource) {
        throw new Error('No story source found.');
      }

      const sourceContent =
        typeof storySource === 'string' ? storySource : storySource.content;

      const files = collectFiles({
        globalParams: {},
        storyParams: params,
        storySource: sourceContent,
      });

      const sandboxId = await createSandbox(files, params.template);

      openSandbox(sandboxId, params.mainFile);

      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      console.error('[CodeSandbox Addon]', error);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, [params, state]);

  const label =
    state === 'loading'
      ? 'Creating...'
      : state === 'success'
        ? 'Opened!'
        : state === 'error'
          ? 'Failed'
          : 'Open in CodeSandbox';

  const isActive = state !== 'idle';
  const statusColor =
    state === 'success'
      ? '#1eb99d'
      : state === 'error'
        ? '#e53e3e'
        : undefined;

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      style={{
        ...baseStyles,
        color: statusColor ?? t.color,
        backgroundColor: t.bg,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: statusColor ? `${statusColor}33` : t.border,
        opacity: isActive ? 0.9 : baseStyles.opacity,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.color = statusColor ?? t.colorHover;
        e.currentTarget.style.backgroundColor = t.bgHover;
        e.currentTarget.style.borderColor = statusColor
          ? `${statusColor}55`
          : t.borderHover;
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.opacity = String(baseStyles.opacity);
          e.currentTarget.style.color = statusColor ?? t.color;
          e.currentTarget.style.backgroundColor = t.bg;
          e.currentTarget.style.borderColor = statusColor
            ? `${statusColor}33`
            : t.border;
        }
      }}
    >
      <CodeSandboxIcon size={14} />
      {label}
    </button>
  );
}
