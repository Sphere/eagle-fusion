import { Component, Input, OnInit } from '@angular/core'
import { IPractiseCardModel } from '../../../../models/navigator.model'

@Component({
  selector: 'ws-app-lp-card',
  templateUrl: './lp-card.component.html',
  styleUrls: ['./lp-card.component.scss'],
})
export class LpCardComponent implements OnInit {
  @Input() navigatorCard!: IPractiseCardModel

  constructor() { }

  ngOnInit() { }

  launchCertification() {
    // //console.log('card data', this.navigatorCard)
    window.open(this.navigatorCard.routeButton)
  }
}
