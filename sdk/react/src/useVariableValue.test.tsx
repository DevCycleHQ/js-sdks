import { useVariableValue } from './useVariableValue'
import { renderHook } from '@testing-library/react'
import DVCProvider from './DVCProvider'
import type { DVCJSON } from '@devcycle/devcycle-js-sdk'
import { ReactElement } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { mockVariableFunction } from '@devcycle/devcycle-js-sdk' // defined in the mock

jest.mock('@devcycle/devcycle-js-sdk')

const ProviderWrapper = ({ children }: {children: ReactElement}) => {
    return <DVCProvider config={{ user: { user_id: 'test', isAnonymous: false }, sdkKey: 'test' }}>
        {children}
    </DVCProvider>
}

describe('useVariableValue', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('uses the correct type for string', () => {
        const { result } = renderHook(() => useVariableValue('test', 'default'), { wrapper: ProviderWrapper })
        expect(result.current).toEqual('default')

        const _testString: string = result.current
        // @ts-expect-error this indicates wrong type
        const _testNumber: number = result.current
    })

    it('uses the correct type for number', () => {
        const { result } = renderHook(() => useVariableValue('test', 2), { wrapper: ProviderWrapper })
        expect(result.current).toEqual(2)

        // @ts-expect-error this indicates wrong type
        const _testString: string = result.current
        const _testNumber: number = result.current
    })

    it('uses the correct type for boolean', () => {
        const { result } = renderHook(() => useVariableValue('test', true), { wrapper: ProviderWrapper })
        expect(result.current).toEqual(true)

        // @ts-expect-error this indicates wrong type
        const _testString: string = result.current
        // @ts-expect-error this indicates wrong type
        const _testNumber: number = result.current
        const _testBoolean: boolean = result.current
    })

    it('uses the correct type for JSON', () => {
        const { result } = renderHook(() => useVariableValue('test', { key: 'test' }), { wrapper: ProviderWrapper })
        expect(result.current).toEqual({ key: 'test' })

        // @ts-expect-error this indicates wrong type
        const _testString: string = result.current
        // @ts-expect-error this indicates wrong type
        const _testNumber: number = result.current
        const _testJSON: DVCJSON = result.current
    })

    it('calls the variable method on the SDK once per hook instance, not per invocation', () => {
        const { result, rerender } = renderHook(() => useVariableValue('test', 'default'), { wrapper: ProviderWrapper })
        expect(result.current).toEqual('default')
        rerender()
        expect(result.current).toEqual('default')
        expect(mockVariableFunction).toHaveBeenCalledTimes(1)
    })
})
