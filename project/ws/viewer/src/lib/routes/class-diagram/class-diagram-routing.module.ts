import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ClassDiagramComponent } from './class-diagram.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: ':resourceId',
    component: ClassDiagramComponent,
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
export class ClassDiagramRoutingModule { }
