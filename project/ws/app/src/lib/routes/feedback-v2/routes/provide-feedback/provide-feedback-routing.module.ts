import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { EFeedbackType } from '@ws-widget/collection'

import { HomeComponent } from './components/home/home.component'
import { FeedbackComponent } from './components/feedback/feedback.component'
import { ContentRequestComponent } from './components/content-request/content-request.component'
import { ServiceRequestComponent } from './components/service-request/service-request.component'
import { FeedbackSummaryResolver } from '../../resolvers/feedback-summary.resolver'
import { FeedbackConfigResolver } from '../../resolvers/feedback-config.resolver'

const routes: Routes = [
  {
    path: EFeedbackType.Platform,
    component: FeedbackComponent,
    resolve: {
      feedbackConfig: FeedbackConfigResolver,
    },
  },
  {
    path: EFeedbackType.ContentRequest,
    component: ContentRequestComponent,
  },
  {
    path: EFeedbackType.ServiceRequest,
    component: ServiceRequestComponent,
  },
  {
    path: '',
    redirectTo: EFeedbackType.Platform,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
        children: routes,
        resolve: {
          feedbackSummary: FeedbackSummaryResolver,
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ProvideFeedbackRoutingModule {}
