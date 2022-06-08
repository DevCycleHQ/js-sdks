import * as debug from 'build/bucketing-lib.debug'
import * as release from 'build/bucketing-lib.release'

export const {
    generateBoundedHashesFromJSON,
    generateBucketedConfigForUser,
    setPlatformData,
    setConfigData,
    murmurhashV3,
    murmurhashV3_js,
    checkNumbersFilterFromJSON,
    checkVersionFiltersFromJSON,
    checkCustomDataFromJSON,
    evaluateOperatorFromJSON,
    decideTargetVariationFromJSON,
    doesUserPassRolloutFromJSON,
    testConfigBodyClass,
    testDVCUserClass,
    testBucketedUserConfigClass,
    testSortObjectsByString
} = (!!Number(process.env.DEVCYCLE_USE_DEBUG_WASM) ? debug : release)
