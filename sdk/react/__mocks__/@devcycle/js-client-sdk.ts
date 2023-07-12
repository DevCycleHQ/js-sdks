const jsSDK: any = jest.genMockFromModule('@devcycle/js-client-sdk')

const mockVariableFunction = jest
    .fn()
    .mockImplementation((key: string, defaultValue: unknown) => {
        const variable: any = {
            value: defaultValue,
        }

        variable.onUpdate = jest.fn().mockReturnValue(variable)

        return variable
    })

const mockSubscribeFunction = jest.
    fn()
    .mockImplementation((key: string, handler: () => void) => {
       return
    })

const mockUnsubscribeFunction = jest
    .fn()
    .mockImplementation((key: string, handler: () => void) => {
        return
    })

class Client {
    variable(key: string, defaultValue: unknown) {
        return mockVariableFunction(key, defaultValue)
    }
    subscribe(key: string, handler: () => void) {
        return mockSubscribeFunction(key, handler)
    }
    unsubscribe(key: string, handler: () => void) {
        return mockUnsubscribeFunction(key, handler)
    }
    close() {
        // no-op
    }
}

module.exports = {
    ...jsSDK,
    mockVariableFunction,
    mockSubscribeFunction,
    initializeDevCycle: () => new Client(),
    initialize: () => new Client(),
}
