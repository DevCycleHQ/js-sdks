## MONOREPO
This is the DevCycle Monorepo which contains all the backend services used by DevCycle products. It is managed using
`Nx`, a monorepo management tool. It's worth reading their docs here:
https://nx.dev/l/n/getting-started/intro

Every project in the repo is listed in the `workspace.json` file. Each of these projects will let you run common Nx
commands against them. For example, to test the "api" project, run:

`nx test api`

To run the api locally, you would run `nx serve api`.

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

## Setup

You should already have nvm installed, if you don't, you can download it here:
https://github.com/nvm-sh/nvm.

This project uses a `.nvmrc` file to automatically set the version of node being
used in your shell when you `cd` into the project folder. It requires some
additions to your shell, instructions for which can be found here:
https://github.com/nvm-sh/nvm#bash

1. Clone this repo
2. Run `./scripts/brew_install.sh`. This will install software required to work within
   the repo.
3. Authenticate the AWS CLI with SSO
`aws configure sso`
Provide this start URL: `https://devcycle-sso.awsapps.com/start`
`aws sso login`
4. Run `./scripts/gen-env.sh`. This will generate a .env file in `.generated/environments` which provides the necessary
environment variables for the services to run.
5. Run `yarn` from the root directory. Services should now be set up to run via Nx.
6. Run `yarn start` to start every service at once

If you get errors around node-gyp failing on macOS Catalina, see this install
document for that lib: https://github.com/nodejs/node-gyp/blob/master/macOS_Catalina.md

Running `scripts/gen-env.sh` will update the local environment variables, and should be done whenever there are new variables added to production/local.

### Linting and Running Tests

You can run commands in every javascript project using Nx: `nx run-many --target test --all`

This allows you to lint and/or test all projects at once.

## Generating new code
One of Nx's main features is to generate new code in your repo. Everything you generate will be automatically added
to Nx's management system so you can build it and run tests.

Typical things we'd want to generate:
```
nx workspace-generator application <name>   - generates a new nestjs application in `services/`
nx workspace-generator library <name>       - generates a new nestjs library in `lib/`
nx g module <name>        - generates a nestjs module
```
There is a much larger list of things you can generate in the Nx docs. Be sure to check out all the possibilities
and how to fine tune these commands.

## Local Development

For details on how to do local development from within the DevCycle repository,
please read `docs/LocalDevelopment.md`.

## Directory Structure
```
cf-workers/
   - contains cloudflare workers
docs/
   - documentation
infra/
    flux/
        - contains FluxCD configs to manage confluent
    terraform/
        - contains Terraform files used in prod AWS environment
lib/
    - contains shared Javascript libraries
scripts/
    - contains all scripts that are not service or task specific, as well as local environment scripts
services/
    - contains all backend services
```

## CircleCI

We primarily use NX's affected feature to run only the jobs that need running per build. 
This simplifies the definition of all jobs into a common "nx-whatever" job - ie, nx-test.

To add a new job that will be run by multiple services - add it in each service's `project.json` file as a target,
and then register it in the Circle `config.yml` file as a new job.

## E2E Testing

You can run an E2E test against your local changes/environment by using the `scripts/local-e2e.sh` script. 
It uses postman + newman to run all the same E2E tests that are run against pre-production to ensure that the services can work together properly.
