import { JSON } from 'json-as/assembly'

@json
export class DVCPopulatedUser_JSON {
    user_id: string
    email: string | null
    name: string | null
    language: string | null
    country: string | null
    appVersion: string | null
    appBuild: f64 = NaN
    deviceModel: string | null
    customData: Map<string, string | number | boolean> | null
    privateCustomData: Map<string, string | number | boolean> | null
    // private _combinedCustomData: JSON_AS.Obj
}
