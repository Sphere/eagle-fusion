import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ChannelsHomeComponent } from './routes/channels-home/channels-home.component'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ChannelsHomeComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChannelsRoutingModule { }
