import { Component, Input, OnInit } from '@angular/core'
import { NsContent } from '@ws-widget/collection'
import { NSQuiz } from '../../plugins/quiz/quiz.model'
import { ActivatedRoute } from '@angular/router'
import { PlayerStateService } from '../../player-state.service'
import { ValueService } from '@ws-widget/utils'

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

  constructor(private activatedRoute: ActivatedRoute, private viewerDataSvc: PlayerStateService,
              private valueSvc: ValueService) {
    this.valueSvc.isXSmall$.subscribe(isXSmall => {
      this.isSmall = isXSmall
    })
  }

  ngOnInit() {
    this.isTypeOfCollection = this.activatedRoute.snapshot.queryParams.collectionType ? true : false
    if (this.isTypeOfCollection) {
      this.collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    }
    this.collectionType = this.activatedRoute.snapshot.queryParams.collectionType

    this.viewerDataServiceSubscription = this.viewerDataSvc.playerState.subscribe(data => {
      this.prevTitle = data.previousTitle
      this.nextTitle = data.nextResTitle
      this.prevResourceUrl = data.prevResource
      this.nextResourceUrl = data.nextResource
    })
    const collectionId = this.activatedRoute.snapshot.queryParams.collectionId
    this.collectionIdentifier = collectionId
  }
}
