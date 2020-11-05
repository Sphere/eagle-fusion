import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HandsOnComponent } from './hands-on.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: HandsOnComponent,
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
export class HandsOnRoutingModule { }
