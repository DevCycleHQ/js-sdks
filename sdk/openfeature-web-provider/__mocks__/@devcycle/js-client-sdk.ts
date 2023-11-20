const { initializeDevCycle } = jest.requireActual('@devcycle/js-client-sdk')

const { DevCycleClient } = jest.createMockFromModule<
    typeof import('@devcycle/js-client-sdk')
>('@devcycle/js-client-sdk')

export { DevCycleClient, initializeDevCycle }
