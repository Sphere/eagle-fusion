import { Events, EventHandler } from './events'

describe('Events', () => {
  let events: Events

  beforeEach(() => {
    events = new Events()
  })

  it('should subscribe to a topic', () => {
    const handler: EventHandler = jest.fn()
    events.subscribe('test-topic', handler)

    const topics = (events as any).c.get('test-topic')
    expect(topics).toContain(handler)
  })

  it('should unsubscribe from a topic', () => {
    const handler: EventHandler = jest.fn()
    events.subscribe('test-topic', handler)
    const result = events.unsubscribe('test-topic', handler)

    const topics = (events as any).c.get('test-topic')
    expect(result).toBe(true)
    if (topics) {
      expect(topics).not.toContain(handler)
    } else {
      expect(topics).toBeUndefined()
    }
  })

  it('should unsubscribe all handlers from a topic', () => {
    const handler1: EventHandler = jest.fn()
    const handler2: EventHandler = jest.fn()
    events.subscribe('test-topic', handler1, handler2)
    const result = events.unsubscribe('test-topic')

    const topics = (events as any).c.get('test-topic')
    expect(result).toBe(true)
    expect(topics).toBeUndefined()
  })

  it('should return false when unsubscribing a non-existing handler', () => {
    const handler: EventHandler = jest.fn()
    const result = events.unsubscribe('test-topic', handler)

    expect(result).toBe(false)
  })

  it('should return false when unsubscribing from a non-existing topic', () => {
    const result = events.unsubscribe('non-existing-topic')

    expect(result).toBe(false)
  })

  it('should publish events to subscribed handlers', () => {
    const handler1: EventHandler = jest.fn()
    const handler2: EventHandler = jest.fn()
    events.subscribe('test-topic', handler1, handler2)

    events.publish('test-topic', 'arg1', 'arg2')

    expect(handler1).toHaveBeenCalledWith('arg1', 'arg2')
    expect(handler2).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('should return null when publishing to a non-existing topic', () => {
    const result = events.publish('non-existing-topic', 'arg1', 'arg2')

    expect(result).toBeNull()
  })

  it('should handle errors in event handlers gracefully', () => {
    const handler1: EventHandler = jest.fn(() => {
      throw new Error('Test error')
    })
    const handler2: EventHandler = jest.fn()
    events.subscribe('test-topic', handler1, handler2)

    const result = events.publish('test-topic', 'arg1', 'arg2')

    expect(handler1).toHaveBeenCalledWith('arg1', 'arg2')
    expect(handler2).toHaveBeenCalledWith('arg1', 'arg2')
    expect(result).toEqual([null, undefined])
  })

  it('should handle multiple subscriptions to the same topic', () => {
    const handler1: EventHandler = jest.fn()
    const handler2: EventHandler = jest.fn()
    events.subscribe('test-topic', handler1)
    events.subscribe('test-topic', handler2)

    const topics = (events as any).c.get('test-topic')
    expect(topics).toContain(handler1)
    expect(topics).toContain(handler2)
  })

  it('should handle unsubscribing a handler that was not subscribed', () => {
    const handler1: EventHandler = jest.fn()
    const handler2: EventHandler = jest.fn()
    events.subscribe('test-topic', handler1)
    const result = events.unsubscribe('test-topic', handler2)

    expect(result).toBe(false)
  })

  it('should handle publishing with no handlers subscribed', () => {
    const result = events.publish('test-topic', 'arg1', 'arg2')

    expect(result).toBeNull()
  })
})