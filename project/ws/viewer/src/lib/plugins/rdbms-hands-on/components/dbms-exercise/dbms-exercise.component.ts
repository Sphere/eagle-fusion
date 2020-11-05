import { Component, Input, ViewChild, ElementRef, OnDestroy, OnChanges } from '@angular/core'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { NSRdbmsHandsOn } from '../../rdbms-hands-on.model'
import { MatSnackBar, MatDialog } from '@angular/material'
import { SubmissionDialogComponent } from '../submission-dialog/submission-dialog.component'
import { EventService } from '@ws-widget/utils'

@Component({
  selector: 'viewer-dbms-exercise',
  templateUrl: './dbms-exercise.component.html',
  styleUrls: ['./dbms-exercise.component.scss'],
})
export class DbmsExerciseComponent implements  OnDestroy, OnChanges {
  @Input() resourceContent: any
  @ViewChild('dbRefreshSuccess', { static: true }) dbRefreshSuccess: ElementRef<any> | null = null
  @ViewChild('dbRefreshFailed', { static: true }) dbRefreshFailed: ElementRef<any> | null = null
  @ViewChild('someErrorOccurred', { static: true }) someErrorOccurred: ElementRef<any> | null = null

  firstInput = true
  isInput = false
  inputInterval: any
  firstClick = true
  isClick = false
  clickInterval: any
  contentData: any
  expectedOutput: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  executedResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  loading = false
  initialLoading = false
  dbStructure: NSRdbmsHandsOn.IDbStructureResponse[] = []
  verified = false
  submitted = false
  errorMessage = ''
  telltext = ''
  expectedOutputErrorMsg = ''
  submissionResult: NSRdbmsHandsOn.ISubmissionResult | null = null
  ignoreError = false

  options: any = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    showPrintMargin: false,
    indentedSoftWrap: false,
    wrap: true,
  }
  constructor(
    private snackBar: MatSnackBar,
    private dbmsSvc: RdbmsHandsOnService,
    public dialog: MatDialog,
    private eventSvc: EventService,
  ) {

  }
  ngOnChanges() {
    this.contentData = this.resourceContent.rdbms
    this.initialLoading = false
    this.initializeDb(false)
  }
  ngOnDestroy() {
    if (this.inputInterval) {
      clearInterval(this.inputInterval)
    }
    if (this.clickInterval) {
      clearInterval(this.clickInterval)
    }
  }

  initializeDb(flag: boolean) {
    this.dbmsSvc.initializeDatabase(this.resourceContent.content.identifier).subscribe(
      _response => {
        if (flag && this.dbRefreshSuccess) {
          this.snackBar.open(this.dbRefreshSuccess.nativeElement.value)
        }
        this.dbmsSvc.fetchDBStructure(this.resourceContent.content.identifier).subscribe(
          result => {
            this.dbStructure = result.data ? JSON.parse(result.data) : []
            this.initialLoading = true
          })
        if (this.contentData.expectedOutput) {
          this.expectedOutputErrorMsg = ''
          this.loading = true
          this.dbmsSvc.fetchExpectedOutput(this.resourceContent.content.identifier).subscribe(
            res => {
              this.expectedOutput = res
              this.loading = false
            },
            _err => {
              this.expectedOutputErrorMsg = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
              this.loading = false
            })
        }
      },
      _err => {
        if (this.dbRefreshFailed) {
          this.snackBar.open(this.dbRefreshFailed.nativeElement.value)
        }
      })
  }

  verify() {
    this.executedResult = null
    this.submissionResult = null
    this.errorMessage = ''
    this.telltext = ''
    if (this.contentData.query) {
      const reqBody = {
        input_data: this.contentData.query,
        ignore_error: true,
      }
      this.verified = true
      this.dbmsSvc.verifyQuery(reqBody, this.resourceContent.content.identifier).subscribe(
        res => {
          this.executedResult = res
          this.verified = false
          this.telltext = res.tellTextMsg
        },
        _err => {
          this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
          this.verified = false
        })
    }
  }

  raiseInputChange() {
    this.isInput = true
    if (this.isInput && this.firstInput) {
      this.raiseInteractTelemetry('editor', 'codeinput')
      this.startInputTimer()
    }
    this.firstInput = false
  }

  raiseClickEvent() {
    this.isClick = true
    if (this.isClick && this.firstClick) {
      this.raiseInteractTelemetry('editor', 'buttonclick')
      this.startClickTimer()
    }
    this.firstClick = false
  }

  submit() {
    this.executedResult = null
    this.submissionResult = null
    this.errorMessage = ''
    this.telltext = ''
    if (this.contentData.query) {
      const reqBody = {
        input_data: this.contentData.query,
        ignore_error: this.ignoreError,
      }
      this.submitted = true
      this.dbmsSvc.submitQuery(reqBody, this.resourceContent.content.identifier).subscribe(
        res => {
          this.executedResult = res.verifyResult
          this.submitted = false
          if (this.executedResult && (!this.executedResult.validationStatus && !this.ignoreError)) {
            const dialogRef = this.dialog.open(SubmissionDialogComponent, {
              width: '500px',
            })
            dialogRef.afterClosed().subscribe(result => {
              if (result === 'submit') {
                this.ignoreError = true
                this.submit()
              }
            })
          } else {
            this.submissionResult = { message: res.submissionMessage, status: res.submitionStatus }
            this.submitted = false
            this.ignoreError = false
          }
          this.telltext = res.tellTextMsg
        },
        _err => {
          this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
          this.submitted = false
        })
    }
  }
  raiseInteractTelemetry(action: string, event: string) {
    if (this.resourceContent.content.identifier) {
      this.eventSvc.raiseInteractTelemetry(action, event, {
        contentId: this.resourceContent.content.identifier,
      })
    }
    if (event === 'codeinput') {
      this.isInput = false
    }
    if (event === 'buttonclick') {
      this.isClick = false
    }
  }
  startInputTimer() {
    this.inputInterval = setInterval(() => {
      if (this.isInput) {
        this.raiseInteractTelemetry('editor', 'codeinput')
      }
    },                               2 * 60000)
  }
  startClickTimer() {
    this.clickInterval = setInterval(() => {
      if (this.isClick) {
        this.raiseInteractTelemetry('editor', 'buttonclick')
      }
    },                               2 * 60000)
  }

}
