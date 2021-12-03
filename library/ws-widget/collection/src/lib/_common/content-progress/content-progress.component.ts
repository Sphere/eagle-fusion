import { Component, HostBinding, Input, OnInit, OnChanges, OnDestroy } from '@angular/core'
// import { ActivatedRoute, Data } from '@angular/router'
// import { ContentProgressService } from './content-progress.service'
// import { NsContent } from '@ws-widget/collection'
// import { Subscription } from 'rxjs'
// import * as _ from 'lodash'
// import { AppTocService } from '@ws/app/src/lib/routes/app-toc/services/app-toc.service'

@Component({
  selector: 'ws-widget-content-progress',
  templateUrl: './content-progress.component.html',
  styleUrls: ['./content-progress.component.scss'],
  /* tslint:disable */
  host: {
    // Sets the role for this component to "progressbar"
    role: 'progressbar',
    // Sets the minimum and maximum values for the progressbar role.
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    // Binding that updates the current value of the progressbar.
    '[attr.aria-valuenow]': 'progress'
  },
  /* tslint:enable */
})
export class ContentProgressComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  contentId = ''

  @Input()
  progress: any

  // @Input()
  // progressType = ''

  @Input()
  forPreview = false
  // homePageData: any

  @Input()
  className = ''
  // content: NsContent.IContent | null = null
  // routeSubscription: Subscription | null = null

  rendom = Math.random()
  @HostBinding('id')
  public id = `progress_${Math.random()}`
  constructor(
    // private progressSvc: ContentProgressService,
    // private route: ActivatedRoute,
    // private tocSvc: AppTocService
  ) {
    if (this.contentId) {
      this.id = this.contentId
    }
  }

  ngOnInit() {
    // this.routeSubscription = this.route.data.subscribe((data: Data) => {
    //   const initData = this.tocSvc.initData(data)
    //   this.content = initData.content
    // })

    // if (this.content !== null) {
    //   //this.progress = this.content
    //   debugger
    //   console.log(this.progress)
    // } else {
    //   if (this.tocSvc.getcontentForWidget() !== undefined) {
    //     this.homePageData = this.tocSvc.getcontentForWidget()
    //       ; this.homePageData.forEach((element: any) => {
    //         if (element !== undefined) {
    //           //this.progress = element
    //         }
    //       })
    //   }
    //   if (this.content === null) {
    //     //this.progress = 0
    //   }
    // }
    // this.progressSvc.getProgressFor(this.contentId).subscribe(data => {
    //   this.progress = data
    //   if (this.progress) {
    //     this.progress = Math.round(this.progress * 10000) / 100
    //   }
    // })
  }

  ngOnDestroy() {
    //   if (this.routeSubscription) {
    //     this.routeSubscription.unsubscribe()
    //   }
  }

  ngOnChanges() {
    // if (this.contentId && !this.progress && !this.forPreview) {
    //   this.progressSvc.getProgressFor(this.contentId).subscribe(data => {
    //     this.progress = data
    //     if (this.progress) {
    //       this.progress = Math.round(this.progress * 10000) / 100
    //     }
    //   })
    // }

    // if (this.progress) {
    //   if (this.progressType === 'percentage') {
    //     this.progress = this.progress
    //   } else {
    //     this.progress = Math.round(this.progress * 10000) / 100
    //   }
    // }
  }
}
