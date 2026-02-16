import {CODESANDBOX_DEFINE_URL} from './constants.ts';
import type {SandboxFile} from './types.ts';

interface DefineRequest {
  files: Record<string, SandboxFile>;
  template?: string;
}

interface DefineResponse {
  sandbox_id: string;
}

/**
 * Creates a sandbox on CodeSandbox using the public define API.
 * No authentication required -- the sandbox is created anonymously
 * and the visitor can fork it into their own account.
 */
export async function createSandbox(
  files: Record<string, SandboxFile>,
  template?: string
): Promise<string> {
  const body: DefineRequest = {files};

  if (template) {
    body.template = template;
  }

  const response = await fetch(`${CODESANDBOX_DEFINE_URL}?json=1`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to create sandbox: ${response.status} ${response.statusText}`
    );
  }

  const data: DefineResponse = await response.json();

  return data.sandbox_id;
}

/**
 * Opens a CodeSandbox in a new tab.
 */
export function openSandbox(sandboxId: string, mainFile?: string): void {
  const params = new URLSearchParams();

  if (mainFile) {
    params.set('file', `/${mainFile}`);
  }

  const query = params.toString();
  const url = `https://codesandbox.io/s/${sandboxId}${query ? `?${query}` : ''}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens a project in StackBlitz via a form POST.
 *
 * No API call or SDK needed — the files are encoded as hidden form
 * fields and submitted directly to StackBlitz, which opens the
 * project in a new tab.
 */
export function openStackBlitz(
  files: Record<string, SandboxFile>,
  options?: {title?: string; template?: string; openFile?: string}
): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://stackblitz.com/run';
  form.target = '_blank';

  function addField(name: string, value: string) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  for (const [path, file] of Object.entries(files)) {
    addField(`project[files][${path}]`, file.content);
  }

  addField('project[template]', options?.template ?? 'node');

  if (options?.title) {
    addField('project[title]', options.title);
  }

  if (options?.openFile) {
    addField('project[settings][compile][trigger]', 'auto');
    addField('project[settings][compile][clearConsole]', 'false');
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
