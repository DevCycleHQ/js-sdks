declare namespace __AdaptedExports {
  /** Exported memory */
  export const memory: WebAssembly.Memory;
  /**
   * assembly/index/generateBoundedHashesFromJSON
   * @param user_id `~lib/string/String`
   * @param target_id `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function generateBoundedHashesFromJSON(user_id: string, target_id: string): string;
  /**
   * assembly/index/generateBucketedConfigForUser
   * @param sdkKey `~lib/string/String`
   * @param userJSONStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function generateBucketedConfigForUser(sdkKey: string, userJSONStr: string): string;
  /**
   * assembly/index/generateBucketedConfigForUserUTF8
   * @param sdkKey `~lib/string/String`
   * @param userJSONStr `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array`
   */
  export function generateBucketedConfigForUserUTF8(sdkKey: string, userJSONStr: Uint8Array): Uint8Array;
  /**
   * assembly/index/generateBucketedConfigForUserWithOverrides
   * @param sdkKey `~lib/string/String`
   * @param userJSONStr `~lib/typedarray/Uint8Array`
   * @param overridesJSONStr `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array`
   */
  export function generateBucketedConfigForUserWithOverrides(sdkKey: string, userJSONStr: Uint8Array, overridesJSONStr: Uint8Array): Uint8Array;
  /** assembly/index/VariableType */
  export enum VariableType {
    /** @type `i32` */
    Boolean,
    /** @type `i32` */
    Number,
    /** @type `i32` */
    String,
    /** @type `i32` */
    JSON,
  }
  /** assembly/index/VariableTypeStrings */
  export const VariableTypeStrings: {
    /** @type `~lib/array/Array<~lib/string/String>` */
    get value(): Array<string>
  };
  /**
   * assembly/index/variableForUser_PB_Preallocated
   * @param protobuf `~lib/typedarray/Uint8Array`
   * @param length `i32`
   * @returns `~lib/typedarray/Uint8Array | null`
   */
  export function variableForUser_PB_Preallocated(protobuf: Uint8Array, length: number): Uint8Array | null;
  /**
   * assembly/index/variableForUser_PB
   * @param protobuf `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array | null`
   */
  export function variableForUser_PB(protobuf: Uint8Array): Uint8Array | null;
  /**
   * assembly/index/variableForUser
   * @param sdkKey `~lib/string/String`
   * @param userJSONStr `~lib/string/String`
   * @param variableKey `~lib/string/String`
   * @param variableType `i32`
   * @param shouldTrackEvent `bool`
   * @returns `~lib/string/String | null`
   */
  export function variableForUser(sdkKey: string, userJSONStr: string, variableKey: string, variableType: number, shouldTrackEvent: boolean): string | null;
  /**
   * assembly/index/variableForUserPreallocated
   * @param sdkKey `~lib/string/String`
   * @param userStr `~lib/string/String`
   * @param userStrLength `i32`
   * @param variableKey `~lib/string/String`
   * @param variableKeyLength `i32`
   * @param variableType `i32`
   * @param shouldTrackEvent `bool`
   * @returns `~lib/string/String | null`
   */
  export function variableForUserPreallocated(sdkKey: string, userStr: string, userStrLength: number, variableKey: string, variableKeyLength: number, variableType: number, shouldTrackEvent: boolean): string | null;
  /**
   * assembly/index/setPlatformData
   * @param platformDataJSONStr `~lib/string/String`
   */
  export function setPlatformData(platformDataJSONStr: string): void;
  /**
   * assembly/index/setPlatformDataUTF8
   * @param platformDataJSONStr `~lib/typedarray/Uint8Array`
   */
  export function setPlatformDataUTF8(platformDataJSONStr: Uint8Array): void;
  /**
   * assembly/index/clearPlatformData
   * @param empty `~lib/string/String | null`
   */
  export function clearPlatformData(empty?: string | null): void;
  /**
   * assembly/index/setConfigDataUTF8Preallocated
   * @param sdkKey `~lib/string/String`
   * @param configDataJSONStr `~lib/typedarray/Uint8Array`
   * @param length `i32`
   */
  export function setConfigDataUTF8Preallocated(sdkKey: string, configDataJSONStr: Uint8Array, length: number): void;
  /**
   * assembly/index/setConfigDataUTF8
   * @param sdkKey `~lib/string/String`
   * @param configDataJSONStr `~lib/typedarray/Uint8Array`
   */
  export function setConfigDataUTF8(sdkKey: string, configDataJSONStr: Uint8Array): void;
  /**
   * assembly/index/setConfigData
   * @param sdkKey `~lib/string/String`
   * @param configDataJSONStr `~lib/string/String`
   */
  export function setConfigData(sdkKey: string, configDataJSONStr: string): void;
  /**
   * assembly/index/setConfigDataWithEtag
   * @param sdkKey `~lib/string/String`
   * @param configDataJSONStr `~lib/string/String`
   * @param etag `~lib/string/String`
   */
  export function setConfigDataWithEtag(sdkKey: string, configDataJSONStr: string, etag: string): void;
  /**
   * assembly/index/hasConfigDataForEtag
   * @param sdkKey `~lib/string/String`
   * @param etag `~lib/string/String`
   * @returns `bool`
   */
  export function hasConfigDataForEtag(sdkKey: string, etag: string): boolean;
  /**
   * assembly/index/setClientCustomData
   * @param sdkKey `~lib/string/String`
   * @param clientCustomDataJSONStr `~lib/string/String`
   */
  export function setClientCustomData(sdkKey: string, clientCustomDataJSONStr: string): void;
  /**
   * assembly/index/setClientCustomDataUTF8
   * @param sdkKey `~lib/string/String`
   * @param clientCustomDataUTF8 `~lib/typedarray/Uint8Array`
   */
  export function setClientCustomDataUTF8(sdkKey: string, clientCustomDataUTF8: Uint8Array): void;
  /**
   * assembly/index/getSDKKeyFromConfig
   * @param sdkKey `~lib/string/String`
   * @returns `~lib/string/String | null`
   */
  export function getSDKKeyFromConfig(sdkKey: string): string | null;
  /**
   * assembly/index/getConfigMetadata
   * @param sdkKey `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function getConfigMetadata(sdkKey: string): string;
  /**
   * assembly/helpers/murmurhash/murmurhashV3
   * @param key `~lib/string/String`
   * @param seed `u32`
   * @returns `u32`
   */
  export function murmurhashV3(key: string, seed: number): number;
  /**
   * assembly/helpers/murmurhash/murmurhashV3_js
   * @param key `~lib/string/String`
   * @param seed `u32`
   * @returns `~lib/string/String`
   */
  export function murmurhashV3_js(key: string, seed: number): string;
  /** assembly/helpers/murmurhash/murmurhashBufferSize */
  export const murmurhashBufferSize: {
    /** @type `i32` */
    get value(): number
  };
  /**
   * assembly/managers/eventQueueManager/initEventQueue
   * @param sdkKey `~lib/string/String`
   * @param clientUUID `~lib/string/String`
   * @param optionsStr `~lib/string/String`
   */
  export function initEventQueue(sdkKey: string, clientUUID: string, optionsStr: string): void;
  /**
   * assembly/managers/eventQueueManager/flushEventQueue
   * @param sdkKey `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function flushEventQueue(sdkKey: string): string;
  /**
   * assembly/managers/eventQueueManager/onPayloadSuccess
   * @param sdkKey `~lib/string/String`
   * @param payloadId `~lib/string/String`
   */
  export function onPayloadSuccess(sdkKey: string, payloadId: string): void;
  /**
   * assembly/managers/eventQueueManager/onPayloadFailure
   * @param sdkKey `~lib/string/String`
   * @param payloadId `~lib/string/String`
   * @param retryable `bool`
   */
  export function onPayloadFailure(sdkKey: string, payloadId: string, retryable: boolean): void;
  /**
   * assembly/managers/eventQueueManager/queueEvent
   * @param sdkKey `~lib/string/String`
   * @param userStr `~lib/string/String`
   * @param eventStr `~lib/string/String`
   */
  export function queueEvent(sdkKey: string, userStr: string, eventStr: string): void;
  /**
   * assembly/managers/eventQueueManager/queueAggregateEvent
   * @param sdkKey `~lib/string/String`
   * @param eventStr `~lib/string/String`
   * @param variableVariationMapStr `~lib/string/String`
   */
  export function queueAggregateEvent(sdkKey: string, eventStr: string, variableVariationMapStr: string): void;
  /**
   * assembly/managers/eventQueueManager/queueVariableEvaluatedEvent_JSON
   * @param sdkKey `~lib/string/String`
   * @param varVariationMapString `~lib/string/String`
   * @param variable `~lib/string/String | null`
   * @param variableKey `~lib/string/String`
   */
  export function queueVariableEvaluatedEvent_JSON(sdkKey: string, varVariationMapString: string, variable: string | null, variableKey: string): void;
  /**
   * assembly/managers/eventQueueManager/queueVariableEvaluatedEvent
   * @param sdkKey `~lib/string/String`
   * @param variableVariationMap `~lib/map/Map<~lib/string/String,assembly/types/bucketedUserConfig/FeatureVariation>`
   * @param variable `assembly/types/bucketedUserConfig/SDKVariable | null`
   * @param variableKey `~lib/string/String`
   */
  export function queueVariableEvaluatedEvent(sdkKey: string, variableVariationMap: __Internref142, variable: __Internref143 | null, variableKey: string): void;
  /**
   * assembly/managers/eventQueueManager/cleanupEventQueue
   * @param sdkKey `~lib/string/String`
   */
  export function cleanupEventQueue(sdkKey: string): void;
  /**
   * assembly/managers/eventQueueManager/eventQueueSize
   * @param sdkKey `~lib/string/String`
   * @returns `i32`
   */
  export function eventQueueSize(sdkKey: string): number;
  /**
   * assembly/testHelpers/testVariableForUserParams_PB
   * @param buffer `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array`
   */
  export function testVariableForUserParams_PB(buffer: Uint8Array): Uint8Array;
  /**
   * assembly/testHelpers/testDVCUser_PB
   * @param buffer `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array`
   */
  export function testDVCUser_PB(buffer: Uint8Array): Uint8Array;
  /**
   * assembly/testHelpers/testSDKVariable_PB
   * @param buffer `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array`
   */
  export function testSDKVariable_PB(buffer: Uint8Array): Uint8Array;
  /**
   * assembly/testHelpers/checkNumbersFilterFromJSON
   * @param number `~lib/string/String`
   * @param filterStr `~lib/string/String`
   * @returns `bool`
   */
  export function checkNumbersFilterFromJSON(number: string, filterStr: string): boolean;
  /**
   * assembly/testHelpers/checkVersionFiltersFromJSON
   * @param appVersion `~lib/string/String | null`
   * @param filterStr `~lib/string/String`
   * @returns `bool`
   */
  export function checkVersionFiltersFromJSON(appVersion: string | null, filterStr: string): boolean;
  /**
   * assembly/testHelpers/checkCustomDataFromJSON
   * @param data `~lib/string/String | null`
   * @param filterStr `~lib/string/String`
   * @returns `bool`
   */
  export function checkCustomDataFromJSON(data: string | null, filterStr: string): boolean;
  /**
   * assembly/testHelpers/evaluateOperatorFromJSON
   * @param operatorStr `~lib/string/String`
   * @param userStr `~lib/string/String`
   * @param audiencesStr `~lib/string/String | null`
   * @returns `~lib/string/String`
   */
  export function evaluateOperatorFromJSON(operatorStr: string, userStr: string, audiencesStr?: string | null): string;
  /**
   * assembly/testHelpers/decideTargetVariationFromJSON
   * @param targetStr `~lib/string/String`
   * @param boundedHash `f64`
   * @returns `~lib/string/String`
   */
  export function decideTargetVariationFromJSON(targetStr: string, boundedHash: number): string;
  /**
   * assembly/testHelpers/doesUserPassRolloutFromJSON
   * @param rolloutStr `~lib/string/String | null`
   * @param boundedHash `f64`
   * @returns `bool`
   */
  export function doesUserPassRolloutFromJSON(rolloutStr: string | null, boundedHash: number): boolean;
  /**
   * assembly/testHelpers/testConfigBodyClass
   * @param configStr `~lib/string/String`
   * @param etag `~lib/string/String | null`
   * @returns `~lib/string/String`
   */
  export function testConfigBodyClass(configStr: string, etag?: string | null): string;
  /**
   * assembly/testHelpers/testConfigBodyClassFromUTF8
   * @param configStr `~lib/typedarray/Uint8Array`
   * @param etag `~lib/string/String | null`
   * @returns `~lib/string/String`
   */
  export function testConfigBodyClassFromUTF8(configStr: Uint8Array, etag?: string | null): string;
  /**
   * assembly/testHelpers/testConfigBodyV2Class
   * @param configStr `~lib/string/String`
   * @param etag `~lib/string/String | null`
   * @returns `~lib/string/String`
   */
  export function testConfigBodyV2Class(configStr: string, etag?: string | null): string;
  /**
   * assembly/testHelpers/testConfigBodyV2ClassFromUTF8
   * @param configStr `~lib/typedarray/Uint8Array`
   * @param etag `~lib/string/String | null`
   * @returns `~lib/string/String`
   */
  export function testConfigBodyV2ClassFromUTF8(configStr: Uint8Array, etag?: string | null): string;
  /**
   * assembly/testHelpers/testDVCUserClass
   * @param userStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function testDVCUserClass(userStr: string): string;
  /**
   * assembly/testHelpers/testDVCUserClassFromUTF8
   * @param userStr `~lib/typedarray/Uint8Array`
   * @returns `~lib/string/String`
   */
  export function testDVCUserClassFromUTF8(userStr: Uint8Array): string;
  /**
   * assembly/testHelpers/testBucketedUserConfigClass
   * @param userConfigStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function testBucketedUserConfigClass(userConfigStr: string): string;
  /**
   * assembly/testHelpers/echoString
   * @param str `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function echoString(str: string): string;
  /**
   * assembly/testHelpers/echoUint8Array
   * @param data `~lib/typedarray/Uint8Array`
   * @returns `~lib/typedarray/Uint8Array`
   */
  export function echoUint8Array(data: Uint8Array): Uint8Array;
  /**
   * assembly/testHelpers/triggerAbort
   */
  export function triggerAbort(): void;
  /**
   * assembly/testHelpers/testSortObjectsByString
   * @param arr `~lib/array/Array<assembly/helpers/arrayHelpers/SortingArrayItem<assembly/testHelpers/TestData>>`
   * @param direction `~lib/string/String`
   * @returns `~lib/array/Array<assembly/testHelpers/TestData>`
   */
  export function testSortObjectsByString(arr: Array<__Record199<undefined>>, direction: string): Array<__Record198<never>>;
  /**
   * assembly/types/eventQueueOptions/testEventQueueOptionsClass
   * @param optionsStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function testEventQueueOptionsClass(optionsStr: string): string;
  /**
   * assembly/types/dvcEvent/testDVCEventClass
   * @param eventStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function testDVCEventClass(eventStr: string): string;
  /**
   * assembly/types/dvcEvent/testDVCRequestEventClass
   * @param eventStr `~lib/string/String`
   * @param user_id `~lib/string/String`
   * @param featureVarsStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function testDVCRequestEventClass(eventStr: string, user_id: string, featureVarsStr: string): string;
  /**
   * assembly/types/platformData/testPlatformDataClass
   * @param dataStr `~lib/string/String`
   * @returns `~lib/string/String`
   */
  export function testPlatformDataClass(dataStr: string): string;
  /**
   * assembly/types/platformData/testPlatformDataClassFromUTF8
   * @param dataStr `~lib/typedarray/Uint8Array`
   * @returns `~lib/string/String`
   */
  export function testPlatformDataClassFromUTF8(dataStr: Uint8Array): string;
}
/** ~lib/map/Map<~lib/string/String,assembly/types/bucketedUserConfig/FeatureVariation> */
declare class __Internref142 extends Number {
  private __nominal142: symbol;
  private __nominal0: symbol;
}
/** assembly/types/bucketedUserConfig/SDKVariable */
declare class __Internref143 extends Number {
  private __nominal143: symbol;
  private __nominal6: symbol;
  private __nominal7: symbol;
  private __nominal0: symbol;
}
/** assembly/testHelpers/TestData */
declare interface __Record198<TOmittable> {
  /** @type `~lib/string/String` */
  key: string;
}
/** assembly/helpers/arrayHelpers/SortingArrayItem<assembly/testHelpers/TestData> */
declare interface __Record199<TOmittable> {
  /** @type `~lib/string/String` */
  value: string;
  /** @type `assembly/testHelpers/TestData` */
  entry: __Record198<undefined>;
}
/** Instantiates the compiled WebAssembly module with the given imports. */
export declare function instantiate(module: WebAssembly.Module, imports: {
  env: unknown,
}): Promise<typeof __AdaptedExports>;
