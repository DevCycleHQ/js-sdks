import { getBucketedConfig } from './bucketing'
import { getIdentity, getSDKKey } from './context'

export const getDevCycleContext = async () => {
    const config = await getBucketedConfig()
    return {
        user: getIdentity(),
        config,
        sdkKey: getSDKKey(),
    }
}

export const DevCycleContext = async () => {
    const config = await getBucketedConfig()
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `window.DEVCYCLE_CONTEXT=${JSON.stringify({
                    user: getIdentity(),
                    config,
                    sdkKey: getSDKKey(),
                })}`,
            }}
        ></script>
    )
}
