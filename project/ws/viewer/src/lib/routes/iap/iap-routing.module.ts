import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { IapComponent } from './iap.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: IapComponent,
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
export class IapRoutingModule { }
