export interface SandboxFile {
  content: string;
  isBinary?: boolean;
}

export interface CodeSandboxParameters {
  /**
   * Files to include in every sandbox created from this Storybook.
   * Merged with per-story files (per-story wins on conflict).
   */
  files?: Record<string, string | SandboxFile>;

  /**
   * NPM dependencies to include in every sandbox.
   * Merged with per-story dependencies (per-story wins on conflict).
   */
  dependencies?: Record<string, string>;

  /**
   * NPM devDependencies to include in every sandbox.
   */
  devDependencies?: Record<string, string>;

  /**
   * The file path within the sandbox that should be opened by default.
   * @default 'src/App.jsx'
   */
  mainFile?: string;

  /**
   * The sandbox template to use.
   * @default 'node'
   */
  template?: string;

  /**
   * The entry file content. If not provided, a default index file
   * will be generated that imports the main file.
   */
  entry?: string;
}
