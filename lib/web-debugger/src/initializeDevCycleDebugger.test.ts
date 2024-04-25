import { checkShouldEnable } from './initializeDevCycleDebugger'
import { DevCycleClient } from '@devcycle/js-client-sdk'

const createMockClient = (variables: Record<string, unknown>) => {
    return {
        onClientInitialized: () => Promise.resolve(),
        variableValue: jest
            .fn()
            .mockImplementation((key: string, defaultValue: unknown) => {
                return variables[key] ?? defaultValue
            }),
    } as unknown as DevCycleClient
}

describe('initializeDevCycleDebugger', () => {
    describe('checkShouldEnable', () => {
        it('should return true when devcycle variable returns true', async () => {
            expect(
                await checkShouldEnable(createMockClient({ enableVar: true }), {
                    shouldEnableVariable: 'enableVar',
                }),
            ).toBe(true)
        })

        it('should return false when devcycle variable returns false', async () => {
            expect(
                await checkShouldEnable(
                    createMockClient({ enableVar: false }),
                    {
                        shouldEnableVariable: 'enableVar',
                    },
                ),
            ).toBe(false)
        })

        it('should return false when variable does not exist', async () => {
            expect(
                await checkShouldEnable(
                    createMockClient({ somethingElse: true }),
                    {
                        shouldEnableVariable: 'enableVar',
                    },
                ),
            ).toBe(false)
        })

        it('should return true when shouldEnable is true', async () => {
            expect(
                await checkShouldEnable(createMockClient({}), {
                    shouldEnable: true,
                }),
            ).toBe(true)
        })

        it('should return false when shouldEnable is false', async () => {
            expect(
                await checkShouldEnable(createMockClient({}), {
                    shouldEnable: false,
                }),
            ).toBe(false)
        })

        it('should return true when shouldEnable is a function that returns true', async () => {
            expect(
                await checkShouldEnable(createMockClient({}), {
                    shouldEnable: () => true,
                }),
            ).toBe(true)
        })

        it('should return false when shouldEnable is a function that returns false', async () => {
            expect(
                await checkShouldEnable(createMockClient({}), {
                    shouldEnable: () => false,
                }),
            ).toBe(false)
        })

        it(
            'should return false when devcycle' +
                ' variable returns true but shouldEnable is also set to false',
            async () => {
                expect(
                    await checkShouldEnable(
                        createMockClient({ enableVar: true }),
                        {
                            shouldEnableVariable: 'enableVar',
                            shouldEnable: false,
                        },
                    ),
                ).toBe(false)
            },
        )
    })
})
