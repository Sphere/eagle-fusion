import { Events } from './events'

describe('Events Service', () => {
  let service: Events

  beforeEach(() => {
    service = new Events()
  })

  it('should subscribe to a topic and add handlers', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    service.subscribe('testTopic', handler1, handler2)

    const topics = (service as any).c.get('testTopic')
    expect(topics).toBeDefined()
    expect(topics.length).toBe(2)
    expect(topics).toContain(handler1)
    expect(topics).toContain(handler2)
  })

  it('should unsubscribe all handlers for a topic', () => {
    const handler = jest.fn()

    service.subscribe('testTopic', handler)
    const result = service.unsubscribe('testTopic')

    expect(result).toBe(true)
    const topics = (service as any).c.get('testTopic')
    expect(topics).toBeUndefined()
  })

  it('should unsubscribe a specific handler for a topic', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    service.subscribe('testTopic', handler1, handler2)
    const result = service.unsubscribe('testTopic', handler1)

    expect(result).toBe(true)
    const topics = (service as any).c.get('testTopic')
    expect(topics).toBeDefined()
    expect(topics.length).toBe(1)
    expect(topics).toContain(handler2)
    expect(topics).not.toContain(handler1)
  })

  it('should return false when unsubscribing a non-existent handler', () => {
    const handler = jest.fn()

    const result = service.unsubscribe('testTopic', handler)

    expect(result).toBe(false)
  })

  it('should return false when unsubscribing from a non-existent topic', () => {
    const result = service.unsubscribe('nonExistentTopic')

    expect(result).toBe(false)
  })

  it('should publish events to all subscribed handlers', () => {
    const handler1 = jest.fn()
    const handler2 = jest.fn()

    service.subscribe('testTopic', handler1, handler2)
    const result = service.publish('testTopic', 'arg1', 'arg2')

    expect(handler1).toHaveBeenCalledWith('arg1', 'arg2')
    expect(handler2).toHaveBeenCalledWith('arg1', 'arg2')
    expect(result).toEqual([undefined, undefined]) // Handlers return undefined by default
  })

  it('should return null when publishing to a non-existent topic', () => {
    const result = service.publish('nonExistentTopic', 'arg1', 'arg2')

    expect(result).toBeNull()
  })

  it('should handle errors in handlers when publishing events', () => {
    const handler1 = jest.fn(() => {
      throw new Error('Handler error')
    })
    const handler2 = jest.fn()

    service.subscribe('testTopic', handler1, handler2)
    const result = service.publish('testTopic', 'arg1', 'arg2')

    expect(handler1).toHaveBeenCalledWith('arg1', 'arg2')
    expect(handler2).toHaveBeenCalledWith('arg1', 'arg2')
    expect(result).toEqual([null, undefined]) // Handler1 throws an error, so it returns null
  })
})