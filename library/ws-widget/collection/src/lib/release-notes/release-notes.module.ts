import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatExpansionModule,
  MatIconModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material'
import { BtnPageBackModule } from '../../lib/btn-page-back/btn-page-back.module'
import { ReleaseNotesComponent } from './release-notes.component'

@NgModule({
  declarations: [ReleaseNotesComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    BtnPageBackModule,
  ],
  entryComponents: [ReleaseNotesComponent],
})
export class ReleaseNotesModule { }
