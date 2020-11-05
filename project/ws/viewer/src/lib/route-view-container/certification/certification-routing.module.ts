import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { CertificationComponent } from './certification.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: CertificationComponent,
    resolve: {
      content: ViewerResolve,
    },
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ViewerResolve],
})
export class CertificationRoutingModule { }
