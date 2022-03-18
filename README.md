## JS SDK Monorepo
This is the DevCycle JS SDK Monorepo which contains all the Javascript-based SDKs and public
shared packages used by DevCycle products.

To view the README for a specific SDK, navigate to that SDK inside the `sdk` directory.

[Javascript Client SDK](sdk/js)

[React Client SDK](sdk/react)

[NodeJS Server SDK](sdk/nodejs)

There are several examples included in this repository for various SDKs. If you want to run them, proceed to setup:

## Setup
Ensure you have Node 16.x installed.

1. Clone this repo
2. Run `yarn` from the root directory. SDKs and examples should now be set up to run via Nx.

## Directory Structure
```
examples/
    - contains example applications using each SDK
lib/
    - contains shared Javascript libraries
scripts/
    - contains all scripts that are not service or task specific
sdk/
    - contains all SDKs
```

## Running an example
To run an example, use the `yarn start` command with the name of the example you want to run:
`yarn start example-react-with-provider`

The names of the examples are listed in the `workspace.json` file at the root of the repository. All examples are
located in the root-level `examples/` directory.

## Development
The repo is managed using `Nx`, a monorepo management tool. It's worth reading their docs here:
https://nx.dev/l/n/getting-started/intro

Every project in the repo is listed in the `workspace.json` file. Each of these projects will let you run common Nx
commands against them. For example, to test the "nodejs" project, run:

`nx test nodejs`

These commands can be run from the root directory, but should work in any directory.

The full list of relevant Nx commands is below:
```
build - build the compiled Webpack output of the project
serve - build and then run the compiled project
test  - run the tests using jest
lint  - run linting
format:write - run prettier against the project and write all formatting changes
```

There are also several root-level yarn commands for running services:
```
yarn start                - start all services in the repo
yarn start:partial        - start the services you specify (eg. yarn start:partial api,config)
yarn test                 - run all tests in the repo
yarn lint                 - lint all projects in the repo
```

### Linting and Running Tests

You can run commands in every javascript project using Nx: `nx run-many --target test --all`

This allows you to lint and/or test all projects at once.

### Publishing a Release
To publish a release, use lerna to create new versions of all changed packages (ensure you do this on the main branch)
`lerna version`

Push up the new tags and version changes, then run:

`yarn npm-publish --otp=<one-time password>`

This will publish all the new versions to npm. You must provide the one-time password associated with the NPM account
in order to run this command.
