import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
import { NsContent, NsDiscussionForum, WidgetContentService } from '@ws-widget/collection'
import { NsWidgetResolver } from '@ws-widget/resolver'
import { ActivatedRoute, Router } from '@angular/router'
import { SafeHtml } from '@angular/platform-browser'
import { PipeLimitToPipe } from '@ws-widget/utils/src/lib/pipes/pipe-limit-to/pipe-limit-to.pipe'
import { ConfigurationsService, LoggerService, SafeResourceUrlService, ValueService } from '@ws-widget/utils'
import { PlayerStateService } from '../../player-state.service'
import { ViewerUtilService } from '../../viewer-util.service'
import {
  IPlayerTelemetryEvent, isHtmlContentPlayerEnabled,
} from '../../../../../../../src/app/component/sunbird-content-player/content-player.util'
import {
  IArchiveProgress, initialArchiveProgress, progressUpdateFor, reduceArchiveProgress,
} from '../../../../../../../src/app/component/sunbird-content-player/html-content-progress'
import {
  currentUserId, readLocalResume, ResumeSaveThrottle, resumeFromHistory, saveLocalResume,
} from '../../../../../../../src/app/component/sunbird-content-player/html-content-resume'
@Component({
    standalone: false,
    selector: 'viewer-html-container',
    templateUrl: './html.component.html',
    styleUrls: ['./html.component.scss'],
    
})
export class HtmlComponent implements OnInit, OnChanges, OnDestroy {

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
  currentCompletionPercentage: number | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  collectionIdentifier: any
  /** Content in the site-config allow-list plays in the Sunbird content-player (htmlContentPlayer). */
  useContentPlayer = false
  private contentProgress: IArchiveProgress = initialArchiveProgress()
  /** Where the learner left off last time (passed to the player, which hands it to the content). */
  resumeState: unknown = null
  /** Latest STATE snapshot from the content, and whether it still needs saving. */
  private latestState: unknown = null
  private stateDirty = false
  /** Progress already on record, so a position-only save never lowers it. */
  private savedPercentage = 0
  private readonly saveThrottle = new ResumeSaveThrottle()

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly safeResourceUrlSvc: SafeResourceUrlService,
    private readonly pipeLimitTo: PipeLimitToPipe,
    private readonly valueSvc: ValueService,
    private readonly configSvc: ConfigurationsService,
    private readonly viewerDataSvc: PlayerStateService,
    public router: Router,
    private readonly viewerSvc: ViewerUtilService,
    private readonly logger: LoggerService,
    private readonly contentSvc: WidgetContentService,

  ) {

  }
  ngOnInit() {
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType
    this.viewerDataServiceSubscription = this.viewerDataSvc.playerState.subscribe(data => {
      this.currentCompletionPercentage = data.currentCompletionPercentage
    })
    if (this.configSvc.restrictedFeatures) {
      this.isRestricted =
        !this.configSvc.restrictedFeatures.has('disscussionForum')
    }
    this.valueSvc.isLtMedium$.subscribe(isLtMd => {
      this.isLtMedium = isLtMd
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
    this.isProgressCheck()
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const prop in changes) {
      if (prop === 'htmlData') {
        this.useContentPlayer = isHtmlContentPlayerEnabled(this.htmlData, this.configSvc.instanceConfig?.htmlContentPlayer)
        this.contentProgress = initialArchiveProgress()
        this.resumeState = null
        this.latestState = null
        this.stateDirty = false
        this.savedPercentage = 0
        if (this.useContentPlayer) {
          this.loadResumePoint()
        }
        if (this.htmlData && this.htmlData.artifactUrl.startsWith('https://scorm.')) {
          this.isScormContent = true
        } else {
          this.isScormContent = false
        }
        if (this.htmlData && this.htmlData.learningObjective) {
          this.learningObjective = this.safeResourceUrlSvc.trustHtml(
            this.htmlData.learningObjective,
          )
        }
        if (this.htmlData && this.htmlData.description) {
          const description = this.pipeLimitTo.transform(this.htmlData.description, 450)
          this.description = this.safeResourceUrlSvc.trustHtml(description)
        }

      }
    }
  }
  ngOnDestroy() {
    // leaving the content: keep the exact position for next time
    this.saveProgress(null, true)
    this.viewerDataServiceSubscription?.unsubscribe?.()
  }

  private get isLocalPackage(): boolean {
    return Boolean((this.htmlData as any)?.localPackage)
  }

  /** Same read the video player does on open: the content's progress record (progressdetails). */
  private loadResumePoint() {
    if (!this.htmlData) {
      return
    }
    const contentId = this.htmlData.identifier
    if (this.isLocalPackage) {
      this.resumeState = readLocalResume(currentUserId(this.configSvc.userProfile?.userId), contentId)
      return
    }
    const query = this.activatedRoute.snapshot.queryParams
    const req: NsContent.IContinueLearningDataReq = {
      request: {
        userId: this.configSvc.userProfile?.userId || '',
        batchId: query.batchId,
        courseId: query.collectionId || '',
        contentIds: [contentId],
        fields: ['progressdetails'],
      },
    }
    this.contentSvc.fetchContentHistoryV2(req).subscribe({
      next: history => {
        const saved = resumeFromHistory(history, contentId)
        if (saved && this.htmlData?.identifier === contentId) {
          this.savedPercentage = saved.completionPercentage
          this.resumeState = saved.state
        }
      },
      error: (err: unknown) => this.logger.warn('html content resume point could not be read', err),
    })
  }

  /** Content events from the Sunbird content-player: progress (start, each 10%, completion) and position (STATE). */
  onContentTelemetry(event: IPlayerTelemetryEvent) {
    if (event.source === 'package' && event.eid === 'STATE') {
      this.latestState = event.edata.state ?? null
      this.stateDirty = true
      // `final`: the page is being hidden or closed (no ngOnDestroy on a closed tab), so save now
      this.saveProgress(null, Boolean(event.edata.final))
      return
    }
    const next = reduceArchiveProgress(this.contentProgress, event)
    const update = progressUpdateFor(this.contentProgress, next)
    this.contentProgress = next
    if (update) {
      this.saveProgress(update, true)
    }
  }

  /**
   * Saves progress and the latest position together, the way other players save progress
   * (realTimeProgressUpdateV3). A milestone/completion or leaving saves at once; a position-only change
   * at most every 15 s. Local copies keep the position in this browser instead.
   */
  private saveProgress(update: { completionPercentage: number, status: 1 | 2 } | null, force: boolean) {
    if (!this.htmlData || (!update && !this.stateDirty)) {
      return
    }
    const contentId = this.htmlData.identifier
    if (this.isLocalPackage) {
      if (this.latestState) {
        saveLocalResume(currentUserId(this.configSvc.userProfile?.userId), contentId, this.latestState)
      }
      this.stateDirty = false
      return
    }
    if (!update && !this.saveThrottle.due(Date.now(), force)) {
      return
    }
    if (update) {
      this.saveThrottle.due(Date.now(), true)
    }
    const known = this.contentProgress.contentReportsProgress ? this.contentProgress.contentProgress : 0
    const pct = Math.max(update?.completionPercentage ?? 0, known, this.savedPercentage)
    const status: 1 | 2 = update?.status === 2 || pct >= 100 ? 2 : 1
    this.savedPercentage = pct
    this.stateDirty = false
    const query = this.activatedRoute.snapshot.queryParams
    this.viewerSvc.realTimeProgressUpdateV3(
      contentId,
      {
        current: pct,
        max_size: 100,
        completionPercentage: pct,
        statusOverride: status,
        mime_type: this.htmlData.mimeType,
        progressdetails: this.latestState ? { htmlState: this.latestState } : {},
      },
      query.collectionId,
      query.batchId,
    ).subscribe({
      error: (err: unknown) => this.logger.warn('html content progress update failed', err),
    })
  }

  isProgressCheck(): boolean {
    if (typeof this.currentCompletionPercentage === 'undefined' &&
      this.currentCompletionPercentage !== 100 ||
      this.currentCompletionPercentage !== 100) {
      return false
    }
    return true
  }
}
