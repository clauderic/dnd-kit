<div align="center">
  <a href="https://dndkit.com">
    <img alt="dnd kit – There's a new kit on the block." width="520" src=".github/assets/dnd-kit-hero.png" />
  </a>
  <p>拖拽元素的新工具</p>
</div>

## 概览

<p align="left">
<a href="https://github.com/clauderic/dnd-kit/actions"><img src="https://badgen.net/github/checks/clauderic/dnd-kit" alt="Build status" /></a>
<a href="https://www.npmjs.com/package/@dnd-kit/core"><img src="https://img.shields.io/npm/v/@dnd-kit/core.svg" alt="Stable Release" /></a>
<a href="https://bundlephobia.com/result?p=@dnd-kit/core"><img alt="gzip size" src="https://badgen.net/bundlephobia/minzip/@dnd-kit/core?label=gzip%20size&color=green"/></a>
<a href="./LICENSE"><img allt="MIT License" src="https://badgen.now.sh/badge/license/MIT"/></a>
</p>

- **专为 React 打造：** 库暴露了诸如 [`useDraggable`](https://docs.dndkit.com/api-documentation/draggable) 和 [`useDroppable`](https://docs.dndkit.com/api-documentation/droppable) 之类的钩子，你无需重构你的应用，也不需要创建额外的包装 DOM 节点。
- **功能丰富：** 包括可定制的碰撞检测算法、多个激活器（`Activator`）、可拖动的叠加层、拖动手柄、自动滚动、拖拽约束等。
- **支持多种用例：** 支持列表，网格，多容器，嵌套上下文，大小可变的元素，虚拟化列表，2D 游戏等用例。
- **零依赖且模块化：** 库的核心代码大小仅约 10kb，且无外部依赖。该库围绕 React 内置状态管理和上下文构建，以此保持库的精简。
- **内置支持多种输入方法：** 支持指针、鼠标、触摸屏和键盘。
- **完全可定制且可扩展：** 你可以定制每个细节：例如动画、过渡效果、拖拽行为和样式。你还可以打造属于你自己的传感器、碰撞检测算法、自定义快捷键等。
- **辅助功能：** 提供键盘支持、合理的默认 `aria` 属性、可定制屏幕阅读指引和内置的动态区域。
- **性能：** 库在构建时考虑了性能，以支持丝般顺滑的动画。
- **预设：** 想要构建可排序的界面？请参阅 `@dnd-kit/sortable`，这是基于 `@dnd-kit/core` 核心层构建的轻量级叠加层。未来将有更多预设。

## 文档

访问 [官方英文文档](https://docs.dndkit.com) 以了解如何使用 **dnd kit**。你会深入了解 API 文档、提示和指南，以帮助你构建可拖放页面。

> 译者注：上方超链接指向官方英文文档，要访问中文文档，请点击下方按钮。

<p>
<a href="./docs/zh-CN/index.md">
<img alt="View documentation" src=".github/assets/documentation.svg" width="200" />
</a>
</p>
<p align="center">
<img alt="Playful illustration of draggable and droppable concepts" src=".github/assets/concepts-illustration.svg" width="75%" />
</p>


## 核心概念

**dnd kit** 的核心库暴露了两个主要概念：

- [可拖拽元素](https://docs.dndkit.com/api-documentation/draggable)；
- [可放置区域](https://docs.dndkit.com/api-documentation/droppable)。

使用 `useDraggable` 和 `useDroppable` 钩子扩展你现有的组件，或将两者结合起来，创建既能拖拽又能放置其他元素的组件。

使用 `<DndContext>` 生产者（`provider`）处理拖放事件，并自定义你的可拖拽元素和可放置区域对拖拽操作的响应行为。

使用 `<DragOverlay>` 组件来渲染一个脱离常规文档流并且相对视窗定位的可拖拽叠加层。

请参阅 [快速开始指南](https://docs.dndkit.com/introduction/getting-started) 以了解如何快速上手。

### 可扩展性

可扩展性是 **dnd kit** 的核心所在。这个库生来轻量且可扩展。我们相信，其搭载了多数人在大多数时候想要的功能，并且提供扩展点以在 `@dnd-kit/core` 的基础之上构建其他需要的功能。

**dnd kit** 可扩展性级别的一个主要例子就是 [可排序预设（Sortable preset）](https://docs.dndkit.com/presets/sortable)，它就是使用 `@dnd-kit/core` 模块暴露的扩展点构建的。

**dnd kit** 的主要扩展点如下：

- 传感器（`Sensors`）；
- 修改器（`Modifiers`）；
- 约束（`Constraints`）；
- 自定义碰撞检测算法。

### 辅助功能

构建易用拖放界面十分困难；**dnd kit** 有许多合理的默认值和起始点以帮助你构建易用的拖放界面：

- 有关如何操作可拖拽元素的可定制 **屏幕阅读器指引**；
- 可定制的 **实时区域更新**，以提供关于可拖放元素当前状态的实时屏幕阅读器播报；
- 应该传给可拖拽元素的合理 **`aria` 属性** 默认值；

请访问我们的 [辅助功能指南](https://docs.dndkit.com/guides/accessibility)，详细了解你可以如何为屏幕阅读器提供更好的使用体验。

### 架构

与大多数拖放库不同，**dnd kit** 刻意 **没有使用** [HTML5 拖放 API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)。这是一个慎重的架构决定，也的确带来了一些取舍，在决定使用这个库之前，你需要对此有所了解。但对于大部分的应用而言，我们相信这个决定利大于弊。

HTML5 拖放 API 有一定的 **局限性**。它不支持使用触控设备或键盘来拖动元素，这就意味着基于 HTML5 拖放 API 构建的库需要暴露完全不同的实现以支持那两种输入方式。其也不支持一些常规的用例，例如限制在某个特定的轴或容器边界上进行拖拽、自定义碰撞检测策略以及自定义拖动元素的预览视图。

虽然其中一些问题有解决方法，但那些方法通常会增加代码库的复杂性以及库打包的大小，并且由于不同的输入方式有不同的实现支持，会导致鼠标、触控和键盘之间的操作结果出现不一致。

不使用 HTML5 拖放 API 最主要的损失就是你无法从桌面或在窗口之间拖动元素。如果你预想的用例涉及这种拖放功能，你的确需要使用基于 HTML5 拖放 API 构建的拖放库。如果你想找到一个基于原生 HTML5 拖放功能的 React 库，我们强烈建议你了解 [react-dnd](https://github.com/react-dnd/react-dnd/)。

### 性能

#### **减少 DOM 改变**

**dnd kit** 可以让你在每次元素需要改变位置时，不改变 DOM 即可构建拖放界面。

当一个拖拽动作开始时，**dnd kit** 的延迟计算和对可放置容器初始位置和布局的存储让上述功能成为可能。这些位置信息会被传递给你所有使用了 `useDraggable` 和 `useDroppable` 钩子的组件，因此你可以在一次拖拽动作中计算元素的新位置，并且使用不会引起重绘的高性能 CSS 属性，例如 `translate3d` 和 `scale`，来将拖拽元素移动到新的位置。关于如何实现这个功能的例子，你可以参考 [`@dnd-kit/sortable`](packages/sortable/README.md) 库暴露的排序策略的实现。

这并不是说在拖动过程中，你不能移动 DOM 元素的位置，这只是 **受支持** 的功能，并且有时难免需要使用到。在有些情况下，不在 DOM 中移动元素，你就无法知道元素新的位置和布局。请了解这种在拖动过程中对于 DOM 的改变开销很大，并且会引起重绘。因此，如果可能的话，请优先使用 `translate3d` 和 `scale` 属性计算元素新的位置。

#### 合成事件

**dnd kit** 同样使用 [合成事件监听器](https://reactjs.org/docs/events.html) 来处理所有传感器的激活事件，相比于为每个可拖动节点手动添加事件监听器，这个方法提高了性能。

## 在 `@dnd-kit` 仓库中进行开发

### 这个仓库中包含的库

- `@dnd-kit/core`
- `@dnd-kit/accessibility`
- `@dnd-kit/sortable`
- `@dnd-kit/modifiers`
- `@dnd-kit/utilities`

### 安装依赖

你需要在根目录安装所有的依赖。由于 `@dnd-kit` 是一个使用 Lerna 和 Yarn Workspaces 进行管理的 Monorepo，所以不支持 npm CLI（只能用 Yarn）。

```sh
yarn install
```

这个命令会在每个项目中安装并构建对应的依赖，并使用 Lerna 为其创建符号链接。

### 开发工作流

在一个终端中，并行运行 `yarn start`：

```sh
yarn start
```

这会把每个 package 打包到对应的 `<packages>/<package>/dist` 文件夹，并且在观察模式下运行项目，因此你在 `<packages>/<package>/src` 文件夹下所做的所有修改都会引起重新打包。运行结果会显示在终端中。

### 运行 Storybook

```sh
yarn start:storybook
```

这个命令会启动 Storybook。

在浏览器中访问 [http://localhost:6006](http://localhost:6006) 即可看到。

![本地运行 Storybook 的截图](.github/assets/storybook-screenshot.png)

### 使用 Playground

你可以在基于 Parcel 的游乐场中调试本地库。

```sh
yarn start:playground
```

这个命令会将游乐场运行在 `localhost:1234`。如果你在一个终端以观察模式运行 Lerna，同时又运行了 Parcel，那么当你对导入的 `packages/*/src/*` 文件夹下模块进行任何改变时，游乐场都会进行热更新。请注意，要实现这个效果，每个包的 `start` 命令必须传给 TDSX `--noClean` 标志。这会防止 Parcel 在重新构建时因为 File Not Found 错误而崩溃。

重要的安全提示：当添加/替换游乐场中的包时，请使用 package.json 中的 `alias` 对象。这会告诉 Parcel 应该从本地文件系统中解析这些包，而非从 NPM 上安装。这也会解决你有可能遇到的重复的 React 报错。

### 运行 Cypress

你可以（在第三个终端中）运行 Cypress，它会在 Storybook 上运行集成测试。
