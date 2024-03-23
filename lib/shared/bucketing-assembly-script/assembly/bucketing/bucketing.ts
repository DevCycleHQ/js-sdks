import { JSON } from '@devcycle/assemblyscript-json/assembly'
import { first, last } from '../helpers/lodashHelpers'
import {
    ConfigBody,
    Target as PublicTarget,
    Feature as PublicFeature,
    BucketedUserConfig,
    Rollout as PublicRollout,
    DVCPopulatedUser,
    SDKVariable,
    SDKFeature,
    RolloutStage,
    Target,
    Variation,
    FeatureVariation,
    Feature,
} from '../types'

import { murmurhashV3 } from '../helpers/murmurhash'
import { _evaluateOperator } from './segmentation'
import {
    getStringFromJSON,
    getStringFromJSONOptional,
} from '../helpers/jsonHelpers'

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE: f64 = 4294967295
const baseSeed: i32 = 1

export class BoundedHash {
    public rolloutHash: f64
    public bucketingHash: f64
}

export function _generateBoundedHashes(
    user_id: string,
    target_id: string,
): BoundedHash {
    // The seed provided to murmurhash must be a number
    // So we first hash the target_id with a constant seed

    const targetHash = murmurhashV3(target_id, baseSeed)
    return {
        rolloutHash: generateBoundedHash(user_id + '_rollout', targetHash),
        bucketingHash: generateBoundedHash(user_id, targetHash),
    }
}

export function generateBoundedHash(input: string, hashSeed: i32): f64 {
    const hash = murmurhashV3(input, hashSeed) as f64
    return hash / MAX_HASH_VALUE
}

