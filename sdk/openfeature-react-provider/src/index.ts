import { DevCycleOptions } from '@devcycle/js-client-sdk'
import DevCycleProvider from '@devcycle/openfeature-web-provider'

export default class DevCycleReactProvider extends DevCycleProvider {
    constructor(sdkKey: string, options: DevCycleOptions = {}) {
        options.sdkPlatform = 'react-of'
        super(sdkKey, options)
    }
}
