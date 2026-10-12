import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { UntypedFormControl } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTableDataSource } from '@angular/material/table'
import { NsContent } from '@ws-widget/collection'
import { ViewSubmissionComponent } from './components/view-submission/view-submission.component'
import { ResourceCollectionService } from './resource-collection.service'

@Component({
    standalone: false,
    selector: 'viewer-plugin-resource-collection',
    templateUrl: './resource-collection.component.html',
    styleUrls: ['./resource-collection.component.scss'],
    
})
export class ResourceCollectionComponent implements OnInit {
  @ViewChild('paginator', { static: true }) paginator: MatPaginator | null = null
  @Input() resourceCollectionManifest!: any
  @Input() resourceCollectionData!: NsContent.IContent
  dialogHeight = 'auto'
  submissionData: any[] = []
  dataSource = new MatTableDataSource(this.submissionData)
  currentTabIndex = 0
  index = 0
  type = 'all'
  contentId = ''
  fetchingStatus: 'fetching' | 'fetched' = 'fetched'
  answerControl: UntypedFormControl
  selectedFile: File | null = null
  message: string | null = null
  submitData = {
    isSubmit: false,
    value: 0,
  }
  // errorMessageCode: 'API_FAILURE' | 'NO_DATA' | 'INVALID_CONTENT_ID'
  supportedFormatsHash: { [key: string]: string } = {
    'video/mp4': '.mp4',
    'application/pdf': '.pdf',
    input: '.txt',
  }

  constructor(
    private readonly snackBar: MatSnackBar,
    private readonly resourceSvc: ResourceCollectionService,
    private readonly dialog: MatDialog,
  ) {
    this.answerControl = new UntypedFormControl('')
  }
  private openSnackBar(primaryMsg: string, duration = 3000) {
    this.snackBar.open(primaryMsg, undefined, {
      duration,
    })
  }
  changeFile(files: File[]) {
    if (this.selectedFile) {
      this.selectedFile = null
    }
    this.selectedFile = files[0]
  }

  submit() {
    const text = this.answerControl.value
    this.submitData.isSubmit = true
    this.fetchingStatus = 'fetching'
    this.submitData.value = 25
    if (this.currentTabIndex === 1) {
      this.submitFileTab()
    } else if (this.currentTabIndex === 0) {
      this.submitTextTab(text)
    }
  }

  private submitFileTab(): void {
    if (!this.selectedFile) {
      this.rejectSubmission('Please upload your answer')
      return
    }
    if (this.selectedFile.type === 'application/pdf' || this.selectedFile.type === 'video/mp4') {
      this.createContentDirectory(this.selectedFile)
      return
    }
    this.rejectSubmission('Invalid File Type')
    this.reset()
  }

  private submitTextTab(text: string): void {
    if (text.length >= 10) {
      const file = new File([text], 'submission.txt')
      this.createContentDirectory(file)
      return
    }
    this.rejectSubmission('Please enter your answer')
  }

  private rejectSubmission(message: string): void {
    this.fetchingStatus = 'fetched'
    this.submitData.isSubmit = false
    this.snackBar.open(message, undefined, {
      duration: 1000,
    })
  }
  reset() {
    if (this.currentTabIndex === 1) {
      this.selectedFile = null
    } else if (this.currentTabIndex === 0) {
      this.answerControl.reset()
    }
  }

  uploadFile(file: File) {

    const date = new Date()
    // tslint:disable-next-line: max-line-length
    const fileName = `Submission_${date.getFullYear()}${String(Number(date.getMonth()) + 1)}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getMilliseconds()}${this.supportedFormatsHash[file.type ? file.type : 'input']}`
    const formData = new FormData()
    formData.append('file', file, fileName)
    this.resourceSvc.uploadFile(formData, this.resourceCollectionData.identifier).subscribe(
      (data: any) => {
        if (data && data.contentUrl) {
          this.submitData.isSubmit = true
          this.submitData.value = 75
          const request = {
            submission_type: file.type ? file.type : 'input',
            url: data.contentUrl,
          }
          this.resourceSvc.postSubmission(request, this.resourceCollectionData.identifier).subscribe(
            (rData: any) => {
              if (rData.response === 'Success') {
                this.submitData.isSubmit = false
                this.submitData.value = 0
                this.message = 'Submitted Successfully'
                this.snackBar.open(this.message, undefined, {
                  duration: 2000,
                })
                this.getAllSubmissions()
                this.reset()
              }
            },
            _err => {
              this.submitData.isSubmit = false
              this.fetchingStatus = 'fetched'
              this.submitData.value = 0
              this.message = 'Error submitting file'
              this.openSnackBar(this.message)

            })
        }
      },
      _err => {
        this.submitData.isSubmit = false
        this.fetchingStatus = 'fetched'
        this.message = 'Error uploading file'
        this.openSnackBar(this.message)

      })

  }

  createContentDirectory(file: File) {
    this.resourceSvc.createContentDirectory(this.resourceCollectionData.identifier).subscribe(
      () => {
        this.submitData.isSubmit = true
        this.submitData.value = 50
        this.uploadFile(file)
      },
      err => {
        if (err.status === 409) {
          this.submitData.isSubmit = true
          this.submitData.value = 50
          this.uploadFile(file)
        } else {
          this.submitData.isSubmit = false
          this.submitData.value = 0
          this.message = 'Error creating content directory'
          this.openSnackBar(this.message)
        }
      })
  }

  ngOnInit() {
    this.getAllSubmissions()
  }

  openDialog(submissionUrl: string, submissionType: string, submissionTime: string) {
    this.dialogHeight = 'auto'
    if (submissionType === 'video/mp4') {
      this.dialogHeight = '80%'
    }
    this.dialog.open(ViewSubmissionComponent, {
      width: '100vw',
      height: this.dialogHeight,
      data: {
        url: submissionUrl,
        type: submissionType,
        date: submissionTime,
      },
    })
  }
  getAllSubmissions() {
    this.submissionData = []
    this.fetchingStatus = 'fetching'
    this.resourceSvc.getAllSubmission(this.type, this.resourceCollectionData.identifier).subscribe((data: any) => {
      if (data.response.length === 0) {
        this.fetchingStatus = 'fetched'
      } else {
        this.submissionData = data.response
        this.dataSource = new MatTableDataSource(this.submissionData)
        this.dataSource.paginator = this.paginator
        this.fetchingStatus = 'fetched'
      }
    })
  }

}
