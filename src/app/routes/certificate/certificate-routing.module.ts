import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { CertificateDetailsComponent } from './components/index'

const routes: Routes = [
  {
    path: ':uuid', component: CertificateDetailsComponent,
  },
]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class CertificateRoutingModule { }
