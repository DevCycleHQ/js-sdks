import { unstable_flag as flag } from '@vercel/flags/next'
import { setupDevCycle } from './src/server/setupDevCycle'

// mimic the Vercel JsonValue type since it is not exported
type JsonValue =
    | string
    | number
    | boolean
    | { [key: string]: JsonValue | JsonValue[] }

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
        const { config } = await context.getConfig()
        const variable = config.variables.find(
            (variable) => variable.key === key,
        )

        const variableId = variable?._id
        if (!variableId) {
            console.error('[DevCycle] No Variable found for key:', key)
            return defaultValue
        }

        const featureForVariable = config.features.find((feature) => {
            return !!feature.variations[0]?.variables.find(
                (variable) => variable._var === variableId,
            )
        })

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
