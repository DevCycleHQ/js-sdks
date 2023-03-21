import { DVCClient, initialize } from '@devcycle/nodejs-server-sdk'
import { promisify } from 'util'

const DVC_SERVER_SDK_KEY = process.env['DVC_SERVER_SDK_KEY'] || '<YOUR_DVC_SERVER_SDK_KEY>'

let dvcClient: DVCClient

export async function benchDVC(): Promise<void> {
    if (!dvcClient) {
        console.log('start bench')
        dvcClient = await initialize(DVC_SERVER_SDK_KEY, {
            logLevel: 'debug',
            enableCloudBucketing: false,
            disableAutomaticEventLogging: true,
            reporter: {
                reportMetric: (report) => {
                    console.log(report)
                },
                reportFlushResults: (report) => {
                    console.log(report)
                }
            }
        }).onClientInitialized()
    }

    // console.log('wait 3 seconds')
    await promisify(setTimeout)(500)
    // console.log('finished waiting 0.5 seconds')

    const user = {
        user_id: '4807c61a2a922081',
        country: 'CA',
        // customData: { 'customDataKey': 'customDataValue', num: 610, bool: false },
        // privateCustomData: { 'customDataKey': 'customDataValue', num: 610, bool: false }
    }
    let variable
    const time = performance.now()
    const count = 50000

    for (let i = 0; i < count; i++) {
        variable = dvcClient.variable(user, 'v-key-50', false)
    }

    const endTime = performance.now() - time
    console.log(
        `Variable 'v-key-50' value is ${variable?.value}, is defaulted: ${variable?.isDefaulted}, ` +
        `total: ${endTime}ms, per call: ${endTime / count}ms`
    )

    if (process.env.DVC_BENCH_LOOP) {
        benchDVC()
    }
}
