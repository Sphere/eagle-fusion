import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AppTourDialogComponent } from './app-tour-dialog.component'
import { MatDialogModule, MatButtonModule, MatIconModule } from '@angular/material'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [AppTourDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule, MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  entryComponents: [AppTourDialogComponent],
})
export class AppTourDialogModule { }
