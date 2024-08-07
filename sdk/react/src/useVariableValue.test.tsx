import { useVariableValue } from './useVariableValue'
import { renderHook } from '@testing-library/react'
import { DevCycleProvider } from './DevCycleProvider'
import '@testing-library/jest-dom'
import type { DVCJSON } from '@devcycle/js-client-sdk'
import { ReactElement } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { mockSubscribeFunction } from '@devcycle/js-client-sdk' // defined in the mock

jest.mock('@devcycle/js-client-sdk')

const test_key = 'dvc_client_test_key'
const ProviderWrapper = ({ children }: { children: ReactElement }) => {
    return (
        <DevCycleProvider
            config={{
                user: { user_id: 'test', isAnonymous: false },
                sdkKey: test_key,
            }}
        >
            {children}
        </DevCycleProvider>
    )
}

describe('useVariableValue', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('uses the correct type for string', () => {
        const { result } = renderHook(
            () => useVariableValue('test', 'default'),
            {
                wrapper: ProviderWrapper,
            },
        )
        expect(result.current).toEqual('default')

        const _testString: string = result.current
        // @ts-expect-error this indicates wrong type
        const _testNumber: number = result.current
    })

    it('uses the correct type for number', () => {
        const { result } = renderHook(() => useVariableValue('test', 2), {
            wrapper: ProviderWrapper,
        })
        expect(result.current).toEqual(2)

        // @ts-expect-error this indicates wrong type
        const _testString: string = result.current
        const _testNumber: number = result.current
    })

    it('uses the correct type for boolean', () => {
        const { result } = renderHook(() => useVariableValue('test', true), {
            wrapper: ProviderWrapper,
        })
        expect(result.current).toEqual(true)

        // @ts-expect-error this indicates wrong type
        const _testString: string = result.current
        // @ts-expect-error this indicates wrong type
        const _testNumber: number = result.current
        const _testBoolean: boolean = result.current
    })

    it('uses the correct type for JSON', () => {
        const { result } = renderHook(
            () => useVariableValue('test', { key: 'test' }),
            { wrapper: ProviderWrapper },
        )
        expect(result.current).toEqual({ key: 'test' })

        // @ts-expect-error this indicates wrong type
        const _testString: string = result.current
        // @ts-expect-error this indicates wrong type
        const _testNumber: number = result.current
        const _testJSON: DVCJSON = result.current
    })

    it('Should register a handler for each useVariableValue call with same variable key', () => {
        renderHook(() => useVariableValue('test', true), {
            wrapper: ProviderWrapper,
        })
        renderHook(() => useVariableValue('test', true), {
            wrapper: ProviderWrapper,
        })

        expect(mockSubscribeFunction).toHaveBeenCalledTimes(2)
    })
})
