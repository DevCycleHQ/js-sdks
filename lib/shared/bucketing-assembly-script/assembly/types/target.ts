import { JSON } from 'assemblyscript-json/assembly'
import {
    getArrayFromJSONOptional,
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

export class AudienceFilter extends JSON.Value {
    type: string
    constructor(filter: JSON.Obj) {
        super()
        this.type = isValidString(filter, 'type', validTypes, false)

    }

    stringify(): string {
        const json = new JSON.Obj()
        if (this.type) {
            json.set('type', this.type)
        }

        return json.stringify()
    }
}
// This is a virtual container class that's used by the code to determine whether a filter is a nested operator
// or a base level filter. This is used to support the recursive nature of nested filters.
// The config is returned to its original form when stringified.
export class AudienceFilterOrOperator extends JSON.Value {
    operatorClass: AudienceOperator | null
    filterClass: AudienceFilter | null

    constructor(filter: JSON.Obj) {
        super()
        const operator = isValidStringOptional(filter, 'operator', validAudienceOperators, false)
        this.operatorClass = operator ? new AudienceOperator(filter) : null
        this.filterClass = operator ? null : initializeFilterClass(filter)
    }

    stringify(): string {
        if (this.operatorClass !== null) {
            return (this.operatorClass as AudienceOperator).stringify()
        }
        if (this.filterClass !== null) {
            return (this.filterClass as AudienceFilter).stringify()
        }
        return ""
    }
}

export class AudienceOperator extends JSON.Value {
    operator: string
    filters: AudienceFilterOrOperator[]

    constructor(filter: JSON.Obj) {
        super()

        this.operator = isValidString(filter, 'operator', validAudienceOperators, false)

        const filters = getJSONArrayFromJSON(filter, 'filters')
        // Initialize AudienceFilterOrOperator
        this.filters = []
        for (let i = 0; i < filters.valueOf().length; i ++) {
            this.filters.push(new AudienceFilterOrOperator(filters.valueOf()[i] as JSON.Obj))
        }
    }

    stringify(): string {
        const json = new JSON.Obj()
        if (this.operator) {
            json.set('operator', this.operator)
        }
        if (this.filters) {
            json.set('filters', jsonArrFromValueArray(this.filters as AudienceFilterOrOperator[]))
        }

        return json.stringify()
    }
}

export class NoIdAudience extends JSON.Value {
    filters: AudienceOperator

    constructor(audience: JSON.Obj) {
        super()

        this.filters = new AudienceOperator(getJSONObjFromJSON(audience, 'filters'))
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('filters', this.filters)
        return json.stringify()
    }
}

export class Audience extends NoIdAudience {
    _id: string

    constructor(audience: JSON.Obj) {
        super(audience)
        this._id = getStringFromJSON(audience, '_id')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        json.set('filters', this.filters)
        return json.stringify()
    }
}

const validAudienceOperators = ['and', 'or']

const validTypes = ['all', 'user', 'optIn', 'audienceMatch']

export const validSubTypes = [
    'user_id', 'email', 'ip', 'country', 'platform',
    'platformVersion', 'appVersion', 'deviceModel', 'customData'
]

const validComparators = [
    '=', '!=', '>', '>=', '<', '<=', 'exist', '!exist', 'contain', '!contain'
]

const validAudienceMatchComparators = ['=', '!=']
const validDataKeyTypes = [
    'String', 'Boolean', 'Number'
]

export class AudienceMatchFilter extends AudienceFilter {
    _audiences: JSON.Arr
    comparator: string
    readonly isValid: bool

    constructor(filter: JSON.Obj) {
        super(filter)
        this._audiences = getJSONArrayFromJSON(filter, '_audiences')
        this.type = isValidString(filter, 'type', ['audienceMatch'], false)
        this.comparator = isValidString(filter, 'comparator', validAudienceMatchComparators, false)
        this.isValid = validAudienceMatchComparators.includes(this.comparator)
    }
    stringify(): string {
        const json = new JSON.Obj()
        if (this.comparator) {
            json.set('comparator', this.comparator)
        }
        if (this._audiences) {
            json.set('_audiences', this._audiences)
        }
        if (this.type) {
            json.set('type', this.type)
        }

        return json.stringify()
    }
}


export class UserFilter extends AudienceFilter {
    subType: string
    values: JSON.Arr
    comparator: string
    readonly isValid: bool

    constructor(filter: JSON.Obj) {
        super(filter)
        this.values = getJSONArrayFromJSON(filter, 'values')
        this.subType = isValidString(filter, 'subType', validSubTypes, false)
        this.comparator = isValidString(filter, 'comparator', validComparators, false)
        this.isValid = validComparators.includes(this.comparator)
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
        if (this.values) {
            json.set('values', this.values)
        }
        return json.stringify()
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
    stringify(): string {
        const json = new JSON.Obj()
        if (this.dataKey) {
            json.set('dataKey', this.dataKey)
        }
        if (this.dataKeyType) {
            json.set('dataKeyType', this.dataKeyType)
        }
        if (this.type) {
            json.set('type', this.type)
        }
        if (this.subType) {
            json.set('subType', this.subType)
        }
        if (this.comparator) {
            json.set('comparator', this.comparator)
        }
        if (this.values) {
            json.set('values', this.values)
        }
        return json.stringify()
    }
}

function initializeFilterClass(filter: JSON.Obj): AudienceFilter {
    if (getStringFromJSONOptional(filter, 'type') === 'user') {
        if (getStringFromJSONOptional(filter, 'subType') === 'customData') {
            return new CustomDataFilter(filter)
        }
        return new UserFilter(filter)
    } else if (getStringFromJSONOptional(filter, 'type') === 'audienceMatch'){
        return new AudienceMatchFilter(filter)
    } else {
        return new AudienceFilter(filter)
    }
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
