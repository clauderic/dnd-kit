/**
 * Universal icon component for the docs site.
 *
 * Resolution order:
 * 1. Brand icons (js, react, vuejs, svelte, solidjs) — rendered as inline
 *    SVGs from `simple-icons` with official brand colors.
 * 2. Font Awesome fallback — rendered via `@mintlify/components` Icon.
 */
import { Icon as MintlifyIcon } from '@mintlify/components';
import {
  siJavascript,
  siReact,
  siVuedotjs,
  siSvelte,
  siSolid,
} from 'simple-icons';

// --- Brand icons (simple-icons) ---

type SimpleIcon = { path: string; title: string; hex: string };

const brandIcons: Record<string, SimpleIcon> = {
  js: siJavascript,
  javascript: siJavascript,
  react: siReact,
  vuejs: siVuedotjs,
  vue: siVuedotjs,
  svelte: siSvelte,
  solidjs: siSolid,
  solid: siSolid,
};

// --- Component ---

interface IconProps {
  icon: string;
  size?: number;
  color?: string;
  className?: string;
  iconLibrary?: string;
}

export function Icon({ icon, size = 24, color, className }: IconProps) {
  // 1. Brand icons
  const brandIcon = brandIcons[icon];
  if (brandIcon) {
    const fillColor = color || `#${brandIcon.hex}`;
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={fillColor}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={brandIcon.path} />
      </svg>
    );
  }

  // 2. Font Awesome via @mintlify/components
  return (
    <MintlifyIcon
      icon={icon}
      size={size}
      color={color || 'var(--primary)'}
      className={className}
    />
  );
}

/**
 * Check if an icon name is a known brand icon.
 */
export function isBrandIcon(icon: string): boolean {
  return icon in brandIcons;
}

/**
 * Get the brand color for an icon, or undefined if not a brand icon.
 */
export function getBrandColor(icon: string): string | undefined {
  const brandIcon = brandIcons[icon];
  return brandIcon ? `#${brandIcon.hex}` : undefined;
}
