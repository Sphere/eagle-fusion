import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FormControl } from '@angular/forms'
@Component({
  selector: 'ws-app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.scss'],
})
export class ViewUsersComponent implements OnInit {
  userData: {
    userArray: any[],
    noOfUser: string
  }
  userDataList: any[] = []
  searchControl = new FormControl()
  constructor(
    private dialogRef: MatDialogRef<ViewUsersComponent>,
    @Inject(MAT_DIALOG_DATA) data: {
      userArray: any[],
      noOfUser: string
    },
  ) {
    this.userData = data
  }

  ngOnInit() {
    this.userDataList = this.userData.userArray
    this.searchControl.valueChanges.subscribe(val => {
      if (this.userData.userArray.filter(d => d.UserName.toLowerCase().includes(val.toLowerCase()))) {
        this.userDataList = this.userData.userArray.filter(d => d.UserName.toLowerCase().includes(val.toLowerCase()))
      }
    })
  }
  clear() {
    this.searchControl.setValue('')
  }
  close(): void {
    this.dialogRef.close()
  }
}
