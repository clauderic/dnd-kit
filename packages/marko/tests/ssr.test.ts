/**
 * SSR tests for @dnd-kit/marko
 *
 * Validates that all adapter tags compile and render correctly in Marko's
 * HTML (server-side) output mode. Key assertions:
 *
 * 1. Templates compile to HTML mode without errors
 * 2. DragDropManager is NOT constructed during SSR (isBrowser guard)
 * 3. Body content renders with correct default state (isDragging=false, etc.)
 * 4. No "undefined" values leak into the HTML output
 * 5. All consumer tags (create-sortable, create-draggable, create-droppable) work
 * 6. drag-overlay renders empty wrapper during SSR (no drag in progress)
 */
import { describe, expect, test, beforeAll } from 'bun:test';
import path from 'path';

// Use require() for CJS-only modules (compiler register hook patches require.extensions)
const compiler = require('@marko/compiler');
const translator = require('@marko/runtime-tags/translator');

const fixturesDir = path.resolve(__dirname, 'fixtures');

describe('SSR — compile', () => {
    test('sortable template compiles to HTML mode', async () => {
        const templatePath = path.join(fixturesDir, 'ssr-template.marko');
        compiler.taglib.clearCaches();

        const result = compiler.compileFileSync(templatePath, {
            output: 'html',
            translator,
            cache: new Map(),
        });

        expect(result.code).toBeDefined();
        expect(result.code.length).toBeGreaterThan(0);
        // Compilation succeeding without errors is the primary assertion —
        // it proves all six tags (drag-drop-provider, let-global, create-sortable,
        // create-deep-signal, and their internal wiring) compile to HTML mode.
    });

    test('droppable template compiles to HTML mode', async () => {
        const templatePath = path.join(fixturesDir, 'ssr-droppable-template.marko');
        compiler.taglib.clearCaches();

        const result = compiler.compileFileSync(templatePath, {
            output: 'html',
            translator,
            cache: new Map(),
        });

        expect(result.code).toBeDefined();
        expect(result.code.length).toBeGreaterThan(0);
    });

    test('overlay template compiles to HTML mode', async () => {
        const templatePath = path.join(fixturesDir, 'ssr-overlay-template.marko');
        compiler.taglib.clearCaches();

        const result = compiler.compileFileSync(templatePath, {
            output: 'html',
            translator,
            cache: new Map(),
        });

        expect(result.code).toBeDefined();
        expect(result.code.length).toBeGreaterThan(0);
    });
});

describe('SSR — render', () => {
    beforeAll(() => {
        // Register the .marko require hook for HTML output mode.
        // This patches require.extensions['.marko'] so that require('foo.marko')
        // compiles and evaluates the template on the fly.
        const register = require('@marko/compiler/register');
        register({
            translator,
            output: 'html',
            cache: new Map(),
        });
    });

    test('sortable template renders valid HTML', () => {
        const mod = require('./fixtures/ssr-template.marko');
        const template = mod.default ?? mod;
        const result = template.render({});
        const html: string = result.toString();

        // Strip Marko's hydration <script> — it contains serialized state with
        // "null" values that are not part of the visible HTML output.
        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');

        // Contains the expected DOM structure
        expect(visible).toContain('<ul>');
        expect(visible).toContain('<li');
        expect(visible).toContain('Item 1');
        expect(visible).toContain('Item 2');

        // isDragging is false during SSR — class should be "item" not "item dragging"
        expect(visible).not.toContain('dragging');

        // No undefined/null values leaked into visible output
        expect(visible).not.toContain('undefined');
        expect(visible).not.toContain('null');
    });

    test('draggable + droppable template renders valid HTML', () => {
        const mod = require('./fixtures/ssr-droppable-template.marko');
        const template = mod.default ?? mod;
        const result = template.render({});
        const html: string = result.toString();

        // Strip Marko's hydration <script>
        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');

        // Contains expected elements
        expect(visible).toContain('<button');
        expect(visible).toContain('Drag me');
        expect(visible).toContain('<div');
        expect(visible).toContain('Drop here');

        // isDragging and isDropTarget are false during SSR
        expect(visible).not.toContain('dragging');
        expect(visible).not.toContain('active');

        // Classes should be clean defaults (Marko omits quotes for simple values)
        expect(visible).toContain('class=btn');
        expect(visible).toContain('class=droppable');

        // No undefined/null values leaked into visible output
        expect(visible).not.toContain('undefined');
        expect(visible).not.toContain('null');
    });

    test('overlay template renders empty overlay wrapper during SSR', () => {
        const mod = require('./fixtures/ssr-overlay-template.marko');
        const template = mod.default ?? mod;
        const result = template.render({});
        const html: string = result.toString();

        // Strip Marko's hydration <script>
        const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');

        // The overlay wrapper div exists in the DOM (for hydration)
        expect(visible).toContain('data-dnd-overlay');

        // Overlay content is NOT rendered during SSR (no drag in progress,
        // _source is null → <if> branch is false → no body content)
        expect(visible).not.toContain('Overlay content');

        // The draggable outside the overlay renders normally
        expect(visible).toContain('Drag me');
        expect(visible).toContain('class=btn');

        // No leaks
        expect(visible).not.toContain('undefined');
    });

    test('DragDropManager is not instantiated during SSR', () => {
        // The drag-drop-provider has: static const isBrowser = typeof window !== "undefined"
        // In Node.js, window is undefined → isBrowser is false → manager is undefined.
        // If DragDropManager were constructed, it would access browser APIs and throw.
        // The fact that render() completes without error proves the guard works.
        const mod = require('./fixtures/ssr-template.marko');
        const template = mod.default ?? mod;

        // This would throw if DragDropManager was constructed (it accesses document, window)
        expect(() => {
            template.render({}).toString();
        }).not.toThrow();
    });
});