import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { LiveEventsComponent } from './live-events/live-events.component'

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: LiveEventsComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule { }
