# DevCycle React Client SDK example
Run the command below to get started:

## Installation
```sh
yarn
```

## Running the example

* In `index.tsx`, set `ENV_KEY` to the Environment Key. 
You can find this under Settings / Environments on the DevCycle dashboard.
* Create a new feature on the dashboard. Update the `variableKey` in `DevCycleExample.tsx` to this value.
* If you added user targeting to your feature, update the `user_id` field in `index.tsx` based on your targeting rules.

You can now start the app by running:
```sh 
yarn start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
