import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

@Component({
  selector: 'ws-app-userdetailall',
  templateUrl: './userdetailall.component.html',
  styleUrls: ['./userdetailall.component.scss'],
})

export class UserdetailallComponent implements OnInit {
  content: any
  tag = ''
  name = ''
  userName = ''

  constructor(
    private dialogRef: MatDialogRef<UserdetailallComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      tag: string,
      name: string,
      content: any
      userName: string
    },
  ) {
    if (data.content) {
      this.content = data.content
      this.tag = data.tag
      this.name = data.name
      this.userName = data.userName

    }

  }

  ngOnInit() {
  }
  close() {
    this.dialogRef.close()
  }
}
