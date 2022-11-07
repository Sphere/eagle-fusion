import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ProficiencyLandingComponent } from './profile-view/proficiency-landing/proficiency-landing.component'
const routes: Routes = [
  {
    path: 'proficiency',
    component: ProficiencyLandingComponent



  },
]

@NgModule({
  imports: [
    ProficiencyLandingComponent,
    RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
  ],
})
export class RouteCompetencyModule { }
