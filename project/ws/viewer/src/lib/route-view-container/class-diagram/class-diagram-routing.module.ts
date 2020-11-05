import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ClassDiagramComponent } from './class-diagram.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: '',
    component: ClassDiagramComponent,
    pathMatch: 'full',
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ViewerResolve],
})
export class ClassDiagramRoutingModule { }
