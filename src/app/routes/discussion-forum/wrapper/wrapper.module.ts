import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DiscussionEventsService, DiscussionUiModule } from '@aastrika_npmjs/discussions-ui-v8'
import { ConfigService } from './service/config.service'

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        DiscussionUiModule,
    ],
    exports: [DiscussionUiModule],
    // The discussion package's entry component injects 'configService'. It was provided at the
    // root through DiscussionUiModule.forRoot() in AppModule; providing it here keeps the
    // package out of the initial bundle.
    providers: [{ provide: 'configService', useClass: ConfigService }],
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
