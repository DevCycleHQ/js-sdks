# OpenFeature DevCycle NodeJS Provider

This library provides a NodeJS implementation of the [OpenFeature](https://openfeature.dev/) Provider interface for DevCycle.

## Building

Run `nx build openfeature-nodejs-provider` to build the library.

## Running Unit Tests

Run `nx test openfeature-nodejs-provider` to execute the unit tests via [Jest](https://jestjs.io).

## Example App

See the [example app](/examples/openfeature-nodejs) for a working example of the OpenFeature DevCycle NodeJS Provider.

## Usage

See our [documentation](https://docs.devcycle.com/sdk/server-side-sdks/node/) for more information.

```typescript
import { OpenFeature, Client } from '@openfeature/server-sdk'
import { DevCycleProvider } from '@devcycle/openfeature-nodejs-provider'
import { initialize } from '@devcycle/nodejs-server-sdk'

... 

// Initialize the DevCycle SDK
const devcycleClient = await initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY).onClientInitialized()
// Set the initialized DevCycle client as the provider for OpenFeature
OpenFeature.setProvider(new DevCycleProvider(devcycleClient))
// Get the OpenFeature client
openFeatureClient = OpenFeature.getClient()
// Set the context for the OpenFeature client, you can use 'targetingKey' or 'user_id'
openFeatureClient.setContext({ targetingKey: 'node_sdk_test' })


// Retrieve a boolean flag from the OpenFeature client
const boolFlag = await openFeatureClient.getBooleanValue('boolean-flag', false)
```

#### Passing DVCOptions to the DevCycleProvider

Ensure that you pass any custom DVCOptions to the DevCycleProvider constructor

```typescript
const options = { logger: dvcDefaultLogger({ level: 'debug' }) }
const devcycleClient = await initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, options).onClientInitialized()
OpenFeature.setProvider(new DevCycleProvider(devcycleClient, options))
```

#### Required TargetingKey

For DevCycle SDK to work we require either a `targetingKey` or `user_id` to be set on the OpenFeature context. 
This is used to identify the user as the `user_id` for a `DVCUser` in DevCycle.

#### Context properties to DVCUser

The provider will automatically translate known `DVCUser` properties from the OpenFeature context to the `DVCUser` object.
[DVCUser TypeScript Interface](https://github.com/DevCycleHQ/js-sdks/blob/main/sdk/nodejs/src/models/user.ts#L16)

For example all these properties will be set on the `DVCUser`:
```typescript
openFeatureClient.setContext({
    user_id: 'user_id',
    email: 'email@devcycle.com',
    name: 'name',
    language: 'en',
    country: 'CA',
    appVersion: '1.0.11',
    appBuild: 1000,
    customData: { custom: 'data' },
    privateCustomData: { private: 'data' }
})
```

Context properties that are not known `DVCUser` properties will be automatically 
added to the `customData` property of the `DVCUser`.

#### Context Limitations

DevCycle only supports flat JSON Object properties used in the Context. Non-flat properties will be ignored.

For example `obj` will be ignored: 
```typescript
openFeatureClient.setContext({
    user_id: 'user_id',
    obj: { key: 'value' }
})
```

#### JSON Flag Limitations

The OpenFeature spec for JSON flags allows for any type of valid JSON value to be set as the flag value.

For example the following are all valid default value types to use with OpenFeature:
```typescript
// Invalid JSON values for the DevCycle SDK, will return defaults
openFeatureClient.getObjectValue('json-flag', ['arry'])
openFeatureClient.getObjectValue('json-flag', 610)
openFeatureClient.getObjectValue('json-flag', false)
openFeatureClient.getObjectValue('json-flag', 'string')
openFeatureClient.getObjectValue('json-flag', null)
```

However, these are not valid types for the DevCycle SDK, the DevCycle SDK only supports JSON Objects:
```typescript
// Valid JSON Object as the default value, will be evaluated by the DevCycle SDK
openFeatureClient.getObjectValue('json-flag', { default: 'value' })
```
