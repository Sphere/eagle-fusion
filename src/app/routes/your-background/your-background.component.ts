import { HttpClient } from '@angular/common/http'
import { Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'ws-your-background',
  templateUrl: './your-background.component.html',
  styleUrls: ['./your-background.component.scss'],
})
export class YourBackgroundComponent implements OnInit {
  @Input() aboutYou: any
  bgImgSelect: any
  almostDone = false
  professions: any
  professionUrl = '../../../fusion-assets/files/professions.json'
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get(this.professionUrl).subscribe((data: any) => {
      this.professions = data.professions
    })
  }
  imgSelect(img: any) {
    console.log("img", img.name)
    this.bgImgSelect = img.name
    console.log("AboutYou", this.aboutYou.value)
  }
  changeBackgroung() {
    this.almostDone = false
  }
  onsubmit() {
    this.almostDone = true
  }
}
