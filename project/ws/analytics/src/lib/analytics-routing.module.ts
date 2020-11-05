import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AnalyticsGuard } from './guards/analytics.guard'

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./routes/learning-analytics/learning-analytics.module').then(u => u.LearningAnalyticsModule),
    canActivate: [AnalyticsGuard],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalyticsRoutingModule { }
