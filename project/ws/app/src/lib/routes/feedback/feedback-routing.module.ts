import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { FeedbackComponent } from './components/feedback/feedback.component'
import { PageResolve } from '@ws-widget/utils/src/lib/resolvers/page.resolver'
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'application',
  },
  {
    path: ':type',
    component: FeedbackComponent,
    data: {
      pageType: 'feature',
      pageKey: 'feedback',
    },
    resolve: {
      feedbackJson: PageResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeedbackRoutingModule { }
