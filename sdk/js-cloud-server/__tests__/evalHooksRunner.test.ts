import { EvalHook } from '../src/hooks/EvalHook'
import { EvalHooksRunner } from '../src/hooks/EvalHooksRunner'

describe('EvalHooksRunner', () => {
    it('should run hooks in correct order when resolver succeeds', async () => {
        const hooksRunner = new EvalHooksRunner()
        const hook1 = new EvalHook(
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        const hook2 = new EvalHook(
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        hooksRunner.enqueue(hook1)
        hooksRunner.enqueue(hook2)
        const result = await hooksRunner.runHooksForEvaluation(
            { user_id: 'test-user' },
            'test-key',
            'test-value',
            {},
            async () => {
                return {
                    key: 'test-key',
                    defaultValue: 'test-value',
                    type: 'String',
                    value: 'test-value',
                    isDefaulted: false,
                }
            },
        )
        expect(result).toEqual({
            key: 'test-key',
            defaultValue: 'test-value',
            isDefaulted: false,
            type: 'String',
            value: 'test-value',
        })
        expect(hook1.before).toHaveBeenCalledTimes(1)
        expect(hook1.after).toHaveBeenCalledTimes(1)
        expect(hook1.onFinally).toHaveBeenCalledTimes(1)
        expect(hook1.error).not.toHaveBeenCalled()
        expect(hook2.before).toHaveBeenCalledTimes(1)
        expect(hook2.after).toHaveBeenCalledTimes(1)
        expect(hook2.onFinally).toHaveBeenCalledTimes(1)
    })

    it('should run hooks in correct order when resolver fails', async () => {
        const hooksRunner = new EvalHooksRunner()
        const hook1 = new EvalHook(
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        const hook2 = new EvalHook(
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        hooksRunner.enqueue(hook1)
        hooksRunner.enqueue(hook2)

        try {
            await hooksRunner.runHooksForEvaluation(
                { user_id: 'test-user' },
                'test-key',
                'test-value',
                {},
                async () => {
                    throw new Error('test-error')
                },
            )
        } catch (error) {
            expect(error).toEqual(new Error('test-error'))
        }

        expect(hook1.before).toHaveBeenCalledTimes(1)
        expect(hook1.after).toHaveBeenCalledTimes(0)
        expect(hook1.onFinally).toHaveBeenCalledTimes(1)
        expect(hook1.error).toHaveBeenCalledTimes(1)
        expect(hook2.before).toHaveBeenCalledTimes(1)
        expect(hook2.after).toHaveBeenCalledTimes(0)
        expect(hook2.onFinally).toHaveBeenCalledTimes(1)
        expect(hook2.error).toHaveBeenCalledTimes(1)
    })

    it('should change user in before hook', async () => {
        const hooksRunner = new EvalHooksRunner()
        const beforeHook2 = jest.fn().mockResolvedValue({})
        const hook1 = new EvalHook(
            jest.fn().mockImplementation((context) => {
                context.user.user_id = 'test-user-2'
                return new Promise((resolve) => {
                    resolve(context)
                })
            }),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        const hook2 = new EvalHook(
            beforeHook2,
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        hooksRunner.enqueue(hook1)
        hooksRunner.enqueue(hook2)
        const resolver = jest.fn().mockImplementation(() => {
            return {
                key: 'test-key',
                defaultValue: 'test-value',
                type: 'String',
                value: 'test-value',
                isDefaulted: false,
            }
        })
        const result = await hooksRunner.runHooksForEvaluation(
            { user_id: 'test-user' },
            'test-key',
            'test-value',
            {},
            resolver,
        )
        expect(result).toEqual({
            key: 'test-key',
            defaultValue: 'test-value',
            type: 'String',
            value: 'test-value',
            isDefaulted: false,
        })
        expect(hook1.before).toHaveBeenCalledTimes(1)
        expect(hook1.after).toHaveBeenCalledTimes(1)
        expect(hook1.onFinally).toHaveBeenCalledTimes(1)
        expect(hook1.error).not.toHaveBeenCalled()
        expect(hook2.before).toHaveBeenCalledTimes(1)
        expect(hook2.after).toHaveBeenCalledTimes(1)
        expect(hook2.onFinally).toHaveBeenCalledTimes(1)

        expect(beforeHook2.mock.calls[0][0].user.user_id).toEqual('test-user-2')
    })

    it('should still work if before hook errors', async () => {
        const hooksRunner = new EvalHooksRunner()
        const hook1 = new EvalHook(
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        const hook2 = new EvalHook(
            jest.fn().mockImplementation((context) => {
                context.user.user_id = 'test-user-2'
                throw new Error('test-error')
            }),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
            jest.fn().mockResolvedValue({}),
        )
        hooksRunner.enqueue(hook1)
        hooksRunner.enqueue(hook2)

        const variable = {
            key: 'test-key',
            defaultValue: 'test-value',
            type: 'String',
            value: 'test-value',
            isDefaulted: false,
        }
        const resolver = jest.fn().mockImplementation(() => {
            return variable
        })
        const result = await hooksRunner.runHooksForEvaluation(
            { user_id: 'test-user' },
            'test-key',
            'test-value',
            {},
            resolver,
        )
        expect(result).toEqual(variable)

        expect(hook1.before).toHaveBeenCalledTimes(1)
        expect(hook1.after).toHaveBeenCalledTimes(0)
        expect(hook1.onFinally).toHaveBeenCalledTimes(1)
        expect(hook1.error).toHaveBeenCalledTimes(1)
        expect(hook2.before).toHaveBeenCalledTimes(1)
        expect(hook2.after).toHaveBeenCalledTimes(0)
        expect(hook2.onFinally).toHaveBeenCalledTimes(1)
        expect(hook2.error).toHaveBeenCalledTimes(1)
    })
})
