import { ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Optional } from '@angular/core'
import { ViewerUtilService } from '../../../../../../../viewer/src/lib/viewer-util.service'
import { NSQuiz } from '../../../../../../../viewer/src/lib/plugins/quiz/quiz.model'
import {
  WidgetContentService,
} from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

// Quiz summaries already fetched this session, keyed by artifact URL. Every quiz row on the course
// page and in the player sidebar shows the same summary, and the sidebar is rebuilt as the learner
// moves between lessons, so without this each quiz file was downloaded again and again.
const quizSummaryCache = new Map<string, Promise<NSQuiz.IQuiz>>()

/** Test hook: forget cached quiz summaries. */
export function clearAssessmentQuizCache(): void {
  quizSummaryCache.clear()
}

@Component({
  standalone: false,
  selector: 'ws-app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss'],

})
export class AssessmentDetailComponent implements OnInit, OnDestroy {

  @Input() forPreview = false
  @Input() resourceLink: any
  @Input() content: any
  assesmentdata: any = {
    timeLimit: 0,
    questions: [
      {
        multiSelection: false,
        question: '',
        questionId: '',
        options: [
          {
            optionId: '',
            text: '',
            isCorrect: false,
          },
        ],
      },
    ],
    isAssessment: false,
    passPercentage: 60,
  }
  // False until the real summary is in; the template shows placeholders instead of the defaults
  // above (which used to flash "1 Questions / 60%" before the real numbers).
  summaryLoaded = false
  // The quiz file could not be read: show "–" instead of placeholders that would never clear.
  summaryFailed = false
  private visibilityObserver: IntersectionObserver | null = null

  constructor(private readonly viewSvc: ViewerUtilService,
    private readonly contentSvc: WidgetContentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef,
    @Optional() private readonly elRef?: ElementRef<HTMLElement>) {
  }

  ngOnInit() {
    // Fetch the quiz file only when its row is (nearly) on screen. Opening any lesson used to
    // download every quiz file in the course for rows inside collapsed modules or far below.
    const host = this.elRef?.nativeElement
    if (host && typeof IntersectionObserver !== 'undefined') {
      this.visibilityObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this.disconnectObserver()
          this.loadSummary()
        }
      }, { rootMargin: '200px' })
      this.visibilityObserver.observe(host)
      return
    }
    this.loadSummary()
  }

  ngOnDestroy() {
    this.disconnectObserver()
  }

  private disconnectObserver(): void {
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect()
      this.visibilityObserver = null
    }
  }

  private loadSummary(): void {
    void (async () => {
      try {
        const result = await this.transformQuiz(this.content)
        this.assesmentdata = result
        this.summaryLoaded = true
      } catch (_err) {
        // Quiz file unreachable: show "–"; the quiz itself reports the error when opened.
        this.summaryFailed = true
      }
      this.cdr.detectChanges()
    })()
  }
  /* api call to get info of quiz or assessment */
  private async transformQuiz(content: any): Promise<NSQuiz.IQuiz> {
    if (this.activatedRoute.snapshot.queryParams.competency) {
      return this.transformCompetencyQuiz(content)
    }
    return this.transformStandardQuiz(content)
  }

  private async transformCompetencyQuiz(content: any): Promise<NSQuiz.IQuiz> {
    if (content.artifactUrl) {
      const artifactUrl = this.resolveCompetencyArtifactUrl(content.artifactUrl.split('/content')[1])
      const quizJSON = await this.fetchAndNormalizeQuiz(artifactUrl)
      if (!quizJSON.hasOwnProperty('passPercentage') || quizJSON.passPercentage === 0) {
        quizJSON.passPercentage = 60
      }
      return quizJSON
    } else {
      const contents = await (
        this.contentSvc.fetchContent(this.content.identifier, 'detail')
      ).toPromise()
      const artifactUrl = this.resolveCompetencyArtifactUrl(contents.result.content.artifactUrl.split('/content')[1])
      return this.fetchAndNormalizeQuiz(artifactUrl)
    }
  }

  private resolveCompetencyArtifactUrl(path: string): string {
    let artifactUrl = this.viewSvc.getCompetencyAuthoringUrl(path)
    if (artifactUrl.includes('/hi/')) {
      artifactUrl = artifactUrl.replace('hi/', '')
    }
    if (window.location.origin.indexOf('http://localhost:') === -1) {
      artifactUrl = `${window['env']['azureHost']}/${artifactUrl}`
    }
    this.logger.log(artifactUrl)
    return artifactUrl
  }

  private async transformStandardQuiz(content: any): Promise<NSQuiz.IQuiz> {
    if (content.artifactUrl) {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(content.artifactUrl)
        : this.viewSvc.getCompetencyAuthoringUrl(content.artifactUrl.split('/content')[1])
      const quizJSON = await this.fetchAndNormalizeQuiz(artifactUrl)
      quizJSON.isAssessment = content.isAssessment ?? true
      if (!quizJSON.hasOwnProperty('passPercentage')) {
        quizJSON.passPercentage = 60
      }
      return quizJSON
    } else {
      const contents = await (
        this.contentSvc.fetchContent(this.content.identifier, 'detail')
      ).toPromise()
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(contents.result.content.artifactUrl)
        : this.viewSvc.getCompetencyAuthoringUrl(contents.result.content.artifactUrl.split('/content')[1])
      return this.fetchAndNormalizeQuiz(artifactUrl)
    }
  }

  private async fetchAndNormalizeQuiz(artifactUrl: string): Promise<NSQuiz.IQuiz> {
    const key = `${this.forPreview ? 'preview:' : ''}${artifactUrl}`
    let pending = quizSummaryCache.get(key)
    if (!pending) {
      pending = this.downloadAndNormalizeQuiz(artifactUrl)
      quizSummaryCache.set(key, pending)
      // Do not keep failures: the next row or visit retries.
      pending.catch(() => quizSummaryCache.delete(key))
    }
    const quiz = await pending
    // Callers adjust isAssessment/passPercentage on the result; hand each one its own copy.
    return { ...quiz }
  }

  private async downloadAndNormalizeQuiz(artifactUrl: string): Promise<NSQuiz.IQuiz> {
    // Same once-per-session download the quiz page and its Start button use.
    let quizJSON: NSQuiz.IQuiz = await this.viewSvc.getQuizFile(artifactUrl || '')
      .catch((_err: any) => {
        // throw new DataResponseError('MANIFEST_FETCH_FAILED');
      })
    if (this.forPreview && quizJSON) {
      quizJSON = this.viewSvc.replaceToAuthUrl(quizJSON)
    }
    quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
      if (question.multiSelection && question.questionType === undefined) {
        question.questionType = 'mcq-mca'
      } else if (!question.multiSelection && question.questionType === undefined) {
        question.questionType = 'mcq-sca'
      }
    })
    return quizJSON
  }
}
