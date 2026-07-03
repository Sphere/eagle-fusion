import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'

// Import competency modules
import { EntryModule } from '@aastrika_npmjs/comptency/entry-module'
import { SelfAssessmentModule } from '@aastrika_npmjs/comptency/self-assessment'
import {
  CompetencyModule as AastrikaCompetencyModule,
  CompetencyDashboardComponent,
} from '@aastrika_npmjs/comptency/competency'

// Lazy route for /app/user/competency — keeps the heavy @aastrika/comptency
// package out of the eager main bundle.
const routes: Routes = [
  { path: '', component: CompetencyDashboardComponent },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TranslateModule,
    EntryModule,
    SelfAssessmentModule,
    AastrikaCompetencyModule,
    RouterModule.forChild(routes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class CompetencyModule { }
