import { Component, OnInit, Input } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Component({
  selector: 'ws-public-toc-banner',
  templateUrl: './public-toc-banner.component.html',
  styleUrls: ['./public-toc-banner.component.scss']
})
export class PublicTocBannerComponent implements OnInit {
  @Input() content: any
  tocConfig: any = null
  constructor(private http: HttpClient) {
    console.log(this.content)
  }

  ngOnInit() {
    this.fetchTocConfig()
  }
  fetchTocConfig() {
    this.http.get('assets/configurations/feature/toc.json').pipe().subscribe((res: any) => {
      console.log(res)
      this.tocConfig = res
    })
  }
}
