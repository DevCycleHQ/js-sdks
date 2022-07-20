import { JSON } from 'assemblyscript-json/assembly'
import { first, last } from '../helpers/lodashHelpers'
import {
    ConfigBody, Target as PublicTarget, Feature as PublicFeature, BucketedUserConfig,
    Rollout as PublicRollout, DVCPopulatedUser, SDKVariable, SDKFeature, RolloutStage,
    Target, Variation, Variable, TargetDistribution
} from '../types'

import { murmurhashV3 } from '../helpers/murmurhash'
import { SortingArray, sortObjectsByString } from '../helpers/arrayHelpers'
import { _evaluateOperator } from './segmentation'

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

export function getSegmentedFeatureDataFromConfig(
    config: ConfigBody,
    user: DVCPopulatedUser
): SegmentedFeatureData[] {
    const accumulator: SegmentedFeatureData[] = []

    const projectSettings = config.project.settings as JSON.Obj

    const projectOptIn = projectSettings.getObj('optIn')
    const projectOptInEnabled = projectOptIn ? projectOptIn.getBool('enabled') : null

    for (let y = 0; y < config.features.length; y++) {
        const feature = config.features[y]

        const featureOptInEnabled = feature.settings !== null ? feature.settings.getBool('optInEnabled') : null

        const isOptInEnabled = 
            projectOptInEnabled !== null
            && projectOptInEnabled.valueOf()
            && featureOptInEnabled !== null
            && featureOptInEnabled.valueOf()

        // Returns the first target for which the user passes segmentation
        let segmentedFeatureTarget: Target | null = null
        for (let i = 0; i < feature.configuration.targets.length; i++) {
            const target = feature.configuration.targets[i]
            if (_evaluateOperator(target._audience.filters, user, feature._id, !!isOptInEnabled)) {
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
        if (!variableMap.has(key)) {
            knownVariableKeys.push(hash)
        }
    }
    return knownVariableKeys
}

export function _generateBucketedConfig(
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

        const boundedHashData = _generateBoundedHashes(user.user_id, target._id)
        const rolloutHash = boundedHashData.rolloutHash
        const bucketingHash = boundedHashData.bucketingHash
        if (target.rollout && !_doesUserPassRollout(target.rollout, rolloutHash)) {
            continue
        }

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
        featureKeyMap.set(feature.key, new SDKFeature(
            feature._id,
            feature.type,
            feature.key,
            variation_id,
            variation.name,
            variation.key,
            null
        ))
        featureVariationMap.set(feature._id, variation_id)

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
