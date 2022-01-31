import { HttpClient } from '@angular/common/http'
import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

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
  nextBtnDisable = true
  professionUrl = '../../../fusion-assets/files/professions.json'
  constructor(
    private http: HttpClient,
    private activateRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.http.get(this.professionUrl).subscribe((data: any) => {
      this.professions = data.professions
    })
    this.nextBtnDisable = true
  }
  imgSelect(img: any) {
    if (img) {
      this.nextBtnDisable = false
    }
    this.bgImgSelect = img.name
  }
  changeBackgroung() {
    this.almostDone = false
  }
  onsubmit() {
    if (this.bgImgSelect) {
      if (this.bgImgSelect === 'Mother/Family Member') {
        this.activateRoute.queryParams.subscribe(params => {
          const url = params.redirect
          if (url) {
            this.router.navigate([url])
          } else {
            this.router.navigate(['page', 'home'])
          }
        })
      } else {
        this.almostDone = true
      }
    }
  }
}
