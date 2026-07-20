import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Data } from '@angular/router'
import { Subscription } from 'rxjs'
import { AppTocService } from '../../services/app-toc.service'

@Component({
  standalone: false,
  selector: 'ws-app-app-toc-references',
  templateUrl: './app-toc-references.component.html',
  styleUrls: ['./app-toc-references.component.scss'],

})
export class AppTocReferencesComponent implements OnInit {
  content: any = null
  references!: any
  routeSubscription: Subscription | null = null

  loadContent = true
  constructor(public route: ActivatedRoute, private tocSharedSvc: AppTocService,

  ) { }

  ngOnInit() {
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.initData(data)
      })
    }
  }
  public initData(data: Data) {
    const initData = this.tocSharedSvc.initData(data)
    this.content = initData.content
    if (this.content && this.content.references) {
      this.references = JSON.parse(this.content.references)
    }
  }
}
