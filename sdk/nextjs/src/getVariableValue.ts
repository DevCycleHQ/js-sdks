import { getBucketedConfig } from './bucketing'

export async function getVariableValue(key: string, defaultValue: any) {
    const config = await getBucketedConfig()
    return config.variables[key]?.value ?? defaultValue
}
