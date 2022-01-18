import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'ws-your-background',
  templateUrl: './your-background.component.html',
  styleUrls: ['./your-background.component.scss'],
})
export class YourBackgroundComponent implements OnInit {

  professions: any
  professionUrl = '../../../fusion-assets/files/professions.json'
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get(this.professionUrl).subscribe((data: any) => {
      this.professions = data.professions
    })
  }
  // imgSelect(img: any) {
  //   console.log(img)
  // }
}
