import { Component, OnInit, Input } from '@angular/core'
import { NSRdbmsHandsOn } from '../../rdbms-hands-on.model'

@Component({
  selector: 'viewer-execution-result',
  templateUrl: './execution-result.component.html',
  styleUrls: ['./execution-result.component.scss'],
})
export class ExecutionResultComponent implements OnInit {

  @Input() executedResult: NSRdbmsHandsOn.IRdbmsApiResponse | null = null
  executedTable: any[] = []
  displayColumns: string[] = []
  telltext = ''

  constructor() { }

  ngOnInit() {
    if (this.executedResult) {
      this.executedTable = this.executedResult.data ? JSON.parse(this.executedResult.data) : []
      this.displayColumns = this.executedTable.length ? Object.keys(this.executedTable[0]) : []
      this.telltext = this.executedResult.tellTextMsg
    }
  }

}
