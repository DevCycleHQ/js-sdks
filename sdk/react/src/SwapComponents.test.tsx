import { useVariableValue } from './useVariableValue'
import { SwapComponents } from './SwapComponents'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

const mockedUseVariable = jest.mocked(useVariableValue)

jest.mock('./useVariableValue')
const oldComponent = (props: { test: boolean }) => {
    return <div>Old Component</div>
}

const newComponent = (props: { test: boolean }) => {
    return <div>New Component</div>
}

const mismatchProps = (props: { something: boolean }) => {
    return <div>Mismatch Props</div>
}

const RenderSwapped = () => {
    const Swapped = SwapComponents(oldComponent, newComponent, 'test-key')
    return (
        <span>
            <Swapped test={true} />
        </span>
    )
}

const MismatchPropsError = () => {
    // @ts-expect-error should complain about non-matching props
    const Swapped = SwapComponents(oldComponent, mismatchProps, 'test-key')
    return <span></span>
}

const PropTypeError = () => {
    const Swapped = SwapComponents(oldComponent, newComponent, 'test-key')
    return (
        <span>
            {/*@ts-expect-error should complain test prop is missing*/}
            <Swapped />
        </span>
    )
}

describe('SwapComponents', () => {
    it('should render the old component if the variable is not enabled', () => {
        mockedUseVariable.mockReturnValue(false)
        const { getByText } = render(<RenderSwapped />)
        expect(getByText('Old Component')).toBeInTheDocument()
    })
    it('should render the new component if the variable is enabled', () => {
        mockedUseVariable.mockReturnValue(true)
        const { getByText } = render(<RenderSwapped />)
        expect(getByText('New Component')).toBeInTheDocument()
    })
})
