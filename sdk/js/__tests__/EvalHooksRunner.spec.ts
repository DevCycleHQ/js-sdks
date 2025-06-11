import { EvaluationHooksRunner } from '../src/hooks/EvalHooksRunner'
import { EvalHook } from '../src/hooks/EvalHook'
import { HookContext } from '../src/hooks/HookContext'
import { DVCVariableValue } from '../src/types'

describe('HooksRunner', () => {
    let hooksRunner: EvaluationHooksRunner<DVCVariableValue>
    let mockBefore: jest.Mock
    let mockAfter: jest.Mock
    let mockError: jest.Mock
    let mockFinally: jest.Mock
    let mockHook: EvalHook<DVCVariableValue>
    let mockResolver: jest.Mock
    let mockUser: { [key: string]: string }
    let mockKey: string
    let mockDefaultValue: DVCVariableValue

    beforeEach(() => {
        mockBefore = jest.fn()
        mockAfter = jest.fn()
        mockError = jest.fn()
        mockFinally = jest.fn()
        mockHook = new EvalHook(mockBefore, mockAfter, mockFinally, mockError)
        mockResolver = jest.fn().mockReturnValue({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
        mockUser = { user_id: 'test-user' }
        mockKey = 'test-key'
        mockDefaultValue = 'default-value'
        hooksRunner = new EvaluationHooksRunner([mockHook])
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should run hooks in correct order when resolver succeeds', async () => {
        mockResolver.mockResolvedValue({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledTimes(1)
        expect(mockError).not.toHaveBeenCalled()
        expect(mockResolver).toHaveBeenCalledTimes(1)

        // Verify hook context and order
        const expectedContext = new HookContext(
            mockUser,
            mockKey,
            mockDefaultValue,
            {},
            {
                key: mockKey,
                value: 'test-value',
                isDefaulted: false,
            },
        )
        expect(mockBefore).toHaveBeenCalledWith(expectedContext)
        expect(mockBefore.mock.invocationCallOrder[0]).toBeLessThan(
            mockAfter.mock.invocationCallOrder[0],
        )
        expect(mockAfter).toHaveBeenCalledWith(expectedContext)
        expect(mockFinally).toHaveBeenCalledWith(expectedContext)

        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should run hooks in correct order when resolver fails', async () => {
        const error = new Error('Test error')
        mockResolver.mockRejectedValue(error)

        await expect(
            hooksRunner.runHooksForEvaluation(
                mockUser,
                mockKey,
                mockDefaultValue,
                mockResolver,
            ),
        ).rejects.toThrow('Test error')

        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockAfter).not.toHaveBeenCalled()
        expect(mockError).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledTimes(1)
        expect(mockResolver).toHaveBeenCalledTimes(1)

        // Verify hook context
        const expectedContext = new HookContext(
            mockUser,
            mockKey,
            mockDefaultValue,
            {},
        )
        expect(mockBefore).toHaveBeenCalledWith(expectedContext)
        expect(mockBefore.mock.invocationCallOrder[0]).toBeLessThan(
            mockError.mock.invocationCallOrder[0],
        )
        expect(mockError).toHaveBeenCalledWith(expectedContext, error)
        expect(mockError.mock.invocationCallOrder[0]).toBeLessThan(
            mockFinally.mock.invocationCallOrder[0],
        )
        expect(mockFinally).toHaveBeenCalledWith(expectedContext)
    })

    it('should run multiple hooks in correct order', async () => {
        const mockHook2Before = jest.fn()
        const mockHook2After = jest.fn()
        const mockHook2Finally = jest.fn()
        const mockHook2Error = jest.fn()
        const mockHook2 = new EvalHook(
            mockHook2Before,
            mockHook2After,
            mockHook2Finally,
            mockHook2Error,
        )
        hooksRunner = new EvaluationHooksRunner()
        hooksRunner.enqueue(mockHook)
        hooksRunner.enqueue(mockHook2)

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        // Verify hooks are run in correct order by checking call order
        const beforeCalls = [
            mockBefore.mock.invocationCallOrder[0],
            mockHook2Before.mock.invocationCallOrder[0],
        ]
        const afterCalls = [
            mockAfter.mock.invocationCallOrder[0],
            mockHook2After.mock.invocationCallOrder[0],
        ]
        const finallyCalls = [
            mockFinally.mock.invocationCallOrder[0],
            mockHook2Finally.mock.invocationCallOrder[0],
        ]

        expect(beforeCalls[0]).toBeLessThan(beforeCalls[1])
        expect(afterCalls[0]).toBeGreaterThan(afterCalls[1])
        expect(finallyCalls[0]).toBeGreaterThan(finallyCalls[1])

        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should work with no hooks', async () => {
        hooksRunner = new EvaluationHooksRunner([])

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockResolver).toHaveBeenCalledTimes(1)
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow modifying context metadata in before hooks', async () => {
        const modifiedMetadata = { testKey: 'testValue' }
        mockBefore.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.testKey = 'testValue'
            },
        )

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockAfter).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: modifiedMetadata,
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow modifying context metadata in after hooks', async () => {
        const modifiedMetadata = { testKey: 'testValue' }
        mockAfter.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.testKey = 'testValue'
            },
        )

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: modifiedMetadata,
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should preserve context metadata modifications between hooks', async () => {
        const modifiedMetadata = { testKey: 'testValue' }
        mockBefore.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.testKey = 'testValue'
            },
        )

        mockAfter.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                expect(context.metadata).toEqual(modifiedMetadata)
            },
        )

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: modifiedMetadata,
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow multiple hooks to modify context metadata in sequence', async () => {
        const mockHook2Before = jest.fn()
        const mockHook2After = jest.fn()
        const mockHook2Finally = jest.fn()
        const mockHook2Error = jest.fn()
        const mockHook2 = new EvalHook(
            mockHook2Before,
            mockHook2After,
            mockHook2Finally,
            mockHook2Error,
        )

        // First hook adds firstKey
        mockBefore.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.firstKey = 'firstValue'
            },
        )

        // Second hook adds secondKey
        mockHook2Before.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.secondKey = 'secondValue'
            },
        )

        hooksRunner = new EvaluationHooksRunner()
        hooksRunner.enqueue(mockHook)
        hooksRunner.enqueue(mockHook2)

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        // Verify both hooks were called
        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockHook2Before).toHaveBeenCalledTimes(1)

        // Verify final context has both modifications
        expect(mockAfter).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: {
                    firstKey: 'firstValue',
                    secondKey: 'secondValue',
                },
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow later hooks to see metadata modifications from earlier hooks', async () => {
        const mockHook2Before = jest.fn()
        const mockHook2After = jest.fn()
        const mockHook2Finally = jest.fn()
        const mockHook2Error = jest.fn()
        const mockHook2 = new EvalHook(
            mockHook2Before,
            mockHook2After,
            mockHook2Finally,
            mockHook2Error,
        )

        // First hook adds a value
        mockBefore.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.sharedKey = 'initialValue'
            },
        )

        // Second hook reads and modifies the value
        mockHook2Before.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                expect(context.metadata.sharedKey).toBe('initialValue')
                context.metadata.sharedKey = 'modifiedValue'
            },
        )

        hooksRunner = new EvaluationHooksRunner()
        hooksRunner.enqueue(mockHook)
        hooksRunner.enqueue(mockHook2)

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        // Verify both hooks were called
        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockHook2Before).toHaveBeenCalledTimes(1)

        // Verify final context has the modified value
        expect(mockAfter).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: {
                    sharedKey: 'modifiedValue',
                },
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should preserve metadata modifications in after hooks across multiple hooks', async () => {
        const mockHook2Before = jest.fn()
        const mockHook2After = jest.fn()
        const mockHook2Finally = jest.fn()
        const mockHook2Error = jest.fn()
        const mockHook2 = new EvalHook(
            mockHook2Before,
            mockHook2After,
            mockHook2Finally,
            mockHook2Error,
        )

        // First hook adds metadata in after
        mockAfter.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.firstKey = 'firstValue'
            },
        )

        // Second hook adds metadata in after
        mockHook2After.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.secondKey = 'secondValue'
            },
        )

        hooksRunner = new EvaluationHooksRunner()
        hooksRunner.enqueue(mockHook)
        hooksRunner.enqueue(mockHook2)

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        // Verify both hooks were called
        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockHook2After).toHaveBeenCalledTimes(1)

        // Verify final context has both modifications
        expect(mockFinally).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: {
                    firstKey: 'firstValue',
                    secondKey: 'secondValue',
                },
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow modifying user in before hooks', async () => {
        const modifiedUser = { user_id: 'modified-user' }
        mockBefore.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.user = modifiedUser
            },
        )

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockAfter).toHaveBeenCalledWith(
            expect.objectContaining({
                user: modifiedUser,
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow modifying evaluation context in after hooks', async () => {
        const modifiedContext = {
            key: 'modified-key',
            value: 'modified-value',
            isDefaulted: true,
        }
        mockAfter.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.evaluationContext = modifiedContext
            },
        )

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        expect(mockAfter).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledTimes(1)
        expect(mockFinally).toHaveBeenCalledWith(
            expect.objectContaining({
                evaluationContext: modifiedContext,
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })

    it('should allow modifying multiple context properties in sequence', async () => {
        const mockHook2Before = jest.fn()
        const mockHook2After = jest.fn()
        const mockHook2Finally = jest.fn()
        const mockHook2Error = jest.fn()
        const mockHook2 = new EvalHook(
            mockHook2Before,
            mockHook2After,
            mockHook2Finally,
            mockHook2Error,
        )

        // First hook modifies user
        mockBefore.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.user = { user_id: 'first-user' }
            },
        )

        // Second hook adds metadata
        mockHook2Before.mockImplementation(
            (context: HookContext<DVCVariableValue>) => {
                context.metadata.secondKey = 'secondValue'
            },
        )

        hooksRunner = new EvaluationHooksRunner()
        hooksRunner.enqueue(mockHook)
        hooksRunner.enqueue(mockHook2)

        const returnValue = await hooksRunner.runHooksForEvaluation(
            mockUser,
            mockKey,
            mockDefaultValue,
            mockResolver,
        )

        // Verify both hooks were called
        expect(mockBefore).toHaveBeenCalledTimes(1)
        expect(mockHook2Before).toHaveBeenCalledTimes(1)

        // Verify final context has all modifications
        expect(mockAfter).toHaveBeenCalledWith(
            expect.objectContaining({
                user: { user_id: 'first-user' },
                metadata: {
                    secondKey: 'secondValue',
                },
            }),
        )
        expect(returnValue).toEqual({
            key: 'test-key',
            value: 'test-value',
            isDefaulted: false,
        })
    })
})
