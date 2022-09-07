import { getBucketingLib } from '../../src/bucketing'

const defaultPlatformData = {
    platform: 'NodeJS',
    platformVersion: '16.10.0',
    sdkType: 'server',
    sdkVersion: '1.0.0',
    deviceModel: '',
    hostname: 'host.name'
}

export const setPlatformDataJSON = (data: unknown = defaultPlatformData): void => {
    getBucketingLib().setPlatformData(JSON.stringify(data))
}
