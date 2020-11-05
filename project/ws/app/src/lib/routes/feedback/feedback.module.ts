import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedbackRoutingModule } from './feedback-routing.module'
import { FeedbackComponent } from '../feedback/components/feedback/feedback.component'
import { FormsModule } from '@angular/forms'

import {
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatButtonModule,
  MatInputModule,
  MatSnackBarModule,
  MatTabsModule,
  MatFormFieldModule,
} from '@angular/material'
@NgModule({
  declarations: [FeedbackComponent],
  imports: [
    CommonModule,
    FeedbackRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    FormsModule,
  ],
})
export class FeedbackModule {}