export function getCurrentRolloutPercentage(
    rollout: PublicRollout,
    currentDate: Date,
): f64 {
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
    if (!_currentStage && startDateTime < currentDateTime) {
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

    const currentDatePercentage: f64 =
        ((currentDateTime - currentStage.date.getTime()) as f64) /
        ((nextStage.date.getTime() - currentStage.date.getTime()) as f64)

    if (currentDatePercentage === 0) {
        return 0
    }

    return (
        (currentStage.percentage +
            (nextStage.percentage - currentStage.percentage)) *
        f64(currentDatePercentage)
    )
}

export function _doesUserPassRollout(
    rollout: PublicRollout | null,
    boundedHash: f64,
): bool {
    if (!rollout) return true

    const rolloutPercentage = getCurrentRolloutPercentage(
        rollout,
        new Date(Date.now()),
    )
    return !!rolloutPercentage && boundedHash <= rolloutPercentage
}

class SegmentedFeatureData {
    public feature: PublicFeature
    public target: PublicTarget
}

function evaluateSegmentationForFeature(
    config: ConfigBody,
    feature: Feature,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj,
): Target | null {
    // Returns the first target for which the user passes segmentation
    for (let i = 0; i < feature.configuration.targets.length; i++) {
        const target = feature.configuration.targets[i]
        const boundedHashData = _generateBoundedHashes(user.user_id, target._id)
        const rolloutHash = boundedHashData.rolloutHash
        let doesUserPassRollout: bool = true
        if (target.rollout) {
            doesUserPassRollout = _doesUserPassRollout(target.rollout, rolloutHash)
        }
        if (
            _evaluateOperator(
                target._audience.filters,
                config.audiences,
                user,
                clientCustomData,
            ) && doesUserPassRollout
        ) {
            return target
        }
    }
    return null
}

export function getSegmentedFeatureDataFromConfig(
    config: ConfigBody,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj,
): SegmentedFeatureData[] {
    const accumulator: SegmentedFeatureData[] = []

    for (let y = 0; y < config.features.length; y++) {
        const feature = config.features[y]

        // Returns the first target for which the user passes segmentation
        const segmentedFeatureTarget: Target | null =
            evaluateSegmentationForFeature(
                config,
                feature,
                user,
                clientCustomData,
            )

        if (segmentedFeatureTarget) {
            const featureData: SegmentedFeatureData = {
                feature,
                target: segmentedFeatureTarget,
            }
            accumulator.push(featureData)
        }
    }
    return accumulator
}

class TargetAndHashes {
    public target: Target
    public boundedHashData: BoundedHash
}

function doesUserQualifyForFeature(
    config: ConfigBody,
    feature: Feature,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj,
): TargetAndHashes | null {
    const target = evaluateSegmentationForFeature(
        config,
        feature,
        user,
        clientCustomData,
    )
    if (!target) return null

    const boundedHashData = _generateBoundedHashes(user.user_id, target._id)
    return {
        target,
        boundedHashData,
    }
}

export function bucketUserForVariation(
    feature: Feature,
    targetAndHashes: TargetAndHashes,
): Variation {
    const variation_id = targetAndHashes.target.decideTargetVariation(
        targetAndHashes.boundedHashData.bucketingHash,
    )
    const variation = feature.getVariationById(variation_id)
    if (variation) {
        return variation
    } else {
        throw new Error(`Config missing variation: ${variation_id}`)
    }
}

class BucketedFeature {
    feature: Feature
    variation: Variation
}

export function _generateBucketedConfig(
    config: ConfigBody,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj,
    overrides: JSON.Obj | null,
): BucketedUserConfig {
    const variableMap = new Map<string, SDKVariable>()
    const featureKeyMap = new Map<string, SDKFeature>()
    const featureVariationMap = new Map<string, string>()
    const variableVariationMap = new Map<string, FeatureVariation>()

    for (let i = 0; i < config.features.length; i++) {
        const feature = config.features[i]
        const targetAndHashes = doesUserQualifyForFeature(
            config,
            feature,
            user,
            clientCustomData,
        )

        const featureOverride = overrides
            ? getStringFromJSONOptional(overrides, feature._id)
            : null

        if (!targetAndHashes && !featureOverride) {
            continue
        }

        const bucketedVariation = targetAndHashes
            ? bucketUserForVariation(feature, targetAndHashes)
            : null

        const overrideVariation = featureOverride
            ? feature.getVariationById(featureOverride)
            : null

        const variation = overrideVariation || bucketedVariation

        if (!variation) {
            continue
        }

        featureKeyMap.set(
            feature.key,
            new SDKFeature(
                feature._id,
                feature.type,
                feature.key,
                variation._id,
                variation.name,
                variation.key,
                null,
            ),
        )
        featureVariationMap.set(feature._id, variation._id)

        for (let y = 0; y < variation.variables.length; y++) {
            const variationVar = variation.variables[y]

            // Find variable
            const variable = config.getVariableForId(variationVar._var)
            if (!variable) {
                throw new Error(`Config missing variable: ${variationVar._var}`)
            }

            variableVariationMap.set(
                variable.key,
                new FeatureVariation(feature._id, variation._id),
            )

            const newVar = new SDKVariable(
                variable._id,
                variable.type,
                variable.key,
                variationVar.value,
                null,
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
    )
}

class BucketedVariableResponse {
    public variable: SDKVariable

    public variation: Variation

    public feature: Feature
}

export function _generateBucketedVariableForUser(
    config: ConfigBody,
    user: DVCPopulatedUser,
    key: string,
    clientCustomData: JSON.Obj,
): BucketedVariableResponse | null {
    const variable = config.getVariableForKey(key)
    if (!variable) {
        return null
    }
    const featureForVariable = config.getFeatureForVariableId(variable._id)
    if (!featureForVariable) return null

    const targetAndHashes = doesUserQualifyForFeature(
        config,
        featureForVariable,
        user,
        clientCustomData,
    )
    if (!targetAndHashes) return null

    const variation = bucketUserForVariation(
        featureForVariable,
        targetAndHashes,
    )
    const variationVar = variation.getVariableById(variable._id)
    if (!variationVar) {
        throw new Error('Internal error processing configuration')
    }

    const sdkVar = new SDKVariable(
        variable._id,
        variable.type,
        variable.key,
        variationVar.value,
        null,
    )
    return { variable: sdkVar, variation, feature: featureForVariable }
}
