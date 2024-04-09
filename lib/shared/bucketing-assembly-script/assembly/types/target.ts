import { JSON } from '@devcycle/assemblyscript-json/assembly'
import {
    getDateFromJSON,
    getF64FromJSONObj,
    getF64FromJSONOptional,
    getJSONArrayFromJSON,
    getJSONObjFromJSON,
    getStringFromJSON,
    getStringFromJSONOptional,
    isValidString,
    isValidStringOptional,
    jsonArrFromValueArray
} from '../helpers/jsonHelpers'
import { SortingArray, sortObjectsByString } from '../helpers/arrayHelpers'

export class Target extends JSON.Value {
    readonly _id: string
    readonly _audience: Audience
    readonly rollout: Rollout | null
    readonly distribution: TargetDistribution[]

    private readonly _sortedDistribution: TargetDistribution[]

    constructor(target: JSON.Obj) {
        super()
        this._id = getStringFromJSON(target, '_id')

        this._audience = new Audience(getJSONObjFromJSON(target, '_audience'))

        const rollout = target.getObj('rollout')
        this.rollout = rollout ? new Rollout(rollout) : null

        const distributionJSON = getJSONArrayFromJSON(target, 'distribution')
        const distribution = distributionJSON.valueOf().map<TargetDistribution>((dist) => {
            return new TargetDistribution(dist as JSON.Obj)
        })
        this.distribution = distribution

        const sortingArray: SortingArray<TargetDistribution> = []
        for (let i = 0; i < distribution.length; i++) {
            sortingArray.push({
                entry: distribution[i],
                value: distribution[i]._variation
            })
        }
        this._sortedDistribution = sortObjectsByString<TargetDistribution>(sortingArray, 'desc')
    }

    /**
     * Given the feature and a hash of the user_id, bucket the user according to the variation distribution percentages
     */
    decideTargetVariation(boundedHash: f64): string {
        let distributionIndex: f64 = 0
        const previousDistributionIndex: f64 = 0
        for (let i = 0; i < this._sortedDistribution.length; i++) {
            const distribution = this._sortedDistribution[i]
            distributionIndex += distribution.percentage
            if (boundedHash >= previousDistributionIndex && boundedHash < distributionIndex) {
                return distribution._variation
            }
        }
        throw new Error(`Failed to decide target variation: ${this._id}`)
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
    readonly operatorClass: AudienceOperator | null
    readonly filterClass: AudienceFilter | null

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
        return ''
    }
}

export class AudienceOperator extends JSON.Value {
    readonly operator: string
    readonly filters: AudienceFilterOrOperator[]

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

export class Audience extends JSON.Value {
    readonly filters: AudienceOperator

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
    readonly _audiences: JSON.Arr
    readonly comparator: string
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
    readonly subType: string
    readonly values: JSON.Arr
    readonly comparator: string
    readonly isValid: bool

    private _compiledStringValues: string[] | null = null
    private _compiledBoolValues:  bool[] | null = null
    private _compiledNumValues: number[] | null = null

    constructor(filter: JSON.Obj) {
        super(filter)
        this.values = getJSONArrayFromJSON(filter, 'values')
        this.subType = isValidString(filter, 'subType', validSubTypes, false)
        this.comparator = isValidString(filter, 'comparator', validComparators, false)
        this.isValid = validComparators.includes(this.comparator)

        this.compileValues(this.values.valueOf())
    }

    compileValues(values: JSON.Value[]): void {
        if (!values || values.length === 0) return
        const firstValue = values[0]

        if (firstValue.isBool) {
            const boolValues = new Array<bool>()

            for (let i=0; i < values.length; i++) {
                const value = values[i]
                if (!value.isBool) {
                    console.log('[DevCycle] Warning: Filter values must be all of the same type. ' +
                        `Expected: bool, got: ${value}`)
                    continue
                }

                boolValues.push((value as JSON.Bool).valueOf())
            }
            this._compiledBoolValues = boolValues
        } else if (firstValue.isString) {
            const stringValues = new Array<string>()

            for (let i=0; i < values.length; i++) {
                const value = values[i]
                if (!value.isString) {
                    console.log('[DevCycle] Warning: Filter values must be all of the same type. ' +
                        `Expected: string, got: ${value}`)
                    continue
                }

                stringValues.push((value as JSON.Str).valueOf())
            }
            this._compiledStringValues = stringValues
        } else if (firstValue.isFloat || firstValue.isInteger) {
            const numValues = new Array<number>()

            for (let i=0; i < values.length; i++) {
                const value = values[i]
                const float = value.isFloat ? value as JSON.Float : null
                const int = value.isInteger ? value as JSON.Integer : null
                if (float === null && int === null) {
                    console.log('[DevCycle] Warning: Filter values must be all of the same type. ' +
                        `Expected: number, got: ${value}`)
                    continue
                }

                const numValue = float !== null
                    ? (float as JSON.Float).valueOf()
                    : (int !== null ? f64((int as JSON.Integer).valueOf()) : NaN)
                if (!isNaN(numValue)) {
                    numValues.push(numValue)
                }
            }
            this._compiledNumValues = numValues
        } else {
            throw new Error(`Filter values of unknown type. ${firstValue}`)
        }
    }

    getStringValues(): string[] {
        return this._compiledStringValues !== null
            ? this._compiledStringValues as string[]
            : []
    }

    getBooleanValues(): bool[] {
        return this._compiledBoolValues !== null
            ? this._compiledBoolValues as bool[]
            : []
    }

    getNumberValues(): number[] {
        return this._compiledNumValues !== null
            ? this._compiledNumValues as number[]
            : []
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
    readonly dataKeyType: string
    readonly dataKey: string

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
    readonly type: string
    readonly startPercentage: f64
    readonly startDate: Date
    readonly stages: RolloutStage[] | null

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
    readonly type: string
    readonly date: Date
    readonly percentage: f64

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
    readonly _variation: string
    readonly percentage: f64

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
