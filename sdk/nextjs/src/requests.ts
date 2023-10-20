import { getSDKKey } from './context'

export const fetchCDNConfig = async () => {
    console.log('FETCHING', getSDKKey())
    return await fetch(
        `https://config-cdn.devcycle.com/config/v1/client/${getSDKKey()}.json`,
    )
}
