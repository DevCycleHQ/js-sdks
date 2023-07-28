import { DevCycleClient, initializeDevCycle } from '@devcycle/nodejs-server-sdk'
import { promisify } from 'util'

const DEVCYCLE_SERVER_SDK_KEY =
    process.env['DEVCYCLE_SERVER_SDK_KEY'] || '<DEVCYCLE_SERVER_SDK_KEY>'

let devcycleClient: DevCycleClient

export async function benchmarkDevCycle(): Promise<void> {
    if (!devcycleClient) {
        console.log('start bench')
        devcycleClient = await initializeDevCycle(DEVCYCLE_SERVER_SDK_KEY, {
            logLevel: 'debug',
            enableCloudBucketing: false,
            disableAutomaticEventLogging: false,
            reporter: {
                reportMetric: (report) => {
                    console.log(report)
                },
                reportFlushResults: (report) => {
                    console.log(report)
                },
            },
        }).onClientInitialized()
    }

    await promisify(setTimeout)(500)

    const user = {
        user_id: '4807c61a2a922081',
        country: 'CA',
    }
    let variable
    const time = performance.now()
    const count = 50000
    const variableKey = 'v-key-50'

    for (let i = 0; i < count; i++) {
        variable = devcycleClient.variable(user, variableKey, false)
    }

    const endTime = performance.now() - time
    console.log(
        `Variable '${variableKey}' value is ${variable?.value}, is defaulted: ${variable?.isDefaulted}, ` +
            `total: ${endTime}ms, per call: ${endTime / count}ms`,
    )

    if (process.env.DVC_BENCH_LOOP) {
        benchmarkDevCycle()
    }
}
