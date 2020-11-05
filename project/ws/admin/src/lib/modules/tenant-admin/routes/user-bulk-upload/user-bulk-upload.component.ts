import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { FormBuilder, Validators } from '@angular/forms'
import { FileService } from '../../upload.service'
import { Observable } from 'rxjs'
import { MatSnackBar, MatSort } from '@angular/material'
import { TenantAdminService } from '../../tenant-admin.service'
import { MatPaginator } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
@Component({
  selector: 'ws-admin-user-bulk-upload',
  templateUrl: './user-bulk-upload.component.html',
  styleUrls: ['./user-bulk-upload.component.scss'],
})
export class UserBulkUploadComponent implements OnInit {
  private fileName: any
  public displayLoader!: Observable<boolean>
  public formGroup = this.fb.group({
    file: ['', Validators.required],
  })
  fetching = false
  showFileError = false
  @ViewChild('toastSuccess', { static: true }) toastSuccess!: ElementRef<any>
  @ViewChild('toastError', { static: true }) toastError!: ElementRef<any>
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator
  @ViewChild(MatSort, { static: true }) sort!: MatSort
  bulkUploadData: any
  uplaodSuccessMsg!: string
  dataSource: MatTableDataSource<any>
  displayedColumns: string[] = ['id', 'name', 'status', 'report']

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private snackBar: MatSnackBar,
    private tenantAdminSvc: TenantAdminService,
  ) {
    this.dataSource = new MatTableDataSource(this.bulkUploadData)
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  ngOnInit() {
    this.displayLoader = this.fileService.isLoading()
    this.getBulkUploadData()
  }
  getBulkUploadData() {
    this.fetching = true
    this.tenantAdminSvc.getBulkUploadData().then((res: any) => {
      this.fetching = false
      this.bulkUploadData = res
      this.dataSource = new MatTableDataSource(this.bulkUploadData)
    })
      .catch(() => { })
      .finally(() => {
        this.fetching = false
      })
  }

  public onFileChange(event: any) {
    this.showFileError = false
    const reader = new FileReader()
    if (event.target.files && event.target.files.length) {
      this.fileName = event.target.files[0].name
      const [file] = event.target.files
      reader.readAsDataURL(file)

      reader.onload = () => {
        this.formGroup.patchValue({
          file: reader.result,
        })
      }
    }
  }

  public onSubmit(): void {
    // Validate File type before uploading
    if (this.fileService.validateFile(this.fileName)) {
      if (this.formGroup && this.formGroup.get('file')) {
        // tslint:disable-next-line: no-non-null-assertion
        this.fileService.upload(this.fileName, this.formGroup!.get('file')!.value)
          .subscribe(res => {
            // this.uplaodSuccessMsg = res
            this.openSnackbar(res)
            this.getBulkUploadData()
          })
      }
    } else {
      this.showFileError = true
      this.openSnackbar(this.toastError.nativeElement.value)
    }
  }

  public downloadFile(): void {
    this.fileService.download()
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }

  public downloadReport(row: any) {
    this.fileService.downloadReport(row.id, row.name)
  }

}
