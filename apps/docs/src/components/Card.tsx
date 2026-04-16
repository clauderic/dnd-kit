/**
 * Custom Card component that replaces @mintlify/components Card.
 * Uses our Icon component for proper inline SVG rendering, avoiding
 * the mask-image clipping issues in @mintlify/components.
 *
 * Matches production styling: rounded-2xl, 1px border, px-6 py-5 padding.
 */
import { Icon } from './Icon';

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

export function Card({
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
          <Icon icon={icon} size={16} color={color} />
        </div>
      )}
      {title && (
        <div
          data-component-part="card-title"
          className="font-semibold text-gray-800 dark:text-gray-200 text-base leading-6"
        >
          {title}
        </div>
      )}
      {children && (
        <div className="text-base text-gray-600 dark:text-gray-400 mt-1.5 leading-6">{children}</div>
      )}
    </div>
  );

  const baseClasses =
    'card group block my-2 w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-transparent transition-colors no-underline';

  if (href) {
    return (
      <a href={href} className={`${baseClasses} cursor-pointer hover:border-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]`}>
        {content}
      </a>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
