# DevCycle JS SDK CDN E2E Test

Used to E2E test the minified js sdk build.

### Build

In order to build the e2e test application, you will need to run the correct build command (see below). 
This command will first build the minified js-sdk and then copy the minified sdk into the assets folder inside this project's src directory
before finally building this project.

run from the repo's root folder:

```yarn nx run js-cdn:build-with-sdk```

### Run

In [app.element.ts](src%2Fapp%2Fapp.element.ts), set `DEVCYCLE_CLIENT_SDK_KEY` to your Environment's SDK Key.
You can find this under Settings / Environments on the DevCycle dashboard.

To run the e2e tests, run from the repo's root folder:

```yarn nx e2e js-cdn```
