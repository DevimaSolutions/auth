# Contributing

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project.

## Development workflow

To get started with the project, run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

Install [husky](https://www.npmjs.com/package/husky) hooks by running:

```sh
yarn setup
```

While developing, you can run the [example app](/example/) to test your changes.

To start the package:

```sh
yarn dev
```

Make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn typescript
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks verify that the linter and tests pass when committing.

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn setup`: installs [husky](https://www.npmjs.com/package/husky) hooks
- `yarn typescript`: type-check files with TypeScript.
- `yarn lint`: lint files with ESLint.
- `yarn test`: run unit tests with Jest.
- `yarn dev`: start the example app.
- `yarn prepush`: run `yarn typescript` and `yarn lint`
- `yarn build`: create a production build from src
- `yarn prepare`: runs `yarn build` automatically before package is packed or published
- `yarn publish`: publish the package

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.

### Releasing
Releasing a new version is mostly automated. For now the [CHANGELOG](https://gitlab.com/devima.solutions/auth/auth/-/blob/main/CHANGELOG.md) requires being updated manually. Once this has been done run the commands below. Versions should follow semantic versioning.

```sh
npm publish
```

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.0,
available at https://www.contributor-covenant.org/version/2/0/code_of_conduct.html.


For answers to common questions about this code of conduct, see the FAQ at
https://www.contributor-covenant.org/faq. Translations are available at https://www.contributor-covenant.org/translations.
