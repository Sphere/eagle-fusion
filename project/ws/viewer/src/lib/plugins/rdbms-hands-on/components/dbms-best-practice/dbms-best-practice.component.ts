import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core'
import { NSRdbmsHandsOn } from '../../rdbms-hands-on.model'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { MatSnackBar } from '@angular/material'
import { FormGroup, FormBuilder } from '@angular/forms'

@Component({
  selector: 'viewer-dbms-best-practice',
  templateUrl: './dbms-best-practice.component.html',
  styleUrls: ['./dbms-best-practice.component.scss'],
})
export class DbmsBestPracticeComponent implements OnInit {
  @Input() resourceContent: any
  @ViewChild('dbRefreshSuccess', { static: true }) dbRefreshSuccess: ElementRef<any> | null = null
  @ViewChild('dbRefreshFailed', { static: true }) dbRefreshFailed: ElementRef<any> | null = null
  @ViewChild('someErrorOccurred', { static: true }) someErrorOccurred: ElementRef<any> | null = null
  contentData: any
  hasFiredRealTimeProgress = false
  originalQueryResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  loadedTables: NSRdbmsHandsOn.IInitializeDBTable[] = []
  enhancedQueryResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  dropdownData: NSRdbmsHandsOn.IDropdownDetails[] = []
  telltext = ''
  errorMessage = ''
  initialLoading = false
  selectedOption: any
  dbStructure: NSRdbmsHandsOn.IDbStructureResponse[] = []
  executed = false
  dropdownQueryForm: FormGroup | null = null
  constructor(
    private dbmsSvc: RdbmsHandsOnService,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.dropdownQueryForm = this.formBuilder.group({
    })
    this.contentData = this.resourceContent.rdbms
    this.initializeDb(false)
    if (this.contentData.dropdown) {
      this.fetchDropdownData()
    } else {
      this.selectedOption = { originalQuery: this.contentData.originalQuery, enhancedQuery: this.contentData.enhancedQuery }
    }
  }

  initializeDb(flag: boolean) {
    this.initialLoading = true
    this.loadedTables = []
    this.dbmsSvc.initializeDatabase(this.resourceContent.content.identifier).subscribe(
      (res: { forEach: (arg0: (v: any, i: any) => void) => void; }) => {
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
        this.dbmsSvc.fetchDBStructure(this.resourceContent.content.identifier).subscribe(
          result => {
            this.dbStructure = result.data ? JSON.parse(result.data) : []
            this.initialLoading = false
          },
          _err => {
            this.initialLoading = false
          },
        )
        if (flag) {
          this.snackBar.open((this.dbRefreshSuccess ? this.dbRefreshSuccess.nativeElement.value : ''))
        }
        this.initialLoading = false
      },
      (_err: any) => {
        this.snackBar.open((this.dbRefreshSuccess ? this.dbRefreshSuccess.nativeElement.value : ''))
        this.initialLoading = false
      })
  }

  onSelectionChange(index: any) {
    this.selectedOption = this.dropdownData[index]
    this.selectedOption.originalQuery = this.selectedOption.query.Enhanced
    this.selectedOption.enhancedQuery = this.selectedOption.query.original
    this.telltext = this.selectedOption.telltext
    this.originalQueryResult = null
    this.enhancedQueryResult = null
  }

  fetchDropdownData() {
    this.dbmsSvc.fetchConceptData(this.resourceContent.content.identifier).subscribe((res: { data: string; }) => {
      this.dropdownData = JSON.parse(res.data)
    })
  }

  run(flag: any) {
    this.executed = true
    const query = flag ? this.selectedOption.originalQuery : this.selectedOption.enhancedQuery
    this.dbmsSvc.runQuery(query).subscribe(
      (res: any) => {
        if (flag) {
          this.originalQueryResult = res
        } else {
          this.enhancedQueryResult = res
        }
        this.executed = false
      },
      (_err: any) => {
        this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
        this.executed = false
      })
  }

}
