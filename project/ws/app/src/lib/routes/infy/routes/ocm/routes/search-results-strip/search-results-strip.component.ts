import { Component, OnInit, Input } from '@angular/core'
import { IWsSearchConfig } from '../../models/ocm.model'

@Component({
  selector: 'ws-app-search-results-strip',
  templateUrl: './search-results-strip.component.html',
  styleUrls: ['./search-results-strip.component.scss'],
})
export class SearchResultsStripComponent implements OnInit {
  @Input() config: IWsSearchConfig | null = null
  errorMessageCode: 'API_FAILURE' | 'NO_DATA' | 'NONE' = 'NONE'

  constructor() {}

  ngOnInit() {}
  handleNoContent(event: any) {
    if (event === 'none') {
      this.errorMessageCode = 'NO_DATA'
    } else if (event === 'error') {
      this.errorMessageCode = 'API_FAILURE'
    } else {
      this.errorMessageCode = 'NONE'
    }
  }
}
