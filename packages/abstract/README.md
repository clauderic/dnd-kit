# @dnd-kit/abstract

[![Stable release](https://img.shields.io/npm/v/@dnd-kit/abstract.svg)](https://npm.im/@dnd-kit/abstract)

Abstract implementation of @dnd-kit, which can be extended by concrete implementation layers, such as @dnd-kit/dom.

## Overview

This package provides the core abstractions and utilities for implementing drag and drop functionality. It serves as the foundation for building concrete implementation layers on top of @dnd-kit, such as the [DOM implementation layer](../dom).

> [!NOTE]
> This package is not meant to be used by most consumers, unless you are planning on building a concrete implementation layer on top of @dnd-kit.

## Core Concepts

### Entities

The library defines two main entity types:

- **Draggable**: Represents elements that can be dragged
- **Droppable**: Represents elements that can receive dragged items

### Sensors

Sensors are responsible for detecting and initiating drag operations. They handle user interactions and translate them into drag operations. The library provides:

- Abstract `Sensor` base class
- Support for multiple sensor types
- Custom sensor configuration
- Configurable sensor options

### Collision Detection

The collision system provides:

- Multiple collision detection strategies
- Priority-based collision resolution
- Custom collision detectors
- Collision observation and management

### Plugins

The plugin system allows extending core functionality:

- Plugin-based architecture
- Plugin configuration and descriptors
- Plugin lifecycle management

### Modifiers

Modifiers provide a way to transform or modify drag operations:

- Abstract `Modifier` base class
- Ability to modify coordinates and operations
- Chainable modifier system
- Configurable modifier options

## API

### Core Types

- `DragDropManager`: Manages drag and drop state and operations
- `Draggable`: Interface for draggable elements
- `Droppable`: Interface for droppable elements
- `Plugin`: Base class for plugins
- `Sensor`: Abstract base class for sensors
- `Modifier`: Abstract base class to modify drag operations

## Contributing

This package is part of the dnd-kit monorepo. Please refer to the main repository's [contributing guidelines](/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This package is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
