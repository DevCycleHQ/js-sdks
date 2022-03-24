import { JSON } from 'assemblyscript-json'
import { first, last } from '../helpers/lodashHelpers'
import {
    ConfigBody, Target as PublicTarget, Feature as PublicFeature, BucketedUserConfig,
    Rollout as PublicRollout, DVCPopulatedUser, SDKVariable, SDKFeature, RolloutStage,
    Target, Variation, Variable
} from '../types'

// TODO: implement murmurhash logic in AS
// import murmurhash from 'murmurhash'
import { evaluateOperator } from './segmentation'

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE: i32 = 4294967295
const baseSeed: i32 = 1

class BoundedHash {
    public rolloutHash: i32
    public bucketingHash: i32
}

export function generateBoundedHashes(user_id: string, target_id: string): BoundedHash {
    // The seed provided to murmurhash must be a number
    // So we first hash the target_id with a constant seed

    const targetHash = 1 //murmurhash.v3(target_id, baseSeed)
    const boundedHash: BoundedHash = {
        rolloutHash: generateBoundedHash(user_id + '_rollout', targetHash),
        bucketingHash: generateBoundedHash(user_id, targetHash)
    }
    return boundedHash
}

export function generateBoundedHash(input: string, hashSeed: i32): i32 {
    const hash = 1 //murmurhash.v3(input, hashSeed)
    return hash / MAX_HASH_VALUE
}

/**
 * Given the feature and a hash of the user_id, bucket the user according to the variation distribution percentages
 */
export function decideTargetVariation(target: PublicTarget, boundedHash: i32): string {
    //TODO: figure out sorting
    const variations = target.distribution
        //.sort((a, b) => a._variation > b._variation)

    let distributionIndex: f64 = 0
    const previousDistributionIndex: f64 = 0
    for (let i = 0; i < variations.length; i++) {
        const variation = variations[i]
        distributionIndex += variation.percentage
        if (boundedHash >= previousDistributionIndex && boundedHash < distributionIndex) {
            return variation._variation
        }
    }
    throw new Error('Failed to decide target variation')
}

export function getCurrentRolloutPercentage(rollout: PublicRollout, currentDate: Date): f64 {
    const start = rollout.startPercentage
    const startDateTime = rollout.startDate.getTime()
    const currentDateTime = currentDate.getTime()

    if (rollout.type === 'schedule') {
        return currentDateTime >= startDateTime ? 1 : 0
    }

    if (!rollout.stages) {
        return 0
    }
    const stages = rollout.stages as RolloutStage[]
    const currentStages: RolloutStage[] = []
    const nextStages: RolloutStage[] = []
    for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]
        const stageTime = stage.date.getTime()
        if (stageTime <= currentDateTime) {
            currentStages.push(stage)
        } else {
            nextStages.push(stage)
        }
    }

    const _currentStage = last(currentStages)
    const nextStage = first(nextStages)

    let currentStage = _currentStage
    if (!_currentStage && (startDateTime < currentDateTime)) {
        const jsonObj = new JSON.Obj()
        jsonObj.set('type', '')
        jsonObj.set('percentage', start)
        jsonObj.set('date', rollout.startDate.toISOString())
        currentStage = new RolloutStage(jsonObj)
    }

    if (!currentStage) {
        return 0
    }

    if (!nextStage || nextStage.type === 'discrete') {
        return currentStage.percentage
    }

    const currentDatePercentage = (currentDateTime - currentStage.date.getTime()) /
            (nextStage.date.getTime() - currentStage.date.getTime())

    if (currentDatePercentage === 0) {
        return 0
    }

    return (
        (currentStage.percentage + (nextStage.percentage - currentStage.percentage))
        * f64(currentDatePercentage)
    )
}

export function doesUserPassRollout(rollout: PublicRollout | null, boundedHash: i32): bool {
    if (!rollout) return true

    const rolloutPercentage = getCurrentRolloutPercentage(rollout, new Date(Date.now()))
    return !!rolloutPercentage && (boundedHash <= rolloutPercentage)
}

