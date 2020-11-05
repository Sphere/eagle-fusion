import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { MyContentComponent } from './components/my-content/my-content.component'

const routes: Routes = [
  {
    path: '',
    component: MyContentComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyContentRoutingModule { }
