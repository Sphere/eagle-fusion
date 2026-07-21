import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { WsEvents } from './event.model'
@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly eventsSubject = new Subject<WsEvents.IWsEvents<any>>()
  public events$ = this.eventsSubject.asObservable()

  constructor() { }

  dispatchEvent<T>(event: WsEvents.IWsEvents<T>) {
    this.eventsSubject.next(event)
  }

  // helper functions
  raiseInteractTelemetry(type: string, subType: string | undefined, pageid: string, object: any, extras?: any, from?: string) {
    this.dispatchEvent<WsEvents.IWsEventTelemetryInteract>({
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        type,
        subType,
        pageid,
        object,
        extras,
        eventSubType: WsEvents.EnumTelemetrySubType.Interact,
      },
      from: from || '',
      to: 'Telemetry',
    })
  }
}
