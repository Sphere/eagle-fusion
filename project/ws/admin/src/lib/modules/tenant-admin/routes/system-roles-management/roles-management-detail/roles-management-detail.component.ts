import { Component, OnInit } from '@angular/core'
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material'
import { ActivatedRoute, Router } from '@angular/router'
import { NsAutoComplete } from '@ws-widget/collection'
import { IManageUser, IUserRoleDetail } from '../system-roles-management.model'
import { SystemRolesManagementService } from '../system-roles-management.service'
import { ConfirmActionComponent } from './components/confirm-action/confirm-action.component'

@Component({
  selector: 'ws-admin-roles-management-detail',
  templateUrl: './roles-management-detail.component.html',
  styleUrls: ['./roles-management-detail.component.scss'],
})
export class RolesManagementDetailComponent implements OnInit {

  showInstruction = false
  roleList!: string[]
  role = ''
  displayedColumns: string[] = ['checkbox', 'firstName', 'lastName', 'depName', 'email']
  addTable: IUserRoleDetail[] = []
  removeTable: IUserRoleDetail[] = []
  addSource = new MatTableDataSource(this.addTable)
  removeSource = new MatTableDataSource(this.removeTable)
  addUserId: string[] = []
  removeUserId: string[] = []
  currentTabIndex = 0
  isFetching = false
  isAdding = false
  rolesHash!: { [key: string]: string }

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public rolesSvc: SystemRolesManagementService,
  ) {
    if (this.activatedRoute.parent && this.activatedRoute.parent.parent) {
      this.activatedRoute.parent.parent.data.subscribe(data => {
        const featureData = data.featureData.data
        this.rolesHash = featureData.roleList
        this.roleList = Object.keys(this.rolesHash || {})
      })
    }
  }

  ngOnInit() {
    if (this.activatedRoute.snapshot.queryParamMap.has('role')) {
      this.role = this.activatedRoute.snapshot.queryParamMap.get('role') || ''
      if (!this.roleList.includes(this.role)) {
        this.router.navigate(['/admin/tenant/system-roles-management'])
      }
    } else {
      this.router.navigate(['/admin/tenant/system-roles-management'])
    }
  }
  removeUser(user: NsAutoComplete.IUserAutoComplete) {
    this.addTable = this.addTable.filter((data: IUserRoleDetail) => {
      return data.wid !== user.wid
    })
    this.addUserId = this.addUserId.filter(data => {
      return data !== user.wid
    })
    this.removeTable = this.removeTable.filter((data: IUserRoleDetail) => {
      return data.wid !== user.wid
    })
    this.removeUserId = this.removeUserId.filter(data => {
      return data !== user.wid
    })
    this.addSource = new MatTableDataSource(this.addTable)
    this.removeSource = new MatTableDataSource(this.removeTable)
  }
  selectedUser(event: any, wid: string) {
    if (event.source.value === 'add' && event.checked && !this.addUserId.includes(wid)) {
      this.addUserId.push(wid)
    } else if (event.source.value === 'add' && !event.checked && this.addUserId.includes(wid)) {
      this.addUserId = this.addUserId.filter(data => {
        return data !== wid
      })
    }

    if (event.source.value === 'remove' && event.checked && !this.removeUserId.includes(wid)) {
      this.removeUserId.push(wid)
    } else if (event.source.value === 'remove' && !event.checked && this.removeUserId.includes(wid)) {
      this.removeUserId = this.removeUserId.filter(data => {
        return data !== wid
      })
    }
  }
  addUser(user: NsAutoComplete.IUserAutoComplete): void {
    this.isAdding = true
    this.rolesSvc.checkUser(user.wid).subscribe(data => {
      if (data.user_roles && data.user_roles.includes(this.role)) {
        const roleDetail = {
          ...user,
          hasRole: true,
        }
        this.addTable.push(roleDetail)
        this.addSource = new MatTableDataSource(this.addTable)
        this.removeTable.push(roleDetail)
        this.removeSource = new MatTableDataSource(this.removeTable)
      } else {
        const noRoleDetail = {
          ...user,
          hasRole: false,
        }
        this.addTable.push(noRoleDetail)
        this.addSource = new MatTableDataSource(this.addTable)
      }
      this.isAdding = false
    })
  }
  openDialog(operation: string) {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      width: '40vw',
      data: {
        func: operation,
      },
    })
    dialogRef.afterClosed().subscribe(action => {
      if (action === 'add') {
        this.addUserRole()
      } else if (action === 'remove') {
        this.removeUserRole()
      }
    })
  }

  addUserRole() {
    const addBody: IManageUser = {
      users: this.addUserId,
      operation: 'add',
      roles: this.role ? [this.role] : [],
    }
    if (this.addUserId.length) {
      this.isFetching = true
      this.rolesSvc.manageUser(addBody).then(
        () => {
          this.isFetching = false
          this.addTable.forEach(data => {
            if (this.addUserId.includes(data.wid)) {
              data.hasRole = true
              this.removeTable.push(data)
            }
          })
          this.addSource = new MatTableDataSource(this.addTable)
          this.removeSource = new MatTableDataSource(this.removeTable)
          this.addUserId = []
        }).catch(
        () => {
          this.snackBar.open('Error occurred', undefined, { duration: 1000 })
        }
      )
    }

  }
  removeUserRole() {
    const removeBody: IManageUser = {
      users: this.removeUserId,
      operation: 'remove',
      roles: this.role ? [this.role] : [],
    }
    if (this.removeUserId.length) {
      this.isFetching = true
      this.rolesSvc.manageUser(removeBody).then(
        () => {
          this.isFetching = false
          this.addTable.forEach(data => {
            if (this.removeUserId.includes(data.wid)) {
              data.hasRole = false
            }
          })
          this.removeTable = this.removeTable.filter(data => {
            return !this.removeUserId.includes(data.wid)
          })
          this.removeSource = new MatTableDataSource(this.removeTable)
          this.addSource = new MatTableDataSource(this.addTable)
          this.removeUserId = []
        }
      ).catch(() => {
        this.snackBar.open('Error occurred', undefined, { duration: 1000 })
      })
    }
  }
  tabChange() {
    this.addUserId = []
    this.removeUserId = []
  }
}
