import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, WidgetContentService, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { RootService } from '../../../../../src/app/component/root/root.service'
import { TStatus, ViewerDataService } from './viewer-data.service'
import { ViewerUtilService } from './viewer-util.service'
import { DiscussConfigResolve } from '../../../../../src/app/routes/discussion-forum/wrapper/resolvers/discuss-config-resolve'
export enum ErrorType {
  accessForbidden = 'accessForbidden',
  notFound = 'notFound',
  internalServer = 'internalServer',
  serviceUnavailable = 'serviceUnavailable',
  somethingWrong = 'somethingWrong',
  mimeTypeMismatch = 'mimeTypeMismatch',
  previewUnAuthorised = 'previewUnAuthorised',
}

@Component({
  selector: 'viewer-container',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
})
export class ViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
  isXSmall$ = this.valueSvc.isXSmall$
  fullScreenContainer: HTMLElement | null = null
  content: NsContent.IContent | null = null
  contentData: any
  errorType = ErrorType
  private isLtMedium$ = this.valueSvc.isLtMedium$
  sideNavBarOpened = false
  mode: 'over' | 'side' = 'side'
  forPreview = window.location.href.includes('/author/')
  isTypeOfCollection = true
  collectionId = this.activatedRoute.snapshot.queryParamMap.get('collectionId')
  status: TStatus = 'none'
  error: any | null = null
  isNotEmbed = true
  errorWidgetData: NsWidgetResolver.IRenderConfigWithTypedData<any> = {
    widgetType: 'errorResolver',
    widgetSubType: 'errorResolver',
    widgetData: {
      errorType: '',
    },
  }
  private screenSizeSubscription: Subscription | null = null
  private resourceChangeSubscription: Subscription | null = null
  tocConfig: any
  contentTypes = NsContent.EContentTypes
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  private viewerDataSubscription: Subscription | null = null
  htmlData: NsContent.IContent | null = null
  currentLicense: any
  currentLicenseName = ''
  discussionConfig: any = {}
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private valueSvc: ValueService,
    private dataSvc: ViewerDataService,
    private rootSvc: RootService,
    // private utilitySvc: UtilityService,
    private changeDetector: ChangeDetectorRef,
    public configSvc: ConfigurationsService,
    private widgetContentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    private discussiConfig: DiscussConfigResolve
  ) {
    this.rootSvc.showNavbarDisplay$.next(false)
    this.discussiConfig.setConfig()
    if (this.configSvc.userProfile) {
      this.discussionConfig = {
        userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      }
    }

  }

  getContentData(e: any) {
    e.activatedRoute.data.subscribe((data: { content: { data: NsContent.IContent } }) => {
      if (data.content && data.content.data) {

        // CHecking for JSON DATA
        // if (this.checkJson(data.content.data.creatorContacts)) {
        //   /* tslint:disable */
        //   data.content.data.creatorContacts = JSON.parse(data.content.data.creatorContacts)
        // }

        // if (this.checkJson(data.content.data.creatorDetails)) {
        //   /* tslint:disable */
        //   data.content.data.creatorDetails = JSON.parse(data.content.data.creatorDetails)
        // }

        if (this.checkJson(data.content.data.reviewer)) {
          data.content.data.reviewer = JSON.parse(data.content.data.reviewer)
        }

        this.content = data.content.data
        this.formDiscussionForumWidget(this.content)
        // if (this.discussionForumWidget) {
        //   this.discussionForumWidget.widgetData.isDisabled = true
        // }
        this.currentLicenseName = this.content.learningObjective || 'CC BY'
        this.getLicenseConfig()
      }
    })
  }
  getCourseContentData() {
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    try {
      this.widgetContentSvc.fetchContent(collectionId).subscribe((data: any) => {
        this.contentData = data.result.content
      })
    } catch (e) {
      // console.log(e)
    }
  }
  checkJson(str: any) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  ngOnInit() {
    this.getCourseContentData()

    this.getTocConfig()
    this.isNotEmbed = !(
      window.location.href.includes('/embed/') ||
      this.activatedRoute.snapshot.queryParams.embed === 'true'
    )
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.screenSizeSubscription = this.isLtMedium$.subscribe(isSmall => {
      // this.sideNavBarOpened = !isSmall
      this.sideNavBarOpened = isSmall ? false : true
      this.mode = isSmall ? 'over' : 'side'
    })
    this.resourceChangeSubscription = this.dataSvc.changedSubject.subscribe(_ => {
      this.status = this.dataSvc.status
      this.error = this.dataSvc.error
      if (this.error && this.error.status) {
        switch (this.error.status) {
          case 403: {
            this.errorWidgetData.widgetData.errorType = ErrorType.accessForbidden
            break
          }
          case 404: {
            this.errorWidgetData.widgetData.errorType = ErrorType.notFound
            break
          }
          case 500: {
            this.errorWidgetData.widgetData.errorType = ErrorType.internalServer
            break
          }
          case 503: {
            this.errorWidgetData.widgetData.errorType = ErrorType.serviceUnavailable
            break
          }
          default: {
            this.errorWidgetData.widgetData.errorType = ErrorType.somethingWrong
            break
          }
        }
      }
      if (this.error && this.error.errorType === this.errorType.mimeTypeMismatch) {
        setTimeout(() => {
          this.router.navigate([this.error.probableUrl])
          // tslint:disable-next-line: align
        }, 3000)
      }
      if (this.error && this.error.errorType === this.errorType.previewUnAuthorised) {
      }
    })

    // this.getDiscussionConfig()
  }
  getLicenseConfig() {
    const licenseurl = `${this.configSvc.sitePath}/license.meta.json`
    this.widgetContentSvc.fetchConfig(licenseurl).subscribe(data => {
      const licenseData = data
      if (licenseData) {
        this.currentLicense = licenseData.licenses.filter((license: any) => license.licenseName === this.currentLicenseName)
      }

    },
                                                            err => {
        if (err.status === 404) {
          this.getLicenseConfig()
        }
      })
  }
  getDiscussionConfig() {
    this.viewerDataSubscription = this.viewerSvc
      .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
      .subscribe(data => {
        this.htmlData = data
        this.formDiscussionForumWidget(this.htmlData)
        if (this.discussionForumWidget) {
          this.discussionForumWidget.widgetData.isDisabled = true
        }
      })
  }

  fullScreenState(isFullScreen: any) {
    // this.fsClass = isFullScreen
    this.dataSvc.changeFullScreen(isFullScreen)
  }

  getTocConfig() {
    const url = `${this.configSvc.sitePath}/feature/toc.json`
    this.widgetContentSvc.fetchConfig(url).subscribe(data => {
      this.tocConfig = data
    })
  }

  ngAfterViewChecked() {
    const container = document.getElementById('fullScreenContainer')
    if (container) {
      this.fullScreenContainer = container
      this.changeDetector.detectChanges()
    } else {
      this.fullScreenContainer = null
      this.changeDetector.detectChanges()
    }
  }

  formDiscussionForumWidget(content: NsContent.IContent) {
    this.discussionConfig.contextIdArr = content ? [content.identifier] : []
    if (this.content) {
      this.discussionConfig.categoryObj = {
        category: {
          name: content.name,
          pid: '',
          description: content.description,
          context: [
            {
              type: 'course',
              identifier: content.identifier,
            },
          ],
        },
      }
    }
    this.discussionConfig.contextType = 'course'
  }

  ngOnDestroy() {
    this.rootSvc.showNavbarDisplay$.next(true)
    if (this.screenSizeSubscription) {
      this.screenSizeSubscription.unsubscribe()
    }
    if (this.resourceChangeSubscription) {
      this.resourceChangeSubscription.unsubscribe()
    }
    if (this.viewerDataSubscription) {
      this.viewerDataSubscription.unsubscribe()
    }
  }

  toggleSideBar() {
    this.sideNavBarOpened = !this.sideNavBarOpened
  }

  minimizeBar() {
    this.sideNavBarOpened = !this.sideNavBarOpened
    // if (this.utilitySvc.isMobile) {
    //   this.sideNavBarOpened = true
    // }
  }

  public parseJsonData(s: string) {
    try {
      const parsedString = JSON.parse(s)
      return parsedString
    } catch {
      return []
    }
  }

}
