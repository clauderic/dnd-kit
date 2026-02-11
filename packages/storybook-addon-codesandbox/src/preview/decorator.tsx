import React from 'react';

import {CodeSandboxButton} from './CodeSandboxButton.tsx';
import type {CodeSandboxParameters} from '../types.ts';

/**
 * Storybook decorator that adds a floating "Open Sandbox" button
 * to the bottom-right corner of stories that have sandbox source defined.
 *
 * Usage in .storybook/preview.tsx:
 *
 *   import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator';
 *
 *   export default {
 *     decorators: [withCodeSandbox],
 *   };
 */
export function withCodeSandbox(Story: React.ComponentType, context: any) {
  if (context.viewMode === 'docs') {
    return <Story />;
  }

  const params: CodeSandboxParameters | undefined =
    context.parameters?.codesandbox;

  const mainFile = params?.mainFile ?? 'src/App.jsx';
  const hasSource = params?.files?.[mainFile] != null;

  if (!hasSource) {
    return <Story />;
  }

  return (
    <>
      <Story />
      <CodeSandboxButton params={params!} />
    </>
  );
}
