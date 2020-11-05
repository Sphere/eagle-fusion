import { Component, OnInit } from '@angular/core'
import { ValueService } from '@ws-widget/utils/src/public-api'

@Component({
  selector: 'ws-app-license',
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.scss'],
})
export class LicenseComponent implements OnInit {
  isXSmall = false
  constructor(private valueSvc: ValueService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isXSmall = isXSmall
    })
  }

  ngOnInit() {
  }

}
