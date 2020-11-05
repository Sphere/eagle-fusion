import { Component, Input, ViewChild, ElementRef, OnDestroy, OnChanges } from '@angular/core'
import { FormGroup, FormBuilder } from '@angular/forms'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { NSRdbmsHandsOn } from '../../rdbms-hands-on.model'
import { MatSnackBar } from '@angular/material'
import { EventService } from '@ws-widget/utils'

@Component({
  selector: 'viewer-dbms-concept-dropdown',
  templateUrl: './dbms-concept-dropdown.component.html',
  styleUrls: ['./dbms-concept-dropdown.component.scss'],
})
export class DbmsConceptDropdownComponent implements OnDestroy, OnChanges {

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
  dropdownData: NSRdbmsHandsOn.IDropdownDetails[] = []
  hasFiredRealTimeProgress = false
  executedResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  selectedOption: NSRdbmsHandsOn.IDropdownDetails | null = null
  dropdownQueryForm: FormGroup | null = null
  contentData: any
  executed = false
  loadedTables: any[] = []
  loading = true
  errorMessage = ''
  originalQuery = ''
  showTelltext = false

  options: any = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    showPrintMargin: false,
    indentedSoftWrap: false,
    wrap: true,
  }

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dbmsSvc: RdbmsHandsOnService,
    private eventSvc: EventService,
  ) { }

  ngOnChanges() {
    this.selectedOption = null
    this.dropdownData = []
    this.dropdownQueryForm = this.formBuilder.group({
    })
    this.contentData = this.resourceContent.rdbms
    this.initializeDb(false)

    if (this.contentData.dropdown) {
      this.fetchDropdownData()
    } else {
      this.originalQuery = this.contentData.query
    }
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
    this.loading = true
     this.dbmsSvc.initializeDatabase(this.resourceContent.content.identifier).subscribe(
      res => {
        this.loadedTables = []
        res.forEach((v, i) => {
          if (v.validationStatus && i > 0) {
            const parsedData = JSON.parse(v.data)
            this.loadedTables.push(
              {
                tableData: parsedData.data,
                tableName: parsedData.tablename,
                tableColumns: Object.keys(parsedData.data[0]),
              })
          }
        })
        if (flag && this.dbRefreshSuccess) {
          this.snackBar.open(this.dbRefreshSuccess.nativeElement.value)
        }
        this.loading = false
      },
      _err => {
        if (this.dbRefreshFailed) {
          this.snackBar.open(this.dbRefreshFailed.nativeElement.value)
        }
      })
  }

  onSelectionChange(index: number) {
    this.selectedOption = this.dropdownData[index]
    this.originalQuery = this.selectedOption.query
    this.executedResult = null
    this.dbmsSvc.tableRefresh(this.resourceContent.content.identifier).subscribe(res => {
      this.loadedTables = []
      res.forEach((v, _i) => {
        if (v.validationStatus) {
          const parsedData = JSON.parse(v.data)
          this.loadedTables.push(
            {
              tableData: parsedData.data,
              tableName: parsedData.tablename,
              tableColumns: Object.keys(parsedData.data[0]),
            })
        }
      })
    })
  }

  fetchDropdownData() {
    this.dbmsSvc.fetchConceptData(this.resourceContent.content.identifier).subscribe(res => {
      this.dropdownData = JSON.parse(res.data)
    })
  }

  run() {
    this.executedResult = null
    let query
    if (this.selectedOption) {
      this.showTelltext = this.contentData.dropdown ?
        (this.originalQuery === this.selectedOption.query) :
        (this.originalQuery === this.contentData.query)
      query = this.contentData.dropdown ? this.selectedOption.query : this.contentData.query
    } else {
      if (this.contentData.query && !this.contentData.dropdown) {
      query = this.contentData.query
      }
    }
    if (query) {
      this.executed = true
      if (this.contentData.compositeType) {
        this.dbmsSvc.compositeQuery(query, this.contentData.compositeType).subscribe(
          res => {
            this.executedResult = res
            this.executed = false
          },
          _err => {
            this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
            this.executed = false
          })
      } else {
        this.dbmsSvc.runQuery(query).subscribe(
          res => {
            this.executedResult = res
            this.executed = false
          },
          _err => {
            this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
            this.executed = false
          })
      }
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
