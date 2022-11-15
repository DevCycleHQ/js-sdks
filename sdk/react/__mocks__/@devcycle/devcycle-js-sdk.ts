const jsSDK: any = jest.genMockFromModule('@devcycle/devcycle-js-sdk')

class Client {
    variable(key: string, defaultValue: unknown) {
        const variable: any = {
            value: defaultValue,
        }

        variable.onUpdate = jest.fn().mockReturnValue(variable)

        return variable
    }
    close() {
        // no-op
    }
}

module.exports = {
    ...jsSDK,
    initialize: () => {
        return new Client()
    }
}
