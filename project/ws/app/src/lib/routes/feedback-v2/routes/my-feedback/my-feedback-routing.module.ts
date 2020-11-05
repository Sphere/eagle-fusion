import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { EFeedbackRole } from '@ws-widget/collection'

import { HomeComponent } from './components/home/home.component'
import { FeedbackThreadComponent } from './components/feedback-thread/feedback-thread.component'
import { FeedbackListComponent } from './components/feedback-list/feedback-list.component'
import { FeedbackSummaryResolver } from '../../resolvers/feedback-summary.resolver'
import { FeedbackConfigResolver } from '../../resolvers/feedback-config.resolver'

const routes: Routes = [
  {
    path: EFeedbackRole.User,
    component: FeedbackListComponent,
  },
  {
    path: EFeedbackRole.Author,
    component: FeedbackListComponent,
  },
  {
    path: EFeedbackRole.Platform,
    component: FeedbackListComponent,
  },
  {
    path: EFeedbackRole.Content,
    component: FeedbackListComponent,
  },
  {
    path: EFeedbackRole.Service,
    component: FeedbackListComponent,
  },
  {
    path: '',
    redirectTo: EFeedbackRole.User,
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
      {
        path: `${EFeedbackRole.User}/:feedbackId`,
        component: FeedbackThreadComponent,
        resolve: {
          feedbackConfig: FeedbackConfigResolver,
        },
      },
      {
        path: `${EFeedbackRole.Author}/:feedbackId`,
        component: FeedbackThreadComponent,
        resolve: {
          feedbackConfig: FeedbackConfigResolver,
        },
      },
      {
        path: `${EFeedbackRole.Platform}/:feedbackId`,
        component: FeedbackThreadComponent,
        resolve: {
          feedbackConfig: FeedbackConfigResolver,
        },
      },
      {
        path: `${EFeedbackRole.Content}/:feedbackId`,
        component: FeedbackThreadComponent,
        resolve: {
          feedbackConfig: FeedbackConfigResolver,
        },
      },
      {
        path: `${EFeedbackRole.Service}/:feedbackId`,
        component: FeedbackThreadComponent,
        resolve: {
          feedbackConfig: FeedbackConfigResolver,
        },
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MyFeedbackRoutingModule {}
