import {
  createCodeSandboxButton,
  removeCodeSandboxButton,
} from './codesandbox-button-dom.ts';
import type {CodeSandboxParameters} from '../types.ts';

/**
 * Framework-agnostic Storybook decorator that adds a floating
 * "Open in CodeSandbox" button using plain DOM APIs.
 *
 * Works with any Storybook renderer (HTML, Vue, Solid, etc.).
 * For React stories, prefer the React-based decorator from
 * `@dnd-kit/storybook-addon-codesandbox/decorator` instead.
 *
 * Usage in .storybook/preview.ts:
 *
 *   import {withCodeSandbox} from '@dnd-kit/storybook-addon-codesandbox/decorator-dom';
 *
 *   export default {
 *     decorators: [withCodeSandbox],
 *   };
 */
export function withCodeSandbox(storyFn: any, context: any) {
  removeCodeSandboxButton();

  if (context.viewMode === 'docs') {
    return storyFn();
  }

  const params: CodeSandboxParameters | undefined =
    context.parameters?.codesandbox;
  const mainFile = params?.mainFile ?? 'src/App.jsx';
  const hasSource = params?.files?.[mainFile] != null;

  const result = storyFn();

  if (hasSource && params) {
    requestAnimationFrame(() => {
      removeCodeSandboxButton();
      document.body.appendChild(createCodeSandboxButton(params));
    });
  }

  return result;
}
