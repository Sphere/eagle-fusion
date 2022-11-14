import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  homePage() {
    location.href = '/public/home'
  }
}
