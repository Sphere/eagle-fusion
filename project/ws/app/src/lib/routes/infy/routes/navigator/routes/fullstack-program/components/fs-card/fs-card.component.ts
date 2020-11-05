import { Component, Input, OnInit } from '@angular/core'
import { IFsCardModel } from '../../../../models/navigator.model'

@Component({
  selector: 'ws-app-fs-card',
  templateUrl: './fs-card.component.html',
  styleUrls: ['./fs-card.component.scss'],
})
export class FsCardComponent implements OnInit {
  @Input() navigatorCard!: IFsCardModel

  constructor() {
  }

  launchCertification() {
    // //console.log('card data', this.navigatorCard)
    if (this.navigatorCard.routeButton.includes('Wingspan')) {

    } else {
      window.open(this.navigatorCard.routeButton)
    }
  }

  ngOnInit() { }
}
