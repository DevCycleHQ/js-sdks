import { unstable_flag as flag } from '@vercel/flags/next'
import { setupDevCycle } from './src/server/setupDevCycle'
import { cache } from 'react'
import { ConfigBody } from '@devcycle/types'

// mimic the Vercel JsonValue type since it is not exported
type JsonValue =
    | string
    | number
    | boolean
    | { [key: string]: JsonValue | JsonValue[] }

const configByVariable = cache((config: ConfigBody) => {
    return {
        ...config,
        featureForVariable: config.features.reduce((acc, feature) => {
            feature.variations.forEach((variation) => {
                variation.variables.forEach((variable) => {
                    acc[variable._var] = feature
                })
            })
            return acc
        }, {} as Record<string, ConfigBody['features'][0]>),
        variables: config.variables.reduce((acc, variable) => {
            acc[variable.key] = variable
            return acc
        }, {} as Record<string, ConfigBody['variables'][0]>),
    }
})

export const setupDevCycleVercelFlagHelper = (
    context: Pick<
        ReturnType<typeof setupDevCycle>,
        'getConfig' | 'getAllFeatures'
    >,
) => {
    return async <T extends JsonValue>(
        key: string,
        defaultValue: T,
    ): Promise<T> => {
        const { config: _config } = await context.getConfig()
        const config = configByVariable(_config)
        const variable = config.variables[key]

        const variableId = variable?._id
        if (!variableId) {
            console.error('[DevCycle] No Variable found for key:', key)
            return defaultValue
        }

        const featureForVariable = config.featureForVariable[variableId]

        if (!featureForVariable) {
            console.error('[DevCycle] No Feature found for Variable', key)
            return defaultValue
        }

        const getFlag = flag<string | null>({
            key: featureForVariable.key,
            defaultValue: null,
            origin: `https://app.devcycle.com/r/features/${featureForVariable.key}`,
            options: featureForVariable.variations.map((variation) => ({
                value: variation.key,
                label: variation.name,
            })),
            decide: async () => {
                const bucketedFeatures = await context.getAllFeatures()
                const feature = bucketedFeatures[featureForVariable.key]
                return feature?.variationKey ?? null
            },
        })

        const variationValue = await getFlag()

        if (variationValue === null) {
            console.error(
                '[DevCycle] No Variation Found for Variable in Flag Response',
                key,
            )
            return defaultValue
        }

        const matchedVariation = featureForVariable.variations.find(
            (variation) => {
                return variation.key === variationValue
            },
        )

        if (!matchedVariation) {
            console.error(
                '[DevCycle] No Variation Found for Variable In Config',
                key,
            )
            return defaultValue
        }

        const variationVariable = matchedVariation.variables.find(
            (variable) => {
                return variable._var === variableId
            },
        )

        if (!variationVariable) {
            console.error(
                '[DevCycle] No Variation Value Found for Variable',
                key,
            )
            return defaultValue
        }

        return variationVariable.value as T
    }
}
