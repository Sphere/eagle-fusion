import { Component, Inject } from '@angular/core'; import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
@Component({
  selector: 'ws-app-playlist-content-delete-dialog',
  templateUrl: './playlist-content-delete-dialog.component.html',
  styleUrls: ['./playlist-content-delete-dialog.component.scss']
  ,
})
export class PlaylistContentDeleteDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<PlaylistContentDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public playlistTitle: string,
  ) { }
}
