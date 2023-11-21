// Need to disable this to keep the working jest mock
// eslint-disable-next-line @nx/enforce-module-boundaries
import { initializeDevCycle } from '@devcycle/js-client-sdk'

const { DevCycleClient } = jest.createMockFromModule<
    typeof import('@devcycle/js-client-sdk')
>('@devcycle/js-client-sdk')

export { DevCycleClient, initializeDevCycle }
