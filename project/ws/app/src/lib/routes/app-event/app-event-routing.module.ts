import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { AppEventComponent } from './components/app-event/app-event.component'
import { EventSessionsComponent } from './components/event-sessions/event-sessions.component'
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component'
import { EventResolverService } from './services/event-resolver.service'
import { EventOverviewComponent } from './components/event-overview/event-overview.component'
import { IframeLoaderComponent } from './components/iframe-loader/iframe-loader.component'
import { AppGalleryComponent } from './components/app-gallery/app-gallery.component'
import { MeetupComponent } from './components/meetup/meetup.component'

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'meetup',
        component: MeetupComponent,
        children: [
          {
            path: 'nextup',
            resolve: { eventdata: EventResolverService },
            children: [
              {
                path: ':id',
                component: AppEventComponent,
                children: [
                  {
                    path: 'overview',
                    component: EventOverviewComponent,
                  },
                  {
                    path: 'sessions',
                    component: EventSessionsComponent,
                  },
                  {
                    path: 'sessions/:iframe',
                    component: IframeLoaderComponent,
                  },
                  {
                    path: 'session-details/:speaker',
                    component: ProfileDetailComponent,

                  },
                  {
                    pathMatch: 'full',
                    path: '',
                    redirectTo: 'overview',
                  },
                ],
              },
            ],
          },
          {
            path: 'gallery',
            resolve: { eventdata: EventResolverService },
            component: AppGalleryComponent,
          },
        ],
      },
    ]),
  ],
  exports: [RouterModule],
})
export class AppEventRoutingModule { }
