# DevCycle React SDK

The React SDK for DevCycle!

# Usage

## Provider
```js
import { withDVCProvider } from '@devcycle/devcycle-react-sdk'
```
```js
const user = {
  user_id: 'my_user_id'
}

export default withDVCProvider({ envKey: 'ENV_KEY', user })(App)
```

### Usage with Next.js
#### Inside pages/_app.js:
```js
import { withDVCProvider } from '@devcycle/devcycle-react-sdk'

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />;
}

export default withDVCProvider({ envKey: 'ENV_KEY', user: { user_id: 'my_user_id' } })(MyApp)

```

## Async Provider

```js
import { asyncWithDVCProvider } from '@devcycle/devcycle-react-sdk'
```
```js
(async () => {

    const user = {
        user_id: 'my_user_id'
    }
    const DVCProvider = await asyncDVCProvider({ envKey: 'ENV_KEY', user })
    
    render(
        <DVCProvider>
            <App />
        </DVCProvider>
    )
})();
```


## DevCycle Variable

```js
import useVariable from '@devcycle/devcycle-react-sdk/useVariable'
...

const DVCFeaturePage = () => {
    const featureKey = 'my-feature'
    const featureVariable = useVariable(featureKey, false)

    return (
        <div>
        { featureVariable.value ? <div>Variable on!</div> : <div>Variable off</div> }
        </div>
    )
}
```

