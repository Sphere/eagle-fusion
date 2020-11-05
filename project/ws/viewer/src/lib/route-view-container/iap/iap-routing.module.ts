import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { IapComponent } from './iap.component'
import { ViewerResolve } from '../../viewer.resolve'
const routes: Routes = [
  {
    path: '',
    component: IapComponent,
    pathMatch: 'full',
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ViewerResolve],
})
export class IapRoutingModule { }
