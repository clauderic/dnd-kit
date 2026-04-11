/**
 * MDX component overrides for the docs site.
 *
 * This module is aliased via Vite to replace '@mintlify/astro/components'
 * so that all MDX content uses our lightweight components instead of the
 * @mintlify/components barrel export (which pulls in Shiki + mermaid).
 *
 * All components are custom implementations using native HTML + Tailwind.
 * Zero dependency on @mintlify/components at runtime.
 */

// Lightweight replacements — no @mintlify/components dependency
import { Accordion } from '../components/mintlify/Accordion';
import { Expandable } from '../components/mintlify/Expandable';
import { Steps } from '../components/mintlify/Steps';
import { Tabs } from '../components/mintlify/Tabs';
import { Info, Note, Tip, Warning, Check, Danger } from '../components/mintlify/Callout';
import { Frame } from '../components/mintlify/Frame';
import { Update } from '../components/mintlify/Update';

// Custom component overrides
import { Card } from '../components/Card';
import { CodeBlock } from '../components/CodeBlock';
import { CodeGroup } from '../components/CodeGroup';
import { ParamField } from '../components/ParamField';
import { PreElement } from '../components/PreElement';

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

// Noop wrapper for components referenced but not rendered
function Noop({ children }: any) {
  return <div>{children}</div>;
}

export const components = {
  // Layout & interactive
  Accordion,
  AccordionGroup: Accordion.Group,
  Card,
  CardGroup,
  Columns: CardGroup,
  CodeBlock,
  CodeGroup,
  Expandable,
  Frame,
  Steps,
  Step: Steps.Item,
  Tabs,
  Tab: Tabs.Item,

  // Callouts
  Check,
  Danger,
  Info,
  Note,
  Success: Check,
  Tip,
  Warning,

  // API reference
  ParamField,
  Param: ParamField,
  Property: ParamField,
  ResponseField: ParamField,

  // Content
  Update,
  pre: PreElement,

  // Noops
  Column: Noop,
  Snippet: Noop,
  SnippetGroup: Noop,
};

export function useMDXComponents() {
  return components;
}
