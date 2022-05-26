import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DiscussionEventsService, DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
// import { TelemetryService, EventService, WsEvents } from '@ws-widget/utils'
// import {TelemetryService }
@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        DiscussionUiModule,
    ],
    exports: [DiscussionUiModule],
})
export class WrapperModule {
    // processed: any
    constructor(private discussionEventsService: DiscussionEventsService,
        // private teleSvc: TelemetryService,
        // private eventsSvc: EventService,

    ) {
        this.discussionEventsService.telemetryEvent.subscribe(data => {
            switch (data.eid) {
                case 'IMPRESSION':
                    // this.teleSvc.impression({ pageId: data.edata.pageid, module: WsEvents.EnumTelemetrymodules.DISCUSS })
                    break
                case 'INTERACT':
                    // this.eventsSvc.raiseInteractTelemetry(
                    //     {
                    //         type: data.edata.type,
                    //         subType: data.edata.pageid,
                    //         id: (data.object && data.object.id) || '',
                    //     },
                    //     data.object,
                    //     {
                    //         pageId: data.edata.pageid,
                    //         module: WsEvents.EnumTelemetrymodules.DISCUSS,
                    //     })
                    break
            }
        })

    }
}
