import { JSON } from "assemblyscript-json"
import {
    getJSONArrayFromJSON,
    getJSONObjFromJSON,
    getStringFromJSON,
    isValidString,
    isValidStringOptional
} from "./jsonHelpers"

export class Target {
    _id: string
    _audience: Audience
    // rollout: Rollout | null
    // distribution: TargetDistribution[]

    constructor(target: JSON.Obj) {
        this._id = getStringFromJSON(target, '_id')

        this._audience = new Audience(getJSONObjFromJSON(target, '_audience'))
    }
}

export class Audience {
    _id: string
    filters: TopLevelOperator

    constructor(audience: JSON.Obj) {
        this._id = getStringFromJSON(audience, '_id')

        this.filters = new TopLevelOperator(getJSONObjFromJSON(audience, 'filters'))
    }
}

const validAudienceOperators = ['and', 'or']

export class TopLevelOperator {
    filters: AudienceFilterOrOperator[]
    operator: string

    constructor(operator: JSON.Obj) {
        const filters = getJSONArrayFromJSON(operator, 'filters')
        this.filters = filters.valueOf().map<AudienceFilterOrOperator>((filter) => {
            return new AudienceFilterOrOperator(filter as JSON.Obj)
        })

        this.operator = isValidString(operator, 'operator', validAudienceOperators)
    }
}

const validTypes = ['all', 'user']

const validSubTypes = [
    'user_id', 'email', 'ip', 'country', 'platform',
    'platformVersion', 'appVersion','deviceModel', 'customData'
]

const validComparators = [
    '=', '!=', '>', '>=', '<', '<=', 'exist', '!exist', 'contain', '!contain'
]

const validDataKeyTypes = [
    'String', 'Boolean', 'Number', 'Semver'
]

const validOperator = ['and', 'or']

export class AudienceFilterOrOperator {
    type: string | null
    subType: string | null
    comparator: string | null
    dataKey: string | null
    dataKeyType: string | null
    // TODO: support boolean[] | number[]
    values: string[] | null
    operator: string | null
    filters: AudienceFilterOrOperator[] | null

    constructor(filter: JSON.Obj) {
        this.type = isValidStringOptional(filter, 'type', validTypes)

        this.subType = isValidStringOptional(filter, 'subType', validSubTypes)

        this.comparator = isValidStringOptional(filter, 'comparator', validComparators)

        const dataKey = filter.getString('dataKey')
        this.dataKey = dataKey ? dataKey.toString() : null

        this.dataKeyType = isValidStringOptional(filter, 'dataKeyType', validDataKeyTypes)

        const valuesArr = filter.getArr('values')
        if (valuesArr) {
            const values: string[] = []
            for (let i = 0; i < valuesArr.valueOf().length; i++) {
                const value = valuesArr.valueOf()[i]
                if (value.isString) {
                    values.push(value.stringify())
                }
            }
            this.values = values
        } else {
            this.values = null
        }

        this.operator = isValidStringOptional(filter, 'operator', validOperator)

        const filters = filter.getArr('filters')
        this.filters = filters ?
            filters.valueOf().map<AudienceFilterOrOperator>((filter) => {
                return new AudienceFilterOrOperator(filter as JSON.Obj)
            }) : null
    }
}
