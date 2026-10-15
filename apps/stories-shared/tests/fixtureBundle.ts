import {fileURLToPath} from 'node:url';
import {build, type PluginOption} from 'vite';

export async function fixtureBundle(entry: URL, plugins: PluginOption[] = []) {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins,
    define: {'process.env.NODE_ENV': '"development"'},
    build: {
      write: false,
      minify: false,
      lib: {
        entry: fileURLToPath(entry),
        name: 'signalFixture',
        formats: ['iife'],
      },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!('output' in bundle)) throw new Error('Expected a fixture bundle');
  const chunk = bundle.output.find((output) => output.type === 'chunk');
  if (!chunk) throw new Error('Missing fixture bundle');
  return chunk.code;
}
