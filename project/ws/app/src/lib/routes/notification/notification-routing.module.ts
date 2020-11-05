import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { NotificationComponent } from './components/notification/notification.component'
const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: NotificationComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationRoutingModule {}
