# DevCycle React SDK

The React SDK for DevCycle!

DevCycle is a feature flag management provider with robust support for user targeting, realtime updates of flag values
and deep integrations with your development workflow.

The React SDK provides first-class support for flagging in React applications. It contains hooks for reading flag 
values and re-rendering components when those values change:
```jsx
import { useVariableValue } from '@devcycle/react-client-sdk';

export function MyComponent() {
    const myVariableValue = useVariableValue('myVariable', false);
    return (
        <div>
            {myVariableValue ? 'Variable is true!' : 'Variable is false!'}
        </div>
    )
}
```
This SDK depends on the [fetch](https://github.com/BuilderIO/this-package-uses-fetch) API.

# Usage

To find usage documentation, visit our [docs](https://docs.devcycle.com/docs/sdk/client-side-sdks/react).
