/**
 * Custom right-click context menu on the logo.
 * Offers: Open link, Open logo, Copy logo, Download logo, Download favicon.
 *
 * Compatible with Astro view transitions — event listeners are registered once
 * on `document` (which persists across navigations) while the menu element and
 * styles are re-created after each swap via `astro:page-load`.
 */

const LOGO_SRC = '/images/logo/logo.svg';
const FAVICON_SRC = '/favicon.png';
const STYLE_ID = 'logo-ctx-menu-style';
const MENU_ID = 'logo-ctx-menu';

let listenersAttached = false;

function getOrCreateMenu(): HTMLDivElement {
  let menu = document.getElementById(MENU_ID) as HTMLDivElement | null;
  if (menu) return menu;

  menu = document.createElement('div');
  menu.id = MENU_ID;
  menu.className =
    'fixed z-[300] min-w-[220px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl p-1.5';
  menu.style.display = 'none';
  menu.innerHTML = `
    <button data-action="open-link" type="button" class="ctx-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>Open link in new tab</button>
    <button data-action="open-logo" type="button" class="ctx-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>Open logo in new tab</button>
    <button data-action="copy-logo" type="button" class="ctx-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>Copy logo</button>
    <button data-action="download-logo" type="button" class="ctx-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>Download logo</button>
    <button data-action="download-favicon" type="button" class="ctx-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>Download favicon</button>
  `;
  document.body.appendChild(menu);
  return menu;
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `.ctx-item{display:flex;width:100%;align-items:center;gap:0.75rem;padding:0.5rem 0.625rem;font-size:0.875rem;font-weight:500;border-radius:0.5rem;color:rgb(55,65,81);cursor:pointer;border:none;background:none;transition:background-color 0.1s}.ctx-item:hover{background-color:rgb(243,244,246)}.dark .ctx-item{color:rgb(209,213,219)}.dark .ctx-item:hover{background-color:rgba(255,255,255,0.05)}.ctx-item svg{flex-shrink:0;color:rgb(156,163,175)}`;
  document.head.appendChild(style);
}

function close() {
  const menu = document.getElementById(MENU_ID) as HTMLDivElement | null;
  if (menu) menu.style.display = 'none';
}

function download(src: string, filename: string) {
  const a = document.createElement('a');
  a.href = src;
  a.download = filename;
  a.click();
}

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  document.addEventListener('contextmenu', (e) => {
    const link = (e.target as HTMLElement).closest('[data-logo-link]');
    if (!link) return;

    e.preventDefault();
    const menu = getOrCreateMenu();
    menu.style.display = 'block';
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;
  });

  document.addEventListener('click', (e) => {
    const menu = document.getElementById(MENU_ID);
    if (!menu || menu.style.display === 'none') return;

    const action = (e.target as HTMLElement).closest('[data-action]')?.getAttribute('data-action');
    if (action) {
      e.preventDefault();
      switch (action) {
        case 'open-link':
          window.open('/', '_blank');
          break;
        case 'open-logo':
          window.open(LOGO_SRC, '_blank');
          break;
        case 'copy-logo':
          fetch(LOGO_SRC)
            .then((r) => r.blob())
            .then((blob) => navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]))
            .catch(() => navigator.clipboard.writeText(window.location.origin + LOGO_SRC));
          break;
        case 'download-logo':
          download(LOGO_SRC, 'dnd-kit-logo.svg');
          break;
        case 'download-favicon':
          download(FAVICON_SRC, 'favicon.png');
          break;
      }
    }

    close();
  });

  document.addEventListener('scroll', close);
}

// Runs on initial load and after each Astro view transition
function init() {
  ensureStyles();
  attachListeners();
}

init();

// Re-initialize after Astro view transition swaps the DOM
document.addEventListener('astro:page-load', init);

// Clean up the menu element before the swap so it doesn't get duplicated
document.addEventListener('astro:before-swap', () => {
  document.getElementById(MENU_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
});

export {};
