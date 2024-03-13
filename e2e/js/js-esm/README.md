# DevCycle JS SDK CDN E2E Test

## Getting started

If you want to run the e2e app, from the root folder:

```bash
yarn e2e:js-esm:start
```

### Run

In [app.element.ts](src%2Fapp%2Fapp.element.ts), set `DEVCYCLE_CLIENT_SDK_KEY` to your Environment's SDK Key.
You can find this under Settings / Environments on the DevCycle dashboard.

To run the e2e tests, run from the repo's root folder:

```yarn nx e2e js-esm```