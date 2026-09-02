import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { ViewerUtilService } from '../../../../../../../viewer/src/lib/viewer-util.service'
import { NSQuiz } from '../../../../../../../viewer/src/lib/plugins/quiz/quiz.model'
import { HttpClient } from '@angular/common/http'
import {
  WidgetContentService,
} from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'
import { LoggerService } from '../../../../../../../../../library/ws-widget/utils/src/public-api'

@Component({
  standalone: false,
  selector: 'ws-app-assessment-detail',
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.scss'],

})
export class AssessmentDetailComponent implements OnInit {

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

  constructor(private readonly viewSvc: ViewerUtilService,
    private readonly http: HttpClient,
    private readonly contentSvc: WidgetContentService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly logger: LoggerService,
    private readonly cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    void (async () => {
      const result = await this.transformQuiz(this.content)
      this.assesmentdata = result
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
    let quizJSON: NSQuiz.IQuiz = await this.http
      .get<any>(artifactUrl || '')
      .toPromise()
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
