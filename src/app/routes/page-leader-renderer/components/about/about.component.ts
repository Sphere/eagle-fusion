import { Component, OnInit, Input } from '@angular/core'
import { IWsLeader } from '../../model/leadership.model'

@Component({
  selector: 'ws-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  @Input() about = ''
  @Input() profile: IWsLeader | null = null
  constructor() {}

  ngOnInit() {}
}
