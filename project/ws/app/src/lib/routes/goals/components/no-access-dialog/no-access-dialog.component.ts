import { Component, Inject, OnInit } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material'

@Component({
  selector: 'ws-app-no-access-dialog',
  templateUrl: './no-access-dialog.component.html',
  styleUrls: ['./no-access-dialog.component.scss'],
})
export class NoAccessDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      type: string
    },
  ) { }

  ngOnInit() {
  }

}
