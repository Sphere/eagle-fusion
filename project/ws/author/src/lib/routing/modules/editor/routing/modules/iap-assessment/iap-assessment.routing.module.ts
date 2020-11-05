import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { IapAssessmentComponent } from './components/iap-assessment/iap-assessment.component'

const routes: Routes = [
  {
    path: '',
    component: IapAssessmentComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class IapAssessmentRoutingModule {

}
