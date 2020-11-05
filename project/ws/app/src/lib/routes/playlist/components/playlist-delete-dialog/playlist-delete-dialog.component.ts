import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material'

@Component({
  selector: 'ws-app-playlist-delete-dialog',
  templateUrl: './playlist-delete-dialog.component.html',
  styleUrls: ['./playlist-delete-dialog.component.scss'],
})
export class PlaylistDeleteDialogComponent {

  constructor(public dialogRef: MatDialogRef<PlaylistDeleteDialogComponent>) { }

}
