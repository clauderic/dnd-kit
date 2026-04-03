/**
 * Custom Card component that replaces @mintlify/components Card.
 * Uses DocsIcon for proper brand-colored icons rendered as inline SVGs,
 * avoiding the mask-image clipping issues in @mintlify/components.
 *
 * Matches production styling: rounded-2xl, 1px border, px-6 py-5 padding.
 */
import { DocsIcon } from './DocsIcon';

interface CardProps {
  title?: string;
  icon?: string;
  iconType?: string;
  iconLibrary?: string;
  color?: string;
  href?: string;
  horizontal?: boolean;
  children?: React.ReactNode;
  img?: string;
  className?: string;
  disabled?: boolean;
  cta?: string;
  arrow?: boolean;
  as?: React.ElementType;
}

export function BrandCard({
  title,
  icon,
  color,
  href,
  children,
}: CardProps) {
  const content = (
    <div className="px-6 py-5 relative">
      {icon && (
        <div className="mb-3">
          <DocsIcon icon={icon} size={16} color={color} />
        </div>
      )}
      {title && (
        <div
          data-component-part="card-title"
          className="font-semibold text-gray-900 text-sm leading-tight"
        >
          {title}
        </div>
      )}
      {children && (
        <div className="text-sm text-gray-500 mt-1.5 leading-relaxed">{children}</div>
      )}
    </div>
  );

  const cardClasses =
    'card group block my-2 w-full rounded-2xl border border-black/10 bg-white cursor-pointer transition-colors hover:border-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] no-underline';

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
