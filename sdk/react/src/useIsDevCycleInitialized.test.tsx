import { act, render, screen } from '@testing-library/react'
import nock from 'nock'
import { useIsDevCycleInitialized, withDevCycleProvider } from '.'
import { mockConfig } from '../mockData/mockConfig'
import { useState } from 'react'

jest.unmock('@devcycle/js-client-sdk')

describe('useIsDevCycleInitialized', () => {
    const TestApp = () => {
        const isReady = useIsDevCycleInitialized()

        if (!isReady) {
            return <div>Loading...</div>
        }

        return <div>Done</div>
    }

    it('should render the app once the SDK initializes', async () => {
        const scope = nock('https://sdk-api.devcycle.com/v1')
        scope
            .defaultReplyHeaders({
                'access-control-allow-origin': '*',
            })
            .get('/sdkConfig')
            .query((query) => query.user_id === 'test_user')
            .delay(1000)
            .reply(200, mockConfig)

        const App = withDevCycleProvider({
            user: { user_id: 'test_user' },
            sdkKey: 'dvc_test_key',
        })(TestApp)

        render(<App />)

        expect(await screen.findAllByText('Loading...')).toHaveLength(1)
        await new Promise((resolve) => scope.on('replied', resolve))
        expect(await screen.findAllByText('Done')).toHaveLength(1)
    })

    it('should immediately render if the client is already initialized', async () => {
        const SubComponent = () => {
            const isReady = useIsDevCycleInitialized()
            if (!isReady) {
                return <div>Child Loading...</div>
            }

            return <div>Child Done</div>
        }

        const TestApp = () => {
            const [showSubComponent, setShowSubComponent] = useState(false)
            const isReady = useIsDevCycleInitialized()

            return (
                <div>
                    <button onClick={() => setShowSubComponent(true)}>
                        Check
                    </button>
                    {showSubComponent && <SubComponent />}
                    {isReady && <div>Parent Ready</div>}
                </div>
            )
        }
        const scope = nock('https://sdk-api.devcycle.com/v1')
        scope
            .defaultReplyHeaders({
                'access-control-allow-origin': '*',
            })
            .get('/sdkConfig')
            .query((query) => query.user_id === 'test_user')
            .reply(200, mockConfig)

        const App = withDevCycleProvider({
            user: { user_id: 'test_user' },
            sdkKey: 'dvc_test_key',
        })(TestApp)

        render(<App />)

        await screen.findByText('Parent Ready')
        act(() => {
            screen.getByText('Check').click()
        })
        expect(await screen.queryByText('Child Loading...')).toBeFalsy()
        await screen.findByText('Child Done')
    })
})
