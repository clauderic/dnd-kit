<p align="center"><img alt="Dropshift – Drag it, shift it, drop it like it's hot." width="520" alt="Logo" src="https://user-images.githubusercontent.com/1416436/100264020-3f265a80-2f1c-11eb-89c8-b28b82aaef3e.png"></p>

## Packages contained in this repository

- `@dropshift/core`
- `@dropshift/sortable`
- `@dropshift/modifiers`
- `@dropshift/utilities`

<p align="center">
<img src="https://user-images.githubusercontent.com/1416436/100043238-fb780780-2dda-11eb-9621-806db8e26d9e.gif" />
</p>

## Working in the `@dropshift` repository

You'll need to install all the dependencies in the root directory. Since the `@dropshift` is a monorepo that uses Lerna and Yarn Workspaces, npm CLI is not supported (only yarn).

```sh
yarn install
```

This will install all dependencies in each project, build them, and symlink them via Lerna

## Development workflow

In one terminal, run tsdx watch in parallel:

```sh
yarn start
```

This builds each package to `<packages>/<package>/dist` and runs the project in watch mode so any edits you save inside `<packages>/<package>/src` cause a rebuild to `<packages>/<package>/dist`. The results will stream to to the terminal.

## Running storybook

```sh
yarn start:storybook
```

Runs the storybook
Open [http://localhost:6006](http://localhost:6006) to view it in the browser.

### Working with the playground

You can play with local packages in the Parcel-powered playground.

```sh
yarn start:playground
```

This will start the playground on `localhost:1234`. If you have lerna running watch in parallel mode in one terminal, and then you run parcel, your playground will hot reload when you make changes to any imported module whose source is inside of `packages/*/src/*`. Note that to accomplish this, each package's `start` command passes TDSX the `--noClean` flag. This prevents Parcel from exploding between rebuilds because of File Not Found errors.

Important Safety Tip: When adding/altering packages in the playground, use `alias` object in package.json. This will tell Parcel to resolve them to the filesystem instead of trying to install the package from NPM. It also fixes duplicate React errors you may run into.

### Running Cypress

(In a third terminal) you can run Cypress and it will run the integration tests against storybook.
