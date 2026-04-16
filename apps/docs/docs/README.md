# Documentation

## Contributing to the @dnd-kit documentation

Contributions are welcome to improve the @dnd-kit documentation. Open a [Pull request](https://github.com/clauderic/dnd-kit/pulls) and add the `Documentation` label.

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mintlify
```

Run the following command at the root of the `/apps/docs` directory:

```
mintlify dev
```

#### Troubleshooting

- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `mint.json`
