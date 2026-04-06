import { useState, useEffect, useCallback, type ReactNode } from 'react';

interface LogoContextMenuProps {
  children: ReactNode;
  logoSrc: string;
  faviconSrc: string;
  href: string;
}

export function LogoContextMenu({ children, logoSrc, faviconSrc, href }: LogoContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  const close = useCallback(() => setPos(null), []);

  useEffect(() => {
    if (!pos) return;
    const handler = () => close();
    window.addEventListener('click', handler);
    window.addEventListener('contextmenu', handler);
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('contextmenu', handler);
      window.removeEventListener('scroll', handler);
    };
  }, [pos, close]);

  const openInNewTab = () => {
    window.open(href, '_blank');
    close();
  };

  const openLogoInNewTab = () => {
    window.open(logoSrc, '_blank');
    close();
  };

  const copyLogo = async () => {
    try {
      const res = await fetch(logoSrc);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    } catch {
      // Fallback: copy URL
      await navigator.clipboard.writeText(window.location.origin + logoSrc);
    }
    close();
  };

  const downloadFile = (src: string, filename: string) => {
    const a = document.createElement('a');
    a.href = src;
    a.download = filename;
    a.click();
    close();
  };

  const items = [
    { label: 'Open link in new tab', icon: ExternalLinkIcon, action: openInNewTab },
    { label: 'Open logo in new tab', icon: ImageIcon, action: openLogoInNewTab },
    { label: 'Copy logo', icon: CopyIcon, action: copyLogo },
    { label: 'Download logo', icon: DownloadIcon, action: () => downloadFile(logoSrc, 'dnd-kit-logo.svg') },
    { label: 'Download favicon', icon: DownloadIcon, action: () => downloadFile(faviconSrc, 'favicon.png') },
  ];

  return (
    <>
      <div onContextMenu={handleContextMenu}>{children}</div>
      {pos && (
        <div
          className="fixed z-[300] min-w-[200px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-xl p-1.5 animate-in fade-in"
          style={{ top: pos.y, left: pos.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="flex w-full items-center gap-3 px-2.5 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function ExternalLinkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>;
}

function ImageIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>;
}

function CopyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>;
}

function DownloadIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>;
}
