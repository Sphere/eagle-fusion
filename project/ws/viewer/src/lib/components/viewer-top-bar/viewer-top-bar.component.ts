import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, OnChanges } from '@angular/core'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute } from '@angular/router'
import { ConfigurationsService, NsPage, ValueService } from '@ws-widget/utils'
import { Subscription } from 'rxjs'
import { ViewerDataService } from '../../viewer-data.service'
import { WidgetContentService } from '@ws-widget/collection/src/lib/_services/widget-content.service'
import { ViewerUtilService } from '../../viewer-util.service'
import { NsContent } from '@ws-widget/collection/src/lib/_services/widget-content.model'
import { MatDialog } from '@angular/material'
import 'jspdf-autotable'
import { BadgesService } from '../../../../../app/src/lib/routes/profile/routes/badges/badges.service'
import { IBadgeResponse } from '../../../../../app/src/lib/routes/profile/routes/badges/badges.model'
import { NoAccessDialogComponent } from '../../../../../app/src/lib/routes/goals/components/no-access-dialog/no-access-dialog.component'
@Component({
  selector: 'viewer-viewer-top-bar',
  templateUrl: './viewer-top-bar.component.html',
  styleUrls: ['./viewer-top-bar.component.scss'],
})
export class ViewerTopBarComponent implements OnInit, OnChanges, OnDestroy {
  @Input() frameReference: any
  @Input() forPreview = false
  @Output() toggle = new EventEmitter()
  private viewerDataServiceSubscription: Subscription | null = null
  private paramSubscription: Subscription | null = null
  private viewerDataServiceResourceSubscription: Subscription | null = null
  appIcon: SafeUrl | null = null
  isTypeOfCollection = false
  collectionType: string | null = null
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  pageNavbar: Partial<NsPage.INavBackground> = this.configSvc.pageNavBar
  resourceId: string = (this.viewerDataSvc.resourceId as string) || ''
  resourceName: string | null = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
  collectionId = ''
  logo = true
  isPreview = false
  forChannel = false
  collection: any
  collectionCard: any
  @Input() screenContent: NsContent.IContent | null = null
  // @Input() enableFullScreen: any
  public isInFullScreen = false
  obj: NsContent.IContent | null = null
  isAuthor = false
  @Output() fsState: EventEmitter<boolean> = new EventEmitter()
  isSmall = false
  collectionIdentifier: any
  courseStatus = ''
  isUpdating = false
  badges: IBadgeResponse
  imageUrl = '/fusion-assets/icons/certificate.jpg'
  allowDownload = false
  showDownloadCertificate = false
  userFullname = ''
  receivedDate = ''
  rnNumber = true

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    // private logger: LoggerService,
    private configSvc: ConfigurationsService,
    private viewerDataSvc: ViewerDataService,
    private valueSvc: ValueService,
    private contentSvc: WidgetContentService,
    private viewerSvc: ViewerUtilService,
    public dialog: MatDialog,
    private badgesSvc: BadgesService,
  ) {
    this.badges = {
      canEarn: [],
      closeToEarning: [],
      earned: [],
      lastUpdatedDate: '',
      recent: [],
      totalPoints: [{ collaborative_points: 0, learning_points: 0 }],
    }
    this.valueSvc.isLtMedium$.subscribe(isXSmall => {
      // this.logo = !isXSmall
      this.isSmall = isXSmall
    })
  }

  ngOnChanges() {
    if (this.screenContent !== null) {
      this.obj = this.screenContent
    }

  }

  ngOnInit() {
    if (window.location.href.includes('/channel/')) {
      this.forChannel = true
    }
    if (window.location.href.includes('/author/')) {
      this.isAuthor = true
    }
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    // if (this.configSvc.rootOrg === EInstance.INSTANCE) {
    // this.logo = false
    // }

    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
    if (this.collectionIdentifier === 'lex_auth_01308384668903833673' || this.collectionIdentifier === 'lex_auth_01311423170518220869'
      || this.collectionIdentifier === 'lex_auth_013268426750025728383' || this.collectionIdentifier === 'lex_auth_0133166670601502721') {
      this.showDownloadCertificate = true
    }
    const collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    if (collectionId && collectionType) {
      try {
        this.contentSvc
          .fetchAuthoringContent(collectionId).subscribe(data => {
            this.collection = data
            if (this.configSvc.instanceConfig) {
              this.appIcon = this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.configSvc.instanceConfig.logos.appBottomNav,
              )
            }
            // tslint:disable-next-line:no-shadowed-variable
            this.viewerDataServiceSubscription = this.viewerDataSvc.tocChangeSubject.subscribe(data => {
              this.prevResourceUrl = data.prevResource
              this.nextResourceUrl = data.nextResource
              if (this.resourceId !== this.viewerDataSvc.resourceId) {
                this.resourceId = this.viewerDataSvc.resourceId as string
                this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
              }
            })
            this.paramSubscription = this.activatedRoute.queryParamMap.subscribe(async params => {
              this.collectionId = params.get('collectionId') as string
              this.isPreview = params.get('preview') === 'true' ? true : false
            })
            this.viewerDataServiceResourceSubscription = this.viewerDataSvc.changedSubject.subscribe(
              _data => {
                this.resourceId = this.viewerDataSvc.resourceId as string
                this.resourceName = this.viewerDataSvc.resource ? this.viewerDataSvc.resource.name : ''
              },
            )
            this.viewerSvc.castResource.subscribe(user => this.screenContent = user)
          })
      } catch (e) {
        // TODO  console.log(e)
      }
    }

    this.viewerDataSvc.progressStatus.subscribe(data => {
      this.courseStatus = data
    })

    if (this.collectionIdentifier === 'lex_auth_0133166670601502721' &&
      !this.configSvc.userRegistryData.value.personalDetails.regNurseRegMidwifeNumber) {
      this.rnNumber = false
    }
  }

  // Fetch badge data for certificate download
  fetchBadges() {
    this.badgesSvc.fetchBadges().subscribe(data => {
      this.badges = data
    })
  }

  updateBadges() {
    this.badgesSvc.reCalculateBadges().subscribe(
      _ => {
        this.fetchBadges()
      })
  }

  getReceivedDate(badgeId: string) {
    this.badges.recent.forEach(badge => {
      if (badge.badge_id === badgeId) {
        this.receivedDate = badge.last_received_date
      }
    })
    if (this.receivedDate === '') {
      this.badges.earned.forEach(badge => {
        if (badge.badge_id === badgeId) {
          this.receivedDate = badge.last_received_date
        }
      })
    }
    return this.receivedDate
  }

  fullScreenState(state: boolean) {
    this.isInFullScreen = state
    this.fsState.emit(state)
  }

  ngOnDestroy() {
    if (this.viewerDataServiceSubscription) {
      this.viewerDataServiceSubscription.unsubscribe()
    }
    if (this.paramSubscription) {
      this.paramSubscription.unsubscribe()
    }
    if (this.viewerDataServiceResourceSubscription) {
      this.viewerDataServiceResourceSubscription.unsubscribe()
    }
  }

  toggleSideBar() {
    this.toggle.emit()
  }

  back() {
    try {
      if (window.self !== window.top) {
        return
      }
      window.history.back()
    } catch (_ex) {
      window.history.back()
    }
  }

  showCompleteCourseDialog() {
    this.dialog.open(NoAccessDialogComponent, {
      data: {
        type: 'certify',
      },
      width: '600px',
    })
  }
}
