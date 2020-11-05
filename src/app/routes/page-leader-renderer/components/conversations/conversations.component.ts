import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { NSSearch } from '@ws-widget/collection'

@Component({
  selector: 'ws-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
})
export class ConversationsComponent implements OnInit {
  @Input() widgetSearchRequest: NsWidgetResolver.IRenderConfigWithTypedData<
    NSSearch.ISearchRequest
  > | null = null

  errorMessageCode: 'API_FAILURE' | 'NO_DATA' | '' = ''

  constructor() {}

  ngOnInit() {}

  handleNoContent(event: any) {
    if (event === 'none') {
      this.errorMessageCode = 'NO_DATA'
    } else if (event === 'error') {
      this.errorMessageCode = 'API_FAILURE'
    } else {
      this.errorMessageCode = ''
    }
  }
}
