import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AdminComponent } from './components/admin/admin.component'
import { ConfigurationsComponent } from './components/configurations/configurations.component'
const routes: Routes = [{
  path: '',
  component: AdminComponent,
},
{
  path: 'configs',
  component: ConfigurationsComponent,
},
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
