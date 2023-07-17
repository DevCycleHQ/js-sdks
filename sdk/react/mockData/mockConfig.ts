export const mockConfig = {
    project: {
        _id: '34550f3abcc96f7cf4a49321',
        key: 'test-project',
        settings: {
            edgeDB: {
                enabled: false,
            },
        },
    },
    environment: {
        _id: '1234567d69160a4f77654321',
        key: 'development',
    },
    features: {
        'test-feature': {
            _id: '63f68914661225c485aa3a02',
            key: 'test-feature',
            type: 'release',
            _variation: '63f68914661225c485aa3a09',
            variationName: 'Variation On',
            variationKey: 'variation-on',
        },
    },
    featureVariationMap: {
        '63f68914661225c485aa3a02': '63f68914661225c485aa3a09',
    },
    variableVariationMap: {},
    variables: {
        'string-var': {
            _id: '63633c566cf0fcb7e2123456',
            key: 'string-var',
            type: 'String',
            value: 'Bonjour',
        },
    },
    sse: {
        url: 'https://realtime.ably.io/event-stream?channels=fake_channel',
        inactivityDelay: 120000,
    },
    etag: '"000000ca4b53334a777ed32053111111"',
}
