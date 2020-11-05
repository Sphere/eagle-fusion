import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'ws-widget-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
})
export class ProfileImageComponent implements OnInit {

  @Input() userId = ''
  @Input() userName = ''
  shortName = ''
  imageUrl: string | null = null
  fetchingData = true
  constructor() { }

  ngOnInit() {

    if (this.userName) {
      const userNameArr = this.userName.split(' ').slice(0, 2)
      this.shortName = userNameArr.map(u => u[0]).join('').toUpperCase()
    } else {
      this.shortName = ''
    }

  }

}
