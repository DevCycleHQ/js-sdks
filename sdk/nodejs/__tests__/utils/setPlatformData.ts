import { Exports } from '@devcycle/bucketing-assembly-script'

const defaultPlatformData = {
    platform: 'NodeJS',
    platformVersion: '16.10.0',
    sdkType: 'server',
    sdkVersion: '1.0.0',
    deviceModel: '',
    hostname: 'host.name',
}

export const setPlatformDataJSON = (
    bucketing: Exports,
    data: unknown = defaultPlatformData,
): void => {
    bucketing.setPlatformData(JSON.stringify(data))
}
