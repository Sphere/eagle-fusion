import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ResourceCollectionComponent } from './resource-collection.component'
import { ViewerResolve } from '../../viewer.resolve'

const routes: Routes = [
  {
    path: ':resourceId',
    component: ResourceCollectionComponent,
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
export class ResourceCollectionRoutingModule { }
