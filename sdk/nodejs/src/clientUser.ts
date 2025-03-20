import { DevCycleUser } from '@devcycle/js-cloud-server-sdk'

/**
 * This module handles client bootstrapping functionality that requires the js-client-sdk
 *
 * IMPORTANT: We intentionally keep this in a separate file and use dynamic imports
 * with string concatenation to prevent TypeScript and bundlers from creating a hard
 * dependency on @devcycle/js-client-sdk at build time.
 *
 * Why?
 * 1. @devcycle/js-client-sdk is only needed for the optional client bootstrapping feature
 * 2. We don't want to force all consumers to install this dependency if they don't use this feature
 * 3. This technique allows the module to remain an optional peer dependency
 * 4. The error handling in the client.ts file will provide a helpful message if the module is missing
 *
 * The string concatenation technique breaks static analysis of imports, preventing
 * bundlers from trying to resolve or include the module during build time.
 */
export const generateClientPopulatedUser = async (
    user: DevCycleUser,
    userAgent: string,
): Promise<any> => {
    const prefix = '@devcycle/'
    const suffix = 'js-client-sdk'
    const clientSdk = await import(prefix + suffix)
    return new clientSdk.DVCPopulatedUser(
        user,
        {},
        undefined,
        undefined,
        userAgent ?? undefined,
    )
}
