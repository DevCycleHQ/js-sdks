# DevCycle JS SDK

The JS SDK for DevCycle!

# Installation

Our library can be found on npm and installed by the following:

```
npm install @devcycle/devcycle-js-sdk
```

To use in your project, import the `initialize` function:

```
import { initialize } from '@devcycle/devcycle-js-sdk'
```

# Usage

## Starting the SDK

Call `initialize` with your client key and a user object. The user object needs either a `user_id`, or `isAnonymous` set to `true` for an anonymous user. 

```
const user = { user_id: 'my_user' }
const client = initialize('YOUR_CLIENT_KEY', user)
```

## Waiting for Features 

You can wait on the features to be loaded from our servers by using `.onClientInitialized()` function. It returns a promise that you can use to wait until features are ready to be used:

```
client.onClientInitialized().then(() => {
    const featureToggle = client.variable('YOUR_VARIABLE_KEY', false)
    if (featureToggle) {
        ...
    } else {
        ...
    }
})
```

You can also pass in a callback which will get called after the features are loaded:

```
client.onClientInitialized((err) => {
    if (err) {
        // error state
    }
    
    const featureToggle = client.variable('YOUR_VARIABLE_KEY', false)
    if (featureToggle) {
        ...
    } else {
        ...
    }
})
```

## Grabbing Variable Values

To get values from your Features, `.variable` is used to fetch variable values using the identifier `key` coupled with a default value. The default value can be of type string, boolean, number, or object.

```
const variable = client.variable('YOUR_VARIABLE_KEY', 'default value')
```

To grab the value, there is a property on the object returned to grab the value: 

```
const value = variable.value
```

If the value is not ready, it will return the default value passed in the creation of the variable. To get notified when the variable is loaded: 

```
variable.onUpdate((value) => {
    // value returned when the value of the variable changes
})
```

## Identifying User

To identify a different user, or the same user passed into the initialize with more attributes, pass in the entire user attribute object into `identifyUser`:

```
const user = {
    user_id: 'user1',
    name: 'user 1 name',
    customData: {
        customKey: 'customValue'
    }
}
client.identifyUser(user)
```

To wait on Variables that will be returned from the identify call, you can pass in a callback or use the Promise returned if no callback is passed in:

```
const variableSet = await client.identifyUser(user)

// OR

client.identifyUser(user, (err, variables) => {
    // variables is the variable set for the identified user
})
```

## Reset User

To reset the user into an anonymous user, `resetUser` will reset to the anonymous user created before or will create one with an anonymous `user_id`.

```
client.resetUser()
```

To wait on the Features of the anonymous user, you can pass in a callback or use the Promise returned if no callback is passed in:

```
const variableSet = await client.resetUser()

// OR

client.resetUser((err, variables) => {
    // variables is the variable set for the anonymous user
})
```

## Grabbing All Features / Variables

To grab all the Features or Variables returned in the config:

```
const features = client.allFeatures()
const variables = client.allVariables()
```

If the SDK has not finished initializing, these methods will return an empty object.

## Tracking Events

To track events, pass in an object with at least a `type` key:

```
const event = {
    type: 'my_event_type', // this is required
    date: new Date(),
    target: 'my_target',
    value: 5,
    metaData: {
        key: 'value'
    }
}
client.track(event)
```

The SDK will flush events every 10s or `flushEventsMS` specified in the options. To manually flush events, call:

```
await client.flushEvents()

// or 

client.flushEvents(() => {
    // called back after flushed events
})
```
