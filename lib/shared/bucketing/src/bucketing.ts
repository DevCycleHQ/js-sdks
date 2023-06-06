'use strict'
import orderBy from 'lodash/orderBy'
import pick from 'lodash/pick'
import last from 'lodash/last'
import first from 'lodash/first'
import {
  ConfigBody,
  PublicTarget,
  PublicFeature,
  BucketedUserConfig,
  PublicRollout,
  PublicRolloutStage,
  DVCBucketingUser,
} from '@devcycle/types'

import murmurhash from 'murmurhash'
import { evaluateOperator } from './segmentation'

// Max value of an unsigned 32-bit integer, which is what murmurhash returns
const MAX_HASH_VALUE = 4294967295
const baseSeed = 1

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
}: {
  target: PublicTarget
  boundedHash: number
}): string => {
  const variations = orderBy(target.distribution, '_variation', ['desc'])

  let distributionIndex = 0
  const previousDistributionIndex = 0
  for (const variation of variations) {
    distributionIndex += variation.percentage
    if (
      boundedHash >= previousDistributionIndex &&
      boundedHash < distributionIndex
    ) {
      return variation._variation
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
}: {
  target: PublicTarget
  boundedHash: number
}): string => {
  return decideTargetVariation({ target, boundedHash })
}

type SegmentedFeatureData = {
  feature: PublicFeature<string>
  target: PublicTarget<string>
}

export const getSegmentedFeatureDataFromConfig = ({
  config,
  user,
}: {
  config: ConfigBody
  user: DVCBucketingUser
}): SegmentedFeatureData[] => {
  const initialValue: SegmentedFeatureData[] = []
  return config.features.reduce((accumulator, feature) => {
    // Returns the first target for which the user passes segmentation
    const isOptInEnabled =
      feature.settings?.['optInEnabled'] &&
      config.project.settings?.['optIn']?.['enabled']

    const segmentedFeatureTarget = feature.configuration.targets.find(
      (target) => {
        return evaluateOperator({
          operator: target._audience.filters,
          data: user,
          featureId: feature._id,
          isOptInEnabled: !!isOptInEnabled,
          audiences: config.audiences,
        })
      },
    )
    if (segmentedFeatureTarget) {
      accumulator.push({
        feature,
        target: segmentedFeatureTarget,
      })
    }
    return accumulator
  }, initialValue)
}

export const generateBucketedConfig = ({
  config,
  user,
}: {
  config: ConfigBody
  user: DVCBucketingUser
}): BucketedUserConfig => {
  const variableMap: BucketedUserConfig['variables'] = {}
  const featureKeyMap: BucketedUserConfig['features'] = {}
  const featureVariationMap: BucketedUserConfig['featureVariationMap'] = {}
  const segmentedFeatures = getSegmentedFeatureDataFromConfig({ config, user })

  segmentedFeatures.forEach(({ feature, target }) => {
    const { _id, key, type, variations, settings } = feature
    const { rolloutHash, bucketingHash } = generateBoundedHashes(
      user.user_id,
      target._id,
    )
    if (
      target.rollout &&
      !doesUserPassRollout({
        boundedHash: rolloutHash,
        rollout: target.rollout,
      })
    ) {
      return
    }

    const variation_id = bucketForSegmentedFeature({
      boundedHash: bucketingHash,
      target,
    })
    const variation = variations.find((v) => v._id === variation_id)
    if (!variation) {
      throw new Error(`Config missing variation: ${variation_id}`)
    }

    featureKeyMap[key] = {
      _id,
      key,
      type,
      _variation: variation_id,
      variationName: variation.name,
      variationKey: variation.key,
      settings,
    }
    featureVariationMap[_id] = variation_id
    variation.variables.forEach(({ _var, value }) => {
      const variable = config.variables.find((v) => v._id === _var)
      if (!variable) {
        throw new Error(`Config missing variable: ${_var}`)
      }
      variableMap[variable.key] = {
        ...variable,
        value,
      }
    })
  })

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
