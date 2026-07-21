import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Subscription } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { NsContent, WidgetContentService } from '@ws-widget/collection'
import { NSQuiz } from '../../plugins/quiz/quiz.model'
import { ActivatedRoute } from '@angular/router'
import { WsEvents, EventService } from '@ws-widget/utils'
import { ViewerUtilService } from '../../viewer-util.service'

@Component({
    standalone: false,
    selector: 'viewer-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.scss'],
    
})
export class QuizComponent implements OnInit, OnDestroy {
  private dataSubscription: Subscription | null = null
  isFetchingDataComplete = false
  forPreview = window.location.href.includes('/author/')
  isErrorOccured = false
  quizData: NsContent.IContent | null = null
  oldData: NsContent.IContent | null = null
  alreadyRaised = false
  quizJson: NSQuiz.IQuiz = {
    timeLimit: 0,
    questions: [],
    isAssessment: false,
  }
  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly contentSvc: WidgetContentService,
    private readonly eventSvc: EventService,
    private readonly viewSvc: ViewerUtilService,
    private readonly cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.dataSubscription = this.activatedRoute.data.subscribe(
      async data => {
        // Tear down the quiz plugin for each new resource: without this,
        // isFetchingDataComplete stays true across navigation, the plugin is reused, and
        // its overview can open on a stale snapshot (e.g. the previous resource's
        // subtitle/name) before the new inputs finish binding. Resetting forces a fresh
        // recreate once BOTH quizData (name) and quizJson are ready in the finally block.
        this.isFetchingDataComplete = false
        this.cdr.detectChanges()
        try {
          this.quizData = data.content.data
          if (this.alreadyRaised && this.oldData) {
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.oldData)
          }
          if (this.quizData && this.quizData.artifactUrl.indexOf('content-store') >= 0) {
            await this.setS3Cookie(this.quizData.identifier)
          }
          if (this.quizData) {
            this.quizJson = await this.transformQuiz(this.quizData)
          }
          if (this.quizData) {
            this.oldData = this.quizData
            this.alreadyRaised = true
            this.raiseEvent(WsEvents.EnumTelemetrySubType.Loaded, this.quizData)
          }
        } catch (_e) {
          // transformQuiz can fail if the quiz artifact URL is unreachable; keep going so the quiz shell renders
        } finally {
          this.isFetchingDataComplete = true
          this.cdr.detectChanges()
        }
      },
      () => { },
    )
  }

  async ngOnDestroy() {
    if (this.quizData) {
      this.raiseEvent(WsEvents.EnumTelemetrySubType.Unloaded, this.quizData)
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe()
    }
  }

  raiseEvent(state: WsEvents.EnumTelemetrySubType, data: NsContent.IContent) {
    if (this.forPreview) {
      return
    }
    const event = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      from: 'quiz',
      to: '',
      data: {
        state,
        type: WsEvents.WsTimeSpentType.Player,
        mode: WsEvents.WsTimeSpentMode.Play,
        content: data,
        identifier: data ? data.identifier : null,
        mimeType: NsContent.EMimeTypes.QUIZ,
        url: data ? data.artifactUrl : null,
      },
    }
    this.eventSvc.dispatchEvent(event)
  }

  private async transformQuiz(content: NsContent.IContent): Promise<NSQuiz.IQuiz> {
    if (this.activatedRoute.snapshot.queryParams.competency) {
      let artifactUrl = this.viewSvc.getCompetencyAuthoringUrl(content.artifactUrl.split('/content')[1]
      )
      if (artifactUrl.includes('/hi/')) {
        artifactUrl = artifactUrl.replace('hi/', '')
      }
      if (window.location.origin.indexOf('http://localhost:') === -1) {
        artifactUrl = `${window['env']['azureHost']}/${artifactUrl}`
      }
      let quizJSON: NSQuiz.IQuiz = await this.http
        .get<any>(artifactUrl || '')
        .toPromise()
        .catch((_err: any) => {
        })
      if (this.forPreview && quizJSON) {
        quizJSON = this.viewSvc.replaceToAuthUrl(quizJSON)
      }
      if (quizJSON && quizJSON.questions) {
        quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
          if (question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-mca'
          } else if (!question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-sca'
          }
        })
      }
      this.viewSvc.competencyAsessment.next(true)
      return quizJSON
    } {
      const artifactUrl = this.forPreview
        ? this.viewSvc.getAuthoringUrl(content.artifactUrl)
        : content.artifactUrl
      let quizJSON: NSQuiz.IQuiz = await this.http
        .get<any>(artifactUrl || '')
        .toPromise()
        .catch((_err: any) => {
        })
      if (this.forPreview && quizJSON) {
        quizJSON = this.viewSvc.replaceToAuthUrl(quizJSON)
      }
      if (quizJSON && quizJSON.questions) {
        quizJSON.questions.forEach((question: NSQuiz.IQuestion) => {
          if (question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-mca'
          } else if (!question.multiSelection && question.questionType === undefined) {
            question.questionType = 'mcq-sca'
          }
        })
      }
      return quizJSON
    }

  }
  private async setS3Cookie(contentId: string) {
    await this.contentSvc
      .setS3Cookie(contentId)
      .toPromise()
      .catch(() => {
      })
    return
  }
}
