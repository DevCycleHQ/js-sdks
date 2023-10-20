import { render } from '@testing-library/react'

import LibTestReact from './lib-test-react'

describe('LibTestReact', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<LibTestReact />)
        expect(baseElement).toBeTruthy()
    })
})
