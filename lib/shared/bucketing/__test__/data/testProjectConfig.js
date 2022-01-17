/* istanbul ignore file */
/* eslint-disable */
const moment = require('moment')

module.exports = {
    'projectData': {
        '_id': 'ObjectId',
        'name': 'String',
        'deviceToken': 'String',
        'credentials': { },
        'settings': {
            'showDraftExperiments': true,
            'showLaunchImage': true,
            'launchImageTime': 2.0,
            'enabledForReleaseModes': {},
            'setFromUserDevice': true,
            'cancelLiveUpdateBuilds': [],
            'killForBuilds': [],
            'isFuzzyMatchingEnabled': true,
            'disable': [],
            'pushAnalyticsSources': {}
        }
    },
    'experiments': [
        {
            'status': 'active',
            '_id': 'experiment_1',
            'name': 'exp1',
            'rollout': {
                'start': 100,
                'startDate': moment(),
                'target': 100,
                'targetDate': moment(),
                'startIndex': 300
            },
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['Android']
                }
            ],
            'distributionStartIndex': 0.3,
            'variations': [
                {
                    '_id': 'var1',
                    'name': 'Variation 1',
                    'distributionPercent': 0.25,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'var2',
                    'name': 'Variation 2',
                    'distributionPercent': 0.70,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'baseline',
                    'name': 'Baseline',
                    'distributionPercent': 0.05,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '3'
                    }]
                }
            ],
            'winningVariation_id': null,
            'goalViewElements': [],
            'dateStarted': moment()+10,
        },
        {
            'status': 'active',
            '_id': 'experiment_2',
            'name': 'exp2',
            'rollout': {
                'start': 100,
                'startDate': 'Date',
                'target': 100,
                'targetDate': 'Date',
                'startIndex': 1000
            },
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['iPhone OS']
                }
            ],
            'distributionStartIndex': 0.4,
            'variations': [
                {
                    '_id': 'var1',
                    'name': 'Variation 1',
                    'distributionPercent': 0.25,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    "webElements": [{
                        "_element": "5e29c2127437a10076bbb400",
                        "_modification": "5e29c2127437a10076bbb401",
                        "_id": "5e3300cbef8dc701f23d7fe2"
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '1'
                    }]
                },
                {
                    '_id': 'var2',
                    'name': 'Variation 2',
                    'distributionPercent': 0.70,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    "webElements": [{
                        "_element": "5e29c2127437a10076bbb400",
                        "_modification": "5e2728cf5a84a200b184a389",
                        "_id": "5e3300cbef8dc701f23d7fe2"
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'baseline',
                    'name': 'Baseline',
                    'distributionPercent': 0.05,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '3'
                    }]
                }
            ],
            'winningVariation_id': null,
            'goalViewElements': [],
            'dateStarted': moment(),
            '_urlTargetingRules': [
                '5e55eab76da85ada77eb254a',
               '5e5696671acffe0c88000a83'
            ]
        },
        {
            'status': 'active',
            '_id': 'experiment_3',
            'name': 'exp3',
            'rollout': {
                'start': 100,
                'startDate': 'Date',
                'target': 100,
                'targetDate': 'Date',
                'startIndex': 1000
            },
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['iPhone OS']
                }
            ],
            'distributionStartIndex': 0.4,
            'variations': [
                {
                    '_id': 'var1',
                    'name': 'Variation 1',
                    'distributionPercent': 0.25,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    "webElements": [],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '1'
                    }]
                },
                {
                    '_id': 'var2',
                    'name': 'Variation 2',
                    'distributionPercent': 0.70,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    "webElements": [],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'baseline',
                    'name': 'Baseline',
                    'distributionPercent': 0.05,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '3'
                    }]
                }
            ],
            'winningVariation_id': null,
            'goalViewElements': [],
            'dateStarted': moment(),
            '_urlTargetingRules': [
                '5e55eab76da85ada77eb254a',
               '5e5696671acffe0c88000a83'
            ]
        },
        {
            'status': 'active',
            '_id': 'experiment_4',
            'name': 'exp4',
            'rollout': {
                'start': 100,
                'startDate': moment(),
                'target': 100,
                'targetDate': moment(),
                'startIndex': 300
            },
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['iPhone OS']
                }
            ],
            'distributionStartIndex': 0.3,
            'variations': [
                {
                    '_id': 'var1',
                    'name': 'Variation 1',
                    'distributionPercent': 0.25,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    "webElements": [{
                        "_element": "5e29c2127437a10076bbb400",
                        "_modification": "5e569e73672f33000d24a270",
                        "_id": "5e3300cbef8dc701f23d7fe3"
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'var2',
                    'name': 'Variation 2',
                    'distributionPercent': 0.70,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'baseline',
                    'name': 'Baseline',
                    'distributionPercent': 0.05,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '3'
                    }]
                }
            ],
            'winningVariation_id': null,
            'goalViewElements': [],
            'dateStarted': moment()+10,
        }, {
            'status': 'active',
            '_id': 'browser_experiment',
            'name': 'browser_exp',
            'rollout': {
                'start': 100,
                'startDate': moment(),
                'target': 100,
                'targetDate': moment(),
                'startIndex': 300
            },
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'browser',
                    'values': ['Chrome']
                }, {
                    'comparator': '=',
                    'type': 'browserDeviceType',
                    'values': ['Desktop']

                }, {
                    "comparator": "=",
                    "type": "osType",
                    "values": ['web']
                }
            ],
            'distributionStartIndex': 0.3,
            'variations': [
                {
                    '_id': 'var1',
                    'name': 'Variation 1',
                    'distributionPercent': 0.25,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    "webElements": [{
                        "_element": "5e29c2127437a10076bbb400",
                        "_modification": "5e569e73672f33000d24a270",
                        "_id": "5e3300cbef8dc701f23d7fe3"
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'var2',
                    'name': 'Variation 2',
                    'distributionPercent': 0.70,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '2'
                    }]
                },
                {
                    '_id': 'baseline',
                    'name': 'Baseline',
                    'distributionPercent': 0.05,
                    'config': {},
                    'elements': [{
                        '_originalElement': 'element_id',
                        '_modifiedElement': 'modified_id',
                    }],
                    'dynamicVariables': [{
                        '_var': 'variable_id',
                        'name': 'String',
                        'isActive': true,
                        'defaultValue': '',
                        'variableType': 'String',
                        'value': '3'
                    }]
                }
            ],
            'winningVariation_id': null,
            'goalViewElements': [],
            'dateStarted': moment()+10,
        }
    ],
    'featureFlags': [
        {
            'name': 'Example Feature Flag',
            'keyName': 'exampleFeatureFlag',
            '_id': 'featureFlag_1',
            'status': 'active',
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['iPhone OS']
                }
            ],
            'rollout': {
                'start': 100,
                'target': 100,
                'startIndex': 7877,
                'randKey': 'rand3',
                'startDate': '2018-07-11T17:21:53.074Z'
            },
            'distributionStartIndex': 0.3,
            'dateStarted': '2018-07-11T17:22:06.712Z',
            'enabled': true
        },
        {
            'name': 'Example Feature Flag 2',
            'keyName': 'secondFeatureFlag',
            '_id': 'featureFlag_2',
            'status': 'active',
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['Android']
                }
            ],
            'rollout': {
                'start': 100,
                'target': 100,
                'startIndex': 3463,
                'randKey': 'rand3',
                'startDate': '2018-07-11T17:21:53.074Z'
            },
            'distributionStartIndex': 0.3,
            'dateStarted': '2018-07-11T17:22:06.712Z',
            'enabled': true
        },
        {
            'name': 'Chrome feature flag',
            'keyName': 'chromeFeatureFlag',
            '_id': 'chrome_featureFlag',
            'status': 'active',
            'distFilters': [
                {
                    'comparator': '=',
                    'type': 'browser',
                    'values': ['Chrome']
                }, {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['web']
                }
            ],
            'rollout': {
                'start': 100,
                'target': 100,
                'startIndex': 3463,
                'randKey': 'rand3',
                'startDate': '2018-07-11T17:21:53.074Z'
            },
            'distributionStartIndex': 0.3,
            'dateStarted': '2020-07-11T17:22:06.712Z',
            'enabled': true
        }
    ],
    'dynamicVars': [
        {
            '_id': 'variable_id',
            'name': 'String',
            'createdFrom': 'String',
            'defaultValue': '',
            'variableType': 'String',
            'value': ''
        },
        {
            '_id': 'blah',
            'name': 'String',
            'createdFrom': 'String',
            'defaultValue': '',
            'variableType': 'String',
            'value': ''
        }
    ],
    'pushCampaigns': [
        {
            '_id': 'campaign_1',
            'name': 'String',
            'production': true,
            'status': 'String',
            'filters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['iPhone OS']
                }
            ]
        },
        {
            '_id': 'campaign_2',
            'name': 'String',
            'production': true,
            'status': 'String',
            'filters': [
                {
                    'comparator': '=',
                    'type': 'osType',
                    'values': ['Android']
                }
            ],
            '_regions': ['region_id']
        }
    ],
    'regions': [
        {
            '_id': 'region_id',
            'name': 'String',
            'address': 'String',
            'latitude': 37.7870747,
            'longitude': -122.38852629999997,
            'radius': 100,
            'geofenceAutoremove': false
        },
        {
            '_id': 'blah',
            'name': 'String',
            'address': 'String',
            'latitude': 37.7870747,
            'longitude': -122.38852629999997,
            'radius': 100,
            'geofenceAutoremove': false
        }
    ],
    'views': [
        {
            '_id': 'ObjectId',
            'name': 'String',
            'key': 'String',
            'android': false
        }
    ],
    'viewElements': [
        {
            '_id': 'element_id',
            'key': 'element_id',
            'lpClass': 'String',
            'initProperties': {},
            'cellElement': false,
            'properties': {},
            '_images': ['image_id']
        },
        {
            '_id': 'modified_id',
            'key': 'modified_id',
            'lpClass': 'String',
            'initProperties': {},
            'cellElement': false,
            'properties': {}
        },
        {
            '_id': 'blah',
            'key': 'blah',
            'lpClass': 'String',
            'initProperties': {},
            'cellElement': false,
            'properties': {}
        },

    ],
    'images': [
        {
            '_id': 'image_id',
            'path': 'String',
            'fileName': 'String',
            'deviceTags': [],
            'advanced': {},
            'properties': {}
        },
        {
            '_id': 'blah',
            'path': 'String',
            'fileName': 'String',
            'deviceTags': [],
            'advanced': {},
            'properties': {}
        }
    ],
    'goals': [
        {
            '_id': '610422af1293560026af035e',
            'deleted': false,
            'maxMin': true,
            'version': 1,
            '_experiment': 'experiment_3',
            'displayName': 'new click goal',
            'name': 'new click goal',
            'type': 'codeEvent',
            'config': {
                'convUniq': true,
                'webElementSelector': 'div#hs_cos_wrapper_widget_1603096323754.hs_cos_wrapper.hs_cos_wrapper_widget.hs_cos_wrapper_type_module.widget-type-rich_text:nth-child(1)>span#hs_cos_wrapper_widget_1603096323754_.hs_cos_wrapper.hs_cos_wrapper_widget.hs_cos_wrapper_type_rich_text:nth-child(1)>h2:nth-child(1)>strong:nth-child(1)'
            },
            '_project': 'ObjectId',
            'dateCreated': '2021-07-30T16:02:55.866Z',
            '__v': 0
        }, {
            '_id': '6104257749526c002523dc27',
            'deleted': false,
            'maxMin': true,
            'version': 1,
            '_experiment': 'experiment_3',
            'displayName': 'VWE EXP GOAL 07-30',
            'name': 'VWE EXP GOAL 07-30',
            'type': 'codeEvent',
            'config': {
                'convUniq': true,
                'webElementSelector': 'div#hs_cos_wrapper_widget_1603096323754.hs_cos_wrapper.hs_cos_wrapper_widget.hs_cos_wrapper_type_module.widget-type-rich_text:nth-child(1)>span#hs_cos_wrapper_widget_1603096323754_.hs_cos_wrapper.hs_cos_wrapper_widget.hs_cos_wrapper_type_rich_text:nth-child(1)>h2:nth-child(1)>strong:nth-child(1)'
            },
            '_project': 'ObjectId',
            'dateCreated': '2021-07-30T16:14:47.145Z',
            '__v': 0
        }
    ],
    'webElements': [
        {
            '_id': '5e29c2127437a10076bbb400',
            'selector': 'body>div#root:nth-child(2)>div:nth-child(1)>h1:nth-child(1)',
            'url': 'http://localhost:3000/',
            '__v': 0,
            'hostnameMatch': false
        }
    ],
    'webModifications': [
        {
            '_id': '5e29c2127437a10076bbb401',
            '_element': '5e29c2127437a10076bbb400',
            '__v': 0,
            'attributes': {
                'outerHTML': '<h1>V3 Sandbox Variation 1</h1>',
                'innerText': 'V3 Sandbox Variation 1',
                'childSrc': null,
                'script': null
            },
            'isBaseline': false
        },
        {
            '_id': '5e2728cf5a84a200b184a389',
            '_element': '5e29c2127437a10076bbb400',
            'attributes': {
                'outerHTML': '<a href="./topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pEUVNnQVAB?hl=en-CA&amp;gl=CA&amp;ceid=CA%3Aen" class="wmzpFf  yETrXb Ir3o3e">Headlines 123</a>',
                'innerText': 'Headlines 123',
                'href': 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pEUVNnQVAB?hl=en-CA&gl=CA&ceid=CA%3Aen',
                'childSrc': null,
                'script': null
            },
            'isBaseline': false
        },
        {
            '_id': '5e569e73672f33000d24a270',
            '_element': '5e29c2127437a10076bbb400',
            'attributes': {
                'outerHTML': '<a href="./topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pEUVNnQVAB?hl=en-CA&amp;gl=CA&amp;ceid=CA%3Aen" class="wmzpFf  yETrXb Ir3o3e">Headlines 123</a>',
                'innerText': 'Headlines 123',
                'href': 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pEUVNnQVAB?hl=en-CA&gl=CA&ceid=CA%3Aen',
                'childSrc': null,
                'script': null
            },
            'isBaseline': false
        }
    ],
    'urlTargetingRules':[
        {
            '_id':  '5e55eab76da85ada77eb254a',
            'comparator': 'equals',
            'value': 'https://taplytics.com'
        },
        {
            "_id": "5e5696671acffe0c88000a83",
            "comparator": "contains",
            "value": "featureflags",
        }
    ]
}
