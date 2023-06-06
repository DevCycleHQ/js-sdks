export class Environment<IdType = string> {
  /**
   * Mongo primary _id.
   */
  _id: IdType

  /**
   * Unique key by Project, can be used in the SDK / API to reference by 'key' rather then _id.
   * Must only contain lower-case characters and `_` or `-`.
   */
  key: string
}
