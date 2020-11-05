import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: 'leaderboard',
    loadChildren: () => import('./routes/leaderboard/leaderboard.module').then(u => u.LeaderboardModule),

  },
  {
    path: 'badges',
    loadChildren: () => import('./routes/badges/badges.module').then(u => u.BadgesModule),

  },
  {
    path: 'admin',
    loadChildren: () => import('./routes/admin/admin.module').then(u => u.AdminModule),
  },
  {
    path: 'rewards',
    loadChildren: () => import('./routes/rewards/rewards.module').then(u => u.RewardsModule),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GamificationRoutingModule { }
