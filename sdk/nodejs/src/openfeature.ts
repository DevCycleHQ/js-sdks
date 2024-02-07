import { DevCycleClient as DevCycleClientCore } from './client'
import DevCycleProvider from './open-feature-provider/DevCycleProvider'
import { DevCycleServerSDKOptions } from '@devcycle/types'

class DevCycleClient extends DevCycleClientCore {
    private openFeatureProvider: DevCycleProvider

    constructor(sdkKey: string, options?: DevCycleServerSDKOptions) {
        super(sdkKey, options)
    }

    getOpenFeatureProvider(): DevCycleProvider {
        if (this.openFeatureProvider) return this.openFeatureProvider

        this.openFeatureProvider = new DevCycleProvider(this, {
            logger: this.logger,
        })
        return this.openFeatureProvider
    }
}

DevCycleClient.prototype.getOpenFeatureProvider = function () {
    if (this.openFeatureProvider) return this.openFeatureProvider

    this.openFeatureProvider = new DevCycleProvider(this, {
        logger: this.logger,
    })
    return this.openFeatureProvider
}

export { DevCycleClient, DevCycleProvider }
