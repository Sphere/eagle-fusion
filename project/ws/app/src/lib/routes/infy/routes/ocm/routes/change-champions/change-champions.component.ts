import { Component, OnInit, Input } from '@angular/core'
import { IWsChampionsConfig } from '../../models/ocm.model'

@Component({
  selector: 'ws-app-change-champions',
  templateUrl: './change-champions.component.html',
  styleUrls: ['./change-champions.component.scss'],
})
export class ChangeChampionsComponent implements OnInit {
  @Input() config: IWsChampionsConfig = {
    title: '',
    champions: [],
  }

  constructor() {}

  ngOnInit() {}
}
