import { Component, Input, OnInit } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { NSQuiz } from '../../plugins/quiz/quiz.model'
import { ActivatedRoute } from '@angular/router'
import { ViewerDataService } from '../../viewer-data.service'
import { ValueService } from '@ws-widget/utils'
import { AwsAnalyticsService } from '@ws/viewer/src/lib/aws-analytics.service'

@Component({
  selector: 'viewer-quiz-container',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
  @Input() isFetchingDataComplete = false
  @Input() isErrorOccured = false
  @Input() quizData: NsContent.IContent | null = null
  @Input() forPreview = false
  @Input() quizJson: NSQuiz.IQuiz = {
    timeLimit: 0,
    questions: [],
    isAssessment: false,
  }
  @Input() isPreviewMode = false
  stateChange = false
  isTypeOfCollection = false
  collectionId: string | null = null
  prevResourceUrl: string | null = null
  nextResourceUrl: string | null = null
  collectionType: any
  viewerDataServiceSubscription: any
  prevTitle: string | null | undefined
  nextTitle: string | null | undefined
  isSmall = false
  collectionIdentifier: any

  constructor(private activatedRoute: ActivatedRoute, private viewerDataSvc: ViewerDataService,
              private valueSvc: ValueService,
              private awsAnalyticsService: AwsAnalyticsService) {
    this.valueSvc.isLtMedium$.subscribe(isXSmall => {
      this.isSmall = isXSmall
    })
  }

  ngOnInit() {
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    if (this.isTypeOfCollection) {
      this.collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    }
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType

    this.viewerDataServiceSubscription = this.viewerDataSvc.tocChangeSubject.subscribe(data => {
      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
  }

  setPrevClick() {
    this.viewerDataSvc.setClikedItem('prev')
    if (this.prevResourceUrl) { this.createAWSAnalyticsEventAttribute(this.prevResourceUrl) }
  }

  setNextClick() {
    this.viewerDataSvc.setClikedItem('next')
    if (this.nextResourceUrl) { this.createAWSAnalyticsEventAttribute(this.nextResourceUrl) }
  }

  createAWSAnalyticsEventAttribute(resourceUrl: string) {
    let courseId = ''
    if (resourceUrl) {
      courseId = resourceUrl.slice(resourceUrl.indexOf('lex_'))
    }

    const attr = {
      name: 'PL1_ChildResourceVisit',
      attributes: { CourseId: courseId },
    }
    const endPointAttr = {
      CourseId: [courseId],
    }
    this.awsAnalyticsService.callAnalyticsEndpointService(attr, endPointAttr)
  }

}
