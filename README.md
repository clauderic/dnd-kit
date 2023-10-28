<p align="center">
  <a href="https://dndkit.com">
    <img alt="@dnd-kit – the modern drag & drop toolkit for React" src=".github/assets/dnd-kit-hero-banner.svg">
  </a>
</p>

<p align="left">
  <a href="https://www.npmjs.com/package/@dnd-kit/core"><img src="https://img.shields.io/npm/v/@dnd-kit/core.svg" alt="Stable Release" /></a>
  <a href="https://github.com/clauderic/dnd-kit/actions"><img src="https://badgen.net/github/checks/clauderic/dnd-kit" alt="Build status" /></a>
  <a href="https://bundlephobia.com/result?p=@dnd-kit/core"><img alt="gzip size" src="https://badgen.net/bundlephobia/minzip/@dnd-kit/core?label=gzip%20size&color=green"/></a>
  <a href="./LICENSE"><img allt="MIT License" src="https://badgen.now.sh/badge/license/MIT"/></a>
  <a href="https://join.slack.com/t/dnd-kit/shared_invite/zt-25zm6qn4k-Sx_NNVb3JQaPz9HnsWfjEQ"><img src="https://img.shields.io/badge/slack-%40dnd--kit-brightgreen.svg?logo=slack"></a>
  <a href="https://twitter.com/intent/follow?screen_name=dndkit"><img alt="Follow us on Twitter" src="https://img.shields.io/twitter/follow/dndkit?style=social"></a>
</p>

