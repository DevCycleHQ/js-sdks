const jsSDK: any = jest.genMockFromModule('@devcycle/devcycle-js-sdk')

const mockVariableFunction = jest.fn().mockImplementation((key: string, defaultValue: unknown) => {
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
    initialize: () => {
        return new Client()
    }
}
