import { JSON } from "assemblyscript-json"
import { getJSONArrayFromJSON, getStringFromJSON, isValidString } from "./jsonHelpers"
import { Target } from "./target"

export class FeatureConfiguration {
    _id: string
    prerequisites: FeaturePrerequisites[] | null
    winningVariation: FeatureWinningVariation | null
    forcedUsers: Map<string, string> | null
    targets: Target[]

    constructor(featureConfig: JSON.Obj) {
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
}

const comparatorValues = ['=', '!=']

export class FeaturePrerequisites {
    _feature: string
    comparator: string

    constructor(featurePrerequisites: JSON.Obj) {
        this._feature = getStringFromJSON(featurePrerequisites, '_feature')

        this.comparator = isValidString(featurePrerequisites, 'comparator', comparatorValues)
    }
}

export class FeatureWinningVariation {
    _variation: string
    // updatedAt: Date

    constructor(winningVar: JSON.Obj) {
        this._variation = getStringFromJSON(winningVar, '_variation')

        // this.updatedAt = Date.fromString(getStringFromJSON(winningVar, 'updatedAt'))
    }
}


