import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PersonProfileComponent } from './components/person-profile/person-profile.component'
import { ProfileSettingsComponent } from './module/profile-settings/profile-settings.component'
const routes: Routes = []

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PersonProfileComponent,
        children: routes,
      },
      {
        path: 'profile-settings',
        component: ProfileSettingsComponent,
        children: routes,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class PersonProfileRoutingModule { }
