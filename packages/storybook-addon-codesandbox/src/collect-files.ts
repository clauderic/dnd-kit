import type {CodeSandboxParameters, SandboxFile} from './types.ts';

/**
 * Normalizes a file entry to a SandboxFile object.
 */
function normalizeFile(file: string | SandboxFile): SandboxFile {
  if (typeof file === 'string') {
    return {content: file};
  }

  return file;
}

/**
 * Generates the package.json content for the sandbox.
 */
function generatePackageJson(
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
  main: string
): SandboxFile {
  return {
    content: JSON.stringify(
      {
        name: 'dnd-kit-sandbox',
        main,
        dependencies,
        devDependencies,
      },
      null,
      2
    ),
  };
}

/**
 * Generates a default index file that imports the main app file.
 */
function generateIndexFile(mainFile: string): string {
  // Ensure the import path is relative
  const importPath = mainFile.startsWith('./')
    ? mainFile
    : `./${mainFile}`;

  // Strip extension for import
  const importPathNoExt = importPath.replace(/\.\w+$/, '');

  return [
    `import App from '${importPathNoExt}';`,
    '',
  ].join('\n');
}

export interface CollectFilesOptions {
  /** Global parameters from preview config */
  globalParams: CodeSandboxParameters;
  /** Per-story parameters */
  storyParams: CodeSandboxParameters;
  /** The story's source code */
  storySource: string;
}

/**
 * Collects and merges all files needed for the sandbox.
 *
 * Priority (highest wins on conflict):
 * 1. Generated files (package.json, index)
 * 2. Per-story files
 * 3. Global files
 */
export function collectFiles(options: CollectFilesOptions): Record<string, SandboxFile> {
  const {globalParams, storyParams, storySource} = options;
  const files: Record<string, SandboxFile> = {};

  // 1. Add global files
  if (globalParams.files) {
    for (const [path, file] of Object.entries(globalParams.files)) {
      files[path] = normalizeFile(file);
    }
  }

  // 2. Add per-story files (overrides global)
  if (storyParams.files) {
    for (const [path, file] of Object.entries(storyParams.files)) {
      files[path] = normalizeFile(file);
    }
  }

  // 3. Add the story source as the main file
  const mainFile = storyParams.mainFile ?? globalParams.mainFile ?? 'src/App.jsx';
  files[mainFile] = {content: storySource};

  // 4. Add index entry if not provided
  const indexFiles = ['src/index.js', 'src/index.tsx', 'index.js', 'index.tsx'];
  let entryFile = indexFiles.find((f) => files[f]);

  if (!entryFile) {
    entryFile = 'src/index.js';
    const entry = storyParams.entry ?? globalParams.entry;

    if (entry) {
      files[entryFile] = {content: entry};
    } else {
      files[entryFile] = {content: generateIndexFile(mainFile)};
    }
  }

  // 5. Merge dependencies and generate package.json (skip if explicitly provided)
  if (!files['package.json']) {
    const dependencies = {
      ...globalParams.dependencies,
      ...storyParams.dependencies,
    };
    const devDependencies = {
      ...globalParams.devDependencies,
      ...storyParams.devDependencies,
    };

    files['package.json'] = generatePackageJson(
      dependencies,
      devDependencies,
      `/${entryFile}`
    );
  }

  return files;
}
