import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { RegisteredUsersService } from './registered-users.service'
import { TenantAdminService } from '../../tenant-admin.service'
import { MatTableDataSource } from '@angular/material/table'
import { DialogDeregisterUserComponent } from './components/dialog-deregister-user/dialog-deregister-user.component'
import { MatSnackBar } from '@angular/material/snack-bar'
@Component({
  selector: 'ws-admin-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrls: ['./registered-users.component.scss'],
})
export class RegisteredUsersComponent implements OnInit {

  allSources: any[] = []
  registeredUsers: any[] = []
  dataSource = new MatTableDataSource(this.registeredUsers)
  fetchingStatus: 'fetching' | 'fetched' = 'fetched'
  selectedUsers = new Set<string>([])
  constructor(
    private registeredUsersSvc: RegisteredUsersService,
    private tenantAdminSvc: TenantAdminService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  confirmation(source: string) {
    const dialogRef = this.dialog.open(DialogDeregisterUserComponent, {
      width: '250px',
    })

    dialogRef.afterClosed().subscribe(sure => {
      if (sure) {
        this.deregister(source)
      }
    })
  }

  deregister(source: string) {
    this.fetchingStatus = 'fetching'
    const req = {
      source,
      users: [...this.selectedUsers],
    }
    this.registeredUsersSvc.deregisterUsers(req).then(() => {
      this.fetchingStatus = 'fetched'
      this.selectedUsers.clear()
      this.listAllUsers(source)
    }).catch(() => {
      this.snackBar.open('There was some error!')
      this.fetchingStatus = 'fetched'
    })
  }

  listAllUsers(source: string) {
    this.registeredUsers = []
    this.selectedUsers.clear()
    this.fetchingStatus = 'fetching'
    this.registeredUsersSvc.listAllUsers(source).then(users => {
      this.registeredUsers = users
      this.dataSource = new MatTableDataSource(this.registeredUsers)
      this.fetchingStatus = 'fetched'
    })
  }

  getAllSources() {
    this.tenantAdminSvc.getAllSources().then(sources => {
      this.allSources = sources
    })
  }

  toggleSelectedUser(wid: string) {
    if (this.selectedUsers.has(wid)) {
      this.selectedUsers.delete(wid)
    } else {
      this.selectedUsers.add(wid)
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  ngOnInit() {
    this.getAllSources()
  }

}
