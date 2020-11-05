import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'
import { ViewerResolve } from '../../viewer.resolve'

const routes: Routes = [
  {
    path: ':resourceId',
    component: RdbmsHandsOnComponent,
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
export class RdbmsHandsOnRoutingModule { }
