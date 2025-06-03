'use strict'
import orderBy from 'lodash/orderBy'
import pick from 'lodash/pick'
import last from 'lodash/last'
import first from 'lodash/first'
import {
    BucketedUserConfig,
    ConfigBody,
    DVCBucketingUser,
    Feature,
    PublicFeature,
    PublicRollout,
    PublicRolloutStage,
    PublicTarget,
    Variation,
    EVAL_REASONS,
    EvalReason,
    EVAL_REASON_DETAILS,
} from '@devcycle/types'

import murmurhash from 'murmurhash'
import { evaluateOperator } from './segmentation'

type VariationReasonResult = {
    variation: string
    evalReason?: EvalReason
}

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE = 4294967295
const baseSeed = 1
export const DEFAULT_BUCKETING_VALUE = 'null'

export const generateBoundedHashes = (
    user_id: string,
    target_id: string,
): { rolloutHash: number; bucketingHash: number } => {
    // The seed provided to murmurhash must be a number
    // So we first hash the target_id with a constant seed
    const targetHash = murmurhash.v3(target_id, baseSeed)
    return {
        rolloutHash: generateBoundedHash(user_id + '_rollout', targetHash),
        bucketingHash: generateBoundedHash(user_id, targetHash),
    }
}

export const generateBoundedHash = (
    input: string,
    hashSeed: number,
): number => {
    const hash = murmurhash.v3(input, hashSeed)
    return hash / MAX_HASH_VALUE
}

/**
 * Given the feature and a hash of the user_id, bucket the user according to the variation distribution percentages
 * @param feature
 * @param boundedHash
 * @returns variation_id
 */
export const decideTargetVariation = ({
    target,
    boundedHash,
    reasonDetails,
}: {
    target: PublicTarget
    boundedHash: number
    reasonDetails?: string
}): VariationReasonResult => {
    const variations = orderBy(target.distribution, '_variation', ['desc'])
    const isRollout = target.rollout !== undefined
    const isRandomDistribution = target.distribution.length !== 1

    let distributionIndex = 0
    const previousDistributionIndex = 0
    for (const variation of variations) {
        distributionIndex += variation.percentage
        if (
            boundedHash >= previousDistributionIndex &&
            boundedHash < distributionIndex
        ) {
            return {
                variation: variation._variation,
                evalReason:
                    isRollout || isRandomDistribution
                        ? {
                              reason: EVAL_REASONS.SPLIT,
                              details: reasonDetails ?? undefined,
                          }
                        : {
                              reason: EVAL_REASONS.TARGETING_MATCH,
                              details: reasonDetails ?? undefined,
                          },
            }
        }
    }
    throw new Error('Failed to decide target variation')
}

export const getCurrentRolloutPercentage = (
    rollout: PublicRollout,
    currentDate: Date,
): number => {
    const start = rollout.startPercentage
    const startDate = rollout.startDate

    if (rollout.type === 'schedule') {
        return currentDate >= startDate ? 1 : 0
    }

    if (!(typeof start === 'number')) {
        throw new Error('Invalid rollout configuration')
    }

    const _currentStage = last(
        rollout.stages?.filter((stage) => stage.date <= currentDate),
    )
    const nextStage = first(
        rollout.stages?.filter((stage) => stage.date > currentDate),
    )

    const currentStage: Omit<PublicRolloutStage, 'type'> | null =
        _currentStage ||
        (startDate < currentDate
            ? {
                  percentage: start,
                  date: startDate,
              }
            : null)

    if (!currentStage) {
        return 0
    }

    if (!nextStage || nextStage.type === 'discrete') {
        return currentStage.percentage
    }

    const currentDatePercentage =
        (currentDate.getTime() - currentStage.date.getTime()) /
        (nextStage.date.getTime() - currentStage.date.getTime())

    if (currentDatePercentage === 0) {
        return 0
    }

    return (
        currentStage.percentage +
        (nextStage.percentage - currentStage.percentage) * currentDatePercentage
    )
}

export const doesUserPassRollout = ({
    rollout,
    boundedHash,
}: {
    rollout?: PublicRollout
    boundedHash: number
}): boolean => {
    if (!rollout) {
        return true
    }
    const rolloutPercentage = getCurrentRolloutPercentage(rollout, new Date())
    return !!rolloutPercentage && boundedHash <= rolloutPercentage
}

export const bucketForSegmentedFeature = ({
    boundedHash,
    target,
    reasonDetails,
}: {
    target: PublicTarget
    boundedHash: number
    reasonDetails?: string
}): VariationReasonResult => {
    return decideTargetVariation({ target, boundedHash, reasonDetails })
}

type SegmentedFeatureData = {
    feature: PublicFeature<string>
    target: PublicTarget<string>
    reasonDetails?: string
}

const checkRolloutAndEvaluate = ({
    user,
    target,
    disablePassthroughRollouts,
}: {
    user: DVCBucketingUser
    target: PublicTarget
    disablePassthroughRollouts: boolean
}) => {
    if (!target.rollout || disablePassthroughRollouts) {
        return true
    } else {
        const bucketingValue = getUserValueForBucketingKey({ user, target })
        const { rolloutHash } = generateBoundedHashes(
            bucketingValue,
            target._id,
        )
        return doesUserPassRollout({
            boundedHash: rolloutHash,
            rollout: target.rollout,
        })
    }
}

