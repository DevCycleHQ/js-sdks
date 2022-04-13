import { JSON } from 'assemblyscript-json/assembly'
import {
    getDateFromJSON,
    getF64FromJSONObj, getF64FromJSONOptional,
    getJSONArrayFromJSON,
    getJSONObjFromJSON,
    getStringFromJSON, getStringFromJSONOptional,
    isValidString,
    isValidStringOptional, jsonArrFromValueArray
} from '../helpers/jsonHelpers'

export class Target extends JSON.Value {
    _id: string
    _audience: Audience
    rollout: Rollout | null
    distribution: TargetDistribution[]

    constructor(target: JSON.Obj) {
        super()
        this._id = getStringFromJSON(target, '_id')

        this._audience = new Audience(getJSONObjFromJSON(target, '_audience'))

        const rollout = target.getObj('rollout')
        this.rollout = rollout ? new Rollout(rollout) : null

        const distribution = getJSONArrayFromJSON(target, 'distribution')
        this.distribution = distribution.valueOf().map<TargetDistribution>((dist) => {
            return new TargetDistribution(dist as JSON.Obj)
        })
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('_audience', this._audience)
        if (this.rollout) {
            json.set('rollout', this.rollout)
        }
        json.set('distribution', jsonArrFromValueArray(this.distribution))
        return json.stringify()
    }
}

export class Audience extends JSON.Value {
    _id: string
    filters: TopLevelOperator

    constructor(audience: JSON.Obj) {
        super()
        this._id = getStringFromJSON(audience, '_id')

        this.filters = new TopLevelOperator(getJSONObjFromJSON(audience, 'filters'))
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('filters', this.filters)
        return json.stringify()
    }
}

const validAudienceOperators = ['and', 'or']

export class TopLevelOperator extends JSON.Value {
    filters: AudienceFilterOrOperator[]
    operator: string

    constructor(operator: JSON.Obj) {
        super()
        const filters = getJSONArrayFromJSON(operator, 'filters')
        this.filters = filters.valueOf().map<AudienceFilterOrOperator>((filter) => {
            return initializeFilterClass(filter as JSON.Obj)
        })

        this.operator = isValidString(operator, 'operator', validAudienceOperators)
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('filters', jsonArrFromValueArray(this.filters))
        json.set('operator', this.operator)
        return json.stringify()
    }
}

const validTypes = ['all', 'user']

export const validSubTypes = [
    'user_id', 'email', 'ip', 'country', 'platform',
    'platformVersion', 'appVersion','deviceModel', 'customData'
]

const validComparators = [
    '=', '!=', '>', '>=', '<', '<=', 'exist', '!exist', 'contain', '!contain'
]

const validDataKeyTypes = [
    'String', 'Boolean', 'Number'
]

const validOperator = ['and', 'or']

export class AudienceFilterOrOperator extends JSON.Value {
    type: string | null
    subType: string | null
    comparator: string | null
    dataKey: string | null
    dataKeyType: string | null
    values: JSON.Arr | null
    operator: string | null
    filters: AudienceFilterOrOperator[] | null

    constructor(filter: JSON.Obj) {
        super()
        this.type = isValidStringOptional(filter, 'type', validTypes)

        this.subType = isValidStringOptional(filter, 'subType', validSubTypes)

        this.comparator = isValidStringOptional(filter, 'comparator', validComparators)

        this.dataKey = getStringFromJSONOptional(filter, 'dataKey')

        this.dataKeyType = isValidStringOptional(filter, 'dataKeyType', validDataKeyTypes)

        const valuesArr = filter.getArr('values')
        if (valuesArr) {
            this.values = valuesArr
        } else {
            this.values = null
        }

        this.operator = isValidStringOptional(filter, 'operator', validOperator)

        const filters = filter.getArr('filters')
        this.filters = filters ?
            filters.valueOf().map<AudienceFilterOrOperator>((filter) => {
                return initializeFilterClass(filter as JSON.Obj)
            }) : null
    }

