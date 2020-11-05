import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { WebModuleComponent } from './web-module.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: WebModuleComponent,
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
export class WebModuleRoutingModule { }