export const getSegmentedFeatureDataFromConfig = ({
    config,
    user,
}: {
    config: ConfigBody
    user: DVCBucketingUser
}): SegmentedFeatureData[] => {
    const initialValue: SegmentedFeatureData[] = []
    const disablePassthroughRollouts =
        !!config.project.settings.disablePassthroughRollouts
    return config.features.reduce((accumulator, feature) => {
        // Returns the first target for which the user passes segmentation
        const isOptInEnabled =
            feature.settings?.['optInEnabled'] &&
            config.project.settings?.['optIn']?.['enabled']

        let featureReasonDetails = ''
        const segmentedFeatureTarget = feature.configuration.targets.find(
            (target) => {
                const { result, reasonDetails } = evaluateOperator({
                    operator: target._audience.filters,
                    data: user,
                    featureId: feature._id,
                    isOptInEnabled: !!isOptInEnabled,
                    audiences: config.audiences,
                })
                if (result && reasonDetails) {
                    featureReasonDetails = reasonDetails
                }
                return (
                    checkRolloutAndEvaluate({
                        target,
                        user,
                        disablePassthroughRollouts,
                    }) && result
                )
            },
        )
        if (segmentedFeatureTarget) {
            accumulator.push({
                feature,
                target: segmentedFeatureTarget,
                reasonDetails: featureReasonDetails,
            })
        }
        return accumulator
    }, initialValue)
}

export const generateBucketedConfig = ({
    config,
    user,
    overrides,
}: {
    config: ConfigBody
    user: DVCBucketingUser
    overrides?: Record<string, string>
}): BucketedUserConfig => {
    const variableMap: BucketedUserConfig['variables'] = {}
    const featureKeyMap: BucketedUserConfig['features'] = {}
    const featureVariationMap: BucketedUserConfig['featureVariationMap'] = {}
    const segmentedFeatures = getSegmentedFeatureDataFromConfig({
        config,
        user,
    })
    const disablePassthroughRollouts =
        config.project.settings.disablePassthroughRollouts
    const updateMapsWithBucketedFeature = ({
        feature,
        variation,
        evalReason,
    }: {
        feature: Feature
        variation: Variation
        evalReason?: EvalReason
    }) => {
        const { _id, key, type, settings } = feature

        featureKeyMap[key] = {
            _id,
            key,
            type,
            _variation: variation._id,
            variationName: variation.name,
            variationKey: variation.key,
            settings,
            evalReason,
        }
        featureVariationMap[_id] = variation._id
        variation.variables.forEach(({ _var, value }) => {
            const variable = config.variables.find((v) => v._id === _var)
            if (!variable) {
                throw new Error(`Config missing variable: ${_var}`)
            }
            variableMap[variable.key] = {
                ...variable,
                _feature: _id,
                value,
                evalReason,
            }
        })
    }

    segmentedFeatures.forEach(({ feature, target, reasonDetails }) => {
        const { variations } = feature
        const bucketingValue = getUserValueForBucketingKey({ user, target })
        const { rolloutHash, bucketingHash } = generateBoundedHashes(
            bucketingValue,
            target._id,
        )
        if (
            target.rollout &&
            disablePassthroughRollouts &&
            !doesUserPassRollout({
                boundedHash: rolloutHash,
                rollout: target.rollout,
            })
        ) {
            return
        }

        const { variation: variation_id, evalReason } =
            bucketForSegmentedFeature({
                boundedHash: bucketingHash,
                target,
                reasonDetails,
            })
        const variation = variations.find((v) => v._id === variation_id)
        if (!variation) {
            throw new Error(`Config missing variation: ${variation_id}`)
        }

        updateMapsWithBucketedFeature({ feature, variation, evalReason })
    })

    for (const [_feature, _variation] of Object.entries(overrides || {})) {
        const feature = config.features.find((f) => f._id === _feature)
        if (!feature) {
            // ignore overrides that don't work with current config
            continue
        }
        const variation = feature.variations.find((v) => v._id === _variation)
        if (!variation) {
            continue
        }

        updateMapsWithBucketedFeature({
            feature,
            variation,
            evalReason: {
                reason: EVAL_REASONS.OVERRIDE,
                details: EVAL_REASON_DETAILS.OVERRIDE,
            },
        })
    }

    return {
        project: pick(config.project, [
            '_id',
            'key',
            'a0_organization',
            'settings',
        ]),
        environment: pick(config.environment, ['_id', 'key']),
        features: featureKeyMap,
        featureVariationMap,
        // Return empty object for now, until we switch to WASM bucketing logic
        variableVariationMap: {},
        variables: variableMap,
    }
}

export const getUserValueForBucketingKey = ({
    user,
    target,
}: {
    user: DVCBucketingUser
    target: PublicTarget
}): string => {
    if (target.bucketingKey && target.bucketingKey !== 'user_id') {
        const bucketingValue =
            user.customData?.[target.bucketingKey] ||
            user.privateCustomData?.[target.bucketingKey] ||
            DEFAULT_BUCKETING_VALUE
        if (
            typeof bucketingValue !== 'string' &&
            typeof bucketingValue !== 'number' &&
            typeof bucketingValue !== 'boolean'
        ) {
            return DEFAULT_BUCKETING_VALUE
        } else {
            return String(bucketingValue)
        }
    }
    return user.user_id
}
