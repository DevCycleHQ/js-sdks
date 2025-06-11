import { JSON } from '@devcycle/assemblyscript-json/assembly'
import {
    getJSONArrayFromJSON,
    getJSONObjFromJSON,
    getStringFromJSON,
    getStringFromJSONOptional,
    isValidString,
    jsonArrFromValueArray
} from '../helpers/jsonHelpers'
import { SortingArray, sortObjectsByString } from '../helpers/arrayHelpers'
import { Audience, Rollout, TargetDistribution, VariationReasonResult } from './target'
import { EvalReason, EVAL_REASONS  } from './bucketedUserConfig'

export class TargetV2 extends JSON.Value {
    readonly _id: string
    readonly _audience: Audience
    readonly rollout: Rollout | null
    readonly distribution: TargetDistribution[]
    readonly bucketingKey: string
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
        const bucketingKey = getStringFromJSONOptional(target, 'bucketingKey')
        if (bucketingKey) {
            this.bucketingKey = bucketingKey
        } else {
            this.bucketingKey = 'user_id'
        }
        this._sortedDistribution = sortObjectsByString<TargetDistribution>(sortingArray, 'desc')
    }

    /**
     * Given the feature and a hash of the user_id, bucket the user according to the variation distribution percentages
     */
    decideTargetVariation(boundedHash: f64): VariationReasonResult {
        let distributionIndex: f64 = 0
        const previousDistributionIndex: f64 = 0
        const isRollout = this.rollout !== null
        const isRandomDistribution = this.distribution.length !== 1

        for (let i = 0; i < this._sortedDistribution.length; i++) {
            const distribution = this._sortedDistribution[i]
            distributionIndex += distribution.percentage
            if (boundedHash >= previousDistributionIndex && 
                (boundedHash < distributionIndex || (distributionIndex == 1 && boundedHash == 1))) {
                const reason = isRollout || isRandomDistribution ? EVAL_REASONS.SPLIT : EVAL_REASONS.TARGETING_MATCH
                const evalReason = new EvalReason(reason, null)
                return new VariationReasonResult(distribution._variation, evalReason)
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
        if (this.bucketingKey) {
            json.set('bucketingKey', this.bucketingKey)
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

const validTypes = ['all', 'user', 'optIn', 'audienceMatch']

export const validSubTypes = [
    'user_id', 'email', 'ip', 'country', 'platform',
    'platformVersion', 'appVersion', 'deviceModel', 'customData'
]

export const validComparators = [
    '=', '!=', '>', '>=', '<', '<=', 'exist', '!exist', 'contain', '!contain',
    'startWith', '!startWith', 'endWith', '!endWith'
]

const validAudienceMatchComparators = ['=', '!=']
export const validDataKeyTypes = [
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
