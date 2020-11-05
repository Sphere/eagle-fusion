import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InterestComponent } from './components/interest/interest.component'
// import { PipeLimitToModule } from '@ws-shared/util'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  MatButtonModule,
  MatSnackBarModule,
  MatChipsModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
} from '@angular/material'
import { PipeLimitToModule } from '@ws-widget/utils'

@NgModule({
  declarations: [InterestComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    PipeLimitToModule,
  ],
  exports: [InterestComponent],
})
export class InterestModule {}
