import { RenderIfEnabled } from './RenderIfEnabled'
import { render } from '@testing-library/react'
import { useVariableValue } from './useVariableValue'
import '@testing-library/jest-dom'

const mockedUseVariable = jest.mocked(useVariableValue)

jest.mock('./useVariableValue')

describe('RenderIfEnabled', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should render children when variable is set to target value', () => {
        const variableKey = 'test-key'
        const targetValue = true
        const defaultValue = false
        const children = <div>Test</div>
        mockedUseVariable.mockReturnValue(targetValue)
        const { getByText } = render(
            <RenderIfEnabled
                variableKey={variableKey}
                targetValue={targetValue}
                defaultValue={defaultValue}
            >
                {children}
            </RenderIfEnabled>,
        )
        expect(mockedUseVariable).toHaveBeenCalledWith(
            variableKey,
            defaultValue,
        )
        expect(getByText('Test')).toBeInTheDocument()
    })

    it('should render children when variable is set to target value (string)', () => {
        const variableKey = 'test-key'
        const targetValue = 'test-value'
        const defaultValue = 'not-test-value'
        const children = <div>Test</div>
        mockedUseVariable.mockReturnValue(targetValue)
        const { getByText } = render(
            <RenderIfEnabled
                variableKey={variableKey}
                targetValue={targetValue}
                defaultValue={defaultValue}
            >
                {children}
            </RenderIfEnabled>,
        )
        expect(getByText('Test')).toBeInTheDocument()
    })

    it('should not render children when variable is set to something else', () => {
        const variableKey = 'test-key'
        const targetValue = 'test-value'
        const defaultValue = 'not-test-value'
        const children = <div>Test</div>
        mockedUseVariable.mockReturnValue('something else')
        const { queryByText } = render(
            <RenderIfEnabled
                variableKey={variableKey}
                targetValue={targetValue}
                defaultValue={defaultValue}
            >
                {children}
            </RenderIfEnabled>,
        )
        expect(queryByText('Test')).toBeNull()
    })

    it('should render children when variable is boolean enabled and target not specified', () => {
        const variableKey = 'test-key'
        const children = <div>Test</div>
        mockedUseVariable.mockReturnValue(true)
        const { getByText } = render(
            <RenderIfEnabled variableKey={variableKey}>
                {children}
            </RenderIfEnabled>,
        )
        expect(getByText('Test')).toBeInTheDocument()
        expect(mockedUseVariable).toHaveBeenCalledWith(variableKey, false)
    })
})
