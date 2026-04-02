/**
 * Wrapper around @mintlify/components Card that injects brand-colored icons.
 *
 * For brand icons (js, react, vuejs, svelte, solidjs), we pass the brand
 * hex color via the `color` prop so @mintlify/components renders the icon
 * with the correct color. For everything else, we pass through unchanged.
 */
import { Card } from '@mintlify/components';
import { getBrandColor } from './DocsIcon';

export function BrandCard(props: React.ComponentProps<typeof Card>) {
  const { icon, color, ...rest } = props;
  const brandColor = icon && !color ? getBrandColor(icon) : undefined;

  return <Card icon={icon} color={brandColor || color} {...rest} />;
}