    stringify(): string {
        const json = new JSON.Obj()
        if (this.type) {
            json.set('type', this.type)
        }
        if (this.subType) {
            json.set('subType', this.subType)
        }
        if (this.comparator) {
            json.set('comparator', this.comparator)
        }
        if (this.dataKey) {
            json.set('dataKey', this.dataKey)
        }
        if (this.dataKeyType) {
            json.set('dataKeyType', this.dataKeyType)
        }
        if (this.values) {
            json.set('values', this.values)
        }
        if (this.operator) {
            json.set('operator', this.operator)
        }
        if (this.filters) {
            json.set('filters', jsonArrFromValueArray(this.filters as AudienceFilterOrOperator[]))
        }

        return json.stringify()
    }
}

export class UserFilter extends AudienceFilterOrOperator {
    type: string
    subType: string
    comparator: string
    values: JSON.Arr

    constructor(filter: JSON.Obj) {
        super(filter)
        this.values = getJSONArrayFromJSON(filter, 'values')
        this.type = isValidString(filter, 'type', validTypes)
        this.subType = isValidString(filter, 'subType', validSubTypes)
        this.comparator = isValidString(filter, 'comparator', validComparators)
    }
}

export class CustomDataFilter extends UserFilter {
    dataKeyType: string
    dataKey: string

    constructor(filter: JSON.Obj) {
        super(filter)
        this.dataKey = getStringFromJSON(filter, 'dataKey')
        this.dataKeyType = isValidString(filter, 'dataKeyType', validDataKeyTypes)
    }
}

function initializeFilterClass(filter: JSON.Obj): AudienceFilterOrOperator {
    if (getStringFromJSONOptional(filter, 'type') === 'all') {
        return new AudienceFilterOrOperator(filter)
    } else if (getStringFromJSONOptional(filter, 'type') === 'user') {
        if (getStringFromJSONOptional(filter, 'subType') === 'customData') {
            return new CustomDataFilter(filter)
        }
        return new UserFilter(filter)
    }

    throw new Error('Invalid filter type')
}

const validRolloutTypes = ['schedule', 'gradual', 'stepped']

export class Rollout extends JSON.Value {
    type: string
    startPercentage: f64
    startDate: Date
    stages: RolloutStage[] | null

    constructor(rollout: JSON.Obj) {
        super()
        this.type = isValidString(rollout, 'type', validRolloutTypes)

        this.startPercentage = getF64FromJSONOptional(rollout, 'startPercentage', f64(1))

        this.startDate = getDateFromJSON(rollout, 'startDate')

        const stages = rollout.getArr('stages')
        this.stages = stages ?
            stages.valueOf().map<RolloutStage>((stage) => {
                return new RolloutStage(stage as JSON.Obj)
            }) : null
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('type', this.type)
        json.set('startPercentage', this.startPercentage)
        json.set('startDate', this.startDate.toISOString())
        if (this.stages) {
            json.set('stages', jsonArrFromValueArray(this.stages as RolloutStage[]))
        }
        return json.stringify()
    }
}

const validRolloutStages = ['linear', 'discrete']

export class RolloutStage extends JSON.Value {
    type: string
    date: Date
    percentage: f64

    constructor(stage: JSON.Obj) {
        super()
        this.type = isValidString(stage, 'type', validRolloutStages)
        this.date = getDateFromJSON(stage, 'date')
        this.percentage = getF64FromJSONObj(stage, 'percentage')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('type', this.type)
        json.set('date', this.date.toISOString())
        json.set('percentage', this.percentage)
        return json.stringify()
    }
}

export class TargetDistribution extends JSON.Value {
    _variation: string
    percentage: f64

    constructor(distribution: JSON.Obj) {
        super()
        this._variation = getStringFromJSON(distribution, '_variation')
        this.percentage = getF64FromJSONObj(distribution, 'percentage')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_variation', this._variation)
        json.set('percentage', this.percentage)
        return json.stringify()
    }
}
