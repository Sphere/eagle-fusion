import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgModule } from '@angular/core'

import { AceEditorModule } from 'ng2-ace-editor'

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
} from '@angular/material'

import { DbmsBestPracticeComponent } from './components/dbms-best-practice/dbms-best-practice.component'
import { DbmsConceptCreateComponent } from './components/dbms-concept-create/dbms-concept-create.component'
import { DbmsConceptDropdownComponent } from './components/dbms-concept-dropdown/dbms-concept-dropdown.component'
import { DbmsExerciseComponent } from './components/dbms-exercise/dbms-exercise.component'
import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'
import { DbmsPlaygroundComponent } from './components/dbms-playground/dbms-playground.component'
import { ExecutionResultComponent } from './components/execution-result/execution-result.component'
import { SubmissionDialogComponent } from './components/submission-dialog/submission-dialog.component'

@NgModule({
  declarations: [
    DbmsBestPracticeComponent,
    DbmsConceptCreateComponent,
    DbmsConceptDropdownComponent,
    DbmsExerciseComponent,
    RdbmsHandsOnComponent,
    DbmsPlaygroundComponent,
    ExecutionResultComponent,
    SubmissionDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    AceEditorModule,
  ],
  entryComponents: [SubmissionDialogComponent],
  exports: [
    RdbmsHandsOnComponent,
  ],
})
export class RdbmsHandsOnModule { }
