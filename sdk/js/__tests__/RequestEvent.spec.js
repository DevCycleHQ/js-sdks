import { DVCRequestEvent } from '../src/RequestEvent'
import { EventTypes } from '../src/EventQueue'

describe('RequestEvent tests', () => {
    it('should throw if no type defined', () => {
        expect(() => new DVCRequestEvent({})).toThrow(expect.any(Error))
    })

    it('should assign type as custom event if not in EventTypes', () => {
        const customEvent = { type: 'this_is_a_custom_event' }
        const requestEvent = new DVCRequestEvent(customEvent)
        expect(requestEvent.type).toBe('customEvent')
        expect(requestEvent.customType).toBe(customEvent.type)
    })

    it('should not assign type as custom event if in EventTypes', () => {
        const evaluatedEvent = {
            type: EventTypes.variableEvaluated,
            target: 'variable_key',
        }
        const requestEvent = new DVCRequestEvent(evaluatedEvent)
        expect(requestEvent.type).toBe(EventTypes.variableEvaluated)
    })

    it('should create a client date', () => {
        const event = { type: 'this_is_my_event' }
        const requestEvent = new DVCRequestEvent(event)
        expect(requestEvent.clientDate).toBeDefined()
    })

    it('should use date defined in event', () => {
        const event = { type: 'this_is_my_event', date: Date.now() }
        const requestEvent = new DVCRequestEvent(event)
        expect(requestEvent.clientDate).toEqual(event.date)
    })

    describe('filterFeatureVars tests', () => {
        const mockConfig = {
            settings: {
                filterFeatureVars: true
            },
            variables: {
                'test-var': {
                    _feature: 'feature-1'
                }
            },
            featureVariationMap: {
                'feature-1': 'variation-1',
                'feature-2': 'variation-2'
            }
        }

        it('should filter feature vars for variableEvaluated events when filterFeatureVars is enabled', () => {
            const event = {
                type: EventTypes.variableEvaluated,
                target: 'test-var'
            }
            const requestEvent = new DVCRequestEvent(event, 'user-1', mockConfig)
            expect(requestEvent.featureVars).toEqual({
                'feature-1': 'variation-1'
            })
        })

        it('should filter feature vars for variableDefaulted events when filterFeatureVars is enabled', () => {
            const event = {
                type: EventTypes.variableDefaulted,
                target: 'test-var'
            }
            const requestEvent = new DVCRequestEvent(event, 'user-1', mockConfig)
            expect(requestEvent.featureVars).toEqual({
                'feature-1': 'variation-1'
            })
        })

        it('should return empty feature vars when variable not found', () => {
            const event = {
                type: EventTypes.variableEvaluated,
                target: 'non-existent-var'
            }
            const requestEvent = new DVCRequestEvent(event, 'user-1', mockConfig)
            expect(requestEvent.featureVars).toEqual({})
        })

        it('should return all feature vars for non-variable events', () => {
            const event = {
                type: 'customEvent'
            }
            const requestEvent = new DVCRequestEvent(event, 'user-1', mockConfig)
            expect(requestEvent.featureVars).toEqual(mockConfig.featureVariationMap)
        })

        it('should return all feature vars when filterFeatureVars is disabled', () => {
            const configWithoutFilter = {
                ...mockConfig,
                settings: undefined
            }
            const event = {
                type: EventTypes.variableEvaluated,
                target: 'test-var'
            }
            const requestEvent = new DVCRequestEvent(event, 'user-1', configWithoutFilter)
            expect(requestEvent.featureVars).toEqual(mockConfig.featureVariationMap)
        })

        it('should handle undefined config', () => {
            const event = {
                type: EventTypes.variableEvaluated,
                target: 'test-var'
            }
            const requestEvent = new DVCRequestEvent(event, 'user-1', undefined)
            expect(requestEvent.featureVars).toEqual({})
        })
    })
})
