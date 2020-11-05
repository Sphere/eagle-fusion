import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { BtnPlaylistComponent } from './btn-playlist.component'
import { BtnPlaylistDialogComponent } from './btn-playlist-dialog/btn-playlist-dialog.component'
import {
  MatIconModule,
  MatTooltipModule,
  MatButtonModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatListModule,
  MatInputModule,
  MatFormFieldModule,
  MatDialogModule,
} from '@angular/material'
import { BtnPlaylistSelectionComponent } from './btn-playlist-selection/btn-playlist-selection.component'

@NgModule({
  declarations: [BtnPlaylistComponent, BtnPlaylistDialogComponent, BtnPlaylistSelectionComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material Imports
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatListModule,
  ],
  exports: [BtnPlaylistComponent],
  entryComponents: [BtnPlaylistComponent, BtnPlaylistDialogComponent],
})
export class BtnPlaylistModule { }
