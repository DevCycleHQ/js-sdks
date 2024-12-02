import { ConfigBody } from '@devcycle/types'

/**
 * Transform the config to ensure all dates are valid Date objects
 * @param configData
 * @returns
 */
export const transformConfig = (configData: ConfigBody): ConfigBody => {
    if (!configData.features || !configData.features.length) return configData

    configData.features = configData.features.map((feature) => {
        if (!feature || !feature.configuration.targets.length) return feature

        feature.configuration.targets = feature.configuration.targets.map(
            (target) => {
                const { rollout } = target
                if (!rollout) return target

                rollout.startDate = transformDate(rollout.startDate)
                if (!rollout.stages || !rollout.stages.length) return target

                rollout.stages = rollout.stages.map((stage) => {
                    stage.date = transformDate(stage.date)
                    return stage
                })
                return target
            },
        )
        return feature
    })
    return configData
}

const transformDate = (date: unknown): Date => {
    if (!date) throw new Error('Missing rollout date in config')
    if (date instanceof Date) return date
    if (typeof date === 'string' || typeof date === 'number')
        return new Date(date)
    throw new Error('Missing rollout date in config')
}
