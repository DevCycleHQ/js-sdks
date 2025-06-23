import {
    AudienceOperator,
    ConfigBody,
    FeatureType,
    FilterType,
    VariableType,
    UserSubType,
    FilterComparator,
    DataKeyType,
} from '@devcycle/types'

export const largeConfig: ConfigBody = {
    project: {
        _id: '52979e6b353148fe8d54f1b7946578da',
        key: 'runtime',
        a0_organization: 'org_fake077d951604874362a1a7f784496d3fac',
        settings: {
            edgeDB: {
                enabled: false,
            },
            optIn: {
                enabled: false,
            },
        },
    },
    environment: {
        _id: '9a56ebb0180f4a0da3a8f3fcf86d2644',
        key: 'production',
    },
    features: [
        {
            _id: '9c80217a89694beea48eb60600f3a551',
            key: 'v-key-25',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '564e5883c09f4eda8c4d438218e80cf4',
                            value: true,
                        },
                    ],
                    _id: 'ea6cf66b997743e5b62fd3c52ac8646b',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '564e5883c09f4eda8c4d438218e80cf4',
                            value: false,
                        },
                    ],
                    _id: 'c3bf0d204c444749853cfbdf69fa14d7',
                },
            ],
            configuration: {
                _id: '0a80ddd2fd2a4076b1134a9b1723ef58',
                targets: [
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_680f420d-a65f-406c-8aaf-0b39a617e696',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'ea6cf66b997743e5b62fd3c52ac8646b',
                                percentage: 1,
                            },
                        ],
                        _id: '3ec754c7a5be44e79ab1913c2052484b',
                    },
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'ea6cf66b997743e5b62fd3c52ac8646b',
                                percentage: 0.03,
                            },
                            {
                                _variation: 'c3bf0d204c444749853cfbdf69fa14d7',
                                percentage: 0.97,
                            },
                        ],
                        _id: 'c8de06e584224550844a1d2bd5357a9e',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '1eea3a6f92d94d13a5be23dde619c820',
            key: 'v-key-37',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '812bd49a1a24499f93d478d4cf121a2e',
                            value: true,
                        },
                    ],
                    _id: 'ac702a794a1d4e86b0fe86b9dca82256',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '812bd49a1a24499f93d478d4cf121a2e',
                            value: false,
                        },
                    ],
                    _id: 'bad6f5d22738486bb8295b6022b08d6b',
                },
            ],
            configuration: {
                _id: '249e2fb2023f4f92917d6cd213bbd561',
                targets: [
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'ac702a794a1d4e86b0fe86b9dca82256',
                                percentage: 1,
                            },
                        ],
                        _id: '0006bd9415d64fef9ca48a4c9c253d64',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'bacad17ded5b4e92a98bcb7a3c8f0f82',
            key: 'v-key-35',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 0,
                        },
                    ],
                    _id: '0607bf8624434a0a92cdc70ddfb877ac',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 15,
                        },
                    ],
                    _id: '9baa0ea338eb4ec9aa212759039f6018',
                },
                {
                    key: 'variation-3',
                    name: 'Variation 3',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 60000,
                        },
                    ],
                    _id: 'ea3d8d734f1241c2b5bf69fc425f016f',
                },
                {
                    key: 'variation-4',
                    name: 'Variation 4',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 1,
                        },
                    ],
                    _id: '09c83f27b7a841a2abfa18b2767e3474',
                },
                {
                    key: 'variation-5',
                    name: 'Variation 5',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 45000,
                        },
                    ],
                    _id: 'f56dbe6106e64924877c3dd994c95012',
                },
                {
                    key: 'variation-6',
                    name: 'Variation 6',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 75000,
                        },
                    ],
                    _id: '19f2a99ff40b4464866e216bf8074656',
                },
                {
                    key: 'variation-7',
                    name: 'Variation 7',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 90000,
                        },
                    ],
                    _id: 'dbfbde99022148b3a9d815f7b1b0d98d',
                },
                {
                    key: 'variation-8',
                    name: 'Variation 8',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 120000,
                        },
                    ],
                    _id: '4736cf0de10d4d19a25e80e3f7bf4b63',
                },
                {
                    key: 'variation-9',
                    name: 'Variation 9',
                    variables: [
                        {
                            _var: 'c1ed742bf0fb49789af284afa6d3c143',
                            value: 5000,
                        },
                    ],
                    _id: '1b598764263e4913b304d6e4949f2cb1',
                },
            ],
            configuration: {
                _id: '2217195353ac460db4d372332fe0d350',
                targets: [
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-4',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['xPHyky3eMWWO'],
                                        filters: [],
                                    },
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_ddd50c4e-e7f4-4d0b-80cb-84743f18045c',
                                            'user_c464730a-acac-46e5-8cb3-83d28f9cd436',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '0607bf8624434a0a92cdc70ddfb877ac',
                                percentage: 1,
                            },
                        ],
                        _id: '6dec7bc97d544789892f8492aab15064',
                    },
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '0607bf8624434a0a92cdc70ddfb877ac',
                                percentage: 1,
                            },
                        ],
                        _id: 'edba50befa8d4b22927b5a82551b119e',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '53e1eab3b3fc49d780df98b6753e8818',
            key: 'v-key-36',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '8a4b14096f594212af40f74deb4e35a8',
                            value: true,
                        },
                    ],
                    _id: '66c5e4a6e11e438b8573d1ec12145ab5',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '8a4b14096f594212af40f74deb4e35a8',
                            value: false,
                        },
                    ],
                    _id: '7c42fd35702849439aea8d732cfafffe',
                },
            ],
            configuration: {
                _id: '041cf81316fd4a83a460f872ab4631e5',
                targets: [
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_89171e4e-5e81-4381-b0d1-7d197228a780',
                                            'user_569dde86-2f51-42d3-a038-c7ecb471647d',
                                            'user_181c9b08-2291-4780-b2f3-7648c24ca1cc',
                                            'user_1c8b2849-a822-4c16-88b9-c06e85b5c23d',
                                            'user_4cf0e7f1-8b33-4110-a0dd-9c09b52abcda',
                                            'user_85a1a0e0-d841-4f5a-95e2-b9a03d1b4b91',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '7c42fd35702849439aea8d732cfafffe',
                                percentage: 1,
                            },
                        ],
                        _id: '5f7e42e8b86d4ff89871d47a59776564',
                    },
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '66c5e4a6e11e438b8573d1ec12145ab5',
                                percentage: 1,
                            },
                        ],
                        _id: 'bfdbfdf9a9fb41c59fbf3ecce87eed22',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '8d992f8131e046e7b3e134466155cd12',
            key: 'v-key-1',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '438a470309594543a140ffe97d732edb',
                            value: true,
                        },
                    ],
                    _id: 'f05bc8fb0b28488ca237455925c10159',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '438a470309594543a140ffe97d732edb',
                            value: false,
                        },
                    ],
                    _id: 'c8dc79a170a04f5bb871ec4a9e4ee5aa',
                },
            ],
            configuration: {
                _id: 'd5d03588be614d5ebee2ba0db1b4fc0b',
                targets: [
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_c8ca0b03-3891-4fc7-9173-6589ac6b393a',
                                            'user_6848d3aa-43d3-4d72-bb95-1778810b0ef4',
                                            'user_f303c7b6-adb6-4cae-9a0e-9fec7741ed8a',
                                            'user_f19a5986-1074-4238-a924-73626466c956',
                                            'user_1a357ded-e498-4b61-8a28-c1fa1804e3e6',
                                            'user_12967f08-5d78-4764-91d2-53b1c079678b',
                                            'user_5f7d2cc3-4476-4aeb-b78e-c7b0cb61f7d9',
                                            'user_2e2ac808-90ae-407d-b702-ef81458fd5ad',
                                            'user_7c862fe7-abec-4410-993f-ac585d9420ef',
                                            'user_d67f08a0-48a0-43a9-8faa-2c66d37e1334',
                                            'user_bfa620a0-958f-481b-9810-7ca314973b19',
                                            'user_49d6ce54-43a6-4f8d-aab8-aefbff27dd4a',
                                            'user_21230ef7-f557-4a80-bdd1-9588e17767ce',
                                            'user_985d99b9-7f9e-4e1e-8d08-3e71b5fe543a',
                                            'user_c233f74e-09d8-4a0a-94d1-192c14bd06c6',
                                            'user_ebb61e81-9e8f-48c7-b191-39557c79c0b3',
                                            'user_f3899ebd-0c90-4d56-a9b8-1be4049d91b9',
                                            'user_ca7f0f69-4bd2-494c-87aa-065de866c4a1',
                                            'user_570d6e34-8cca-4519-8c99-dcf05fb9732c',
                                            'user_a6156139-ab4e-4f6e-aca7-887bfceda1ca',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f05bc8fb0b28488ca237455925c10159',
                                percentage: 1,
                            },
                        ],
                        _id: 'aaa5bc4248374dd8b6b2e8deaa57825f',
                    },
                    {
                        _audience: {
                            _id: '',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c8dc79a170a04f5bb871ec4a9e4ee5aa',
                                percentage: 1,
                            },
                        ],
                        _id: 'c357b7073b87475bba5341fdf6f68c25',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '8a6cad3f31034bae94918ee7c9393e81',
            key: 'v-key-26',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'fe699eb0c3914a74acaed8757aa40005',
                            value: true,
                        },
                    ],
                    _id: 'faf03a38f4c244019fe7149a4608dbaa',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'fe699eb0c3914a74acaed8757aa40005',
                            value: false,
                        },
                    ],
                    _id: '1b019c596bfc41ef80da8bcd2781599c',
                },
            ],
            configuration: {
                _id: '26e7f834cca04bd1b1105a6ec0c46941',
                targets: [
                    {
                        _audience: {
                            _id: 'cd236d07b66d4ae28d8285b600db7bad',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'e757fc6a16924b2ab5a95c00d609ab14',
                                            'a2a331f751914200a8a53b59ae6b7a6f',
                                            '145f66b2bfce4e7e9c8bd3a432e28c8d',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '1b019c596bfc41ef80da8bcd2781599c',
                                percentage: 1,
                            },
                        ],
                        _id: '257e9bb6fb8940b8a4483eedc91fb88f',
                    },
                    {
                        _audience: {
                            _id: '3c0d9107de50415b880c7660b0aae4e4',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '1b019c596bfc41ef80da8bcd2781599c',
                                percentage: 1,
                            },
                        ],
                        _id: '55d9a3262be44896ad583e24e1dab0da',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'f9994a609a7f4bcfb80ee47fbcb7c856',
            key: 'v-key-47',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '90e5cf50ed2645d3867e773a3536fd62',
                            value: true,
                        },
                    ],
                    _id: 'a31c6584dc634304b999efb5b588c5fa',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '90e5cf50ed2645d3867e773a3536fd62',
                            value: false,
                        },
                    ],
                    _id: 'd063d48ce3744c50b90ab6a7dc86a478',
                },
            ],
            configuration: {
                _id: '2e2a897c938249d99f415ba2d813fb64',
                targets: [
                    {
                        _audience: {
                            _id: '340f5b3c92ef440eb63b60f3ad9f176c',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_5631ec1f-937b-4c57-a7af-1395fead8abf',
                                            'user_f9052821-9ca8-4395-aaa8-251c226f1d75',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a31c6584dc634304b999efb5b588c5fa',
                                percentage: 1,
                            },
                        ],
                        _id: 'c60b6935e88846ce841e753149b7adb4',
                    },
                    {
                        _audience: {
                            _id: 'aab3a4fcc9f54e5cb8a615bc5bcbafd8',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'd063d48ce3744c50b90ab6a7dc86a478',
                                percentage: 1,
                            },
                        ],
                        _id: '70a79082348b4c52b5e1a5ba7255cfcf',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '761dd72c625e4818b97cf94be61e6935',
            key: 'v-key-54',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'fea764079b614314ac640bc0ea4463e6',
                            value: true,
                        },
                    ],
                    _id: '153fe9c2384b4c15996eb0758f7ffe30',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'fea764079b614314ac640bc0ea4463e6',
                            value: false,
                        },
                    ],
                    _id: 'c288a78ec42b40feb8f5c4e99125b46b',
                },
            ],
            configuration: {
                _id: 'bdc48d10f29243ccb190f6a87249e019',
                targets: [
                    {
                        _audience: {
                            _id: 'a4a566a508e348daa9163f0e62b8e1e4',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_d45432c9-609e-4ca4-abed-52095d094017',
                                            'user_28ce38ad-33df-43c4-8de8-60a933a233bb',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '153fe9c2384b4c15996eb0758f7ffe30',
                                percentage: 1,
                            },
                        ],
                        _id: '3fc0bfe638f841f2b3b334d395777b53',
                    },
                    {
                        _audience: {
                            _id: 'a11907fffb6844e8b2aa3b10d7b412d5',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c288a78ec42b40feb8f5c4e99125b46b',
                                percentage: 1,
                            },
                        ],
                        _id: '3ff983d162cc4d2a9d4001f8921e9d75',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '3a7371025c7f46c293a87820cda4c033',
            key: 'v-key-79',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '19a39391cca946bcb748efebf6dc1615',
                            value: true,
                        },
                    ],
                    _id: '2e108980e3b74ffc902ee108d6190cb7',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '19a39391cca946bcb748efebf6dc1615',
                            value: false,
                        },
                    ],
                    _id: '6defb45df2bc40ae8c4eecb09b5b92ca',
                },
            ],
            configuration: {
                _id: 'b04b8699ab374087bc2387727ba33d7f',
                targets: [
                    {
                        _audience: {
                            _id: '4c8fbf007503473ca7acb64fd59f8803',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_ac43af96-e84a-4446-96b5-093b0f8d8d31',
                                            'user_85a1a0e0-d841-4f5a-95e2-b9a03d1b4b91',
                                            'user_1c8b2849-a822-4c16-88b9-c06e85b5c23d',
                                            'user_4cf0e7f1-8b33-4110-a0dd-9c09b52abcda',
                                            'user_1dfd084f-b515-4a1a-aa25-bd1d07d45c7c',
                                            'user_c2508c5d-b4e7-418a-b7bc-e791722337e3',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '6defb45df2bc40ae8c4eecb09b5b92ca',
                                percentage: 1,
                            },
                        ],
                        _id: '8f65ad07bdf64bf1a15538846ce66c51',
                    },
                    {
                        _audience: {
                            _id: '795c4244bc994995b383f4c8450cf412',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['contain'],
                                        dataKey: 'data-key-5',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['krnFTNsIxvJA'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '6defb45df2bc40ae8c4eecb09b5b92ca',
                                percentage: 1,
                            },
                        ],
                        _id: 'f5b102b291a14177b75731bdd92edcdf',
                    },
                    {
                        _audience: {
                            _id: 'a7af8dd368744b3eade3077824a44288',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'iYI6uwZed0ip',
                                            'QqDKIhOwJqGz',
                                            'BkWS2ug4LiRg',
                                            'h6fCse1VCIo1',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2e108980e3b74ffc902ee108d6190cb7',
                                percentage: 1,
                            },
                        ],
                        _id: '8f6a1b47b3724f28acd2bdca07682cce',
                    },
                    {
                        _audience: {
                            _id: '0128a802324a402d8670f6fab1c41f8d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '6defb45df2bc40ae8c4eecb09b5b92ca',
                                percentage: 1,
                            },
                        ],
                        _id: '300b45f9332c4322a20ce1e9bce25994',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '620009c4c36b4728ad441ce1a7500ee6',
            key: 'v-key-29',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '06526b304eb14f4ebcb222b84ff0da27',
                            value: true,
                        },
                    ],
                    _id: 'e5605fbac0c043cbb0832e866db626d4',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '06526b304eb14f4ebcb222b84ff0da27',
                            value: false,
                        },
                    ],
                    _id: '8dc4f3194f954fcba15c8ce3e56b4913',
                },
            ],
            configuration: {
                _id: '61c9f8bc330f4397a8ba9098a40ac331',
                targets: [
                    {
                        _audience: {
                            _id: 'aba6df5fb1fb4838a978017bcf1caf15',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_ce5bf1e9-206e-4907-8e6a-55661ece0cb1',
                                            'user_8969e295-4b65-47e4-bfdb-19fefae1f1c6',
                                            'user_cfb38a17-c1fd-43a7-afe2-2e5e8a2b2598',
                                            'user_59b59200-30e7-4704-be28-64687b2eb4f1',
                                            'user_1d1e0200-dfe1-4299-82c0-ea3896f2be1c',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'e5605fbac0c043cbb0832e866db626d4',
                                percentage: 1,
                            },
                        ],
                        _id: '3e8aacd519d5406f912155627e7b48ed',
                    },
                    {
                        _audience: {
                            _id: 'f82f96044c3b4b54889414f96e67fadc',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '8dc4f3194f954fcba15c8ce3e56b4913',
                                percentage: 1,
                            },
                        ],
                        _id: 'dcd8df3283f443e98b2a10b0c374a6b7',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'caac5538231d44b4bacd6e8839dd3f6d',
            key: 'v-key-73',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '50d74d330a844b9894fb080623f71061',
                            value: true,
                        },
                    ],
                    _id: '56c0cb75727b4b50b2ee10080e3b24e8',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '50d74d330a844b9894fb080623f71061',
                            value: false,
                        },
                    ],
                    _id: '93979b874e754dcb9c352614349baf17',
                },
            ],
            configuration: {
                _id: '882f2b6cdf9a4d10a4c5d2de1a8b51cb',
                targets: [
                    {
                        _audience: {
                            _id: '65af8d6651ce4372951c913ec6dc6cdd',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-7',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'E9hQ0Pqny45G',
                                            'ysS29rBvYaXs',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '56c0cb75727b4b50b2ee10080e3b24e8',
                                percentage: 1,
                            },
                        ],
                        _id: 'de143286225147ddbdcaa07f053d90a4',
                    },
                    {
                        _audience: {
                            _id: '848b2163477e452fbc03399b8b22555f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '93979b874e754dcb9c352614349baf17',
                                percentage: 1,
                            },
                        ],
                        _id: 'fdd4de6d22e442509bcfba4437bf3566',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'a03aa15947cd478b91fd90f3126e8d51',
            key: 'v-key-46',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'a37c245fdddc40c9a37beb0bc1343347',
                            value: true,
                        },
                    ],
                    _id: '0678e9d3e2644579a505c661e26a1e55',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'a37c245fdddc40c9a37beb0bc1343347',
                            value: false,
                        },
                    ],
                    _id: '3c8fb2803078440cb392aff022bcab82',
                },
            ],
            configuration: {
                _id: '20cbedd693384a38b7a43c0805647035',
                targets: [
                    {
                        _audience: {
                            _id: '57921d24ee2448bda7dc400a1e31342f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_27579841-c4dd-4b81-be14-b6c8090f8758',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '3c8fb2803078440cb392aff022bcab82',
                                percentage: 1,
                            },
                        ],
                        _id: '98f8f65af70448afb5f646a8c6cfeb38',
                    },
                    {
                        _audience: {
                            _id: 'd39267f494044e89830a8c9566460781',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['h6fCse1VCIo1'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '0678e9d3e2644579a505c661e26a1e55',
                                percentage: 1,
                            },
                            {
                                _variation: '3c8fb2803078440cb392aff022bcab82',
                                percentage: 0,
                            },
                        ],
                        _id: '0766bd6bbe9e4b4dbff572ed6cd92746',
                    },
                    {
                        _audience: {
                            _id: '2a18cb3bfd8a4f4eb13cd63240e5fdea',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '0678e9d3e2644579a505c661e26a1e55',
                                percentage: 1,
                            },
                            {
                                _variation: '3c8fb2803078440cb392aff022bcab82',
                                percentage: 0,
                            },
                        ],
                        _id: 'cac02819436c456f816adae24a1d89e7',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'ef8c60f834aa4129bc6e1bff9f002483',
            key: 'v-key-30',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '7172c772d5a743dbb86951ec9f661d77',
                            value: true,
                        },
                    ],
                    _id: '5d3e2d0b6acc4c979c3bb0bc6d93ead5',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '7172c772d5a743dbb86951ec9f661d77',
                            value: false,
                        },
                    ],
                    _id: '8bc84c469c6c4005bba61353eac73e16',
                },
            ],
            configuration: {
                _id: '6994500920124274bb8dd677c8103c12',
                targets: [
                    {
                        _audience: {
                            _id: '13918a06e00045fa952243de85772282',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '5d3e2d0b6acc4c979c3bb0bc6d93ead5',
                                percentage: 0,
                            },
                            {
                                _variation: '8bc84c469c6c4005bba61353eac73e16',
                                percentage: 1,
                            },
                        ],
                        _id: '120321ef36d3487696a1a1a8b63c1830',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '8ae450ec4a7144a89d1910f5811d5765',
            key: 'v-key-24',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '0c2c1c562b2d4b9196ed7dae1851694c',
                            value: true,
                        },
                    ],
                    _id: 'fec58867e7584e83a8c637e34fdcb8f3',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '0c2c1c562b2d4b9196ed7dae1851694c',
                            value: false,
                        },
                    ],
                    _id: 'aa691dc1ca18491aa83ab15c156a1f92',
                },
            ],
            configuration: {
                _id: '8470fbca008b4f078f2f65a3c02ae6c6',
                targets: [
                    {
                        _audience: {
                            _id: '1375a36dc7e140b7afee52487618e8ac',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fec58867e7584e83a8c637e34fdcb8f3',
                                percentage: 1,
                            },
                        ],
                        _id: '0b9e9cc72dd5428bae0adfc32b99e84d',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '721639272a7b4a39949df3937a909220',
            key: 'v-key-71',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '698aee1469ca4e48b286f11ba25aa44f',
                            value: true,
                        },
                    ],
                    _id: 'abf9e001e7bd449a829aca9f839289ae',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '698aee1469ca4e48b286f11ba25aa44f',
                            value: false,
                        },
                    ],
                    _id: '71bd571424174cec90a701ebeaa4f673',
                },
            ],
            configuration: {
                _id: '8fd7dd46f33042af8f53f2da3a103358',
                targets: [
                    {
                        _audience: {
                            _id: '7a78e34adc294189a9eb3b4cd94f5fa7',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_ac43af96-e84a-4446-96b5-093b0f8d8d31',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'abf9e001e7bd449a829aca9f839289ae',
                                percentage: 1,
                            },
                        ],
                        _id: 'efcc65941ff4489791b8980638ba5e7d',
                    },
                    {
                        _audience: {
                            _id: 'cf3a088ffb95446285d88158f843a852',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-8',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['t2v2OAaQxGTl'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '71bd571424174cec90a701ebeaa4f673',
                                percentage: 1,
                            },
                        ],
                        _id: 'baf0d4e1ea384cb481516e0eabd093ba',
                    },
                    {
                        _audience: {
                            _id: '6c9ee9893325437ea94d0f5f920b02f1',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-9',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['DGBHUrJge6lf'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '71bd571424174cec90a701ebeaa4f673',
                                percentage: 1,
                            },
                        ],
                        _id: '56210cdaa16d462981cb9e2a2dc2448d',
                    },
                    {
                        _audience: {
                            _id: '93cab29136704c30a3aa4008d183fdf3',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['iYI6uwZed0ip'],
                                        filters: [],
                                    },
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-10',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['PyPREARJvoiq'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '71bd571424174cec90a701ebeaa4f673',
                                percentage: 1,
                            },
                        ],
                        _id: '8b6de483ad654841813d62c44bf4a6dd',
                    },
                    {
                        _audience: {
                            _id: '9d398386a41e4602ac5081f5cae3aeec',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['iYI6uwZed0ip'],
                                        filters: [],
                                    },
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-10',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'hOwQX5sV3eMQ',
                                            'PyPREARJvoiq',
                                            'Wh56kpJUCtP5',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '71bd571424174cec90a701ebeaa4f673',
                                percentage: 1,
                            },
                        ],
                        _id: '6c202cfeea3b40b3becc927b33be22a9',
                    },
                    {
                        _audience: {
                            _id: 'dabd4c725af44d82afd75b699c31b9df',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '71bd571424174cec90a701ebeaa4f673',
                                percentage: 1,
                            },
                        ],
                        _id: '4189504b9a0f49a1bc6dde724b7d0303',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'a95c73790b744750bc760420193b4afb',
            key: 'v-key-74',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'e407b156ae4b42b9b570990add98a284',
                            value: true,
                        },
                    ],
                    _id: '919d35479bfe41159ff8c9d7cc408709',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'e407b156ae4b42b9b570990add98a284',
                            value: false,
                        },
                    ],
                    _id: '738b9ba27bfd463eab338cd93c064f7f',
                },
            ],
            configuration: {
                _id: '15d2bc5dcc2f4a069bbf9e1a5f7ae402',
                targets: [
                    {
                        _audience: {
                            _id: '8b0ba39bba494d5cb3e582d228e040a6',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_c7d9fb50-4ff2-4dcc-bd9e-5608215fdd1b',
                                            'user_1fa28c40-f76f-4546-94b6-5e4890b31112',
                                            'user_64fbcfe6-f858-451a-9ebd-4157d3a2676a',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '919d35479bfe41159ff8c9d7cc408709',
                                percentage: 1,
                            },
                        ],
                        _id: 'dde506f068104d9f9eace11a52aede9e',
                    },
                    {
                        _audience: {
                            _id: 'e4994d785c7b489995d93068b15c6148',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '738b9ba27bfd463eab338cd93c064f7f',
                                percentage: 1,
                            },
                        ],
                        _id: 'e2332a9683bc4e70906f223dd928310c',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '28e909dd385a4d54ae474419a178f454',
            key: 'v-key-63',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '8cde1e4dc44741008defa79f8905f8f1',
                            value: true,
                        },
                    ],
                    _id: '5ad75719201e4bf499b87b8e68f44ebc',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '8cde1e4dc44741008defa79f8905f8f1',
                            value: false,
                        },
                    ],
                    _id: '7b3df8f2224a4011b59244dbaf37d304',
                },
            ],
            configuration: {
                _id: 'f1ba6c2cc963492cb51c96cc4c4a7985',
                targets: [
                    {
                        _audience: {
                            _id: 'e51eea4f58b2446593d763677c292d07',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_5abf7f9c-34cd-4721-8074-9e5d0aab9839',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '5ad75719201e4bf499b87b8e68f44ebc',
                                percentage: 1,
                            },
                        ],
                        _id: 'ea8549ce1f2f44d6ac0f9b6f72184f26',
                    },
                    {
                        _audience: {
                            _id: 'c83211c70c234362ae6734ce2c5143b1',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '7b3df8f2224a4011b59244dbaf37d304',
                                percentage: 1,
                            },
                        ],
                        _id: '844989128c634475bb5329e9b1bf9645',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'fa42c159bf384ed0b8ff69d64301698e',
            key: 'v-key-84',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '90defac9e63748688e0e2fe62da64dbc',
                            value: 1000,
                        },
                    ],
                    _id: 'ac5e76adf47d4e138fe879a1f5fb5d65',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '90defac9e63748688e0e2fe62da64dbc',
                            value: 300,
                        },
                    ],
                    _id: '6e78d842543b456bbfe0119a1f209984',
                },
                {
                    key: 'variation-3',
                    name: 'Variation 3',
                    variables: [
                        {
                            _var: '90defac9e63748688e0e2fe62da64dbc',
                            value: 600,
                        },
                    ],
                    _id: 'd9fcf8d085ab4d44b4dbbfeb06e7ef6a',
                },
                {
                    key: 'variation-4',
                    name: 'Variation 4',
                    variables: [
                        {
                            _var: '90defac9e63748688e0e2fe62da64dbc',
                            value: 1500,
                        },
                    ],
                    _id: '2a61fd110db0485a84745f327a99ec1e',
                },
                {
                    key: 'variation-5',
                    name: 'Variation 5',
                    variables: [
                        {
                            _var: '90defac9e63748688e0e2fe62da64dbc',
                            value: 0,
                        },
                    ],
                    _id: 'cd971d954eff4923ad22f1b76b9e1fe2',
                },
            ],
            configuration: {
                _id: '0f7e0b966faa4335a2b5c55c78ea6635',
                targets: [
                    {
                        _audience: {
                            _id: 'fc429411c1ca4ed4bd61734d60a94f70',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['iYI6uwZed0ip'],
                                        filters: [],
                                    },
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-7',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['3yejExtXkma4'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2a61fd110db0485a84745f327a99ec1e',
                                percentage: 1,
                            },
                        ],
                        _id: '152916cbff5d42ccab90b117f754766b',
                    },
                    {
                        _audience: {
                            _id: '7782821553914452b000ff9b3468a017',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'd9fcf8d085ab4d44b4dbbfeb06e7ef6a',
                                percentage: 1,
                            },
                        ],
                        _id: 'dd8c6a747c44450894d8e098678559fa',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'd955caaaea034ed5ade9205f0c5facdc',
            key: 'v-key-78',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'aeed0f6cc51042a8965e4a702f993757',
                            value: true,
                        },
                    ],
                    _id: 'f427f0a4dbb54dd9a7323a47fa511034',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'aeed0f6cc51042a8965e4a702f993757',
                            value: false,
                        },
                    ],
                    _id: '3274e40c75ad40e48733faa52b02cdd3',
                },
            ],
            configuration: {
                _id: '6762c9aec8244cc0b951b19a5d73f5a3',
                targets: [
                    {
                        _audience: {
                            _id: '5fad14338e174aa78fe0c39dddc593ed',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_5e49ebff-6a63-4935-9ea9-06696211e77f',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '3274e40c75ad40e48733faa52b02cdd3',
                                percentage: 1,
                            },
                        ],
                        _id: '796bd9691085441ba11fb30da3fd23c2',
                    },
                    {
                        _audience: {
                            _id: '3349b27d8aae4fe09c08b8cc69201349',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'f4e70df027d945fb8af17bfa8dd48091',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f427f0a4dbb54dd9a7323a47fa511034',
                                percentage: 1,
                            },
                        ],
                        _id: 'ab4337660e614e9096a5ce4cb0907356',
                    },
                    {
                        _audience: {
                            _id: 'b4642519b7094e3491facfd5063e8264',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-11',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'AXayVhoBs4iX',
                                            'BKhAwovvP46D',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '3274e40c75ad40e48733faa52b02cdd3',
                                percentage: 1,
                            },
                        ],
                        _id: 'bf75a28093f24287af18f4d5972b77a7',
                    },
                    {
                        _audience: {
                            _id: '7f951c5ede024b3b89c7254a5fb29609',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f427f0a4dbb54dd9a7323a47fa511034',
                                percentage: 1,
                            },
                        ],
                        _id: '7b647ab015934d0f9eb3b5ec6e20fe52',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'c517267ac9f24125abea1bb67b492c31',
            key: 'v-key-76',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'deee697635a54fe0bc98a50afdc6f4b7',
                            value: 60,
                        },
                    ],
                    _id: 'd6956245142544f898da7ee8de45578e',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'deee697635a54fe0bc98a50afdc6f4b7',
                            value: 120,
                        },
                    ],
                    _id: 'd2a0808c6e4745c5a2b7fa9a3cd034ed',
                },
            ],
            configuration: {
                _id: 'e1bbf48cead147438d6a19ff6c8d90af',
                targets: [
                    {
                        _audience: {
                            _id: '7895c6fee1204e9490da6fa4cf79e836',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'd6956245142544f898da7ee8de45578e',
                                percentage: 1,
                            },
                        ],
                        _id: '16131012773d4ea3a8d4948adf83766c',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'e95be3cb00854a4eac04602aff1f8fce',
            key: 'v-key-40',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '4f84abe8f3134a2da9035de370e106c2',
                            value: true,
                        },
                    ],
                    _id: '096e27809a1d4e5699fd531b567aacaf',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '4f84abe8f3134a2da9035de370e106c2',
                            value: false,
                        },
                    ],
                    _id: 'e7a1465d85df49018b2b2325094a9c01',
                },
            ],
            configuration: {
                _id: 'd929f0cba0594af9904be92bc1d9a872',
                targets: [
                    {
                        _audience: {
                            _id: '7c30b582f11344a381f4a6d47b8f1b7d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '096e27809a1d4e5699fd531b567aacaf',
                                percentage: 1,
                            },
                        ],
                        _id: 'fbd629bb4cbc453db1719f3dd1cfdc05',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'd388e4c438a04c59a08b17f875fa250c',
            key: 'v-key-80',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '8680dd624dd14418b3fae7d9ba92ec1f',
                            value: true,
                        },
                    ],
                    _id: '297f4aa9de8b43f49fecfb34773f2dd5',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '8680dd624dd14418b3fae7d9ba92ec1f',
                            value: false,
                        },
                    ],
                    _id: '41e61efc38fe4fce9b470d133a8b17d4',
                },
            ],
            configuration: {
                _id: '4e7637b62016457f8ddd9b8d95ecd8be',
                targets: [
                    {
                        _audience: {
                            _id: '2d61e8001089444e9270bc316c294828',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'iYI6uwZed0ip',
                                            'QqDKIhOwJqGz',
                                            'BkWS2ug4LiRg',
                                            'h6fCse1VCIo1',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '297f4aa9de8b43f49fecfb34773f2dd5',
                                percentage: 1,
                            },
                        ],
                        _id: '189f9d536c3a4038bd4ba9f47b1f806c',
                    },
                    {
                        _audience: {
                            _id: 'b5555c59b7f94a8895c3dca4edc1efe0',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '41e61efc38fe4fce9b470d133a8b17d4',
                                percentage: 1,
                            },
                        ],
                        _id: '3296b3df9c644d3f9d4b77bbb4e58fd5',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '58f981512ce846ac9d0a02d708f844b7',
            key: 'v-key-56',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '77702fd7feb448e5942859b448e918c8',
                            value: 0,
                        },
                    ],
                    _id: '112b909af11d47879bf5cfad792f3168',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '77702fd7feb448e5942859b448e918c8',
                            value: 10,
                        },
                    ],
                    _id: '616667364aa6429e9788ccc288e29083',
                },
            ],
            configuration: {
                _id: '064b146705d0448194102e3d25880b8c',
                targets: [
                    {
                        _audience: {
                            _id: '0af195376d774759affa251b12dd6274',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '616667364aa6429e9788ccc288e29083',
                                percentage: 1,
                            },
                        ],
                        _id: '814b63381ffe4cf4910b6df90481353e',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '0c358337318e4781bf504ea2700c9616',
            key: 'v-key-21',
            type: FeatureType.release,
            variations: [
                {
                    key: 'Custom Variation 1',
                    name: 'Custom Variation 1',
                    variables: [
                        {
                            _var: '48a1825684a341c3922ca93d4b0e046a',
                            value: 'WeJfVe6Vz5zCWMWTIUzG',
                        },
                    ],
                    _id: '19414b0132474dedb9e56e8ffadc025c',
                },
                {
                    key: 'custom-variation-2',
                    name: 'Custom Variation 2',
                    variables: [
                        {
                            _var: '48a1825684a341c3922ca93d4b0e046a',
                            value: '8J4YVg2cKbkqOs3Wnpl1',
                        },
                    ],
                    _id: 'bdf483fff1ea4222bb26c9ab92df7687',
                },
                {
                    key: 'Custom Variation 3',
                    name: 'Custom Variation 3',
                    variables: [
                        {
                            _var: '48a1825684a341c3922ca93d4b0e046a',
                            value: 'Custom Variation 3',
                        },
                    ],
                    _id: '8b740c694dd54c038ba9bac1f9547f13',
                },
            ],
            configuration: {
                _id: 'b696233f4dec4bac96fb03dfbd26f8da',
                targets: [
                    {
                        _audience: {
                            _id: '0ca4c91f249b4d64b11de484d96ffd8f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '19414b0132474dedb9e56e8ffadc025c',
                                percentage: 1,
                            },
                        ],
                        _id: '64d51c4c1c134aafa680f44752621133',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'd953bedfa6f24d9a8d99e10e4a895887',
            key: 'v-key-70',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '5b1fbfa669854da185dd66890f06ba3e',
                            value: true,
                        },
                    ],
                    _id: 'c8fc3efe5af3428b81f5d1d50474809f',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '5b1fbfa669854da185dd66890f06ba3e',
                            value: false,
                        },
                    ],
                    _id: 'c6e02536900946cd805720087371dc42',
                },
            ],
            configuration: {
                _id: '34b2df9fc238423dbd6f6142c9f01a5e',
                targets: [
                    {
                        _audience: {
                            _id: 'ac80746cd73a40bf9da46f833be2ff78',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-8',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['t2v2OAaQxGTl'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c8fc3efe5af3428b81f5d1d50474809f',
                                percentage: 1,
                            },
                        ],
                        _id: '2700a0bab4fb4904bf2b33b3abc3d3c9',
                    },
                    {
                        _audience: {
                            _id: 'af2b0f9789d1454dba49ed02dd6a5f35',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c6e02536900946cd805720087371dc42',
                                percentage: 1,
                            },
                        ],
                        _id: '40b3500393a14083b6abb035b4a1f728',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '72bffc1b7a634b34afb7df5303c077f5',
            key: 'v-key-57',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'fcfbfb097fd4479496a21351dfbf8c60',
                            value: 10,
                        },
                    ],
                    _id: '9c5f9e3c5d3743eaa3cb47fd2e3f7241',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'fcfbfb097fd4479496a21351dfbf8c60',
                            value: 100,
                        },
                    ],
                    _id: '0ac7b2557a3b49e4997e778cd5064c7e',
                },
            ],
            configuration: {
                _id: '719db0ce0f104f18b2f2e39a0184c45a',
                targets: [
                    {
                        _audience: {
                            _id: '5269501fcd2b402eb2fd3061b31e5ce2',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9c5f9e3c5d3743eaa3cb47fd2e3f7241',
                                percentage: 1,
                            },
                        ],
                        _id: 'cdf3370bc266488ab269ac652a8c2e14',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'ad370f277f20436fa72ceb4e40aa4b18',
            key: 'v-key-53',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '8066b5804a9f451bb6011af19e39e75e',
                            value: true,
                        },
                    ],
                    _id: '1c303247a9b540e188844e65d7469431',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '8066b5804a9f451bb6011af19e39e75e',
                            value: false,
                        },
                    ],
                    _id: '080f776c24c54f1eba8e02d9a23b70cf',
                },
            ],
            configuration: {
                _id: 'e3c026ede0fc4d0f84c30c949deb45c0',
                targets: [
                    {
                        _audience: {
                            _id: '7c0bbbe52fcf4382b1b77dba191bb122',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-12',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['ZvrTTPCLx00q'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '1c303247a9b540e188844e65d7469431',
                                percentage: 1,
                            },
                        ],
                        _id: '5c3da5d7e5bc40b6825f7062fc37fcc2',
                    },
                    {
                        _audience: {
                            _id: 'a3a5b32243bf4016ba2ba70fbaf9fc5d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '080f776c24c54f1eba8e02d9a23b70cf',
                                percentage: 1,
                            },
                        ],
                        _id: 'ceff853c13d145e3a007e82456c565e2',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'e6344409a1ac480ca14b52fb38128bdf',
            key: 'v-key-81',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'ec06b4b075b14b01a337adfcf55869cc',
                            value: true,
                        },
                    ],
                    _id: '6bbc2b90dad94321882832294abf1b9c',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'ec06b4b075b14b01a337adfcf55869cc',
                            value: false,
                        },
                    ],
                    _id: '2f61948540b14099aec0dc72b2ec3a87',
                },
            ],
            configuration: {
                _id: 'b2e8ac34152243c2a7726e0fc3e81a29',
                targets: [
                    {
                        _audience: {
                            _id: '5f97bec62c974535b9d7922b0d575642',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'iYI6uwZed0ip',
                                            'h6fCse1VCIo1',
                                            'QqDKIhOwJqGz',
                                            'BkWS2ug4LiRg',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '6bbc2b90dad94321882832294abf1b9c',
                                percentage: 1,
                            },
                        ],
                        _id: '669d597f8b42485e97e8c3e595a17c2d',
                    },
                    {
                        _audience: {
                            _id: '05d3edaa1da44cb7a2713eed7e89de8d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2f61948540b14099aec0dc72b2ec3a87',
                                percentage: 1,
                            },
                        ],
                        _id: '263e498e5ba745818f3f04c59bfef5dc',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '974836d9868b42cda5dc9de6c1868424',
            key: 'v-key-67',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '761bc57f612d4e71b69e18c26f32715f',
                            value: 5,
                        },
                    ],
                    _id: 'a73feb30e3ce4aaea73d0f2a7538b8fd',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '761bc57f612d4e71b69e18c26f32715f',
                            value: 0,
                        },
                    ],
                    _id: '0b9b82be71944a4ab4a81f3846b981d3',
                },
            ],
            configuration: {
                _id: '5525da2f214c4683bb8202ca4534fd58',
                targets: [
                    {
                        _audience: {
                            _id: '7fbf36139d5d438d92b9ff9ffbab5a20',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-8',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['t2v2OAaQxGTl'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a73feb30e3ce4aaea73d0f2a7538b8fd',
                                percentage: 1,
                            },
                        ],
                        _id: 'c4e61037745b4597bf696029d74b42a9',
                    },
                    {
                        _audience: {
                            _id: '2863ea686ee14c4aafec6c0cbe441116',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['iYI6uwZed0ip'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a73feb30e3ce4aaea73d0f2a7538b8fd',
                                percentage: 1,
                            },
                        ],
                        _id: '1a69d02b08fa4ab08f0081b2a07d96cf',
                    },
                    {
                        _audience: {
                            _id: '92fface9de7f45f5a5ec8b0036e7de2e',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a73feb30e3ce4aaea73d0f2a7538b8fd',
                                percentage: 1,
                            },
                        ],
                        _id: '355d3503d4f047c684124db2201fb4ea',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '3d5211eee2e44062b6033ae2069a77d3',
            key: 'v-key-61',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '44960795efff4210a5e7510f8ef6940d',
                            value: true,
                        },
                    ],
                    _id: 'fe710e01c27c424884255d5ecf913c0c',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '44960795efff4210a5e7510f8ef6940d',
                            value: false,
                        },
                    ],
                    _id: '60f7a1343fa04113bff1aac8afc1ddf1',
                },
            ],
            configuration: {
                _id: 'b8ed9613d6cd4db9b55e8075c4ec2de0',
                targets: [
                    {
                        _audience: {
                            _id: '629e83d32a244f33b51fa68ddce29c0c',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-9',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'uRV8gVD4ckHt',
                                            'mcQmg6STnIyN',
                                            'merZVTWp81Yw',
                                            'xVRGz6UNFyAh',
                                            'QBKKuubptukF',
                                            '3AeVDIaJsKJe',
                                            'S63KKeQ9Dhw7',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fe710e01c27c424884255d5ecf913c0c',
                                percentage: 1,
                            },
                        ],
                        _id: '682451f6d6724abf8c857edc13301378',
                    },
                    {
                        _audience: {
                            _id: '78d3364b4c3b4d2a8d8095966968cbc1',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-8',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['t2v2OAaQxGTl'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fe710e01c27c424884255d5ecf913c0c',
                                percentage: 1,
                            },
                        ],
                        _id: '68939d362965438cb7a7ddeab9004208',
                    },
                    {
                        _audience: {
                            _id: 'e1fe575e19444299ba3035d972d0dbb6',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '60f7a1343fa04113bff1aac8afc1ddf1',
                                percentage: 1,
                            },
                        ],
                        _id: '2f1ed2f4fbb244daa1d1cf60d6836c40',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '3e61474d3c11440abfd846407064d5f8',
            key: 'v-key-13',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '851ab1e228c346299dbaa6e2ed4e8d30',
                            value: true,
                        },
                    ],
                    _id: '31cfabf735b8403881f1b552c0d4843f',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '851ab1e228c346299dbaa6e2ed4e8d30',
                            value: false,
                        },
                    ],
                    _id: 'fb48420cd3664a46b51523b9ea0c146e',
                },
            ],
            configuration: {
                _id: '000578157270456da2aa968cd1c1a61f',
                targets: [
                    {
                        _audience: {
                            _id: '246367a691eb45cb9891d6d3a72c2d58',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-13',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['4u4lVuBudCTB'],
                                        filters: [],
                                    },
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'iYI6uwZed0ip',
                                            'h6fCse1VCIo1',
                                            'BkWS2ug4LiRg',
                                            'QqDKIhOwJqGz',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '31cfabf735b8403881f1b552c0d4843f',
                                percentage: 1,
                            },
                        ],
                        _id: '1f2e5b8ff8c94acb80a726db14ffb481',
                    },
                    {
                        _audience: {
                            _id: 'e5f28995148a4f2db7fc535387de3abc',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fb48420cd3664a46b51523b9ea0c146e',
                                percentage: 1,
                            },
                        ],
                        _id: 'a8d8d961bdf6442cae0f4821311cac96',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'f5c47b4aad5f41b0ac8f2ebf229a23a0',
            key: 'v-key-20',
            type: FeatureType.release,
            variations: [
                {
                    key: 'custom-variation-4',
                    name: 'Custom Variation 4',
                    variables: [
                        {
                            _var: '6e5993c7b38d4945bb3fa15287a9988b',
                            value: 'WeJfVe6Vz5zCWMWTIUzG',
                        },
                    ],
                    _id: '2b95fbc75b8f45939356555eb4daecc0',
                },
                {
                    key: 'custom-variation-5',
                    name: 'Custom Variation 5',
                    variables: [
                        {
                            _var: '6e5993c7b38d4945bb3fa15287a9988b',
                            value: 'fQDBqpSLGhXFCojn0SNH',
                        },
                    ],
                    _id: '8b226c95a888406a9d987f549eb761ba',
                },
            ],
            configuration: {
                _id: 'd677ff209ebe46c2a8e11e5ca2767cb8',
                targets: [
                    {
                        _audience: {
                            _id: 'e9208d95a7ae4d8384e73b1374810b18',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2b95fbc75b8f45939356555eb4daecc0',
                                percentage: 1,
                            },
                        ],
                        _id: 'e7dcaa3023614615acfb16e86517ba80',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '4dfe3b0e5a784a78b42457e4f6d8b3d9',
            key: 'v-key-65',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '22d1531da708470c8d16d3ebefce269b',
                            value: true,
                        },
                    ],
                    _id: '9252f1579fc14106bf82678b887d9dc8',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '22d1531da708470c8d16d3ebefce269b',
                            value: false,
                        },
                    ],
                    _id: '576ad0f9a4b842f2a512924770692c01',
                },
            ],
            configuration: {
                _id: '798a76ed7ba84584b95e0e00f4248c03',
                targets: [
                    {
                        _audience: {
                            _id: '65ffe91c40604154b31eb54005b83c39',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'b400f04e086a4e8f9ae7f68920b92fee',
                                            '7db4d6f7e53543e4a413ac539477bac6',
                                            '145f66b2bfce4e7e9c8bd3a432e28c8d',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9252f1579fc14106bf82678b887d9dc8',
                                percentage: 1,
                            },
                        ],
                        _id: 'c552a903b5cf43a09ea24860b4646e21',
                    },
                    {
                        _audience: {
                            _id: '37fac7ef226e4ae6976f111ec016b00d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-12',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'CXHnwl1TxPmH',
                                            'eSXNRuaFMyN3',
                                            'ZjlXma17AYqk',
                                            'nqEcKnxdVrua',
                                            'VTtu9bRhWNuP',
                                            'StH0OZDHdpfH',
                                            '8Qdaw7IE6IsV',
                                            '1KM6ZIXPspzo',
                                            'uozqIvbGlEAM',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9252f1579fc14106bf82678b887d9dc8',
                                percentage: 1,
                            },
                        ],
                        _id: '906cfc31530c4bdcb196a162268bedd2',
                    },
                    {
                        _audience: {
                            _id: '82887d23f55a4fff80fe42451d390c75',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'a2a331f751914200a8a53b59ae6b7a6f',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9252f1579fc14106bf82678b887d9dc8',
                                percentage: 1,
                            },
                            {
                                _variation: '576ad0f9a4b842f2a512924770692c01',
                                percentage: 0,
                            },
                        ],
                        _id: '34e6593f9c68455abd45a46b670a85da',
                    },
                    {
                        _audience: {
                            _id: '47300efb0fb74991a93c4ad29ad13914',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'e757fc6a16924b2ab5a95c00d609ab14',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9252f1579fc14106bf82678b887d9dc8',
                                percentage: 1,
                            },
                            {
                                _variation: '576ad0f9a4b842f2a512924770692c01',
                                percentage: 0,
                            },
                        ],
                        _id: '119cf0fdfa4d4fbbb70535808a6e4bd3',
                    },
                    {
                        _audience: {
                            _id: 'dc38ef01b869449fbac22418b83e9967',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9252f1579fc14106bf82678b887d9dc8',
                                percentage: 1,
                            },
                            {
                                _variation: '576ad0f9a4b842f2a512924770692c01',
                                percentage: 0,
                            },
                        ],
                        _id: '59e6f45fd301488288a065df32fc9998',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'c20d0f33a9954c74ace098d83cc23595',
            key: 'v-key-22',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '2b682f1f92fa42c190324fff0c565efa',
                            value: true,
                        },
                    ],
                    _id: 'f116aaddfb674816bc4a787ba500dc8a',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '2b682f1f92fa42c190324fff0c565efa',
                            value: false,
                        },
                    ],
                    _id: '00626470e3e244bd906a68371eaa7fb1',
                },
            ],
            configuration: {
                _id: '4acd9dc31f614e849b45b3836c0964b7',
                targets: [
                    {
                        _audience: {
                            _id: 'dd5057afacef442fa222bea9f102d36a',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_91ac71cb-5fec-48e1-b320-3f03add4c1a3',
                                            'user_d7685aa7-d8f0-433a-ac73-bad3410b03c1',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f116aaddfb674816bc4a787ba500dc8a',
                                percentage: 1,
                            },
                        ],
                        _id: '0476a2c6dced4249badb1bb598b8b91d',
                    },
                    {
                        _audience: {
                            _id: '69963c663d4b4c0cb17051ffe9002941',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '00626470e3e244bd906a68371eaa7fb1',
                                percentage: 1,
                            },
                        ],
                        _id: '882af31def1948419e61aa630e3b125c',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '846f328e7f054df2bc10c14a902e249e',
            key: 'v-key-75',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '5dc07eb3117c4dc9a4d244448079f396',
                            value: true,
                        },
                    ],
                    _id: 'fb21b314e5ea475394e0a2457c33d69a',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '5dc07eb3117c4dc9a4d244448079f396',
                            value: false,
                        },
                    ],
                    _id: '4eef7f8938804ae7be9a9e5d1b93021d',
                },
            ],
            configuration: {
                _id: 'ce5c4cf4315c47ef9fead0b33143000e',
                targets: [
                    {
                        _audience: {
                            _id: 'dcf466a219834ad1993cce1331729e6e',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_8a834e64-50ce-4bf9-9bb1-4bacb3b3094c',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fb21b314e5ea475394e0a2457c33d69a',
                                percentage: 1,
                            },
                        ],
                        _id: '98ee3d6da1d945e9ac7bf2ddbebdab96',
                    },
                    {
                        _audience: {
                            _id: 'fb8ab9ab7ce5464ca9ed059f0048d377',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            '7db4d6f7e53543e4a413ac539477bac6',
                                            '145f66b2bfce4e7e9c8bd3a432e28c8d',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fb21b314e5ea475394e0a2457c33d69a',
                                percentage: 1,
                            },
                        ],
                        _id: '8b502c13bed744b0a7afa0746c25f996',
                    },
                    {
                        _audience: {
                            _id: '42845c688639487f9a8c159d60129d75',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'fb21b314e5ea475394e0a2457c33d69a',
                                percentage: 1,
                            },
                        ],
                        _id: '0e3734ff0aca430fbe57ce9872b7c579',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '754debbc86e949e697927d9245711bf2',
            key: 'v-key-83',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 2,
                        },
                    ],
                    _id: '048c62b9bbf2491a8fef64097e02e255',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 3,
                        },
                    ],
                    _id: '9e0486af81b549009b3b10fe6e33aeca',
                },
                {
                    key: 'variation-3',
                    name: 'Variation 3',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 4,
                        },
                    ],
                    _id: 'b628f159932240738dcf7f3b06b5399a',
                },
                {
                    key: 'variation-4',
                    name: 'Variation 4',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 6,
                        },
                    ],
                    _id: '0f223483e80346a6867fe1651a9263f9',
                },
                {
                    key: 'variation-5',
                    name: 'Variation 5',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 10,
                        },
                    ],
                    _id: '1efdd83d324848fe85b6c3be00b5aedf',
                },
                {
                    key: 'variation-6',
                    name: 'Variation 6',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 15,
                        },
                    ],
                    _id: '08f20cbfceb54c3b86aab604e2378ec0',
                },
                {
                    key: 'variation-7',
                    name: 'Variation 7',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 20,
                        },
                    ],
                    _id: 'beaff080c6974e8cb20fb80851c285c3',
                },
                {
                    key: 'variation-8',
                    name: 'Variation 8',
                    variables: [
                        {
                            _var: '202a6f34d0e64621993cf4075cb1cc5d',
                            value: 8,
                        },
                    ],
                    _id: 'f986453b32684f8485ae644efe266e5f',
                },
            ],
            configuration: {
                _id: 'c3b6b36d13344a0dbe2ec137ef402d24',
                targets: [
                    {
                        _audience: {
                            _id: 'ae4a29e891f34782b1064ff032caf3a2',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_5239eab2-74d6-4f4a-91a3-d527430ddb28',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '08f20cbfceb54c3b86aab604e2378ec0',
                                percentage: 1,
                            },
                        ],
                        _id: '5f2f751489b447ddaa6199cd7fa498c1',
                    },
                    {
                        _audience: {
                            _id: '733b7d1ccae7436da34774be9b814223',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f986453b32684f8485ae644efe266e5f',
                                percentage: 1,
                            },
                        ],
                        _id: 'a32f44feb860474db245189a6e19b814',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '420bcc3afca14766a7973755c3056b56',
            key: 'v-key-68',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '0933c3fd3a36449bb3b93f16fdb36aa2',
                            value: true,
                        },
                    ],
                    _id: 'e89f799e90774f9190a2d8d77bf43bc4',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '0933c3fd3a36449bb3b93f16fdb36aa2',
                            value: false,
                        },
                    ],
                    _id: '086f248d794a46eaba4084c55b59cfeb',
                },
            ],
            configuration: {
                _id: '706276a1e5b74eca97b72533200fe38c',
                targets: [
                    {
                        _audience: {
                            _id: '005aa12e5416452c9ca536013f3246bb',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'e89f799e90774f9190a2d8d77bf43bc4',
                                percentage: 0.04,
                            },
                            {
                                _variation: '086f248d794a46eaba4084c55b59cfeb',
                                percentage: 0.96,
                            },
                        ],
                        _id: '7ee3864468664da8b8db7a9d340cf326',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '003efaabbd914e18831fa9b4532ecc9c',
            key: 'v-key-60',
            type: FeatureType.release,
            variations: [
                {
                    key: 'custom-variation-6',
                    name: 'Custom Variation 6',
                    variables: [
                        {
                            _var: '917f5a4d089c400e86a6db867d3a752b',
                            value: '2N41LoyAJ1z7urWBBHRz',
                        },
                    ],
                    _id: '07a2d46c18064e7087f4b29d2dcb8252',
                },
                {
                    key: 'custom-variation-7',
                    name: 'Custom Variation 7',
                    variables: [
                        {
                            _var: '917f5a4d089c400e86a6db867d3a752b',
                            value: 'atHSs6LNxHmyEuKjKXjX',
                        },
                    ],
                    _id: '839575e6c1024c72b60e7b23f6ef64b1',
                },
                {
                    key: 'custom-variation-8',
                    name: 'Custom Variation 8',
                    variables: [
                        {
                            _var: '917f5a4d089c400e86a6db867d3a752b',
                            value: 'KUays3m3vS6K4QnxZi4s',
                        },
                    ],
                    _id: '44ef9badd7c84acca23d50b3fe8b0301',
                },
            ],
            configuration: {
                _id: '5c643caeb9f34ed2bd65769ed85af3e1',
                targets: [
                    {
                        _audience: {
                            _id: '82ad8192807140d28c9986e4b857c903',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_15fa0542-645a-4529-8201-c175fa4ae07e',
                                            'user_a87e5327-0b35-4e20-8316-7164d0cb05e1',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '44ef9badd7c84acca23d50b3fe8b0301',
                                percentage: 1,
                            },
                        ],
                        _id: '1c1f8082b5cb4d5aa712991fda1d1063',
                    },
                    {
                        _audience: {
                            _id: 'e320a87936164e7798364e42b63b3bea',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_0dcea18c-74c0-4872-a98a-b8d67eeadfc5',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '44ef9badd7c84acca23d50b3fe8b0301',
                                percentage: 1,
                            },
                        ],
                        _id: '916d4af8d15d4493b6ea385701fe8649',
                    },
                    {
                        _audience: {
                            _id: 'c923bfd11aa946cdba76202b9c2eebdf',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '839575e6c1024c72b60e7b23f6ef64b1',
                                percentage: 1,
                            },
                        ],
                        _id: '94680ee589e048e6bb9e899d6494163a',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '00d806689ddd4a939137bc6619765527',
            key: 'v-key-64',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'dc5eff4ddca2474ca83930d57752ddfe',
                            value: true,
                        },
                    ],
                    _id: 'e9af494d0610443fbd1f138788b06897',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'dc5eff4ddca2474ca83930d57752ddfe',
                            value: false,
                        },
                    ],
                    _id: '2fa62881314243a5833b3da6290bca8d',
                },
            ],
            configuration: {
                _id: 'ccbd310d94d94487b2607576f1304ec8',
                targets: [
                    {
                        _audience: {
                            _id: 'f656066b17c64c1abc65724e6fd16e4c',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_b401a363-1198-49b4-b334-8b7e78c9002d',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'e9af494d0610443fbd1f138788b06897',
                                percentage: 1,
                            },
                        ],
                        _id: 'ad549d6bfb9c4aa3a7b7207abd406ab2',
                    },
                    {
                        _audience: {
                            _id: '8cdacc2d7bb74dddabfb6c68a3d745a8',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'e9af494d0610443fbd1f138788b06897',
                                percentage: 1,
                            },
                        ],
                        _id: '4ddebe6132da4b309f2f0708777d593d',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '034e54c0a97d4b6691306a7657463a47',
            key: 'v-key-44',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'ff6bcafe19f8448f89136588f31d2859',
                            value: true,
                        },
                    ],
                    _id: '90429e6faade4f859a054f9125d26e3d',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'ff6bcafe19f8448f89136588f31d2859',
                            value: false,
                        },
                    ],
                    _id: 'b31735c5c8be4727bc87fbbc93ee09f3',
                },
            ],
            configuration: {
                _id: '5551569e21f841329a3e2ed4e0d1252c',
                targets: [
                    {
                        _audience: {
                            _id: '75ac0892de264ef6b70c1200e0e5bf5f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-9',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            's4LzMhHxoxSK',
                                            'Gt6D85gFuDdt',
                                            'taY8ndRfX6nv',
                                            'cFYH3YzjqBNq',
                                            'zB1otqfjFRKO',
                                            '3yejExtXkma4',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '90429e6faade4f859a054f9125d26e3d',
                                percentage: 1,
                            },
                        ],
                        _id: '0d0e3fb9514a447abc3c9165182e2c7f',
                    },
                    {
                        _audience: {
                            _id: '7c9f1e2b1ac4413ab1bc93cc6b08b26e',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-8',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['t2v2OAaQxGTl'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '90429e6faade4f859a054f9125d26e3d',
                                percentage: 1,
                            },
                        ],
                        _id: '0a33a3009f0543c8a58fcacdc3257004',
                    },
                    {
                        _audience: {
                            _id: '53be40565af143aaa674fdd8c77e7562',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'b31735c5c8be4727bc87fbbc93ee09f3',
                                percentage: 1,
                            },
                        ],
                        _id: 'e9687a5c63824a4eb25147626cc508aa',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'c52345616bbd45a2a388577372323630',
            key: 'v-key-82',
            type: FeatureType.release,
            variations: [
                {
                    key: 'custom-variation-9',
                    name: 'Custom Variation 9',
                    variables: [
                        {
                            _var: 'b9a677aeb53d43a581b774ec714ac9d8',
                            value: 1,
                        },
                    ],
                    _id: 'b7db5873eda845f4a4650c870839f78e',
                },
                {
                    key: 'custom-variation-10',
                    name: 'Custom Variation 10',
                    variables: [
                        {
                            _var: 'b9a677aeb53d43a581b774ec714ac9d8',
                            value: 2,
                        },
                    ],
                    _id: '5009e03f574f4a68944189c95e2ef5d9',
                },
            ],
            configuration: {
                _id: '21a422e75abe44f7a820f480b4a46ce0',
                targets: [
                    {
                        _audience: {
                            _id: '317e11bab25e417fa79a21573079c73a',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_165ae139-0716-4376-9163-2ec0bd38dc1e',
                                            'user_4cc56456-4ed3-47f6-82ee-de086ea87223',
                                            'user_2640ce56-12e2-41f1-8b17-c7dd1066830f',
                                            'user_4c710342-a58a-4ccd-b435-bbb143a38b4f',
                                            'user_8b649e76-6409-400f-84a3-ac7675a7bbcb',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '5009e03f574f4a68944189c95e2ef5d9',
                                percentage: 1,
                            },
                        ],
                        _id: '25509008f0234f0a89897eb9d93a56cb',
                    },
                    {
                        _audience: {
                            _id: '868e5965be1a44ac8df712a2b3fe112a',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'b7db5873eda845f4a4650c870839f78e',
                                percentage: 1,
                            },
                        ],
                        _id: '30223227dbe74711809fe61450340619',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '26bb8a138873483ca78397d25047b67f',
            key: 'v-key-38',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'c37d06749b794878b5b78489b9665f11',
                            value: true,
                        },
                    ],
                    _id: 'dc77a0f800314b579845f93f2ba544a2',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'c37d06749b794878b5b78489b9665f11',
                            value: false,
                        },
                    ],
                    _id: '13039d477cba4eb3b904ece4eea97d53',
                },
            ],
            configuration: {
                _id: '2ed568a5407b426ab98a9b714c7ade97',
                targets: [
                    {
                        _audience: {
                            _id: '82654abc097b41c2803f6757f71a2d3f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_e7dc4f86-361c-4953-8ec9-ea83d0b2bcee',
                                            'user_f0f454d0-e120-4cdc-a013-7308a5bb22bc',
                                            'user_9937607c-e89a-4068-b891-517485c90b6e',
                                            'user_b423912c-8e49-4090-81a9-aa1c405aeab9',
                                            'user_c5905e7e-36d6-40a3-aeb0-38064dfcbe25',
                                            'user_42bbf710-618e-44b1-941e-4ce6d40a90b6',
                                            'user_d3ff3965-89a8-442d-ae93-b4b65cbc2397',
                                            'user_ef96b6ff-a0e4-4bc7-9c66-a9f451448076',
                                            'user_6b173f6a-9f0c-440e-b8d7-ad3d691eb41f',
                                            'user_9d909289-45ad-414a-8c28-168940b51f5e',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'dc77a0f800314b579845f93f2ba544a2',
                                percentage: 1,
                            },
                        ],
                        _id: '6b060603227a41828069b41f8c63e483',
                    },
                    {
                        _audience: {
                            _id: '821f59f5e5214a88b27a989f43e3898d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '13039d477cba4eb3b904ece4eea97d53',
                                percentage: 1,
                            },
                        ],
                        _id: '4127811e98b24659a96b9d4517a68786',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'ea3d10c1d635493d9973da58362d2a27',
            key: 'v-key-52',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '4527054945a041bfb64672ecd7149b69',
                            value: true,
                        },
                    ],
                    _id: 'e0e5f7d1fab5432a89e1142068559b22',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '4527054945a041bfb64672ecd7149b69',
                            value: false,
                        },
                    ],
                    _id: '3952fbef019c44debb2fff63a21d8d95',
                },
            ],
            configuration: {
                _id: 'b6815ed149a343b5a7889d3ab6433f4a',
                targets: [
                    {
                        _audience: {
                            _id: '8c36a528334a4442b10a834685215097',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'e0e5f7d1fab5432a89e1142068559b22',
                                percentage: 1,
                            },
                        ],
                        _id: '408c903edd044c9a95da3fa4a3d83e46',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '5135955a5a6641fbb735e95eb1b37e99',
            key: 'v-key-77',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'acd3fda7a24144249fb2c1e61482e53d',
                            value: true,
                        },
                    ],
                    _id: 'f739d10ffd524bb88bc57912c78828ad',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'acd3fda7a24144249fb2c1e61482e53d',
                            value: false,
                        },
                    ],
                    _id: 'd2dc9c60ba3a471dafc0f1c40353b6c2',
                },
            ],
            configuration: {
                _id: 'ea1f7c9b8c3e4d48aec256bc92779e00',
                targets: [
                    {
                        _audience: {
                            _id: '63ebc3af894f4ead8db999f0e66f2028',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'b400f04e086a4e8f9ae7f68920b92fee',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f739d10ffd524bb88bc57912c78828ad',
                                percentage: 1,
                            },
                        ],
                        _id: '93ff7b198a4940fbbb21330862be3aa5',
                    },
                    {
                        _audience: {
                            _id: 'f133f6917d294233aca570a02b1c335d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-12',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'CXHnwl1TxPmH',
                                            '8Qdaw7IE6IsV',
                                            'nqEcKnxdVrua',
                                            'StH0OZDHdpfH',
                                            '1KM6ZIXPspzo',
                                            'VTtu9bRhWNuP',
                                            'eSXNRuaFMyN3',
                                            'ZjlXma17AYqk',
                                            'uozqIvbGlEAM',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f739d10ffd524bb88bc57912c78828ad',
                                percentage: 1,
                            },
                        ],
                        _id: 'cd78ea8accba447f833c6b772fc5e1a6',
                    },
                    {
                        _audience: {
                            _id: '2357bdc209ee460ebf0875e584b2ac3c',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f739d10ffd524bb88bc57912c78828ad',
                                percentage: 1,
                            },
                            {
                                _variation: 'd2dc9c60ba3a471dafc0f1c40353b6c2',
                                percentage: 0,
                            },
                        ],
                        _id: 'c6449d6139ad414ba880c5b652bac547',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '182936bccd6a4c72b823c892f3f15164',
            key: 'v-key-15',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'a5b4ae7378014b8b86fec0e50a5b1d11',
                            value: true,
                        },
                    ],
                    _id: '68bb758de04e43a588eb3f76c755aecd',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'a5b4ae7378014b8b86fec0e50a5b1d11',
                            value: false,
                        },
                    ],
                    _id: '07638041569d4ccaaffb4c3d9177292c',
                },
            ],
            configuration: {
                _id: '2c2c79abd38241baba45642ee9b4666c',
                targets: [
                    {
                        _audience: {
                            _id: '7f78bdc2ad074a068d50ea9de5975bfe',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_945504bf-0c4a-47cc-ba14-a2a07dac99cd',
                                            'user_e4d07d7d-8bdb-426a-9cc9-2f4c12ecef8d',
                                            'user_930f7961-946e-4444-9a4e-bac9b97340e0',
                                            'user_0f91b585-38f1-4254-ba6a-a1cc486b38ee',
                                            'user_af27985a-c440-49eb-b110-719c89583f49',
                                            'user_506dc1aa-e704-450c-a17a-210e8fe7e5e5',
                                            'user_97eecb9e-f8a9-40b0-815e-be24fe344811',
                                            'user_5239eab2-74d6-4f4a-91a3-d527430ddb28',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '68bb758de04e43a588eb3f76c755aecd',
                                percentage: 1,
                            },
                        ],
                        _id: 'fdc6153e53b549c1be2141cca61005a5',
                    },
                    {
                        _audience: {
                            _id: 'c015e4e8e64f4d859629c410dbbbba9c',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '07638041569d4ccaaffb4c3d9177292c',
                                percentage: 1,
                            },
                        ],
                        _id: 'de10917d33854542a92b2b6adb8d53e8',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '838c84e8b83c407b93003cc766f8bed8',
            key: 'v-key-12',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'c47307dac00744cfa621b443e373ba8c',
                            value: true,
                        },
                    ],
                    _id: '78e55b62e5f54aba937ed87d326c5689',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'c47307dac00744cfa621b443e373ba8c',
                            value: false,
                        },
                    ],
                    _id: '965b5393a8bf496cb84c3d8654b76e39',
                },
            ],
            configuration: {
                _id: '7d1c9fceb8e54a60bb25617c584f955d',
                targets: [
                    {
                        _audience: {
                            _id: '12e9d9b211f6471e900aa4de7966fb32',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_7c18a302-1036-4d46-bea8-2411fa9e612f',
                                            'user_a6f8e676-af3f-4654-9ae9-50c626b72b51',
                                            'user_8cac82df-1ab6-40d3-8322-7970ad9e85c2',
                                            'user_8a2e3aee-54e4-4ca5-bb93-2ee4fbd77029',
                                            'user_ac43af96-e84a-4446-96b5-093b0f8d8d31',
                                            'user_999e0b49-7e7b-4c92-874f-376decef02ef',
                                            'user_cf47218b-a8d8-4788-9fbf-4795437e69fe',
                                            'user_088123e9-ff0e-4de7-bf40-553f514f13bb',
                                            'krnFTNsIxvJA',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '78e55b62e5f54aba937ed87d326c5689',
                                percentage: 1,
                            },
                        ],
                        _id: '1f170cba74b34f8fa8f0370e1dd71e2e',
                    },
                    {
                        _audience: {
                            _id: '0fe9b959f6ab43b49a9245438cef95af',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '965b5393a8bf496cb84c3d8654b76e39',
                                percentage: 1,
                            },
                        ],
                        _id: '2090386c3d23448da5d5e265ea3a7010',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '54c6024646fa4a39923c66a3d4de93af',
            key: 'v-key-17',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '3448b5ba369c4aca8c3b32995559e6d7',
                            value: true,
                        },
                    ],
                    _id: '22282abac12f4b6b9a89b0a4b4c95dfb',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '3448b5ba369c4aca8c3b32995559e6d7',
                            value: false,
                        },
                    ],
                    _id: '47108125242841abacb259b8c3b0569f',
                },
            ],
            configuration: {
                _id: 'c766114fe6864f589df15f16ecce08d3',
                targets: [
                    {
                        _audience: {
                            _id: '28b9351afbef4e6d8e9388cf48c94c95',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_2d267659-ac0e-4277-87aa-3f7296a4aa72',
                                            'user_98c4c14b-9c35-4c25-bc7e-3d120ccfa8f9',
                                            'user_5de4b147-b54c-48d9-98ff-752fbc9dc7d7',
                                            'user_014f0e7d-fbf6-4d97-9e23-ae5c9f94a933',
                                            'user_c72a8fbe-d5c6-493d-8b68-df5499e19e4c',
                                            'user_b038c7b9-9aaa-4aba-8766-be8172ca91c0',
                                            'user_d4890258-c74a-47cb-95e7-e06e1bf37eec',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '22282abac12f4b6b9a89b0a4b4c95dfb',
                                percentage: 1,
                            },
                        ],
                        _id: '5a74ab26cea94d6c8d0e26c23c3e5e7d',
                    },
                    {
                        _audience: {
                            _id: '0d5b8476f1b44225bd1d46fff67cfb13',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '47108125242841abacb259b8c3b0569f',
                                percentage: 1,
                            },
                        ],
                        _id: '155badb5ee054ecbbaa1c9b0038cae6b',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '0050d463494b4ec3bd07a58a95ab50a6',
            key: 'v-key-62',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '55b371985ca0490f94fcf407c656737d',
                            value: true,
                        },
                    ],
                    _id: '86fa8720bcc94928bf98ceccd574474c',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '55b371985ca0490f94fcf407c656737d',
                            value: false,
                        },
                    ],
                    _id: '2023ef59059e45a7a1b65f56db516324',
                },
            ],
            configuration: {
                _id: '4d36c03ce3e14b9da44d0fc558f22e50',
                targets: [
                    {
                        _audience: {
                            _id: '695a30ed0489487a99006145de181f38',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2023ef59059e45a7a1b65f56db516324',
                                percentage: 1,
                            },
                        ],
                        _id: '211de398915f4e0c87dc388b4e3d0671',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '438667fdb82c4f9aa52b826fcb99df13',
            key: 'v-key-14',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'ebc12f6619a24fd797511492e8dc2dc9',
                            value: 1,
                        },
                    ],
                    _id: 'baab7f30c90d4306980c43ae0958f494',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'ebc12f6619a24fd797511492e8dc2dc9',
                            value: 2,
                        },
                    ],
                    _id: 'c99b4d174d9a423db5b3a7de948b9fd0',
                },
            ],
            configuration: {
                _id: '573443f307fd4da0900309bb917b7fbe',
                targets: [
                    {
                        _audience: {
                            _id: '047d3d7450f74e84b86339a059d5ae5f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_11daf353-2fa7-4704-95fa-f2551b4c3199',
                                            'user_945504bf-0c4a-47cc-ba14-a2a07dac99cd',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c99b4d174d9a423db5b3a7de948b9fd0',
                                percentage: 1,
                            },
                        ],
                        _id: '986a9421dbad4426a2f73403477e899a',
                    },
                    {
                        _audience: {
                            _id: '2d0515517c5d4eaaae151f4057008e01',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'baab7f30c90d4306980c43ae0958f494',
                                percentage: 1,
                            },
                        ],
                        _id: '4f68b487830c4afe8a2b138c8c44a48e',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'e448205339e0480399a4dc01f4dc8184',
            key: 'v-key-39',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '0b296762cbf84cb7b5fedefce0467834',
                            value: true,
                        },
                    ],
                    _id: '06e62c826deb48ceb51b4df81025461c',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '0b296762cbf84cb7b5fedefce0467834',
                            value: false,
                        },
                    ],
                    _id: 'f3a66e2732ff4fdd8a137c249521c499',
                },
            ],
            configuration: {
                _id: '6ca626e5de794660995edce413b0c029',
                targets: [
                    {
                        _audience: {
                            _id: 'e87a1e666c25485099c1efb2b1e653b9',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_f5c8e4b2-8838-4f70-8724-ea2766485ed4',
                                            'user_3543a452-296d-40a0-ae93-008583048f32',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '06e62c826deb48ceb51b4df81025461c',
                                percentage: 1,
                            },
                        ],
                        _id: '12d666859e0648079391447eba9ab273',
                    },
                    {
                        _audience: {
                            _id: 'c26315475cc5475f902f6e81c8b0079b',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'f3a66e2732ff4fdd8a137c249521c499',
                                percentage: 1,
                            },
                        ],
                        _id: '80008ed309de4977ad46bb0ea2b29119',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'fe9b45f8730d411a8e3e73a04111ba4f',
            key: 'v-key-23',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '5f21eead3180485e906a7f890a823a4a',
                            value: true,
                        },
                    ],
                    _id: '9bd7614df82049818bfebde56b8ce17d',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '5f21eead3180485e906a7f890a823a4a',
                            value: false,
                        },
                    ],
                    _id: 'b745e9fbe83c4554a2161dbeb24f933e',
                },
            ],
            configuration: {
                _id: '3ee19f1310234a56a1ad1df7cfcc12b8',
                targets: [
                    {
                        _audience: {
                            _id: 'f7e8962cfea34dc8ac1a241a82efc3d1',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9bd7614df82049818bfebde56b8ce17d',
                                percentage: 1,
                            },
                        ],
                        _id: 'ffa8852bebed4ec7bd9dd665fa778fc4',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '46c1012ddb224cf38fe17b0dbbca6549',
            key: 'v-key-59',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '6951341207c14a2bb62940bcffbc6da6',
                            value: true,
                        },
                    ],
                    _id: '140ff09a183d472693f6be7482775906',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '6951341207c14a2bb62940bcffbc6da6',
                            value: false,
                        },
                    ],
                    _id: 'cff347b6713e4d76859fe34ee1549248',
                },
            ],
            configuration: {
                _id: 'ef164163f98e41b0aa5e2c121c30d389',
                targets: [
                    {
                        _audience: {
                            _id: '4985b353e95040b5b0274396110c0cd2',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '140ff09a183d472693f6be7482775906',
                                percentage: 1,
                            },
                        ],
                        _id: '2bb17fd3255f4e0c8ef5a197ba6535a8',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '1d6227b48f244d629c521256335593f4',
            key: 'v-key-6',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '3a85728d85fa430cbc6f8cfbc8b46451',
                            value: true,
                        },
                    ],
                    _id: '2deb07a6381a460380474a2fcd0fb0a1',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '3a85728d85fa430cbc6f8cfbc8b46451',
                            value: false,
                        },
                    ],
                    _id: 'f9a3b99ff3bc44b0a7580855e19ff7ce',
                },
            ],
            configuration: {
                _id: '63963b9465214374a4d6bc69bca01d9f',
                targets: [
                    {
                        _audience: {
                            _id: '10e753215ab340798a123c7e9012a8b7',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2deb07a6381a460380474a2fcd0fb0a1',
                                percentage: 1,
                            },
                        ],
                        _id: '158bd89604fe4458bfcb3b5ad00a3faa',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'a1a5e7d97dda42f6b6a64e30d6490803',
            key: 'v-key-34',
            type: FeatureType.release,
            variations: [
                {
                    key: 'custom-variation-9',
                    name: 'custom-variation-9',
                    variables: [
                        {
                            _var: 'f2a8f035eb7748b98c1693304bb01fc6',
                            value: 4,
                        },
                    ],
                    _id: '792b62f60a884241a488e8e5e574a5da',
                },
                {
                    key: 'custom-variation-12',
                    name: 'Custom Variation 12',
                    variables: [
                        {
                            _var: 'f2a8f035eb7748b98c1693304bb01fc6',
                            value: 8,
                        },
                    ],
                    _id: '9b2722d16eb04fd6bafc4b1a2fd99c91',
                },
                {
                    key: 'custom-variation-13',
                    name: 'Custom Variation 13',
                    variables: [
                        {
                            _var: 'f2a8f035eb7748b98c1693304bb01fc6',
                            value: 12,
                        },
                    ],
                    _id: '518466b56e374138b6de4aef634f303b',
                },
                {
                    key: 'custom-variation-14',
                    name: 'Custom Variation 14',
                    variables: [
                        {
                            _var: 'f2a8f035eb7748b98c1693304bb01fc6',
                            value: 30,
                        },
                    ],
                    _id: 'a63810254956486f934f9fcd384cfcd1',
                },
            ],
            configuration: {
                _id: '8cf5536502b147c2901831b80f3b18c1',
                targets: [
                    {
                        _audience: {
                            _id: 'd61fb843a3144f9cbf90a6ba2caa3d67',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            '929a3f351a6249c68ca17133ab661ca7',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a63810254956486f934f9fcd384cfcd1',
                                percentage: 1,
                            },
                        ],
                        _id: '24d5dbb65ebe43bd868739ffd55e2782',
                    },
                    {
                        _audience: {
                            _id: 'b078a17afa1c44f1825d5a0f842b208a',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-11',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'uE5OJ7NUmPbH',
                                            'user_59b59200-30e7-4704-be28-64687b2eb4f1',
                                            'user_ce5bf1e9-206e-4907-8e6a-55661ece0cb1',
                                            'user_8969e295-4b65-47e4-bfdb-19fefae1f1c6',
                                            'user_1d1e0200-dfe1-4299-82c0-ea3896f2be1c',
                                            'J5ZajKIbckvK',
                                            'user_cfb38a17-c1fd-43a7-afe2-2e5e8a2b2598',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a63810254956486f934f9fcd384cfcd1',
                                percentage: 1,
                            },
                        ],
                        _id: 'cf710f4ccb6343a0988c7516522c836b',
                    },
                    {
                        _audience: {
                            _id: '48b8c7dfc1a14320854ac7d01f9124fc',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '518466b56e374138b6de4aef634f303b',
                                percentage: 1,
                            },
                        ],
                        _id: '2fa9bfaa507349b68abad83f62d5c9f3',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'e6b49849a4dd46dd836836b30f3185f0',
            key: 'v-key-85',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '5bc4c6ac17024d63bcb69e723db87c35',
                            value: true,
                        },
                    ],
                    _id: 'd1d5352eaa0e44f98215c000c0b93fa3',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '5bc4c6ac17024d63bcb69e723db87c35',
                            value: false,
                        },
                    ],
                    _id: '27de0bc5faf04a92b9d7c3a993ffeb50',
                },
            ],
            configuration: {
                _id: '527b82cc2165448587b70e173b4d6625',
                targets: [
                    {
                        _audience: {
                            _id: '3668e72744d14fa89d5c4a278a318164',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'd1d5352eaa0e44f98215c000c0b93fa3',
                                percentage: 1,
                            },
                        ],
                        _id: '1b072005d32149158383e468ec0ab555',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '6f94855fdde840f99b2b7fa894fddc47',
            key: 'v-key-72',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'e5ad1e1f94714c359ae1fe1518c9a040',
                            value: true,
                        },
                    ],
                    _id: 'a0ea2de485af416e9bcbfe21a49cbcee',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'e5ad1e1f94714c359ae1fe1518c9a040',
                            value: false,
                        },
                    ],
                    _id: 'd5a7b94ad94b45a199cf730a08c5266e',
                },
            ],
            configuration: {
                _id: '44be24cae6344178b72230fe90f5f39f',
                targets: [
                    {
                        _audience: {
                            _id: 'cc58909c282148a8af386bcc8ac6068b',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'd5a7b94ad94b45a199cf730a08c5266e',
                                percentage: 1,
                            },
                        ],
                        _id: 'd3db79b0312c45df897317dfc238ff50',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'aa7aed5c5fc54beaae86daf6182de370',
            key: 'v-key-45',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '8e2af859c11348b9a90ffdb620e9111a',
                            value: true,
                        },
                    ],
                    _id: 'cd65468f8fd34dc0a37b91d97bf87fa0',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '8e2af859c11348b9a90ffdb620e9111a',
                            value: false,
                        },
                    ],
                    _id: 'c4eb7261709346e39821c4a45e4acf54',
                },
            ],
            configuration: {
                _id: '612e380984a242919cc8516d8f81eeed',
                targets: [
                    {
                        _audience: {
                            _id: 'c838c6210cec4070a83317a40b121e4f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'cd65468f8fd34dc0a37b91d97bf87fa0',
                                percentage: 1,
                            },
                        ],
                        _id: 'a5ad8045ccbf467d8beb35415251614c',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'cecdaf3f6db84d9da84ca6a5775bea1c',
            key: 'v-key-66',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '109f4134efc64f8b83f5a22e0c4636bc',
                            value: true,
                        },
                    ],
                    _id: 'bf3ff9bcbd3f4c33b108c4cf0b70d230',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '109f4134efc64f8b83f5a22e0c4636bc',
                            value: false,
                        },
                    ],
                    _id: '432228dc29894897a860e088e87a8daa',
                },
            ],
            configuration: {
                _id: '47318287ef7f4e84a65920d0a2c663d9',
                targets: [
                    {
                        _audience: {
                            _id: '9b3e6be5758f4c29bc35e8fbb4ca6a84',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-12',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['UcPbSGx0qXYh'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'bf3ff9bcbd3f4c33b108c4cf0b70d230',
                                percentage: 1,
                            },
                        ],
                        _id: 'ffb51e09de1f48dd8dac96b1f65fd964',
                    },
                    {
                        _audience: {
                            _id: 'b519fdeced23495aa686f574dd153f46',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            '7db4d6f7e53543e4a413ac539477bac6',
                                            '145f66b2bfce4e7e9c8bd3a432e28c8d',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'bf3ff9bcbd3f4c33b108c4cf0b70d230',
                                percentage: 1,
                            },
                        ],
                        _id: 'b0afc0b564fe44d9accfba1d469f9b37',
                    },
                    {
                        _audience: {
                            _id: '67c4c25793c243829a3001d786b0f3ac',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'bf3ff9bcbd3f4c33b108c4cf0b70d230',
                                percentage: 0,
                            },
                            {
                                _variation: '432228dc29894897a860e088e87a8daa',
                                percentage: 1,
                            },
                        ],
                        _id: '52af8b12faa04c249f07a27dc7753b76',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'c2dbde9797d74836b3d347ff342cc4bf',
            key: 'v-key-43',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'cd127c5e6d3e43c1b503a2943b537c41',
                            value: 100,
                        },
                    ],
                    _id: '323338f8865e4934820999542a9a65ad',
                },
                {
                    key: 'custom-variation-9',
                    name: 'custom-variation-9',
                    variables: [
                        {
                            _var: 'cd127c5e6d3e43c1b503a2943b537c41',
                            value: 5,
                        },
                    ],
                    _id: '976eedb493374f409b42c33c3d2706cd',
                },
            ],
            configuration: {
                _id: 'bdfb26b9bf164e11bd322533fd358d9c',
                targets: [
                    {
                        _audience: {
                            _id: 'd7a65a139e104246b9b70fd2a79f96bf',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '976eedb493374f409b42c33c3d2706cd',
                                percentage: 1,
                            },
                        ],
                        _id: 'acdfab7b7e534106b9e30e2b2ee660bf',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'b630db97fe234a6280f3ad7a28eef7bf',
            key: 'v-key-5',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'b86026dbdea34ec09ef4adfc9734a4dc',
                            value: true,
                        },
                    ],
                    _id: 'becc9f3b937a4048831d692506850286',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'b86026dbdea34ec09ef4adfc9734a4dc',
                            value: false,
                        },
                    ],
                    _id: '45863183bbda47ec80273e40d0f9d795',
                },
            ],
            configuration: {
                _id: '656941e1ebc2497dae04c2d1a1065e64',
                targets: [
                    {
                        _audience: {
                            _id: 'a4f265695aee4ceda600f6f6bf8e9436',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            '7db4d6f7e53543e4a413ac539477bac6',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['contain'],
                                        dataKey: 'data-key-12',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'WQwnaM2S2Cgi',
                                            'kWUlzefzlxTL',
                                            'PUPhcuf7xDxb',
                                            'fPqVEWRoorsO',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '45863183bbda47ec80273e40d0f9d795',
                                percentage: 1,
                            },
                        ],
                        _id: '83d3a0f7a6874c8e9746b4171ec6e353',
                    },
                    {
                        _audience: {
                            _id: 'c9a9f65a1791462a8f8d7aac6f7be87d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '45863183bbda47ec80273e40d0f9d795',
                                percentage: 1,
                            },
                        ],
                        _id: '64db83fb4e5c421f9e3c3aca026b1f92',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '88be649a5f564321acfa35b98049d8db',
            key: 'v-key-58',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'f593910949e2438dac5fd6dcf0d43912',
                            value: true,
                        },
                    ],
                    _id: '91f79898330c4f4e8c6acb50f10b3fb7',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'f593910949e2438dac5fd6dcf0d43912',
                            value: false,
                        },
                    ],
                    _id: '52ae92c4360146dd84be21192c9ddcda',
                },
            ],
            configuration: {
                _id: '959f0c90d81446c7a7275155afd10e6a',
                targets: [
                    {
                        _audience: {
                            _id: '792e4aab8f534309b425277c552f544f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '91f79898330c4f4e8c6acb50f10b3fb7',
                                percentage: 1,
                            },
                        ],
                        _id: 'ec33b0276aa9441992135a2c9f092d1d',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '56ba393d7ad04efe9b00fc200528ec8e',
            key: 'v-key-9',
            type: FeatureType.release,
            variations: [
                {
                    key: 'Custom Variation 16',
                    name: 'Custom Variation 16',
                    variables: [
                        {
                            _var: '8aa609cb010e46dcbaebdd14d319ce4a',
                            value: 'WeJfVe6Vz5zCWMWTIUzG',
                        },
                    ],
                    _id: '703f7830b7f14a45877861423e7fa62e',
                },
                {
                    key: 'custom-variation-17',
                    name: 'Custom Variation 17',
                    variables: [
                        {
                            _var: '8aa609cb010e46dcbaebdd14d319ce4a',
                            value: 'IW4tT4kePXxIJNpvNcCY',
                        },
                    ],
                    _id: '8331174065c9438baf48f26f1af7e186',
                },
                {
                    key: 'custom-variation-18',
                    name: 'Custom Variation 18',
                    variables: [
                        {
                            _var: '8aa609cb010e46dcbaebdd14d319ce4a',
                            value: 'W9ePPnBNmDXcGGCpiqgW',
                        },
                    ],
                    _id: 'bd6ab058d9114c399713d3f82308dec0',
                },
                {
                    key: 'custom-variation-19',
                    name: 'Custom Variation 19',
                    variables: [
                        {
                            _var: '8aa609cb010e46dcbaebdd14d319ce4a',
                            value: 'VEW8tUDnatw38XfBwl4P',
                        },
                    ],
                    _id: '85207fa1106e4873a1668584696c29fb',
                },
                {
                    key: 'custom-variation-20',
                    name: 'Custom Variation 20',
                    variables: [
                        {
                            _var: '8aa609cb010e46dcbaebdd14d319ce4a',
                            value: 'custom-variation-20',
                        },
                    ],
                    _id: '70649623e9444a678697345b17c6dfe0',
                },
            ],
            configuration: {
                _id: 'e28499451526480fb1b3802d16df21a7',
                targets: [
                    {
                        _audience: {
                            _id: '303bc2f474fa4c469d34f2fd1f33afa0',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-8',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['t2v2OAaQxGTl'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '703f7830b7f14a45877861423e7fa62e',
                                percentage: 1,
                            },
                        ],
                        _id: '2f862ef81be845ec97c41c13a8243713',
                    },
                    {
                        _audience: {
                            _id: '3699a9656b1443c987a054cadd0e1b4d',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.audienceMatch,
                                        comparator: FilterComparator['='],
                                        _audiences: [
                                            'a2a331f751914200a8a53b59ae6b7a6f',
                                            '145f66b2bfce4e7e9c8bd3a432e28c8d',
                                        ],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '703f7830b7f14a45877861423e7fa62e',
                                percentage: 0,
                            },
                            {
                                _variation: '8331174065c9438baf48f26f1af7e186',
                                percentage: 0.2,
                            },
                            {
                                _variation: 'bd6ab058d9114c399713d3f82308dec0',
                                percentage: 0,
                            },
                            {
                                _variation: '85207fa1106e4873a1668584696c29fb',
                                percentage: 0,
                            },
                            {
                                _variation: '70649623e9444a678697345b17c6dfe0',
                                percentage: 0.8,
                            },
                        ],
                        _id: '1e6f94546e2141f181f1ee3d45e8819c',
                    },
                    {
                        _audience: {
                            _id: '42a36354d60a4e9fa0284d7775ece0bf',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-12',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'Sr655QAjskJ0',
                                            'TK7XylgWPgzy',
                                            'HovXDvbpQu5N',
                                            'MWnV7fkkHmC3',
                                            'zIdvHkN4xvqr',
                                            'Y7yry5vS4nXj',
                                            'Ymv6iOZAepXI',
                                            'mLWcjAEPxLws',
                                            'iLVPdIuG1GLu',
                                            'VWQSC29u3yu7',
                                            'bdYcHzCyXXcf',
                                            'azllOS9W3Psd',
                                            'GcwOIguuYF3o',
                                            'zxABYtSFjOXU',
                                            'Je9pw6hBNrSC',
                                            'bfQ0ZX114dDi',
                                            'pLQ9uxbu7b1O',
                                            '6Ip3ueSPJJxG',
                                            'HQPBsBoPs8xO',
                                            'GyDInXfSo8dU',
                                            'lno1v6QhO6mr',
                                            'CgC829DMYgqt',
                                            'yasedCiLN2XX',
                                            'APCl8ytXa3T7',
                                            'LqKyszA5KfaW',
                                            '3fDlN5ASOy83',
                                            'PvrC6z7PUH5x',
                                            'f6t0j4h3EHnZ',
                                            'Gqphwd1ENbBn',
                                            '0RIEgzCPPwmR',
                                            '5p67UVicB7ML',
                                            'pkTrAZG78MJA',
                                            'nk0LAgzTn08t',
                                            'YuAld6zUYXwf',
                                            'em1MVQjkTEIw',
                                            'wQxpBNbi3CPZ',
                                            'sJtWUlBBdmUl',
                                            'Ca92yzwNGem9',
                                            'OrcFZfSb0ljp',
                                            'WR6CQFERMM1g',
                                            'I8sPKw7vXgEi',
                                            'lifvCcF7Jc6o',
                                            'fF94mZEYtrI4',
                                            'a7eDCwvB4FnT',
                                            'nYPHA0mhw34k',
                                            'M293B3VTf1UO',
                                            '9Z7t1ZgE0GoS',
                                            'n39vTi02V6N8',
                                            'ZMvZTcIezl3O',
                                            'IOkrWBYkxaWV',
                                            'v8ODdsr4YQa3',
                                            'yeoPfZTo01Fn',
                                            'b2KqhdeSgz3X',
                                            '3agFvO8kRWOV',
                                            '2DFa7ZU6IPDG',
                                            '63snZhbujYR6',
                                            'gOi4hPEIfVRy',
                                            'NIzseDj8kuRV',
                                            'EFUw93zSTkm2',
                                            '6cCifOt5blfy',
                                            'ovRMgaimyK6C',
                                            'unYwbmFLbctm',
                                            'aVZIkq9aIBMQ',
                                            'wTEnDuHSBTlC',
                                            'mgO5us0VYv2R',
                                            'gfvtTjxyHzOd',
                                            'd1shUFe4IyDv',
                                            'XUZQGyQ0TdAs',
                                            'grTWS0H24g2B',
                                            'b7UlgRXInBc9',
                                            '8VKTUEbK0kj4',
                                            '8ttojewIvt29',
                                            'RGkcHpDiNQoN',
                                            'qfWvu3tF56aN',
                                            'nFUtkBdkNUun',
                                            'KJvZMN3OVImI',
                                            '1N2E6IWTkhN1',
                                            '8Bi5TcokMKnz',
                                            'D6F324Z8Wgsv',
                                            '0HlJPpAi9S7A',
                                            '8GMCyxR2Qwdq',
                                            'FBWFdPGcHGzD',
                                            'EvutKc2tCfK7',
                                            'DzZRNEkn852N',
                                            'TfQ5iSMasNxU',
                                            '9vgEittrLSwH',
                                            'on3vv9CPoOKw',
                                            'yVKsVsOYGJQq',
                                            'c54Uql9Cz882',
                                            '8Lh8qwfEj1Lt',
                                            'olueHrfVeBOT',
                                            'Ksrb97m4hQtf',
                                            'KgUUM9k5Kzua',
                                            'U9tcFI1kHZaE',
                                            'y9JiQvqFpszR',
                                            'K9V14g7hPxIM',
                                            'ExqNBbL3Nzl3',
                                            'WSvLeWzTmNYg',
                                            'IOxdHtG0QzrP',
                                            'C5E20tSCZiGF',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '703f7830b7f14a45877861423e7fa62e',
                                percentage: 0,
                            },
                            {
                                _variation: '8331174065c9438baf48f26f1af7e186',
                                percentage: 0.2,
                            },
                            {
                                _variation: 'bd6ab058d9114c399713d3f82308dec0',
                                percentage: 0,
                            },
                            {
                                _variation: '85207fa1106e4873a1668584696c29fb',
                                percentage: 0,
                            },
                            {
                                _variation: '70649623e9444a678697345b17c6dfe0',
                                percentage: 0.8,
                            },
                        ],
                        _id: '683f90ad71a4485286f8a267c2393e7e',
                    },
                    {
                        _audience: {
                            _id: '107a31a203734bbfa7365158d0c54f84',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '703f7830b7f14a45877861423e7fa62e',
                                percentage: 1,
                            },
                        ],
                        _id: 'b1e856b964dd4f67adc9180454a2b5ce',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'dc913cc3bbcc4ed89b28f862fa9e406b',
            key: 'v-key-3',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '46c5fa9a964b463da03e97cfbe1be8be',
                            value: 'user_3543a452-296d-40a0-ae93-008583048f32',
                        },
                    ],
                    _id: '35e601e0781e4df3bf26a3dbc5984a77',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '46c5fa9a964b463da03e97cfbe1be8be',
                            value: 'user_f5c8e4b2-8838-4f70-8724-ea2766485ed4',
                        },
                    ],
                    _id: '0c0fed75aee34433b5a89d12054b8f7e',
                },
            ],
            configuration: {
                _id: '66ec35f798274696b60a048813235d8d',
                targets: [
                    {
                        _audience: {
                            _id: '9f855b6b9d78494a996351522278748b',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_d4890258-c74a-47cb-95e7-e06e1bf37eec',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '35e601e0781e4df3bf26a3dbc5984a77',
                                percentage: 1,
                            },
                        ],
                        _id: 'fb2d8e7dd6854cada603f03d4b92f438',
                    },
                    {
                        _audience: {
                            _id: 'c686ef53055c44068e149c1e88f83322',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '35e601e0781e4df3bf26a3dbc5984a77',
                                percentage: 1,
                            },
                        ],
                        _id: '0ae52bb8d7404bf8b75b5f24c062ff17',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '7ba41ece0e68430ebb4dbdffeaf99640',
            key: 'v-key-41',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '70f1fb33230944b28f08b333a761b345',
                            value: true,
                        },
                    ],
                    _id: '698cf2cf2e444cf59a20af9851301eb1',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '70f1fb33230944b28f08b333a761b345',
                            value: false,
                        },
                    ],
                    _id: 'ab67c45969f2449a8557788e959f56b2',
                },
            ],
            configuration: {
                _id: '0b105d1aa6734348b44ce95a0795e9fe',
                targets: [
                    {
                        _audience: {
                            _id: '24b6625c22674a63bd39adc41b839057',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '698cf2cf2e444cf59a20af9851301eb1',
                                percentage: 1,
                            },
                        ],
                        _id: '2fb2692d61a247fd81e624de3f261180',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'da94d550950649be9d46f8d132e03a15',
            key: 'v-key-42',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'fd121aea5b22424688750cb224709ed7',
                            value: true,
                        },
                    ],
                    _id: '5bad48d241524687954bd207e3c3d0be',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'fd121aea5b22424688750cb224709ed7',
                            value: false,
                        },
                    ],
                    _id: '7ed9456c80774d7fbd0cb70b85e3d8fc',
                },
            ],
            configuration: {
                _id: 'a2ac8ba442124b94b76f0ef501b8d1c1',
                targets: [
                    {
                        _audience: {
                            _id: 'b9c7a95e742145df8e4e8482d9424fb7',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: [
                                            'iYI6uwZed0ip',
                                            'QqDKIhOwJqGz',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '5bad48d241524687954bd207e3c3d0be',
                                percentage: 1,
                            },
                        ],
                        _id: 'b4b152013dbd4c95adcf9eabf2ddd3b6',
                    },
                    {
                        _audience: {
                            _id: '60bb165be5194d59bc749a66ef42ad31',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.customData,
                                        comparator: FilterComparator['='],
                                        dataKey: 'data-key-6',
                                        dataKeyType: DataKeyType.string,
                                        _audiences: [],
                                        values: ['h6fCse1VCIo1'],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '5bad48d241524687954bd207e3c3d0be',
                                percentage: 1,
                            },
                        ],
                        _id: 'e3389acd59954f258f833bb6cf3db8b2',
                    },
                    {
                        _audience: {
                            _id: '0ea6101bdecd41b48e94b49ee4c96b9f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '7ed9456c80774d7fbd0cb70b85e3d8fc',
                                percentage: 1,
                            },
                        ],
                        _id: 'a4981cc897e542289061836a07ef6842',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '7dc85a8c34e14e3e9a40d1aa66e14370',
            key: 'v-key-8',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '11cd6e9c3e604ee787b5bbdb1eb15ff4',
                            value: 10,
                        },
                    ],
                    _id: '0d39bf2f1c8b4deb9f9701a65e8d9f52',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '11cd6e9c3e604ee787b5bbdb1eb15ff4',
                            value: 50,
                        },
                    ],
                    _id: '95dec37ae2bb4b3780422ef60398b988',
                },
                {
                    key: 'variation-3',
                    name: 'Variation 3',
                    variables: [
                        {
                            _var: '11cd6e9c3e604ee787b5bbdb1eb15ff4',
                            value: 1,
                        },
                    ],
                    _id: '3119397f78194fb1abc63d727a9d29a3',
                },
            ],
            configuration: {
                _id: '33a91ff2367547c285c4d7c6dfd82954',
                targets: [
                    {
                        _audience: {
                            _id: 'd2daf067666e446e885e34ec2ac9d568',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '3119397f78194fb1abc63d727a9d29a3',
                                percentage: 1,
                            },
                        ],
                        _id: 'fb46297644304eb6962964b7899d9ee6',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '1a5969cca89e4f3dbf9afd73ee76e5f9',
            key: 'v-key-10',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '77c6940f85ae48119b0317b98e7fd92b',
                            value: 100,
                        },
                    ],
                    _id: 'f122373d4f704ad89670c627b32997c9',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '77c6940f85ae48119b0317b98e7fd92b',
                            value: 250,
                        },
                    ],
                    _id: '1e6fedaaacf84512b7b1ae8a8d18ad48',
                },
            ],
            configuration: {
                _id: 'ff024242e89040a0a56d8ddbbbfdbcbb',
                targets: [
                    {
                        _audience: {
                            _id: '0cfd54913bac45d3b77dc35d43f2a405',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '1e6fedaaacf84512b7b1ae8a8d18ad48',
                                percentage: 1,
                            },
                        ],
                        _id: '8184acf84cb7469e9ec99055daccede9',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '15707ba401f8403c95fec7f7be771fc4',
            key: 'v-key-28',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '8a07b060a32c4e26acc0d04da832001f',
                            value: true,
                        },
                    ],
                    _id: 'b78767dab19d454994ff3b5a3169dc61',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '8a07b060a32c4e26acc0d04da832001f',
                            value: false,
                        },
                    ],
                    _id: '11ea67bc7e3c4c3e948d19a9294e39bc',
                },
            ],
            configuration: {
                _id: '335d1d7cdd1a4ad9bd7ff87cdd163843',
                targets: [
                    {
                        _audience: {
                            _id: 'efe425ffdfd74581b1706df7ebf4242e',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_8767c5da-48d9-4b62-9645-c6bda3ff013b',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '11ea67bc7e3c4c3e948d19a9294e39bc',
                                percentage: 1,
                            },
                        ],
                        _id: 'd1d301b5be55451bb7f3f906cfe91f2e',
                    },
                    {
                        _audience: {
                            _id: 'af2ed196f7864cf1ac305c05e0c06eac',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'b78767dab19d454994ff3b5a3169dc61',
                                percentage: 1,
                            },
                        ],
                        _id: '2213615152e24bd591a7a85623f49e3c',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '969e5412f49f498c9e0b436dc5d3ff07',
            key: 'v-key-50',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'a5a16cacfc71462e9184b1b1c252283e',
                            value: true,
                        },
                    ],
                    _id: '83c4733e02454397a5a5fb255efaeba1',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'a5a16cacfc71462e9184b1b1c252283e',
                            value: false,
                        },
                    ],
                    _id: 'acdeed83b1704d1784728370d19ceef4',
                },
            ],
            configuration: {
                _id: '234f32d9387146cf9e458da9e986ddd5',
                targets: [
                    {
                        _audience: {
                            _id: 'df257f92e49d46d0893dfc18f529f301',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_431a7ba3-32a2-40e8-ac42-ed2934422a5b',
                                            'user_5f4514a0-7267-4144-9d90-35537a934c9b',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '83c4733e02454397a5a5fb255efaeba1',
                                percentage: 1,
                            },
                        ],
                        _id: '7985c35d750349768ef4e6ac80be51d1',
                    },
                    {
                        _audience: {
                            _id: 'acfb7afaee414679be252648753efcfe',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'acdeed83b1704d1784728370d19ceef4',
                                percentage: 1,
                            },
                        ],
                        _id: '602725d00de645409a85292e8bbafb4f',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '90d0c0a3cf7e46928c5b5f9b6d5e3d95',
            key: 'v-key-11',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'c21628fe66834e1a97048e904a85cd87',
                            value: true,
                        },
                    ],
                    _id: '16a511e998214d739505a16153547a01',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'c21628fe66834e1a97048e904a85cd87',
                            value: false,
                        },
                    ],
                    _id: 'a77c027f8cd34088878b7713f20ac22c',
                },
            ],
            configuration: {
                _id: '913738e3b83c4cca94a1db0aede3ae5f',
                targets: [
                    {
                        _audience: {
                            _id: 'ffc6fdd57e2a4542ac7eb4e405a20778',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '16a511e998214d739505a16153547a01',
                                percentage: 1,
                            },
                        ],
                        _id: 'f35173f38ff5451c854b7ca2bac74db8',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '2bf49ec8a49c4a02a85dbc09ee5e57cd',
            key: 'v-key-7',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '49b2bb0ba51541b693a3921a1b0bc09f',
                            value: true,
                        },
                    ],
                    _id: '2354e54c179241699bfe858ee41ca0d7',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '49b2bb0ba51541b693a3921a1b0bc09f',
                            value: false,
                        },
                    ],
                    _id: '2c9fdea419c141b395db23e8c235b778',
                },
            ],
            configuration: {
                _id: 'a8658a5339174303a8bd58a3d252f31d',
                targets: [
                    {
                        _audience: {
                            _id: '9e4322ee3ed64dc0ae6f940807e26e7f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2354e54c179241699bfe858ee41ca0d7',
                                percentage: 1,
                            },
                        ],
                        _id: 'de2714272c6147258bf1ed1e24a54c00',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'e21fcbcbed0c422c8200392dd15965cf',
            key: 'v-key-55',
            type: FeatureType.release,
            variations: [
                {
                    key: 'custom-variation-9',
                    name: 'custom-variation-9',
                    variables: [
                        {
                            _var: '4498aeafc1a44e5f8b66523f0b61cd2c',
                            value: 1000,
                        },
                    ],
                    _id: 'f1298758f82a4b36bb7ff1932755521f',
                },
                {
                    key: 'custom-variation-22',
                    name: 'Custom Variation 22',
                    variables: [
                        {
                            _var: '4498aeafc1a44e5f8b66523f0b61cd2c',
                            value: 1500,
                        },
                    ],
                    _id: '1d508ffcdb4e463994e65eac9e03f848',
                },
            ],
            configuration: {
                _id: 'c87387b3c0474a89932b0188042ef6d3',
                targets: [
                    {
                        _audience: {
                            _id: 'aea463e44e3548f6bd9cbeef7cfa5607',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '1d508ffcdb4e463994e65eac9e03f848',
                                percentage: 1,
                            },
                        ],
                        _id: '40f0e076b716425da3ee64e2b6096bb5',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '5bcc2b767b3c48d780fc380df5641b9a',
            key: 'v-key-31',
            type: FeatureType.release,
            variations: [
                {
                    key: 'custom-variation-23',
                    name: 'Custom Variation 23',
                    variables: [
                        {
                            _var: '0b3990b60cf34ee980b423a633c5210c',
                            value: 5,
                        },
                    ],
                    _id: '73aa7f83d1aa4bd8a8bcd8924f6584f9',
                },
                {
                    key: 'custom-variation-24',
                    name: 'Custom Variation 24',
                    variables: [
                        {
                            _var: '0b3990b60cf34ee980b423a633c5210c',
                            value: 30,
                        },
                    ],
                    _id: 'a83a62d52d4e41c8a11a0a5b899b9b0a',
                },
            ],
            configuration: {
                _id: '3b427eb62aa542e19601aff7f3a421ba',
                targets: [
                    {
                        _audience: {
                            _id: 'd1d607811dbe4adb86ef70c47822028a',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a83a62d52d4e41c8a11a0a5b899b9b0a',
                                percentage: 1,
                            },
                        ],
                        _id: 'c2b53c76b37846e0aa559a54160fcd5f',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '1b9f59cdbc034b67af4b8bb4ad6ac873',
            key: 'v-key-19',
            type: FeatureType.release,
            variations: [
                {
                    key: 'production',
                    name: 'production',
                    variables: [
                        {
                            _var: '3e25826ff35e4dd28ae11521e9f823a3',
                            value: 'ZvpbseiiRk9TeJtUpZj7',
                        },
                    ],
                    _id: 'f2e73bec1d19478c87962569aaaa60ea',
                },
                {
                    key: 'Custom Variation 25',
                    name: 'Custom Variation 25',
                    variables: [
                        {
                            _var: '3e25826ff35e4dd28ae11521e9f823a3',
                            value: 'btMZP0APMsxyIsjxVrGD',
                        },
                    ],
                    _id: '9eb71782af7b43629af46fb9dd505f2e',
                },
            ],
            configuration: {
                _id: 'f7fffb9a6e084c6fb07cb10763cac7e0',
                targets: [
                    {
                        _audience: {
                            _id: 'b3e1b373fafd4e50aeb62da7c0046a41',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '9eb71782af7b43629af46fb9dd505f2e',
                                percentage: 1,
                            },
                        ],
                        _id: '47653fef2de541a095f504d23351357c',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'd47f7d1219af404793c6f0bf4b0d69e0',
            key: 'v-key-33',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'd9d3828077474b999c075e2a3e5e968e',
                            value: true,
                        },
                    ],
                    _id: '331d8667765e4068a06bd75a196190ac',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'd9d3828077474b999c075e2a3e5e968e',
                            value: false,
                        },
                    ],
                    _id: '2795dbcab135480b8d62dd0bf8e72e49',
                },
            ],
            configuration: {
                _id: '7a4d93daa849414ebd2dc947f20c4836',
                targets: [
                    {
                        _audience: {
                            _id: '2dbcfd5d2a404d109fbeecd5a7fa18b6',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_745163fe-e68f-4b39-af9a-d3a45ef19f8a',
                                            'user_0caee81d-e833-4d54-832d-5a292f54617b',
                                            'user_65925ea3-dc52-4ee0-8171-203caa34652f',
                                            'user_fc288248-aaae-4032-b6a2-6ee5142337e0',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '331d8667765e4068a06bd75a196190ac',
                                percentage: 1,
                            },
                        ],
                        _id: '3d3a9b504718424b96f877cc489f2152',
                    },
                    {
                        _audience: {
                            _id: '4e1df9088d94403cad7b480a58819446',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_ab1e90d1-07c0-48c6-9994-6e19538c7c1d',
                                            'user_6d749e93-9f14-41a6-93d9-e98de5e17c14',
                                            'user_6fe82f42-d041-41a0-a525-380dcbee30d8',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2795dbcab135480b8d62dd0bf8e72e49',
                                percentage: 1,
                            },
                        ],
                        _id: 'ff55f99b85f243f4afbf35598968500d',
                    },
                    {
                        _audience: {
                            _id: '093993ed2d864c418089f0be644b58a3',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '2795dbcab135480b8d62dd0bf8e72e49',
                                percentage: 1,
                            },
                        ],
                        _id: '50af1bee1c8b422db6b9619aaacab5c5',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '6ddad376c4314a38b485d7e60f85067f',
            key: 'v-key-2',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: 'd79206e8247e409e9749ad77057c4390',
                            value: true,
                        },
                    ],
                    _id: 'a4d7973327b54b5ba07239e8d6072e48',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: 'd79206e8247e409e9749ad77057c4390',
                            value: false,
                        },
                    ],
                    _id: '3a57c08d0c2c4124ab3e20171801c168',
                },
            ],
            configuration: {
                _id: 'ee9a2fc652984c35880dfade59c1d744',
                targets: [
                    {
                        _audience: {
                            _id: 'ffbae8928fed496fb643f95c64df309c',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_8a6015f1-5b84-406e-ad04-8556709f4d2a',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'a4d7973327b54b5ba07239e8d6072e48',
                                percentage: 1,
                            },
                        ],
                        _id: '2456e572ef6a4daea03a4d8607f75d4a',
                    },
                    {
                        _audience: {
                            _id: '222ae598a6a5496d8d5a877f72cf0ccc',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '3a57c08d0c2c4124ab3e20171801c168',
                                percentage: 1,
                            },
                        ],
                        _id: 'efb3e38e9d7f4072bc7397d9520219f6',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '34f2429ea6a6424e88a67edd9faf4999',
            key: 'v-key-32',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '320e995007a24995b2589362f8b03cae',
                            value: true,
                        },
                    ],
                    _id: '900bec79299e4a409dd497b262214b93',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '320e995007a24995b2589362f8b03cae',
                            value: false,
                        },
                    ],
                    _id: 'c526808e64e14ab8b3baa37c5db5eaa8',
                },
            ],
            configuration: {
                _id: '70678cd0412e4d279596796d343dead5',
                targets: [
                    {
                        _audience: {
                            _id: '204781dbaeb8467a9f220dddd90dbefb',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_745163fe-e68f-4b39-af9a-d3a45ef19f8a',
                                            'user_ab1e90d1-07c0-48c6-9994-6e19538c7c1d',
                                            'user_0caee81d-e833-4d54-832d-5a292f54617b',
                                            'user_65925ea3-dc52-4ee0-8171-203caa34652f',
                                            'user_fc288248-aaae-4032-b6a2-6ee5142337e0',
                                            'user_6d749e93-9f14-41a6-93d9-e98de5e17c14',
                                            'user_6fe82f42-d041-41a0-a525-380dcbee30d8',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c526808e64e14ab8b3baa37c5db5eaa8',
                                percentage: 1,
                            },
                        ],
                        _id: 'cedaaca8decd4eef864ecb940b074983',
                    },
                    {
                        _audience: {
                            _id: 'd2c3fca26ed547c9938f96f48880aaa4',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: 'c526808e64e14ab8b3baa37c5db5eaa8',
                                percentage: 1,
                            },
                        ],
                        _id: '7dbb50feae384f1185bc8d0248e4cb96',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: 'bca09157d4844297b40015f4a2ce7f0d',
            key: 'v-key-51',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-1',
                    name: 'Variation 1',
                    variables: [
                        {
                            _var: '0f648861e13e4d2eb6fb4aa8b1595402',
                            value: true,
                        },
                    ],
                    _id: '6c967237f7e64f39b14acd7ab089ebcc',
                },
                {
                    key: 'variation-2',
                    name: 'Variation 2',
                    variables: [
                        {
                            _var: '0f648861e13e4d2eb6fb4aa8b1595402',
                            value: false,
                        },
                    ],
                    _id: '852a082a70f24477b54fd84de74b1ddb',
                },
            ],
            configuration: {
                _id: '4315e371c59e468889410f9296411e66',
                targets: [
                    {
                        _audience: {
                            _id: '8e1d21145f4747d991a44723827787ce',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.user,
                                        subType: UserSubType.user_id,
                                        comparator: FilterComparator['='],
                                        _audiences: [],
                                        values: [
                                            'user_431a7ba3-32a2-40e8-ac42-ed2934422a5b',
                                            'user_5f4514a0-7267-4144-9d90-35537a934c9b',
                                        ],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '6c967237f7e64f39b14acd7ab089ebcc',
                                percentage: 1,
                            },
                        ],
                        _id: 'bae7d666732147d49d7b3832fdd30b71',
                    },
                    {
                        _audience: {
                            _id: 'c8c776b6a2aa4f69a32c4616cd980dae',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '852a082a70f24477b54fd84de74b1ddb',
                                percentage: 1,
                            },
                        ],
                        _id: '948b5c1d17154c39bd40d9f38d1743f9',
                    },
                ],
                forcedUsers: {},
            },
        },
        {
            _id: '34a862d982dd44ed8f61bf5b81453734',
            key: 'v-key-4',
            type: FeatureType.release,
            variations: [
                {
                    key: 'variation-on',
                    name: 'Variation On',
                    variables: [
                        {
                            _var: '5594b6945cf2499a93f0626c5d82dcfd',
                            value: 50,
                        },
                    ],
                    _id: '71bd3434b2d2499cb87f106dade10078',
                },
                {
                    key: 'variation-off',
                    name: 'Variation Off',
                    variables: [
                        {
                            _var: '5594b6945cf2499a93f0626c5d82dcfd',
                            value: 100,
                        },
                    ],
                    _id: '2ab3eb0658a547ffa3e55151f7c541b2',
                },
            ],
            configuration: {
                _id: 'b5591a7c938b48f297d37306bf665a9d',
                targets: [
                    {
                        _audience: {
                            _id: 'e709003cdc394a8c8f840a359dab237f',
                            filters: {
                                filters: [
                                    {
                                        type: FilterType.all,
                                        _audiences: [],
                                        values: [],
                                        filters: [],
                                    },
                                ],
                                operator: AudienceOperator.and,
                            },
                        },
                        distribution: [
                            {
                                _variation: '71bd3434b2d2499cb87f106dade10078',
                                percentage: 1,
                            },
                        ],
                        _id: '37a9ebaca42c47dda441e8ff6fd18fe0',
                    },
                ],
                forcedUsers: {},
            },
        },
    ],
    variables: [
        {
            _id: '438a470309594543a140ffe97d732edb',
            key: 'v-key-1',
            type: VariableType.boolean,
        },
        {
            _id: 'd79206e8247e409e9749ad77057c4390',
            key: 'v-key-2',
            type: VariableType.boolean,
        },
        {
            _id: '46c5fa9a964b463da03e97cfbe1be8be',
            key: 'v-key-3',
            type: VariableType.string,
        },
        {
            _id: '5594b6945cf2499a93f0626c5d82dcfd',
            key: 'v-key-4',
            type: VariableType.number,
        },
        {
            _id: 'b86026dbdea34ec09ef4adfc9734a4dc',
            key: 'v-key-5',
            type: VariableType.boolean,
        },
        {
            _id: '3a85728d85fa430cbc6f8cfbc8b46451',
            key: 'v-key-6',
            type: VariableType.boolean,
        },
        {
            _id: '49b2bb0ba51541b693a3921a1b0bc09f',
            key: 'v-key-7',
            type: VariableType.boolean,
        },
        {
            _id: '11cd6e9c3e604ee787b5bbdb1eb15ff4',
            key: 'v-key-8',
            type: VariableType.number,
        },
        {
            _id: '8aa609cb010e46dcbaebdd14d319ce4a',
            key: 'v-key-9',
            type: VariableType.string,
        },
        {
            _id: '77c6940f85ae48119b0317b98e7fd92b',
            key: 'v-key-10',
            type: VariableType.number,
        },
        {
            _id: 'c21628fe66834e1a97048e904a85cd87',
            key: 'v-key-11',
            type: VariableType.boolean,
        },
        {
            _id: 'c47307dac00744cfa621b443e373ba8c',
            key: 'v-key-12',
            type: VariableType.boolean,
        },
        {
            _id: '851ab1e228c346299dbaa6e2ed4e8d30',
            key: 'v-key-13',
            type: VariableType.boolean,
        },
        {
            _id: 'ebc12f6619a24fd797511492e8dc2dc9',
            key: 'v-key-14',
            type: VariableType.number,
        },
        {
            _id: 'a5b4ae7378014b8b86fec0e50a5b1d11',
            key: 'v-key-15',
            type: VariableType.boolean,
        },
        {
            _id: 'c5afa9e7e40c4214ac8bfa33a24ea41e',
            key: 'v-key-16',
            type: VariableType.boolean,
        },
        {
            _id: '3448b5ba369c4aca8c3b32995559e6d7',
            key: 'v-key-17',
            type: VariableType.boolean,
        },
        {
            _id: 'cb548e9e31a943c6ad921a995e6931bf',
            key: 'v-key-18',
            type: VariableType.boolean,
        },
        {
            _id: '3e25826ff35e4dd28ae11521e9f823a3',
            key: 'v-key-19',
            type: VariableType.string,
        },
        {
            _id: '6e5993c7b38d4945bb3fa15287a9988b',
            key: 'v-key-20',
            type: VariableType.string,
        },
        {
            _id: '48a1825684a341c3922ca93d4b0e046a',
            key: 'v-key-21',
            type: VariableType.string,
        },
        {
            _id: '2b682f1f92fa42c190324fff0c565efa',
            key: 'v-key-22',
            type: VariableType.boolean,
        },
        {
            _id: '5f21eead3180485e906a7f890a823a4a',
            key: 'v-key-23',
            type: VariableType.boolean,
        },
        {
            _id: '0c2c1c562b2d4b9196ed7dae1851694c',
            key: 'v-key-24',
            type: VariableType.boolean,
        },
        {
            _id: '564e5883c09f4eda8c4d438218e80cf4',
            key: 'v-key-25',
            type: VariableType.boolean,
        },
        {
            _id: 'fe699eb0c3914a74acaed8757aa40005',
            key: 'v-key-26',
            type: VariableType.boolean,
        },
        {
            _id: 'c8f6799f02604a1c9ec96df4145caa8f',
            key: 'v-key-27',
            type: VariableType.boolean,
        },
        {
            _id: '8a07b060a32c4e26acc0d04da832001f',
            key: 'v-key-28',
            type: VariableType.boolean,
        },
        {
            _id: '06526b304eb14f4ebcb222b84ff0da27',
            key: 'v-key-29',
            type: VariableType.boolean,
        },
        {
            _id: '7172c772d5a743dbb86951ec9f661d77',
            key: 'v-key-30',
            type: VariableType.boolean,
        },
        {
            _id: '0b3990b60cf34ee980b423a633c5210c',
            key: 'v-key-31',
            type: VariableType.number,
        },
        {
            _id: '320e995007a24995b2589362f8b03cae',
            key: 'v-key-32',
            type: VariableType.boolean,
        },
        {
            _id: 'd9d3828077474b999c075e2a3e5e968e',
            key: 'v-key-33',
            type: VariableType.boolean,
        },
        {
            _id: 'f2a8f035eb7748b98c1693304bb01fc6',
            key: 'v-key-34',
            type: VariableType.number,
        },
        {
            _id: 'c1ed742bf0fb49789af284afa6d3c143',
            key: 'v-key-35',
            type: VariableType.number,
        },
        {
            _id: '8a4b14096f594212af40f74deb4e35a8',
            key: 'v-key-36',
            type: VariableType.boolean,
        },
        {
            _id: '812bd49a1a24499f93d478d4cf121a2e',
            key: 'v-key-37',
            type: VariableType.boolean,
        },
        {
            _id: 'c37d06749b794878b5b78489b9665f11',
            key: 'v-key-38',
            type: VariableType.boolean,
        },
        {
            _id: '0b296762cbf84cb7b5fedefce0467834',
            key: 'v-key-39',
            type: VariableType.boolean,
        },
        {
            _id: '4f84abe8f3134a2da9035de370e106c2',
            key: 'v-key-40',
            type: VariableType.boolean,
        },
        {
            _id: '70f1fb33230944b28f08b333a761b345',
            key: 'v-key-41',
            type: VariableType.boolean,
        },
        {
            _id: 'fd121aea5b22424688750cb224709ed7',
            key: 'v-key-42',
            type: VariableType.boolean,
        },
        {
            _id: 'cd127c5e6d3e43c1b503a2943b537c41',
            key: 'v-key-43',
            type: VariableType.number,
        },
        {
            _id: 'ff6bcafe19f8448f89136588f31d2859',
            key: 'v-key-44',
            type: VariableType.boolean,
        },
        {
            _id: '8e2af859c11348b9a90ffdb620e9111a',
            key: 'v-key-45',
            type: VariableType.boolean,
        },
        {
            _id: 'a37c245fdddc40c9a37beb0bc1343347',
            key: 'v-key-46',
            type: VariableType.boolean,
        },
        {
            _id: '90e5cf50ed2645d3867e773a3536fd62',
            key: 'v-key-47',
            type: VariableType.boolean,
        },
        {
            _id: 'e373e7a6dd704c0cafdc1d25101ea9ae',
            key: 'v-key-48',
            type: VariableType.boolean,
        },
        {
            _id: '69e89ca7227d4f2ca91e20a2c4306fc5',
            key: 'v-key-49',
            type: VariableType.boolean,
        },
        {
            _id: 'a5a16cacfc71462e9184b1b1c252283e',
            key: 'v-key-50',
            type: VariableType.boolean,
        },
        {
            _id: '0f648861e13e4d2eb6fb4aa8b1595402',
            key: 'v-key-51',
            type: VariableType.boolean,
        },
        {
            _id: '4527054945a041bfb64672ecd7149b69',
            key: 'v-key-52',
            type: VariableType.boolean,
        },
        {
            _id: '8066b5804a9f451bb6011af19e39e75e',
            key: 'v-key-53',
            type: VariableType.boolean,
        },
        {
            _id: 'fea764079b614314ac640bc0ea4463e6',
            key: 'v-key-54',
            type: VariableType.boolean,
        },
        {
            _id: '4498aeafc1a44e5f8b66523f0b61cd2c',
            key: 'v-key-55',
            type: VariableType.number,
        },
        {
            _id: '77702fd7feb448e5942859b448e918c8',
            key: 'v-key-56',
            type: VariableType.number,
        },
        {
            _id: 'fcfbfb097fd4479496a21351dfbf8c60',
            key: 'v-key-57',
            type: VariableType.number,
        },
        {
            _id: 'f593910949e2438dac5fd6dcf0d43912',
            key: 'v-key-58',
            type: VariableType.boolean,
        },
        {
            _id: '6951341207c14a2bb62940bcffbc6da6',
            key: 'v-key-59',
            type: VariableType.boolean,
        },
        {
            _id: '917f5a4d089c400e86a6db867d3a752b',
            key: 'v-key-60',
            type: VariableType.string,
        },
        {
            _id: '44960795efff4210a5e7510f8ef6940d',
            key: 'v-key-61',
            type: VariableType.boolean,
        },
        {
            _id: '55b371985ca0490f94fcf407c656737d',
            key: 'v-key-62',
            type: VariableType.boolean,
        },
        {
            _id: '8cde1e4dc44741008defa79f8905f8f1',
            key: 'v-key-63',
            type: VariableType.boolean,
        },
        {
            _id: 'dc5eff4ddca2474ca83930d57752ddfe',
            key: 'v-key-64',
            type: VariableType.boolean,
        },
        {
            _id: '22d1531da708470c8d16d3ebefce269b',
            key: 'v-key-65',
            type: VariableType.boolean,
        },
        {
            _id: '109f4134efc64f8b83f5a22e0c4636bc',
            key: 'v-key-66',
            type: VariableType.boolean,
        },
        {
            _id: '761bc57f612d4e71b69e18c26f32715f',
            key: 'v-key-67',
            type: VariableType.number,
        },
        {
            _id: '0933c3fd3a36449bb3b93f16fdb36aa2',
            key: 'v-key-68',
            type: VariableType.boolean,
        },
        {
            _id: '3093fbcf12aa4494a2ac3d42c8e2f9c8',
            key: 'v-key-69',
            type: VariableType.boolean,
        },
        {
            _id: '5b1fbfa669854da185dd66890f06ba3e',
            key: 'v-key-70',
            type: VariableType.boolean,
        },
        {
            _id: '698aee1469ca4e48b286f11ba25aa44f',
            key: 'v-key-71',
            type: VariableType.boolean,
        },
        {
            _id: 'e5ad1e1f94714c359ae1fe1518c9a040',
            key: 'v-key-72',
            type: VariableType.boolean,
        },
        {
            _id: '50d74d330a844b9894fb080623f71061',
            key: 'v-key-73',
            type: VariableType.boolean,
        },
        {
            _id: 'e407b156ae4b42b9b570990add98a284',
            key: 'v-key-74',
            type: VariableType.boolean,
        },
        {
            _id: '5dc07eb3117c4dc9a4d244448079f396',
            key: 'v-key-75',
            type: VariableType.boolean,
        },
        {
            _id: 'deee697635a54fe0bc98a50afdc6f4b7',
            key: 'v-key-76',
            type: VariableType.number,
        },
        {
            _id: 'acd3fda7a24144249fb2c1e61482e53d',
            key: 'v-key-77',
            type: VariableType.boolean,
        },
        {
            _id: 'aeed0f6cc51042a8965e4a702f993757',
            key: 'v-key-78',
            type: VariableType.boolean,
        },
        {
            _id: '19a39391cca946bcb748efebf6dc1615',
            key: 'v-key-79',
            type: VariableType.boolean,
        },
        {
            _id: '8680dd624dd14418b3fae7d9ba92ec1f',
            key: 'v-key-80',
            type: VariableType.boolean,
        },
        {
            _id: 'ec06b4b075b14b01a337adfcf55869cc',
            key: 'v-key-81',
            type: VariableType.boolean,
        },
        {
            _id: 'b9a677aeb53d43a581b774ec714ac9d8',
            key: 'v-key-82',
            type: VariableType.number,
        },
        {
            _id: '202a6f34d0e64621993cf4075cb1cc5d',
            key: 'v-key-83',
            type: VariableType.number,
        },
        {
            _id: '90defac9e63748688e0e2fe62da64dbc',
            key: 'v-key-84',
            type: VariableType.number,
        },
        {
            _id: '5bc4c6ac17024d63bcb69e723db87c35',
            key: 'v-key-85',
            type: VariableType.boolean,
        },
    ],
    variableHashes: {
        'v-key-1': 3875631545,
        'v-key-2': 3171849274,
        'v-key-3': 2508015300,
        'v-key-4': 1589755014,
        'v-key-5': 561539770,
        'v-key-6': 2424313764,
        'v-key-7': 1117884896,
        'v-key-8': 707382809,
        'v-key-9': 2513222383,
        'v-key-10': 2641135753,
        'v-key-11': 2547940893,
        'v-key-12': 2775508295,
        'v-key-13': 287141085,
        'v-key-14': 851675053,
        'v-key-15': 913331994,
        'v-key-16': 3554085696,
        'v-key-17': 407069781,
        'v-key-18': 390395011,
        'v-key-19': 3998702424,
        'v-key-20': 2478974432,
        'v-key-21': 2402717744,
        'v-key-22': 1142622355,
        'v-key-23': 3675922665,
        'v-key-24': 2167490568,
        'v-key-25': 3162987125,
        'v-key-26': 3138495505,
        'v-key-27': 2924039468,
        'v-key-28': 1274496885,
        'v-key-29': 4126922128,
        'v-key-30': 694177517,
        'v-key-31': 3131447933,
        'v-key-32': 3604047630,
        'v-key-33': 508204180,
        'v-key-34': 31192107,
        'v-key-35': 1262016692,
        'v-key-36': 1138021832,
        'v-key-37': 1733015436,
        'v-key-38': 2010943766,
        'v-key-39': 164897831,
        'v-key-40': 3315954645,
        'v-key-41': 575917122,
        'v-key-42': 4236899975,
        'v-key-43': 3366129785,
        'v-key-44': 184025904,
        'v-key-45': 652749562,
        'v-key-46': 748268568,
        'v-key-47': 1323185127,
        'v-key-48': 806741242,
        'v-key-49': 2809691518,
        'v-key-50': 3916205699,
        'v-key-51': 979377859,
        'v-key-52': 2627480307,
        'v-key-53': 591285701,
        'v-key-54': 3617084670,
        'v-key-55': 317423641,
        'v-key-56': 432168563,
        'v-key-57': 1071625819,
        'v-key-58': 3490597632,
        'v-key-59': 4057868869,
        'v-key-60': 3035014942,
        'v-key-61': 1350347058,
        'v-key-62': 1871971115,
        'v-key-63': 221058150,
        'v-key-64': 2546094713,
        'v-key-65': 1710148817,
        'v-key-66': 1180735419,
        'v-key-67': 4192028675,
        'v-key-68': 80929803,
        'v-key-69': 1540985311,
        'v-key-70': 1176937951,
        'v-key-71': 739582947,
        'v-key-72': 2812472422,
        'v-key-73': 2930419084,
        'v-key-74': 2085589200,
        'v-key-75': 1932391213,
        'v-key-76': 1176053017,
        'v-key-77': 878848850,
        'v-key-78': 3295008128,
        'v-key-79': 616785004,
        'v-key-80': 4065516989,
        'v-key-81': 843393717,
        'v-key-82': 1241450390,
        'v-key-83': 2157391292,
        'v-key-84': 1515076265,
        'v-key-85': 1816736096,
    },
    audiences: {
        a2a331f751914200a8a53b59ae6b7a6f: {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.customData,
                        comparator: FilterComparator['contain'],
                        dataKey: 'data-key-1',
                        dataKeyType: DataKeyType.string,
                        _audiences: [],
                        values: ['JH0EYYW1xW0i'],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
        '145f66b2bfce4e7e9c8bd3a432e28c8d': {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.customData,
                        comparator: FilterComparator['contain'],
                        dataKey: 'data-key-1',
                        dataKeyType: DataKeyType.string,
                        _audiences: [],
                        values: ['A8fuyGtFteKa'],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
        e757fc6a16924b2ab5a95c00d609ab14: {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.customData,
                        comparator: FilterComparator['contain'],
                        dataKey: 'data-key-1',
                        dataKeyType: DataKeyType.string,
                        _audiences: [],
                        values: ['uCQ2D5q3q8nl'],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
        '7db4d6f7e53543e4a413ac539477bac6': {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.customData,
                        comparator: FilterComparator['='],
                        dataKey: 'data-key-1',
                        dataKeyType: DataKeyType.string,
                        _audiences: [],
                        values: ['tTIjwEEOqp4f', 'UjMSlpr0rybV'],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
        f4e70df027d945fb8af17bfa8dd48091: {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.user_id,
                        comparator: FilterComparator['='],
                        _audiences: [],
                        values: [
                            'user_db29e033-8bce-4c9f-802b-956c7cb8f62c',
                            'user_c3d2b775-af02-4cbb-ab9c-0b60812ab2aa',
                            'user_a1791896-3e6a-485f-a1b6-b16159a52f2b',
                            'user_3c0cf6bd-27bd-4d4a-bfc0-7ca8f7e6069f',
                            'UcPbSGx0qXYh',
                            'user_73d17800-8c2d-4658-8f2a-70638e86500f',
                            '8Qdaw7IE6IsV',
                            'user_4f381b9c-c3ed-4006-81fb-ddfbc5254486',
                            'user_7ea4c5c8-da91-4a11-81b1-79b44e540b7a',
                            'user_14dd9c40-6043-4823-ba57-b137292b04c9',
                        ],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
        b400f04e086a4e8f9ae7f68920b92fee: {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.customData,
                        comparator: FilterComparator['='],
                        dataKey: 'data-key-11',
                        dataKeyType: DataKeyType.string,
                        _audiences: [],
                        values: [
                            'user_91ac71cb-5fec-48e1-b320-3f03add4c1a3',
                            'user_d7685aa7-d8f0-433a-ac73-bad3410b03c1',
                            'OSdPn3RVjYK4',
                            'THTiAe2dinsK',
                            'PERqS3B3RvYU',
                            'MtvazoG72imw',
                            'soloR7xFN5zQ',
                            'D6BuF9TIt3Dm',
                            'myggfcdwEINw',
                            'mFIxfE0uyi8W',
                            'YQDn2PZT5AfN',
                            'AizG5enyRgyn',
                            '8wOQGuPvBMaL',
                            'T461rLjbhEWn',
                            'N2SR0bFh00Kc',
                            'AXJomNJbjH38',
                            '9IOg6mvb5iis',
                            'CfzVKLMLNELs',
                            'user_59b59200-30e7-4704-be28-64687b2eb4f1',
                            '2WSVr5Xp42h2',
                            'nBTEAkvsCAb6',
                            'SoIZ5U88NMif',
                            'SvirkS62LL2D',
                        ],
                        filters: [],
                    },
                    {
                        type: FilterType.user,
                        subType: UserSubType.customData,
                        comparator: FilterComparator['contain'],
                        dataKey: 'data-key-5',
                        dataKeyType: DataKeyType.string,
                        _audiences: [],
                        values: ['Fi3J4K9v6e5w'],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
        '929a3f351a6249c68ca17133ab661ca7': {
            filters: {
                filters: [
                    {
                        type: FilterType.user,
                        subType: UserSubType.user_id,
                        comparator: FilterComparator['='],
                        _audiences: [],
                        values: [
                            'user_323f4748-80f2-4930-a34b-716294720723',
                            'user_76ae51fa-634f-4050-a6a5-81331a5d4f15',
                            'user_c464730a-acac-46e5-8cb3-83d28f9cd436',
                        ],
                        filters: [],
                    },
                ],
                operator: AudienceOperator.or,
            },
        },
    },
    ably: {
        apiKey: 'wMFFcfdLbZaiRktb4dX2eCTkAR3Ae8Mw',
    },
}
