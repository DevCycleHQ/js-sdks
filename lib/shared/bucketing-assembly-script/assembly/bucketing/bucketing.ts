import { JSON } from '@devcycle/assemblyscript-json/assembly'
import { first, last } from '../helpers/lodashHelpers'
import {
    ConfigBodyV2 as ConfigBody,
    TargetV2 as PublicTarget,
    FeatureV2 as PublicFeature,
    BucketedUserConfig,
    Rollout as PublicRollout,
    DVCPopulatedUser,
    SDKVariable,
    SDKFeature,
    RolloutStage,
    TargetV2 as Target,
    Variation,
    FeatureVariation,
    FeatureV2 as Feature,
    EVAL_REASONS,
    EVAL_REASON_DETAILS,
} from '../types'

import { murmurhashV3 } from '../helpers/murmurhash'
import { _evaluateOperator } from './segmentation'
import {
    getStringFromJSONOptional,
    getValueFromJSONOptional,
} from '../helpers/jsonHelpers'

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE: f64 = 4294967295
const baseSeed: i32 = 1
const DEFAULT_BUCKETING_VALUE = 'null'
const ENABLE_EVAL_REASONS = true

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
    public reasonDetails: string | null
}

class TargetResult { 
    public target: PublicTarget
    public reasonDetails: string
}

function evaluateSegmentationForFeature(
    config: ConfigBody,
    feature: Feature,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj,
): TargetResult | null {
    // Returns the first target for which the user passes segmentation
    for (let i = 0; i < feature.configuration.targets.length; i++) {
        const target = feature.configuration.targets[i]
        const passthroughRolloutEnabled = !config.project.settings.disablePassthroughRollouts
        let doesUserPassRollout = true
        if (target.rollout && passthroughRolloutEnabled) {
            const bucketingValue = _getUserValueForBucketingKey(user, target)
            const boundedHashData = _generateBoundedHashes(bucketingValue, target._id)
            const rolloutHash = boundedHashData.rolloutHash
            doesUserPassRollout = _doesUserPassRollout(target.rollout, rolloutHash)
        }

        if (doesUserPassRollout) {
            const evalResult = _evaluateOperator(
                target._audience.filters,
                config.audiences,
                user,
                clientCustomData,
            )
            if (evalResult.result) {
                return {
                    target,
                    reasonDetails: evalResult.reasonDetails || ""
                }
            }
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
    public reasonDetails: string
}

function doesUserQualifyForFeature(
    config: ConfigBody,
    feature: Feature,
    user: DVCPopulatedUser,
    clientCustomData: JSON.Obj,
): TargetAndHashes | null {
    const targetResult = evaluateSegmentationForFeature(
        config,
        feature,
        user,
        clientCustomData,
    )
    if (!targetResult) return null
    const target = targetResult.target
    const reasonDetails = targetResult.reasonDetails

    const bucketingValue = _getUserValueForBucketingKey( user, target )
    const boundedHashData = _generateBoundedHashes(bucketingValue, target._id)
    const rolloutHash = boundedHashData.rolloutHash
    const passthroughRolloutEnabled = !config.project.settings.disablePassthroughRollouts
    if (target.rollout && !passthroughRolloutEnabled && !_doesUserPassRollout(target.rollout, rolloutHash)) {
        return null
    }
    return {
        target,
        boundedHashData,
        reasonDetails
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

function _getEvalReasonDetails(
    targetAndHashes: TargetAndHashes, 
    hasMultipleDistributions: boolean,
    hasRollout: boolean
): string {
    let reasonDetails =  targetAndHashes.reasonDetails

    if (hasMultipleDistributions || hasRollout) {
        const evalReasonPrefix =
            hasMultipleDistributions && hasRollout
                ? `${EVAL_REASON_DETAILS.RANDOM_DISTRIBUTION} | ${EVAL_REASON_DETAILS.ROLLOUT}`
                : hasMultipleDistributions
                ? EVAL_REASON_DETAILS.RANDOM_DISTRIBUTION
                : EVAL_REASON_DETAILS.ROLLOUT
        reasonDetails = `${evalReasonPrefix} | ${reasonDetails}`
    }
    return reasonDetails
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

        const hasRollout = targetAndHashes!.target.rollout !== null
        const hasMultipleDistributions = targetAndHashes!.target.distribution.length !== 1
        const evalReason = featureOverride
                ? EVAL_REASONS.OVERRIDE 
                : hasMultipleDistributions || hasRollout 
                    ? EVAL_REASONS.SPLIT
                    : EVAL_REASONS.TARGETING_MATCH
        const evalDetails = _getEvalReasonDetails(targetAndHashes!, hasMultipleDistributions, hasRollout)

        featureKeyMap.set(
            feature.key,
            new SDKFeature(
                feature._id,
                feature.type,
                feature.key,
                variation._id,
                variation.name,
                variation.key,
                evalReason,
                evalDetails,
                targetAndHashes!.target._id
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
                feature._id,
                evalReason,
                evalDetails,
                targetAndHashes!.target._id
                // evalReason, 
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

    if (ENABLE_EVAL_REASONS){ 
        const hasRollout = targetAndHashes.target.rollout !== null
        const hasMultipleDistributions = targetAndHashes.target.distribution.length !== 1
        const evalReason = hasMultipleDistributions || hasRollout ? EVAL_REASONS.SPLIT: EVAL_REASONS.TARGETING_MATCH
        const evalDetails = _getEvalReasonDetails(targetAndHashes, hasMultipleDistributions, hasRollout)

        const sdkVar = new SDKVariable(
            variable._id,
            variable.type,
            variable.key,
            variationVar.value,
            featureForVariable._id,
            evalReason,
            evalDetails,
            targetAndHashes.target._id
        )
        return { variable: sdkVar, variation, feature: featureForVariable }
    } else {
        const sdkVar = new SDKVariable(
            variable._id,
            variable.type,
            variable.key,
            variationVar.value,
            featureForVariable._id,
            "",
            "",
            ""
        )
        return { variable: sdkVar, variation, feature: featureForVariable }
    }
}

export function _getUserValueForBucketingKey(
    user: DVCPopulatedUser,
    target: PublicTarget
): string {
    if (target.bucketingKey && target.bucketingKey !== 'user_id') {
        let bucketingValue: string = DEFAULT_BUCKETING_VALUE
        const customData = user.getCombinedCustomData()
        if (customData) {
            const customDataValue = getValueFromJSONOptional(customData, target.bucketingKey)
            bucketingValue = customDataValue
                ? customDataValue.toString()
                : DEFAULT_BUCKETING_VALUE
        }
        if (
            typeof bucketingValue !== 'string' &&
            typeof bucketingValue !== 'number' &&
            typeof bucketingValue !== 'boolean'
        ) {
            return DEFAULT_BUCKETING_VALUE
        } else {
            return bucketingValue.toString()
        }
    }
    return user.user_id
}
