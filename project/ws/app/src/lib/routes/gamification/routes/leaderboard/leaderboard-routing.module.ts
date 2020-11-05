import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LeaderboardHomeComponent } from './components/leaderboard-home/leaderboard-home.component'

const routes: Routes = [
  {
    path: '',
    component: LeaderboardHomeComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaderboardRoutingModule { }
