import { config } from '@devcycle/bucketing-test-data/json-data/testData.json'

export function configWithBucketingKey(bucketingKey: string): unknown {
    return {
        ...config,
        features: config.features.map((feature) => ({
            ...feature,
            configuration: {
                ...feature.configuration,
                targets: feature.configuration.targets.map((target) => ({
                    ...target,
                    bucketingKey,
                })),
            },
        })),
    }
}
