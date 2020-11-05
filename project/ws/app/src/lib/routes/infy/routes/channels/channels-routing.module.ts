import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ChannelsResolverComponent } from './routes/channels-resolver/channels-resolver.component'
import { ChannelsHomeComponent } from './routes/channels-home/channels-home.component'
import { PageResolve } from '@ws-widget/utils'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ChannelsHomeComponent,
  },
  {
    path: ':tab',
    component: ChannelsResolverComponent,
  },
]

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ChannelsHomeComponent,
        data: {
          pageType: 'feature',
          pageKey: 'channels',
        },
        resolve: {
          channelsData: PageResolve,
        },
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class ChannelsRoutingModule { }
