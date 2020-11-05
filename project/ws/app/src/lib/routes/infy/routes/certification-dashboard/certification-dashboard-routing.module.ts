import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { CertificationHomeComponent } from './components/certification-home/certification-home.component'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CertificationHomeComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertificationDashboardRoutingModule {}
