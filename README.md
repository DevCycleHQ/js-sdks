## JS SDK Monorepo
This is the DevCycle JS SDK Monorepo which contains all the Javascript-based SDKs and public
shared packages used by DevCycle products.

To view the README for a specific SDK, navigate to that SDK inside the `sdk` directory.

[Javascript Client SDK](sdk/js)

[React Client SDK](sdk/react)

[NodeJS Server SDK](sdk/nodejs)

There are several examples included in this repository for various SDKs. If you want to run them, proceed to setup:

## Setup
Ensure you have Node 20.x installed.

1. Clone this repo
2. Run `yarn` from the root directory. SDKs and examples should now be set up to run via Nx.
3. Run `aws configure sso`
4. Run `aws sso login`


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

### Running a local npm server to publish to and pull from

This will update your yarn and npm configs to point to the new registry, and start up the new registry locally.

```
yarn local-registry enable
yarn local-registry start
```

The first time you run this, you'll need to add your user:

```
npm adduser --registry http://localhost:4873
```

The username is test, and the password is test.

To disable the server, just exit the process. Then run:

```
yarn local-registry disable
```

Keeping the server active may interfere with normal npm and npx activities, so if anything's acting strange, just kill the server and disable the registry updates.

> :warning: The `npm-safe-publish.sh` script will not use the locally running server!

### Linting and Running Tests

You can run commands in every javascript project using Nx: `nx run-many --target test --all`

This allows you to lint and/or test all projects at once.

### Publishing a Release
**Note:** You need admin privileges to publish a release. If you don't have them, ask someone who does to do the release for you.

Setup:
- run `aws sso login`
- run `./scripts/brew-install.sh`
- ensure you're on the main branch with the latest code

Then use lerna to create new versions of all changed packages (ensure you do this on the main branch)
`yarn lerna:version`

This will automatically push the latest tags and version updates to github. 

To publish the versions to npm, you need a one-time password from our NPM account.

To publish, run:
`yarn npm-publish --otp=<one-time password>`

This will publish all the new versions to npm. 

#### js.devcycle.com/devcycle.min.js

The last step is to upload the umd version of the SDK to our S3 bucket.

To build it, run:

`nx build:cdn js`

This will create three files in the `dist/sdk/js` folder:

```
- devcycle.min.js
- devcycle.min.js.map
- devcycle.min.js.LICENSE.txt
```

Upload them all to S3. Ensure that their access controls allow public access.

