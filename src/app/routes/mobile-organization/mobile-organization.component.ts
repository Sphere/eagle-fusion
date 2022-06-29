import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-mobile-organization',
  templateUrl: './mobile-organization.component.html',
  styleUrls: ['./mobile-organization.component.scss'],
})
export class MobileOrganizationComponent implements OnInit {
  organization: any
  constructor() {
    this.organization = [
      {
        url: './../../fusion-assets/icons/fernandez-foundation-img.png',
      },
      {
        url: './../../fusion-assets/icons/manyata.png',
      },
      {
        url: './../../fusion-assets/icons/coaching-pocqi-img.png',
      },
    ]
  }
  ngOnInit() { }

}
