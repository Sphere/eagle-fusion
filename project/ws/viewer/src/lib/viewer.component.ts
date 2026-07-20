import { AfterViewChecked, ChangeDetectorRef, Component, effect, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { NsContent, WidgetContentService, NsDiscussionForum } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ValueService, ConfigurationsService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { RootService } from '../../../../../src/app/component/root/root.service'
import { TStatus, ViewerDataService } from './viewer-data.service'
import { ViewerUtilService } from './viewer-util.service'
import { DiscussConfigResolve } from '../../../../../src/app/routes/discussion-forum/wrapper/resolvers/discuss-config-resolve'
import {
  ILicenseConfig,
  ILicenseMetadata,
  ITocConfig,
  IDiscussionConfigData,
  ContentEventData,
} from './viewer.model'
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
  standalone: false,
  selector: 'viewer-container',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],

})
export class ViewerComponent implements OnInit, OnDestroy, AfterViewChecked {
  isXSmall$: boolean = false
  fullScreenContainer: HTMLElement | null = null
  content: NsContent.IContent | null = null
  contentData: NsContent.IContent | null = null
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
  tocConfig: ITocConfig | null = null
  contentTypes = NsContent.EContentTypes
  discussionForumWidget: NsWidgetResolver.IRenderConfigWithTypedData<
    NsDiscussionForum.IDiscussionForumInput
  > | null = null
  private viewerDataSubscription: Subscription | null = null
  htmlData: NsContent.IContent | null = null
  currentLicense: ILicenseConfig[] | null = null
  currentLicenseName = ''
  discussionConfig: IDiscussionConfigData = {}
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly valueSvc: ValueService,
    private readonly dataSvc: ViewerDataService,
    private readonly rootSvc: RootService,
    private readonly changeDetector: ChangeDetectorRef,
    public readonly configSvc: ConfigurationsService,
    private readonly widgetContentSvc: WidgetContentService,
    private readonly viewerSvc: ViewerUtilService,
    private readonly discussiConfig: DiscussConfigResolve
  ) {
    this.rootSvc.showNavbarDisplay$.next(false)
    this.discussiConfig.setConfig()
    if (this.configSvc.userProfile) {
      this.discussionConfig = {
        userName: (this.configSvc.nodebbUserProfile && this.configSvc.nodebbUserProfile.username) || '',
      }
    }

    effect(() => {
      this.isXSmall$ = this.valueSvc.isMobile()
    })

  }

  getContentData(e: ContentEventData): void {
    e.activatedRoute.data.subscribe((data: { content: { data: NsContent.IContent } }) => {
      if (data.content && data.content.data) {
        if (this.checkJson(data.content.data.reviewer)) {
          data.content.data.reviewer = JSON.parse(data.content.data.reviewer)
        }

        this.content = data.content.data
        this.formDiscussionForumWidget(this.content)
        this.currentLicenseName = this.content.learningObjective || 'CC BY'
        this.getLicenseConfig()
      }
    })
  }
  getCourseContentData(): void {
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    try {
      this.widgetContentSvc.fetchContent(collectionId).subscribe((data: NsContent.IContent) => {
        this.contentData = data
      })
    } catch (e) {
      // Error in fetching course content data
    }
  }
  checkJson(str: string | null | undefined): boolean {
    if (!str) {
      return false
    }
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
  }
  getLicenseConfig(): void {
    const licenseurl = '/fusion-assets/files/license.meta.json'
    this.widgetContentSvc.fetchConfig(licenseurl).subscribe(
      (data: ILicenseMetadata) => {
        if (data && data.licenses) {
          this.currentLicense = data.licenses.filter(license => license.licenseName === this.currentLicenseName)
        }
      },
      (err: any) => {
        if (err && err.status === 404) {
          this.getLicenseConfig()
        }
      }
    )
  }
  getDiscussionConfig(): void {
    this.viewerDataSubscription = this.viewerSvc
      .getContent(this.activatedRoute.snapshot.paramMap.get('resourceId') || '')
      .subscribe((data: NsContent.IContent) => {
        this.htmlData = data
        this.formDiscussionForumWidget(this.htmlData)
        if (this.discussionForumWidget) {
          this.discussionForumWidget.widgetData.isDisabled = true
        }
      })
  }

  fullScreenState(isFullScreen: boolean): void {
    this.dataSvc.changeFullScreen(isFullScreen)
  }

  getTocConfig(): void {
    const url = `fusion-assets/files/toc.json`
    this.widgetContentSvc.fetchConfig(url).subscribe((data: ITocConfig) => {
      this.tocConfig = data
    })
  }

  ngAfterViewChecked() {
    const container = document.getElementById('fullScreenContainer') || null
    if (this.fullScreenContainer !== container) {
      Promise.resolve().then(() => {
        this.fullScreenContainer = container
        this.changeDetector.markForCheck()
      })
    }
  }

  formDiscussionForumWidget(content: NsContent.IContent | null): void {
    if (!content) {
      return
    }
    this.discussionConfig.contextIdArr = [content.identifier]
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

  toggleSideBar(): void {
    this.sideNavBarOpened = !this.sideNavBarOpened
  }

  minimizeBar(): void {
    this.sideNavBarOpened = !this.sideNavBarOpened
  }

  public parseJsonData(s: string): any {
    try {
      const parsedString = JSON.parse(s)
      return parsedString
    } catch {
      return {}
    }
  }

}
