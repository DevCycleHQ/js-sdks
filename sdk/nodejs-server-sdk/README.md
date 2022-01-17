# DevCycle NodeJS Server SDK

The NodeJS Server SDK for DevCycle.

This SDK uses local bucketing to perform all user segmentation and bucketing locally in the SDK, 
providing immediate responses to variable and feature requests for a user. 
The SDK will download the latest version of your DevCycle environments configuration from a CDN on initialization,
and will periodically poll the CDN for configuration changes.

### Installation

Our library can be found on npm and installed by the following:

```
npm install @devcycle/nodejs-server-sdk
```

### Usage

To use the DVC Server SDK in your project, import the `@devcycle/nodejs-server-sdk` package and 
call `initialize` with your DVC environment server key. You may optionally `await` for the client
to be initialized.

JS Example:
```javascript
const DVC = require('@devcycle/nodejs-server-sdk')

const dvcClient = await DVC.initialize('<DVC_ENVIRONMENT_SERVER_KEY>').onClientInitialized()
```

Typescript Example:
```typescript
import { initialize } from '@devcycle/nodejs-server-sdk'

const dvcClient = await initialize('<DVC_ENVIRONMENT_SERVER_KEY>').onClientInitialized()
```

### Initialization Options

The SDK exposes various initialization options which can be set on the `initialization()` method:

```javascript
const dvcClient = await DVC.initialize('<DVC_ENVIRONMENT_SERVER_KEY>', {
        configPollingIntervalMS: 60 * 1000 
    }).onClientInitialized()
```

| DVC Option | Description |
| --- | ----------- |
| configPollingIntervalMS | Controls the polling interval in milliseconds to fetch new environment config changes, defaults to 10 seconds, minimum value is 1 second. |
| configPollingTimeoutMS | Controls the request timeout to fetch new environment config changes, defaults to 5 seconds, must be less than the configPollingIntervalMS value, minimum value is 1 second. |
| flushEventsMS | Controls the interval between flushing events to the DevCycle servers, defaults to 30 seconds. |
| disableEventLogging | Disables logging of any events or user data to DevCycle. |

### User Object

The full user data must be passed into every method. The only required field is the `user_id`. 
The rest are optional and are used by the system for user segmentation into variables and features.

```javascript
const user = {
    user_id: 'user1@devcycle.com',
    name: 'user 1 name',
    customData: {
        customKey: 'customValue'
    }
}
const variable = dvcClient.variable(user, 'test-feature', false)
```

### Using Variables

To get values from your Variables, `dvcClient.variable()` is used to fetch variable values using the user data, 
variable `key`, coupled with a default value for the variable. The default variable will be used in cases where
the user is not segmented into a feature using that variable, or the project configuration is unavailable 
to be fetched from DevCycle's CDN. 

The default value can be of type string, boolean, number, or object.

```javascript
const variable = dvcClient.variable(user, 'YOUR_VARIABLE_KEY', false)
if (variable.value) {
    // Feature Flag on
}
```

### Grabbing All Variables

To grab all the segmented variables for a user:

```javascript
const variables = dvcClient.allVariables(user)
```

### Getting All Features

You can fetch all segmented features for a user:

```javascript
const features = dvcClient.allFeatures(user)
```
