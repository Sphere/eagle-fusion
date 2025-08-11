import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card'
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button'
import { MatDividerModule } from '@angular/material/divider'
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner'
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar'
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar'
import { MatIconModule } from '@angular/material/icon'
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip'


import { HtmlComponent } from './html.component'
import { RouterModule } from '@angular/router'

@NgModule({
  declarations: [HtmlComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule,
    RouterModule,
    MatTooltipModule,
  ],
  exports: [
    HtmlComponent,
  ],
})
export class HtmlModule { }
