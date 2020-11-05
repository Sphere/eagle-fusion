import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MarkAsCompleteComponent } from './mark-as-complete.component'
import {
  MatCardModule,
  MatIconModule,
  MatDividerModule,
  MatButtonModule,
  MatDialogModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatTooltipModule,
} from '@angular/material'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { RouterModule } from '@angular/router'
import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'

@NgModule({
  declarations: [MarkAsCompleteComponent, ConfirmDialogComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule,
  ],
  providers: [AppTocService],
  entryComponents: [ConfirmDialogComponent],
  exports: [MarkAsCompleteComponent],
})
export class MarkAsCompleteModule { }
