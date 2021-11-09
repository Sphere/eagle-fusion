import { Component, OnInit, Inject, forwardRef, ViewChild, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { FormGroup, FormControl, Validators } from '@angular/forms'
import { DateAdapter, MAT_DATE_FORMATS, MatSnackBar } from '@angular/material'
import { AppDateAdapter, APP_DATE_FORMATS, startWithYearformat } from '@ws/app'
import { ConfigurationsService } from '@ws-widget/utils'
import { AppTocService } from '../../services/app-toc.service'

@Component({
  selector: 'ws-app-create-batch-dialog',
  templateUrl: './create-batch-dialog.component.html',
  styleUrls: ['./create-batch-dialog.component.scss'],
  providers: [
    { provide: forwardRef(() => DateAdapter), useClass: forwardRef(() => AppDateAdapter) },
    { provide: forwardRef(() => MAT_DATE_FORMATS), useValue: forwardRef(() => APP_DATE_FORMATS) },
  ],
})
export class CreateBatchDialogComponent implements OnInit {
  createBatchForm: FormGroup
  enrollmentTypes = ['open', 'closed']
  namePatern = `^[a-zA-Z\\s\\']{1,32}$`
  today = new Date()
  uploadSaveData = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>

  constructor(
    public dialogRef: MatDialogRef<CreateBatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appTocService: AppTocService,
    private snackBar: MatSnackBar,
    private configSvc: ConfigurationsService
  ) {
    this.createBatchForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(this.namePatern)]),
      description: new FormControl('', []),
      enrollmentType: new FormControl(this.enrollmentTypes[0], [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', []),
      enrollmentEndDate: new FormControl('', []),
      // createdFor: new FormControl('', []),
      mentors: new FormControl('', []),
      courseId: new FormControl('', []),
      createdBy: new FormControl('', []),
    })
  }

  ngOnInit() {
  }

  public createBatchSubmit(form: any) {
    this.uploadSaveData = true
    form.value.startDate = startWithYearformat(new Date(`${form.value.startDate}`))
    if (form.value.endDate) {
      form.value.endDate = startWithYearformat(new Date(`${form.value.endDate}`))
    } else {
      delete form.value.endDate
    }
    if (form.value.enrollmentEndDate) {
      form.value.enrollmentEndDate = startWithYearformat(new Date(`${form.value.enrollmentEndDate}`))
    } else {
      delete form.value.enrollmentEndDate
    }
    form.value.mentors = []
    if (this.configSvc.userProfile) {
      // form.value.createdFor = [this.configSvc.userProfile.rootOrgId]
      form.value.createdBy = this.configSvc.userProfile.userId
    }
    if (this.data && this.data.content) {
      form.value.courseId = this.data.content.identifier
    }
    this.appTocService.createBatch(form.value).subscribe(
      () => {
        this.uploadSaveData = false
        this.openSnackbar(this.toastSuccess.nativeElement.value)
        this.dialogRef.close()
      },
      err => {
        if (err && err.error && err.error.params && err.error.params.errmsg) {
          this.openSnackbar(err.error.params.errmsg)
        } else {
          this.openSnackbar(this.toastError.nativeElement.value)
        }
        this.uploadSaveData = false
      })
  }
  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

}
