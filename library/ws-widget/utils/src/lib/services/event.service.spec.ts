import { EventService } from './event.service'
import { WsEvents } from './event.model'

describe('EventService', () => {
  let service: EventService

  beforeEach(() => {
    service = new EventService()
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  describe('dispatchEvent', () => {
    it('should push the event to subscribers of events$', () => {
      const received: any[] = []
      service.events$.subscribe(e => received.push(e))

      const event = {
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: { a: 1 },
        from: 'test',
        to: 'Telemetry',
      }
      service.dispatchEvent(event as any)

      expect(received).toEqual([event])
    })

    it('should not replay events to late subscribers', () => {
      service.dispatchEvent({ eventType: WsEvents.WsEventType.Telemetry } as any)
      const received: any[] = []
      service.events$.subscribe(e => received.push(e))
      expect(received).toEqual([])
    })

    it('should deliver to every active subscriber', () => {
      const first: any[] = []
      const second: any[] = []
      service.events$.subscribe(e => first.push(e))
      service.events$.subscribe(e => second.push(e))
      service.dispatchEvent({ eventType: WsEvents.WsEventType.Telemetry } as any)
      expect(first).toHaveLength(1)
      expect(second).toHaveLength(1)
    })
  })

  describe('raiseInteractTelemetry', () => {
    it('should dispatch a well-formed Interact telemetry event', () => {
      const received: any[] = []
      service.events$.subscribe(e => received.push(e))

      service.raiseInteractTelemetry('click', 'tap', 'page-1', { id: 'o1' }, { k: 'v' }, 'origin')

      expect(received).toHaveLength(1)
      expect(received[0]).toEqual({
        eventType: WsEvents.WsEventType.Telemetry,
        eventLogLevel: WsEvents.WsEventLogLevel.Info,
        data: {
          type: 'click',
          subType: 'tap',
          pageid: 'page-1',
          object: { id: 'o1' },
          extras: { k: 'v' },
          eventSubType: WsEvents.EnumTelemetrySubType.Interact,
        },
        from: 'origin',
        to: 'Telemetry',
      })
    })

    it('should default the from field to an empty string', () => {
      const received: any[] = []
      service.events$.subscribe(e => received.push(e))
      service.raiseInteractTelemetry('click', undefined, 'page-1', null)
      expect(received[0].from).toBe('')
      expect(received[0].data.subType).toBeUndefined()
      expect(received[0].data.extras).toBeUndefined()
    })
  })
})
