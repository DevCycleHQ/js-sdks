import { JSON } from 'assemblyscript-json/assembly'
import { first, last } from '../helpers/lodashHelpers'
import {
    ConfigBody, Target as PublicTarget, Feature as PublicFeature, BucketedUserConfig,
    Rollout as PublicRollout, DVCPopulatedUser, SDKVariable, SDKFeature, RolloutStage,
    Target, Variation, Variable, TargetDistribution, FeatureVariation, Feature
} from '../types'

import { murmurhashV3 } from '../helpers/murmurhash'
import { SortingArray, sortObjectsByString } from '../helpers/arrayHelpers'
import { _evaluateOperator } from './segmentation'
import { _getFeatureForVarId } from '../managers/configDataManager'

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE: f64 = 4294967295
const baseSeed: i32 = 1

export class BoundedHash {
    public rolloutHash: f64
    public bucketingHash: f64
}

export function _generateBoundedHashes(user_id: string, target_id: string): BoundedHash {
    // The seed provided to murmurhash must be a number
    // So we first hash the target_id with a constant seed

    const targetHash = murmurhashV3(target_id, baseSeed)
    const boundedHash: BoundedHash = {
        rolloutHash: generateBoundedHash(user_id + '_rollout', targetHash),
        bucketingHash: generateBoundedHash(user_id, targetHash)
    }
    return boundedHash
}

export function generateBoundedHash(input: string, hashSeed: i32): f64 {
    const hash = murmurhashV3(input, hashSeed) as f64
    return hash / MAX_HASH_VALUE
}

/**
 * Given the feature and a hash of the user_id, bucket the user according to the variation distribution percentages
 */
