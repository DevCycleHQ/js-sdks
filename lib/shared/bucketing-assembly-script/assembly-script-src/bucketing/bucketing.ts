'use strict'
import { find, first, last } from '../helpers/lodashHelpers'
import {
    ConfigBody, Target as PublicTarget, Feature as PublicFeature, BucketedUserConfig,
    Rollout as PublicRollout, DVCPopulatedUser, RolloutStage as PublicRolloutStage,
    SDKVariable, SDKFeature, Feature, RolloutStage, TopLevelOperator, Target
} from '../types'

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

    let distributionIndex = 0
    const previousDistributionIndex = 0
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
    const startDate = rollout.startDate

    if (rollout.type === 'schedule') {
        return currentDate >= startDate ? 1 : 0
    }

    // if (!(typeof start === 'number')) {
    //     throw new Error('Invalid rollout configuration')
    // }

    if (!rollout.stages) {
        return 0
    }
    const stages = rollout.stages as RolloutStage[]
    const _currentStage = last(
        stages.filter((stage) => stage.date <= currentDate),
    )
    const nextStage = first(
        stages.filter((stage) => stage.date > currentDate),
    )

    const currentStage = // : Omit<PublicRolloutStage, 'type'> | null
        _currentStage || (startDate < currentDate ? {
            percentage: start,
            date: startDate
        } : null)

    if (!currentStage) {
        return 0
    }

    if (!nextStage || nextStage.type === 'discrete') {
        return currentStage.percentage
    }

    const currentDatePercentage = (currentDate.getTime() - currentStage.date.getTime()) /
            (nextStage.date.getTime() - currentStage.date.getTime())

    if (currentDatePercentage === 0) {
        return 0
    }

    return (
        currentStage.percentage +
        (nextStage.percentage - currentStage.percentage) * currentDatePercentage
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

interface SegmentedFeatureData {
    feature: PublicFeature,
    target: PublicTarget
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
            accumulator.push({
                feature,
                target: segmentedFeatureTarget
            })
        }
    }
    return accumulator
}

export function generateKnownVariableKeys(
    variableHashes: Map<string, i64>,
    variableMap: Map<string, SDKVariable>
): i64[] {
    const knownVariableKeys: i64[] = []
    variableHashes.keys().forEach((key) => {
        const hash = variableHashes.get(key)
        const variable = variableMap.get(key)
        if (!variable) {
            knownVariableKeys.push(hash)
        }
    })
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

    segmentedFeatures.forEach((segmentedFeaturesData) => {
        const feature = segmentedFeaturesData.feature
        const target = segmentedFeaturesData.target

        const boundedHashData = generateBoundedHashes(user.user_id, target._id)
        const rolloutHash = boundedHashData.rolloutHash
        const bucketingHash = boundedHashData.bucketingHash
        if (target.rollout && !doesUserPassRollout(target.rollout, rolloutHash)) {
            return
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

        const variation = find(feature.variations, (v) => v._id === variation_id)
        if (!variation) {
            throw new Error(`Config missing variation: ${variation_id}`)
        }

        variation.variables.forEach((variationVar) => {
            const variable = find(config.variables, (v) => v._id === variationVar._var)
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
        })
    })

    return new BucketedUserConfig(
        config.project,
        config.environment,
        featureKeyMap,
        featureVariationMap,
        variableMap,
        generateKnownVariableKeys(config.variableHashes, variableMap)
    )
}
