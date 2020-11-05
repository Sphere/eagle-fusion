import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'

@Component({
  selector: 'ws-admin-system-roles-management',
  templateUrl: './system-roles-management.component.html',
  styleUrls: ['./system-roles-management.component.scss'],
})
export class SystemRolesManagementComponent implements OnInit {
  queryControl = new FormControl()
  roleList!: string[]
  roles: string[] = []
  showInstruction = false
  rolesHash!: { [key: string]: string }

  constructor(
    private activatedRoute: ActivatedRoute,
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
    this.roles = this.roleList
    this.queryControl.valueChanges.subscribe(val => {
      if (this.roleList.filter(d => d.toLowerCase().includes(val.toLowerCase()))) {
        this.roles = this.roleList.filter(d => d.toLowerCase().includes(val.toLowerCase()))
      }
    })
  }
  clear() {
    this.queryControl.setValue('')
  }
}
