import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AuthRootComponent } from './components/root/root.component'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  }
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: AuthRootComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class WsAuthorRootRoutingModule { }
