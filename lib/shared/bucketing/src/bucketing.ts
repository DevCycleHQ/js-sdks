'use strict'
import { orderBy, pick } from 'lodash'
import {
    ConfigBody, PublicTarget, PublicFeature, BucketedUserConfig, PublicRollout, DVCAPIUser
} from '@devcycle/shared/ts-types'

import murmurhash from 'murmurhash'
import { evaluateOperator } from './segmentation'

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE = 4294967295
const baseSeed = 1

export const generateBoundedHashes = (
    user_id: string, target_id: string
): { rolloutHash: number, bucketingHash: number} => {
    // The seed provided to murmurhash must be a number
    // So we first hash the target_id with a constant seed
    const targetHash = murmurhash.v3(target_id, baseSeed)
    return {
        rolloutHash: generateBoundedHash(user_id + '_rollout', targetHash),
        bucketingHash: generateBoundedHash(user_id, targetHash)
    }
}

export const generateBoundedHash = (input: string, hashSeed: number): number => {
    const hash = murmurhash.v3(input, hashSeed)
    return hash / MAX_HASH_VALUE
}

/**
 * Given the feature and a hash of the user_id, bucket the user according to the variation distribution percentages
 * @param feature
 * @param boundedHash
 * @returns variation_id
 */
export const decideTargetVariation = (
    { target, boundedHash }:
    { target: PublicTarget, boundedHash: number}
): string => {
    const variations = orderBy(target.distribution, '_variation', ['desc'])

    let distributionIndex = 0
    const previousDistributionIndex = 0
    for (const variation of variations) {
        distributionIndex += variation.percentage
        if (boundedHash >= previousDistributionIndex && boundedHash < distributionIndex) {
            return variation._variation
        }
    }
    throw new Error('Failed to decide target variation')
}

export const getCurrentRolloutPercentage = (rollout: PublicRollout): number => {
    // coerce to numbers to appease the TS gods
    const { startDate, targetDate } = rollout
    const startTime = startDate?.getTime()
    const targetTime = targetDate?.getTime()
    const now = Date.now()

    if (targetTime && !startTime) {
        throw new Error('Invalid rollout: targetTime provided with no startTime or targetPercentage')
    }

    // Rollout hasn't started yet
    if (startTime && now < startTime) {
        return -1
    }

    // This implies that there is no rollout, everyone gets it right away
    if (!rollout.targetPercentage) {
        return rollout.startPercentage
    }

    // Rollout is complete
    if (targetTime && now >= targetTime) {
        return rollout.targetPercentage
    // In case you want to permanent rollout to some percentage of the audience
    } else if (!targetTime || !startTime) {
        return rollout.startPercentage
    } else {
        const timeDiff = (now - startTime) / (targetTime - startTime)
        const rolloutDiff = (rollout.targetPercentage - rollout.startPercentage)
        return (timeDiff * rolloutDiff) + rollout.startPercentage
    }
}

export const doesUserPassRollout = (
    { rollout, boundedHash }:
    { rollout: PublicRollout, boundedHash: number }
): boolean => {
    const rolloutPercentage = getCurrentRolloutPercentage(rollout)
    return (boundedHash <= rolloutPercentage)
}

export const bucketForSegmentedFeature = ({ boundedHash, target }:
                                              { target: PublicTarget, boundedHash: number }): string => {
    return decideTargetVariation({ target, boundedHash })
}

type SegmentedFeatureData = {
    feature: PublicFeature<string>
    target: PublicTarget<string>
}

export const getSegmentedFeatureDataFromConfig = (
    { config, user }:
    { config: ConfigBody, user: DVCAPIUser }
): SegmentedFeatureData[] => {
    const initialValue: SegmentedFeatureData[] = []
    return config.features.reduce((accumulator, feature) => {
        // Returns the first target for which the user passes segmentation
        const segmentedFeatureTarget = feature.configuration.targets.find((target) => {
            return evaluateOperator({ operator: target._audience.filters, data: user })
        })
        if (segmentedFeatureTarget) {
            accumulator.push({
                feature,
                target: segmentedFeatureTarget
            })
        }
        return accumulator
    }, initialValue)
}

export const generateKnownVariableKeys = (
    { variableHashes, variableMap }:
    { variableHashes: ConfigBody['variableHashes'], variableMap: BucketedUserConfig['variables']}
): BucketedUserConfig['knownVariableKeys'] => {
    const knownVariableKeys: number[] = []
    for (const [key, hash] of Object.entries(variableHashes)) {
        if (!variableMap?.[key]) {
            knownVariableKeys.push(hash)
        }
    }
    return knownVariableKeys
}

export const generateBucketedConfig = (
    { config, user }:
    { config: ConfigBody, user: DVCAPIUser }
): BucketedUserConfig => {
    const variableMap: BucketedUserConfig['variables'] = {}
    const featureKeyMap: BucketedUserConfig['features'] = {}
    const featureVariationMap: BucketedUserConfig['featureVariationMap'] = {}
    const segmentedFeatures = getSegmentedFeatureDataFromConfig({ config, user })

    segmentedFeatures.forEach(({ feature, target }) => {
        const { _id, key, type, variations } = feature
        const { rolloutHash, bucketingHash } = generateBoundedHashes(user.user_id, target._id)
        if (!doesUserPassRollout({ boundedHash: rolloutHash, rollout: target.rollout })) {
            return
        }

        const variation_id = bucketForSegmentedFeature({ boundedHash: bucketingHash, target })
        featureKeyMap[key] = {
            _id,
            key,
            type,
            _variation: variation_id
        }
        featureVariationMap[_id] = variation_id
        const variation = variations.find((v) => v._id === variation_id)
        if (!variation) {
            throw new Error(`Config missing variation: ${variation_id}`)
        }
        variation.variables.forEach(({ _var, value }) => {
            const variable = config.variables.find((v) => v._id === _var)
            if (!variable) {
                throw new Error(`Config missing variable: ${_var}`)
            }
            variableMap[variable.key] = { ...variable, value }
        })
    })

    return {
        project: pick(config.project, ['_id', 'key']),
        environment: pick(config.environment, ['_id', 'key']),
        features: featureKeyMap,
        featureVariationMap,
        knownVariableKeys: generateKnownVariableKeys({
            variableHashes: config.variableHashes,
            variableMap
        }),
        variables: variableMap
    }
}
