import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { SuperAdminComponent } from './super-admin.component'

const routes: Routes = []

@NgModule({
  imports: [RouterModule.forChild([
    {
      path: '',
      component: SuperAdminComponent,
      children: routes,
    },
  ])],
  exports: [RouterModule],
})
export class SuperAdminRoutingModule { }
