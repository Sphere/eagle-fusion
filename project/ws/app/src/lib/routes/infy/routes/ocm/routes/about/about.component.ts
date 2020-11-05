import { Component, OnInit, Input } from '@angular/core'
import { IWsAboutConfig } from '../../models/ocm.model'

@Component({
  selector: 'ws-app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  @Input() config: IWsAboutConfig = {
    title: '',
    about: '',
  }
  constructor() {}

  ngOnInit() {}
}
