import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'

// Import competency modules
import { EntryModule } from '@aastrika_npmjs/competency-web/entry-module'
import { SelfAssessmentModule } from '@aastrika_npmjs/competency-web/self-assessment'
import { CompetencyModule as AastrikaCompetencyModule } from '@aastrika_npmjs/competency-web/competency'

// Components
// import { SelfAssessmentComponent } from '../self-assessment/self-assessment.component'

@NgModule({
  declarations: [
    // SelfAssessmentComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    EntryModule,
    SelfAssessmentModule,
    AastrikaCompetencyModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class CompetencyModule { }