- **Feature packed:** customizable collision detection algorithms, multiple activators, draggable overlay, drag handles, auto-scrolling, constraints, and so much more.
- **Built for React:** exposes hooks such as [`useDraggable`](https://docs.dndkit.com/api-documentation/draggable) and [`useDroppable`](https://docs.dndkit.com/api-documentation/droppable). and won't force you to re-architect your app or create additional wrapper DOM nodes.
- **Supports a wide range of use cases:** lists, grids, multiple containers, nested contexts, variable sized items, virtualized lists, 2D Games, and more.
- **Zero dependencies and modular:** the core of the library weighs around 10kb minified and has no external dependencies. It's built around built-in React state management and context, which keeps the library lean.
- **Built-in support for multiple input methods:** Pointer, mouse, touch and keyboard sensors.
- **Fully customizable & extensible:** Customize every detail: animations, transitions, behaviours, styles. Build your own sensors, collision detection algorithms, customize key bindings and so much more.
- **Accessibility:** Keyboard support, sensible default aria attributes, customizable screen reader instructions and live regions built-in.
- **Performance:** It was built with performance in mind in order to support silky smooth animations.
- **Presets:** Need to build a sortable interface? Check out `@dnd-kit/sortable`, which is a thin layer built on top of `@dnd-kit/core`. More presets coming in the future.

## Documentation

To learn how to get started with **dnd kit**, visit the official documentation website. You'll find in-depth API documentation, tips and guides to help you build drag and drop interfaces.

<p>
<a href="https://docs.dndkit.com">
<img alt="Visit @dnd-kit documentation" src=".github/assets/documentation.svg" width="200" />
</a>
</p>

## Key concepts

The core library of **dnd kit** exposes two main concepts:

- [Draggable elements](https://docs.dndkit.com/api-documentation/draggable)
- [Droppable areas](https://docs.dndkit.com/api-documentation/droppable)

Augment your existing components using the `useDraggable` and `useDroppable` hooks, or combine both to create components that can both be dragged and dropped over.

Handle events and customize the behaviour of your draggable elements and droppable areas using the `<DndContext>` provider. Configure sensors to handle different input methods.

Use the `<DragOverlay>` component to render a draggable overlay that is removed from the normal document flow and is positioned relative to the viewport.

Check out our [quick start guide](https://docs.dndkit.com/introduction/getting-started) to learn how get started.

### Extensibility

Extensibility is at the core of **dnd kit**. It is built to be lean and extensible. It ships with the features we believe most people will want most of the time, and provides extension points to build the rest on top of `@dnd-kit/core`.

A prime example of the level of extensibility of **dnd kit** is the [Sortable preset](https://docs.dndkit.com/presets/sortable), which is built using the extension points that are exposed by `@dnd-kit/core`.

The primary extension points of **dnd kit** are:

- Sensors
- Modifiers
- Constraints
- Custom collision detection algorithms

### Accessibility

Building accessible drag and drop interfaces is hard; **dnd kit** has a number of sensible defaults and starting points to help you make your drag and drop interface accessible:

- Customizable **screen reader instructions** for how to interact with draggable items
- Customizable **live region updates** to provide screen reader announcements in real-time of what is currently happening with draggable and droppable elements.
- Sensible defaults for **`aria` attributes** that should be passed to draggable items

Check out our [Accessibility guide](https://docs.dndkit.com/guides/accessibility) to learn more about how you can help provide a better experience for screen readers.

### Architecture

Unlike most drag and drop libraries, **dnd kit** intentionally is **not** built on top of the [HTML5 Drag and drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API). This was a deliberate architectural decision, that does come with tradeoffs that you should be aware of before deciding to use it, but for most applications, we believe the benefits outweigh the tradeoffs.

The HTML5 Drag and drop API has some severe **limitations**. It does not support touch devices or using the keyboard to drag items, which means that the libraries that are built on top of it need to expose an entirely different implementation to support those input methods. It also doesn't support common use-cases such as locking dragging to a specific axis or to the bounds of a container, custom collision detection strategies, or even customizing the preview of the dragged item.

While there are workarounds to some of these issues, those workarounds typically increase the complexity of the codebase and the overall bundle size of the library, and lead to inconsistencies between the mouse, touch and keyboard layers because they're powered by entirely different implementations.

The main **tradeoff** with not using the HTML5 Drag and drop API is that you won't be able to drag from the desktop or between windows. If the drag and drop use-case you have in mind involves this kind of functionality, you'll definitely want to use a library that's built on top of the HTML 5 Drag and drop API. We highly recommend you check out [react-dnd](https://github.com/react-dnd/react-dnd/) for a React library that's has a native HTML 5 Drag and drop backend.

### Performance

#### **Minimizing DOM mutations**

**dnd kit** lets you build drag and drop interfaces without having to mutate the DOM every time an item needs to shift position.

This is possible because **dnd kit** lazily calculates and stores the initial positions and layout of your droppable containers when a drag operation is initiated. These positions are passed down to your components that use `useDraggable` and `useDroppable` so that you can compute the new positions of your items while a drag operation is underway, and move them to their new positions using performant CSS properties that do not trigger a repaint such as `translate3d` and `scale`. For an example of how this can be achieved, check out the implementation of the sorting strategies that are exposed by the [`@dnd-kit/sortable`](packages/sortable/README.md) library.

This isn't to say that you can't shift the position of the items in the DOM while dragging, this is something that **is supported** and sometimes inevitable. In some cases, it won't be possible to know in advance what the new position and layout of the item until you move it in the DOM. Just know that these kind of mutations to the DOM while dragging are much more expensive and will cause a repaint, so if possible, prefer computing the new positions using `translate3d` and `scale`.

#### Synthetic events

**dnd kit** also uses [SyntheticEvent listeners](https://reactjs.org/docs/events.html) for the activator events of all sensors, which leads to improved performance over manually adding event listeners to each individual draggable node.

<p align="center">
<img alt="Playful illustration of draggable and droppable concepts. A robot picks up a draggable card and moves it over a droppable container." src=".github/assets/concepts-illustration.svg" width="75%" />
</p>

## Working in the `@dnd-kit` repository

### Packages contained within this repository

- `@dnd-kit/core`
- `@dnd-kit/accessibility`
- `@dnd-kit/sortable`
- `@dnd-kit/modifiers`
- `@dnd-kit/utilities`

### Installing dependencies

You'll need to install all the dependencies in the root directory. Since the `@dnd-kit` is a monorepo that uses Lerna and Yarn Workspaces, npm CLI is not supported (only yarn).

```sh
yarn install
```

This will install all dependencies in each project, build them, and symlink them via Lerna

### Development workflow

In one terminal, run `yarn start` in parallel:

```sh
yarn start
```

This builds each package to `<packages>/<package>/dist` and runs the project in watch mode so any edits you save inside `<packages>/<package>/src` cause a rebuild to `<packages>/<package>/dist`. The results will stream to to the terminal.

### Running storybook

```sh
yarn start:storybook
```

Runs the storybook
Open [http://localhost:6006](http://localhost:6006) to view it in the browser.

![Screenshot of Storybook running locally](.github/assets/storybook-screenshot.png)

### Working with the playground

You can play with local packages in the Parcel-powered playground.

```sh
yarn start:playground
```

This will start the playground on `localhost:1234`. If you have lerna running watch in parallel mode in one terminal, and then you run parcel, your playground will hot reload when you make changes to any imported module whose source is inside of `packages/*/src/*`. Note that to accomplish this, each package's `start` command passes TDSX the `--noClean` flag. This prevents Parcel from exploding between rebuilds because of File Not Found errors.

Important Safety Tip: When adding/altering packages in the playground, use `alias` object in package.json. This will tell Parcel to resolve them to the filesystem instead of trying to install the package from NPM. It also fixes duplicate React errors you may run into.

### Running Cypress

(In a third terminal) you can run Cypress and it will run the integration tests against storybook.
