import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HtmlComponent } from './html.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: HtmlComponent,
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
export class HtmlRoutingModule { }
