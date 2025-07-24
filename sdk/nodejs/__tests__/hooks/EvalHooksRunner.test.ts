import { EvalHooksRunner } from '../../src/hooks/EvalHooksRunner'
import { EvalHook } from '../../src/hooks/EvalHook'
import { ConfigMetadata } from '../../src/models/ConfigMetadata'
import { ProjectMetadata } from '../../src/models/ProjectMetadata'
import { EnvironmentMetadata } from '../../src/models/EnvironmentMetadata'

describe('EvalHooksRunner with Config Metadata', () => {
    const mockUser = { user_id: 'user-123' }
    const mockMetadata = new ConfigMetadata(
        'etag-123',
        '2023-01-01T00:00:00Z',
        new ProjectMetadata('project-123', 'test-project'),
        new EnvironmentMetadata('env-456', 'development')
    )

    describe('runHooksForEvaluation', () => {
        it('should pass config metadata to HookContext when provided', () => {
            let capturedContext: any = null
            
            const hook = new EvalHook(
                (context) => {
                    capturedContext = context
                    return context
                },
                () => {},
                () => {},
                () => {}
            )

            const runner = new EvalHooksRunner([hook])
            const resolver = (context: any) => {
                return {
                    key: 'test',
                    type: 'String',
                    value: 'resolved-value',
                    defaultValue: 'default-value',
                    isDefaulted: false,
                }
            }

            runner.runHooksForEvaluation(
                mockUser,
                'test-variable',
                'default-value',
                resolver,
                mockMetadata
            )

            expect(capturedContext).not.toBeNull()
            expect(capturedContext.getConfigMetadata()).toBe(mockMetadata)
        })

        it('should pass null config metadata when not provided', () => {
            let capturedContext: any = null
            
            const hook = new EvalHook(
                (context) => {
                    capturedContext = context
                    return context
                },
                () => {},
                () => {},
                () => {}
            )

            const runner = new EvalHooksRunner([hook])
            const resolver = (context: any) => {
                return {
                    key: 'test',
                    type: 'String',
                    value: 'resolved-value',
                    defaultValue: 'default-value',
                    isDefaulted: false,
                }
            }

            runner.runHooksForEvaluation(
                mockUser,
                'test-variable',
                'default-value',
                resolver
            )

            expect(capturedContext).not.toBeNull()
            expect(capturedContext.getConfigMetadata()).toBeNull()
        })

        it('should pass config metadata through all hook stages', () => {
            let beforeContext: any = null
            let afterContext: any = null
            let errorContext: any = null
            let finallyContext: any = null
            
            const hook = new EvalHook(
                (context) => {
                    beforeContext = context
                    return context
                },
                (context) => {
                    afterContext = context
                },
                (context) => {
                    finallyContext = context
                },
                (context) => {
                    errorContext = context
                }
            )

            const runner = new EvalHooksRunner([hook])
            const resolver = (context: any) => {
                return {
                    key: 'test',
                    type: 'String',
                    value: 'resolved-value',
                    defaultValue: 'default-value',
                    isDefaulted: false,
                }
            }

            runner.runHooksForEvaluation(
                mockUser,
                'test-variable',
                'default-value',
                resolver,
                mockMetadata
            )

            expect(beforeContext!.getConfigMetadata()).toBe(mockMetadata)
            expect(afterContext!.getConfigMetadata()).toBe(mockMetadata)
            expect(finallyContext!.getConfigMetadata()).toBe(mockMetadata)
            // errorContext should be null since no error occurred
            expect(errorContext).toBeNull()
        })
    })
})