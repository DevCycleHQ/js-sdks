export class Project<IdType = string> {
    _id: IdType

    /**
     * Unique key by Organization, can be used in the SDK / API to reference by 'key' rather then _id
     * Must only contain lower-case characters and `_` or `-`
     */
    key: string

    a0_organization: string

    settings: {
        cloudEntityData: {
            enabled: boolean
        }
    }
}
