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
})
