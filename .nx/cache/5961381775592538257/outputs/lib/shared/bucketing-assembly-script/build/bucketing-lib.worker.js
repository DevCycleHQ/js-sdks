exports.instantiate = async function instantiate(module, imports = {}) {
  const adaptedImports = {
    env: Object.assign(Object.create(globalThis), imports.env || {}, {
      abort(message, fileName, lineNumber, columnNumber) {
        // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
        message = __liftString(message >>> 0);
        fileName = __liftString(fileName >>> 0);
        lineNumber = lineNumber >>> 0;
        columnNumber = columnNumber >>> 0;
        (() => {
          // @external.js
          throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
        })();
      },
      "Date.now": (
        // ~lib/bindings/dom/Date.now() => f64
        Date.now
      ),
      "console.log"(text) {
        // ~lib/bindings/dom/console.log(~lib/string/String) => void
        text = __liftString(text >>> 0);
        console.log(text);
      },
      seed() {
        // ~lib/builtins/seed() => f64
        return (() => {
          // @external.js
          return Date.now() * Math.random();
        })();
      },
    }),
  };
  const { exports } = await WebAssembly.instantiate(module, adaptedImports);
  const memory = exports.memory || imports.env.memory;
  const adaptedExports = Object.setPrototypeOf({
    generateBoundedHashesFromJSON(user_id, target_id) {
      // assembly/index/generateBoundedHashesFromJSON(~lib/string/String, ~lib/string/String) => ~lib/string/String
      user_id = __retain(__lowerString(user_id) || __notnull());
      target_id = __lowerString(target_id) || __notnull();
      try {
        return __liftString(exports.generateBoundedHashesFromJSON(user_id, target_id) >>> 0);
      } finally {
        __release(user_id);
      }
    },
    generateBucketedConfigForUser(sdkKey, userJSONStr) {
      // assembly/index/generateBucketedConfigForUser(~lib/string/String, ~lib/string/String) => ~lib/string/String
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      userJSONStr = __lowerString(userJSONStr) || __notnull();
      try {
        return __liftString(exports.generateBucketedConfigForUser(sdkKey, userJSONStr) >>> 0);
      } finally {
        __release(sdkKey);
      }
    },
    generateBucketedConfigForUserUTF8(sdkKey, userJSONStr) {
      // assembly/index/generateBucketedConfigForUserUTF8(~lib/string/String, ~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      userJSONStr = __lowerTypedArray(Uint8Array, 9, 0, userJSONStr) || __notnull();
      try {
        return __liftTypedArray(Uint8Array, exports.generateBucketedConfigForUserUTF8(sdkKey, userJSONStr) >>> 0);
      } finally {
        __release(sdkKey);
      }
    },
    generateBucketedConfigForUserWithOverrides(sdkKey, userJSONStr, overridesJSONStr) {
      // assembly/index/generateBucketedConfigForUserWithOverrides(~lib/string/String, ~lib/typedarray/Uint8Array, ~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      userJSONStr = __retain(__lowerTypedArray(Uint8Array, 9, 0, userJSONStr) || __notnull());
      overridesJSONStr = __lowerTypedArray(Uint8Array, 9, 0, overridesJSONStr) || __notnull();
      try {
        return __liftTypedArray(Uint8Array, exports.generateBucketedConfigForUserWithOverrides(sdkKey, userJSONStr, overridesJSONStr) >>> 0);
      } finally {
        __release(sdkKey);
        __release(userJSONStr);
      }
    },
    VariableType: (values => (
      // assembly/index/VariableType
      values[values.Boolean = exports["VariableType.Boolean"].valueOf()] = "Boolean",
      values[values.Number = exports["VariableType.Number"].valueOf()] = "Number",
      values[values.String = exports["VariableType.String"].valueOf()] = "String",
      values[values.JSON = exports["VariableType.JSON"].valueOf()] = "JSON",
      values
    ))({}),
    VariableTypeStrings: {
      // assembly/index/VariableTypeStrings: ~lib/array/Array<~lib/string/String>
      valueOf() { return this.value; },
      get value() {
        return __liftArray(pointer => __liftString(__getU32(pointer)), 2, exports.VariableTypeStrings.value >>> 0);
      }
    },
    variableForUser_PB_Preallocated(protobuf, length) {
      // assembly/index/variableForUser_PB_Preallocated(~lib/typedarray/Uint8Array, i32) => ~lib/typedarray/Uint8Array | null
      protobuf = __lowerTypedArray(Uint8Array, 9, 0, protobuf) || __notnull();
      return __liftTypedArray(Uint8Array, exports.variableForUser_PB_Preallocated(protobuf, length) >>> 0);
    },
    variableForUser_PB(protobuf) {
      // assembly/index/variableForUser_PB(~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array | null
      protobuf = __lowerTypedArray(Uint8Array, 9, 0, protobuf) || __notnull();
      return __liftTypedArray(Uint8Array, exports.variableForUser_PB(protobuf) >>> 0);
    },
    variableForUser(sdkKey, userJSONStr, variableKey, variableType, shouldTrackEvent) {
      // assembly/index/variableForUser(~lib/string/String, ~lib/string/String, ~lib/string/String, i32, bool) => ~lib/string/String | null
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      userJSONStr = __retain(__lowerString(userJSONStr) || __notnull());
      variableKey = __lowerString(variableKey) || __notnull();
      shouldTrackEvent = shouldTrackEvent ? 1 : 0;
      try {
        return __liftString(exports.variableForUser(sdkKey, userJSONStr, variableKey, variableType, shouldTrackEvent) >>> 0);
      } finally {
        __release(sdkKey);
        __release(userJSONStr);
      }
    },
    variableForUserPreallocated(sdkKey, userStr, userStrLength, variableKey, variableKeyLength, variableType, shouldTrackEvent) {
      // assembly/index/variableForUserPreallocated(~lib/string/String, ~lib/string/String, i32, ~lib/string/String, i32, i32, bool) => ~lib/string/String | null
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      userStr = __retain(__lowerString(userStr) || __notnull());
      variableKey = __lowerString(variableKey) || __notnull();
      shouldTrackEvent = shouldTrackEvent ? 1 : 0;
      try {
        return __liftString(exports.variableForUserPreallocated(sdkKey, userStr, userStrLength, variableKey, variableKeyLength, variableType, shouldTrackEvent) >>> 0);
      } finally {
        __release(sdkKey);
        __release(userStr);
      }
    },
    setPlatformData(platformDataJSONStr) {
      // assembly/index/setPlatformData(~lib/string/String) => void
      platformDataJSONStr = __lowerString(platformDataJSONStr) || __notnull();
      exports.setPlatformData(platformDataJSONStr);
    },
    setPlatformDataUTF8(platformDataJSONStr) {
      // assembly/index/setPlatformDataUTF8(~lib/typedarray/Uint8Array) => void
      platformDataJSONStr = __lowerTypedArray(Uint8Array, 9, 0, platformDataJSONStr) || __notnull();
      exports.setPlatformDataUTF8(platformDataJSONStr);
    },
    clearPlatformData(empty) {
      // assembly/index/clearPlatformData(~lib/string/String | null?) => void
      empty = __lowerString(empty);
      exports.__setArgumentsLength(arguments.length);
      exports.clearPlatformData(empty);
    },
    setConfigDataUTF8Preallocated(sdkKey, configDataJSONStr, length) {
      // assembly/index/setConfigDataUTF8Preallocated(~lib/string/String, ~lib/typedarray/Uint8Array, i32) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      configDataJSONStr = __lowerTypedArray(Uint8Array, 9, 0, configDataJSONStr) || __notnull();
      try {
        exports.setConfigDataUTF8Preallocated(sdkKey, configDataJSONStr, length);
      } finally {
        __release(sdkKey);
      }
    },
    setConfigDataUTF8(sdkKey, configDataJSONStr) {
      // assembly/index/setConfigDataUTF8(~lib/string/String, ~lib/typedarray/Uint8Array) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      configDataJSONStr = __lowerTypedArray(Uint8Array, 9, 0, configDataJSONStr) || __notnull();
      try {
        exports.setConfigDataUTF8(sdkKey, configDataJSONStr);
      } finally {
        __release(sdkKey);
      }
    },
    setConfigData(sdkKey, configDataJSONStr) {
      // assembly/index/setConfigData(~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      configDataJSONStr = __lowerString(configDataJSONStr) || __notnull();
      try {
        exports.setConfigData(sdkKey, configDataJSONStr);
      } finally {
        __release(sdkKey);
      }
    },
    setConfigDataWithEtag(sdkKey, configDataJSONStr, etag) {
      // assembly/index/setConfigDataWithEtag(~lib/string/String, ~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      configDataJSONStr = __retain(__lowerString(configDataJSONStr) || __notnull());
      etag = __lowerString(etag) || __notnull();
      try {
        exports.setConfigDataWithEtag(sdkKey, configDataJSONStr, etag);
      } finally {
        __release(sdkKey);
        __release(configDataJSONStr);
      }
    },
    hasConfigDataForEtag(sdkKey, etag) {
      // assembly/index/hasConfigDataForEtag(~lib/string/String, ~lib/string/String) => bool
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      etag = __lowerString(etag) || __notnull();
      try {
        return exports.hasConfigDataForEtag(sdkKey, etag) != 0;
      } finally {
        __release(sdkKey);
      }
    },
    setClientCustomData(sdkKey, clientCustomDataJSONStr) {
      // assembly/index/setClientCustomData(~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      clientCustomDataJSONStr = __lowerString(clientCustomDataJSONStr) || __notnull();
      try {
        exports.setClientCustomData(sdkKey, clientCustomDataJSONStr);
      } finally {
        __release(sdkKey);
      }
    },
    setClientCustomDataUTF8(sdkKey, clientCustomDataUTF8) {
      // assembly/index/setClientCustomDataUTF8(~lib/string/String, ~lib/typedarray/Uint8Array) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      clientCustomDataUTF8 = __lowerTypedArray(Uint8Array, 9, 0, clientCustomDataUTF8) || __notnull();
      try {
        exports.setClientCustomDataUTF8(sdkKey, clientCustomDataUTF8);
      } finally {
        __release(sdkKey);
      }
    },
    getSDKKeyFromConfig(sdkKey) {
      // assembly/index/getSDKKeyFromConfig(~lib/string/String) => ~lib/string/String | null
      sdkKey = __lowerString(sdkKey) || __notnull();
      return __liftString(exports.getSDKKeyFromConfig(sdkKey) >>> 0);
    },
    getConfigMetadata(sdkKey) {
      // assembly/index/getConfigMetadata(~lib/string/String) => ~lib/string/String
      sdkKey = __lowerString(sdkKey) || __notnull();
      return __liftString(exports.getConfigMetadata(sdkKey) >>> 0);
    },
    murmurhashV3(key, seed) {
      // assembly/helpers/murmurhash/murmurhashV3(~lib/string/String, u32) => u32
      key = __lowerString(key) || __notnull();
      return exports.murmurhashV3(key, seed) >>> 0;
    },
    murmurhashV3_js(key, seed) {
      // assembly/helpers/murmurhash/murmurhashV3_js(~lib/string/String, u32) => ~lib/string/String
      key = __lowerString(key) || __notnull();
      return __liftString(exports.murmurhashV3_js(key, seed) >>> 0);
    },
    initEventQueue(sdkKey, clientUUID, optionsStr) {
      // assembly/managers/eventQueueManager/initEventQueue(~lib/string/String, ~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      clientUUID = __retain(__lowerString(clientUUID) || __notnull());
      optionsStr = __lowerString(optionsStr) || __notnull();
      try {
        exports.initEventQueue(sdkKey, clientUUID, optionsStr);
      } finally {
        __release(sdkKey);
        __release(clientUUID);
      }
    },
    flushEventQueue(sdkKey) {
      // assembly/managers/eventQueueManager/flushEventQueue(~lib/string/String) => ~lib/string/String
      sdkKey = __lowerString(sdkKey) || __notnull();
      return __liftString(exports.flushEventQueue(sdkKey) >>> 0);
    },
    onPayloadSuccess(sdkKey, payloadId) {
      // assembly/managers/eventQueueManager/onPayloadSuccess(~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      payloadId = __lowerString(payloadId) || __notnull();
      try {
        exports.onPayloadSuccess(sdkKey, payloadId);
      } finally {
        __release(sdkKey);
      }
    },
    onPayloadFailure(sdkKey, payloadId, retryable) {
      // assembly/managers/eventQueueManager/onPayloadFailure(~lib/string/String, ~lib/string/String, bool) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      payloadId = __lowerString(payloadId) || __notnull();
      retryable = retryable ? 1 : 0;
      try {
        exports.onPayloadFailure(sdkKey, payloadId, retryable);
      } finally {
        __release(sdkKey);
      }
    },
    queueEvent(sdkKey, userStr, eventStr) {
      // assembly/managers/eventQueueManager/queueEvent(~lib/string/String, ~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      userStr = __retain(__lowerString(userStr) || __notnull());
      eventStr = __lowerString(eventStr) || __notnull();
      try {
        exports.queueEvent(sdkKey, userStr, eventStr);
      } finally {
        __release(sdkKey);
        __release(userStr);
      }
    },
    queueAggregateEvent(sdkKey, eventStr, variableVariationMapStr) {
      // assembly/managers/eventQueueManager/queueAggregateEvent(~lib/string/String, ~lib/string/String, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      eventStr = __retain(__lowerString(eventStr) || __notnull());
      variableVariationMapStr = __lowerString(variableVariationMapStr) || __notnull();
      try {
        exports.queueAggregateEvent(sdkKey, eventStr, variableVariationMapStr);
      } finally {
        __release(sdkKey);
        __release(eventStr);
      }
    },
    queueVariableEvaluatedEvent_JSON(sdkKey, varVariationMapString, variable, variableKey) {
      // assembly/managers/eventQueueManager/queueVariableEvaluatedEvent_JSON(~lib/string/String, ~lib/string/String, ~lib/string/String | null, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      varVariationMapString = __retain(__lowerString(varVariationMapString) || __notnull());
      variable = __retain(__lowerString(variable));
      variableKey = __lowerString(variableKey) || __notnull();
      try {
        exports.queueVariableEvaluatedEvent_JSON(sdkKey, varVariationMapString, variable, variableKey);
      } finally {
        __release(sdkKey);
        __release(varVariationMapString);
        __release(variable);
      }
    },
    queueVariableEvaluatedEvent(sdkKey, variableVariationMap, variable, variableKey) {
      // assembly/managers/eventQueueManager/queueVariableEvaluatedEvent(~lib/string/String, ~lib/map/Map<~lib/string/String,assembly/types/bucketedUserConfig/FeatureVariation>, assembly/types/bucketedUserConfig/SDKVariable | null, ~lib/string/String) => void
      sdkKey = __retain(__lowerString(sdkKey) || __notnull());
      variableVariationMap = __retain(__lowerInternref(variableVariationMap) || __notnull());
      variable = __retain(__lowerInternref(variable));
      variableKey = __lowerString(variableKey) || __notnull();
      try {
        exports.queueVariableEvaluatedEvent(sdkKey, variableVariationMap, variable, variableKey);
      } finally {
        __release(sdkKey);
        __release(variableVariationMap);
        __release(variable);
      }
    },
    cleanupEventQueue(sdkKey) {
      // assembly/managers/eventQueueManager/cleanupEventQueue(~lib/string/String) => void
      sdkKey = __lowerString(sdkKey) || __notnull();
      exports.cleanupEventQueue(sdkKey);
    },
    eventQueueSize(sdkKey) {
      // assembly/managers/eventQueueManager/eventQueueSize(~lib/string/String) => i32
      sdkKey = __lowerString(sdkKey) || __notnull();
      return exports.eventQueueSize(sdkKey);
    },
    testVariableForUserParams_PB(buffer) {
      // assembly/testHelpers/testVariableForUserParams_PB(~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array
      buffer = __lowerTypedArray(Uint8Array, 9, 0, buffer) || __notnull();
      return __liftTypedArray(Uint8Array, exports.testVariableForUserParams_PB(buffer) >>> 0);
    },
    testDVCUser_PB(buffer) {
      // assembly/testHelpers/testDVCUser_PB(~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array
      buffer = __lowerTypedArray(Uint8Array, 9, 0, buffer) || __notnull();
      return __liftTypedArray(Uint8Array, exports.testDVCUser_PB(buffer) >>> 0);
    },
    testSDKVariable_PB(buffer) {
      // assembly/testHelpers/testSDKVariable_PB(~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array
      buffer = __lowerTypedArray(Uint8Array, 9, 0, buffer) || __notnull();
      return __liftTypedArray(Uint8Array, exports.testSDKVariable_PB(buffer) >>> 0);
    },
    checkNumbersFilterFromJSON(number, filterStr) {
      // assembly/testHelpers/checkNumbersFilterFromJSON(~lib/string/String, ~lib/string/String) => bool
      number = __retain(__lowerString(number) || __notnull());
      filterStr = __lowerString(filterStr) || __notnull();
      try {
        return exports.checkNumbersFilterFromJSON(number, filterStr) != 0;
      } finally {
        __release(number);
      }
    },
    checkVersionFiltersFromJSON(appVersion, filterStr) {
      // assembly/testHelpers/checkVersionFiltersFromJSON(~lib/string/String | null, ~lib/string/String) => bool
      appVersion = __retain(__lowerString(appVersion));
      filterStr = __lowerString(filterStr) || __notnull();
      try {
        return exports.checkVersionFiltersFromJSON(appVersion, filterStr) != 0;
      } finally {
        __release(appVersion);
      }
    },
    checkCustomDataFromJSON(data, filterStr) {
      // assembly/testHelpers/checkCustomDataFromJSON(~lib/string/String | null, ~lib/string/String) => bool
      data = __retain(__lowerString(data));
      filterStr = __lowerString(filterStr) || __notnull();
      try {
        return exports.checkCustomDataFromJSON(data, filterStr) != 0;
      } finally {
        __release(data);
      }
    },
    evaluateOperatorFromJSON(operatorStr, userStr, audiencesStr) {
      // assembly/testHelpers/evaluateOperatorFromJSON(~lib/string/String, ~lib/string/String, ~lib/string/String | null?) => ~lib/string/String
      operatorStr = __retain(__lowerString(operatorStr) || __notnull());
      userStr = __retain(__lowerString(userStr) || __notnull());
      audiencesStr = __lowerString(audiencesStr);
      try {
        exports.__setArgumentsLength(arguments.length);
        return __liftString(exports.evaluateOperatorFromJSON(operatorStr, userStr, audiencesStr) >>> 0);
      } finally {
        __release(operatorStr);
        __release(userStr);
      }
    },
    decideTargetVariationFromJSON(targetStr, boundedHash) {
      // assembly/testHelpers/decideTargetVariationFromJSON(~lib/string/String, f64) => ~lib/string/String
      targetStr = __lowerString(targetStr) || __notnull();
      return __liftString(exports.decideTargetVariationFromJSON(targetStr, boundedHash) >>> 0);
    },
    doesUserPassRolloutFromJSON(rolloutStr, boundedHash) {
      // assembly/testHelpers/doesUserPassRolloutFromJSON(~lib/string/String | null, f64) => bool
      rolloutStr = __lowerString(rolloutStr);
      return exports.doesUserPassRolloutFromJSON(rolloutStr, boundedHash) != 0;
    },
    testConfigBodyClass(configStr, etag) {
      // assembly/testHelpers/testConfigBodyClass(~lib/string/String, ~lib/string/String | null?) => ~lib/string/String
      configStr = __retain(__lowerString(configStr) || __notnull());
      etag = __lowerString(etag);
      try {
        exports.__setArgumentsLength(arguments.length);
        return __liftString(exports.testConfigBodyClass(configStr, etag) >>> 0);
      } finally {
        __release(configStr);
      }
    },
    testConfigBodyClassFromUTF8(configStr, etag) {
      // assembly/testHelpers/testConfigBodyClassFromUTF8(~lib/typedarray/Uint8Array, ~lib/string/String | null?) => ~lib/string/String
      configStr = __retain(__lowerTypedArray(Uint8Array, 9, 0, configStr) || __notnull());
      etag = __lowerString(etag);
      try {
        exports.__setArgumentsLength(arguments.length);
        return __liftString(exports.testConfigBodyClassFromUTF8(configStr, etag) >>> 0);
      } finally {
        __release(configStr);
      }
    },
    testConfigBodyV2Class(configStr, etag) {
      // assembly/testHelpers/testConfigBodyV2Class(~lib/string/String, ~lib/string/String | null?) => ~lib/string/String
      configStr = __retain(__lowerString(configStr) || __notnull());
      etag = __lowerString(etag);
      try {
        exports.__setArgumentsLength(arguments.length);
        return __liftString(exports.testConfigBodyV2Class(configStr, etag) >>> 0);
      } finally {
        __release(configStr);
      }
    },
    testConfigBodyV2ClassFromUTF8(configStr, etag) {
      // assembly/testHelpers/testConfigBodyV2ClassFromUTF8(~lib/typedarray/Uint8Array, ~lib/string/String | null?) => ~lib/string/String
      configStr = __retain(__lowerTypedArray(Uint8Array, 9, 0, configStr) || __notnull());
      etag = __lowerString(etag);
      try {
        exports.__setArgumentsLength(arguments.length);
        return __liftString(exports.testConfigBodyV2ClassFromUTF8(configStr, etag) >>> 0);
      } finally {
        __release(configStr);
      }
    },
    testDVCUserClass(userStr) {
      // assembly/testHelpers/testDVCUserClass(~lib/string/String) => ~lib/string/String
      userStr = __lowerString(userStr) || __notnull();
      return __liftString(exports.testDVCUserClass(userStr) >>> 0);
    },
    testDVCUserClassFromUTF8(userStr) {
      // assembly/testHelpers/testDVCUserClassFromUTF8(~lib/typedarray/Uint8Array) => ~lib/string/String
      userStr = __lowerTypedArray(Uint8Array, 9, 0, userStr) || __notnull();
      return __liftString(exports.testDVCUserClassFromUTF8(userStr) >>> 0);
    },
    testBucketedUserConfigClass(userConfigStr) {
      // assembly/testHelpers/testBucketedUserConfigClass(~lib/string/String) => ~lib/string/String
      userConfigStr = __lowerString(userConfigStr) || __notnull();
      return __liftString(exports.testBucketedUserConfigClass(userConfigStr) >>> 0);
    },
    echoString(str) {
      // assembly/testHelpers/echoString(~lib/string/String) => ~lib/string/String
      str = __lowerString(str) || __notnull();
      return __liftString(exports.echoString(str) >>> 0);
    },
    echoUint8Array(data) {
      // assembly/testHelpers/echoUint8Array(~lib/typedarray/Uint8Array) => ~lib/typedarray/Uint8Array
      data = __lowerTypedArray(Uint8Array, 9, 0, data) || __notnull();
      return __liftTypedArray(Uint8Array, exports.echoUint8Array(data) >>> 0);
    },
    testSortObjectsByString(arr, direction) {
      // assembly/testHelpers/testSortObjectsByString(~lib/array/Array<assembly/helpers/arrayHelpers/SortingArrayItem<assembly/testHelpers/TestData>>, ~lib/string/String) => ~lib/array/Array<assembly/testHelpers/TestData>
      arr = __retain(__lowerArray((pointer, value) => { __setU32(pointer, __lowerRecord199(value) || __notnull()); }, 200, 2, arr) || __notnull());
      direction = __lowerString(direction) || __notnull();
      try {
        return __liftArray(pointer => __liftRecord198(__getU32(pointer)), 2, exports.testSortObjectsByString(arr, direction) >>> 0);
      } finally {
        __release(arr);
      }
    },
    testEventQueueOptionsClass(optionsStr) {
      // assembly/types/eventQueueOptions/testEventQueueOptionsClass(~lib/string/String) => ~lib/string/String
      optionsStr = __lowerString(optionsStr) || __notnull();
      return __liftString(exports.testEventQueueOptionsClass(optionsStr) >>> 0);
    },
    testDVCEventClass(eventStr) {
      // assembly/types/dvcEvent/testDVCEventClass(~lib/string/String) => ~lib/string/String
      eventStr = __lowerString(eventStr) || __notnull();
      return __liftString(exports.testDVCEventClass(eventStr) >>> 0);
    },
    testDVCRequestEventClass(eventStr, user_id, featureVarsStr) {
      // assembly/types/dvcEvent/testDVCRequestEventClass(~lib/string/String, ~lib/string/String, ~lib/string/String) => ~lib/string/String
      eventStr = __retain(__lowerString(eventStr) || __notnull());
      user_id = __retain(__lowerString(user_id) || __notnull());
      featureVarsStr = __lowerString(featureVarsStr) || __notnull();
      try {
        return __liftString(exports.testDVCRequestEventClass(eventStr, user_id, featureVarsStr) >>> 0);
      } finally {
        __release(eventStr);
        __release(user_id);
      }
    },
    testPlatformDataClass(dataStr) {
      // assembly/types/platformData/testPlatformDataClass(~lib/string/String) => ~lib/string/String
      dataStr = __lowerString(dataStr) || __notnull();
      return __liftString(exports.testPlatformDataClass(dataStr) >>> 0);
    },
    testPlatformDataClassFromUTF8(dataStr) {
      // assembly/types/platformData/testPlatformDataClassFromUTF8(~lib/typedarray/Uint8Array) => ~lib/string/String
      dataStr = __lowerTypedArray(Uint8Array, 9, 0, dataStr) || __notnull();
      return __liftString(exports.testPlatformDataClassFromUTF8(dataStr) >>> 0);
    },
  }, exports);
  function __lowerRecord198(value) {
    // assembly/testHelpers/TestData
    // Hint: Opt-out from lowering as a record by providing an empty constructor
    if (value == null) return 0;
    const pointer = exports.__pin(exports.__new(4, 198));
    __setU32(pointer + 0, __lowerString(value.key) || __notnull());
    exports.__unpin(pointer);
    return pointer;
  }
  function __lowerRecord199(value) {
    // assembly/helpers/arrayHelpers/SortingArrayItem<assembly/testHelpers/TestData>
    // Hint: Opt-out from lowering as a record by providing an empty constructor
    if (value == null) return 0;
    const pointer = exports.__pin(exports.__new(8, 199));
    __setU32(pointer + 0, __lowerString(value.value) || __notnull());
    __setU32(pointer + 4, __lowerRecord198(value.entry) || __notnull());
    exports.__unpin(pointer);
    return pointer;
  }
  function __liftRecord198(pointer) {
    // assembly/testHelpers/TestData
    // Hint: Opt-out from lifting as a record by providing an empty constructor
    if (!pointer) return null;
    return {
      key: __liftString(__getU32(pointer + 0)),
    };
  }
  function __liftString(pointer) {
    if (!pointer) return null;
    const
      end = pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2] >>> 1,
      memoryU16 = new Uint16Array(memory.buffer);
    let
      start = pointer >>> 1,
      string = "";
    while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
    return string + String.fromCharCode(...memoryU16.subarray(start, end));
  }
  function __lowerString(value) {
    if (value == null) return 0;
    const
      length = value.length,
      pointer = exports.__new(length << 1, 2) >>> 0,
      memoryU16 = new Uint16Array(memory.buffer);
    for (let i = 0; i < length; ++i) memoryU16[(pointer >>> 1) + i] = value.charCodeAt(i);
    return pointer;
  }
  function __liftArray(liftElement, align, pointer) {
    if (!pointer) return null;
    const
      dataStart = __getU32(pointer + 4),
      length = __dataview.getUint32(pointer + 12, true),
      values = new Array(length);
    for (let i = 0; i < length; ++i) values[i] = liftElement(dataStart + (i << align >>> 0));
    return values;
  }
  function __lowerArray(lowerElement, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__pin(exports.__new(16, id)) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    __dataview.setUint32(header + 12, length, true);
    for (let i = 0; i < length; ++i) lowerElement(buffer + (i << align >>> 0), values[i]);
    exports.__unpin(buffer);
    exports.__unpin(header);
    return header;
  }
  function __liftTypedArray(constructor, pointer) {
    if (!pointer) return null;
    return new constructor(
      memory.buffer,
      __getU32(pointer + 4),
      __dataview.getUint32(pointer + 8, true) / constructor.BYTES_PER_ELEMENT
    ).slice();
  }
  function __lowerTypedArray(constructor, id, align, values) {
    if (values == null) return 0;
    const
      length = values.length,
      buffer = exports.__pin(exports.__new(length << align, 1)) >>> 0,
      header = exports.__new(12, id) >>> 0;
    __setU32(header + 0, buffer);
    __dataview.setUint32(header + 4, buffer, true);
    __dataview.setUint32(header + 8, length << align, true);
    new constructor(memory.buffer, buffer, length).set(values);
    exports.__unpin(buffer);
    return header;
  }
  class Internref extends Number {}
  function __lowerInternref(value) {
    if (value == null) return 0;
    if (value instanceof Internref) return value.valueOf();
    throw TypeError("internref expected");
  }
  const refcounts = new Map();
  function __retain(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount) refcounts.set(pointer, refcount + 1);
      else refcounts.set(exports.__pin(pointer), 1);
    }
    return pointer;
  }
  function __release(pointer) {
    if (pointer) {
      const refcount = refcounts.get(pointer);
      if (refcount === 1) exports.__unpin(pointer), refcounts.delete(pointer);
      else if (refcount) refcounts.set(pointer, refcount - 1);
      else throw Error(`invalid refcount '${refcount}' for reference '${pointer}'`);
    }
  }
  function __notnull() {
    throw TypeError("value must not be null");
  }
  let __dataview = new DataView(memory.buffer);
  function __setU32(pointer, value) {
    try {
      __dataview.setUint32(pointer, value, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      __dataview.setUint32(pointer, value, true);
    }
  }
  function __getU32(pointer) {
    try {
      return __dataview.getUint32(pointer, true);
    } catch {
      __dataview = new DataView(memory.buffer);
      return __dataview.getUint32(pointer, true);
    }
  }
  return adaptedExports;
}
