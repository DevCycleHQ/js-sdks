import { EventEmitter } from '../src/EventEmitter'
import { DVCClient } from '../src/Client'
import { DVCPopulatedUser } from '../src/User'

const testConfig = {
    project: {
        settings: {
            edgeDB: {
                enabled: true
            }
        }
    },
    environment: {},
    features: {},
    featureVariationMap: {},
    variables: {
        key: {
            _id: 'id',
            value: 'value1',
            type: 'String',
            default_value: 'default_value'
        }
    },
    etag: '123'
}
describe('EventEmitter tests', () => {
    const eventEmitter = new EventEmitter()

    beforeEach(() => {
        eventEmitter.events = {}
    })

    it('should throw if key type is not a string', () => {
        expect(() => eventEmitter.subscribe()).toThrow(expect.any(Error))
        expect(() => eventEmitter.subscribe(true)).toThrow(expect.any(Error))
        expect(() => eventEmitter.unsubscribe()).toThrow(expect.any(Error))
        expect(() => eventEmitter.unsubscribe(true)).toThrow(expect.any(Error))
        expect(() => eventEmitter.emit()).toThrow(expect.any(Error))
        expect(() => eventEmitter.emit(true)).toThrow(expect.any(Error))
    })

    describe('subscribe', () => {
        it('should throw error if event is not a predefined event', () => {
            const handler = jest.fn()
            expect(() => eventEmitter.subscribe('not_an_event', handler)).toThrow(expect.any(Error))
        })

        it('should subscribe to event', () => {
            const handler = jest.fn()
            eventEmitter.subscribe('initialized', handler)
            expect(eventEmitter.events['initialized'][0]).toEqual(handler)
        })

        it('should subscribe with more than one event', () => {
            const handler1 = jest.fn()
            const handler2 = jest.fn()
            eventEmitter.subscribe('initialized', handler1)
            eventEmitter.subscribe('initialized', handler2)
            expect(eventEmitter.events['initialized'][0]).toEqual(handler1)
            expect(eventEmitter.events['initialized'][1]).toEqual(handler2)
        })
    })

    describe('unsubscribe', () => {
        it('should unsubscribe to event', () => {
            const handler = jest.fn()
            eventEmitter.subscribe('initialized', handler)
            eventEmitter.unsubscribe('initialized', handler)
            expect(eventEmitter.events['initialized'].length).toBe(0)
        })

        it('should subscribe with more than one event', () => {
            const handler1 = jest.fn()
            const handler2 = jest.fn()
            eventEmitter.subscribe('initialized', handler1)
            eventEmitter.unsubscribe('initialized', handler1)
            eventEmitter.subscribe('initialized', handler2)
            eventEmitter.unsubscribe('initialized', handler2)
            expect(eventEmitter.events['initialized'].length).toBe(0)
        })
    })

    describe('emit', () => {
        it('should emit events and handler should callback', () => {
            const handler = jest.fn()
            eventEmitter.subscribe('initialized', handler)
            eventEmitter.emit('initialized', false)
            expect(handler).toBeCalledWith(false)
        })
    })

    describe('emitVariableUpdates', () => {
        it('should emit variable updated event if subscribed to all variable updates, and specific key', () => {
            const allUpdatesHandler = jest.fn()
            const variableKeyHandler = jest.fn()
            const oldVariableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-value',
                    type: 'my-type'
                }
            }
            const variableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-new-value',
                    type: 'my-type'
                }
            }
            eventEmitter.subscribe('variableUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`variableUpdated:my-variable-key`, variableKeyHandler)
            eventEmitter.emitVariableUpdates(oldVariableSet, variableSet, {})
            expect(allUpdatesHandler).toBeCalledWith('my-variable-key', variableSet['my-variable-key'])
            expect(variableKeyHandler).toBeCalledWith('my-variable-key', variableSet['my-variable-key'])
        })

        it('should not emit variable updated event if no updates', () => {
            const allUpdatesHandler = jest.fn()
            const variableKeyHandler = jest.fn()
            const oldVariableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-value',
                    type: 'my-type'
                }
            }
            const variableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-value',
                    type: 'my-type'
                }
            }
            eventEmitter.subscribe('variableUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`variableUpdated:my-variable-key`, variableKeyHandler)
            eventEmitter.emitVariableUpdates(oldVariableSet, variableSet, {})
            expect(allUpdatesHandler).not.toBeCalled()
            expect(variableKeyHandler).not.toBeCalled()

            // check empty too
            eventEmitter.emitVariableUpdates({}, {})

            expect(allUpdatesHandler).not.toBeCalled()
            expect(variableKeyHandler).not.toBeCalled()
        })

        it('should emit variable updated event if variable removed', () => {
            const allUpdatesHandler = jest.fn()
            const variableKeyHandler = jest.fn()
            const oldVariableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-value',
                    type: 'my-type'
                }
            }
            const newVariableSet = {
                'different-variable-key': {
                    _id: 'variable_id_2',
                    key: 'different-variable-key',
                    value: 'different-value',
                    type: 'string'
                }
            }

            eventEmitter.subscribe('variableUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`variableUpdated:my-variable-key`, variableKeyHandler)
            eventEmitter.emitVariableUpdates(oldVariableSet, newVariableSet, {})
            expect(allUpdatesHandler).toBeCalledWith('my-variable-key', null)
            expect(variableKeyHandler).toBeCalledWith('my-variable-key', null)
        })

        it('should emit variable updated event if variable added', () => {
            const allUpdatesHandler = jest.fn()
            const variableKeyHandler = jest.fn()
            const oldVariableSet = {
                'different-variable-key': {
                    _id: 'variable_id_2',
                    key: 'different-variable-key',
                    value: 'different-value',
                    type: 'string'
                }
            }
            const newVariableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-value',
                    type: 'my-type'
                }
            }

            eventEmitter.subscribe('variableUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`variableUpdated:my-variable-key`, variableKeyHandler)
            eventEmitter.emitVariableUpdates(oldVariableSet, newVariableSet, {})
            expect(allUpdatesHandler).toBeCalledWith('my-variable-key', newVariableSet['my-variable-key'])
            expect(variableKeyHandler).toBeCalledWith('my-variable-key', newVariableSet['my-variable-key'])
        })
    })

    describe('emitFeatureUpdates', () => {
        it('should emit feature updated event if subscribed to all feature updates, and specific key', () => {
            const allUpdatesHandler = jest.fn()
            const featureKeyHandler = jest.fn()
            const oldFeatureSet = {
                'my-feature-key': {
                    _id: 'feature_id',
                    _variation: 'variation1',
                    key: 'my-feature-key',
                    type: 'experiment'
                }
            }
            const featureSet = {
                'my-feature-key': {
                    _id: 'feature_id',
                    _variation: 'variation2',
                    key: 'my-feature-key',
                    type: 'experiment'
                }
            }
            eventEmitter.subscribe('featureUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`featureUpdated:my-feature-key`, featureKeyHandler)
            eventEmitter.emitFeatureUpdates(oldFeatureSet, featureSet)
            expect(allUpdatesHandler).toBeCalledWith('my-feature-key', featureSet['my-feature-key'])
            expect(featureKeyHandler).toBeCalledWith('my-feature-key', featureSet['my-feature-key'])
        })

        it('should not mit feature updated event if no updates', () => {
            const allUpdatesHandler = jest.fn()
            const featureKeyHandler = jest.fn()
            const oldFeatureSet = {
                'my-feature-key': {
                    _id: 'feature_id',
                    _variation: 'variation1',
                    key: 'my-feature-key',
                    type: 'experiment'
                }
            }
            const featureSet = {
                'my-feature-key': {
                    _id: 'feature_id',
                    _variation: 'variation1',
                    key: 'my-feature-key',
                    type: 'experiment'
                }
            }
            eventEmitter.subscribe('featureUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`featureUpdated:my-feature-key`, featureKeyHandler)
            eventEmitter.emitFeatureUpdates(oldFeatureSet, featureSet)
            expect(allUpdatesHandler).not.toBeCalled()
            expect(featureKeyHandler).not.toBeCalled()

            // check for no features
            eventEmitter.emitFeatureUpdates({}, {})

            expect(allUpdatesHandler).not.toBeCalled()
            expect(featureKeyHandler).not.toBeCalled()
        })

        it('should emit feature updated event with null if removed', () => {
            const allUpdatesHandler = jest.fn()
            const featureKeyHandler = jest.fn()
            const oldFeatureSet = {
                'my-feature-key': {
                    _id: 'feature_id',
                    _variation: 'variation1',
                    key: 'my-feature-key',
                    type: 'experiment'
                }
            }
            const newFeatureSet = {
                'different-feature-key': {
                    _id: 'different_feature_id',
                    _variation: 'different-variation1',
                    key: 'different-feature-key',
                    type: 'experiment'
                }
            }
            eventEmitter.subscribe('featureUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`featureUpdated:my-feature-key`, featureKeyHandler)
            eventEmitter.emitFeatureUpdates(oldFeatureSet, newFeatureSet)
            expect(allUpdatesHandler).toBeCalledWith('my-feature-key', null)
            expect(featureKeyHandler).toBeCalledWith('my-feature-key', null)
        })

        it('should emit feature updated event with new feature if added', () => {
            const allUpdatesHandler = jest.fn()
            const featureKeyHandler = jest.fn()
            const oldFeatureSet = {
                'different-feature-key': {
                    _id: 'different_feature_id',
                    _variation: 'different-variation1',
                    key: 'different-feature-key',
                    type: 'experiment'
                }
            }
            const newFeatureSet = {
                'my-feature-key': {
                    _id: 'feature_id',
                    _variation: 'variation1',
                    key: 'my-feature-key',
                    type: 'experiment'
                }
            }
            eventEmitter.subscribe('featureUpdated:*', allUpdatesHandler)
            eventEmitter.subscribe(`featureUpdated:my-feature-key`, featureKeyHandler)
            eventEmitter.emitFeatureUpdates(oldFeatureSet, newFeatureSet)
            expect(allUpdatesHandler).toBeCalledWith('my-feature-key', newFeatureSet['my-feature-key'])
            expect(featureKeyHandler).toBeCalledWith('my-feature-key', newFeatureSet['my-feature-key'])
        })
    })

    describe('emit configUpdates', () => {
        it('should emit config updated event', () => {
            const configHandler = jest.fn()
            const variableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-new-value',
                    type: 'my-type'
                }
            }
            eventEmitter.subscribe('configUpdated', configHandler)
            eventEmitter.emitConfigUpdate(variableSet)
            expect(configHandler).toBeCalledWith(variableSet)
        })

        it('should unsubscribe from config updated event', () => {
            const configHandler = jest.fn()
            const variableSet = {
                'my-variable-key': {
                    _id: 'variable_id',
                    key: 'my-variable-key',
                    value: 'my-new-value',
                    type: 'my-type'
                }
            }
            eventEmitter.subscribe('configUpdated', configHandler)
            eventEmitter.unsubscribe('configUpdated')
            eventEmitter.emitConfigUpdate(variableSet)
            expect(configHandler).not.toHaveBeenCalled()
        })

        it('fires when first config recieved', () => {
            const configHandler = jest.fn()
            const client = new DVCClient('test_sdk_key', { user_id: 'user1' })
            client.eventEmitter = eventEmitter
            eventEmitter.subscribe('configUpdated', configHandler)
            client.handleConfigReceived(
                testConfig, 
                new DVCPopulatedUser({ user_id: 'user1' }, null), 
                123
            )
            expect(configHandler).toHaveBeenCalledWith(testConfig.variables)
        })

        it('doesnt fire when config recieved with same etag', () => {
            const configHandler = jest.fn()
            const client = new DVCClient('test_sdk_key', { user_id: 'user1' })
            client.eventEmitter = eventEmitter
            client.config = testConfig
            eventEmitter.subscribe('configUpdated', configHandler)
            client.handleConfigReceived(
                testConfig, 
                new DVCPopulatedUser({ user_id: 'user1' }, null), 
                123
            )
            expect(configHandler).not.toHaveBeenCalled()
        })

        it('fires when config recieved with different etag', () => {
            const configHandler = jest.fn()
            const client = new DVCClient('test_sdk_key', { user_id: 'user1' })
            client.eventEmitter = eventEmitter
            client.config = {...testConfig, etag: '567'}
            eventEmitter.subscribe('configUpdated', configHandler)
            client.handleConfigReceived(
                testConfig, 
                new DVCPopulatedUser({ user_id: 'user1' }, null), 
                123
            )
            expect(configHandler).toHaveBeenCalledWith(testConfig.variables)
        })
    })
})
