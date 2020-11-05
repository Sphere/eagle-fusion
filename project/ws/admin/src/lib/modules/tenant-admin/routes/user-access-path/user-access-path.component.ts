import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { FormControl, FormBuilder, FormGroup } from '@angular/forms'
import { MatSnackBar, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material'
// import { debounceTime, filter } from 'rxjs/operators'
import { TenantAdminService } from '../../tenant-admin.service'
import { ConfigurationsService } from '@ws-widget/utils'
import { debounceTime, filter } from 'rxjs/operators'

@Component({
  selector: 'ws-admin-user-access-path',
  templateUrl: './user-access-path.component.html',
  styleUrls: ['./user-access-path.component.scss'],
})
export class UserAccessPathComponent implements OnInit {
  accessPathForm: FormGroup
  userList: any[] = []
  accessPathList: any[] = []
  accessPathsCtrl = new FormControl()
  ordinals!: any
  userAccessPath: any[] = []
  public selectedChips: any[] = []
  fetching = true
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  @ViewChild('accessPathsView', { static: false }) accessPathsView!: ElementRef
  uploadSaveData!: boolean
  noUserAccessPaths = false

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private tenantAdminSvc: TenantAdminService,
    private configSvc: ConfigurationsService,
  ) {
    this.accessPathForm = this.fb.group({
      accessPaths: [],
    })
  }

  ngOnInit() {
    const rootOrg = this.configSvc.rootOrg
    const org = this.configSvc.org
    this.tenantAdminSvc.getOrdinals(rootOrg, org).then((res: any) => {
      this.fetching = false
      this.ordinals = res
      this.accessPathList = this.ordinals.accessPaths.slice()
    })
      .catch(() => { })
      .finally(() => {
      })
    this.accessPathsCtrl.valueChanges.pipe(
      debounceTime(400),
      filter(v => v),
    ).subscribe(() => this.fetchAccessRestrictions())
  }

  getUserList(list: any[]) {
    this.userList = JSON.parse(JSON.stringify(list))
    if (this.userList && this.userList.length) {
      this.getAccessPaths(this.userList[0].wid)
    }
  }

  getAccessPaths(wid: any) {
    this.fetching = true
    this.tenantAdminSvc.getAcessPaths(wid).subscribe(
      (res: any) => {
        this.fetching = false
        if (res && res.length) {
          this.userAccessPath = res
          this.noUserAccessPaths = false
          this.selectedChips = res[0].access_paths || []
          this.accessPathForm.controls['accessPaths'].setValue(this.selectedChips)
        } else {
          this.noUserAccessPaths = true
          this.userAccessPath = []
          this.selectedChips = []
          this.accessPathForm.controls['accessPaths'].setValue(this.selectedChips)
        }
      },
      () => {
        this.fetching = false
      })
  }

  async onSubmit(form: any) {
    this.uploadSaveData = true

    this.userAccessPath[0].access_paths = form.value.accessPaths
    const request = {
      ...this.userAccessPath[0],
    }

    this.tenantAdminSvc.updateAccessPaths(request).subscribe(
      () => {
        this.uploadSaveData = false
        form.reset()
        this.openSnackbar(this.toastSuccess.nativeElement.value)
      },
      _err => {
        this.uploadSaveData = false
        this.openSnackbar(this.toastError.nativeElement.value)
      })
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  addToFormControl(event: MatAutocompleteSelectedEvent, fieldName: string): void {
    const value = (event.option.value || '').trim()
    // if (value && this.accessPathForm.controls[fieldName].value.indexOf(value) === -1) {
    // this.accessPathForm.controls[fieldName].value.push(value)
    // this.accessPathForm.controls[fieldName].setValue(this.accessPathForm.controls[fieldName].value)
    // }

    if (value && this.selectedChips.indexOf(value) === -1) {
      this.selectedChips.push(value)
      this.accessPathForm.controls[fieldName].setValue(this.selectedChips)
    }

    this[`${fieldName}View` as keyof UserAccessPathComponent].nativeElement.value = ''
    this[`${fieldName}Ctrl` as keyof UserAccessPathComponent].setValue(null)
  }

  removeFromFormControl(keyword: any, fieldName: string): void {
    const index = this.accessPathForm.controls[fieldName].value.indexOf(keyword)
    this.accessPathForm.controls[fieldName].value.splice(index, 1)
    this.accessPathForm.controls[fieldName].setValue(this.accessPathForm.controls[fieldName].value)
  }

  removeField(event: MatChipInputEvent) {
    // Reset the input value
    if (event.input) {
      event.input.value = ''
    }
  }

  private fetchAccessRestrictions() {
    if (this.accessPathsCtrl.value.trim()) {
      this.accessPathList = this.ordinals.accessPaths.filter((v: any) => v.toLowerCase().
        indexOf(this.accessPathsCtrl.value.toLowerCase()) === 0)
    } else {
      this.accessPathList = this.ordinals.accessPaths.slice()
    }
  }
}
