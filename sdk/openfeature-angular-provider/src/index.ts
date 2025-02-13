import { DevCycleOptions } from '@devcycle/js-client-sdk'
import DevCycleProvider from '@devcycle/openfeature-web-provider'

export default class DevCycleAngularProvider extends DevCycleProvider {
    constructor(sdkKey: string, options: DevCycleOptions = {}) {
        options.sdkPlatform = 'angular-of'
        super(sdkKey, options)
    }
}
