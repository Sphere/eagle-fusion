import { ChangeDetectorRef, Component, HostListener, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core'
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
  isStepChange, ResumeSaveThrottle, resumeFromHistory,
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
  /** The snapshot last sent to the server, to tell a new step from a video-time tick. */
  private savedState: unknown = null
  /** False until the saved record has been read (or there is none to read); saves wait until then. */
  private resumeReady = false
  /** A progress save that arrived before resumeReady; sent once the record has been read. */
  private pendingUpdate: { completionPercentage: number, status: 1 | 2 } | null = null
  /** A saved position is being reopened: the content's fresh snapshots are not saved until RESUMED. */
  private awaitingResume = false
  private awaitingResumeTimer: ReturnType<typeof setTimeout> | null = null
  /** Progress already on record, so a position-only save never lowers it. */
  private savedPercentage = 0
  /** The course progress read on open (all of the learner's records), sent on to the side TOC after each save. */
  private progressHistory: { contentList?: any[], [key: string]: any } | null = null
  /** What the side TOC was last told, so a position-only save does not re-run its gating and completion checks. */
  private tocPercentage: number | null = null
  private tocStatus: number | null = null
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
    private readonly cdr: ChangeDetectorRef,

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
        this.savedState = null
        this.savedPercentage = 0
        this.progressHistory = null
        this.tocPercentage = null
        this.tocStatus = null
        this.resumeReady = false
        this.pendingUpdate = null
        this.stopAwaitingResume()
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
    // leaving the content inside the app (Next, Back, another page): keep the exact position for next time
    this.saveProgress(null, true)
    this.stopAwaitingResume()
    this.viewerDataServiceSubscription?.unsubscribe?.()
  }

  /**
   * Reload, closing the tab or typing another address does not run ngOnDestroy, so save the latest position
   * when the page is hidden or unloading. visibilitychange fires first (also on switching tabs), when a
   * request still goes out.
   */
  @HostListener('document:visibilitychange')
  onVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.saveProgress(null, true)
    }
  }

  @HostListener('window:pagehide')
  onPageHide() {
    this.saveProgress(null, true)
  }

  /** Same read the video player does on open: the content's progress record (progressdetails). */
  private loadResumePoint() {
    if (!this.htmlData) {
      return
    }
    const contentId = this.htmlData.identifier
    const query = this.activatedRoute.snapshot.queryParams
    if (!query.batchId) {
      // The server keeps progress per course batch and rejects a read without one (400, batchId missing):
      // the learner is not enrolled in a batch, or the course has none. Nothing to resume.
      this.logger.warn('html content: no batchId in the viewer URL, so there is no saved position to resume')
      this.markResumeReady()
      return
    }
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
        if (this.htmlData?.identifier === contentId) {
          this.progressHistory = (history as any)?.result ?? null
        }
        if (saved && this.htmlData?.identifier === contentId) {
          this.savedPercentage = saved.completionPercentage
          this.resumeState = saved.state
          // the viewer's HTML route is OnPush: without this a position that arrives after the content
          // started never reaches the player
          this.cdr.markForCheck()
        }
        this.markResumeReady()
      },
      error: (err: unknown) => {
        this.logger.warn('html content resume point could not be read', err)
        this.markResumeReady()
      },
    })
  }

  /**
   * The saved record is known: from now on saves go out. Anything that arrived meanwhile (the content's
   * fresh first screen, a start or milestone save) is sent now, never lower than what was on record.
   */
  private markResumeReady() {
    this.resumeReady = true
    const pending = this.pendingUpdate
    this.pendingUpdate = null
    if (this.resumeState) {
      // the content is about to reopen the saved position: its fresh first screen must not replace it.
      // The next STATE after RESUMED is the one to save; content that never resumes is released after 8 s.
      this.latestState = null
      this.stateDirty = false
      this.awaitingResume = true
      this.awaitingResumeTimer = setTimeout(() => this.stopAwaitingResume(), 8000)
    }
    if (pending || this.stateDirty) {
      this.saveProgress(pending, true)
    }
  }

  private stopAwaitingResume() {
    this.awaitingResume = false
    if (this.awaitingResumeTimer) {
      clearTimeout(this.awaitingResumeTimer)
      this.awaitingResumeTimer = null
    }
  }

  /** Content events from the Sunbird content-player: progress (start, each 10%, completion) and position (STATE). */
  onContentTelemetry(event: IPlayerTelemetryEvent) {
    if (event.source === 'package' && event.eid === 'RESUMED') {
      this.stopAwaitingResume()
    }
    if (event.source === 'package' && event.eid === 'STATE') {
      if (this.awaitingResume) {
        return   // the fresh first screen, before the saved position is reopened
      }
      this.latestState = event.edata.state ?? null
      this.stateDirty = true
      // save at once on a new step, or when the page is being hidden or closed (`final`);
      // a snapshot that only moved the video time waits for the 15 s throttle
      this.saveProgress(null, Boolean(event.edata.final) || isStepChange(this.savedState, this.latestState))
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
   * at most every 15 s. Saved under the logged-in user, the course and the batch.
   */
  private saveProgress(update: { completionPercentage: number, status: 1 | 2 } | null, force: boolean) {
    if (!this.htmlData || (!update && !this.stateDirty)) {
      return
    }
    if (!this.resumeReady) {
      // the saved record is not read yet: saving now could overwrite the learner's real position
      if (update && (!this.pendingUpdate || update.status === 2 || update.completionPercentage > this.pendingUpdate.completionPercentage)) {
        this.pendingUpdate = update
      }
      return
    }
    const contentId = this.htmlData.identifier
    // the throttle limits position-only saves; progress saves (start, 10%, completion) do not use it up,
    // so the first position snapshot after them is saved at once
    if (!update && !this.saveThrottle.due(Date.now(), force)) {
      return
    }
    const known = this.contentProgress.contentReportsProgress ? this.contentProgress.contentProgress : 0
    const pct = Math.max(update?.completionPercentage ?? 0, known, this.savedPercentage)
    const status: 1 | 2 = update?.status === 2 || pct >= 100 ? 2 : 1
    this.savedPercentage = pct
    this.stateDirty = false
    this.savedState = this.latestState
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
      next: () => this.notifyToc(contentId, pct, status),
      error: (err: unknown) => this.logger.warn('html content progress update failed', err),
    })
  }

  /**
   * Tells the side TOC (viewer-toc) about the saved progress, the way the PDF player does: the course
   * progress read on open with this content's entry updated. Without it the TOC tick, percentage and the
   * unlock of the next module only appear after a reload.
   */
  private notifyToc(contentId: string, completionPercentage: number, status: number) {
    if (this.htmlData?.identifier !== contentId || (this.tocPercentage === completionPercentage && this.tocStatus === status)) {
      return
    }
    this.tocPercentage = completionPercentage
    this.tocStatus = status
    const contentList = [...(this.progressHistory?.contentList ?? [])]
    const index = contentList.findIndex(item => item?.contentId === contentId)
    const entry = { ...(index >= 0 ? contentList[index] : { contentId }), completionPercentage, status }
    if (index >= 0) {
      contentList[index] = entry
    } else {
      contentList.push(entry)
    }
    this.progressHistory = { ...(this.progressHistory ?? {}), contentList }
    this.viewerSvc.generateInteractTelemetry('progress-update-success', {
      contentId, completionPercentage, status, mimeType: this.htmlData.mimeType,
    })
    this.contentSvc.changeMessage({ ...this.progressHistory, type: 'html-archive' })
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
