import { useVariableValue } from './useVariableValue'
import { render, screen } from '@testing-library/react'
import nock from 'nock'
import {
    useDevCycleClient,
    useIsDevCycleInitialized,
    withDevCycleProvider,
} from '.'
import { mockConfig } from '../mockData/mockConfig'
import fetch from 'cross-fetch'
global.fetch = fetch
jest.unmock('@devcycle/js-client-sdk')

describe('useVariableValue', () => {
    const Component = () => {
        const variableValue = useVariableValue('string-var', 'Hello')

        return <div>Variable Value: {variableValue}</div>
    }

    const TestApp = () => {
        const isReady = useIsDevCycleInitialized()
        const dvcClient = useDevCycleClient()
        const identifyUser = () => {
            dvcClient.identifyUser({ user_id: 'identified_user' })
        }

        if (!isReady) {
            return <div>Loading...</div>
        }

        return (
            <>
                <button onClick={identifyUser}>Identify User</button>
                <Component />
                <Component />
                <Component />
            </>
        )
    }

    it(
        'should re-render all components that call useVariableValue with ' +
            'the same variable key when an update occurs',
        async () => {
            const scope = nock('https://sdk-api.devcycle.com/v1')
            scope
                .defaultReplyHeaders({
                    'access-control-allow-origin': '*',
                })
                .get('/sdkConfig')
                .query((query) => query.user_id === 'test_user')
                .reply(200, mockConfig)
                .persist()

            const updatedConfig = {
                ...mockConfig,
                variables: {
                    'string-var': {
                        _id: '63633c566cf0fcb7e2123456',
                        key: 'string-var',
                        type: 'String',
                        value: 'Hola',
                    },
                },
            }
            scope
                .defaultReplyHeaders({
                    'access-control-allow-origin': '*',
                })
                .get('/sdkConfig')
                .query((query) => query.user_id === 'identified_user')
                .reply(200, updatedConfig)
                .persist()

            const App = withDevCycleProvider({
                user: { user_id: 'test_user' },
                sdkKey: 'dvc_test_key',
            })(TestApp)

            render(<App />)

            expect(
                await screen.findAllByText('Variable Value: Bonjour'),
            ).toHaveLength(3)
            screen.getByText('Identify User').click()
            expect(
                await screen.findAllByText('Variable Value: Hola'),
            ).toHaveLength(3)
        },
    )
})
