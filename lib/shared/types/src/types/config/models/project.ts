export class Project<IdType = string> {
  _id: IdType

  /**
   * Unique key by Organization, can be used in the SDK / API to reference by 'key' rather then _id
   * Must only contain lower-case characters and `_` or `-`
   */
  key: string

  a0_organization: string

  settings: {
    edgeDB: {
      enabled: boolean
    }
    sdkSettings?: {
      eventQueueLimit: 1000
    }
    optIn?: {
      enabled: boolean
      title?: string
      description?: string
      imageURL?: string
      colors?: {
        primary: string
        secondary: string
      }
      poweredByAlignment?: 'center' | 'left' | 'right' | 'hidden'
    }
  }
}
