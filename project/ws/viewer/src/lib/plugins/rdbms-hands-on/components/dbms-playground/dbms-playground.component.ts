import { Component, OnChanges, Input, ElementRef, ViewChild } from '@angular/core'
import { RdbmsHandsOnService } from '../../rdbms-hands-on.service'
import { NSRdbmsHandsOn } from '../../rdbms-hands-on.model'
import { EventService } from '@ws-widget/utils'

@Component({
  selector: 'viewer-dbms-playground',
  templateUrl: './dbms-playground.component.html',
  styleUrls: ['./dbms-playground.component.scss'],
})
export class DbmsPlaygroundComponent implements OnChanges {

  firstInput = true
  isInput = false
  inputInterval: any
  firstClick = true
  isClick = false
  clickInterval: any
  @Input() resourceContent: any
  @ViewChild('someErrorOccurred', { static: true }) someErrorOccurred: ElementRef<any> | null = null
  options: any = {
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true,
    showPrintMargin: false,
    indentedSoftWrap: false,
    wrap: true,
  }
  userQuery = ''
  executedResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  executed = false
  errorMessage = ''
  loading = true

  constructor(
    private dbmsSvc: RdbmsHandsOnService,
    private eventSvc: EventService,
  ) { }

  ngOnChanges() {
    this.userQuery = ''
    this.errorMessage = ''
    this.executedResult = null
    this.dbmsSvc.initializeDatabase(this.resourceContent.content.identifier).subscribe()
  }

  run() {
    this.executed = true
    this.dbmsSvc.playground(this.userQuery).subscribe(
      res => {
        this.executedResult = (res as unknown as any[])[0]
        this.executed = false
      },
      _err => {
        this.errorMessage = this.someErrorOccurred ? this.someErrorOccurred.nativeElement.value : ''
        this.executed = false
      })
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
