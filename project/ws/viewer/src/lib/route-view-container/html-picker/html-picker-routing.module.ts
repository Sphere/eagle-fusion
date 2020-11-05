import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HtmlPickerComponent } from './html-picker.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: HtmlPickerComponent,
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
export class HtmlPickerRoutingModule { }
