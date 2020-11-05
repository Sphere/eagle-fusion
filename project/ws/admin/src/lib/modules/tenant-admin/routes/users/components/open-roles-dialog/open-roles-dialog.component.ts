import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material'
import { SystemRolesManagementService } from '../../../system-roles-management/system-roles-management.service'
import { IManageUser } from '../../../system-roles-management/system-roles-management.model'

@Component({
  selector: 'ws-admin-open-roles-dialog',
  templateUrl: './open-roles-dialog.component.html',
  styleUrls: ['./open-roles-dialog.component.scss'],
})
export class OpenRolesDialogComponent implements OnInit {
  userId!: string
  rolesHash: any
  roleList: string[]
  addRole!: string[]
  removeRole!: string[]
  processing = false
  addError = false
  removeError = false
  updatedRole: string[] = []
  promiseArray: any[] = []
  constructor(
    public dialogRef: MatDialogRef<OpenRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public rolesSvc: SystemRolesManagementService,
  ) {
    this.userId = this.data.userId
    this.rolesHash = this.data.rolesData
    this.roleList = Object.keys(this.rolesHash)
  }

  ngOnInit() {
  }

  async changeRole() {
    this.addRole = []
    this.removeRole = []
    this.updatedRole = []
    this.processing = true
    this.addError = false
    this.removeError = false
    this.promiseArray = []
    this.roleList.forEach(role => {
      if (this.rolesHash[role].isSelected && !this.rolesHash[role].hasRole) {
        this.addRole.push(role)
      }
      if (!this.rolesHash[role].isSelected && this.rolesHash[role].hasRole) {
        this.removeRole.push(role)
      }
    })
    if (this.addRole.length) {
      const addBody: IManageUser = {
        users: [this.userId],
        operation: 'add',
        roles: this.addRole,
      }
      const promise1 = this.rolesSvc.manageUser(addBody).then(
        () => {
          this.addRole.forEach(role => {
            this.rolesHash[role].hasRole = true
          })
        }).catch(
        () => {
            this.addError = true
        })
      this.promiseArray.push(promise1)
    }
    if (this.removeRole.length) {
      const removeBody: IManageUser = {
        users: [this.userId],
        operation: 'remove',
        roles: this.removeRole,
      }
      const promise2 = this.rolesSvc.manageUser(removeBody).then(
        () => {
          this.removeRole.forEach(role => {
            this.rolesHash[role].hasRole = false
          })
        }).catch(
        () => {
            this.removeError = true
        }
      )
      this.promiseArray.push(promise2)
    }
    if (this.promiseArray.length) {
      await Promise.all(this.promiseArray)
    }
    this.roleList.forEach(role => {
      if (this.rolesHash[role].hasRole) {
        this.updatedRole.push(role)
      }
    })
    this.processing = false
      this.dialogRef.close({
        wid: this.userId,
        newRoles: this.updatedRole,
        addingError: this.addError,
        removingError: this.removeError,
      })

}

  close() {
    this.dialogRef.close()
  }
}
