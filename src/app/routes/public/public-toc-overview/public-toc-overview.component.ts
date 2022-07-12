import { Component, OnInit, OnDestroy } from '@angular/core'

import { Subject } from 'rxjs'

import * as _ from 'lodash'
import { takeUntil } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'


@Component({
  selector: 'ws-public-toc-overview',
  templateUrl: './public-toc-overview.component.html',
  styleUrls: ['./public-toc-overview.component.scss']
})
export class PublicTocOverviewComponent implements OnInit, OnDestroy {
  /*
* to unsubscribe the observable
*/
  public unsubscribe = new Subject<void>()
  content: any
  tocConfig: any = null
  constructor(

    private http: HttpClient) { }

  ngOnInit() {
    if (localStorage.getItem('tocData')) {
      const data: any = localStorage.getItem('tocData')
      this.content = JSON.parse(data)
    }
    this.fetchTocConfig()
  }
  fetchTocConfig() {
    this.http.get('assets/configurations/feature/toc.json').pipe().subscribe((res: any) => {
      console.log(res)
      this.tocConfig = res
    })
  }
  ngOnDestroy() {
    this.unsubscribe.next()
    this.unsubscribe.complete()
  }
}
