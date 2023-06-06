export class ListAudience<IdType = string> {
  _id: IdType

  source: 'mixpanelCohort' | 'csv'

  appUserKeyName: 'userId' | 'email'

  current: {
    version?: string
    path?: string
    createdAt?: Date
  }
}
