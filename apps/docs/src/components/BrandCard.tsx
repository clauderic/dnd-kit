/**
 * Custom Card component that uses DocsIcon for proper brand-colored icons.
 * Replaces @mintlify/components Card in the MDX components map.
 */
import { cn } from '@mintlify/components';
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
}

export function BrandCard({
  title,
  icon,
  color,
  href,
  children,
  className,
}: CardProps) {
  const content = (
    <>
      {icon && (
        <div className="mb-2">
          <DocsIcon icon={icon} size={24} color={color} />
        </div>
      )}
      {title && (
        <div
          data-component-part="card-title"
          className="font-semibold text-gray-900 text-sm"
        >
          {title}
        </div>
      )}
      {children && (
        <div className="text-sm text-gray-500 mt-1">{children}</div>
      )}
    </>
  );

  const cardClasses = cn(
    'card block rounded-xl border border-gray-200 p-4 no-underline transition-colors hover:border-(--primary)',
    className,
  );

  if (href) {
    return (
      <a href={href} className={cardClasses}>
        {content}
      </a>
    );
  }

  return <div className={cardClasses}>{content}</div>;
}
