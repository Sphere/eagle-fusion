import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { NSRdbmsHandsOn } from '../../rdbms-hands-on.model'
import { MatSnackBar } from '@angular/material'

@Component({
  selector: 'viewer-dbms-concept-create',
  templateUrl: './dbms-concept-create.component.html',
  styleUrls: ['./dbms-concept-create.component.scss'],
})
export class DbmsConceptCreateComponent implements OnInit {
  @Input() resourceContent: any
  @ViewChild('dbRefreshSuccess', { static: true }) dbRefreshSuccess: ElementRef<any> | null = null
  @ViewChild('dbRefreshFailed', { static: true }) dbRefreshFailed: ElementRef<any> | null = null
  @ViewChild('someErrorOccurred', { static: true }) someErrorOccurred: ElementRef<any> | null = null
  @ViewChild('clickOnRunButton', { static: true }) clickOnRunButton: ElementRef<any> | null = null
  @ViewChild('clickOnRunToCreate', { static: true }) clickOnRunToCreate: ElementRef<any> | null = null
  @ViewChild('clickOnEntryButton', { static: true }) clickOnEntryButton: ElementRef<any> | null = null
  @ViewChild('viewTableLevelConstraints', { static: true }) viewTableLevelConstraints: ElementRef<any> | null = null
  @ViewChild('viewColumnLevelConstraints', { static: true }) viewColumnLevelConstraints: ElementRef<any> | null = null
  @ViewChild('firstEntry', { static: true }) firstEntry: ElementRef<any> | null = null
  @ViewChild('secondEntry', { static: true }) secondEntry: ElementRef<any> | null = null
  @ViewChild('thirdEntry', { static: true }) thirdEntry: ElementRef<any> | null = null

  executedResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  queryForm: FormGroup | null = null
  dropdownData: NSRdbmsHandsOn.IDropdownDetails[] = []
  contentData: any
  selectedOption: any
  executed = false
  dropdownQueryForm: FormGroup | null = null
  hasFiredRealTimeProgress = false
  insertValues: any[] = []
  insertTableValues: any[] = []
  loadedTables: any[] = []
  valuesToInsertArray: any[] = []
  isEdit = false
  isDropEdit = false
  activeTab = 0
  telltext = this.clickOnRunToCreate ? this.clickOnRunToCreate.nativeElement.value : ''
  buttonText = this.viewTableLevelConstraints ? this.viewTableLevelConstraints.nativeElement.value : ''
  insertButtonText = this.firstEntry ? this.firstEntry.nativeElement.value : ''
  createQuery = ''
  counter = 0
  hideOnLoad = true
  hideButton = false
  hideOnlyTable = false
  errorMessage = ''
  originalQuery = ''
  validUserQuery = true
  showTelltext = true
  originalInsertValues: any

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
  ) { }

  ngOnInit() {
    this.queryForm = this.formBuilder.group({
      userQueryFormControl: ['', Validators.required],
    })
    this.dropdownQueryForm = this.formBuilder.group({})
    this.contentData = this.resourceContent.rdbms
    this.initializeDb(false)
    if (this.contentData.createInsert.insert.dropdown) {
      this.dropdownData = this.contentData.createInsert.insert.dropdownData
      this.insertTableValues = Object.keys(this.dropdownData[0].query[0])
      this.hideOnLoad = true
      this.hideOnlyTable = true
    } else {
      this.valuesToInsertArray = [this.contentData.createInsert.insert.insertValues[0]]
      this.insertValues = Object.keys(this.contentData.createInsert.insert.insertValues[0].data)
      this.originalInsertValues = Object.values(
        this.contentData.createInsert.insert.insertValues[0].data,
      ).toString()
      this.hideOnLoad = this.contentData.createInsert.insert.insertValues.length > 1 ? true : false
      this.hideOnlyTable =
        this.contentData.createInsert.insert.insertValues.length > 1 ? true : false
    }
    this.createQuery = this.contentData.createInsert.create.query[0]
    this.originalQuery = this.contentData.createInsert.create.query[0]
  }

  initializeDb(flag: boolean) {
    this.loadedTables = []
    this.dbmsSvc.initializeDatabase(this.resourceContent.content.identifier).subscribe(
      res => {
        res.forEach((v, i) => {
          if (v.validationStatus && i > 0) {
            const parsedData = JSON.parse(v.data)
            this.loadedTables.push({
              tableData: parsedData.data,
              tableName: parsedData.tablename,
              tableColumns: Object.keys(parsedData.data[0]),
            })
          }
        })
        if (flag) {
          if (this.dbRefreshSuccess) {
            this.snackBar.open(this.dbRefreshSuccess.nativeElement.value)
          }
        }
      },
      _err => {
        if (this.dbRefreshFailed) {
          this.snackBar.open(this.dbRefreshFailed.nativeElement.value)
        }
      },
    )
  }

  onSelectionChange(index: number) {
    this.selectedOption = this.dropdownData[index]
    this.originalInsertValues = Object.values(this.selectedOption.query[0]).toString()
    this.executedResult = null
    this.telltext = this.clickOnRunButton ? this.clickOnRunButton.nativeElement.value : ''
    this.hideOnLoad = false
    this.hideOnlyTable = false
  }

  tabClick(event: { index: number }) {
    this.executedResult = null
    if (event.index === 1) {
      this.telltext = this.contentData.createInsert.insert.telltext
    } else if (event.index === 2) {
      this.telltext = this.contentData.createInsert.drop.telltext
    } else {
      this.telltext = this.clickOnRunToCreate ? this.clickOnRunToCreate.nativeElement.value : ''
    }
  }

  multipleInsertEntries() {
    this.hideOnLoad = false
    this.hideOnlyTable = false
    this.valuesToInsertArray = [this.contentData.createInsert.insert.insertValues[this.counter]]
    this.originalInsertValues = Object.values(this.valuesToInsertArray[0].data).toString()
    this.executedResult = null
    this.telltext = this.clickOnRunButton ? this.clickOnRunButton.nativeElement.value : ''
  }

  retry(retryQuery: any) {
    this.activeTab = 0
    this.counter = 0
    this.hideOnLoad = true
    this.hideOnlyTable = false
    this.telltext = ''
    this.insertButtonText = this.firstEntry ? this.firstEntry.nativeElement.value : ''
    this.dbmsSvc.runQuery(retryQuery).subscribe()
  }

  viewOtherConstraint() {
    if (this.buttonText === (this.viewColumnLevelConstraints ? this.viewColumnLevelConstraints.nativeElement.value : '')) {
      this.createQuery = this.contentData.createInsert.create.query[0]
      this.originalQuery = this.contentData.createInsert.create.query[0]
      this.buttonText = this.viewTableLevelConstraints ? this.viewTableLevelConstraints.nativeElement.value : ''
    } else {
      this.buttonText = this.viewColumnLevelConstraints ? this.viewColumnLevelConstraints.nativeElement.value : ''
      this.createQuery = this.contentData.createInsert.create.query[1]
      this.originalQuery = this.contentData.createInsert.create.query[1]
    }
  }

  run(type: string) {
    this.executedResult = null
    this.errorMessage = ''
    let query = ''
    this.executed = true
    if (type === 'create') {
      query = this.createQuery
    } else if (type === 'insert') {
      if (!this.contentData.createInsert.insert.dropdown) {
        if (this.contentData.createInsert.insert.insertValues.length > 1) {
          this.counter += 1
          query = `${this.contentData.createInsert.insert.query[0]}(
            ${Object.values(this.valuesToInsertArray[0].data)
              .toString()
              .split(',')
              .map(v => (!v ? '\'\'' : v))})`
          this.showTelltext =
            this.originalInsertValues === Object.values(this.valuesToInsertArray[0].data).toString()
              ? true
              : false
        } else {
          query = `${this.contentData.createInsert.insert.query[0]}(
            ${Object.values(this.contentData.createInsert.insert.insertValues[0].data)
              .toString()
              .split(',')
              .map(v => (!v ? '\'\'' : v))})`
          if (
            this.originalInsertValues ===
            Object.values(this.contentData.createInsert.insert.insertValues[0].data).toString()
          ) {
            this.showTelltext = true
          } else {
            this.showTelltext = false
          }
        }
      } else {
        const queryToBeReplaced = this.contentData.createInsert.insert.query[0]
        const tempArray = Object.values(this.selectedOption.query[0])
        const insertQuery =
          this.contentData.createInsert.insert.default && !tempArray[2]
            ? queryToBeReplaced.replace(',DOJ', '')
            : queryToBeReplaced
        const replaceValue =
          this.contentData.createInsert.insert.default && tempArray[2] === ''
            ? `${tempArray[0]},${tempArray[1]}`.split(',').map(v => (!v ? '\'\'' : v))
            : tempArray
              .toString()
              .split(',')
              .map(v => (!v ? '\'\'' : v))
        query = `${insertQuery}(${replaceValue})`
        this.showTelltext = this.originalInsertValues === tempArray.toString() ? true : false
      }
    } else {
      query = this.contentData.createInsert.drop.query[0]
      if (query) {
        this.dbmsSvc.runQuery(query).subscribe(
          res => {
            this.executedResult = res
            this.executed = false
          },
          _err => {
            this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
            this.executed = false
          },
        )
      }
      return
    }
    if (query) {
      this.dbmsSvc.compositeQuery(query, type).subscribe(
        res => {
          this.executedResult = res
          this.executed = false
          if (!this.contentData.createInsert.insert.dropdown) {
            if (this.contentData.createInsert.insert.insertValues.length > 1) {
              this.hideOnLoad = true
              this.hideButton = this.counter >= 3 ? true : false
              this.hideOnlyTable = this.counter >= 3 ? false : true
              this.insertButtonText =
                this.counter === 1
                ? (this.secondEntry ? this.secondEntry.nativeElement.value : '')
                  : this.counter >= 2
                  ? (this.thirdEntry ? this.thirdEntry.nativeElement.value : '')
                  : (this.firstEntry ? this.firstEntry.nativeElement.value : '')
              // tslint:disable-next-line:max-line-length
              this.telltext = this.valuesToInsertArray[0].telltext
                ? this.valuesToInsertArray[0].telltext
                : this.clickOnEntryButton ? this.clickOnEntryButton.nativeElement.value : ''
            } else {
              this.hideOnLoad = false
              this.hideOnlyTable = false
            }
          } else {
            this.telltext = type === 'insert' ? this.selectedOption.telltext : ''
          }
          if (type === 'create') {
            this.dbmsSvc.compareQuery(this.originalQuery, query).subscribe(response => {
              this.validUserQuery = response.validationStatus
            })
            this.telltext = res.validationStatus
              ? this.contentData.createInsert.create.telltext
              : ''
          }
        },
        _err => {
          this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
          this.executed = false
        },
      )
    }
  }
}
