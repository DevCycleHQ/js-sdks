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
class Client {
    variable(key: string, defaultValue: unknown) {
        return mockVariableFunction(key, defaultValue)
    }
    close() {
        // no-op
    }
}

module.exports = {
    ...jsSDK,
    mockVariableFunction,
    initializeDevCycle: () => new Client(),
    initialize: () => new Client(),
}
