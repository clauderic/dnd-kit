import React, {useCallback, useState} from 'react';
import {addons, types} from 'storybook/manager-api';
import {IconButton} from 'storybook/internal/components';
import {useStorybookApi, useParameter, useStorybookState} from 'storybook/manager-api';

import {ADDON_ID, TOOL_ID} from './constants.ts';
import {collectFiles} from './collect-files.ts';
import {createSandbox, openSandbox} from './define.ts';
import type {CodeSandboxParameters} from './types.ts';

function CodeSandboxIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
      <polyline points="7.5 19.79 7.5 14.6 3 12" />
      <polyline points="21 12 16.5 14.6 16.5 19.79" />
      <line x1="3.27" y1="6.96" x2="12" y2="12.01" />
      <line x1="12" y1="12.01" x2="20.73" y2="6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

type ExportState = 'idle' | 'loading' | 'success' | 'error';

function CodeSandboxTool() {
  const [state, setState] = useState<ExportState>('idle');
  const api = useStorybookApi();
  const storybookState = useStorybookState();

  // Get the codesandbox parameters (merged from global + story level by Storybook)
  const storyParams = useParameter<CodeSandboxParameters>('codesandbox') ?? {};

  const handleClick = useCallback(async () => {
    if (state === 'loading') return;

    setState('loading');

    try {
      // Get the current story data
      const storyId = storybookState.storyId;

      if (!storyId) {
        throw new Error('No story selected');
      }

      const storyData = api.getData(storyId);

      if (!storyData) {
        throw new Error('Could not retrieve story data');
      }

      // Extract story source from parameters
      const storySource =
        storyParams.files?.[storyParams.mainFile ?? 'src/App.jsx'];

      if (!storySource) {
        throw new Error(
          'No story source found. Add source code to the `codesandbox.files` parameter on your story.'
        );
      }

      const sourceContent = typeof storySource === 'string'
        ? storySource
        : storySource.content;

      // Get global parameters from the store
      // Storybook merges parameters, so storyParams already contains the merged result.
      // We pass storyParams as both global and story since Storybook handles the merge.
      const files = collectFiles({
        globalParams: {},
        storyParams,
        storySource: sourceContent,
      });

      const sandboxId = await createSandbox(files, storyParams.template);

      openSandbox(sandboxId, storyParams.mainFile);

      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      console.error('[CodeSandbox Addon]', error);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, [api, state, storyParams, storybookState.storyId]);

  // Only show the button if the story has a sandbox source file defined
  const mainFile = storyParams.mainFile ?? 'src/App.jsx';
  const hasSource = storyParams.files?.[mainFile] != null;

  if (!hasSource) {
    return null;
  }

  const title =
    state === 'loading'
      ? 'Creating sandbox...'
      : state === 'success'
        ? 'Sandbox created!'
        : state === 'error'
          ? 'Failed to create sandbox'
          : 'Open in CodeSandbox';

  return (
    <IconButton
      key={TOOL_ID}
      title={title}
      onClick={handleClick}
      disabled={state === 'loading'}
      style={{
        opacity: state === 'loading' ? 0.5 : 1,
        color:
          state === 'success'
            ? '#1eb99d'
            : state === 'error'
              ? '#e53e3e'
              : undefined,
      }}
    >
      <CodeSandboxIcon />
    </IconButton>
  );
}

addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: 'Open in CodeSandbox',
    match: ({viewMode}) => viewMode === 'story',
    render: () => <CodeSandboxTool />,
  });
});
