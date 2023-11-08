# DevCycle Next.js SDK

Official SDK for integrating DevCycle feature flags with your Next.js application.

## Features
- full support for App Router and server components
- keep server and client rendered content in sync with the same flag values
- keep user data for targeting rule evaluation private on the server
- realtime updates to flag values for both server and client components
- support for non-blocking flag state retrieval and streaming 

## Limitations
- currently only App Router is supported.
- Minimum Next.js version: 14.0.0

## Installation
```npm install @devcycle/nextjs-sdk```
```yarn add @devcycle/nextjs-sdk```

## Usage
### Wrap your app in the DevCycleServersideProvider
In a server component (as early as possible in the tree):
```typescript jsx
export default async function RootLayout({
 children,
}: {
    children: React.ReactNode
}) {
    // pseudocode function for determining user identity based on request data.
    const userIdentity = await determineUserIdentity()
    return (
        <html lang="en">
            <body>
                <DevCycleServersideProvider
                    sdkKey={process.env.NEXT_PUBLIC_DEVCYCLE_CLIENT_SDK_KEY ?? ''}
                    user={{ user_id: userIdentity.id }}
                    options={{
                        enableClientsideIdentify: !shouldTrustServerData,
                        enableStreaming: true,
                    }}
                >
                    {children}
                </DevCycleServersideProvider>
            </body>
        </html>
    )
}
```
Note: You _must_ use the client SDK key of your project, not the server SDK key. The key is used across the server and
the client and will be sent to the clientside to bootstrap the client SDK.

The DevCycleServersideProvider will:
- fetch your project's configuration from DevCycle
- render a client component provider that provides a clientside DevCycle SDK

It will also await the retrieval of the DevCycle configuration, thus blocking further rendering until the flag states
have been retrieved and rendering can take place with the correct values.

### Get a variable value (server component)
```typescript jsx
import { getVariableValue } from '@devcycle/next-sdk/server'
import * as React from 'react'

export const MyServerComponent = async function () {
    const myVariable = await getVariableValue('myVariable', false)
    return (
        <>
            <b>Server Variable</b>
            <span>
                {JSON.stringify(myVariable)}
            </span>
        </>
    )
}
```

### Get a variable value (client component)
```typescript jsx
'use client'
import { useVariableValue } from '@devcycle/next-sdk'
import * as React from 'react'

export const MyClientComponent = function () {
    const myVariable = useVariableValue('myVariable', false)
    return (
        <>
            <b>Client Variable</b>
            <span>
                {JSON.stringify(myVariable)}
            </span>
        </>
    )
}
```

### Tracking an event (server component)
```typescript jsx
import { trackEvent } from '@devcycle/next-sdk/server'
import * as React from 'react'
export default MyComponent = function() {
    trackEvent({type: "myEvent"})
    return (
        <div>
            Track Event When This Renders
        </div>
    )
}
```

```typescript jsx
'use server'

/**
 * Track event in server action
 */
export function submitForm() {
    trackEvent({type: "formSubmitted"})
    // ...
}
```

### Tracking an event (client component)

```typescript jsx
'use client'
import * as React from 'react'
import { useDevCycleClient } from '@devcycle/next-sdk'

export default MyComponent = function () {
    const client = useDevCycleClient()
    return (
        <button onClick={() => client.track('myEvent')}>
            Track Event
        </button>
    )
}
```

## Advanced
### Non-Blocking Initialization
If you wish to render your page without waiting for the DevCycle configuration to be retrieved, you can use the
`enableStreaming` option. Doing so enables the following behaviour:
- the DevCycleServersideProvider will not block rendering of the rest of the server component tree
- any calls to `getVariableValue` will still block on the config being retrieved. To unblock rendering on these calls,
use a `Suspense` boundary to send a fallback while the config is being retrieved. The component will then stream to 
the client once the config is retrieved.
- client components will be rendered with their default values. When the configuration is retrieved, it will be
streamed to the client and components will render again with their true variable values.

### Identifying the user clientside
For some use cases, it may make sense to be able to change the user's identity after the page is served from the
clientside. The SDK can support this use case via the use of a cookie to keep the identity in sync across the
server and client.
To enable this feature, set the `enableClientsideIdentify` option. When enabled, the user that is provided to the
serverside provider will only be used in the case where the incoming request does not contain a special DevCycle cookie
containing the latest user identity. If the cookie is present, the user identity from the cookie will be used instead.

To identify the user clientside, use the `useIdentifyUser` method on the clientside SDK:
```typescript jsx
import { useIdentifyUser } from '@devcycle/next-sdk'

export default MyComponent = function () {
    const identifyUser = useIdentifyUser()
    return (
        <button onClick={() => identifyUser({ user_id: 'new_user_id' })}>
            Identify User
        </button>
    )
}
```

When the user is identified, the cookie will be updated with that identity and the SDK will trigger a re-render of the 
page to receive updated server and client components.

Note that using this option will expose your user data to the clientside. If you wish for that data to remain private
from the end-user, you should only identify users on the serverside.

## Running unit tests

Run `nx test nextjs` to execute the unit tests via [Jest](https://jestjs.io).
