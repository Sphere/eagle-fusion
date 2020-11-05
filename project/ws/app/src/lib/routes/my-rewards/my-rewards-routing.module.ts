import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MyRewardsHomeComponent } from './components/my-rewards-home/my-rewards-home.component'

const routes: Routes = [
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MyRewardsHomeComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class MyRewardsRoutingModule { }
