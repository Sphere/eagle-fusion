import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { OcmHomeComponent } from './routes/ocm-home/ocm-home.component'
import { PageResolve } from '@ws-widget/utils'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: OcmHomeComponent,
    data: {
      pageType: 'feature',
      pageKey: 'ocm',
    },
    resolve: {
      ocmJson: PageResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OcmRoutingModule { }
