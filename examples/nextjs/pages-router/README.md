# DevCycle NextJS Pages Router Example
Run the command below to get started:

## Installation
Install all packages using `yarn` in the root directory.

## Running the example

* In `pages/_app.tsx`, set `<DEVCYCLE_CLIENT_SDK_KEY>` to the SDK Key for your environment.
  You can find this under Settings / Environments on the DevCycle dashboard.
* Create a new feature on the dashboard. Update the `variableKey` in `pages/index.tsx` to this value.
* If you added user targeting to your feature, update the `user_id` field in `pages/_app.tsx` based on your targeting rules.

You can now start the app by running:
```sh 
yarn nx serve example-nextjs-pages-router
```
Open [http://localhost:4200](http://localhost:4200) to view it in the browser.
