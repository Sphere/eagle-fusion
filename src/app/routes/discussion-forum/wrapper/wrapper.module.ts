import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DiscussionEventsService, DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        DiscussionUiModule,
    ],
    exports: [DiscussionUiModule],
})
export class WrapperModule {
    constructor(private readonly discussionEventsService: DiscussionEventsService,
    ) {
        queueMicrotask(() => {
            this.discussionEventsService.telemetryEvent.subscribe(data => {
                switch (data.eid) {
                    case 'IMPRESSION':
                        break
                    case 'INTERACT':
                        break
                }
            })
        })
    }
}