export function bucketForSegmentedFeature(boundedHash: i32, target: PublicTarget): string {
    return decideTargetVariation(target, boundedHash)
}

class SegmentedFeatureData {
    public feature: PublicFeature
    public target: PublicTarget
}

export function getSegmentedFeatureDataFromConfig(
    config: ConfigBody,
    user: DVCPopulatedUser
): SegmentedFeatureData[] {
    const accumulator: SegmentedFeatureData[] = []

    for (let y = 0; y < config.features.length; y++) {
        const feature = config.features[y]

        // Returns the first target for which the user passes segmentation
        let segmentedFeatureTarget: Target | null = null
        for (let i = 0; i < feature.configuration.targets.length; i++) {
            const target = feature.configuration.targets[i]
            if (evaluateOperator(target._audience.filters, user)) {
                segmentedFeatureTarget = target
                break
            }
        }

        if (segmentedFeatureTarget) {
            const featureData: SegmentedFeatureData = {
                feature,
                target: segmentedFeatureTarget
            }
            accumulator.push(featureData)
        }
    }
    return accumulator
}

export function generateKnownVariableKeys(
    variableHashes: Map<string, i64>,
    variableMap: Map<string, SDKVariable>
): i64[] {
    const knownVariableKeys: i64[] = []
    const hashKeys = variableHashes.keys()
    for (let i = 0; i < hashKeys.length; i++) {
        const key = hashKeys[i]
        const hash = variableHashes.get(key)
        const variable = variableMap.get(key)
        if (!variable) {
            knownVariableKeys.push(hash)
        }
    }
    return knownVariableKeys
}

export function generateBucketedConfig(
    config: ConfigBody,
    user: DVCPopulatedUser
): BucketedUserConfig {
    const variableMap = new Map<string, SDKVariable>()
    const featureKeyMap = new Map<string, SDKFeature>()
    const featureVariationMap = new Map<string, string>()
    const segmentedFeatures = getSegmentedFeatureDataFromConfig(config, user)

    for (let i = 0; i < segmentedFeatures.length; i++) {
        const segmentedFeaturesData = segmentedFeatures[i]
        const feature = segmentedFeaturesData.feature
        const target = segmentedFeaturesData.target

        const boundedHashData = generateBoundedHashes(user.user_id, target._id)
        const rolloutHash = boundedHashData.rolloutHash
        const bucketingHash = boundedHashData.bucketingHash
        if (target.rollout && !doesUserPassRollout(target.rollout, rolloutHash)) {
            continue
        }

        const variation_id = bucketForSegmentedFeature(bucketingHash, target)
        featureKeyMap.set(feature.key, new SDKFeature(
            feature._id,
            feature.key,
            feature.type,
            variation_id,
            null
        ))
        featureVariationMap.set(feature._id, variation_id)

        let variation: Variation | null = null
        for (let i = 0; i < feature.variations.length; i++) {
            const featVariation = feature.variations[i]
            if (featVariation._id === variation_id) {
                variation = featVariation
                break
            }
        }
        if (!variation) {
            throw new Error(`Config missing variation: ${variation_id}`)
        }

        for (let y = 0; y < variation.variables.length; y++) {
            const variationVar = variation.variables[y]

            // Find variable
            let variable: Variable | null = null
            for (let u = 0; u < config.variables.length; u++) {
                const configVar = config.variables[u]
                if (configVar._id === variationVar._var) {
                    variable = configVar
                    break
                }
            }
            if (!variable) {
                throw new Error(`Config missing variable: ${variationVar._var}`)
            }

            const newVar = new SDKVariable(
                variable._id,
                variable.type,
                variable.key,
                variationVar.value,
                null
            )
            variableMap.set(variable.key, newVar)
        }
    }

    return new BucketedUserConfig(
        config.project,
        config.environment,
        featureKeyMap,
        featureVariationMap,
        variableMap,
        generateKnownVariableKeys(config.variableHashes, variableMap)
    )
}
