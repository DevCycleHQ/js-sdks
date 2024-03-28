import { DVCVariable, DVCVariableValue } from '@devcycle/nodejs-server-sdk'
import { VariableType } from '@devcycle/types'

export class MockDevCycleClient {
    public onClientInitialized = (callback: () => any) =>
        callback?.() ?? Promise.resolve(this)
    public variable = (user: any, key: string, defaultValue: any) =>
        this.mockedVariables[key] ?? {
            key,
            value: defaultValue,
            isDefaulted: true,
            defaultValue,
            type: getType(defaultValue),
        }
    public variableValue = (user: any, key: string, defaultValue: any) =>
        this.mockedVariables[key]?.value ?? defaultValue
    public allFeatures = () => ({})
    public allVariables = () => ({})
    public track = () => null
    public flushEvents = (callback?: any) => Promise.resolve()
    public close = () => Promise.resolve()

    constructor(sdkKey: string, options?: any) {}

    private mockedVariables: Record<string, any> = {}

    public mockVariables(values: { [key: string]: DVCVariableValue }) {
        this.mockedVariables = Object.entries(values).reduce(
            (map, [key, value]) => {
                map[key] = {
                    key,
                    value,
                    isDefaulted: false,
                    defaultValue: value,
                    type: getType(value),
                }
                return map
            },
            {} as Record<string, DVCVariable<any>>,
        )
    }
}

const getType = (value: DVCVariableValue): VariableType => {
    const types = {
        string: 'String',
        number: 'Number',
        boolean: 'Boolean',
        object: 'JSON',
    }
    return types[typeof value as keyof typeof types] as VariableType
}
