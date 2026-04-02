/**
 * Framework icons sourced from Simple Icons (https://simpleicons.org/)
 * via the `simple-icons` npm package.
 */
import {
  siJavascript,
  siReact,
  siVuedotjs,
  siSvelte,
  siSolid,
} from 'simple-icons';

interface IconProps {
  className?: string;
  size?: number;
}

function SimpleIcon({
  icon,
  className,
  size = 16,
}: IconProps & { icon: { path: string; title: string } }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
}

export function JavaScriptIcon(props: IconProps) {
  return <SimpleIcon icon={siJavascript} {...props} />;
}

export function ReactIcon(props: IconProps) {
  return <SimpleIcon icon={siReact} {...props} />;
}

export function VueIcon(props: IconProps) {
  return <SimpleIcon icon={siVuedotjs} {...props} />;
}

export function SvelteIcon(props: IconProps) {
  return <SimpleIcon icon={siSvelte} {...props} />;
}

export function SolidIcon(props: IconProps) {
  return <SimpleIcon icon={siSolid} {...props} />;
}

// Map from docs.json icon names to components
export const frameworkIconMap: Record<
  string,
  React.ComponentType<IconProps>
> = {
  js: JavaScriptIcon,
  react: ReactIcon,
  vuejs: VueIcon,
  svelte: SvelteIcon,
  solidjs: SolidIcon,
};
