# DevCycle Vercel Global Config Adapter

This library provides an adapter for DevCycle Node.js and Next.js SDKs to retrieve configuration data from Vercel
Global Config (formerly Edge Config). To use this adapter, you must have the Vercel integration set up.

Vercel Global Config provides a much faster configuration retrieval for services deployed to Vercel's cloud infrastructure.
With the DevCycle Global Config Adapter, you can significantly improve the speed flags are retrieved during user requests.

```bash
npm install @devcycle/vercel-edge-config @vercel/global-config
```

```typescript
import { createClient } from '@vercel/global-config'
import { EdgeConfigSource } from '@devcycle/vercel-edge-config'

const globalConfigClient = createClient(
    process.env.GLOBAL_CONFIG ?? process.env.EDGE_CONFIG,
)
const configSource = new EdgeConfigSource(globalConfigClient)
```

See the [docs](https://docs.devcycle.com/integrations/vercel-edge-config) for more information.
