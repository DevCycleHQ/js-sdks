import { JSON } from 'assemblyscript-json/assembly'
import {
    getDateFromJSON,
    getJSONArrayFromJSON,
    getStringFromJSON,
    isValidString,
    jsonArrFromValueArray,
    jsonObjFromMap
} from '../helpers/jsonHelpers'
import { Target, ITarget } from './target'

export interface IFeatureConfiguration {
    _id: string
    prerequisites: IFeaturePrerequisites[] | null
    winningVariation: IFeatureWinningVariation | null
    forcedUsers: Map<string, string> | null
    targets: ITarget[]
}

export class FeatureConfiguration extends JSON.Value implements IFeatureConfiguration {
    _id: string
    prerequisites: FeaturePrerequisites[] | null
    winningVariation: FeatureWinningVariation | null
    forcedUsers: Map<string, string> | null
    targets: Target[]

    constructor(featureConfig: JSON.Obj) {
        super()
        this._id = getStringFromJSON(featureConfig, '_id')

        const prerequisites = featureConfig.getArr('prerequisites')
        this.prerequisites = prerequisites ?
            prerequisites.valueOf().map<FeaturePrerequisites>((preq) => {
                return new FeaturePrerequisites(preq as JSON.Obj)
            }) : null

        const winningVar = featureConfig.getObj('winningVariation')
        this.winningVariation = winningVar ? new FeatureWinningVariation(winningVar) : null

        const targets = getJSONArrayFromJSON(featureConfig, 'targets')
        this.targets = targets.valueOf().map<Target>((target) => new Target(target as JSON.Obj))

        this.forcedUsers = null
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_id', this._id)
        if (this.prerequisites) {
            json.set('prerequisites', jsonArrFromValueArray(this.prerequisites as FeaturePrerequisites[]))
        }
        if (this.winningVariation) {
            json.set('winningVariation', this.winningVariation as FeatureWinningVariation)
        }
        if (this.forcedUsers) {
            json.set('forcedUsers', jsonObjFromMap(this.forcedUsers as Map<string, string>))
        }
        json.set('targets', jsonArrFromValueArray(this.targets))
        return json.stringify()
    }
}

const comparatorValues = ['=', '!=']

export interface IFeaturePrerequisites {
    _feature: string
    comparator: string
}

export class FeaturePrerequisites extends JSON.Value implements IFeaturePrerequisites {
    _feature: string
    comparator: string

    constructor(featurePrerequisites: JSON.Obj) {
        super()

        this._feature = getStringFromJSON(featurePrerequisites, '_feature')

        this.comparator = isValidString(featurePrerequisites, 'comparator', comparatorValues)
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_feature', this._feature)
        json.set('comparator', this.comparator)
        return json.stringify()
    }
}

export interface IFeatureWinningVariation {
    _variation: string
    updatedAt: Date
}

export class FeatureWinningVariation extends JSON.Value implements IFeatureWinningVariation {
    _variation: string
    updatedAt: Date

    constructor(winningVar: JSON.Obj) {
        super()
        this._variation = getStringFromJSON(winningVar, '_variation')
        this.updatedAt = getDateFromJSON(winningVar, 'updatedAt')
    }

    stringify(): string {
        const json = new JSON.Obj()
        json.set('_variation', this._variation)
        json.set('updatedAt', this.updatedAt.toISOString())
        return json.stringify()
    }
}


