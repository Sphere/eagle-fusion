import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { MyRewardsComponent } from './components/my-rewards/my-rewards.component'

const routes: Routes = [{
  path: '',
  component: MyRewardsComponent,
}]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RewardsRoutingModule { }
