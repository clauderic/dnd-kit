/**
 * MDX component overrides for the docs site.
 *
 * This module is aliased via Vite to replace '@mintlify/astro/components'
 * so that all MDX content uses our custom components instead of the
 * @mintlify/components barrel export (which pulls in Shiki + mermaid).
 *
 * Components are either custom implementations or lightweight wrappers.
 * Only the Mintlify components that truly need their full implementation
 * are imported from @mintlify/components (SSR-only, not hydrated).
 */

// Import Mintlify components that we can't easily replace (complex, interactive)
// These only run at SSR time since they're used as MDX component overrides.
import {
  Accordion,
  Check,
  Expandable,
  Frame,
  Info,
  Note,
  Steps,
  Tabs,
  Tip,
  Update as MintlifyUpdate,
  Warning,
} from '@mintlify/components';

// Import custom overrides (these DO NOT import from @mintlify/components)
import { Card } from '../components/Card';
import { CodeBlock } from '../components/CodeBlock';
import { CodeGroup } from '../components/CodeGroup';
import { ParamField } from '../components/ParamField';
import { PreElement } from '../components/PreElement';

// Wrap Update to always pass isVisible and auto-generate id
function Update(props: any) {
  const id = props.id || props.label?.toLowerCase().replace(/\s+/g, '-') || 'update';
  return <MintlifyUpdate {...props} id={id} isVisible={true} />;
}

// Lightweight CardGroup — just a CSS grid
function CardGroup({ children, cols = 2, className }: any) {
  const n = Number(cols) || 2;
  return (
    <div
      className={`grid max-w-none gap-4 sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))] ${className || ''}`}
      style={{ '--cols': n } as any}
    >
      {children}
    </div>
  );
}

// Noop wrapper for components used in code examples but not rendered
function Noop({ children }: any) {
  return <div>{children}</div>;
}

export const components = {
  // Interactive Mintlify components (SSR-rendered, no client JS)
  Accordion,
  AccordionGroup: Accordion.Group,
  Check,
  Expandable,
  Frame,
  Info,
  Note,
  Step: Steps.Item,
  Steps,
  Tab: Tabs.Item,
  Tabs,
  Tip,
  Update,
  Warning,

  // Custom implementations (no @mintlify/components dependency)
  Card,
  CardGroup,
  Columns: CardGroup,
  CodeBlock,
  CodeGroup,
  ParamField,
  Param: ParamField,
  Property: ParamField,
  ResponseField: ParamField,
  pre: PreElement,
  Success: Check,

  // Noops for components referenced in examples but not rendered
  Column: Noop,
  Snippet: Noop,
  SnippetGroup: Noop,
};

export function useMDXComponents() {
  return components;
}
