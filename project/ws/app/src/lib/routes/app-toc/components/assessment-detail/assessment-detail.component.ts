import { Component, Input, OnInit } from '@angular/core'
import { ViewerUtilService } from '../../../../../../../viewer/src/lib/viewer-util.service'
import { NSQuiz } from '../../../../../../../viewer/src/lib/plugins/quiz/quiz.model'
import { HttpClient } from '@angular/common/http'
import {
  WidgetContentService,
} from '@ws-widget/collection'
import { ActivatedRoute } from '@angular/router'

@Component({
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

  constructor(private viewSvc: ViewerUtilService,
    private http: HttpClient,
    private contentSvc: WidgetContentService,
    private activatedRoute: ActivatedRoute,) {
  }

  async ngOnInit() {
    this.assesmentdata = await this.transformQuiz(this.content)
  }
  /* api call to get info of quiz or assessment */
  private async transformQuiz(content: any): Promise<NSQuiz.IQuiz> {
    if (this.activatedRoute.snapshot.queryParams.competency) {
      if (content.artifactUrl) {
        const artifactUrl = this.viewSvc.getCompetencyAuthoringUrl(content.artifactUrl.split('/content')[1]
        )
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
        if (!quizJSON.hasOwnProperty('passPercentage')) {
          quizJSON.passPercentage = 60
        }
        return quizJSON
      } {
        const contents = await (
          this.contentSvc.fetchContent(this.content.identifier, 'detail')
        ).toPromise()

        const artifactUrl = this.viewSvc.getCompetencyAuthoringUrl(contents.result.content.artifactUrl.split('/content')[1]
        )
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
    } else {
      if (content.artifactUrl) {
        const artifactUrl = this.forPreview
          ? this.viewSvc.getAuthoringUrl(content.artifactUrl)
          : content.artifactUrl
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
        if (!quizJSON.hasOwnProperty('passPercentage')) {
          quizJSON.passPercentage = 60
        }
        return quizJSON
      } {
        const contents = await (
          this.contentSvc.fetchContent(this.content.identifier, 'detail')
        ).toPromise()
        const artifactUrl = this.forPreview
          ? this.viewSvc.getAuthoringUrl(contents.result.content.artifactUrl)
          : contents.result.content.artifactUrl
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


  }
}
