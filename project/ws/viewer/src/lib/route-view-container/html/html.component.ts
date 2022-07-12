import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core'
import { NsContent, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute } from '@angular/router'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { PipeLimitToPipe } from '@ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.pipe'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { ViewerDataService } from '../../viewer-data.service'
@Component({
  selector: 'viewer-html-container',
  templateUrl: './html.component.html',
  styleUrls: ['./html.component.scss'],
})
export class HtmlComponent implements OnInit, OnChanges {

  @Input() isNotEmbed = true
  @Input() isFetchingDataComplete = false
  @Input() htmlData: NsContent.IContent | null = null
  @Input() discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  @Input() isPreviewMode = false
  @Input() forPreview = false
  isTypeOfCollection = false
  learningObjective: SafeHtml = ''
  description: SafeHtml = ''
  isLtMedium = false
  isScormContent = false
  isRestricted = false
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  currentCompletionPercentage: number | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  collectionIdentifier: any

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private contentSvc: WidgetContentService,
    private pipeLimitTo: PipeLimitToPipe,
    private valueSvc: ValueService,
    private configSvc: ConfigurationsService,
    private viewerDataSvc: ViewerDataService

  ) {

  }
  // async setcookies() {
  //   if (this.htmlData && this.htmlData.artifactUrl && (this.htmlData.artifactUrl.indexOf('/content-store/') > -1)) {
  //     return await this.contentSvc.setS3Cookie(this.htmlData.identifier || '').toPromise()
  //   }
  // }
  ngOnInit() {
    // this.setcookies().then(() => {
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    this.viewerDataServiceSubscription = this.viewerDataSvc.tocChangeSubject.subscribe(data => {
      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
      this.currentCompletionPercentage = data.currentCompletionPercentage
    })
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.valueSvc.isLtMedium$.subscribe(isLtMd => {
      this.isLtMedium = isLtMd
    })
    // }).catch((ex) => {
    //   console.warn("Please refresh Page", ex)
    // })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
    this.isProgressCheck()
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const prop in changes) {
      if (prop === 'htmlData') {
        if (this.htmlData && this.htmlData.artifactUrl.startsWith('https://scorm.')) {
          this.isScormContent = true
        } else {
          this.isScormContent = false
        }
        if (this.htmlData && this.htmlData.learningObjective) {
          this.learningObjective = this.domSanitizer.bypassSecurityTrustHtml(
            this.htmlData.learningObjective,
          )
        }
        if (this.htmlData && this.htmlData.description) {
          const description = this.pipeLimitTo.transform(this.htmlData.description, 450)
          this.description = this.domSanitizer.bypassSecurityTrustHtml(description)
        }

      }
    }
  }
  isProgressCheck(): boolean {
    if (typeof this.currentCompletionPercentage === 'undefined' && this.currentCompletionPercentage !== 100) {
      return false
    }
    return true
  }
}
