import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { WebModuleEditorComponent } from './components/web-module-editor/web-module-editor.component'

const routes: Routes = [
  {
    path: '',
    component: WebModuleEditorComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebPageRoutingModule { }
