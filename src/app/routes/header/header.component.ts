import { Component, OnInit } from '@angular/core'
import { Location } from '@angular/common'
@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor() { location: Location }

  ngOnInit() {
  }
  homePage() {
    location.href = '/public/home'
  }
}
