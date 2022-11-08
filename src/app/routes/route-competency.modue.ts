import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { CompetenciesComponent } from './profile-view/competencies/competencies.component'
import { ProficiencyLandingComponent } from './profile-view/proficiency-landing/proficiency-landing.component'
const routes: Routes = [
  {
    path: 'competency',
    component: CompetenciesComponent
  },
  {
    path: 'proficiency',
    component: ProficiencyLandingComponent
  },

]

@NgModule({
  imports: [
    RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
  ],
})
export class RouteCompetencyModule { }
