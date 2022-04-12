# DevCycle React Client SDK example
Run the command below to get started:

## Installation
```sh
yarn
cd ios
pod install
```

## Running the example

* In `App.tsx`, set `ENV_KEY` to the Environment Key. 
You can find this under Settings / Environments on the DevCycle dashboard.
* Create a new feature on the dashboard. Update the `VARIABLE_KEY` in `App.tsx` to this value.
* If you added user targeting to your feature, update the `user_id` field in `App.tsx` based on your targeting rules.

You can now start the app by running:
```sh 
yarn start example-react-native-app
react-native run-ios                  #for ios
react-native run-android              #for android
```
The example app will open in your simulator.
