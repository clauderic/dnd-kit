/**
 * Generic icon component that renders brand icons from simple-icons with
 * their official brand colors, and falls back to @mintlify/components Icon
 * (Font Awesome) for everything else.
 */
import { Icon } from '@mintlify/components';
import {
  siJavascript,
  siReact,
  siVuedotjs,
  siSvelte,
  siSolid,
} from 'simple-icons';

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

interface DocsIconProps {
  icon: string;
  size?: number;
  color?: string;
  className?: string;
}

export function DocsIcon({ icon, size = 24, color, className }: DocsIconProps) {
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

  // Fall back to @mintlify/components Icon (Font Awesome)
  return (
    <Icon
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
