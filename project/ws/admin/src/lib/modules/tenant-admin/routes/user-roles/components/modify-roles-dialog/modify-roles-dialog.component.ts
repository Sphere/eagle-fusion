import { Component, OnInit, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { UserRolesService } from '../../user-roles.service'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'ws-admin-modify-roles-dialog',
  templateUrl: './modify-roles-dialog.component.html',
  styleUrls: ['./modify-roles-dialog.component.scss'],
})
export class ModifyRolesDialogComponent implements OnInit {

  public isFetchingAllRoles = false
  public isFetchingUserRoles = false
  public allRoles: string[] = []
  public userRoles: Set<string> = new Set()

  constructor(
    public dialogRef: MatDialogRef<ModifyRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userRolesSvc: UserRolesService,
    private snackbar: MatSnackBar,
  ) {
  }

  closeDialog(): void {
    this.dialogRef.close()
  }

  fetchAllRoles() {
    this.isFetchingAllRoles = true
    this.userRolesSvc.getAllUserRoles().then((roles: string[]) => {
      this.allRoles = roles
    }).catch()
      .finally(() => {
        this.isFetchingAllRoles = false
      })
  }

  fetchUserRoles(userId: string) {
    this.isFetchingUserRoles = true
    this.userRolesSvc.getUserRoles(userId).then((roles: string[]) => {
      this.userRoles = new Set(roles)
    }).catch(() => {
      const msg = 'User does not exist'
      this.closeDialog()
      this.snackbar.open(msg)
    }).finally(() => {
      this.isFetchingUserRoles = false
    })
  }

  modifyUserRoles(role: string) {
    if (this.userRoles.has(role)) {
      this.userRoles.delete(role)
    } else {
      this.userRoles.add(role)
    }
  }

  // updateRoles() {
  //   const request = {
  //     userIds: this.data.user.wid,

  //   }
  // }

  ngOnInit() {
    this.fetchAllRoles()
    if (this.data.user) {
      this.fetchUserRoles(this.data.user.wid)
    }
  }

}
