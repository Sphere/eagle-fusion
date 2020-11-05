import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { ActivitiesComponent } from './components/activities/activities.component'

const routes: Routes = []

@NgModule({
  imports: [RouterModule.forChild([
    {
      path: '',
      component: ActivitiesComponent,
      children: routes,
    },
  ]),
  ],
})
export class ActivitiesRoutingModule { }
