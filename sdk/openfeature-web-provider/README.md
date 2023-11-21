# OpenFeature DevCycle Javascript Web Provider

This library provides a Javascript implementation of the [OpenFeature](https://openfeature.dev/) Web Provider interface 
for [DevCycle Javascript Client SDK](https://docs.devcycle.com/sdk/client-side-sdks/javascript/).

## Building

Run `yarn nx build openfeature-web-provider` to build the library.

## Running Unit Tests

Run `yarn nx test openfeature-web-provider` to execute the unit tests via [Jest](https://jestjs.io).

## Example App

See the [example app](/examples/openfeature-web) for a working example of the OpenFeature Web DevCycle Provider.

## Usage

See our [documentation](https://docs.devcycle.com/sdk/client-side-sdks/javascript/javascript-usage) for more information.

```typescript
import DevCycleProvider from '@devcycle/openfeature-web-provider'
import { OpenFeature } from '@openfeature/web-sdk'

... 

const user = { user_id: 'user_id' }

// Initialize the DevCycle Provider
const devcycleProvider = new DevCycleProvider(DEVCYCLE_CLIENT_SDK_KEY)
// Set the context before the provider is set to ensure the DevCycle SDK is initialized with a user context.
await OpenFeature.setContext(user)
// Set the DevCycleProvider for OpenFeature
await OpenFeature.setProviderAndWait(devcycleProvider)
// Get the OpenFeature client
const openFeatureClient = OpenFeature.getClient()

// Retrieve a boolean flag from the OpenFeature client
const boolFlag = openFeatureClient.getBooleanValue('boolean-flag', false)
```

#### Passing DVCOptions to the DevCycleProvider

Ensure that you pass any custom DVCOptions to the DevCycleProvider constructor

```typescript
const options = { logger: dvcDefaultLogger({ level: 'debug' }) }
await OpenFeature.setProviderAndWait(new DevCycleProvider(DEVCYCLE_CLIENT_SDK_KEY, options))
```

#### Required TargetingKey

For DevCycle SDK to work we require either a `targetingKey` or `user_id` to be set on the OpenFeature context. 
This is used to identify the user as the `user_id` for a `DVCUser` in DevCycle.

#### Context properties to DVCUser

The provider will automatically translate known `DVCUser` properties from the OpenFeature context to the `DVCUser` object.
[DVCUser TypeScript Interface](https://github.com/DevCycleHQ/js-sdks/blob/main/sdk/nodejs/src/models/user.ts#L16)

For example all these properties will be set on the `DVCUser`:
```typescript
await OpenFeature.setContext({
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
await OpenFeature.setContext({
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
