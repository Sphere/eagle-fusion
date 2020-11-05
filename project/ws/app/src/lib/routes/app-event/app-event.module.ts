import { EventResolverService } from './services/event-resolver.service'
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AppEventComponent } from './components/app-event/app-event.component'
import { AppEventRoutingModule } from './app-event-routing.module'
import { MatFormFieldModule, MatInputModule, MatGridListModule, MatIconModule, MatButtonModule, MatSelectModule, MatProgressSpinnerModule, MatTabsModule } from '@angular/material'
import { MatDividerModule } from '@angular/material/divider'
import { MatCardModule } from '@angular/material/card'
import { ProfileDetailModule } from './components/profile-detail/profile-detail.module'
import { HorizontalScrollerModule } from '@ws-widget/utils/src/lib/helpers/horizontal-scroller/horizontal-scroller.module'
import { EventOverviewComponent } from './components/event-overview/event-overview.component'
import { EventSessionsComponent } from './components/event-sessions/event-sessions.component'
import { EventBannerComponent } from './components/event-banner/event-banner.component'
import { AppGalleryComponent } from './components/app-gallery/app-gallery.component'
import { EventService } from './services/event.service'
import { IframeLoaderComponent } from './components/iframe-loader/iframe-loader.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { BtnPageBackModule, BtnFullscreenModule } from '@ws-widget/collection'
import { MeetupComponent } from './components/meetup/meetup.component'
import { CardDetailsModule } from './components/card-details/card-details.module'

@NgModule({
  declarations: [AppEventComponent,
    EventOverviewComponent,
    EventSessionsComponent,
    EventBannerComponent,
    IframeLoaderComponent,
    AppGalleryComponent,
    MeetupComponent,
  ],
  imports: [
    CommonModule,
    CardDetailsModule,
    AppEventRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatCardModule,
    HorizontalScrollerModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    BtnPageBackModule,
    ProfileDetailModule,
    MatSelectModule,
    MatTabsModule,
    BtnFullscreenModule,
  ],
  providers: [
    EventResolverService,
    EventService,
  ],
})
export class AppEventModule { }