export function _decideTargetVariation(target: PublicTarget, boundedHash: f64): string {
    const sortingArray: SortingArray<TargetDistribution> = []
    for (let i = 0; i < target.distribution.length; i++) {
        sortingArray.push({
            entry: target.distribution[i],
            value: target.distribution[i]._variation
        })
    }
    const variations = sortObjectsByString<TargetDistribution>(sortingArray, 'desc')

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

    const stages = rollout.stages

    const currentStages: RolloutStage[] = []
    const nextStages: RolloutStage[] = []

    if (stages) {
        for (let i = 0; i < stages.length; i++) {
            const stage = stages[i]
            const stageTime = stage.date.getTime()
            if (stageTime <= currentDateTime) {
                currentStages.push(stage)
            } else {
                nextStages.push(stage)
            }
        }
    }

    const _currentStage = last(currentStages)
    const nextStage = first(nextStages)

    let currentStage = _currentStage
    if (!_currentStage && (startDateTime < currentDateTime)) {
        const jsonObj = new JSON.Obj()
        jsonObj.set('type', 'discrete')
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

    const currentDatePercentage: f64 = (currentDateTime - currentStage.date.getTime() as f64) /
            (nextStage.date.getTime() - currentStage.date.getTime() as f64)

    if (currentDatePercentage === 0) {
        return 0
    }

    return (
        (currentStage.percentage + (nextStage.percentage - currentStage.percentage))
        * f64(currentDatePercentage)
    )
}

export function _doesUserPassRollout(rollout: PublicRollout | null, boundedHash: f64): bool {
    if (!rollout) return true

    const rolloutPercentage = getCurrentRolloutPercentage(rollout, new Date(Date.now()))
    return !!rolloutPercentage && (boundedHash <= rolloutPercentage)
}

export function bucketForSegmentedFeature(boundedHash: f64, target: PublicTarget): string {
    return _decideTargetVariation(target, boundedHash)
}

class SegmentedFeatureData {
    public feature: PublicFeature
    public target: PublicTarget
}

function evaluateSegmentationForFeature(
    config: ConfigBody,
    feature: Feature,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): Target | null {
    // Returns the first target for which the user passes segmentation
    let segmentedFeatureTarget: Target | null = null
    for (let i = 0; i < feature.configuration.targets.length; i++) {
        const target = feature.configuration.targets[i]
        if (_evaluateOperator(target._audience.filters, config.audiences, user, clientCustomData)) {
            segmentedFeatureTarget = target
            break
        }
    }

    return segmentedFeatureTarget
}

export function getSegmentedFeatureDataFromConfig(
    config: ConfigBody,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): SegmentedFeatureData[] {
    const accumulator: SegmentedFeatureData[] = []

    for (let y = 0; y < config.features.length; y++) {
        const feature = config.features[y]

        // Returns the first target for which the user passes segmentation
        const segmentedFeatureTarget: Target | null = evaluateSegmentationForFeature(
            config,
            feature,
            user,
            clientCustomData
        )

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

function doesUserQualifyForFeature(
    config: ConfigBody,
    feature: Feature,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): Target | null {
    const target = evaluateSegmentationForFeature(
        config,
        feature,
        user,
        clientCustomData
    )

    if (!target) return null

    const boundedHashData = _generateBoundedHashes(user.user_id, target._id)
    const rolloutHash = boundedHashData.rolloutHash

    if (target.rollout && !_doesUserPassRollout(target.rollout, rolloutHash)) {
        return null
    }

    return target
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
        if (!variableMap.has(key)) {
            knownVariableKeys.push(hash)
        }
    }
    return knownVariableKeys
}

export function bucketUserForVariation(
    feature: Feature,
    target: Target,
    user: DVCPopulatedUser
): Variation {
    const boundedHashData = _generateBoundedHashes(user.user_id, target._id)
    const bucketingHash = boundedHashData.bucketingHash

    const variation_id = bucketForSegmentedFeature(bucketingHash, target)
    let variation: Variation | null = null
    for (let t = 0; t < feature.variations.length; t++) {
        const featVariation = feature.variations[t]
        if (featVariation._id === variation_id) {
            variation = featVariation
            break
        }
    }
    if (!variation) {
        throw new Error(`Config missing variation: ${variation_id}`)
    }

    return variation
}

function getConfigVariableForKey(
    config: ConfigBody,
    variableKey: string
): Variable | null {
    for (let u = 0; u < config.variables.length; u++) {
        const configVar = config.variables[u]
        if (configVar.key === variableKey) {
            return configVar
        }
    }

    return null
}

export function _generateBucketedConfig(
    config: ConfigBody,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj
): BucketedUserConfig {
    const variableMap = new Map<string, SDKVariable>()
    const featureKeyMap = new Map<string, SDKFeature>()
    const featureVariationMap = new Map<string, string>()
    const variableVariationMap = new Map<string, FeatureVariation>()

    for (let i = 0; i < config.features.length; i++) {
        const feature = config.features[i]
        const target = doesUserQualifyForFeature(
            config,
            feature,
            user,
            clientCustomData
        )

        if (!target) continue

        const variation = bucketUserForVariation(feature, target, user)

        featureKeyMap.set(feature.key, new SDKFeature(
            feature._id,
            feature.type,
            feature.key,
            variation._id,
            variation.name,
            variation.key,
            null
        ))
        featureVariationMap.set(feature._id, variation._id)

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

            variableVariationMap.set(
                variable.key,
                new FeatureVariation(feature._id, variation._id)
            )

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
        variableVariationMap,
        variableMap,
        generateKnownVariableKeys(config.variableHashes, variableMap)
    )
}

export function _generateBucketedVariableForUser(
    config: ConfigBody,
    user: DVCPopulatedUser,
    key: string,
    clientCustomData: JSON.Obj,
): SDKVariable | null {
    const variable = getConfigVariableForKey(config, key)
    if (!variable) {
        return null
    }
    const featureForVariable = _getFeatureForVarId(variable._id)
    if (!featureForVariable) {
        console.log('NO FEATURE FOR VARIABLE!')
        return null
    }

    const target = doesUserQualifyForFeature(
        config,
        featureForVariable,
        user,
        clientCustomData
    )

    if (target) {
        const variation = bucketUserForVariation(featureForVariable, target, user)
        const variable = getConfigVariableForKey(config, key)
        if (!variable) {
            return null
        }

        for (let i = 0; i < variation.variables.length; i++) {
            const variationVar = variation.variables[i]
            if (variationVar._var === variable._id) {
                return new SDKVariable(
                    variable._id,
                    variable.type,
                    variable.key,
                    variationVar.value,
                    null
                )
            }
        }

        throw new Error('Internal error processing configuration')
    } else {
        return null
    }
}
