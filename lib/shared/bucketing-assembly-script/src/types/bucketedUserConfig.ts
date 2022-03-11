import { JSON } from "assemblyscript-json"
import { getJSONArrayFromJSON, getJSONObjFromJSON } from "./jsonHelpers"
import { PublicProject, PublicEnvironment } from "./configBody"
import { Feature } from "./feature"

export class BucketedUserConfig {
    project: PublicProject
    environment: PublicEnvironment
    features: Feature[]
    featureVariationMap: JSON.Obj | null //Map<string, string>
    variables: JSON.Obj | null // Map<string, SDKVariable>
    knownVariableKeys: JSON.Arr | null

    constructor(configJSON: JSON.Obj) {
        this.project = new PublicProject(getJSONObjFromJSON(configJSON, "project"))
        this.environment = new PublicEnvironment(getJSONObjFromJSON(configJSON, "environment"))
        const features = getJSONArrayFromJSON(configJSON, 'features')
        this.features = features.valueOf().map<Feature>((feature) => new Feature(feature as JSON.Obj))
        this.featureVariationMap = configJSON.getObj("featureVariationMap")
        this.variables = configJSON.getObj("variables")
        this.knownVariableKeys = configJSON.getArr("knownVariableKeys")
    }

    stringify(): string {
        const json: JSON.Obj = new JSON.Obj()
        json.set('project', this.project)
        json.set('environment', this.environment)
        json.set('features', this.features)
        json.set('featureVariationMap', this.featureVariationMap)
        json.set('variables', this.variables)
        json.set('knownVariableKeys', this.knownVariableKeys)
        return json.stringify()
    }
}
