import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Data } from '@angular/router'
import { Subscription } from 'rxjs'
import { AppTocService } from '../../services/app-toc.service'

@Component({
  selector: 'ws-app-app-toc-references',
  templateUrl: './app-toc-references.component.html',
  styleUrls: ['./app-toc-references.component.scss'],
})
export class AppTocReferencesComponent implements OnInit, OnDestroy {
  content: any = null
  references!: any
  routeSubscription: Subscription | null = null

  loadContent = true
  constructor(private route: ActivatedRoute, private tocSharedSvc: AppTocService,

  ) { }

  ngOnInit() {
    if (this.route && this.route.parent) {
      this.routeSubscription = this.route.parent.data.subscribe((data: Data) => {
        this.initData(data)
      })
    }
    console.log("content", this.content, this.references)
  }
  private initData(data: Data) {
    const initData = this.tocSharedSvc.initData(data)
    this.content = initData.content
    if (this.content && this.content.references) {
      this.references = JSON.parse(this.content.references)
      console.log("this.references: ", this.references)
    }
  }
  ngOnDestroy() {
  }

}
