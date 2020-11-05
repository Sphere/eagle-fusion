import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FormGroup, Validators, FormControl, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { ConfigurationsService } from '@ws-widget/utils'
import { IUserForm } from '../users.model'
import { CreateUserService } from './create-user.service'
import { SystemRolesManagementService } from '../../system-roles-management/system-roles-management.service'
import { IManageUser } from '../../system-roles-management/system-roles-management.model'
@Component({
  selector: 'ws-admin-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {
  roleList!: string[]
  rolesHash: any[] = []
  roles: string[] = []
  registerUser!: FormGroup
  userForm = {}
  keycloak = new FormControl(false)
  step = 0
  selectedSystemRoles: any = []
  isFetching = false
  passwordType = 'UserPassword'
  userData!: IUserForm
  featureData: any = null

  constructor(
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService,
    private createUserSvc: CreateUserService,
    private roleManagementSvc: SystemRolesManagementService,
    private activatedRoute: ActivatedRoute,
  ) {
    if (this.activatedRoute.parent && this.activatedRoute.parent.parent) {
      this.activatedRoute.parent.parent.data.subscribe(data => {
        this.featureData = data.featureData.data
        this.rolesHash = Object.keys(this.featureData.roleList).map(roleData => {
          return { role: roleData, about: this.featureData.roleList[roleData], selected: false }
        })
        this.roleList = Object.keys(this.rolesHash || {})
      })
    }
  }

  ngOnInit() {
    this.registerUser = new FormGroup(
      {
        firstname: new FormControl(null, [Validators.required]),
        lastname: new FormControl(null, [Validators.required]),
        emailid: new FormControl(null, [Validators.required, Validators.email]),
        // username: new FormControl(null, [Validators.required]),
        password: new FormControl(null, [Validators.minLength(6)]),
        cpassword: new FormControl(null, []),
      },
      {
        validators: this.validatePassword,
      })
  }

  validatePassword: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')
    const cpassword = control.get('cpassword')
    if (this.passwordType === 'GeneratePassword') {
      return null
    }
    return (this.passwordType === 'UserPassword'
      && password && cpassword && password.value && cpassword.value
      && password.value === cpassword.value) ? null : { mustMatch: true }
  }

  private openSnackBar(primaryMsg: string, duration: number = 3000) {
    this.isFetching = false
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  onGeneratePassword(event: any) {
    this.resetAllCheckedRole()
    event.preventDefault()
    const today = new Date()
    const gpassword = `${today.getMonth()}!${today.getHours()}#${today.getMinutes()}U@${today.getMilliseconds()}${today.getSeconds()}`
    this.registerUser.controls.password.setValue(gpassword)
  }

  createUser() {
    this.userData = {
      org: this.configSvc.org ? this.configSvc.org[0] : '',
      firstName: this.registerUser.controls.firstname.value,
      lastName: this.registerUser.controls.lastname.value,
      email: this.registerUser.controls.emailid.value,
      // username: this.registerUser.controls.username.value,
      emailVerified: true,
      noPasswordChange: true,
    }
    if (this.passwordType === 'UserPassword') {
      this.userData.password = this.registerUser.controls.cpassword.value
    }
    this.isFetching = true
    this.createUserSvc.createUser(this.userData, !this.keycloak.value).subscribe(
      (data: any) => {
        if (data.code === 200) {
          if (data.wid && this.selectedSystemRoles.length) {
            const addBody: IManageUser = {
              users: [data.wid],
              operation: 'add',
              roles: this.selectedSystemRoles,
            }
            this.roleManagementSvc.manageUser(addBody).then(
              () => {
                this.openSnackBar('User Created Successfully')
                this.registerUser.reset()
                this.resetAllCheckedRole()
              }).catch(
              () => {
                this.openSnackBar('User Created Error Occured While Adding Role')
                this.registerUser.reset()
                this.resetAllCheckedRole()
              }
            )
          } else {
            this.openSnackBar('User Created Successfully')
            this.registerUser.reset()
            this.resetAllCheckedRole()
          }
        } else {
          this.openSnackBar('Some Error occured')
        }
      },
      err => {
        if (JSON.parse(err.error.message).msg && JSON.parse(err.error.message).msg.toLowerCase() === 'conflicting email found') {
          this.openSnackBar('User Already Exists')
        } else {
          this.openSnackBar('Error Creating User')
        }
      },
    )
  }
  selectedUser(event: any) {
    if (event.checked) {
      this.selectedSystemRoles.push(event.source.value)

    } else {
      const index = this.selectedSystemRoles.indexOf(event.source.value)
      this.selectedSystemRoles.splice(index, 1)
    }
  }
  resetAllCheckedRole() {
    this.rolesHash.map(data => {
      data.selected = false
    })
    this.selectedSystemRoles = []
  }
  onRadioChange() {
    this.registerUser.updateValueAndValidity()
  }
}
