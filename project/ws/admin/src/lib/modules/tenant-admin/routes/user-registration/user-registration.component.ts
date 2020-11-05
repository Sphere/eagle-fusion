import { Component, OnInit } from '@angular/core'
import { TenantAdminService } from '../../tenant-admin.service'
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material'
import { IResponseAllSources } from '../../models/userRegistration.model'
import { NsAutoComplete } from '@ws-widget/collection/src/lib/_common/user-autocomplete/user-autocomplete.model'
@Component({
  selector: 'ws-admin-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
})
export class UserRegistrationComponent implements OnInit {

  sources: IResponseAllSources[] = []
  isLoading = false
  userForm: FormGroup
  alreadyRegisteredUsers: string[] = []

  constructor(
    private tenantAdminSvc: TenantAdminService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.userForm = this.formBuilder.group({
      registrationMeta: this.formBuilder.array([]),
    })
  }

  removeFormItem(user: NsAutoComplete.IUserAutoComplete) {
    const items = this.userForm.get('registrationMeta') as FormArray
    items.controls.forEach((item: any, index) => {
      if (user.wid === item.get('wid').value) {
        items.removeAt(index)
      }
    })
  }

  createFormItem(user: NsAutoComplete.IUserAutoComplete): void {
    const group = this.formBuilder.group({
      wid: user.wid,
      email: user.email,
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    })
    const items = this.userForm.get('registrationMeta') as FormArray
    items.push(group)
  }

  save(source: string | undefined) {
    const users = this.userForm.get('registrationMeta') as FormArray
    if (!users.length) {
      const msg = 'Please select a user'
      this.snackBar.open(msg)
      return
    }
    if (source === undefined || !source.length) {
      const msg = 'Please select a source'
      this.snackBar.open(msg)
      return
    }
    if (this.userForm.invalid || this.userForm.untouched) {
      const msg = 'Please enter all the details'
      this.snackBar.open(msg)
      return
    }
    this.isLoading = true
    const items = this.userForm.get('registrationMeta') as FormArray
    const data = items.controls.map((item: any) => {
      return {
        userId: item.get('wid').value,
        startDate: item.get('startDate').value.toISOString().substr(0, 10),
        endDate: item.get('endDate').value.toISOString().substr(0, 10),
      }
    })
    const req = {
      source,
      items: data,
    }
    this.tenantAdminSvc.registerUsers(req).then((res: any) => {
      if (!res.alreadyRegistered.length && !res.registrationError.length) {
        this.snackBar.open('All users have been registered successfully')
      }
      if (res.alreadyRegistered.length) {
        this.alreadyRegistered(res.alreadyRegistered)
      }
    })
      .catch(() => { })
      .finally(() => {
        this.isLoading = false
      })
  }

  alreadyRegistered(users: string[]) {
    const items = this.userForm.get('registrationMeta') as FormArray
    const res = items.controls.map((item: any) => {
      if (users.includes(item.get('wid').value)) {
        return item.get('email').value
      }
    })
    this.alreadyRegisteredUsers = res
  }

  close() {
    this.alreadyRegisteredUsers = []
    const items = this.userForm.get('registrationMeta') as FormArray
    while (items.length) {
      items.removeAt(0)
    }
  }

  ngOnInit() {
    this.tenantAdminSvc.getAllSources().then((sources: IResponseAllSources[]) => {
      this.sources = sources
    }).catch(_err => {
    })
  }

}
