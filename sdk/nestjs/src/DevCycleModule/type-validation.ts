// Manual type validation test
// This file won't be included in the build, just used to manually verify type constraints

import { DevCycleModuleOptions } from './DevCycleModuleOptions'
import { ExecutionContext } from '@nestjs/common'

// ✅ Valid: userFactory only
const validConfig1: DevCycleModuleOptions = {
    key: 'test-key',
    userFactory: (context: ExecutionContext) => ({ user_id: 'test' })
}

// ✅ Valid: asyncUserFactory only
const validConfig2: DevCycleModuleOptions = {
    key: 'test-key',
    asyncUserFactory: async (context: ExecutionContext) => ({ user_id: 'test' })
}

// ✅ Valid: both factories (async takes precedence)
const validConfig3: DevCycleModuleOptions = {
    key: 'test-key',
    userFactory: (context: ExecutionContext) => ({ user_id: 'test' }),
    asyncUserFactory: async (context: ExecutionContext) => ({ user_id: 'test' })
}

// ❌ Invalid: neither factory provided (should cause TypeScript error)
// Uncomment the following to test:
// const invalidConfig: DevCycleModuleOptions = {
//     key: 'test-key'
// }

// Type checking validation passed!
export const typeValidationPassed = true