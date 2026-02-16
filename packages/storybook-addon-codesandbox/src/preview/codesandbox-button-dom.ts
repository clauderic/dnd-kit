import {collectFiles} from '../collect-files.ts';
import {createSandbox, openSandbox, openStackBlitz} from '../define.ts';
import type {CodeSandboxParameters} from '../types.ts';

const BUTTON_ID = '__csb-addon-open-btn';

type ExportState = 'idle' | 'loading' | 'success' | 'error';

const SVG_ICON = [
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
  '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
  '<polyline points="7.5 4.21 12 6.81 16.5 4.21"/>',
  '<polyline points="7.5 19.79 7.5 14.6 3 12"/>',
  '<polyline points="21 12 16.5 14.6 16.5 19.79"/>',
  '<line x1="3.27" y1="6.96" x2="12" y2="12.01"/>',
  '<line x1="12" y1="12.01" x2="20.73" y2="6.96"/>',
  '<line x1="12" y1="22.08" x2="12" y2="12"/>',
  '</svg>',
].join('');

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

function isDarkMode(): boolean {
  return document.body.classList.contains('dark');
}

function getTheme() {
  return isDarkMode() ? themes.dark : themes.light;
}

export function removeCodeSandboxButton(): void {
  const existing = document.getElementById(BUTTON_ID);

  if (existing) {
    existing.remove();
  }
}

export function createCodeSandboxButton(
  params: CodeSandboxParameters
): HTMLButtonElement {
  let state: ExportState = 'idle';

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;

  // Icon
  const iconSpan = document.createElement('span');
  iconSpan.innerHTML = SVG_ICON;
  iconSpan.style.display = 'inline-flex';
  iconSpan.style.alignItems = 'center';

  // Label
  const labelSpan = document.createElement('span');
  labelSpan.textContent = 'Open Sandbox';

  btn.appendChild(iconSpan);
  btn.appendChild(labelSpan);

  // Base styles
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 14px',
    fontSize: '12px',
    fontWeight: '500',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '6px',
    cursor: 'pointer',
    zIndex: '9999',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    transition:
      'opacity 200ms ease, color 200ms ease, background-color 200ms ease, border-color 200ms ease',
    opacity: '0.85',
    borderWidth: '1px',
    borderStyle: 'solid',
    outline: 'none',
  });

  function getStatusColor(): string | undefined {
    return state === 'success'
      ? '#1eb99d'
      : state === 'error'
        ? '#e53e3e'
        : undefined;
  }

  function applyTheme() {
    const t = getTheme();
    const statusColor = getStatusColor();

    btn.style.color = statusColor ?? t.color;
    btn.style.backgroundColor = t.bg;
    btn.style.borderColor = statusColor ? `${statusColor}33` : t.border;
  }

  applyTheme();

  // Watch for dark mode class changes on <body>
  const observer = new MutationObserver(applyTheme);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });

  function updateState(newState: ExportState) {
    state = newState;

    const t = getTheme();
    const statusColor = getStatusColor();

    btn.style.color = statusColor ?? t.color;
    btn.style.borderColor = statusColor ? `${statusColor}33` : t.border;
    btn.style.opacity = state !== 'idle' ? '0.9' : '0.85';
    btn.disabled = state === 'loading';

    labelSpan.textContent =
      state === 'loading'
        ? 'Creating...'
        : state === 'success'
          ? 'Opened!'
          : state === 'error'
            ? 'Failed'
            : 'Open Sandbox';
  }

  // Hover effects
  btn.addEventListener('mouseenter', () => {
    const t = getTheme();
    const statusColor = getStatusColor();

    btn.style.opacity = '1';
    btn.style.color = statusColor ?? t.colorHover;
    btn.style.backgroundColor = t.bgHover;
    btn.style.borderColor = statusColor ? `${statusColor}55` : t.borderHover;
  });

  btn.addEventListener('mouseleave', () => {
    const t = getTheme();
    const statusColor = getStatusColor();

    if (state === 'idle') {
      btn.style.opacity = '0.85';
    }

    btn.style.color = statusColor ?? t.color;
    btn.style.backgroundColor = t.bg;
    btn.style.borderColor = statusColor ? `${statusColor}33` : t.border;
  });

  // Click handler
  btn.addEventListener('click', async () => {
    if (state === 'loading') return;

    updateState('loading');

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

      if (params.provider === 'stackblitz') {
        openStackBlitz(files, {
          title: 'dnd-kit sandbox',
          template: params.template ?? 'node',
          openFile: params.mainFile,
        });
      } else {
        const sandboxId = await createSandbox(files, params.template);
        openSandbox(sandboxId, params.mainFile);
      }

      updateState('success');
      setTimeout(() => updateState('idle'), 2000);
    } catch (error) {
      console.error('[CodeSandbox Addon]', error);
      updateState('error');
      setTimeout(() => updateState('idle'), 3000);
    }
  });

  return btn;
}
