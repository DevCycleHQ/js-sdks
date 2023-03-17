import { benchmarkSuite } from 'jest-bench'
import {
    cleanupSDK,
    initSDK,
    variableForUser,
    variableForUserPreallocated,
    variableForUser_PB
} from '../__tests__/variableSetupHelper'
import { VariableType } from '../__tests__/bucketingImportHelper'

const user = {
    country: 'canada',
    user_id: 'asuh',
    email: 'test'
}

benchmarkSuite('variableForUser', {
    setupSuite() {
        initSDK()
    },
    teardownSuite() {
        cleanupSDK()
    },
    ['variableForUser']: () => {
        variableForUser({ user, variableKey: 'swagTest', variableType: VariableType.String })
    },
    ['variableForUserPreallocated']: () => {
        variableForUserPreallocated({ user, variableKey: 'swagTest', variableType: VariableType.String })
    },
    ['variableForUser_PB']: () => {
        variableForUser_PB({ user, variableKey: 'swagTest', variableType: VariableType.String })
    }
})
