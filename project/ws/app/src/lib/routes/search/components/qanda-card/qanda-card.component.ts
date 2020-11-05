import { Component, OnInit, Input } from '@angular/core'
import { IWsSocialSearchResultData } from '../../models/search.model'

@Component({
  selector: 'ws-app-qanda-card',
  templateUrl: './qanda-card.component.html',
  styleUrls: ['./qanda-card.component.scss'],
})
export class QandaCardComponent implements OnInit {
  @Input() userId = ''
  @Input() item: IWsSocialSearchResultData = {} as IWsSocialSearchResultData
  constructor() {}

  ngOnInit() {}
}
