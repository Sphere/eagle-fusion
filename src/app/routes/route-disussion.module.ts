import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { DiscussConfigResolve } from './discussion-forum/wrapper/resolvers/discuss-config-resolve'
import { ConfigurationsService } from '@ws-widget/utils'
const routes: Routes = [
  {
    path: 'discussion-forum',
    loadChildren: () => import('./discussion-forum/wrapper/wrapper.module').then(u => u.WrapperModule),
    data: {
      pageId: 'discussion-forum',
      module: 'Discuss',
    },
    resolve: {
      data: DiscussConfigResolve,
    },

  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ConfigurationsService,
    DiscussConfigResolve,
  ],
})
export class RouteDiscussModule { }
