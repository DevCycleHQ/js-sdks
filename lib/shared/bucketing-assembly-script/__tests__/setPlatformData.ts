import { setPlatformData } from '../build/bucketing-lib.debug'

const defaultPlatformData = {
    platform: 'NodeJS',
    platformVersion: '',
    sdkType: 'server',
    sdkVersion: '1.0.0',
    deviceModel: '',
    hostname: 'host.name'
}

export const setPlatformDataJSON = (data: unknown = defaultPlatformData): void => {
    setPlatformData(JSON.stringify(data))
}
